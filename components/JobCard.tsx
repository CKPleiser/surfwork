import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Home, DollarSign } from "lucide-react";
import { memo } from "react";

interface JobCardProps {
  id: string;
  title: string;
  location: string;
  tags?: string[];
  accommodation?: boolean;
  pay?: string;
  campName: string;
}

export const JobCard = memo(function JobCard({
  id,
  title,
  location,
  tags = [],
  accommodation = false,
  pay,
  campName,
}: JobCardProps) {
  return (
    <Link href={`/jobs/${id}`}>
      <Card className="group p-6 cursor-pointer bg-white border-2 border-border hover:border-ocean-400 hover:shadow-xl transition-all duration-200">
        <div className="space-y-4">
          {/* Camp Name */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-ocean text-white text-xs font-bold uppercase tracking-wide shadow-lg shadow-ocean-500/20">
            {campName}
          </div>

          {/* Job Title */}
          <h3 className="text-xl font-bold text-foreground group-hover:text-ocean-600 transition-colors">
            {title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Bottom Info */}
          <div className="flex items-center gap-4 pt-2 border-t border-border text-sm">
            {accommodation && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Home className="h-4 w-4" />
                <span>Housing</span>
              </div>
            )}
            {pay && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>{pay}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
});
