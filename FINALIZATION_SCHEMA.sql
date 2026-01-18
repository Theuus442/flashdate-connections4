-- ========================================
-- INTEGRITY LOCK SYSTEM FOR SPEED DATING
-- ========================================
-- This migration adds finalization support to prevent
-- data manipulation after users complete their selections

-- 1. Add 'finalizado' column to event_participants table
ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS finalizado BOOLEAN DEFAULT false;

-- 2. Create index on finalizado column for better query performance
CREATE INDEX IF NOT EXISTS idx_event_participants_finalizado ON event_participants(finalizado);

-- 3. Add comment explaining the field
COMMENT ON COLUMN event_participants.finalizado IS 'When true, user cannot modify their profile, selections, or votes for this event';

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================
-- These policies ensure that once a user is finalized, they cannot modify their data

-- 4. Update RLS policy for selections table
-- Users cannot update selections if they are finalized for that event
DROP POLICY IF EXISTS "Users can update selections if not finalized" ON selections;
CREATE POLICY "Users can update selections if not finalized"
  ON selections
  FOR UPDATE
  USING (
    auth.uid()::text = user_id
    AND NOT EXISTS (
      SELECT 1 FROM event_participants
      WHERE event_id = selections.event_id
      AND user_id = auth.uid()::text
      AND finalizado = true
    )
  )
  WITH CHECK (
    auth.uid()::text = user_id
    AND NOT EXISTS (
      SELECT 1 FROM event_participants
      WHERE event_id = selections.event_id
      AND user_id = auth.uid()::text
      AND finalizado = true
    )
  );

-- 5. Update RLS policy for selections DELETE
DROP POLICY IF EXISTS "Users can delete selections if not finalized" ON selections;
CREATE POLICY "Users can delete selections if not finalized"
  ON selections
  FOR DELETE
  USING (
    auth.uid()::text = user_id
    AND NOT EXISTS (
      SELECT 1 FROM event_participants
      WHERE event_id = selections.event_id
      AND user_id = auth.uid()::text
      AND finalizado = true
    )
  );

-- 6. Create policy to prevent updating users table if finalized
-- Users cannot update their profile if they have finalized selections in any event
DROP POLICY IF EXISTS "Users can update profile if not finalized in any event" ON users;
CREATE POLICY "Users can update profile if not finalized in any event"
  ON users
  FOR UPDATE
  USING (
    auth.uid() = id
    AND NOT EXISTS (
      SELECT 1 FROM event_participants
      WHERE user_id = auth.uid()::text
      AND finalizado = true
    )
  )
  WITH CHECK (
    auth.uid() = id
    AND NOT EXISTS (
      SELECT 1 FROM event_participants
      WHERE user_id = auth.uid()::text
      AND finalizado = true
    )
  );

-- 7. Allow admins to always update users
DROP POLICY IF EXISTS "Admins can always update any user" ON users;
CREATE POLICY "Admins can always update any user"
  ON users
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- ========================================
-- FUNCTION TO FINALIZE USER SELECTIONS
-- ========================================
-- This function marks a user as finalized for an event
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
  v_was_finalized BOOLEAN;
BEGIN
  -- Check if participant exists
  SELECT EXISTS(
    SELECT 1 FROM event_participants 
    WHERE event_id = target_event_id 
    AND user_id = target_user_id
  ) INTO v_participant_exists;

  IF NOT v_participant_exists THEN
    RETURN QUERY SELECT 
      FALSE, 
      'Participant not found for this event', 
      NULL::TIMESTAMP;
    RETURN;
  END IF;

  -- Check if already finalized
  SELECT finalizado INTO v_was_finalized
  FROM event_participants
  WHERE event_id = target_event_id 
  AND user_id = target_user_id;

  IF v_was_finalized THEN
    RETURN QUERY SELECT 
      FALSE, 
      'User already finalized for this event', 
      NULL::TIMESTAMP;
    RETURN;
  END IF;

  -- Update finalized status
  UPDATE event_participants
  SET finalizado = true, updated_at = NOW()
  WHERE event_id = target_event_id 
  AND user_id = target_user_id;

  RETURN QUERY SELECT 
    TRUE, 
    'Selections finalized successfully', 
    NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to check if a user is finalized for an event
CREATE OR REPLACE FUNCTION is_user_finalized(
  target_event_id UUID,
  target_user_id UUID
)
RETURNS TABLE (
  finalized BOOLEAN
) AS $$
BEGIN
  RETURN QUERY SELECT ep.finalizado
  FROM event_participants ep
  WHERE ep.event_id = target_event_id 
  AND ep.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Function to get finalization status for a user across all events
CREATE OR REPLACE FUNCTION get_user_finalization_status(target_user_id UUID)
RETURNS TABLE (
  event_id UUID,
  event_title TEXT,
  finalized BOOLEAN,
  finalized_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY SELECT 
    ep.event_id,
    e.title,
    ep.finalizado,
    CASE WHEN ep.finalizado THEN ep.updated_at ELSE NULL END
  FROM event_participants ep
  JOIN events e ON ep.event_id = e.id
  WHERE ep.user_id = target_user_id
  ORDER BY e.next_date DESC;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify everything is set up correctly

-- Check if column was added
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'event_participants' AND column_name = 'finalizado';

-- Check if policies were created
-- SELECT * FROM pg_policies WHERE tablename IN ('selections', 'users', 'event_participants');

-- Check if functions were created
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';
