-- ======================================================================
-- FIX: EVENTOS RLS POLICY - Permite admins atualizarem eventos
-- ======================================================================
-- PROBLEMA: O UPDATE está retornando 204 (sucesso) mas não atualiza os dados
-- CAUSA: A RLS Policy atual usa SELECT na tabela users, causando conflito
-- SOLUÇÃO: Usar auth.jwt() para verificar o role direto do JWT token
-- ======================================================================

-- 1. Remover as políticas antigas
DROP POLICY IF EXISTS "Events are public" ON events;
DROP POLICY IF EXISTS "Only admins can create events" ON events;
DROP POLICY IF EXISTS "Only admins can update events" ON events;

-- 2. Recrear políticas com JWT (mais eficiente e confiável)

-- Permite qualquer um VER eventos
CREATE POLICY "Events are public" 
ON events FOR SELECT 
USING (true);

-- Permite APENAS ADMINS criar eventos
-- Verifica auth.jwt() -> app_metadata -> role = 'admin'
CREATE POLICY "Only admins can create events" 
ON events FOR INSERT 
WITH CHECK (
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
);

-- Permite APENAS ADMINS atualizar eventos
-- IMPORTANTE: Este é o que estava falhando!
CREATE POLICY "Only admins can update events" 
ON events FOR UPDATE 
USING (
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
);

-- Permite APENAS ADMINS deletar eventos (extra, para completude)
CREATE POLICY "Only admins can delete events" 
ON events FOR DELETE 
USING (
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
);

-- ======================================================================
-- INSTRUÇÕES:
-- 1. Vá para: https://app.supabase.com/project/YOUR_PROJECT/sql/new
-- 2. Cole TUDO acima no editor SQL
-- 3. Clique em "Run"
-- 4. Volte para o admin e tente atualizar a data do evento novamente
-- ======================================================================
