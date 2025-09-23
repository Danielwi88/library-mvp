import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { Router } from "@/app/router";
import "@/index.css";

const qc = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 30_000 },
    mutations: { retry: 0 }
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <QueryClientProvider client={qc}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Router />
          <Toaster richColors />
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  </React.StrictMode>
);