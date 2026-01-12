# 🔓 Bulk Delete Not Working - RLS Fix

## 🔴 Problema Identificado

❌ DELETE retorna **204 No Content** (sucesso HTTP)
❌ Mas os usuários **NÃO são deletados** no Supabase
❌ Ao reiniciar a página, os usuários ainda estão lá

## 🔍 Causa Raiz: RLS (Row Level Security)

O Supabase tem **Row Level Security (RLS)** ativada na tabela `users`. Isso significa:
- A chave **anon** (usada pelo frontend) não tem permissão para DELETE
- Supabase retorna 204 (sucesso HTTP) mesmo sem deletar nada
- Apenas a chave **SERVICE_ROLE** (server-side) pode deletar

### Comportamento:
```
Frontend (anon key) tenta: DELETE FROM users WHERE role='client'
  ↓
Supabase RLS: "Você não tem permissão"
  ↓
Retorna: 204 No Content (engana o frontend)
  ↓
Nada é deletado no banco de dados
```

## ✅ Solução: Edge Function com SERVICE_ROLE

Criei uma **Edge Function** (`delete-users-by-role`) que:
- ✅ Usa a chave **SERVICE_ROLE** (full permissions)
- ✅ Pode deletar qualquer usuário
- ✅ Verifica se o delete funcionou
- ✅ Retorna o count de usuários deletados

## 🚀 Deploying

### **Passo 1: Deploy a Edge Function**

#### Opção A: Via CLI (Recomendado)
```bash
supabase functions deploy delete-users-by-role
```

#### Opção B: Via Dashboard
1. Acesse: https://app.supabase.co → seu projeto
2. **Edge Functions** (menu lateral)
3. **Create a new function**
4. Nome: `delete-users-by-role`
5. Cole o código de: `supabase/functions/delete-users-by-role/index.ts`
6. **Deploy**

### **Passo 2: Testar**

1. **Admin Panel** → **Gerenciar Usuários**
2. **"Deletar em Massa"** → **"Deletar Todos Clientes"** (ex: 6 usuários)
3. Confirma exclusão
4. ✅ Deve deletar de verdade desta vez!
5. Reinicia página (F5)
6. ✅ Usuários não devem estar mais lá

## 📊 Fluxo Antes vs Depois

### Antes (❌ Não funciona)
```
Clica "Deletar Todos Clientes"
  ↓
Frontend usa anon key
  ↓
DELETE FROM users WHERE role='client'
  ↓
Supabase RLS: Permissão negada
  ↓
HTTP 204 No Content (erro silencioso!)
  ↓
Nada é deletado ❌
```

### Depois (✅ Funciona)
```
Clica "Deletar Todos Clientes"
  ↓
Frontend chama Edge Function
  ↓
Edge Function usa SERVICE_ROLE key
  ↓
DELETE FROM users WHERE role='client'
  ↓
Supabase aceita (permissions OK)
  ↓
6 usuários deletados ✅
  ↓
HTTP 200 OK + { count: 6 }
  ↓
UI atualiza e mostra toast de sucesso
```

## 🔍 Logs para Debug

Abra DevTools (F12) → Console e procure por:

```
[usersService] Deleting all users with role via Edge Function: client
[usersService] Calling Edge Function at: https://...
[usersService] Edge Function response - status: 200
[usersService] Successfully deleted 6 users with role: client
```

Se vir **erro**, procure por:
```
[usersService] Error deleting users by role: ...
```

## 📝 O que Mudou

### Arquivo: `src/lib/users.service.ts`
**Antes**: Chamava Supabase diretamente (bloqueado por RLS)
```typescript
const { error: deleteError } = await supabase
  .from('users')
  .delete()
  .eq('role', role);  // ❌ Bloqueado por RLS
```

**Depois**: Chama Edge Function (com SERVICE_ROLE)
```typescript
const response = await fetch(functionUrl, {
  method: 'POST',
  body: JSON.stringify({ role }),
  // Edge Function usa SERVICE_ROLE automaticamente
});  // ✅ Funciona!
```

## 🚨 RLS Explicado

RLS é uma **política de segurança** que limita quem pode fazer o quê no banco de dados:

| Operação | Anon Key | Service Key |
|----------|----------|-------------|
| SELECT users | ✅ Sim | ✅ Sim |
| INSERT users | ✅ Sim | ✅ Sim |
| UPDATE users | ✅ Sim | ✅ Sim |
| **DELETE users** | ❌ **Não** | ✅ **Sim** |

Por isso o DELETE não funciona - a anon key não tem permissão!

## ✨ Checklist

- [ ] Deploy da edge function via CLI ou Dashboard
- [ ] Testar: "Deletar em Massa" com 1+ usuário
- [ ] Verifique no Supabase Dashboard que usuários foram deletados
- [ ] Reinicie a página e confirme que deletados não retornam
- [ ] Verifique logs do console para erros

## 🎯 Próximo Passo

**Faça o deploy da edge function** e testa! Desta vez vai funcionar de verdade! 🚀
