"use client";

import { cn } from "../ui/utils";

interface WaveLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function WaveLoader({ className, size = "md" }: WaveLoaderProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  };

  return (
    <div className={cn("flex items-center justify-center gap-1", sizeClasses[size], className)}>
      <div className="flex items-end gap-1 h-full">
        <div className="w-1.5 bg-gradient-ocean rounded-full animate-wave shadow-lg shadow-ocean-300/50" style={{ animationDelay: "0ms" }} />
        <div className="w-1.5 bg-gradient-ocean rounded-full animate-wave shadow-lg shadow-ocean-300/50" style={{ animationDelay: "150ms" }} />
        <div className="w-1.5 bg-gradient-ocean rounded-full animate-wave shadow-lg shadow-ocean-300/50" style={{ animationDelay: "300ms" }} />
        <div className="w-1.5 bg-gradient-ocean rounded-full animate-wave shadow-lg shadow-ocean-300/50" style={{ animationDelay: "450ms" }} />
        <div className="w-1.5 bg-gradient-ocean rounded-full animate-wave shadow-lg shadow-ocean-300/50" style={{ animationDelay: "600ms" }} />
      </div>
    </div>
  );
}
