/**
 * Optional Badge Component
 * Small badge to mark optional form fields
 */

import { Badge } from "@/components/ui/badge";

export function OptionalBadge() {
  return (
    <Badge variant="secondary" className="text-[10px] sm:text-xs">
      Optional
    </Badge>
  );
}
