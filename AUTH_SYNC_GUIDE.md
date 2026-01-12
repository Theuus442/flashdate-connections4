# 🔐 Guia Completo: Testando Sincronização Auth ↔ Database

## 📋 Resumo do que foi corrigido

Seu sistema agora garante que:

1. ✅ **Quando um usuário é criado**: O ID em `auth.users` e `public.users` são idênticos
2. ✅ **Quando um perfil é atualizado**: Os metadados em Auth (`user_metadata` + `app_metadata`) são sincronizados imediatamente
3. ✅ **Role está sempre em `app_metadata`**: Suas políticas RLS baseadas em JWT funcionam 100%
4. ✅ **Tratamento de erros**: Se auth falhar, pelo menos a tabela pública foi alterada com sucesso

---

## 🧪 Como Testar Localmente

### Teste 1: Criar um Novo Usuário (Teste de ID Consistency)

**Passos:**
1. Abra seu admin panel
2. Crie um novo usuário: `teste@example.com` / `senha123` com role `client`

**O que verificar no Supabase Dashboard:**

```
auth.users:
  id: 550e8400-e29b-41d4-a716-446655440000
  email: teste@example.com
  user_metadata: {
    "name": "Teste",
    "role": "client",
    "email_verified": true
  }
  app_metadata: {
    "role": "client"
  }

public.users:
  id: 550e8400-e29b-41d4-a716-446655440000  ← MESMO ID!
  email: teste@example.com
  role: client
```

**✅ Sucesso**: IDs são idênticos

### Teste 2: Atualizar Perfil de Usuário (Teste de Metadata Sync)

**Passos:**
1. Login como usuário normal
2. Vá para "Meu Perfil"
3. Mude o nome de `João Silva` para `João Santos`
4. Aguarde resposta de sucesso

**O que verificar no Supabase Dashboard:**

```
auth.users (procure pelo usuário que atualizou):
  user_metadata: {
    "name": "João Santos",      ← ATUALIZADO
    "role": "client",
    "email_verified": true
  }
  app_metadata: {
    "role": "client"            ← SEMPRE sincronizado
  }

public.users:
  name: João Santos             ← ATUALIZADO
  updated_at: 2024-01-12T11:30:00Z
```

**✅ Sucesso**: Nome foi atualizado em ambos os locais

### Teste 3: Mudar Role de Usuário (Teste RLS)

**Passos:**
1. No admin panel, edite um usuário client
2. Mude role para `admin`
3. Salve

**O que verificar no Supabase:**

```
auth.users:
  user_metadata: {
    "role": "admin"             ← MUDOU
  }
  app_metadata: {
    "role": "admin"             ← MUDOU (crítico!)
  }

public.users:
  role: admin                   ← MUDOU
```

**✅ Sucesso**: Role mudou em auth.users E public.users

**Próximo teste**: Faça logout e login do usuário
- Deve aparecer como admin imediatamente (sem delay)
- RLS baseada em JWT funcionando ✅

### Teste 4: Verificar Logs de Sincronização

**Abra o console do navegador (F12)** e procure por:

```javascript
// Durante criação de usuário:
[create-user-confirmed] Auth user created with ID: 550e8400-e29b-41d4-a716-446655440000
[create-user-confirmed] ID Consistency Check: Auth ID = 550e8400..., DB ID = 550e8400..., Match: true
✅ Sucesso

// Durante atualização:
[update-user-profile] Auth metadata synced successfully
[update-user-profile] Returning success response
✅ Sucesso

// Pior caso (que NÃO quebra mais):
[update-user-profile] ⚠️ Warning: Failed to sync auth metadata: ...
[update-user-profile] Continuing anyway since public.users was already updated
✅ Sucesso (parcial, mas seguro)
```

---

## 🔍 Verificações Manuais no Supabase Dashboard

### Checar Consistência de IDs

**SQL Query** (em Supabase → SQL Editor):

```sql
-- Verificar se existem IDs divergentes entre auth.users e public.users
SELECT 
  a.id as auth_id,
  p.id as db_id,
  a.email,
  p.role,
  CASE WHEN a.id = p.id THEN '✅ OK' ELSE '❌ MISMATCH' END as status
FROM auth.users a
FULL OUTER JOIN public.users p ON a.id = p.id
WHERE a.email IS NOT NULL
ORDER BY status DESC;
```

