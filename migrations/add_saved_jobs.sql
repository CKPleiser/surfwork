/**
 * Migration: Add Saved Jobs Feature
 *
 * Creates the saved_jobs table to allow users (coaches) to bookmark jobs
 * they're interested in for later reference.
 */

-- Create saved_jobs table
create table if not exists saved_jobs (
  id bigint primary key generated always as identity,
  profile_id uuid not null references profiles(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ensure a user can only save a job once
  unique(profile_id, job_id)
);

-- Create indexes for efficient querying
create index if not exists saved_jobs_profile_idx on saved_jobs(profile_id);
create index if not exists saved_jobs_job_idx on saved_jobs(job_id);
create index if not exists saved_jobs_created_idx on saved_jobs(created_at desc);

-- Enable Row Level Security
alter table saved_jobs enable row level security;

-- RLS Policies for saved_jobs
-- Users can only view their own saved jobs
create policy "Users can view their own saved jobs"
  on saved_jobs
  for select
  using (auth.uid() = profile_id);

-- Users can save jobs
create policy "Users can save jobs"
  on saved_jobs
  for insert
  with check (auth.uid() = profile_id);

-- Users can unsave their own jobs
create policy "Users can delete their own saved jobs"
  on saved_jobs
  for delete
  using (auth.uid() = profile_id);

-- Add comment
comment on table saved_jobs is 'Stores user-saved/bookmarked jobs for later reference';
