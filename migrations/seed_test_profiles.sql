-- Seed Test Data for Profile Pages
-- Run this in Supabase SQL Editor after running add_profile_slugs.sql

-- First, run the migration to add slug fields if not done already
-- Then run this seed data

-- 1. Create test person profiles
INSERT INTO profiles (id, kind, display_name, country, bio, slug, avatar_url)
VALUES
  (
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    'person',
    'Maria Silva',
    'Portugal',
    'ISA Level 2 certified surf coach with 10+ years of experience coaching beginners and intermediate surfers. Passionate about ocean safety and building confidence in the water.

Specialized in teaching kids and women''s surf camps. Based in Ericeira but available for international positions.',
    'maria-silva-a1b2c3d4',
    null  -- Will use emoji placeholder
  ),
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'person',
    'Jake Morrison',
    'Australia',
    'Professional surf photographer and videographer turned content creator. 8 years documenting surf culture across Indonesia, Australia, and Central America.

Looking for seasonal positions combining coaching with media production.',
    'jake-morrison-b2c3d4e5',
    null
  ),
  (
    'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    'person',
    'Sophie Laurent',
    'France',
    'Multilingual surf instructor (FR/EN/ES) with First Aid and Lifeguard certifications. 5 years experience in Morocco and France.

Seeking summer season opportunities in Europe or South America.',
    'sophie-laurent-c3d4e5f6',
    null
  );

-- 2. Create coach profiles for the test persons
INSERT INTO coach_profiles (id, years_experience, sports, languages, certifications, instagram, portfolio_url)
VALUES
  (
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    10,
    ARRAY['surf', 'sup'],
    ARRAY['en', 'pt', 'es'],
    ARRAY['ISA Level 2', 'First Aid', 'Lifeguard'],
    'mariasilvasurf',
    'https://mariasilvasurf.com'
  ),
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    8,
    ARRAY['surf'],
    ARRAY['en'],
    ARRAY['Drone Pilot', 'First Aid'],
    'jakemphoto',
    'https://jakemorrison.photo'
  ),
  (
    'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    5,
    ARRAY['surf', 'bodyboard'],
    ARRAY['fr', 'en', 'es'],
    ARRAY['FFS Level 1', 'First Aid', 'Lifeguard'],
    'sophiesurfs',
    null
  );

-- 3. Create candidate pitches (for "open to work" profiles)
INSERT INTO candidate_pitches (
  id, profile_id, status, title, sports, languages, certifications,
  availability_start, availability_end, preferred_regions, exchange_ok,
  description, contact_method, contact_value, instagram
)
VALUES
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    'active',
    'Surf Coach & Kids Specialist',
    ARRAY['surf', 'sup'],
    ARRAY['en', 'pt', 'es'],
    ARRAY['ISA Level 2', 'First Aid', 'Lifeguard'],
    '2025-05-01',
    '2025-10-31',
    ARRAY['Europe', 'South America'],
    true,
    'Seeking summer season coaching role at family-friendly surf camp. Strong focus on safety and building confidence in young learners.',
    'whatsapp',
    '+351912345678',
    'mariasilvasurf'
  ),
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'active',
    'Content Creator & Coach',
    ARRAY['surf'],
    ARRAY['en'],
    ARRAY['Drone Pilot', 'First Aid'],
    '2025-06-01',
    '2025-12-31',
    ARRAY['Indonesia', 'Central America', 'Australia'],
    false,
    'Professional surf media creator looking to combine coaching with content production. Available for camps seeking social media growth.',
    'email',
    'jake@example.com',
    'jakemphoto'
  );

-- 4. Create test school/org profiles
INSERT INTO profiles (id, kind, display_name, slug)
VALUES
  (
    'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    'org',
    'Sunset Surf Academy',
    'sunset-surf-academy-d4e5f6a7'
  ),
  (
    'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    'org',
    'Ocean Waves Surf Camp',
    'ocean-waves-surf-camp-e5f6a7b8'
  );

-- 5. Create schools linked to org profiles
INSERT INTO schools (
  id, owner_profile_id, name, slug, city, country,
  description, website, instagram, email, whatsapp, verified
)
VALUES
  (
    gen_random_uuid(),
    'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    'Sunset Surf Academy',
    'sunset-surf-academy-d4e5f6a7',
    'Ericeira',
    'Portugal',
    'Family-run surf school established in 2010, offering beginner to advanced lessons in the World Surfing Reserve of Ericeira.

We focus on small group sizes (max 6 students) and personalized coaching. Our team of ISA-certified instructors speaks English, Portuguese, Spanish, and French.

Located just 45 minutes from Lisbon, we offer daily lessons, surf camps, and surf & yoga retreats year-round.',
    'https://sunsetsurf.pt',
    'sunsetsurf',
    'info@sunsetsurf.pt',
    '+351918765432',
    true
  ),
  (
    gen_random_uuid(),
    'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    'Ocean Waves Surf Camp',
    'ocean-waves-surf-camp-e5f6a7b8',
    'Canggu',
    'Indonesia',
    'Eco-friendly surf camp in the heart of Canggu, Bali. Perfect waves for all levels, from white water to advanced reef breaks.

Our 10-room beachfront property offers comfortable accommodation, daily breakfast, and unlimited surf coaching. We pride ourselves on creating a community atmosphere where solo travelers and groups feel at home.

Open year-round with peak season May-October.',
    'https://oceanwavescanggu.com',
    'oceanwavescanggu',
    'hello@oceanwavescanggu.com',
    '+62812345678',
    true
  );

