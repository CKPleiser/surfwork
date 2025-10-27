"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Instagram, ExternalLink, Calendar, ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { OrganizationAuthGate } from "@/components/OrganizationAuthGate";
import { WaveLoader } from "@/components/animations/WaveLoader";

interface PersonProfileProps {
  params: { slug: string };
}

interface ProfileData {
  id: string;
  display_name: string;
  country: string | null;
  bio: string | null;
  kind: string;
  coach_profiles?: Array<{
    sports: string[];
    certifications: string[];
    instagram: string | null;
    portfolio_url: string | null;
  }>;
}

interface CandidatePitch {
  id: string;
  profile_id: string;
  status: string;
  description: string | null;
  availability_start: string | null;
  availability_end: string | null;
  sports: string[];
  certifications: string[];
  contact_method: string | null;
  contact_value: string | null;
}

export default function PersonProfile({ params }: PersonProfileProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [candidatePitch, setCandidatePitch] = useState<CandidatePitch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Fetch profile data by ID (person type only)
        const { data: profileData } = await supabase
          .from("profiles")
          .select(`
            *,
            coach_profiles(*)
          `)
          .eq("id", params.slug)
          .eq("kind", "person")
          .single();

        if (!profileData) {
          notFound();
          return;
        }

        setProfile(profileData);

        // Fetch active candidate pitch if exists
        const { data: pitchData } = await supabase
          .from("candidate_pitches")
          .select("*")
          .eq("profile_id", profileData.id)
          .eq("status", "active")
          .single();

        setCandidatePitch(pitchData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <WaveLoader size="lg" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    notFound();
    return null;
  }

  const coachProfile = profile.coach_profiles?.[0];

  // Combine skills from coach profile and candidate pitch
  const allSkills = [
    ...(coachProfile?.sports || []),
    ...(coachProfile?.certifications || []),
    ...(candidatePitch?.sports || []),
    ...(candidatePitch?.certifications || []),
  ].filter((skill, index, self) => self.indexOf(skill) === index);

  // Format availability
  let availability = null;
  if (candidatePitch?.availability_start && candidatePitch?.availability_end) {
    const start = new Date(candidatePitch.availability_start).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric"
    });
    const end = new Date(candidatePitch.availability_end).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric"
    });
    availability = `${start} - ${end}`;
  }

  return (
    <OrganizationAuthGate redirectTo={`/p/${params.slug}`}>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/crew"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to crew
          </Link>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-white border-2 border-border">
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="h-24 w-24 ring-4 ring-ocean-100">
                  <AvatarFallback className="bg-gradient-ocean text-white text-2xl font-bold">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-bold bg-gradient-ocean bg-clip-text text-transparent">{profile.display_name}</h1>
                    {candidatePitch?.status === "active" && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-ocean text-white text-xs font-bold uppercase tracking-wide shadow-lg shadow-ocean-500/20">
                        Open to work
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{profile.country || "Location not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Skills & Certifications */}
              {allSkills.length > 0 && (
                <div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">Skills & Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {allSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* About */}
              <div>
                <h3 className="mb-4 text-2xl font-bold text-foreground">About</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {profile.bio || candidatePitch?.description || "No bio available."}
                </p>
              </div>

              {/* Availability */}
              {availability && (
                <div className="flex items-center gap-3 p-4 bg-ocean-50 rounded-lg border-2 border-ocean-200">
                  <Calendar className="h-5 w-5 text-ocean-600" />
                  <div>
                    <p className="text-sm font-semibold text-ocean-800">Availability</p>
                    <p className="font-medium text-ocean-900">{availability}</p>
                  </div>
                </div>
              )}

              {/* Connect */}
              <div>
                <h3 className="mb-4 text-2xl font-bold text-foreground">Connect</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {coachProfile?.instagram && (
                    <a
                      href={`https://instagram.com/${coachProfile.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-lg hover:border-ocean-500 hover:text-ocean-600 transition-colors font-medium"
                    >
                      <Instagram className="h-5 w-5" />
                      <span>{coachProfile.instagram}</span>
                    </a>
                  )}
                  {coachProfile?.portfolio_url && (
                    <a
                      href={coachProfile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-lg hover:border-ocean-500 hover:text-ocean-600 transition-colors font-medium"
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>Portfolio</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Contact */}
              {candidatePitch && (
                <div className="pt-6 border-t border-border">
                  {candidatePitch.contact_method === "email" && candidatePitch.contact_value && (
                    <a href={`mailto:${candidatePitch.contact_value}`}>
                      <Button size="lg" className="w-full sm:w-auto gap-2">
                        <Mail className="h-5 w-5" />
                        Get in touch
                      </Button>
                    </a>
                  )}
                  {candidatePitch.contact_method === "whatsapp" && candidatePitch.contact_value && (
                    <a
                      href={`https://wa.me/${candidatePitch.contact_value.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" className="w-full sm:w-auto gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Message on WhatsApp
                      </Button>
                    </a>
                  )}
                  {candidatePitch.contact_method === "link" && candidatePitch.contact_value && (
                    <a
                      href={candidatePitch.contact_value}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" className="w-full sm:w-auto gap-2">
                        <ExternalLink className="h-5 w-5" />
                        Get in touch
                      </Button>
                    </a>
                  )}
                  {!candidatePitch.contact_method && (
                    <Button size="lg" className="w-full sm:w-auto gap-2" disabled>
                      <Mail className="h-5 w-5" />
                      Contact info not available
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
    </OrganizationAuthGate>
  );
}
