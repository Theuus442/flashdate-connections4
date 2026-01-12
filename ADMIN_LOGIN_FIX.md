# 🔧 Guia de Correção: Admin Não Acessa o Painel Admin

## ✅ Problema Identificado e Resolvido

A página de login (`LoginPage.tsx`) **não estava realmente autenticando** o usuário no Supabase. A issue foi corrigida para:

1. ✅ Chamar `authService.signIn()` com email e senha
2. ✅ Redirecionar automaticamente para `/admin` se o role for "admin"
3. ✅ Redirecionar para `/dashboard` se o role for "client"

---

## 🔍 Checklist de Verificação

Para que o redirecionamento funcione corretamente, **verifique se você possui**:

### 1. Conta de Autenticação no Supabase Auth
- [ ] Você tem uma conta criada em **Authentication → Users** no seu projeto Supabase
- [ ] O email e senha correspondem aos que você usa para fazer login

### 2. Entrada na Tabela `users`
- [ ] Você tem uma entrada na tabela `users` com `role = 'admin'`

### 3. Email Sincronizado
- [ ] O email da conta de autenticação é o **mesmo** da entrada na tabela `users`

---

## ⚙️ Como Verificar e Corrigir

### Verificar se sua conta de admin existe

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com)
2. Vá para **SQL Editor**
3. Crie uma nova query e execute:

```sql
SELECT email, role, created_at FROM users WHERE role = 'admin';
```

**Se não houver resultado:** Você precisa criar um admin (veja abaixo).

---

## 🛠️ Como Criar ou Corrigir sua Conta Admin

### Opção A: Criar Admin a partir do SQL (Recomendado)

Se você **já tem uma conta de autenticação** no Supabase Auth, execute este SQL para atualizar a role:

```sql
-- Atualize seu email no comando abaixo
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu.email@exemplo.com';

-- Verificar a atualização
SELECT email, role FROM users WHERE email = 'seu.email@exemplo.com';
```

### Opção B: Criar Admin do Zero

Se você **não tem nenhuma conta**, faça isso:

#### Passo 1: Criar conta de Autenticação

1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá para **Authentication → Users**
3. Clique em **Create new user**
4. Preencha:
   - **Email:** seu.email@exemplo.com
   - **Password:** uma senha forte
5. Clique em **Create user**

#### Passo 2: Criar entrada na tabela `users`

No **SQL Editor**, execute:

```sql
INSERT INTO users (email, name, username, role, gender)
VALUES (
  'seu.email@exemplo.com',
  'Seu Nome',
  'seu_username',
  'admin',
  'M'
)
RETURNING id, email, role;
```

---

## 🧪 Testar o Login

Agora que tudo está configurado, faça o login:

1. Acesse o app em `/login`
2. Insira seu email e senha
3. **Resultado esperado:**
   - Se `role = 'admin'` → Será redirecionado para `/admin`
   - Se `role = 'client'` → Será redirecionado para `/dashboard`

---

## 🐛 Se ainda não funcionar

### 1. Verificar se o Supabase está configurado

No navegador, abra o console (F12) e procure por logs como:

```
[Supabase] Initialization Check:
[Supabase]   - URL provided: true
[Supabase]   - Key provided: true
[Supabase]   - Mode: ENABLED
```

Se mostrar `DISABLED`, você precisa configurar:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 2. Verificar os logs de autenticação

No console, procure por mensagens como:

```
[AuthContext] Auth state changed: {hasUser: true, role: "admin"}
[signIn] Success, user ID: ...
```

Se não houver esses logs, o login não está sendo chamado corretamente.

### 3. Limpar cache/sessão

Às vezes o navegador guarda dados antigos:

1. Abra DevTools (F12)
2. Application → LocalStorage
3. Remova todos os itens com "supabase" no nome
4. Recarregue a página

---

## 📊 Resumo do Fluxo de Login

```
┌─────────────────────────────────┐
│   Usuário entra email + senha   │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  authService.signIn() chamado   │
│  (estava faltando antes)         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Supabase valida no Auth        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  onAuthStateChange dispara      │
│  Lê role da tabela users        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  AuthContext atualiza user.role │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  useEffect na LoginPage detecta │
│  mudança no user                │
└────────────┬────────────────────┘
             │
             ├─ role='admin' ? ──→ navigate('/admin')
             │
             └─ role='client' ? → navigate('/dashboard')
```

---

## 💡 Dicas Importantes

1. **Case-sensitive:** O email deve ser exato (maiúsculas/minúsculas)
2. **Role:** Deve ser exatamente `'admin'` ou `'client'` (em minúsculas)
3. **Sessão:** O Supabase armazena a sessão automaticamente
4. **Sincronização:** A role deve estar na tabela `users`, não apenas no metadata do Auth

---

## 🆘 Ainda com dúvida?

1. Verifique os logs no console (F12)
2. Confirme que a role está correta no SQL:
   ```sql
   SELECT email, role FROM users;
   ```
3. Teste com uma nova conta de cliente primeiro para verificar se o sistema funciona
4. Se nada funcionar, limpe cache e reinicie o app

---

**Versão:** 1.0
**Última atualização:** Janeiro 2026
