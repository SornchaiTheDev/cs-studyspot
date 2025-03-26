"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

// DevTools are loaded dynamically to prevent build issues
let ReactQueryDevtools: any;
if (process.env.NODE_ENV !== "production") {
  try {
    // Dynamic import for dev tools
    import("@tanstack/react-query-devtools").then((module) => {
      ReactQueryDevtools = module.ReactQueryDevtools;
    });
  } catch (e) {
    console.log("React Query DevTools not available");
  }
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {ReactQueryDevtools && process.env.NODE_ENV !== "production" && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
} 