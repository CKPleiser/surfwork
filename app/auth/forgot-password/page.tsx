/**
 * Forgot Password Page
 * Request password reset link via email
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/auth/signin-actions";
import {
  passwordResetRequestSchema,
  type PasswordResetRequestFormData,
} from "@/lib/validations/signin";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: PasswordResetRequestFormData) => {
    setIsPending(true);
    setError(null);

    const result = await requestPasswordReset(data.email);

    if (!result.success) {
      setError(result.error || "Failed to send reset email");
      setIsPending(false);
      return;
    }

    // Redirect to check-email page
    router.push(result.redirectTo || `/auth/check-email?email=${encodeURIComponent(data.email)}&type=reset`);
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/auth"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset your password
          </h1>
          <p className="text-gray-600">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPending}
            >
              <Mail className="h-4 w-4 mr-2" />
              {isPending ? "Sending link..." : "Send reset link"}
            </Button>
          </form>

          {/* Help Text */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Remember your password?{" "}
              <Link href="/auth" className="text-ocean-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Additional Help */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-2">
              Don&apos;t have an account?
            </p>
            <div className="space-y-1">
              <Link href="/crew/signup" className="text-ocean-600 hover:underline block">
                → Sign up as crew
              </Link>
              <Link href="/organizations/signup" className="text-ocean-600 hover:underline block">
                → Sign up as organization
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
