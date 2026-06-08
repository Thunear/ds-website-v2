import { useEffect, useRef, type CSSProperties } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import chroma from "chroma-js";
import { useThemeStore } from "@/themebuilder/theme/ThemeStore";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { getFrontTheme } from "@/shared/theme/frontThemes";
import { SiteHeader } from "@/shared/components/SiteHeader";
import { SiteFooter } from "@/shared/components/SiteFooter";
import { ThemeBar } from "./components/ThemeBar";
import { TabNav } from "./components/TabNav";
import styles from "./BuilderLayout.module.css";

/**
 * The active theme's source accent drives the chrome tint: the ThemeBar, the
 * active theme pill, and a soft wash behind the builder card (set as vars on
 * the root so descendants share them).
 */
function chromeVars(accentHex: string, dark: boolean): CSSProperties {
  const accent = chroma(accentHex);
  // The backdrop wash mixes toward the dark page in dark mode (a faint accent
  // glow) instead of toward white, which would read as a stray light band.
  const tint = (amount: number) =>
    dark
      ? chroma.mix(accent, "#0b0e13", amount, "rgb").hex()
      : chroma.mix(accent, "white", amount, "rgb").hex();
  return {
    "--bar-accent": accent.hex(),
    "--bar-on-accent": chroma.contrast(accentHex, "white") >= 4.5 ? "#fff" : "#1a1d21",
    "--bar-tint": tint(dark ? 0.86 : 0.82),
    "--bar-tint-2": tint(dark ? 0.74 : 0.6),
  } as CSSProperties;
}

export function BuilderLayout() {
  const { mode, activeTheme, seedFromPalette } = useThemeStore();
  const { appTheme } = useAppTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const seeded = useRef(false);

  const accentHex =
    activeTheme.colors.find((s) => s.name === "accent")?.hex ?? "#0062BA";

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
    <div
      className={styles.app}
      data-app-theme={appTheme}
      style={chromeVars(accentHex, appTheme === "dark")}
    >
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
      <SiteFooter />
    </div>
  );
}
