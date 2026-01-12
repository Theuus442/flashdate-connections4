-- ==========================================
-- FLASHDATE - SQL SCHEMA COMPLETO
-- ==========================================
-- Cole TODOS estes scripts no SQL Editor do Supabase
-- Vá para: SQL Editor → New Query → Cole o conteúdo abaixo → Clique em "Run"
-- ==========================================

-- ==========================================
-- 1. TABELA DE USUÁRIOS
-- ==========================================

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

-- ==========================================
-- 2. TABELA DE EVENTOS
-- ==========================================

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

-- ==========================================
-- 3. TABELA DE SELEÇÕES (MATCHES)
-- ==========================================

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

-- ==========================================
-- 4. TABELA DE PARTICIPANTES DO EVENTO
-- ==========================================

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

-- ==========================================
-- FIM - TODAS AS TABELAS CRIADAS! ✅
-- ==========================================
