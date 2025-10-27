import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

interface CoachProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  country: string | null;
  bio: string | null;
  openToWork: boolean;
  skills: string[];
  availability: string | null;
  instagram: string | null;
  portfolio: string | null;
}

async function fetchCoaches(): Promise<CoachProfile[]> {
  const supabase = createClient();

  // Fetch only needed columns for better performance
  const [
    { data: profiles, error: profilesError },
    { data: coachProfiles, error: coachError },
    { data: pitches, error: pitchesError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, country, bio, created_at")
      .eq("kind", "person")
      .order("created_at", { ascending: false }),
    supabase.from("coach_profiles").select("id, sports, certifications, instagram, portfolio_url"),
    supabase.from("candidate_pitches").select("profile_id, status, sports, certifications, availability_start, availability_end")
      .eq("status", "active"), // Only fetch active pitches
  ]);

  if (profilesError) {
    // Provide user-friendly error message
    if (profilesError.message.includes("fetch")) {
      throw new Error("Unable to load coaches. Please check your connection and try again.");
    }
    throw new Error("Failed to load coaches. Please refresh the page.");
  }

  if (coachError || pitchesError) {
    // Log supplementary data errors but don't throw - we can still show basic profiles
    console.warn("Failed to load some coach details");
  }

  if (!profiles || profiles.length === 0) {
    return [];
  }

  // Filter coach profiles and pitches to only relevant profiles
  const profileIds = profiles.map((p) => p.id);
  const relevantCoachProfiles = coachProfiles?.filter((cp) =>
    profileIds.includes(cp.id)
  );
  const relevantPitches = pitches?.filter((p) =>
    profileIds.includes(p.profile_id)
  );

  // Filter and format coaches
  return profiles
    .filter((profile: any) => {
      const hasCoachProfile = relevantCoachProfiles?.some(
        (cp) => cp.id === profile.id
      );
      const hasPitch = relevantPitches?.some((p) => p.profile_id === profile.id);
      return hasCoachProfile || hasPitch;
    })
    .map((profile: any) => {
      const coachProfile = relevantCoachProfiles?.find(
        (cp) => cp.id === profile.id
      );
      const candidatePitch = relevantPitches?.find(
        (p: any) => p.profile_id === profile.id && p.status === "active"
      );

      // Combine skills
      const skills = [
        ...(coachProfile?.sports || []),
        ...(coachProfile?.certifications || []),
        ...(candidatePitch?.sports || []),
        ...(candidatePitch?.certifications || []),
      ].filter((skill, index, self) => self.indexOf(skill) === index);

      // Format availability
      let availability = null;
      if (
        candidatePitch?.availability_start &&
        candidatePitch?.availability_end
      ) {
        const start = new Date(candidatePitch.availability_start).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        const end = new Date(candidatePitch.availability_end).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        availability = `${start} - ${end}`;
      } else if (candidatePitch?.availability_start) {
        availability = `From ${new Date(candidatePitch.availability_start).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })}`;
      }

      return {
        id: profile.id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        country: profile.country,
        bio: profile.bio,
        openToWork: candidatePitch?.status === "active",
        skills: skills.slice(0, 5),
        availability,
        instagram: coachProfile?.instagram,
        portfolio: coachProfile?.portfolio_url,
      };
    });
}

export function useCoaches() {
  return useQuery({
    queryKey: queryKeys.coaches.list(),
    queryFn: fetchCoaches,
    staleTime: 10 * 60 * 1000, // 10 minutes - coach data changes infrequently
  });
}
