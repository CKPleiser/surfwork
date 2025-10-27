import { Card } from "@/components/ui/card";

export function JobCardSkeleton() {
  return (
    <Card className="p-6 bg-gradient-card border-border/50">
      <div className="space-y-4">
        {/* Camp name */}
        <div className="h-4 w-24 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-shimmer bg-[length:200%_100%]" />

        {/* Job title */}
        <div className="h-6 w-3/4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: "150ms" }} />

        {/* Location */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: "300ms" }} />
          <div className="h-4 w-32 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: "300ms" }} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-16 bg-gradient-to-r from-accent/30 via-accent/15 to-accent/30 rounded-md animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: "450ms" }} />
          <div className="h-6 w-20 bg-gradient-to-r from-accent/30 via-accent/15 to-accent/30 rounded-md animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: "600ms" }} />
        </div>

        {/* Bottom row */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: "750ms" }} />
            <div className="h-4 w-16 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: "750ms" }} />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: "900ms" }} />
            <div className="h-4 w-20 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: "900ms" }} />
          </div>
        </div>
      </div>
    </Card>
  );
}
