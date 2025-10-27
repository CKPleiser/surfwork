-- Update Storage Bucket for Organizations
-- Creates organization-media bucket alongside school-media for migration
-- Note: school-media bucket remains for backwards compatibility with existing URLs
-- ----------------------------------------------------

-- Step 1: Create new organization-media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-media',
  'organization-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop old storage policies
DROP POLICY IF EXISTS "public_read_school_media" ON storage.objects;
DROP POLICY IF EXISTS "school_owner_can_upload" ON storage.objects;
DROP POLICY IF EXISTS "school_owner_can_update" ON storage.objects;
DROP POLICY IF EXISTS "school_owner_can_delete" ON storage.objects;

-- Step 4: Create new storage policies with organization terminology
-- Policy 1: Public can view all organization media
CREATE POLICY "public_read_organization_media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'organization-media');

-- Policy 2: Organization owners can upload media to their own folder
CREATE POLICY "organization_owner_can_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'organization-media' AND
    -- Extract organization_id from path (format: organization_id/type/filename)
    (string_to_array(name, '/'))[1]::uuid IN (
      SELECT id FROM public.organizations WHERE owner_profile_id = auth.uid()
    )
  );

-- Policy 3: Organization owners can update media in their own folder
CREATE POLICY "organization_owner_can_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'organization-media' AND
    (string_to_array(name, '/'))[1]::uuid IN (
      SELECT id FROM public.organizations WHERE owner_profile_id = auth.uid()
    )
  );

-- Policy 4: Organization owners can delete media from their own folder
CREATE POLICY "organization_owner_can_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'organization-media' AND
    (string_to_array(name, '/'))[1]::uuid IN (
      SELECT id FROM public.organizations WHERE owner_profile_id = auth.uid()
    )
  );

-- Step 5: Update organizations table RLS policies
-- Drop old school-specific policies
DROP POLICY IF EXISTS "public_read_schools" ON organizations;
DROP POLICY IF EXISTS "school_owner_can_update" ON organizations;

-- Create new organization-specific policies
CREATE POLICY "public_read_organizations"
  ON organizations FOR SELECT
  USING (true);

CREATE POLICY "organization_owner_can_update"
  ON organizations FOR UPDATE
  TO authenticated
  USING (owner_profile_id = auth.uid())
  WITH CHECK (owner_profile_id = auth.uid());

-- Migration complete!
-- Storage bucket renamed and all policies updated
