/**
 * Post Job Modal
 *
 * Modal shown when unauthenticated users or crew members click "Post a Job"
 * Provides simple choice between signing in or creating an organization account
 */

"use client";

import Link from "next/link";
import { Building2, LogIn, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PostJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "unauthenticated" | "crew";
}

export function PostJobModal({
  open,
  onOpenChange,
  variant = "unauthenticated",
}: PostJobModalProps) {
  // Content for unauthenticated users
  if (variant === "unauthenticated") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ocean-50 border-2 border-ocean-200">
              <Briefcase className="h-8 w-8 text-ocean-600" />
            </div>
            <DialogTitle className="text-2xl text-center">
              Post a job on Surfwork
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Connect with talented surf professionals from around the world
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <Link href="/auth?redirect=/jobs/new" prefetch={true} className="w-full">
              <Button
                size="lg"
                onClick={() => onOpenChange(false)}
                className="w-full gap-2"
              >
                <LogIn className="h-5 w-5" />
                I have an account
              </Button>
            </Link>

            <Link href="/organizations/signup?redirect=/jobs/new" prefetch={true} className="w-full">
              <Button
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
                className="w-full gap-2 border-2"
              >
                <Building2 className="h-5 w-5" />
                First time posting
              </Button>
            </Link>
          </div>

          <p className="text-xs text-center text-gray-500 mt-4">
            Organization accounts can post unlimited jobs and access full crew profiles
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  // Content for crew members (wrong account type)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ocean-50 border-2 border-ocean-200">
            <Building2 className="h-8 w-8 text-ocean-600" />
          </div>
          <DialogTitle className="text-2xl text-center">
            Organization Account Required
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Job posting is available for organization accounts only
          </DialogDescription>
        </DialogHeader>

        <div className="bg-ocean-50 border-2 border-ocean-200 rounded-lg p-4 my-2">
          <p className="text-sm text-ocean-900 font-medium mb-2">
            For Organizations
          </p>
          <p className="text-sm text-ocean-700">
            Surf camps, schools, resorts, and businesses can post jobs to connect with talented crew members.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/organizations/signup?redirect=/jobs/new" prefetch={true} className="w-full">
            <Button
              size="lg"
              onClick={() => onOpenChange(false)}
              className="w-full gap-2"
            >
              <Building2 className="h-5 w-5" />
              Create Organization Account
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            onClick={() => onOpenChange(false)}
            className="w-full border-2"
          >
            Back to Browsing
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          You can keep your crew profile and add an organization account
        </p>
      </DialogContent>
    </Dialog>
  );
}