-- 6. Create some active jobs for the schools (so they show on school profiles)
-- First, get the school IDs
DO $$
DECLARE
  sunset_school_id uuid;
  ocean_school_id uuid;
BEGIN
  -- Get school IDs
  SELECT id INTO sunset_school_id FROM schools WHERE slug = 'sunset-surf-academy-d4e5f6a7' LIMIT 1;
  SELECT id INTO ocean_school_id FROM schools WHERE slug = 'ocean-waves-surf-camp-e5f6a7b8' LIMIT 1;

  -- Insert jobs for Sunset Surf Academy
  INSERT INTO jobs (
    school_id, status, title, role, sports, description,
    city, country, season_start, season_end,
    compensation, pay, accommodation, contact, contact_value
  )
  VALUES
    (
      sunset_school_id,
      'active',
      'Surf Coach - Summer Season 2025',
      'coach',
      ARRAY['surf'],
      'We''re looking for an energetic surf coach to join our team for the summer season (May-September). You''ll work with beginner and intermediate students in small groups along the beautiful coast of Ericeira.

Requirements:
- ISA Level 1 or equivalent certification
- Fluent English (Portuguese/Spanish is a plus)
- First Aid & Lifeguard certifications
- Experience teaching all ages

What we offer:
- Competitive salary
- Shared accommodation 5 minutes from the beach
- Free surf equipment and wetsuit
- Opportunity to surf world-class waves on your days off',
      'Ericeira',
      'Portugal',
      '2025-05-01',
      '2025-09-30',
      'salary',
      '€1500/month',
      'yes',
      'email',
      'jobs@sunsetsurf.pt'
    ),
    (
      sunset_school_id,
      'active',
      'Social Media Manager',
      'media',
      ARRAY['surf'],
      'Part-time role managing our Instagram, TikTok, and Facebook channels. Create engaging content showcasing our lessons, student progression, and the Ericeira surf scene.

Requirements:
- Content creation experience (photo/video)
- Familiar with surf culture
- Based in or willing to relocate to Ericeira
- Portuguese/English bilingual preferred

Flexible hours, can be combined with surf coaching or other roles.',
      'Ericeira',
      'Portugal',
      '2025-04-01',
      '2025-10-31',
      'day_rate',
      '€50/day (3 days/week)',
      'no',
      'email',
      'jobs@sunsetsurf.pt'
    );

  -- Insert jobs for Ocean Waves
  INSERT INTO jobs (
    school_id, status, title, role, sports, description,
    city, country, season_start, season_end,
    compensation, pay, accommodation, contact, contact_value
  )
  VALUES
    (
      ocean_school_id,
      'active',
      'Head Surf Instructor',
      'coach',
      ARRAY['surf'],
      'Lead our team of 4 surf instructors at our beachfront camp in Canggu. Responsible for lesson planning, student safety, and team coordination.

We''re looking for someone with strong leadership skills and a passion for creating memorable surf experiences.

Requirements:
- ISA Level 2 or equivalent
- 5+ years teaching experience
- Team management experience
- First Aid & CPR certified

Package includes:
- $2000 USD/month
- Private room in our camp
- Daily meals
- Motorbike provided
- Work permit sponsorship',
      'Canggu',
      'Indonesia',
      '2025-05-15',
      '2025-11-15',
      'salary',
      '$2000/month',
      'yes',
      'whatsapp',
      '+62812345678'
    );
END $$;

-- 7. Verify data was inserted
SELECT 'Profiles created:' as info, count(*) as count FROM profiles WHERE kind = 'person';
SELECT 'Schools created:' as info, count(*) as count FROM schools;
SELECT 'Active candidate pitches:' as info, count(*) as count FROM candidate_pitches WHERE status = 'active';
SELECT 'Active jobs:' as info, count(*) as count FROM jobs WHERE status = 'active';

-- 8. Show the test URLs you can now visit:
SELECT
  'Person Profile URLs:' as type,
  '/p/' || slug as url,
  display_name as name
FROM profiles
WHERE kind = 'person' AND slug IS NOT NULL
UNION ALL
SELECT
  'School Profile URLs:' as type,
  '/s/' || slug as url,
  name as name
FROM schools
WHERE slug IS NOT NULL;
