/**
 * Job Not Found Page
 * Shown when a job ID doesn't exist or is no longer active
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function JobNotFound() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with back navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto max-w-content px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Jobs
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-content px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="space-y-6 pt-12 pb-12 text-center">
            {/* Wave emoji */}
            <div className="text-6xl">🌊</div>

            {/* Heading */}
            <h1 className="font-heading text-3xl font-semibold text-text-primary">
              Job not found
            </h1>

            {/* Message */}
            <p className="text-text-secondary leading-relaxed max-w-md mx-auto">
              This job listing might have been filled, removed, or never existed.
              Check out our other opportunities or post your own.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button variant="default" asChild>
                <Link href="/">Browse Jobs</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/jobs/new">Post a Job</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
