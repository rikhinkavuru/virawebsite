import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Wraps next-themes and binds it to the `data-theme` attribute that the existing
 * 34KB hand-CSS already keys off of (`[data-theme="dark"]`). This replaces the
 * hand-rolled useState/localStorage toggle and fixes the latent bug where
 * tailwind.config's `darkMode: ["class"]` never matched `data-theme`, so Tailwind
 * `dark:` variants silently never fired. storageKey matches the prior key so a
 * returning visitor's saved preference carries over.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      storageKey="theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
