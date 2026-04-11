-- ======================================================================
-- FIX: EVENT PARTICIPANTS RLS - Permite admins registrarem usuários
-- ======================================================================
-- PROBLEMA: Admins não conseguem adicionar usuários aos eventos
-- ERRO: "new row violates row-level security policy for table event_participants"
-- CAUSA: A política atual permite INSERT apenas quando auth.uid() = user_id
-- SOLUÇÃO: Criar política adicional para admins poderem inserir qualquer participante
-- ======================================================================

-- 1. Remover a política antiga de INSERT
DROP POLICY IF EXISTS "Users can register for events" ON event_participants;

-- 2. Recriar a política para usuários se auto-registrarem
CREATE POLICY "Users can register for events" 
ON event_participants FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
);

-- 3. Nova política: Admins podem registrar qualquer usuário em eventos
CREATE POLICY "Admins can register users for events" 
ON event_participants FOR INSERT 
WITH CHECK (
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
);

-- 4. Política adicional: Admins podem atualizar status dos participantes
DROP POLICY IF EXISTS "Admins can update event participants" ON event_participants;
CREATE POLICY "Admins can update event participants" 
ON event_participants FOR UPDATE 
USING (
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
);

-- 5. Política adicional: Admins podem remover participantes de eventos
DROP POLICY IF EXISTS "Admins can delete event participants" ON event_participants;
CREATE POLICY "Admins can delete event participants" 
ON event_participants FOR DELETE 
USING (
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
);

-- ======================================================================
-- INSTRUÇÕES DE APLICAÇÃO:
-- ======================================================================
-- 1. Acesse: https://supabase.com/dashboard/project/kdwnptqxwnnzvdinhhin/sql/new
-- 2. Cole ESTE SCRIPT COMPLETO
-- 3. Clique em "RUN" para aplicar
-- 4. Verifique que as políticas foram criadas com sucesso
-- ======================================================================

-- VERIFICAÇÃO (opcional - copie e execute em separado para testar):
-- SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'event_participants'
-- ORDER BY policyname;
