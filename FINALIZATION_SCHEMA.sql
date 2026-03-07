-- ============================================================
-- MIGRATION: Adicionar suporte a finalização de seleções
-- Data: 2024
-- ============================================================

-- 1️⃣ ADICIONAR COLUNA 'finalizado' à tabela event_participants
ALTER TABLE event_participants
ADD COLUMN IF NOT EXISTS finalizado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2️⃣ CRIAR ÍNDICE PARA MELHORAR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_event_participants_finalizado 
ON event_participants(finalizado);

CREATE INDEX IF NOT EXISTS idx_event_participants_event_user_finalized 
ON event_participants(event_id, user_id, finalizado);

-- 3️⃣ FUNÇÃO PARA FINALIZAR AS SELEÇÕES DE UM USUÁRIO
CREATE OR REPLACE FUNCTION finalize_user_selections(
  target_event_id UUID,
  target_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  finalized_at TIMESTAMP
) AS $$
DECLARE
  v_participant_exists BOOLEAN;
  v_now TIMESTAMP := NOW();
BEGIN
  -- Verificar se o participante existe
  SELECT EXISTS(
    SELECT 1 FROM event_participants 
    WHERE event_id = target_event_id AND user_id = target_user_id
  ) INTO v_participant_exists;

  IF NOT v_participant_exists THEN
    -- Criar registro do participante se não existir
    INSERT INTO event_participants (event_id, user_id, status, finalizado, updated_at)
    VALUES (target_event_id, target_user_id, 'confirmed', TRUE, v_now)
    ON CONFLICT (event_id, user_id) DO UPDATE
    SET finalizado = TRUE, updated_at = v_now;
  ELSE
    -- Apenas atualizar o status
    UPDATE event_participants
    SET finalizado = TRUE, updated_at = v_now
    WHERE event_id = target_event_id AND user_id = target_user_id;
  END IF;

  RETURN QUERY SELECT 
    TRUE as success,
    'Seleções finalizadas com sucesso'::TEXT as message,
    v_now as finalized_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4️⃣ FUNÇÃO PARA VERIFICAR SE UM USUÁRIO ESTÁ FINALIZADO
CREATE OR REPLACE FUNCTION is_user_finalized(
  target_event_id UUID,
  target_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM event_participants 
    WHERE event_id = target_event_id 
    AND user_id = target_user_id 
    AND finalizado = TRUE
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5️⃣ FUNÇÃO PARA OBTER STATUS DE FINALIZAÇÃO DE UM USUÁRIO
CREATE OR REPLACE FUNCTION get_user_finalization_status(target_user_id UUID)
RETURNS TABLE (
  event_id UUID,
  finalized BOOLEAN,
  finalized_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.event_id,
    ep.finalizado,
    ep.updated_at
  FROM event_participants ep
  WHERE ep.user_id = target_user_id
  ORDER BY ep.updated_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6️⃣ RLS POLICY: Impedir updates em seleções se o usuário está finalizado
CREATE POLICY "Users cannot modify selections if finalized"
ON selections FOR UPDATE
USING (
  NOT EXISTS(
    SELECT 1 FROM event_participants
    WHERE event_id = selections.event_id
    AND user_id = selections.user_id
    AND finalizado = TRUE
  )
);

CREATE POLICY "Users cannot delete selections if finalized"
ON selections FOR DELETE
USING (
  NOT EXISTS(
    SELECT 1 FROM event_participants
    WHERE event_id = selections.event_id
    AND user_id = selections.user_id
    AND finalizado = TRUE
  )
);

-- 7️⃣ RLS POLICY: Impedir que admins atualizem dados de usuários finalizados
CREATE POLICY "Prevent updating users if they are finalized"
ON users FOR UPDATE
USING (
  NOT EXISTS(
    SELECT 1 FROM event_participants
    WHERE user_id = users.id
    AND finalizado = TRUE
  )
);

-- 8️⃣ FUNÇÃO PARA OBTER MATCHES MÚTUOS APENAS SE AMBOS FINALIZARAM
-- Esta função retorna matches somente quando ambos os usuários finalizaram suas seleções
CREATE OR REPLACE FUNCTION get_mutual_matches_if_finalized()
RETURNS TABLE (
  user_id UUID,
  selected_user_id UUID,
  match_type TEXT,
  created_at TIMESTAMP
) AS $$
WITH mutual_selections AS (
  -- Get all selections where both SIM or one/both TALVEZ
  SELECT
    s1.user_id,
    s1.selected_user_id,
    s1.vote as vote_a_to_b,
    s2.vote as vote_b_to_a,
    s1.created_at,
    s1.event_id
  FROM selections s1
  INNER JOIN selections s2 ON
    s1.user_id = s2.selected_user_id
    AND s1.selected_user_id = s2.user_id
  WHERE s1.vote IN ('SIM', 'TALVEZ')
    AND s2.vote IN ('SIM', 'TALVEZ')
    AND s1.user_id < s1.selected_user_id -- Avoid duplicates, keep ordered pair
),
with_finalization AS (
  -- Add finalization status for both users
  SELECT
    ms.*,
    ep1.finalizado as user_a_finalized,
    ep2.finalizado as user_b_finalized
  FROM mutual_selections ms
  LEFT JOIN event_participants ep1 ON
    ep1.user_id = ms.user_id
    AND ep1.event_id = ms.event_id
  LEFT JOIN event_participants ep2 ON
    ep2.user_id = ms.selected_user_id
    AND ep2.event_id = ms.event_id
)
SELECT
  user_id,
  selected_user_id,
  CASE
    WHEN vote_a_to_b = 'SIM' AND vote_b_to_a = 'SIM' THEN 'MATCH'
    ELSE 'AMIZADE'
  END as match_type,
  created_at
FROM with_finalization
-- Only return matches where BOTH users have finalized
WHERE user_a_finalized = TRUE AND user_b_finalized = TRUE
ORDER BY created_at DESC;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- Execute esta query para verificar se tudo foi criado:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns
-- WHERE table_name = 'event_participants'
-- ORDER BY ordinal_position;
