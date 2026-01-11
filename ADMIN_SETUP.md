# 👨‍💼 Como Criar o Primeiro Admin no FlashDate

Este guia mostra como criar uma conta de administrador no seu sistema Supabase.

---

## 📋 Opção 1: Via SQL (Recomendado para Setup Inicial)

### Passo 1: Acessar o SQL Editor

1. Vá para seu projeto no [Supabase](https://supabase.com)
2. Clique em **SQL Editor** (no menu lateral esquerdo)
3. Clique em **New Query**

### Passo 2: Criar Usuário Admin

Execute este SQL para criar um usuário admin diretamente na tabela `users`:

```sql
INSERT INTO users (email, name, username, whatsapp, gender, role)
VALUES (
  'seu.email@exemplo.com',
  'Seu Nome Completo',
  'seu.username',
  '(11) 99999-9999',
  'M',
  'admin'
)
RETURNING id, email, role;
```

**Substitua os valores:**
- `seu.email@exemplo.com` → seu email real
- `Seu Nome Completo` → seu nome
- `seu.username` → nome de usuário desejado
- `(11) 99999-9999` → seu WhatsApp (opcional)
- `M` → Gênero: `M`, `F`, ou `Outro`

### Passo 3: Criar Autenticação no Supabase Auth

Você também precisa criar uma conta de autenticação. Execute:

```sql
-- Criar usuário de autenticação (requer plano Enterprise)
-- Ou use a interface do Supabase:
-- 1. Vá para Authentication > Users
-- 2. Clique em "Create new user"
-- 3. Email: seu.email@exemplo.com
-- 4. Password: uma senha segura
```

**Alternativa:** Use a Interface do Supabase:

1. Vá para **Authentication** > **Users**
2. Clique em **Create new user**
3. Insira:
   - **Email:** seu.email@exemplo.com
   - **Password:** uma senha segura
   - **Confirm password:** repita a senha
4. Clique em **Create user**

---

## 🔐 Opção 2: Via Aplicação (Após Setup)

Se você já tem a autenticação do Supabase configurada:

1. Faça login na aplicação com qualquer conta
2. No AdminPanel, crie um novo usuário
3. Altere manualmente o `role` para `admin` via SQL:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu.email@exemplo.com';
```

---

## 🧪 Testando o Login

### Credenciais de Teste Locais (Dev Mode)

Quando **Supabase não está configurado**, o app aceita:

```
Email: admin@flashdate.com
Senha: admin123
Role: admin
```

(Apenas em desenvolvimento local)

### Credenciais Reais (Produção)

Depois de criar o admin no Supabase:

1. Acesse a página de login: `/login`
2. Insira:
   - **Email:** seu.email@exemplo.com (o que você registrou no Supabase)
   - **Senha:** a senha que você criou
3. Clique em **Entrar**
4. Será redirecionado para `/admin` se o role for "admin"

---

## 📊 Estrutura de Roles

| Role | Acesso |
|------|--------|
| `admin` | Painel completo: Usuários, Eventos, Seleções |
| `client` | Perfil pessoal e seleções do evento |

---

## ✅ Checklist de Setup

- [ ] SQL Schema criado no Supabase
- [ ] Buckets criados (`profiles`, `events`)
- [ ] Primeiro admin criado na tabela `users`
- [ ] Autenticação do Supabase criada para o admin
- [ ] Variáveis de ambiente configuradas (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] App iniciado (`npm run dev`)
- [ ] Login testado com as credenciais do admin
- [ ] AdminPanel acessível em `/admin`

---

## 🆘 Troubleshooting

### Erro: "Email ou senha inválidos" no login

**Solução:**
1. Verifique se o usuário existe em **Authentication > Users**
2. Verifique se o email e senha estão corretos
3. Certifique-se que o usuário foi também criado na tabela `users` (não apenas em Auth)

### Admin não consegue acessar `/admin`

**Solução:**
1. Verifique se `role = 'admin'` na tabela `users`:
```sql
SELECT email, role FROM users WHERE email = 'seu.email@exemplo.com';
```

2. Se role for `client`, atualize:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu.email@exemplo.com';
```

### Supabase não está configurado

**Solução:**
Configure as variáveis de ambiente:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

Reinicie o app com `npm run dev`

---

## 💡 Boas Práticas

1. ✅ **Use email único** para cada admin
2. ✅ **Senhas fortes** (mínimo 12 caracteres)
3. ✅ **Não compartilhe credenciais** de admin
4. ✅ **Ative 2FA** se disponível no Supabase
5. ✅ **Revise logs** regularmente em Supabase

---

## 📚 Próximos Passos

Depois de criar o primeiro admin:

1. Faça login no AdminPanel (`/admin`)
2. Navegue pelas abas:
   - **Usuários** - Gerencie participantes
   - **Eventos** - Crie/edite eventos
   - **Seleções** - Veja matches e seleções

3. Crie mais usuários (clients) conforme necessário

---

**Versão:** 2.0
**Última atualização:** Janeiro 2026
