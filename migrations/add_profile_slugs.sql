-- Add slug fields and additional profile fields
-- Migration for profile pages support

-- 1. Add slug to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 2. Add description and cover_url to schools table
ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS cover_url text;

-- 3. Add slug to candidate_pitches for future use
ALTER TABLE candidate_pitches
  ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 4. Create indexes for slug lookups (performance)
CREATE INDEX IF NOT EXISTS profiles_slug_idx ON profiles(slug);
CREATE INDEX IF NOT EXISTS schools_slug_idx ON schools(slug);
CREATE INDEX IF NOT EXISTS candidate_pitches_slug_idx ON candidate_pitches(slug);

-- 5. Function to generate slug from name (helper for future use)
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug text;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  slug := lower(trim(input_text));
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  RETURN slug;
END;
$$;

-- 6. Example trigger to auto-generate slug on insert (optional)
-- Uncomment if you want auto-slug generation:
-- CREATE OR REPLACE FUNCTION set_profile_slug()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--   IF NEW.slug IS NULL THEN
--     NEW.slug := generate_slug(NEW.display_name) || '-' || substring(NEW.id::text, 1, 8);
--   END IF;
--   RETURN NEW;
-- END;
-- $$;

-- CREATE TRIGGER profiles_set_slug
--   BEFORE INSERT ON profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION set_profile_slug();

-- 7. Update RLS policies to include slug-based lookups
-- Allow public read access by slug
CREATE POLICY IF NOT EXISTS "public read profiles by slug"
  ON profiles FOR SELECT
  USING (slug IS NOT NULL);

CREATE POLICY IF NOT EXISTS "public read schools by slug"
  ON schools FOR SELECT
  USING (slug IS NOT NULL);

-- Note: After running this migration, you'll need to populate slug values
-- for existing records. Example:
-- UPDATE profiles SET slug = generate_slug(display_name) || '-' || substring(id::text, 1, 8) WHERE slug IS NULL;
-- UPDATE schools SET slug = generate_slug(name) || '-' || substring(id::text, 1, 8) WHERE slug IS NULL;
