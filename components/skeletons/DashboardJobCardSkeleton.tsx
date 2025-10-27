import { Card } from "@/components/ui/card";

export function DashboardJobCardSkeleton() {
  return (
    <Card className="p-6 bg-white border-2 border-border">
      <div className="animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-5 w-16 bg-ocean-100 rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-2 w-2 bg-muted rounded-full" />
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-2 w-2 bg-muted rounded-full" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-16 bg-muted rounded-md" />
            <div className="h-9 w-16 bg-muted rounded-md" />
          </div>
        </div>
      </div>
    </Card>
  );
}
