"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function AuthPageContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  const redirectTo = searchParams.get("redirect") || "/onboarding";

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // User is already logged in, check onboarding status
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();

        if (profile?.onboarding_completed) {
          router.push(redirectTo === "/onboarding" ? "/dashboard" : redirectTo);
        } else {
          router.push("/onboarding");
        }
      } else {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Check onboarding status
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();

        if (profile?.onboarding_completed) {
          router.push(redirectTo === "/onboarding" ? "/dashboard" : redirectTo);
        } else {
          router.push("/onboarding");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Auth Form */}
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-ocean-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-ocean bg-clip-text text-transparent">
                Welcome to Surf Work
              </h1>
              <p className="text-muted-foreground text-lg">
                Sign in to post jobs or create your coach profile
              </p>
            </div>

            {/* Auth UI Card */}
            <div className="bg-white rounded-xl border-2 border-border p-8">
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: "rgb(14 116 144)",
                        brandAccent: "rgb(8 145 178)",
                        brandButtonText: "white",
                        defaultButtonBackground: "#FAFAF8",
                        defaultButtonBackgroundHover: "#F0F9FF",
                        inputBackground: "white",
                        inputBorder: "#E0E7EF",
                        inputBorderHover: "rgb(14 116 144)",
                        inputBorderFocus: "rgb(8 145 178)",
                      },
                      space: {
                        spaceSmall: "4px",
                        spaceMedium: "8px",
                        spaceLarge: "16px",
                        labelBottomMargin: "8px",
                        anchorBottomMargin: "4px",
                        emailInputSpacing: "4px",
                        socialAuthSpacing: "4px",
                        buttonPadding: "10px 15px",
                        inputPadding: "10px 15px",
                      },
                      fontSizes: {
                        baseBodySize: "14px",
                        baseInputSize: "14px",
                        baseLabelSize: "14px",
                        baseButtonSize: "14px",
                      },
                      borderWidths: {
                        buttonBorderWidth: "2px",
                        inputBorderWidth: "2px",
                      },
                      radii: {
                        borderRadiusButton: "0.5rem",
                        buttonBorderRadius: "0.5rem",
                        inputBorderRadius: "0.5rem",
                      },
                    },
                  },
                  className: {
                    container: "space-y-4",
                    button: "font-semibold",
                    input: "font-normal",
                    label: "font-medium",
                  },
                }}
                providers={[]}
                redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`}
                magicLink={true}
                view="sign_in"
                showLinks={true}
                localization={{
                  variables: {
                    sign_in: {
                      email_label: "Email",
                      password_label: "Password",
                      email_input_placeholder: "Your email address",
                      password_input_placeholder: "Your password",
                      button_label: "Sign in",
                      loading_button_label: "Signing in ...",
                      link_text: "Already have an account? Sign in",
                    },
                    sign_up: {
                      email_label: "Email",
                      password_label: "Password",
                      email_input_placeholder: "Your email address",
                      password_input_placeholder: "Create a password",
                      button_label: "Sign up",
                      loading_button_label: "Signing up ...",
                      link_text: "Don't have an account? Sign up",
                    },
                    magic_link: {
                      email_input_label: "Email address",
                      email_input_placeholder: "Your email address",
                      button_label: "Send Magic Link",
                      loading_button_label: "Sending Magic Link ...",
                      link_text: "Send a magic link email",
                    },
                    forgotten_password: {
                      email_label: "Email address",
                      password_label: "Your Password",
                      email_input_placeholder: "Your email address",
                      button_label: "Send reset password instructions",
                      loading_button_label: "Sending reset instructions ...",
                      link_text: "Forgot your password?",
                    },
                  },
                }}
              />
            </div>

            {/* Footer Note */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              By signing up, you agree to keep the platform spam-free and authentic
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Ocean Photo with Testimonial */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-ocean">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1502680390469-be75c86b636f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-ocean-600/80 via-ocean-500/70 to-ocean-400/60" />
        </div>

        {/* Testimonial Card */}
        <div className="relative z-10 flex flex-col justify-end p-12 w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20 shadow-2xl">
            <div className="mb-6">
              <svg className="h-10 w-10 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <p className="text-white text-xl font-medium leading-relaxed mb-6">
              Finding qualified surf coaches has never been easier. Surf Work connected us with amazing instructors who share our passion for the ocean.
            </p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                M
              </div>
              <div>
                <p className="text-white font-semibold">Maria Santos</p>
                <p className="text-white/80 text-sm">Surf Camp Director, Ericeira</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
