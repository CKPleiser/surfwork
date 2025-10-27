import { Card } from "@/components/ui/card";

export function OrganizationCardSkeleton() {
  return (
    <Card className="p-6 bg-white border-2 border-border">
      <div className="space-y-6 animate-pulse">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 bg-ocean-100 rounded-full flex-shrink-0 shadow-lg ring-2 ring-ocean-100" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          </div>
        </div>

        {/* Active Jobs Section */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-4 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-cream-50 rounded-lg border-2 border-border">
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="h-5 w-16 bg-sand-100 rounded" />
            </div>
            <div className="flex items-center justify-between p-3 bg-cream-50 rounded-lg border-2 border-border">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-5 w-20 bg-sand-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
