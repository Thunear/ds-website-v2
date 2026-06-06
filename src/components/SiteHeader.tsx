import { useThemeStore } from "@/theme/ThemeStore";
import { GlobeIcon, MoonIcon, SunIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import styles from "./SiteHeader.module.css";

const NAV = [
  "Grunnleggende",
  "God praksis",
  "Mønstre",
  "Bloggen",
  "Komponenter",
  "Temabygger",
];

/** The full-width design-system site header (mostly chrome, not interactive yet). */
export function SiteHeader() {
  const { appTheme, setAppTheme } = useThemeStore();
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="#" className={styles.brand} aria-label="Designsystemet">
          <Logo className={styles.logo} />
        </a>
        <nav className={styles.nav}>
          {NAV.map((item) => (
            <a
              key={item}
              href="#"
              className={item === "Temabygger" ? styles.active : undefined}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            aria-label="Bytt mellom lyst og mørkt grensesnitt"
            aria-pressed={appTheme === "dark"}
            onClick={() => setAppTheme(appTheme === "dark" ? "light" : "dark")}
          >
            {appTheme === "dark" ? <MoonIcon aria-hidden /> : <SunIcon aria-hidden />}
          </button>
          <button className={styles.iconBtn}>
            <GlobeIcon aria-hidden /> Language
          </button>
        </div>
      </div>
    </header>
  );
}
