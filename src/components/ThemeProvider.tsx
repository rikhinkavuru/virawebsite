import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Wraps next-themes and binds it to the `data-theme` attribute that the existing
 * 34KB hand-CSS already keys off of (`[data-theme="dark"]`). This replaces the
 * hand-rolled useState/localStorage toggle and fixes the latent bug where
 * tailwind.config's `darkMode: ["class"]` never matched `data-theme`, so Tailwind
 * `dark:` variants silently never fired.
 *
 * storageKey is intentionally bumped (was "theme") so any stale saved "light"
 * preference from earlier builds is ignored and everyone lands on the dark
 * default on load; the toggle still persists choices under the new key.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="vira-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
