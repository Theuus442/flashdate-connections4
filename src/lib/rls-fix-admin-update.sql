-- ============================================================
-- FIX: Permitir admins atualizarem outros usuários
-- ============================================================
-- Cole isto no SQL Editor do Supabase e execute

-- Adicionar política para admins poderem atualizar qualquer usuário
CREATE POLICY "Admins can update any user" ON users 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);

-- Confirmação: Listar todas as políticas da tabela users
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
