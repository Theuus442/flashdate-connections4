# 🔒 Setup do Sistema de Finalização de Seleções

## ⚠️ AÇÃO NECESSÁRIA

O sistema de bloqueio de seleções requer que você adicione um campo (`finalizado`) à sua tabela `event_participants` no Supabase.

---

## 📋 Passo a Passo

### 1️⃣ Acesse seu Supabase

1. Vá para [supabase.com](https://supabase.com)
2. Clique no seu projeto **FlashDate**
3. No painel esquerdo, clique em **SQL Editor**

### 2️⃣ Crie uma Nova Query

1. Clique no botão **+ New Query**
2. Copie TODO o conteúdo abaixo:

```sql
-- Adicionar coluna 'finalizado' à tabela event_participants
ALTER TABLE event_participants
ADD COLUMN IF NOT EXISTS finalizado BOOLEAN DEFAULT false;

-- Adicionar coluna 'updated_at' se não existir
ALTER TABLE event_participants
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_event_participants_finalizado 
ON event_participants(finalizado);

CREATE INDEX IF NOT EXISTS idx_event_participants_event_finalized 
ON event_participants(event_id, finalizado);
```

### 3️⃣ Execute a Query

1. Cole o código acima na janela SQL
2. Clique em **RUN** (botão azul)
3. Aguarde a mensagem: **"Query executed successfully"**

### 4️⃣ Verifique se funcionou

Execute esta query para confirmar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'event_participants' 
AND column_name IN ('finalizado', 'updated_at');
```

Se retornar 2 linhas com `finalizado` e `updated_at`, está tudo OK! ✅

---

## 🧪 Testando o Sistema

Após executar o script SQL acima:

1. **Faça login** no aplicativo
2. **Clique em "Selecionar Matches"**
3. **Selecione 3-5 participantes** (Match, Amizade ou Sem Interesse)
4. **Clique em "Finalizar Seleção"**
5. **Confirme no diálogo**
6. **Navegue para outra página e volte**

**Resultado esperado:**
- Os participantes selecionados devem aparecer com um **card dourado** dizendo "Seleção Bloqueada"
- A mensagem **"Sua escolha está bloqueada e não pode ser alterada"** deve aparecer
- Os botões devem estar **desabilitados**

---

## ❌ Se não funcionou?

### Erro: "column finalizado does not exist"

**Solução**: Execute o script SQL acima novamente. Certifique-se de que:
- Você está no **SQL Editor** do Supabase
- Você clicou em **RUN**
- A mensagem mostrou "Query executed successfully"

### Erro: "permission denied"

**Solução**: Verifique suas credenciais do Supabase. A chave de serviço precisa de permissões de admin.

### Botões ainda aparecem desbloqueados após finalizar

**Solução**: 
1. Verifique se o script SQL foi executado corretamente
2. Abra o **DevTools** (F12 na navegador)
3. Vá para a aba **Console**
4. Procure por mensagens `[finalizationService]` com ❌
5. Compartilhe o erro com o suporte

---

## ✨ Pronto!

Agora o sistema de bloqueio de seleções está 100% funcional! 🎉

Usuários que finalizarem suas seleções:
- ✅ Não conseguem mais alterar
- ✅ Veem um card bloqueado
- ✅ Recebem mensagem clara
- ✅ Status persiste mesmo após navegação

---

## 📞 Dúvidas?

Veja também:
- [Documentação Supabase SQL](https://supabase.com/docs/reference/sql/table-valued-functions)
- [Documentação PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
