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
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
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
