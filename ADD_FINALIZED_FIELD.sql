-- ⚠️ IMPORTANTE: Execute este script no SQL Editor do Supabase
-- Isso adicionará o campo 'finalizado' à tabela 'event_participants'

-- 1. Adicionar coluna 'finalizado' à tabela event_participants
ALTER TABLE event_participants
ADD COLUMN IF NOT EXISTS finalizado BOOLEAN DEFAULT false;

-- 2. Adicionar coluna 'updated_at' se não existir
ALTER TABLE event_participants
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 3. Criar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_event_participants_finalizado 
ON event_participants(finalizado);

-- 4. Criar índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_event_participants_event_finalized 
ON event_participants(event_id, finalizado);

-- ✅ Verificar se o campo foi criado com sucesso
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'event_participants' 
ORDER BY ordinal_position;

-- Alternativamente, visualizar a estrutura da tabela
-- \d event_participants
