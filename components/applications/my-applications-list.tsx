"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserApplications } from "@/hooks/use-applications";
import { Loader2, MapPin, Briefcase, Calendar, CheckCircle, Eye, MessageCircle, Archive } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const statusConfig = {
  pending: {
    label: "Pending Review",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-yellow-600",
  },
  viewed: {
    label: "Viewed",
    icon: Eye,
    variant: "secondary" as const,
    color: "text-blue-600",
  },
  contacted: {
    label: "Contacted",
    icon: MessageCircle,
    variant: "default" as const,
    color: "text-green-600",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    variant: "outline" as const,
    color: "text-gray-600",
  },
};

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function MyApplicationsList() {
  const { data: applications, isLoading, error } = useUserApplications();

  if (isLoading) {
    return (
      <Card className="p-12 text-center bg-white border-2 border-border">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-ocean-500" />
        <p className="text-muted-foreground">Loading your applications...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-12 text-center bg-white border-2 border-border">
        <p className="text-destructive mb-2">Failed to load applications</p>
        <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
      </Card>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card className="p-12 text-center bg-white border-2 border-border">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-2xl font-bold mb-2">No applications yet</h3>
        <p className="text-muted-foreground mb-6 text-lg">
          When you apply to jobs, you&apos;ll see them tracked here
        </p>
        <Link href="/jobs">
          <Button size="lg">Browse Jobs</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const status = statusConfig[application.status];
        const StatusIcon = status.icon;
        const location = [application.job.city, application.job.country].filter(Boolean).join(", ");

        return (
          <Card key={application.id} className="p-6 bg-white border-2 border-border hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              {/* Left: Organization Avatar */}
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-gradient-ocean flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-ocean-500/20">
                  {application.job.organization.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Middle: Job Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <Link
                      href={`/jobs/${application.job_id}`}
                      className="text-xl font-bold text-foreground hover:text-ocean-600 transition-colors"
                    >
                      {application.job.title}
                    </Link>
                    <Link
                      href={`/o/${application.job.organization.slug || application.job.organization.id}`}
                      className="text-sm text-muted-foreground hover:text-ocean-600 transition-colors flex items-center gap-1 mt-1"
                    >
                      {application.job.organization.name}
                      {application.job.organization.verified && (
                        <CheckCircle className="h-4 w-4 text-ocean-500" />
                      )}
                    </Link>
                  </div>
                  <Badge variant={status.variant} className="flex-shrink-0">
                    <StatusIcon className={`h-3 w-3 mr-1 ${status.color}`} />
                    {status.label}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                  {location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">{application.job.role.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Application Message Preview */}
                <div className="bg-cream-50 p-3 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground font-medium mb-1">Your message:</p>
                  <p className="text-sm text-foreground line-clamp-2">{application.message}</p>
                </div>

                {/* Status Timeline */}
                {(application.viewed_at || application.contacted_at) && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {application.viewed_at && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-blue-500" />
                          <span>Viewed {formatDistanceToNow(new Date(application.viewed_at), { addSuffix: true })}</span>
                        </div>
                      )}
                      {application.contacted_at && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3 text-green-500" />
                          <span>Contacted {formatDistanceToNow(new Date(application.contacted_at), { addSuffix: true })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              <div className="flex md:flex-col gap-2 md:items-end">
                <Link href={`/jobs/${application.job_id}`}>
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    View Job
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
