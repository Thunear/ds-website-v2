import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_FRONT_THEME,
  FRONT_THEMES,
  getFrontTheme,
  type FrontTheme,
} from "@/shared/theme/frontThemes";

interface FrontThemeContextValue {
  themeId: string;
  setThemeId: (id: string) => void;
  theme: FrontTheme;
  themes: FrontTheme[];
}

const Ctx = createContext<FrontThemeContextValue | null>(null);

/** Holds the selected front-page brand theme for the whole designsystemet.no site. */
export function FrontThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(DEFAULT_FRONT_THEME.id);
  const value = useMemo<FrontThemeContextValue>(
    () => ({ themeId, setThemeId, theme: getFrontTheme(themeId), themes: FRONT_THEMES }),
    [themeId],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFrontTheme(): FrontThemeContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFrontTheme must be used within FrontThemeProvider");
  return ctx;
}
