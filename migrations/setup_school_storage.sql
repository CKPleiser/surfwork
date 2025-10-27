-- Setup Supabase Storage for School Media
-- Creates storage bucket and RLS policies for school images and media
-- ----------------------------------------------------

-- Create storage bucket for school media (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-media',
  'school-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for school-media bucket
-- ----------------------------------------------------

-- Policy 1: Public can view all school media
DROP POLICY IF EXISTS "public_read_school_media" ON storage.objects;
CREATE POLICY "public_read_school_media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'school-media');

-- Policy 2: School owners can upload media to their own school folder
DROP POLICY IF EXISTS "school_owner_can_upload" ON storage.objects;
CREATE POLICY "school_owner_can_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'school-media' AND
    -- Extract school_id from path (format: school_id/type/filename)
    (string_to_array(name, '/'))[1]::uuid IN (
      SELECT id FROM public.schools WHERE owner_profile_id = auth.uid()
    )
  );

-- Policy 3: School owners can update media in their own school folder
DROP POLICY IF EXISTS "school_owner_can_update" ON storage.objects;
CREATE POLICY "school_owner_can_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'school-media' AND
    (string_to_array(name, '/'))[1]::uuid IN (
      SELECT id FROM public.schools WHERE owner_profile_id = auth.uid()
    )
  );

-- Policy 4: School owners can delete media from their own school folder
DROP POLICY IF EXISTS "school_owner_can_delete" ON storage.objects;
CREATE POLICY "school_owner_can_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'school-media' AND
    (string_to_array(name, '/'))[1]::uuid IN (
      SELECT id FROM public.schools WHERE owner_profile_id = auth.uid()
    )
  );

-- Add RLS policies for schools table (if not already present)
-- ----------------------------------------------------

-- Ensure RLS is enabled on schools
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "public_read_schools" ON schools;
DROP POLICY IF EXISTS "school_owner_can_update" ON schools;

-- Policy: Anyone can read all schools
CREATE POLICY "public_read_schools"
  ON schools FOR SELECT
  USING (true);

-- Policy: School owners can update their own schools
CREATE POLICY "school_owner_can_update"
  ON schools FOR UPDATE
  TO authenticated
  USING (owner_profile_id = auth.uid())
  WITH CHECK (owner_profile_id = auth.uid());

-- Note: School creation happens through jobs creation flow
-- Jobs creation policy already handles school ownership
