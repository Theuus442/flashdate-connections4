-- 🔐 RLS POLICIES PARA TABELA USERS
-- Estas políticas permitem que:
-- 1. Todos vejam perfis de outros usuários (SELECT)
-- 2. Cada usuário atualize seu próprio perfil (UPDATE)
-- 3. Admins gerenciem qualquer coisa

-- ⚠️ IMPORTANTE: Execute estes comandos no Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Cole este código → RUN

-- ═══════════════════════════════════════════════════════════════════
-- 1️⃣ REMOVER POLÍTICAS ANTIGAS (se existirem)
-- ═══════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Usuarios podem ler próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuarios podem atualizar próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Admins gerenciam usuários" ON public.users;
DROP POLICY IF EXISTS "Anyone can read user profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- ═══════════════════════════════════════════════════════════════════
-- 2️⃣ CRIAR NOVAS POLÍTICAS
-- ═══════════════════════════════════════════════════════════════════

-- POLÍTICA 1: Qualquer um pode ver (SELECT) qualquer perfil público
CREATE POLICY "Qualquer um pode ler perfis públicos"
ON public.users
FOR SELECT
USING (true);

-- POLÍTICA 2: Cada usuário pode atualizar seu próprio perfil
-- auth.uid() retorna o ID do usuário autenticado
-- Isso garante que só possa atualizar se o ID for dele
CREATE POLICY "Usuários atualizam próprio perfil"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- POLÍTICA 3: Admins podem atualizar qualquer perfil
-- Verifica se o role do usuário logado é 'admin'
CREATE POLICY "Admins atualizam qualquer perfil"
ON public.users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- POLÍTICA 4: Usuários podem criar seu próprio registro (para sincronização)
CREATE POLICY "Usuários criam próprio perfil"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- POLÍTICA 5: Admins podem inserir qualquer usuário
CREATE POLICY "Admins criam qualquer perfil"
ON public.users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- POLÍTICA 6: Admins podem deletar (para limpeza)
CREATE POLICY "Admins deletam usuários"
ON public.users
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ═══════════════════════════════════════════════════════════════════
-- 3️⃣ VERIFICAÇÃO
-- ═══════════════════════════════════════════════════════════════════

-- Execute isto para confirmar que as políticas foram criadas:
-- SELECT * FROM pg_policies WHERE tablename = 'users';

-- Você deve ver 6 novas políticas listadas.
