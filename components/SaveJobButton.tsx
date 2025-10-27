"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveJob, unsaveJob } from "@/app/jobs/actions";
import { useRouter } from "next/navigation";

interface SaveJobButtonProps {
  jobId: string;
  isSaved: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function SaveJobButton({
  jobId,
  isSaved: initialIsSaved,
  variant = "ghost",
  size = "icon",
  showText = false,
}: SaveJobButtonProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggleSave = async () => {
    startTransition(async () => {
      if (isSaved) {
        const result = await unsaveJob(jobId);
        if (result.error) {
          alert(result.error);
        } else {
          setIsSaved(false);
          router.refresh();
        }
      } else {
        const result = await saveJob(jobId);
        if (result.error) {
          alert(result.error);
        } else {
          setIsSaved(true);
          router.refresh();
        }
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleSave}
      disabled={isPending}
      aria-label={isSaved ? "Unsave job" : "Save job"}
    >
      <Heart
        className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
      />
      {showText && (
        <span className="ml-2">{isSaved ? "Saved" : "Save"}</span>
      )}
    </Button>
  );
}
