-- Add auth-related columns to profiles table
-- These support the authentication and onboarding flow

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email text UNIQUE,
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Create index on slug for profile page lookups
CREATE INDEX IF NOT EXISTS profiles_slug_idx ON profiles(slug);

-- Function to generate unique slug from display name
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug_candidate text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  slug_candidate := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s-]', '', 'g'));
  slug_candidate := regexp_replace(slug_candidate, '\s+', '-', 'g');
  slug_candidate := regexp_replace(slug_candidate, '-+', '-', 'g');
  slug_candidate := trim(both '-' from slug_candidate);

  -- Handle empty slug
  IF slug_candidate = '' THEN
    slug_candidate := 'user';
  END IF;

  -- Check if slug exists, if so add counter
  WHILE EXISTS (SELECT 1 FROM profiles WHERE slug = slug_candidate) LOOP
    counter := counter + 1;
    slug_candidate := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s-]', '', 'g'));
    slug_candidate := regexp_replace(slug_candidate, '\s+', '-', 'g');
    slug_candidate := regexp_replace(slug_candidate, '-+', '-', 'g');
    slug_candidate := trim(both '-' from slug_candidate);
    IF slug_candidate = '' THEN
      slug_candidate := 'user';
    END IF;
    slug_candidate := slug_candidate || '-' || counter::text;
  END LOOP;

  RETURN slug_candidate;
END;
$$;

-- Trigger function to auto-create profile when auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_name text;
  user_slug text;
BEGIN
  -- Extract display name from email or metadata
  user_name := COALESCE(
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  -- Generate unique slug
  user_slug := generate_unique_slug(user_name);

  -- Create profile record
  INSERT INTO public.profiles (id, kind, display_name, email, slug)
  VALUES (
    new.id,
    'person', -- default, user can change during onboarding
    user_name,
    new.email,
    user_slug
  );

  RETURN new;
END;
$$;

-- Create trigger on auth.users table (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Backfill slugs for existing profiles (if any don't have slugs)
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN
    SELECT id, display_name
    FROM profiles
    WHERE slug IS NULL
  LOOP
    UPDATE profiles
    SET slug = generate_unique_slug(profile_record.display_name)
    WHERE id = profile_record.id;
  END LOOP;
END $$;

-- Comments for documentation
COMMENT ON COLUMN profiles.email IS 'User email from auth.users, unique identifier for login';
COMMENT ON COLUMN profiles.slug IS 'URL-friendly identifier for profile pages (/p/[slug])';
COMMENT ON COLUMN profiles.is_admin IS 'Admin flag for moderation dashboard access';
