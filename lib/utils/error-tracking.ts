/**
 * Error Tracking Utility
 * Centralized error logging and tracking for production
 */

interface ErrorContext {
  [key: string]: unknown;
}

class ErrorTracker {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * Log an error with context
   */
  logError(error: unknown, context?: ErrorContext): void {
    // In development, always log to console
    if (this.isDevelopment) {
      console.error("[Error]", error, context || "");
      return;
    }

    // In production, send to error tracking service
    // TODO: Integrate with Sentry, LogRocket, or similar service
    // For now, silently fail in production
    try {
      // Future integration point:
      // Sentry.captureException(error, { extra: context });
    } catch (e) {
      // Fail silently to avoid breaking the app
    }
  }

  /**
   * Log a warning with context
   */
  logWarning(message: string, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.warn("[Warning]", message, context || "");
      return;
    }

    // In production, warnings might be logged differently
    // or not at all depending on severity
  }

  /**
   * Log info message (development only)
   */
  logInfo(message: string, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.log("[Info]", message, context || "");
    }
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();
