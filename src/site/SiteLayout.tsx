import type { CSSProperties } from "react";
import { Outlet } from "react-router-dom";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { frontThemeVars } from "@/shared/theme/frontThemes";
import { SiteHeader } from "@/shared/components/SiteHeader";
import { useFrontTheme } from "./theme/FrontThemeProvider";
import { SiteFooter } from "./components/SiteFooter";
import styles from "./SiteLayout.module.css";

/** Shell for the designsystemet.no main site: shared header + page outlet. */
export function SiteLayout() {
  const { appTheme } = useAppTheme();
  const { theme } = useFrontTheme();
  return (
    <div
      className={styles.site}
      data-app-theme={appTheme}
      // The brand theme is exposed as CSS vars on the whole shell so the header
      // logo re-brands together with the page content.
      style={frontThemeVars(theme) as CSSProperties}
    >
      <SiteHeader transparent />
      <main className={styles.content}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
