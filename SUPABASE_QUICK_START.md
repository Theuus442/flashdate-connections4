# ⚡ Supabase - Quick Start (Criar Tabelas)

## 📋 Passo 1: Copie o Schema SQL

Abra o arquivo `SUPABASE_SQL_SCRIPTS.sql` neste projeto e **copie todo o conteúdo**.

## 🔧 Passo 2: Entre no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique no seu projeto
3. Clique em **SQL Editor** (lado esquerdo)
4. Clique em **New Query**

## ✨ Passo 3: Cole o SQL

1. Cole todo o conteúdo de `SUPABASE_SQL_SCRIPTS.sql` na caixa de texto
2. Clique no botão **Run** (canto superior direito)
3. Aguarde a execução (verde = sucesso ✅)

## 🖼️ Passo 4: Criar Storage Buckets

### Bucket 1: user-profiles
1. Vá para **Storage** (lado esquerdo)
2. Clique em **Create a new bucket**
3. **Name**: `user-profiles`
4. **Public bucket**: ✅ Ativar checkbox
5. Clique em **Create bucket**

### Bucket 2: event-images
1. Clique em **Create a new bucket** novamente
2. **Name**: `event-images`
3. **Public bucket**: ✅ Ativar checkbox
4. Clique em **Create bucket**

## 🔐 Passo 5: Obter Credenciais

1. Vá para **Settings** → **API** (lado esquerdo)
2. Copie:
   - **Project URL** → Cole em `VITE_SUPABASE_URL`
   - **anon public** → Cole em `VITE_SUPABASE_ANON_KEY`

## 📝 Passo 6: Configurar .env.local

Crie um arquivo `.env.local` na **raiz do projeto** com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

## ✅ Pronto!

Reinicie o servidor:
```bash
npm run dev
```

Seu FlashDate agora usa **Supabase em produção**! 🚀

---

## 📊 O Que Foram Criadas

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários (perfil, email, gênero, etc) |
| `events` | Eventos (local, data, descrição, etc) |
| `selections` | Matches/amizades/desinteresses |
| `event_participants` | Registro de participação em eventos |
| `user-profiles` (bucket) | Fotos de perfil dos usuários |
| `event-images` (bucket) | Imagens dos eventos |

---

## 🆘 Erros?

- **"Relation already exists"**: A tabela já existe. Apague e execute novamente.
- **"Permission denied"**: Verifique se está usando a conta correta.
- **"Invalid UUID"**: Reinicie o servidor (`npm run dev`)

---

## 🎯 Próximos Passos

1. ✅ Tabelas criadas
2. ✅ Storage buckets criados
3. ✅ Variáveis de ambiente configuradas
4. 🚀 **Teste a aplicação!**

Vá para: `http://localhost:8080/login`

Credenciais de teste:
- Admin: `admin@flashdate.com` / `admin123`
- Cliente: `cliente@flashdate.com` / `cliente123`

---

**Você está pronto para usar Supabase! 🎉**
