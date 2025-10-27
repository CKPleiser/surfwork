# Crew Signup Implementation Summary

## Overview
Successfully implemented a streamlined single-page crew signup flow inspired by Grow Cycling Jobs, allowing crew members to create comprehensive profiles and get discovered by surf schools and camps.

## Database Schema Changes

### 1. Extended `profiles` table
Added crew-specific fields:
- `slug` (text, unique) - URL-friendly profile identifier (e.g., "sarah-mitchell")
- `is_public` (boolean, default true) - Profile visibility toggle
- `skills` (text[]) - Array of skill tags
- `links` (jsonb) - Social links object: {instagram, portfolio, site, whatsapp}
- `about` (text) - Long-form work description (max 1500 chars)

Constraints:
- Slug format: `^[a-z0-9-]{3,40}$`
- Bio max length: 600 chars
- About max length: 1500 chars

### 2. Created `profile_roles` table
Multi-to-many relationship for crew role categories:
- `id` (bigserial, primary key)
- `profile_id` (uuid, foreign key → profiles.id)
- `role` (enum: coach, media, camp_staff, ops, other)
- `created_at` (timestamptz)

Indexes: profile_id, role
RLS enabled with standard policies

### 3. Created `candidate_pitches` table
Public pitch/listing for crew members:
- `id` (uuid, primary key)
- `profile_id` (uuid, unique, foreign key)
- `title` (text, 3-80 chars) - e.g., "Surf coach & photographer"
- `description` (text, 20-800 chars) - What you do and how you help
- `availability_start` (date, nullable)
- `availability_end` (date, nullable)
- `preferred_regions` (text[]) - e.g., ["Portugal", "Bali"]
- `exchange_ok` (boolean) - Open to exchange (room & meals)
- `contact` (enum: email, whatsapp, link)
- `contact_value` (text) - Contact information
- `attributes` (jsonb) - Flexible field for 'open_to' array, etc.
- `created_at`, `updated_at` (timestamptz)

Indexes: profile_id, preferred_regions (GIN)
RLS enabled with standard policies

## New Files Created

### 1. `/lib/utils/slug.ts`
Slug generation utilities:
- `slugify(text)` - Convert string to URL-friendly slug
- `isSlugAvailable(slug)` - Check uniqueness in database
- `generateUniqueSlug(displayName)` - Auto-generate with collision handling
- `isValidSlugFormat(slug)` - Validate format

### 2. `/lib/validations/crew-signup.ts`
Zod validation schema with all field validations:
- Account: email, password (optional)
- Profile: display_name, country, bio, avatar_url, is_public
- Craft: roles (required), skills, links, about
- Availability: dates, preferred_regions, open_to
- Pitch: title, description, contact_method, contact_value

Helper: `validateContactValue()` for method-specific validation

### 3. `/app/crew/signup/actions.ts`
Server actions:
- `crewSignup(data)` - Complete registration flow:
  1. Create Supabase Auth account
  2. Generate unique slug
  3. Create/update profile
  4. Insert role rows
  5. Create candidate pitch
- `uploadAvatar(file, profileId)` - Avatar upload to Supabase Storage

### 4. `/lib/mutations/useCrewSignup.ts`
TanStack Query mutation hook for client-side form submission

### 5. `/app/crew/signup/page.tsx`
Comprehensive single-page signup form with 5 sections:

**Section A: Account**
- Email (required)
- Password (optional, magic link alternative)

**Section B: Public Profile**
- Display name (required, 2-60 chars)
- Auto-generated slug preview
- Country (select dropdown)
- Short bio (optional, max 600 chars)
- "Make my profile public" toggle (default ON)

**Section C: What's Your Craft?**
- Role categories (multi-select chips, min 1 required)
- Skills tags (add/remove chips with typeahead)
- Links (Instagram, portfolio, website, WhatsApp)
- About your work (optional, max 1500 chars)

**Section D: Availability & Regions**
- Available from/until (date pickers, optional)
- Preferred regions (multi-select chips)
- Open to (salary, day_rate, exchange, volunteer - multi-select)

**Section E: Public Pitch**
- Title (required, 3-80 chars)
- Description (required, 20-800 chars)
- Contact method (radio: email, whatsapp, link)
- Contact value (validated per method)

## Files Deleted (Legacy Cleanup)
- `/app/onboarding/page.tsx` - Old two-step onboarding flow
- `/lib/validations/profile.ts` - Old profile validation schema
- `/lib/mutations/useUpdateProfile.ts` - Old profile update mutation

## Updated Files

### `/app/crew/page.tsx`
Updated CTAs:
- "I'm looking for work" → `/crew/signup` (new crew signup)
- "Meet the crew" → `/auth` (employer login)

## Key Features

1. **Single-Page Flow**: No multi-step dropoff, all fields in one scrollable form
2. **Auto-Slug Generation**: From display_name with uniqueness validation
3. **Public by Default**: is_public = true, clear toggle in form
4. **Chip-Based UI**: Modern multi-select for roles, regions, compensation
5. **Real-time Validation**: Zod schema with field-level error messages
6. **Normalized Schema**: Separate tables for structured data (roles, pitches)
7. **Clean Separation**: Crew signup completely separate from employer flow

## User Flow

1. Visit `/crew` landing page
2. Click "I'm looking for work"
3. Fill out comprehensive single-page form
4. Submit → Creates:
   - Auth account (Supabase Auth)
   - Profile with slug
   - Role associations
   - Public pitch
5. Redirect to `/p/{slug}` (crew profile page)

## Next Steps (Future)

1. Build crew profile display page (`/p/[slug]`)
2. Build crew search/browse page for employers
3. Implement avatar upload UI in signup form
4. Add profile editing functionality
5. Build crew discovery/search filters
6. Add crew profile analytics

## Technical Notes

- All migrations applied successfully via Supabase MCP
- RLS policies enabled on all new tables
- Slug uniqueness enforced at database level
- Exchange/compensation tracking via both flag and attributes
- Form state managed with React Hook Form + Zod
- Server actions for type-safe mutations
- TanStack Query for optimistic updates

## Database Migration Names

1. `extend_profiles_for_crew`
2. `create_profile_roles_table`
3. `create_candidate_pitches_table`

All migrations are reversible if needed (can be rolled back).
