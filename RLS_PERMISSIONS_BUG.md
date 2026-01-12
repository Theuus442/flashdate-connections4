# 🔐 Bug: Clientes não conseguem atualizar perfil (Admin consegue)

## 🔴 Problema Encontrado

**Sintoma:**
- ✅ Admin consegue fazer upload de foto e salvar perfil
- ❌ Cliente comum recebe: "Falha ao salvar alterações"

**Causa:** **Row Level Security (RLS)** do Supabase está bloqueando updates de clientes

---

## 🔍 Como Funciona RLS

RLS é uma camada de segurança do Supabase que diz:
> "Quem pode fazer O QUÊ em QUAL dado?"

Exemplo:
```
UPDATE em users
  ├─ Admin: ✅ Pode atualizar QUALQUER usuário
  └─ Client: ❌ NÃO pode atualizar NINGUÉM (nem a si mesmo!)
```

---

## ⚠️ Por que Admin Consegue?

Admin tem uma chave com **permissões administrativas** no Supabase. Ele consegue bypassar RLS policies comuns.

Cliente usa a chave **anon** (anonymous) que está limitada por RLS.

---

## ✅ Solução: Criar RLS Policies Corretas

### Passo 1: Abrir SQL Editor do Supabase

1. Vá para [supabase.com](https://supabase.com)
2. Abra seu projeto
3. Clique em **SQL Editor** (esquerda)
4. Clique em **New Query**

### Passo 2: Colar o Código

Copie todo o conteúdo do arquivo **`RLS_POLICIES_FIX.sql`** e cole no editor.

### Passo 3: Executar

Clique em **RUN** (ou Ctrl+Enter)

### Passo 4: Verificar

Execute esta query para confirmar:
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

Você deve ver **6 novas políticas**:
- ✅ Qualquer um pode ler perfis públicos
- ✅ Usuários atualizam próprio perfil
- ✅ Admins atualizam qualquer perfil
- ✅ Usuários criam próprio perfil
- ✅ Admins criam qualquer perfil
- ✅ Admins deletam usuários

---

## 🧪 Teste Após Corrigir

### Teste 1: Cliente Normal
1. Faça logout
2. Faça login com usuário **cliente** (role = 'client')
3. Vá para perfil
4. Altere um campo (nome, email, WhatsApp)
5. Clique em "Salvar Alterações"

**Resultado esperado:** ✅ Sucesso! Sem erros.

### Teste 2: Com Admin
1. Faça logout
2. Faça login com usuário **admin** (role = 'admin')
3. Vá para perfil
4. Altere um campo
5. Clique em "Salvar Alterações"

**Resultado esperado:** ✅ Sucesso! Continua funcionando.

---

## 📋 Políticas Explicadas

### Política 1: "Qualquer um pode ler perfis públicos"
```sql
FOR SELECT
USING (true);
```
- Qualquer pessoa logada pode ver perfis
- `true` = sem restrição

### Política 2: "Usuários atualizam próprio perfil"
```sql
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```
- `auth.uid()` = ID do usuário logado
- `id` = ID do registro sendo atualizado
- Só permite se forem iguais (seu próprio perfil)

### Política 3: "Admins atualizam qualquer perfil"
```sql
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
```
- Verifica se o usuário logado tem role = 'admin'
- Se sim, permite UPDATE em qualquer registro

---

## 🚨 Se Ainda Não Funcionar

### Verificação 1: RLS Está Habilitado?
```sql
-- Execute isto no SQL Editor:
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'users';
```

**Resultado esperado:**
```
schemaname | tablename | rowsecurity
-----------|-----------|------------
public     | users     | true       ← Deve ser TRUE
```

Se for `false`, execute:
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### Verificação 2: Verificar Todas as Policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### Verificação 3: Checar Permissões da Chave Anon
No painel Supabase:
1. Vá para **Database** → **Roles**
2. Procure pelo role `authenticated` ou similar
3. Verifique se tem permissões de UPDATE

---

## 📚 Código Relacionado

Após corrigir RLS, estes componentes funcionarão melhor:
- `src/pages/ClientDashboard.tsx` - Update de perfil
- `src/lib/users.service.ts` - Service de usuários
- `src/context/UsersContext.tsx` - Context de usuários

---

## 🔗 Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Functions](https://supabase.com/docs/guides/database/postgres/functions)

---

## ⏰ Timeline da Descoberta

1. **Problema inicial:** "Upload de foto falha"
   - Causa: URL com caminho duplicado ✅ Corrigido
   - Causa: ID mismatch entre Auth e DB ✅ Corrigido
   
2. **Problema persistente:** "Email update retorna 0 rows"
   - Causa: RLS bloqueando UPDATE de clientes ← **Aqui estamos**

3. **Solução:** Criar RLS policies que permitam clientes atualizar seu próprio perfil

---

**Data de Descoberta:** Janeiro 2026  
**Status:** 🔴 Aguardando execução do SQL no Supabase  
**Prioridade:** 🔴 ALTA - Bloqueia clientes de salvar perfil
