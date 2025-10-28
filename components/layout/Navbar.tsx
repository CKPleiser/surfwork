/**
 * Navbar Server Wrapper
 * Passes user from server to client component for zero-delay rendering
 */

import { NavbarClient } from "./NavbarClient";
import type { UserWithProfile } from "@/lib/auth/session";

interface NavbarProps {
  user: UserWithProfile | null;
}

export function Navbar({ user }: NavbarProps) {
  return <NavbarClient user={user} />;
}