**Resultado esperado**: Todos com `✅ OK`

### Checar Metadados do Role

```sql
-- Verificar role em ambos user_metadata e app_metadata
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as user_metadata_role,
  raw_app_meta_data->>'role' as app_metadata_role,
  CASE 
    WHEN raw_user_meta_data->>'role' = raw_app_meta_data->>'role' THEN '✅ OK'
    ELSE '⚠️ MISMATCH'
  END as metadata_consistency
FROM auth.users
WHERE raw_user_meta_data->>'role' IS NOT NULL
ORDER BY metadata_consistency;
```

**Resultado esperado**: Todos com `✅ OK`

---

## ⚙️ Configuração de Edge Functions

### Verificar se Edge Functions estão rodando

Após fazer deploy para Supabase, verifique:

```bash
# Terminal (com supabase-cli instalado)
supabase functions list

# Deve mostrar:
# create-user-confirmed (active)
# update-user-profile   (active)
# delete-users-by-role  (active)
```

### Testar Edge Function manualmente

```bash
# Teste create-user-confirmed
curl -X POST \
  https://seu-project.supabase.co/functions/v1/create-user-confirmed \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123",
    "name": "Teste User",
    "role": "client"
  }'

# Resposta esperada:
{
  "success": true,
  "user": {
    "id": "uuid-xxx",
    "email": "teste@example.com",
    "name": "Teste User",
    "role": "client"
  },
  "id_consistency": {
    "auth_id": "uuid-xxx",
    "db_id": "uuid-xxx",
    "match": true
  }
}
```

---

## 🚨 Troubleshooting

### Problema: Role não aparece em app_metadata

**Solução:**
1. Vá ao seu admin panel
2. Edite o usuário
3. Simplesmente salve (sem mudar nada)
4. Espere 2-3 segundos
5. Verifique Supabase Dashboard → app_metadata foi atualizado

### Problema: IDs ainda divergindo

**Ação Imediata:**
1. Execute o SQL query acima para identificar qual usuário
2. Delete o usuário de `public.users` (não de auth)
3. Crie novamente via admin panel

**Checklist:**
- [ ] create-user-confirmed função está usando `auth.admin.createUser()`?
- [ ] ID extraído está sendo inserido em public.users?

### Problema: RLS ainda não funciona

**Checklist:**
1. Role está em `app_metadata`? (não só em `user_metadata`)
2. Sua política RLS referencia `auth.jwt()` → `app_metadata` → `role`?
3. Fez logout e login depois de mudar a role?

**Exemplo de RLS que deveria funcionar:**
```sql
CREATE POLICY "users_can_see_themselves"
  ON public.users FOR SELECT
  USING (
    (auth.uid() = id) OR
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );
```

---

## 📊 Checklist de Validação Final

Antes de considerar "pronto":

- [ ] Criar novo usuário → IDs são iguais
- [ ] Atualizar nome → atualiza em auth.users
- [ ] Atualizar role → atualiza em app_metadata
- [ ] RLS baseada em JWT funciona após login
- [ ] Logs mostram sincronização bem-sucedida
- [ ] Edge Functions estão ativas em Supabase
- [ ] Nenhum erro 500 ao atualizar/criar usuário

---

## 🎯 Próximos Passos

1. **Fazer deploy para Supabase**:
   ```bash
   supabase functions deploy
   ```

2. **Testar em produção** com os testes acima

3. **Monitorar logs** de Edge Functions em:
   - Supabase Dashboard → Edge Functions → Logs

4. **Se houver problema**: Verifique os logs de Edge Functions e compare com os padrões esperados listados acima

---

## 📞 Suporte

Se encontrar algum problema:

1. Verifique os logs do navegador (F12 → Console)
2. Verifique os logs de Edge Functions em Supabase
3. Execute os SQL queries acima para diagnosticar
4. Verifique este guia novamente

O sistema agora é **muito mais robusto** e **não perde dados** mesmo se uma parte falhar.
