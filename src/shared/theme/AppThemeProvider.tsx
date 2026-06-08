import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/** Light/dark for the site chrome (header, page frame) — shared by both sites. */
export type AppTheme = "light" | "dark";

interface AppThemeContextValue {
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
}

const STORAGE_KEY = "ds.appTheme";

const Ctx = createContext<AppThemeContextValue | null>(null);

function load(): AppTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    // ignore unavailable/corrupt storage
  }
  return "light";
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [appTheme, setAppThemeState] = useState<AppTheme>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, appTheme);
    } catch {
      // ignore unavailable storage
    }
  }, [appTheme]);

  const setAppTheme = useCallback((theme: AppTheme) => setAppThemeState(theme), []);

  return (
    <Ctx.Provider value={{ appTheme, setAppTheme }}>{children}</Ctx.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppTheme must be used within AppThemeProvider");
  return ctx;
}
