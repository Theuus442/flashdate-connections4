# 🔧 Debug do Sistema de Finalização

Se as seleções não estão ficando bloqueadas após finalizar, siga estas etapas para debugar:

---

## 📋 Passo 1: Abra o Console do Navegador

1. Pressione **F12** ou **Ctrl+Shift+I** (ou **Cmd+Option+I** no Mac)
2. Vá para a aba **Console**
3. Você verá logs detalhados do que está acontecendo

---

## 🔍 Passo 2: Procure pelos Logs

Na página de seleção de participantes, você verá logs como:

```
[EventUserSelection] 🔍 Starting finalization status check...
[finalizationService] Checking finalization status for: {eventId: '00000000-0000-0000-0000-000000000000', userId: 'xxx'}
[finalizationService] ✅ Record found: {isFinalized: true, finalizado: true, id: 'yyy'}
[EventUserSelection] ✅ Finalization status result: {isFinalized: true, ...}
[EventUserSelection] 🔒 User is FINALIZED - buttons should be blocked
```

### Se você vir `isFinalized: false`:
- Significa que **nenhum registro foi salvo** quando você clicou em "Finalizar"
- Vá para o **Passo 3**

### Se você vir `isFinalized: true`:
- O status foi salvo corretamente ✅
- O problema é visual (os botões não estão desabilitados)
- Vá para o **Passo 4**

---

## 3️⃣ Se isFinalized = false (Não foi salvo)

Isso significa que quando você clicou "Finalizar Seleção", a finalização não foi gravada no banco.

### Teste manual no Supabase:

1. Acesse [supabase.com](https://supabase.com) → seu projeto
2. Clique em **SQL Editor**
3. Execute esta query (substitua `SEU_USER_ID` pelo ID do usuário):

```sql
SELECT id, user_id, event_id, finalizado, status, joined_at, updated_at
FROM event_participants
WHERE user_id = 'SEU_USER_ID'
AND event_id = '00000000-0000-0000-0000-000000000000';
```

### Esperado:
- Se há um registro com `finalizado = true`, o problema é no carregamento
- Se não há registro, o problema é na **gravação**

Se não houver registro, tente:
1. Faça login novamente
2. Selecione 1-2 participantes
3. Clique "Finalizar Seleção"
4. Verifique os logs do console
5. Procure por erros como `❌`

---

## 4️⃣ Se isFinalized = true (Mas não bloqueia)

O status foi salvo, mas a UI não está refletindo. Pode ser:

### Opção A: Limpar cache e recarregar
1. Pressione **Ctrl+Shift+Delete** (ou **Cmd+Shift+Delete** no Mac)
2. Selecione "Cache" e clique "Limpar"
3. Recarregue a página

### Opção B: Verifique o estado visual
Na parte inferior direita da página, deve aparecer um box com:
```
🔍 DEBUG
isFinalized: true
```

Se aparecer `isFinalized: true`, a lógica está correta. O problema é de CSS/styling.

---

## 📝 Informações Úteis

### Dados de Teste:
Use estas credenciais para testar:
- Email: `ellen1@test.com` (ou seu email)
- Senha: (sua senha)

### IDs Importantes:
- **Default Event ID**: `00000000-0000-0000-0000-000000000000`
- Use este ID para todas as finalizações

### Queries Úteis no Supabase SQL:

Ver todas as finalizações:
```sql
SELECT user_id, event_id, finalizado, updated_at
FROM event_participants
WHERE finalizado = true
ORDER BY updated_at DESC;
```

Limpar finalizações (se precisar testar novamente):
```sql
UPDATE event_participants
SET finalizado = false
WHERE user_id = 'SEU_USER_ID';
```

---

## 💡 Próximas Etapas

Depois de identificar o problema:

1. **Se problema é no carregamento**: Verifique os logs de erro em `[finalizationService]`
2. **Se problema é na gravação**: Verifique se `finalizeUserSelections()` está sendo chamada
3. **Se problema é visual**: Limpe cache e verifique CSS dos botões

---

## 📞 Se Continuar com Problemas

Compartilhe estes dados:
1. Screenshot do console (F12) mostrando os logs
2. O resultado da query SQL no Supabase
3. O seu user ID (você encontra em: `[EventUserSelection] authUser: seu_email`)

Isso ajudará a diagnosticar rapidamente! 🚀
