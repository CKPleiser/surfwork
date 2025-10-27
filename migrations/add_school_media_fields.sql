-- Add School Media Fields Migration
-- Extends schools table with rich media, social links, and enhanced content capabilities
-- ----------------------------------------------------

-- Add new columns to schools table
ALTER TABLE schools
  -- Rich content fields
  ADD COLUMN IF NOT EXISTS about TEXT,
  ADD COLUMN IF NOT EXISTS description_rich JSONB DEFAULT '{}'::jsonb,

  -- Media URLs
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Additional social media
  ADD COLUMN IF NOT EXISTS facebook TEXT,
  ADD COLUMN IF NOT EXISTS youtube TEXT,
  ADD COLUMN IF NOT EXISTS tiktok TEXT,

  -- Metadata
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Generate slugs for existing schools (URL-friendly version of name)
-- Convert to lowercase and replace non-alphanumeric chars with hyphens
UPDATE schools
SET slug = LOWER(REGEXP_REPLACE(TRIM(name), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Remove leading/trailing hyphens from slugs
UPDATE schools
SET slug = TRIM(BOTH '-' FROM slug)
WHERE slug IS NOT NULL;

-- Create unique constraint on slug
ALTER TABLE schools
  ADD CONSTRAINT schools_slug_unique UNIQUE (slug);

-- Create index for slug lookups (improves query performance)
CREATE INDEX IF NOT EXISTS schools_slug_idx ON schools(slug);

-- Create index for featured schools (for homepage queries)
CREATE INDEX IF NOT EXISTS schools_featured_idx ON schools(featured) WHERE featured = true;

-- Add comment explaining the schema
COMMENT ON COLUMN schools.about IS 'Plain text description of the school (max 2000 chars)';
COMMENT ON COLUMN schools.description_rich IS 'JSONB field for rich text editor content (Tiptap/Draft.js)';
COMMENT ON COLUMN schools.hero_image_url IS 'Main banner/hero image URL for school profile';
COMMENT ON COLUMN schools.gallery_images IS 'Array of image URLs for school photo gallery';
COMMENT ON COLUMN schools.video_urls IS 'Array of YouTube/Vimeo embed URLs';
COMMENT ON COLUMN schools.slug IS 'URL-friendly unique identifier for SEO (e.g., "surf-school-portugal")';
COMMENT ON COLUMN schools.featured IS 'Featured schools appear prominently on homepage';
