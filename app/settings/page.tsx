import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  // Server-side auth check - redirect if not authenticated
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    redirect("/auth?redirect=/settings");
  }

  return <SettingsClient user={user} />;
}
