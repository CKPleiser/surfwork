"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/useUser";

interface AuthGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  fallbackUrl?: string;
}

/**
 * AuthGuard component to protect routes that require authentication
 *
 * @param children - The content to render if authenticated
 * @param requireOnboarding - If true, also check if onboarding is completed (default: true)
 * @param fallbackUrl - URL to redirect to if not authenticated (default: /auth)
 */
export function AuthGuard({
  children,
  requireOnboarding = true,
  fallbackUrl = "/auth",
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to auth page
      if (!user) {
        const currentPath = window.location.pathname;
        router.push(`${fallbackUrl}?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      // Authenticated but onboarding not completed - redirect to onboarding
      if (requireOnboarding && !user.onboarding_completed) {
        router.push("/onboarding");
        return;
      }
    }
  }, [user, isLoading, requireOnboarding, fallbackUrl, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not authenticated or onboarding not completed - show nothing while redirecting
  if (!user || (requireOnboarding && !user.onboarding_completed)) {
    return null;
  }

  // Authenticated and (if required) onboarding completed - render children
  return <>{children}</>;
}
