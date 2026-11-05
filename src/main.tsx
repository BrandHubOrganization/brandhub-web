import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import "./globals.css";
import { i18nReady } from "./i18n";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/theme-provider";

// Wait for the language chunk so the first paint shows text, not translation keys.
void i18nReady.finally(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
});
