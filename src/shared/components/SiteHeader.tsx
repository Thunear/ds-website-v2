import { NavLink } from "react-router-dom";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { GlobeIcon, MoonIcon, SearchIcon, SunIcon } from "@/shared/ui/icons";
import { Logo } from "@/shared/ui/Logo";
import styles from "./SiteHeader.module.css";

/**
 * Top-level navigation shared by both sites. "Temabygger" enters the theme
 * builder; every other entry leads into the designsystemet.no main site.
 */
const NAV: { label: string; to: string; end?: boolean }[] = [
  { label: "Intro", to: "/intro" },
  { label: "Kom i gang", to: "/kom-i-gang" },
  { label: "Komponenter", to: "/komponenter" },
  { label: "Mønstre", to: "/monstre" },
  { label: "God praksis", to: "/god-praksis" },
  { label: "Blogg", to: "/blogg" },
  { label: "Temabygger", to: "/temabygger" },
];

/** The full-width design-system site header, shared across both sites. */
export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const { appTheme, setAppTheme } = useAppTheme();
  return (
    <header className={transparent ? `${styles.header} ${styles.transparent}` : styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand} aria-label="Designsystemet">
          <Logo className={styles.logo} />
        </NavLink>

        {/* Everything else is grouped on the right. */}
        <div className={styles.right}>
          <nav className={styles.nav}>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? styles.active : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            <button className={styles.searchBtn}>
              <SearchIcon aria-hidden /> Søk
            </button>
            <button className={styles.iconBtn}>
              <GlobeIcon aria-hidden /> Language
            </button>
            <button
              className={styles.iconBtn}
              aria-label="Bytt mellom lyst og mørkt grensesnitt"
              aria-pressed={appTheme === "dark"}
              onClick={() => setAppTheme(appTheme === "dark" ? "light" : "dark")}
            >
              {appTheme === "dark" ? <MoonIcon aria-hidden /> : <SunIcon aria-hidden />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
