-- 🔐 RLS POLICIES FOR USERS TABLE
-- This fixes the issue where clients cannot update their own profiles
-- Copy this entire file and run it in Supabase SQL Editor

-- 1️⃣ DROP EXISTING POLICIES (if any)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can insert any profile" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- 2️⃣ ENABLE ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3️⃣ CREATE NEW POLICIES

-- POLICY 1: Anyone (authenticated) can view all profiles
CREATE POLICY "Anyone can view profiles" 
ON public.users FOR SELECT 
USING (true);

-- POLICY 2: Authenticated users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- POLICY 3: Admins can update any profile
CREATE POLICY "Admins can update any profile" 
ON public.users FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- POLICY 4: Authenticated users can insert their own profile (for syncing from Auth)
CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id OR role = 'client');

-- POLICY 5: Admins can insert any profile
CREATE POLICY "Admins can insert any profile" 
ON public.users FOR INSERT 
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

-- POLICY 6: Admins can delete users
CREATE POLICY "Admins can delete users" 
ON public.users FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ✅ VERIFY POLICIES WERE CREATED
SELECT 
  policyname,
  tablename,
  permissive,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
