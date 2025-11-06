"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrganizationApplications, useUpdateApplicationStatus, useApplicationFilters } from "@/hooks/use-applications";
import { Loader2, MapPin, User as UserIcon, Mail, Search } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import type { ApplicationStatus } from "@/lib/supabase/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions: { value: ApplicationStatus; label: string }[] = [
  { value: "pending", label: "Pending Review" },
  { value: "viewed", label: "Mark as Viewed" },
  { value: "contacted", label: "Mark as Contacted" },
  { value: "archived", label: "Archive" },
];

export function OrganizationApplicationsList() {
  const { data: applications, isLoading, error } = useOrganizationApplications();
  const updateStatusMutation = useUpdateApplicationStatus();
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredApplications,
    statusCounts,
  } = useApplicationFilters(applications || []);

  // Calculate total from statusCounts
  const totalApplications = applications?.length || 0;

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus) => {
    await updateStatusMutation.mutateAsync({ applicationId, status: newStatus });
  };

  if (isLoading) {
    return (
      <Card className="p-12 text-center bg-white border-2 border-border">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-ocean-500" />
        <p className="text-muted-foreground">Loading applications...</p>
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
        <div className="text-6xl mb-4">📬</div>
        <h3 className="text-2xl font-bold mb-2">No applications yet</h3>
        <p className="text-muted-foreground mb-6 text-lg">
          When crew members apply to your jobs, you&apos;ll see them here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4 bg-white border-2 border-border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, job title, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({totalApplications})</SelectItem>
                <SelectItem value="pending">Pending ({statusCounts.pending || 0})</SelectItem>
                <SelectItem value="viewed">Viewed ({statusCounts.viewed || 0})</SelectItem>
                <SelectItem value="contacted">Contacted ({statusCounts.contacted || 0})</SelectItem>
                <SelectItem value="archived">Archived ({statusCounts.archived || 0})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <Badge variant="secondary">Total: {totalApplications}</Badge>
          <Badge variant="secondary">Pending: {statusCounts.pending || 0}</Badge>
          <Badge variant="secondary">Viewed: {statusCounts.viewed || 0}</Badge>
          <Badge variant="secondary">Contacted: {statusCounts.contacted || 0}</Badge>
          <Badge variant="outline">Archived: {statusCounts.archived || 0}</Badge>
        </div>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card className="p-12 text-center bg-white border-2 border-border">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No applications match your filters</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </Card>
        ) : (
          filteredApplications.map((application) => {
            const location = [application.job.city, application.job.country].filter(Boolean).join(", ");

            return (
              <Card key={application.id} className="p-6 bg-white border-2 border-border hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Applicant Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-ocean flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-ocean-500/20 flex-shrink-0">
                          {application.crew.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground">{application.crew.display_name}</h3>
                          {application.crew.email && (
                            <a
                              href={`mailto:${application.crew.email}`}
                              className="text-sm text-muted-foreground hover:text-ocean-600 transition-colors flex items-center gap-1"
                            >
                              <Mail className="h-3 w-3" />
                              {application.crew.email}
                            </a>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                            {application.crew.country && (
                              <span>{application.crew.country}</span>
                            )}
                            <span>Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Selector */}
                    <div className="w-full md:w-48">
                      <Select
                        value={application.status}
                        onValueChange={(value) => handleStatusUpdate(application.id, value as ApplicationStatus)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Job Info */}
                  <div className="bg-cream-50 p-3 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Applied for:</p>
                    <Link
                      href={`/jobs/${application.job_id}`}
                      className="text-base font-semibold text-foreground hover:text-ocean-600 transition-colors"
                    >
                      {application.job.title}
                    </Link>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                      {location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{location}</span>
                        </div>
                      )}
                      <span className="capitalize">{application.job.role.replace(/_/g, " ")}</span>
                    </div>
                  </div>

                  {/* Application Message */}
                  <div className="bg-white p-3 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground font-medium mb-2">Application message:</p>
                    <p className="text-sm text-foreground leading-relaxed">{application.message}</p>
                  </div>

                  {/* Status Timeline */}
                  {(application.viewed_at || application.contacted_at) && (
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                      {application.viewed_at && (
                        <div>
                          <span className="font-medium">Viewed:</span> {formatDistanceToNow(new Date(application.viewed_at), { addSuffix: true })}
                        </div>
                      )}
                      {application.contacted_at && (
                        <div>
                          <span className="font-medium">Contacted:</span> {formatDistanceToNow(new Date(application.contacted_at), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {application.crew.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `mailto:${application.crew.email}?subject=${encodeURIComponent(`Re: ${application.job.title} Application`)}`}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Email Applicant
                      </Button>
                    )}
                    {application.crew.slug && (
                      <Link href={`/p/${application.crew.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <UserIcon className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
