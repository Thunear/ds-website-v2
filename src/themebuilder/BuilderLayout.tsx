import { useEffect, useRef } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { useThemeStore } from "@/themebuilder/theme/ThemeStore";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { getFrontTheme } from "@/shared/theme/frontThemes";
import { SiteHeader } from "@/shared/components/SiteHeader";
import { ThemeBar } from "./components/ThemeBar";
import { TabNav } from "./components/TabNav";
import styles from "./BuilderLayout.module.css";

export function BuilderLayout() {
  const { mode, seedFromPalette } = useThemeStore();
  const { appTheme } = useAppTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const seeded = useRef(false);

  // Carry a brand theme picked on the front page into the builder, once.
  useEffect(() => {
    if (seeded.current) return;
    const themeId = searchParams.get("theme");
    if (!themeId) return;
    seeded.current = true;
    const t = getFrontTheme(themeId);
    seedFromPalette(t.label, {
      accent: t.accent,
      brand1: t.brand[0],
      brand2: t.brand[1],
    });
    // Drop the param so a refresh doesn't seed a duplicate theme.
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, seedFromPalette]);

  return (
    // appTheme themes the chrome; the canvas (tabBody) re-pins tokens to `mode`.
    <div className={styles.app} data-app-theme={appTheme}>
      <SiteHeader />
      <ThemeBar />
      <main className={styles.content}>
        {/* The whole builder box follows the mode being designed; the chrome
            around it follows appTheme. */}
        <div className={styles.card} data-mode={mode}>
          <TabNav />
          <div className={styles.tabBody}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
