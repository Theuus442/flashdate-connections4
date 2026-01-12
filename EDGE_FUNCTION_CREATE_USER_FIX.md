# ✅ Edge Function - Cria Usuário em Auth E na Tabela users

## O Problema

Quando o admin criava um usuário, acontecia isso:

1. ✅ Edge Function criava em **Supabase Auth** (Login funciona)
2. ❌ MAS não criava na tabela **`users`** (Dados não aparecem)
3. Resultado: Usuário não conseguia ver seu perfil no dashboard

---

## A Solução

Melhorei o Edge Function (`supabase/functions/create-user-confirmed/index.ts`) para:

1. ✅ **Criar em Supabase Auth** com email, senha e role
2. ✅ **Criar na tabela `users`** com id, email, name, username, whatsapp, gender, role
3. ✅ **Manter IDs sincronizados** (mesmo ID em Auth e na tabela)
4. ✅ **Retornar dados completos** para confirmação

---

## Fluxo Agora

```
Admin cria usuário no painel
        ↓
UsersManagement chama addUser()
        ↓
usersService.createUser() chama authService.createUserAsAdmin()
        ↓
Edge Function recebe:
  - email, password
  - name, username, whatsapp, gender, role
        ↓
Edge Function faz 2 coisas:
  1. POST /auth/v1/admin/users (cria em Auth)
  2. POST /rest/v1/users (cria na tabela users)
        ↓
Edge Function retorna userId
        ↓
usersService usa esse userId
        ↓
Usuário criado COMPLETO ✅
  - Existe em Auth (login funciona)
  - Existe em users (dados aparecem)
  - IDs sincronizados (mesmo ID em ambos)
```

---

## 🧪 Como Testar

### Teste 1: Criar novo usuário pelo admin
1. Acesse `/admin` como admin
2. Clique em "Adicionar Novo Usuário"
3. Preencha:
   - Nome: João Silva
   - Username: joao.silva
   - Email: joao@teste.com
   - WhatsApp: (11) 98765-4321
   - Gênero: M
   - Senha: SenhaForte123
4. Clique "Criar Usuário"

### Teste 2: Fazer login com o novo usuário
1. Vá para `/login`
2. Insira: joao@teste.com / SenhaForte123
3. **Resultado esperado**: Redireciona para `/dashboard`
4. Vê seus dados no perfil (nome, email, whatsapp, gênero)

### Teste 3: Verificar sincronização
No Supabase SQL Editor:

```sql
-- Verificar se usuário existe em ambos os lugares
SELECT id, email, name FROM users WHERE email = 'joao@teste.com';
```

Deve retornar 1 registro com os dados corretos.

---

## 📋 Mudanças Feitas

### 1. Edge Function Melhorado
**Arquivo**: `supabase/functions/create-user-confirmed/index.ts`

- ✅ Aceita mais parâmetros: `name`, `username`, `whatsapp`, `gender`
- ✅ Cria em Supabase Auth
- ✅ Cria na tabela `users` com mesmo ID
- ✅ Logs de debug melhorados
- ✅ Tratamento de erros robusto

### 2. Auth Service Atualizado
**Arquivo**: `src/lib/auth.service.ts`

- ✅ `createUserAsAdmin()` agora aceita todos os dados do usuário
- ✅ Retorna o `userId` criado no Auth
- ✅ Passa tudo para o Edge Function

### 3. Users Service Atualizado
**Arquivo**: `src/lib/users.service.ts`

- ✅ Usa o `userId` retornado pelo Auth
- ✅ Mantém sincronização de IDs
- ✅ Passa todos os dados para `createUserAsAdmin()`

---

## 🔄 Se ainda tiver problema

### Problema: "Erro ao criar usuário"
1. Abra DevTools (F12)
2. Procure por logs do Edge Function:
   ```
   [create-user-confirmed] Creating user: teste@teste.com
   [create-user-confirmed] Auth user created: 12345...
   [create-user-confirmed] User created successfully
   ```
3. Se falhar em Auth, veja a mensagem de erro
4. Se falhar em DB, verifique duplicação de email/username

### Problema: Login funciona mas perfil não aparece
1. Isso não deveria mais acontecer
2. Se acontecer, significa que a tabela `users` está vazia
3. Verifique no SQL se o usuário foi criado:
   ```sql
   SELECT COUNT(*) as total_users FROM users;
   ```

### Problema: Erro de autenticação
1. Certifique que o SERVICE_ROLE_KEY está configurado no Supabase
2. Vá em **Settings → Edge Functions → Environment variables**
3. Confirme que `SUPABASE_SERVICE_ROLE_KEY` está lá

---

## 💡 Benefícios

- ✅ **Sincronização automática**: Dados sempre em sync
- ✅ **Menos chamadas**: 1 Edge Function ao invés de 2
- ✅ **Dados completos**: Nome, username, whatsapp salvos desde a criação
- ✅ **Login imediato**: Usuário pode logar logo após criação
- ✅ **Perfil completo**: Dashboard mostra todos os dados

---

**Versão:** 1.0
**Última atualização:** Janeiro 2026
