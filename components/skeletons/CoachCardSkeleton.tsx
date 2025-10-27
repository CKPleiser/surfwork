import { Card } from "@/components/ui/card";

export function CoachCardSkeleton() {
  return (
    <Card className="p-6 bg-white border-2 border-border">
      <div className="space-y-4 animate-pulse">
        {/* Avatar & Name */}
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 bg-ocean-100 rounded-full flex-shrink-0 ring-2 ring-ocean-100" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="h-7 w-28 bg-ocean-100 rounded-full" />

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-16 bg-sand-100 rounded-md" />
          <div className="h-6 w-20 bg-sand-100 rounded-md" />
          <div className="h-6 w-18 bg-sand-100 rounded-md" />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    </Card>
  );
}
