# 🗄️ Schema SQL Supabase - FlashDate

Este documento contém todos os scripts SQL necessários para configurar o banco de dados Supabase conforme definido no seu sistema.

## ✅ Instruções de Setup

1. Acesse [supabase.com](https://supabase.com) e abra seu projeto
2. Vá para **SQL Editor** (lado esquerdo)
3. Clique em **New Query**
4. Copie e cole cada seção abaixo **em ordem**
5. Clique em **RUN** após cada seção

---

## 1️⃣ EXTENSÃO (Necessária para gerar IDs automáticos)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**O que faz:** Permite que o banco de dados gere UUIDs automaticamente para IDs das tabelas.

---

## 2️⃣ TABELA DE USUÁRIOS (Base para tudo)

```sql
CREATE TABLE IF NOT EXISTS users (
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

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

**Campos:**
- `id` - Identificador único (UUID)
- `email` - Email do usuário (único, obrigatório)
- `name` - Nome completo (obrigatório)
- `username` - Nome de usuário (único, obrigatório)
- `whatsapp` - Número de WhatsApp
- `gender` - Gênero: 'M', 'F' ou 'Outro'
- `profile_image_url` - URL da foto de perfil no Storage
- `role` - Permissão: 'admin' (padrão: 'client')
- `created_at` - Data de criação
- `updated_at` - Data da última atualização

---

## 3️⃣ TABELA DE EVENTOS

```sql
CREATE TABLE IF NOT EXISTS events (
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

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_events_next_date ON events(next_date);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
```

**Campos:**
- `id` - Identificador único (UUID)
- `title` - Título do evento (obrigatório)
- `location` - Localização do evento
- `city` - Cidade do evento
- `date` - Data em formato texto
- `next_date` - Data do próximo evento (DATE)
- `schedule` - Horário do evento
- `check_in` - Horário de check-in
- `environment` - Descrição do ambiente
- `music` - Tipo de música
- `dress_code` - Código de vestimenta
- `parking` - Informações sobre estacionamento
- `price` - Preço do evento
- `vagas` - Número de vagas disponíveis
- `vagas_limit_date` - Data limite para inscrição
- `description` - Descrição detalhada
- `event_image_url` - URL da imagem no Storage
- `email` - Email de contato
- `whatsapp` - WhatsApp de contato
- `created_at` - Data de criação
- `updated_at` - Data da última atualização

---

## 4️⃣ TABELA DE SELEÇÕES (Votes de usuários em outros usuários dentro de um evento)

```sql
CREATE TABLE IF NOT EXISTS selections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  selected_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('SIM', 'TALVEZ', 'NÃO')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id, selected_user_id)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_selections_event_id ON selections(event_id);
CREATE INDEX IF NOT EXISTS idx_selections_user_id ON selections(user_id);
CREATE INDEX IF NOT EXISTS idx_selections_vote ON selections(vote);
```

**Campos:**
- `id` - Identificador único (UUID)
- `event_id` - ID do evento (obrigatório)
- `user_id` - ID do usuário que faz a seleção (obrigatório)
- `selected_user_id` - ID do usuário selecionado (obrigatório)
- `vote` - Vote: 'SIM' (match), 'TALVEZ' (maybe), 'NÃO' (no-interest)
- `created_at` - Data de criação
- **UNIQUE**: Garante que cada usuário vota apenas uma vez em cada pessoa em um evento

---

## 5️⃣ TABELA DE PARTICIPANTES DE EVENTOS

```sql
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('registered', 'confirmed', 'no-show')) DEFAULT 'registered',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(status);
```

**Campos:**
- `id` - Identificador único (UUID)
- `event_id` - ID do evento (obrigatório)
- `user_id` - ID do participante (obrigatório)
- `status` - Status do participante: 'registered', 'confirmed', 'no-show'
- `joined_at` - Data de inscrição
- **UNIQUE**: Garante que cada usuário participa apenas uma vez de cada evento

---

## 6️⃣ FUNÇÃO DE LIMPEZA (Resetar dados de um evento)

```sql
CREATE OR REPLACE FUNCTION reset_event_data(target_event_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM selections WHERE event_id = target_event_id;
  DELETE FROM event_participants WHERE event_id = target_event_id;
END;
$$ LANGUAGE plpgsql;
```

**O que faz:** Remove todas as seleções e participantes de um evento específico (útil para resetar um evento).

**Como usar:**
```sql
SELECT reset_event_data('seu-event-id-aqui');
```

---

## 7️⃣ ATIVAR SEGURANÇA (RLS - Row Level Security)

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
```

**O que faz:** Ativa Row Level Security para restringir acesso aos dados baseado em regras.

---

## 8️⃣ CRIAR BUCKETS DE STORAGE

No painel do Supabase, vá em **Storage** e crie dois buckets **públicos**:

1. **`profiles`** - Para fotos de perfil dos usuários
2. **`events`** - Para imagens de eventos

Certifique-se de que ambos estão marcados como **Public** (não Private).

---

## 9️⃣ POLÍTICAS DE STORAGE (RLS para arquivos)

```sql
-- Política para o bucket de Perfis
CREATE POLICY "Qualquer um pode ver fotos de perfil" 
ON storage.objects FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Participantes podem subir fotos" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profiles');

-- Política para o bucket de Eventos
CREATE POLICY "Qualquer um pode ver fotos de eventos" 
ON storage.objects FOR SELECT USING (bucket_id = 'events');

CREATE POLICY "Apenas admin pode subir fotos de eventos" 
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'events' AND 
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
```

---

## 🔄 Dados de Teste

Para testar o sistema, insira dados de exemplo:

```sql
-- Inserir usuários de teste
INSERT INTO users (email, name, username, whatsapp, gender, role) VALUES
('admin@flashdate.com', 'Admin User', 'admin', '(11) 99999-9999', 'M', 'admin'),
('maria@flashdate.com', 'Maria Silva', 'maria.silva', '(11) 98765-4321', 'F', 'client'),
('joao@flashdate.com', 'João Santos', 'joao.santos', '(11) 99876-5432', 'M', 'client'),
('ana@flashdate.com', 'Ana Costa', 'ana.costa', '(11) 98765-5321', 'F', 'client');

-- Inserir evento de teste
INSERT INTO events (title, location, city, date, next_date, schedule, price, vagas, description) VALUES
('FlashDate Paulista', 'Avenida Paulista', 'São Paulo', '2024-02-15', '2024-02-15', '20:00', 'R$ 50', 100, 'Primeiro evento FlashDate em SP');
```

---

## ✨ Verificar se tudo funcionou

Depois de executar todos os scripts, teste as tabelas:

```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Contar registros
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM selections;
SELECT COUNT(*) FROM event_participants;
```

---

## 🆘 Troubleshooting

### Erro: "relation already exists"
**Solução:** A tabela já existe. Você pode usar `DROP TABLE IF EXISTS` antes de criar, ou prosseguir para a próxima seção.

### Erro: "uuid-ossp does not exist"
**Solução:** Não rodou a seção 1. Execute a extensão primeiro.

### Erro de permissão ao inserir
**Solução:** Verifique se RLS está habilitado. Use `SELECT * FROM information_schema.schemata;`

### Imagens não salvam no Storage
**Solução:** Certifique-se de que os buckets são **Public** e as policies estão corretas.

---

## 📞 Dúvidas?

Consulte:
- [Documentação Supabase](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)

---

**Última atualização:** Janeiro 2026
**Versão:** 2.0 (Alinhado com schema final)
