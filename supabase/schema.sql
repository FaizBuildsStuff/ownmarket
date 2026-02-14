-- =========================================
-- SAFE ENUM CREATION
-- =========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_role'
    ) THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'buyer', 'seller');
    END IF;
END
$$;


-- =========================================
-- PROFILES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  discord_handle text,
  discord_id text,
  discord_username text,
  discord_avatar text,
  role public.user_role DEFAULT 'buyer',
  badge text,
  banned boolean DEFAULT false,
  banned_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add missing columns safely
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_avatar text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badge text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_until timestamptz;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies safely
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;

-- Recreate policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );


-- =========================================
-- PRODUCTS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  description text,
  discord_channel_link text,
  badge text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge text;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop old product policies
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Sellers manage own products" ON public.products;
DROP POLICY IF EXISTS "Admin can update any product" ON public.products;
DROP POLICY IF EXISTS "Admin can delete any product" ON public.products;

-- Recreate product policies
CREATE POLICY "Anyone can view products"
  ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "Sellers manage own products"
  ON public.products
  FOR ALL
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admin can update any product"
  ON public.products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete any product"
  ON public.products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );


-- =========================================
-- CONTACT REQUESTS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view contact_requests" ON public.contact_requests;

CREATE POLICY "Admin can view contact_requests"
  ON public.contact_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
  