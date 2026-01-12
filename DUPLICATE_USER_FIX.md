# 🔧 Fix: "Dados duplicados" ao Criar Usuário

## 📋 Problema Identificado

Quando tentava-se criar um usuário com email ou username já registrados, o sistema retornava:

```
[usersService] Database insert error: [object Object]
[usersService] Error creating user: Dados duplicados. Verifique se apelido ou email já existem.
[UsersContext] Error adding user: Dados duplicados. Verifique se apelido ou email já existem.
```

**Problemas:**
1. **Logging ineficiente**: `[object Object]` mostra que erro não estava sendo serializado corretamente
2. **Sem validação client-side**: Sistema tentava inserir sem verificar duplicatas primeiro
3. **Mensagem genérica**: Não indicava qual campo (email ou username) estava duplicado
4. **Recursos gastos**: Request chegava até banco de dados antes de validação

---

## ✅ Soluções Implementadas

### 1️⃣ **Melhorado Logging de Erros**

**Arquivo**: `src/lib/users.service.ts`

```typescript
// Usa serializeError para converter qualquer erro em string legível
const errorStr = serializeError(error);
console.error('[usersService] Database insert error:', {
  message: errorMsg,
  code: error?.code,
  details: error?.details,
  dbError: errorStr,  // ← Agora mostra erro legível!
});
```

**Resultado**:
```
❌ Antes: [object Object]
✅ Depois: "duplicate key value violates unique constraint users_email_key"
```

### 2️⃣ **Pre-Check de Duplicatas no Server**

**Arquivo**: `src/lib/users.service.ts`

```typescript
// Antes de inserir, verifica se já existe
const { data: existingUser } = await supabase
  .from('users')
  .select('id, email, username')
  .or(`email.eq.${user.email},username.eq.${user.username}`)
  .maybeSingle();

if (existingUser) {
  // Identifica qual campo está duplicado
  let duplicateField = 'dados';
  if (existingUser.email === user.email && existingUser.username === user.username) {
    duplicateField = 'email e apelido';
  } else if (existingUser.email === user.email) {
    duplicateField = 'email';
  } else if (existingUser.username === user.username) {
    duplicateField = 'apelido';
  }
  
  const errorMsg = `Este ${duplicateField} já está registrado no sistema...`;
  throw new Error(errorMsg);
}
```

**Benefício**: 
- ✅ Evita tentativa de insert desnecessária
- ✅ Mensagem clara sobre qual campo está duplicado
- ✅ Menos requisições ao banco de dados

### 3️⃣ **Validação Client-Side no UsersManagement**

**Arquivo**: `src/components/admin/UsersManagement.tsx`

```typescript
// Helper para verificar duplicatas localmente ANTES de enviar
function checkDuplicateField(users: User[], email: string, username: string, excludeId?: string) {
  for (const user of users) {
    if (excludeId && user.id === excludeId) continue; // Permite auto-update
    
    if (user.email === email && user.username === username) {
      return { isDuplicate: true, field: 'email e apelido' };
    } else if (user.email === email) {
      return { isDuplicate: true, field: 'email' };
    } else if (user.username === username) {
      return { isDuplicate: true, field: 'apelido' };
    }
  }
  return { isDuplicate: false, field: '' };
}
```

**Uso no handleSubmit**:
```typescript
// Valida duplicatas ANTES de submeter
const duplicateCheck = checkDuplicateField(users, formData.email, formData.username, editingId);
if (duplicateCheck.isDuplicate) {
  toast({
    title: 'Erro',
    description: `Este ${duplicateCheck.field} já está registrado...`,
    variant: 'destructive',
  });
  return; // Bloqueia envio
}
```

**Benefício**:
- ✅ Feedback instantâneo (não precisa esperar servidor)
- ✅ Melhor UX (sem loading desnecessário)
- ✅ Economia de requisições
- ✅ Identifica qual campo está duplicado

### 4️⃣ **Melhorado Logging em Toda Stack**

Adicionado `serializeError` helper em:
- `src/lib/users.service.ts` - Para logs de erro de banco de dados
- `src/context/UsersContext.tsx` - Para logs de erro de contexto
- `src/components/admin/UsersManagement.tsx` - Para validação e logging

**Resultado**: Todos os logs mostram mensagens claras, não `[object Object]`

---

## 🔄 Fluxo Agora

