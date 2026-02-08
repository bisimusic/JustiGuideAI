"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UTMFormInjector } from "@/components/UTMFormInjector";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - prevent constant refetching
        gcTime: 10 * 60 * 1000, // 10 minutes - keep data in cache
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnMount: false, // Don't refetch on component mount if data exists (can be overridden per query)
        refetchOnReconnect: false, // Don't refetch on reconnect
        refetchInterval: false, // Disable automatic polling
        retry: 1, // Allow 1 retry for failed requests
        throwOnError: false, // Don't throw errors, return error state instead
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <TooltipProvider>
          <UTMFormInjector>
            {children}
            <Toaster />
          </UTMFormInjector>
        </TooltipProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}
