# 🔧 Detalhes Técnicos das Implementações

## 📁 Arquivos Modificados

### 1. `supabase/functions/update-user-profile/index.ts`

**Principais mudanças:**

#### Antes:
```typescript
// Apenas atualiza metadados incompletos
user_metadata: {
  role: publicUser.role,
  name: publicUser.name,
  email_verified: true
},
app_metadata: {
  role: publicUser.role
}
// Response format inconsistente
return { success: true, data: { public, auth_metadata } }
```

#### Depois:
```typescript
// Sincronização completa em ambos os metadados
const userMetadata = {
  name: body.name !== undefined ? body.name : existing,
  email: body.email !== undefined ? body.email : existing,
  role: publicUser.role,      // SEMPRE incluído
  email_verified: true
}

const appMetadata = {
  role: publicUser.role       // SEMPRE incluído para RLS
}

authUpdatePayload.user_metadata = userMetadata
authUpdatePayload.app_metadata = appMetadata

// Response format consistente
return {
  user: {
    id, email, name, role, ...
  },
  auth_sync: { synced, error }
}
```

**Benefícios:**
- ✅ Role sempre em app_metadata (RLS funciona)
- ✅ Metadados sempre sincronizados
- ✅ Response format esperado pelo cliente
- ✅ Erro de auth não quebra tudo

---

### 2. `supabase/functions/create-user-confirmed/index.ts`

**Principais mudanças:**

#### Antes:
```typescript
// Raw fetch para criar usuário em auth
const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
  method: 'POST',
  headers: { ... },
  body: JSON.stringify({
    email, password, email_confirm: true,
    user_metadata: { role }
    // app_metadata não era enviado aqui
  })
})

// ID poderia divergir se algo saísse errado
const userId = authResult.user.id
// Insere em DB sem verificação
```

#### Depois:
```typescript
// Usa cliente Supabase com admin API
const { data: authData, error: authError } = 
  await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: {
      name, role,
      email_verified: true     // Novo
    },
    app_metadata: {            // Novo - CRÍTICO para RLS
      role
    }
  })

const userId = authData.user.id
// Insere com MESMO ID
await supabase.from('users').insert([{
  id: userId,  // ← CRÍTICO: ID extraído do auth
  email, name, role, ...
}])

// Verifica consistência
if (userId !== dbData.id) {
  console.error('ID MISMATCH!', userId, dbData.id)
}
```

**Benefícios:**
- ✅ Admin API nativa (não raw fetch)
- ✅ ID garantido ser igual em auth e DB
- ✅ app_metadata já incluído na criação
- ✅ Verifica inconsistência

---

### 3. `src/lib/auth.service.ts`

#### Mudança em `signUp()`:
```typescript
// Antes
options: {
  data: { name, role }
}

// Depois
options: {
  data: {
    name, role,
    email_verified: true  // ← Novo
  }
}
console.log('[authService.signUp] User metadata:', data.user?.user_metadata)
```

#### Mudança em `onAuthStateChange()`:
```typescript
// Antes
let role = session.user.user_metadata?.role || 'client'
if (!session.user.user_metadata?.role) {
  // fetch do DB e atualiza user_metadata
  await supabase.auth.updateUser({ data: { role } })
}

// Depois
let role = session.user.user_metadata?.role ||
           session.user.app_metadata?.role ||
           'client'

if (!session.user.user_metadata?.role && !session.user.app_metadata?.role) {
  // fetch do DB e atualiza AMBOS
  await supabase.auth.updateUser({ data: { role, email_verified: true } })
}

// Logs detalhados
console.log('[onAuthStateChange] User metadata:', session.user.user_metadata)
console.log('[onAuthStateChange] App metadata:', session.user.app_metadata)
```

**Benefícios:**
- ✅ Tenta obter role de ambas as fontes
- ✅ Sincroniza ambas se necessário
- ✅ Melhor logging para debugging

---

## 🔄 Fluxos Atualizados

### Fluxo de Criação (Create User)

```
┌─────────────────────────────────────────────────────┐
│ Admin Panel → createUserAsAdmin()                    │
│ → POST /functions/v1/create-user-confirmed          │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
    ┌───▼────────────────┐   ┌─────▼──────────────┐
    │ supabase.auth.     │   │ supabase           │
    │ admin.createUser() │   │ .from('users')     │
    │                    │   │ .insert()          │
    │ Returns: {         │   │                    │
    │   id: uuid,        │   │ Uses same uuid:    │
    │   user_metadata:{} │   │ id: uuid           │
    │   app_metadata:{}  │   │                    │
    │ }                  │   │ Returns: {         │
    └───┬────────────────┘   │   id: uuid,        │
        │                    │   email, role      │
        └────────────┬───────┘                    │
                     │                            │
             ┌───────▼──────────┐               
             │ Verify Match     │               
             │ auth_id === db_id│               
             │ ✅ If match OK   │               
             └───────┬──────────┘               
                     │                        
          ┌──────────▼──────────┐            
          │ Return success      │            
          │ with id_consistency │            
          │ report              │            
          └─────────────────────┘
```

