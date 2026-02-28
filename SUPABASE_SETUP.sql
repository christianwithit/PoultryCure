-- PoultryCure Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor after creating your project

-- ============================================================================
-- 1. CREATE PROFILES TABLE
-- ============================================================================
-- This table extends auth.users with additional user information

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  profile_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. CREATE RLS POLICIES FOR PROFILES
-- ============================================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 4. CREATE TRIGGER TO AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 5. CREATE FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on profile changes
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 6. OPTIONAL: CREATE DIAGNOSES TABLE (FOR FUTURE USE)
-- ============================================================================
-- Uncomment this section when you're ready to migrate diagnosis history to Supabase

/*
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('symptom', 'image')),
  input TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  confidence NUMERIC(5,2) CHECK (confidence >= 0 AND confidence <= 100),
  recommendations JSONB,
  treatment TEXT,
  prevention TEXT,
  severity TEXT CHECK (severity IN ('low', 'moderate', 'high')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own diagnoses"
  ON public.diagnoses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own diagnoses"
  ON public.diagnoses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagnoses"
  ON public.diagnoses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS diagnoses_user_id_idx ON public.diagnoses(user_id);
CREATE INDEX IF NOT EXISTS diagnoses_created_at_idx ON public.diagnoses(created_at DESC);
*/

-- ============================================================================
-- 7. VERIFY SETUP
-- ============================================================================

-- Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) AS profiles_table_exists;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Check if policies exist
SELECT policyname, tablename 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your Supabase database is now ready for PoultryCure authentication.
-- Next steps:
-- 1. Update your .env file with Supabase credentials
-- 2. Test signup and login in your app
-- 3. Verify profile creation in Supabase Table Editor
