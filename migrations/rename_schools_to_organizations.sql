-- Rename Schools to Organizations Migration
-- Generalizes "schools" table to support multiple organization types
-- (schools, camps, surf shops, photographer agencies, etc.)
-- ----------------------------------------------------

-- Step 1: Rename the table
ALTER TABLE schools RENAME TO organizations;

-- Step 2: Add organization type field
-- Supports: school, camp, shop, agency, other
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS org_type TEXT NOT NULL DEFAULT 'school';

-- Add check constraint for valid org types
ALTER TABLE organizations
  ADD CONSTRAINT organizations_org_type_check
  CHECK (org_type IN ('school', 'camp', 'shop', 'agency', 'other'));

-- Step 3: Create index for org_type filtering
CREATE INDEX IF NOT EXISTS organizations_org_type_idx ON organizations(org_type);

-- Step 4: Update the jobs table foreign key column name
ALTER TABLE jobs RENAME COLUMN school_id TO organization_id;

-- Step 5: Recreate the foreign key constraint with new name
-- First, find and drop the old constraint
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'jobs'::regclass
    AND confrelid = 'organizations'::regclass;

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE jobs DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

-- Create new foreign key constraint
ALTER TABLE jobs
  ADD CONSTRAINT jobs_organization_id_fkey
  FOREIGN KEY (organization_id)
  REFERENCES organizations(id)
  ON DELETE CASCADE;

-- Step 6: Update index names for clarity
DROP INDEX IF EXISTS schools_owner_idx;
CREATE INDEX IF NOT EXISTS organizations_owner_idx ON organizations(owner_profile_id);

DROP INDEX IF EXISTS schools_slug_idx;
CREATE INDEX IF NOT EXISTS organizations_slug_idx ON organizations(slug);

DROP INDEX IF EXISTS schools_featured_idx;
CREATE INDEX IF NOT EXISTS organizations_featured_idx ON organizations(featured) WHERE featured = true;

-- Update unique constraint name
ALTER TABLE organizations RENAME CONSTRAINT schools_slug_unique TO organizations_slug_unique;

-- Step 7: Update the trigger name
DROP TRIGGER IF EXISTS schools_updated_at ON organizations;
CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Step 8: Update RLS policies
-- Drop old policies
DROP POLICY IF EXISTS "school owner rw" ON organizations;
DROP POLICY IF EXISTS "school jobs rw" ON jobs;

-- Create new policies with updated names
CREATE POLICY "organization owner rw"
  ON organizations FOR ALL
  USING (auth.uid() = owner_profile_id)
  WITH CHECK (auth.uid() = owner_profile_id);

CREATE POLICY "organization jobs rw"
  ON jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = jobs.organization_id
      AND o.owner_profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = jobs.organization_id
      AND o.owner_profile_id = auth.uid()
    )
    AND (status IN ('pending','closed') OR TRUE)
  );

-- Step 9: Update comments with new terminology
COMMENT ON TABLE organizations IS 'Organizations that can post jobs (schools, camps, shops, agencies, etc.)';
COMMENT ON COLUMN organizations.org_type IS 'Type of organization: school, camp, shop, agency, or other';
COMMENT ON COLUMN organizations.name IS 'Organization display name';
COMMENT ON COLUMN organizations.owner_profile_id IS 'Profile ID of the organization owner/administrator';
COMMENT ON COLUMN organizations.verified IS 'Whether organization has been verified by admin';
COMMENT ON COLUMN organizations.slug IS 'URL-friendly unique identifier for SEO (e.g., "ericeira-surf-school")';

COMMENT ON COLUMN jobs.organization_id IS 'ID of the organization posting this job';

-- Step 10: Add helpful view for organization type counts (optional, for analytics)
CREATE OR REPLACE VIEW organization_type_stats AS
SELECT
  org_type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE verified = true) as verified_count
FROM organizations
GROUP BY org_type
ORDER BY count DESC;

-- Grant access to the view
GRANT SELECT ON organization_type_stats TO authenticated;

-- Migration complete!
-- All existing "school" records now have org_type = 'school' by default