### Fluxo de Atualização (Update User)

```
┌──────────────────────────────────────────────────┐
│ Client → updateUser()                             │
│ → POST /functions/v1/update-user-profile         │
└─────────────────────┬──────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
    ┌───▼───────────────────┐   ┌────▼────────────────────┐
    │ supabase               │   │ supabase.auth.admin     │
    │ .from('users')         │   │ .updateUserById()       │
    │ .update()              │   │                         │
    │                        │   │ Updates BOTH:           │
    │ Returns: {             │   │ - user_metadata         │
    │   id, name, role, ...  │   │ - app_metadata          │
    │ }                      │   │                         │
    │                        │   │ Returns: authUser       │
    └───┬────────────────────┘   └────┬─────────────────┘
        │                             │
        │         ┌───────────────────┘
        │         │
        └────┬────┘
             │
    ┌────────▼──────────────┐
    │ If auth sync fails:   │
    │ • Log warning         │
    │ • Continue (don't     │
    │   throw error)        │
    │ • Return success      │
    │   anyway              │
    └────────┬───────────────┘
             │
    ┌────────▼──────────────┐
    │ Return standardized   │
    │ {                     │
    │   user: {...},        │
    │   auth_sync: {        │
    │     synced: bool,     │
    │     error: msg        │
    │   }                   │
    │ }                     │
    └───────────────────────┘
```

---

## 📊 Comparação de Campos

### user_metadata vs app_metadata

| Campo | `user_metadata` | `app_metadata` | Uso |
|-------|-----------------|----------------|-----|
| `name` | ✅ Sim | ❌ Não | Exibição de nome |
| `email` | ✅ Sim | ❌ Não | Confirmação de email |
| `role` | ✅ Sim | ✅ **Sim** | **JWT RLS policies** |
| `email_verified` | ✅ Sim | ❌ Não | Email confirmado |

**Regra de ouro**: Se sua política RLS depende de um campo, ele **DEVE** estar em `app_metadata` (é enviado no JWT).

---

## 🔐 Estrutura de RLS Recomendada

```sql
-- Exemplo de política que funciona 100% agora
CREATE POLICY "users_read_own_data"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id  -- Usuário lê seus próprios dados
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'  -- Admins leem tudo
  );

-- Exemplo de política para dados privados
CREATE POLICY "admin_only_create_users"
  ON public.users FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
```

---

## 🔗 Diagrama de Sincronização

```
┌─────────────────────────────────────────────────────┐
│           Supabase Auth (auth.users)                 │
│                                                     │
│  ┌──────────────────────────────────────────┐      │
│  │ user_metadata (raw_user_meta_data)       │      │
│  │ {                                        │      │
│  │   "name": "João Silva",                  │      │
│  │   "email": "joao@example.com",           │      │
│  │   "role": "client",        ← SINCRONIZADO│      │
│  │   "email_verified": true                 │      │
│  │ }                                        │      │
│  └──────────────────────────────────────────┘      │
│                                                     │
│  ┌──────────────────────────────────────────┐      │
│  │ app_metadata (raw_app_meta_data)         │      │
│  │ {                                        │      │
│  │   "role": "client"         ← SINCRONIZADO│      │
│  │ }                                        │      │
│  └──────────────────────────────────────────┘      │
└──────────────────┬──────────────────────────────────┘
                   │ (mesmo ID)
                   │
┌──────────────────▼──────────────────────────────────┐
│            Database (public.users)                   │
│                                                     │
│  id: uuid (mesmo de auth.users)                    │
│  email: "joao@example.com"                         │
│  name: "João Silva"           ← SINCRONIZADO       │
│  role: "client"               ← SINCRONIZADO       │
│  username: "@joao_silva"                           │
│  whatsapp: "+55 11 98765-4321"                    │
│  gender: "M"                                        │
│  profile_image_url: "..."                          │
│  created_at: timestamp                             │
│  updated_at: timestamp        ← SEMPRE ATUALIZADO  │
└────────────────────────────────────────────────────┘
```

---

## 📈 Métricas de Sucesso

Após implementação, você deve ter:

1. **100% de ID consistency** entre auth.users e public.users
2. **Role sempre em app_metadata** para RLS funcionar
3. **Atualização de metadados em < 2 segundos** após mudança
4. **Sem erro 500** ao criar/atualizar usuários (mesmo com falhas parciais)
5. **RLS baseada em JWT** funcionando 100% após login

---

## 🚀 Checklist de Deployment

- [ ] Testar localmente com os guias de teste
- [ ] Fazer deploy de Edge Functions: `supabase functions deploy`
- [ ] Executar SQL queries de verificação
- [ ] Testar fluxos completos em staging
- [ ] Monitorar logs de Edge Functions por 24h
- [ ] Documentar qualquer behavior inesperado
- [ ] Fazer deploy em produção com backup prévio
