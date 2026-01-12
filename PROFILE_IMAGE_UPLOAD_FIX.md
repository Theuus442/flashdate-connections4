# 🔧 Correção: Erro ao Fazer Upload da Foto do Perfil

## 🔴 Problemas Identificados

### Problema 1: URL de Armazenamento com Caminho Duplicado
**Sintoma:** Fotos eram enviadas para o storage, mas com URL incorreta contendo `profiles/profiles/`

**Causa:** No arquivo `storage.service.ts`, o código estava adicionando o prefixo "profiles/" ao caminho, mas o Supabase já adiciona automaticamente o nome do bucket na URL pública.

**Código Antes:**
```typescript
const filePath = `profiles/${fileName}`;  // ❌ Duplica "profiles" na URL
const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
// Resultado: /storage/v1/object/public/profiles/profiles/...
```

**Código Depois:**
```typescript
const filePath = fileName;  // ✅ Apenas o nome do arquivo
// Resultado: /storage/v1/object/public/profiles/...
```

**Arquivos Corrigidos:**
- `src/lib/storage.service.ts` (uploadUserProfileImage e uploadEventImage)

---

### Problema 2: Falha ao Atualizar Usuário no Banco de Dados
**Sintoma:** 
- Upload da imagem funciona ✅
- Mas ao salvar o perfil retorna erro: "User with email teste@teste2.com not found in database"
- Update afeta 0 linhas

**Causa:** O usuário pode ter sido criado no sistema de Auth do Supabase, mas o registro correspondente não foi criado na tabela `users` do banco de dados.

Isso acontece quando:
1. A função de criação de usuário (Edge Function) cria em Auth, mas falha ao criar em DB
2. A função retorna "sucesso parcial" esperando sincronização no próximo login
3. Mas não há sincronização automática implementada

---

## ✅ Soluções Implementadas

### Solução 1: Recuperação Automática de Usuários
Adicionada função `syncAuthUserToDatabase()` em `users.service.ts` que:

- Detecta quando um usuário está logado mas não existe no DB
- Cria automaticamente o registro do usuário com dados básicos
- Permite que a atualização de perfil continue normalmente

**Fluxo:**
```
Usuário tenta salvar perfil
  ↓
Sistema tenta atualizar por ID
  ↓
Se falhar (0 linhas afetadas):
  ├→ Verifica se existe por email
  ├→ Se não existe:
  │  └→ Sincroniza usuário do Auth para DB (cria novo registro)
  │  └→ Retenta update
  └→ Se existe:
     └→ Atualiza por email
```

### Solução 2: Mensagens de Erro Mais Claras
Mensagens agora explicam o problema em português:
- "Sua conta não foi encontrada no servidor"
- "Verifique se sua conta está sincronizada corretamente"
- "Faça login novamente para sincronizar dados"

### Solução 3: Logging Melhorado
Console logs agora mostram:
- Quando um usuário é sincronizado
- Se houve erro na sincronização
- Qual foi a tentativa de recuperação

---

## 🧪 Como Testar

### Teste 1: Novo Upload de Foto
1. Faça login com uma conta
2. Vá para perfil
3. Clique em "Editar Foto"
4. Selecione uma imagem
5. Clique em salvar

**Resultado esperado:**
- ✅ Foto é uploaded ao Storage
- ✅ URL não tem caminho duplicado
- ✅ Perfil é atualizado com sucesso
- ✅ Se usuário não existe em DB, é criado automaticamente

### Teste 2: Ver URL da Foto
Após upload bem-sucedido, verificar que a URL é:
```
✅ Correto:
https://kdwnptqxwnnzvdinhhin.supabase.co/storage/v1/object/public/profiles/{userId}-{timestamp}-{filename}

❌ Incorreto (antigo):
https://kdwnptqxwnnzvdinhhin.supabase.co/storage/v1/object/public/profiles/profiles/{userId}...
```

---

## 📋 Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `src/lib/storage.service.ts` | Removeu prefixo "profiles/" do filePath em uploadUserProfileImage e uploadEventImage |
| `src/lib/users.service.ts` | Adicionou syncAuthUserToDatabase() e lógica de recuperação em updateUser() |
| `src/pages/ClientDashboard.tsx` | Melhorou mensagens de erro e tratamento de usuário não encontrado |

---

## 🔍 Diagnóstico de Problemas

Se ainda tiver problemas:

### Issue: "User not found in database"
**Possíveis causas:**
1. Usuário foi criado em Auth mas não em DB
   - **Solução:** Agora sincroniza automaticamente
2. Email diferente entre Auth e DB
   - **Solução:** Tente fazer login novamente
3. Problema de permissões no Supabase
   - **Solução:** Verifique RLS policies

### Issue: URL de imagem ainda está duplicada
**Possíveis causas:**
1. Mudanças não foram aplicadas
   - **Solução:** Limpe cache (Ctrl+Shift+Delete) e recarregue
2. Imagens antigas continuam com URL errada
   - **Solução:** Upload nova foto, a URL nova será corrigida

---

## 📚 Referências

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- Schema do banco: `SUPABASE_SQL_SCHEMA.md`

---

**Data de atualização:** Janeiro 2026  
**Versão:** 1.0
