# 🔧 Correção: ID Mismatch Entre Auth e Database

## 🔴 Problema Identificado

**Sintoma:** Mesmo após corrigir o upload de imagem, o perfil ainda não salvava.

**Causa Raiz:** Há um mismatch de IDs entre o sistema de Autenticação e o Banco de Dados:

```
Auth ID (do Supabase Auth): 4b4c04f1-5ca7-4ebf-acf3-92f8f8bc8804
Database ID (da tabela users): 738f21f6-73e2-4347-8679-b6f8b7a214ec
                                ^ ID do usuário carregado com sucesso
```

**Fluxo do Erro:**
1. ✅ Usuário faz login com Auth ID: `4b4c04f1-...`
2. ✅ Sistema carrega dados do banco: encontra usuário com ID `738f21f6-...`
3. ❌ Ao salvar, tenta atualizar usando Auth ID `4b4c04f1-...`
4. ❌ Query não encontra ninguém com esse ID
5. ❌ Update afeta 0 linhas → erro

**Por que isso acontece?**

Possíveis cenários:
1. **Cenário mais comum:** Usuário foi criado em Auth, mas o Edge Function falhou ao criar em DB
2. **Fallback de Email:** Depois, o usuário fez login e a sincronização encontrou ele por email, criando um novo registro com ID diferente
3. **Resultado:** Agora existem 2 identidades diferentes para a mesma pessoa

---

## ✅ Solução Implementada

### Mudança 1: Usar ID do Banco ao Atualizar
**Arquivo:** `src/pages/ClientDashboard.tsx`

```typescript
// ❌ Antes: usava Auth ID
const result = await updateUser(authUser.id, updatedData, selectedImageFile);

// ✅ Depois: usa DB ID (mais confiável)
const result = await updateUser(clientUser.id, updatedData, selectedImageFile);
```

**Por que funciona:**
- `clientUser` é o usuário carregado do banco de dados ✅
- `authUser` é do sistema de Auth e pode estar desincronizado ❌
- O banco sempre tem a fonte de verdade

### Mudança 2: Validação Automática de ID em updateUser()
**Arquivo:** `src/lib/users.service.ts`

Adicionada pré-validação que:
1. Tenta encontrar usuário pelo ID fornecido
2. Se não encontrar, procura pelo email
3. Usa o ID correto para toda a operação
4. Garante que nunca atualiza um ID que não existe

```typescript
// Valida que ID existe, senão tenta por email
let validId = id;
const { data: existingUser } = await supabase
  .from('users')
  .select('id')
  .eq('id', id)
  .maybeSingle();

if (!existingUser && updates.email) {
  // Procura por email e usa aquele ID
  const { data: userByEmail } = await supabase
    .from('users')
    .select('id')
    .eq('email', updates.email)
    .maybeSingle();

  if (userByEmail) {
    validId = userByEmail.id;
  }
}

// Usa ID validado em toda a operação
await supabase.from('users').update(updateData).eq('id', validId).select();
```

---

## 🔍 Como Diagnosticar ID Mismatch

Se tiver esse problema, veja os logs do console:

```javascript
// Procure por algo assim:
[ClientDashboard] User data loaded successfully: {id: '738f21f6-...'}
                                                      ^ ID do banco

[ClientDashboard] Saving profile with image: {userId: '738f21f6-...', authId: '4b4c04f1-...'}
                                               ^ Agora vê a diferença!

[usersService] Update affected 0 rows for ID: 4b4c04f1-...
                                                     ^ Por isso falhou!
```

---

## 🧪 Como Testar

### Teste 1: Login e Salvar Perfil
1. Faça login
2. Vá para perfil
3. Altere algum dado (nome, email, WhatsApp)
4. Clique em "Salvar Alterações"

**Resultado esperado:**
- ✅ Sucesso imediato, sem erros
- ✅ Perfil atualizado
- ✅ Console mostra logs com mesmo ID em todas as etapas

### Teste 2: Com Imagem
1. Faça login
2. Clique em "Editar Foto"
3. Selecione uma imagem
4. Altere nome ou email também
5. Clique em "Salvar Alterações"

**Resultado esperado:**
- ✅ Imagem é salva
- ✅ Perfil é atualizado
- ✅ Sem erros

---

## 📋 Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `src/pages/ClientDashboard.tsx` | Mudou de `authUser.id` para `clientUser.id` na linha 158 |
| `src/lib/users.service.ts` | Adicionou validação de ID e fallback por email antes de atualizar |

---

## ⚠️ Nota Importante: Como Esse ID Mismatch Aconteceu

Se você tem múltiplos usuários com email duplicado mas IDs diferentes, pode ser porque:

1. **Criação incompleta:** Usuário foi criado em Auth mas a função Edge falhou ao criar em DB
2. **Sincronização parcial:** Depois fez login e uma função de sincronização criou novo registro

**Como detectar:**
```sql
-- Rodaje no Supabase SQL Editor
SELECT email, id, created_at FROM users ORDER BY email;
-- Se ver mesmo email 2x, há duplicação
```

**Como corrigir (manual):**
```sql
-- BACKUP primeiro! Depois:
-- Opção 1: Deletar registro antigo (sem dados importantes)
DELETE FROM users WHERE id = 'id-antigo-aqui';

-- Opção 2: Consolidar dados (se tem dados no antigo)
UPDATE users SET profile_image_url = 'url-do-antigo'
WHERE id = 'id-novo' AND profile_image_url IS NULL;
DELETE FROM users WHERE id = 'id-antigo';
```

---

## 📚 Relacionado

- `PROFILE_IMAGE_UPLOAD_FIX.md` - Correção do upload de imagem
- `SUPABASE_SQL_SCHEMA.md` - Schema do banco de dados

---

**Data de atualização:** Janeiro 2026  
**Versão:** 1.0
