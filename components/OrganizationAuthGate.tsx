"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Building2 } from "lucide-react";
import { WaveLoader } from "@/components/animations/WaveLoader";

interface OrganizationAuthGateProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function OrganizationAuthGate({ children, redirectTo }: OrganizationAuthGateProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    checkAuthorization();
  }, []);

  async function checkAuthorization() {
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Check if user profile is an organization
      const { data: profile } = await supabase
        .from("profiles")
        .select("kind")
        .eq("id", user.id)
        .single();

      if (profile?.kind === "organization") {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Authorization check failed:", error);
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSignIn = () => {
    const redirect = redirectTo || window.location.pathname;
    router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <WaveLoader size="lg" />
          <p className="text-sm text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Not authorized - show gate
  if (!isAuthorized) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-b from-sand-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-gray-200 shadow-xl">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-ocean-50 border-2 border-ocean-200">
                  <Lock className="h-10 w-10 text-ocean-600" />
                </div>

                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  Organization Access Required
                </h2>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Create an organization account to access full crew profiles, contact information, and connect with talented surf professionals.
                </p>

                <div className="bg-ocean-50 border-2 border-ocean-200 rounded-xl p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <Building2 className="h-6 w-6 text-ocean-600 flex-shrink-0 mt-1" />
                    <div className="text-left">
                      <h3 className="font-semibold text-ocean-900 mb-2">
                        For Organizations Only
                      </h3>
                      <p className="text-sm text-ocean-700">
                        This feature is designed for surf camps, schools, resorts, and businesses looking to hire talented crew members.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={handleSignIn}
                    className="gap-2 px-8"
                  >
                    <Building2 className="h-5 w-5" />
                    Sign in as Organization
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/crew")}
                    className="border-2"
                  >
                    Back to Crew List
                  </Button>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                  Don&apos;t have an organization account?{" "}
                  <a href="/signup" className="text-ocean-600 hover:text-ocean-700 font-medium underline">
                    Create one now
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Authorized - show children
  return <>{children}</>;
}