### Cenário: Criar Usuário com Email Duplicado

```
1. Usuário preenche formulário
   ↓
2. Clica "Salvar"
   ↓
3. UsersManagement verifica duplicatas localmente
   ├─ Se encontrado: Mostra toast de erro IMEDIATAMENTE
   └─ Se não encontrado: Continua
   ↓
4. Envia POST para createUser
   ↓
5. users.service.ts faz pre-check no servidor
   ├─ Se encontrado: Retorna erro específico (qual campo)
   └─ Se não encontrado: Tenta INSERT
   ↓
6. Banco de dados retorna sucesso ou erro
   ↓
7. UsersContext recebe resposta com mensagem clara
   ↓
8. UsersManagement mostra toast ao usuário
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | ❌ Antes | ✅ Depois |
|---------|---------|----------|
| **Logging de erro** | `[object Object]` | `"duplicate key violates constraint"` |
| **Validação** | Apenas no banco | Client + Server |
| **Mensagem de erro** | Genérica | Específica (email/apelido) |
| **Requisições desnecessárias** | Sim (tenta inserir) | Não (valida antes) |
| **UX** | Espera resposta servidor | Feedback instantâneo |
| **Quando detecta** | Após requisição | Antes de enviar |

---

## 🧪 Como Testar

### Teste 1: Duplicata de Email
```
1. Abra admin panel
2. Crie usuário: joao@example.com / @joao123
3. Tente criar outro com MESMO email
4. ✅ Toast mostra: "Este email já está registrado"
5. ✅ Não envia para servidor (client-side catch)
```

### Teste 2: Duplicata de Apelido
```
1. Crie usuário com username: @tester
2. Tente criar outro com MESMO username
3. ✅ Toast mostra: "Este apelido já está registrado"
4. ✅ Validação client-side funciona
```

### Teste 3: Duplicata de Ambos
```
1. Crie usuário: joao@example.com / @joao_silva
2. Tente criar outro com AMBOS os campos
3. ✅ Toast mostra: "Este email e apelido já estão registrados"
```

### Teste 4: Editar Usuário (Permite o Próprio)
```
1. Crie usuário A: joao@example.com
2. Edite usuário A, altere nome
3. ✅ Permite manter MESMO email/username
4. ✅ checkDuplicateField exclui usuário sendo editado (excludeId)
```

### Teste 5: Verificar Logs
```
1. Abra F12 → Console
2. Tente criar duplicata
3. ✅ Mostra: "[UsersManagement] Duplicate field detected: { isDuplicate: true, field: 'email' }"
4. ✅ Sem [object Object], tudo legível
```

---

## 📁 Arquivos Modificados

1. **src/lib/users.service.ts**
   - Adicionado pre-check de duplicatas antes de INSERT
   - Melhorado logging com serializeError
   - Mensagens de erro mais específicas

2. **src/context/UsersContext.tsx**
   - Adicionado serializeError helper
   - Melhorado logging de erros
   - Simplificado tratamento de erro (strings ao invés de objetos)

3. **src/components/admin/UsersManagement.tsx**
   - Adicionado checkDuplicateField helper
   - Adicionada validação client-side no handleSubmit
   - Mensagens de erro específicas por campo

---

## 🎯 Benefícios

✅ **Melhor UX**: Feedback instantâneo sem requisição desnecessária
✅ **Melhor Logging**: Erros legíveis, não `[object Object]`
✅ **Menos Requisições**: Pre-check evita tentar INSERT com duplicata
✅ **Melhor Segurança**: Double validation (client + server)
✅ **Mensagens Claras**: Indica exatamente qual campo está duplicado
✅ **Melhor Performance**: Reduz carga no servidor

---

## 🚀 Próximos Passos

Se quiser melhorar ainda mais:

1. **Validação de Email**: Pode adicionar verificação de formato
2. **Validação de Apelido**: Pode restringir caracteres permitidos
3. **Rate Limiting**: Pode limitar tentativas de criar usuário
4. **Constraint Messages**: Pode customizar mensagens do Supabase

---

## 🔗 Relacionado

- `SYNC_FIX_SUMMARY.md` - Fix de sincronização auth ↔ database
- `CLIENT_DASHBOARD_FIX.md` - Fix de carregamento de perfil
- `AUTH_SYNC_GUIDE.md` - Guia de testes e validação
