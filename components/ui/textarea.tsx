import * as React from "react";

import { cn } from "./utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ocean-500 focus-visible:ring-ocean-500/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-24 w-full rounded-lg border-2 bg-white px-4 py-3 text-base transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:shadow-lg hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
