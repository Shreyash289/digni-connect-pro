-- Migration: Resume Upload, AI Resume Builder, and RLS Updates

-- 1. Modify survivors table columns to allow NULL ngo_id (for self-onboarded survivors)
ALTER TABLE public.survivors ALTER COLUMN ngo_id DROP NOT NULL;

ALTER TABLE public.survivors ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.survivors ADD COLUMN IF NOT EXISTS resume_name TEXT;
ALTER TABLE public.survivors ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMPTZ;
ALTER TABLE public.survivors ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ;
ALTER TABLE public.survivors ADD COLUMN IF NOT EXISTS resume_builder_data JSONB DEFAULT '{}'::jsonb;

-- 2. Enable insert policy for survivors to register themselves
DROP POLICY IF EXISTS "survivors insert own profile" ON public.survivors;
CREATE POLICY "survivors insert own profile" ON public.survivors
  FOR INSERT TO authenticated
  WITH CHECK (linked_user_id = auth.uid());

-- 3. Create resumes storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('resumes', 'resumes', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS on storage.objects for the resumes bucket
DROP POLICY IF EXISTS "users manage own resumes" ON storage.objects;
CREATE POLICY "users manage own resumes" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
