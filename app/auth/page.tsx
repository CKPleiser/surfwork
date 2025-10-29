/**
 * Signin Page
 * Unified signin for crew and organization accounts
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signInWithPassword, signInWithMagicLink } from "@/lib/auth/signin-actions";
import { lookupEmail } from "@/lib/utils/email-lookup";
import { signinSchema, type SigninFormData } from "@/lib/validations/signin";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const urlError = searchParams.get("error");
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [isMagicLinkMode, setIsMagicLinkMode] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [accountExists, setAccountExists] = useState<boolean | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(urlError);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const emailValue = watch("email");

  // Check if email exists when user stops typing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (emailValue && emailValue.includes("@") && emailValue.includes(".")) {
        setIsCheckingEmail(true);
        const result = await lookupEmail(emailValue);
        setAccountExists(result.exists);
        setIsCheckingEmail(false);

        // If account doesn't exist, show helpful message
        if (!result.exists) {
          setError(null);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [emailValue]);

  const onSubmitPassword = async (data: SigninFormData) => {
    setIsPending(true);
    setError(null);

    try {
      const result = await signInWithPassword(data.email, data.password, data.rememberMe || false);

      if (!result.success) {
        setError(result.error || "Sign in failed");
        setIsPending(false);
        return;
      }

      // Invalidate and refetch user data to ensure React Query has latest auth state
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.current() });

      // Redirect to intended page or dashboard
      router.push(result.redirectTo || redirectTo);
    } catch (error) {
      console.error("Signin error:", error);
      setError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  };

  const onSubmitMagicLink = async () => {
    if (!emailValue) {
      setError("Please enter your email address");
      return;
    }

    setIsPending(true);
    setError(null);

    const result = await signInWithMagicLink(emailValue);

    if (!result.success) {
      setError(result.error || "Failed to send magic link");
      setIsPending(false);
      return;
    }

    // Redirect to check email page
    router.push(result.redirectTo || "/auth/check-email");
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
            {/* Email Input */}
            <div>
              <Label htmlFor="email">Email address *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1"
                placeholder="your@email.com"
                autoComplete="email"
                disabled={isPasswordMode || isMagicLinkMode}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
              {isCheckingEmail && (
                <p className="text-xs text-gray-500 mt-1">
                  Checking account...
                </p>
              )}
              {accountExists === false && emailValue && !isCheckingEmail && (
                <p className="text-sm text-amber-600 mt-1">
                  No account found with this email.{" "}
                  <Link href="/crew/signup" className="text-ocean-600 hover:underline">
                    Sign up as crew
                  </Link>{" "}
                  or{" "}
                  <Link href="/organizations/signup" className="text-ocean-600 hover:underline">
                    organization
                  </Link>
                  ?
                </p>
              )}
            </div>

            {/* Password Input (shown when in password mode or account exists) */}
            {(isPasswordMode || (accountExists && !isMagicLinkMode)) && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password *</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-ocean-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}

            {/* Remember Me */}
            {(isPasswordMode || (accountExists && !isMagicLinkMode)) && (
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" {...register("rememberMe")} />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Remember me for 30 days
                </label>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Sign In Button (Password) */}
            {(isPasswordMode || (accountExists && !isMagicLinkMode)) && (
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isPending || accountExists === false}
              >
                {isPending ? "Signing in..." : "Sign in"}
              </Button>
            )}
          </form>

          {/* Magic Link Option */}
          {!isPasswordMode && (
            <div className="space-y-4">
              {accountExists && !isMagicLinkMode && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>
              )}

              {!isMagicLinkMode && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setIsMagicLinkMode(true);
                    setIsPasswordMode(false);
                  }}
                  disabled={!accountExists || isPending}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Sign in with magic link
                </Button>
              )}

              {isMagicLinkMode && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    We&apos;ll send you a magic link to sign in without a password.
                  </p>
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={onSubmitMagicLink}
                    disabled={isPending || !emailValue}
                  >
                    {isPending ? "Sending link..." : "Send magic link"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setIsMagicLinkMode(false);
                      setIsPasswordMode(true);
                    }}
                  >
                    Use password instead
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Don't have an account */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Don&apos;t have an account?{" "}
              <Link href="/crew/signup" className="text-ocean-600 hover:underline font-medium">
                Sign up as crew
              </Link>{" "}
              or{" "}
              <Link href="/organizations/signup" className="text-ocean-600 hover:underline font-medium">
                organization
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
            <div className="space-y-4 animate-pulse">
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    }>
      <SigninContent />
    </Suspense>
  );
}
