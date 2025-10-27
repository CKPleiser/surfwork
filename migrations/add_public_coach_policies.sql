-- Allow public to read person profiles (coaches)
-- This enables the coaches page to show all coach profiles
create policy "public read person profiles"
  on profiles for select
  using (kind = 'person');

-- Allow public to read coach profiles
-- This enables showing coach details like sports, certifications
create policy "public read coach_profiles"
  on coach_profiles for select
  using (true);

-- Allow public to read schools (for displaying school names on jobs)
create policy "public read schools"
  on schools for select
  using (true);
