/**
 * Reusable Error Message Component
 * Displays user-friendly error messages with optional retry action
 */

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: "default" | "destructive";
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  variant = "destructive",
}: ErrorMessageProps) {
  return (
    <Alert variant={variant} className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-3"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
