import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const badgeVariants: Record<BadgeVariant, string> = {
  default:
    "border-transparent bg-ocean-500 text-white font-semibold [a&]:hover:bg-ocean-600",
  secondary:
    "border-transparent bg-ocean-100 text-ocean-900 font-semibold [a&]:hover:bg-ocean-200",
  destructive:
    "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
  outline:
    "bg-white border-2 border-ocean-300 text-ocean-600 font-semibold [a&]:hover:bg-ocean-50 [a&]:hover:border-ocean-500",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden";

export interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: BadgeVariant;
  asChild?: boolean;
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(baseClasses, badgeVariants[variant], className)}
      {...props}
    />
  );
}

export { Badge, type BadgeVariant };
