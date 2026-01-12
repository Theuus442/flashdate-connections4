# 🚀 Guia de Configuração Supabase

Este documento explica como configurar o Supabase para o FlashDate.

## 1. Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login ou crie uma conta
4. Clique em "New Project"
5. Preencha os dados:
   - **Name**: Seu projeto (ex: flashdate)
   - **Database Password**: Crie uma senha forte
   - **Region**: Selecione a região mais próxima
6. Clique em "Create new project"
7. Aguarde a criação (pode levar alguns minutos)

## 2. Obter Credenciais

1. No dashboard do Supabase, vá para **Settings → API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
3. Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

## 3. Criar Tabelas do Banco de Dados

### 3.1 Ir ao SQL Editor

1. No Supabase, clique em **SQL Editor**
2. Clique em **New Query**
3. Cole cada SQL script abaixo e execute

### 3.2 Executar Scripts SQL

#### Script 1: Tabela de Usuários

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  whatsapp TEXT,
  gender TEXT CHECK (gender IN ('M', 'F', 'Outro')),
  profile_image_url TEXT,
  role TEXT CHECK (role IN ('admin', 'client')) DEFAULT 'client',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update themselves" ON users FOR UPDATE USING (auth.uid()::text = id);
```

#### Script 2: Tabela de Eventos

```sql
-- Create events table
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT,
  city TEXT,
  date TEXT,
  next_date DATE,
  schedule TEXT,
  check_in TEXT,
  environment TEXT,
  music TEXT,
  dress_code TEXT,
  parking TEXT,
  price TEXT,
  vagas INTEGER,
  vagas_limit_date DATE,
  description TEXT,
  event_image_url TEXT,
  email TEXT,
  whatsapp TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Events are public" ON events FOR SELECT USING (true);
CREATE POLICY "Only admins can create events" ON events FOR INSERT USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);
CREATE POLICY "Only admins can update events" ON events FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);
```

#### Script 3: Tabela de Seleções

```sql
-- Create selections table
CREATE TABLE selections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  selected_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('match', 'friendship', 'no-interest')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, selected_user_id)
);

-- Enable RLS
ALTER TABLE selections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view selections" ON selections FOR SELECT USING (true);
CREATE POLICY "Users can create selections" ON selections FOR INSERT USING (
  auth.uid()::text = user_id
);
CREATE POLICY "Users can update their selections" ON selections FOR UPDATE USING (
  auth.uid()::text = user_id
);
CREATE POLICY "Users can delete their selections" ON selections FOR DELETE USING (
  auth.uid()::text = user_id
);
```

#### Script 4: Tabela de Participantes do Evento

```sql
-- Create event participants table
CREATE TABLE event_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('registered', 'confirmed', 'no-show')) DEFAULT 'registered',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Event participants are public" ON event_participants FOR SELECT USING (true);
CREATE POLICY "Users can register for events" ON event_participants FOR INSERT USING (
  auth.uid()::text = user_id
);
```

## 4. Criar Storage Buckets para Imagens

1. No Supabase, clique em **Storage**
2. Clique em **Create a new bucket**

### 4.1 Bucket de Perfis de Usuários

1. **Name**: `user-profiles`
2. **Public bucket**: ✅ Ativar
3. Clique em **Create bucket**

Depois, clique no bucket criado e vá para **Policies**:

```sql
CREATE POLICY "Anyone can view user profiles" ON STORAGE.objects FOR SELECT USING (bucket_id = 'user-profiles');
CREATE POLICY "Users can upload their profiles" ON STORAGE.objects FOR INSERT WITH CHECK (bucket_id = 'user-profiles');
CREATE POLICY "Users can update their profiles" ON STORAGE.objects FOR UPDATE USING (bucket_id = 'user-profiles');
```

### 4.2 Bucket de Imagens de Eventos

1. **Name**: `event-images`
2. **Public bucket**: ✅ Ativar
3. Clique em **Create bucket**

Depois, clique no bucket criado e vá para **Policies**:

```sql
CREATE POLICY "Anyone can view event images" ON STORAGE.objects FOR SELECT USING (bucket_id = 'event-images');
CREATE POLICY "Admins can upload event images" ON STORAGE.objects FOR INSERT WITH CHECK (bucket_id = 'event-images');
CREATE POLICY "Admins can update event images" ON STORAGE.objects FOR UPDATE USING (bucket_id = 'event-images');
```

## 5. Ativar Email Auth

1. No Supabase, vá para **Authentication → Providers**
2. Procure por **Email**
3. Ative a opção "Enable Email Provider"
4. Configure as opções:
   - Enable email confirmations: Desativar (para desenvolvimento)
   - Auto confirm users: Ativar
5. Clique em **Save**

## 6. Adicionar Variáveis de Ambiente

No arquivo `.env.local` (crie se não existir):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

⚠️ **Importante**: Nunca commit o `.env.local` no git! Use `.env.example` para documentar.

## 7. Testar a Configuração

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Vá para a página de login: `/login`

3. Teste com as credenciais:
   - **Admin**: admin@flashdate.com / admin123
   - **Cliente**: cliente@flashdate.com / cliente123

4. Se as credenciais funcionarem, o Supabase está configurado!

## 8. Dados Iniciais (Opcional)

Para popular o banco com dados iniciais, vá ao **SQL Editor** e execute:

```sql
-- Insert admin user
INSERT INTO users (email, name, username, whatsapp, gender, role)
VALUES (
  'admin@flashdate.com',
  'Admin User',
  'admin',
  '(11) 98765-4321',
  'M',
  'admin'
);

-- Insert test clients
INSERT INTO users (email, name, username, whatsapp, gender, role)
VALUES 
  ('maria@example.com', 'Maria Silva', 'maria.silva', '(11) 98765-4321', 'F', 'client'),
  ('joao@example.com', 'João Santos', 'joao.santos', '(11) 99876-5432', 'M', 'client'),
  ('ana@example.com', 'Ana Costa', 'ana.costa', '(11) 98765-5321', 'F', 'client'),
  ('carlos@example.com', 'Carlos Mendes', 'carlos.mendes', '(11) 97654-3210', 'M', 'client'),
  ('beatriz@example.com', 'Beatriz Lima', 'beatriz.lima', '(11) 96543-2109', 'F', 'client'),
  ('roberto@example.com', 'Roberto Alves', 'roberto.alves', '(11) 95432-1098', 'M', 'client');
```

## 🆘 Troubleshooting

### "VITE_SUPABASE_URL is empty"
- Verifique se o `.env.local` está correto
- Reinicie o servidor: `npm run dev`

### "Storage bucket not found"
- Certifique-se de criar os buckets com os nomes exatos
- Buckets são case-sensitive

### "Policies not working"
- Verifique se RLS está ativado na tabela
- Use o SQL Editor para verificar as policies

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Após completar a configuração, seu FlashDate estará pronto para usar com persistência em banco de dados! 🎉**
