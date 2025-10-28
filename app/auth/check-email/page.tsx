/**
 * Check Email Page
 * Confirmation page shown after magic link sent (signup or password reset)
 */

"use client";

import { useSearchParams } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, Suspense } from "react";
import { resendVerificationEmail } from "@/lib/auth/signin-actions";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "signin"; // signin | reset

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    const result = await resendVerificationEmail(email);

    if (result.success) {
      setResendSuccess(true);
    } else {
      setResendError(result.error || "Failed to resend email");
    }

    setIsResending(false);
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-sand-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/auth"
            className="flex items-center gap-2 text-gray-600 hover:text-ocean-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 p-8 sm:p-12 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-ocean-50 border-2 border-ocean-200 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-10 w-10 text-ocean-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Check your email
          </h1>

          {/* Description */}
          {type === "reset" ? (
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          ) : (
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We&apos;ve sent a verification link to{" "}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          )}

          {/* Instructions */}
          <div className="bg-ocean-50 border-2 border-ocean-200 rounded-xl p-6 mb-8 text-left">
            <p className="font-semibold text-ocean-900 mb-3">Next steps:</p>
            <ol className="list-decimal list-inside space-y-2 text-ocean-700">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the link in the email we sent you</li>
              <li>You&apos;ll be automatically signed in</li>
            </ol>
          </div>

          {/* Resend Section */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-base text-gray-700 mb-4 font-medium">
              Didn&apos;t receive the email?
            </p>

            {resendSuccess && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800 font-medium">
                  ✓ Email resent successfully! Check your inbox.
                </p>
              </div>
            )}

            {resendError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-medium">{resendError}</p>
              </div>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={handleResend}
              disabled={isResending || !email || resendSuccess}
              className="border-2"
            >
              {isResending ? "Sending..." : "Resend email"}
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Having trouble?{" "}
              <Link href="/contact" className="text-ocean-600 hover:text-ocean-700 font-medium underline">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-12 bg-gradient-to-b from-sand-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 p-8 sm:p-12 text-center">
            <div className="animate-pulse">
              <div className="mx-auto w-20 h-20 bg-gray-200 rounded-full mb-6" />
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4" />
              <div className="h-6 bg-gray-200 rounded w-64 mx-auto mb-8" />
            </div>
          </div>
        </div>
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}
