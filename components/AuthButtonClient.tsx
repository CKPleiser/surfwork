/**
 * Auth Button Client Component
 * Handles authentication UI without client-side fetching
 * Receives user as prop from server for zero-delay rendering
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Building2, PlusCircle } from "lucide-react";
import { PostJobModal } from "@/components/modals/PostJobModal";
import type { UserWithProfile } from "@/lib/auth/session";

interface AuthButtonClientProps {
  user: UserWithProfile | null;
}

export function AuthButtonClient({ user }: AuthButtonClientProps) {
  const router = useRouter();
  const [showPostJobModal, setShowPostJobModal] = useState(false);

  // Not authenticated: Show Post a Job button
  if (!user) {
    return (
      <>
        <Button onClick={() => setShowPostJobModal(true)}>Post a Job</Button>
        <PostJobModal
          open={showPostJobModal}
          onOpenChange={setShowPostJobModal}
          variant="unauthenticated"
        />
      </>
    );
  }

  // Authenticated: Show avatar dropdown
  const isOrganization = user.profile?.kind === "org";
  const displayName = user.profile?.display_name || "User";

  // Generate initials from display name
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.profile?.avatar_url || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isOrganization ? (
          <>
            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowPostJobModal(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Post a Job</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Post Job Modal */}
      {isOrganization && (
        <PostJobModal
          open={showPostJobModal}
          onOpenChange={setShowPostJobModal}
        />
      )}
    </DropdownMenu>
  );
}
