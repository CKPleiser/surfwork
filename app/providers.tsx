"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes - more stable caching
            gcTime: 5 * 60 * 1000, // Cache persists for 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false, // Prevent unnecessary refetches on tab switch
            retry: 1, // Single retry on failure
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-card border rounded-lg p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-destructive mb-2">
                    Something went wrong
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    An error occurred while loading data. Please try again.
                  </p>
                  <pre className="text-xs bg-muted p-3 rounded mb-4 overflow-auto max-h-32">
                    {error.message}
                  </pre>
                  <button
                    onClick={resetErrorBoundary}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
          >
            {children}
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
