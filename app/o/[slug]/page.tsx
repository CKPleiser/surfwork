import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  CheckCircle,
  Mail,
  ArrowLeft,
  Globe,
  Phone,
  Instagram,
  Facebook,
  Youtube,
  Video,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { JobCard } from "@/components/JobCard";

interface OrganizationProfileProps {
  params: { slug: string };
}

/**
 * Extract video ID from YouTube or Vimeo URL
 */
function extractVideoId(url: string): {
  platform: "youtube" | "vimeo" | null;
  id: string | null;
} {
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/watch\?.*v=([^&]+)/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return { platform: "youtube", id: match[1] };
    }
  }

  const vimeoPattern = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch && vimeoMatch[1]) {
    return { platform: "vimeo", id: vimeoMatch[1] };
  }

  return { platform: null, id: null };
}

/**
 * Get embed URL for video
 */
function getVideoEmbedUrl(url: string): string | null {
  const { platform, id } = extractVideoId(url);

  if (platform === "youtube" && id) {
    return `https://www.youtube.com/embed/${id}`;
  }

  if (platform === "vimeo" && id) {
    return `https://player.vimeo.com/video/${id}`;
  }

  return null;
}

export default async function OrganizationProfile({ params }: OrganizationProfileProps) {
  const supabase = await createClient();

  // Fetch organization data by slug
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!organization) {
    notFound();
  }

  // Fetch active jobs for this organization
  const { data: activeJobs } = await supabase
    .from("jobs")
    .select("id, title, role, city, country, accommodation, pay, compensation, season_start")
    .eq("organization_id", organization.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const location = [organization.city, organization.country].filter(Boolean).join(", ");
  const hasGallery = organization.gallery_images && organization.gallery_images.length > 0;
  const hasVideos = organization.video_urls && organization.video_urls.length > 0;
  const hasSocialMedia = organization.instagram || organization.facebook || organization.youtube || organization.tiktok;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      {/* Hero Image Banner */}
      {organization.hero_image_url && (
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <Image
            src={organization.hero_image_url}
            alt={`${organization.name} - Hero`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/organizations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to organizations
        </Link>

        <div className="max-w-6xl mx-auto">
          {/* Main Profile Card */}
          <Card className={`p-8 bg-white border-2 border-border ${organization.hero_image_url ? '-mt-32 relative z-10' : ''}`}>
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="h-24 w-24 ring-4 ring-ocean-100">
                  <AvatarFallback className="bg-gradient-ocean text-white text-2xl font-bold">
                    {organization.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
                      {organization.name}
                    </h1>
                    {organization.verified && (
                      <CheckCircle className="h-6 w-6 text-ocean-500" />
                    )}
                  </div>
                  {location && (
                    <div className="flex items-center gap-2 text-muted-foreground text-lg">
                      <MapPin className="h-5 w-5" />
                      <span>{location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* About */}
              {organization.about && (
                <div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">About</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                    {organization.about}
                  </p>
                </div>
              )}

              {/* Photo Gallery */}
              {hasGallery && (
                <div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">Photo Gallery</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {organization.gallery_images.map((imageUrl: string, index: number) => (
                      <div
                        key={index}
                        className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border hover:border-ocean-400 transition-all group"
                      >
                        <Image
                          src={imageUrl}
                          alt={`${organization.name} - Gallery image ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {hasVideos && (
                <div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground flex items-center gap-2">
                    <Video className="h-6 w-6 text-ocean-500" />
                    Videos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {organization.video_urls.map((videoUrl: string, index: number) => {
                      const embedUrl = getVideoEmbedUrl(videoUrl);
                      if (!embedUrl) return null;

                      return (
                        <div
                          key={index}
                          className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border-2 border-border"
                        >
                          <iframe
                            src={embedUrl}
                            title={`${organization.name} - Video ${index + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contact & Social */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="p-6 bg-cream-50 rounded-lg border-2 border-ocean-200">
                  <h3 className="mb-4 text-xl font-bold text-foreground">Get in touch</h3>
                  <div className="space-y-3">
                    {organization.email && (
                      <a
                        href={`mailto:${organization.email}`}
                        className="flex items-center gap-3 text-muted-foreground hover:text-ocean-600 transition-colors"
                      >
                        <Mail className="h-5 w-5" />
                        <span>{organization.email}</span>
                      </a>
                    )}
                    {organization.whatsapp && (
                      <a
                        href={`https://wa.me/${organization.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-ocean-600 transition-colors"
                      >
                        <Phone className="h-5 w-5" />
                        <span>{organization.whatsapp}</span>
                      </a>
                    )}
                    {organization.website && (
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-ocean-600 transition-colors"
                      >
                        <Globe className="h-5 w-5" />
                        <span className="truncate">{organization.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                    {!organization.email && !organization.whatsapp && !organization.website && (
                      <p className="text-sm text-muted-foreground italic">
                        Contact information not available
                      </p>
                    )}
                  </div>
                </div>

                {/* Social Media */}
                {hasSocialMedia && (
                  <div className="p-6 bg-cream-50 rounded-lg border-2 border-ocean-200">
                    <h3 className="mb-4 text-xl font-bold text-foreground">Follow us</h3>
                    <div className="space-y-3">
                      {organization.instagram && (
                        <a
                          href={`https://instagram.com/${organization.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-muted-foreground hover:text-pink-600 transition-colors"
                        >
                          <Instagram className="h-5 w-5" />
                          <span>@{organization.instagram.replace('@', '')}</span>
                        </a>
                      )}
                      {organization.facebook && (
                        <a
                          href={`https://facebook.com/${organization.facebook.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-muted-foreground hover:text-blue-600 transition-colors"
                        >
                          <Facebook className="h-5 w-5" />
                          <span>@{organization.facebook.replace('@', '')}</span>
                        </a>
                      )}
                      {organization.youtube && (
                        <a
                          href={`https://youtube.com/${organization.youtube.startsWith('@') ? organization.youtube : '@' + organization.youtube}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-muted-foreground hover:text-red-600 transition-colors"
                        >
                          <Youtube className="h-5 w-5" />
                          <span>@{organization.youtube.replace('@', '')}</span>
                        </a>
                      )}
                      {organization.tiktok && (
                        <a
                          href={`https://tiktok.com/@${organization.tiktok.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-muted-foreground hover:text-black transition-colors"
                        >
                          <Video className="h-5 w-5" />
                          <span>@{organization.tiktok.replace('@', '')}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Active Jobs */}
          {activeJobs && activeJobs.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-6 text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">Open Positions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    location={[job.city, job.country].filter(Boolean).join(", ")}
                    tags={[job.role]}
                    accommodation={job.accommodation === "yes"}
                    pay={job.pay || undefined}
                    campName={organization.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
