import { NavLink } from "react-router-dom";
import { useThemeStore } from "@/theme/ThemeStore";
import {
  EyeIcon,
  ExpandIcon,
  FileTextIcon,
  PaletteIcon,
  RocketIcon,
  SquareIcon,
} from "@/components/ui/icons";
import styles from "./TabNav.module.css";

const TABS = [
  { to: "/farger", n: 1, label: "Farger", Icon: PaletteIcon },
  { to: "/typografi", n: 2, label: "Typografi", Icon: FileTextIcon },
  { to: "/radius", n: 3, label: "Radius", Icon: SquareIcon },
  { to: "/storrelser", n: 4, label: "Størrelser", Icon: ExpandIcon },
  { to: "/oppsummering", n: 5, label: "Oppsummering", Icon: EyeIcon },
  { to: "/ta-i-bruk", n: 6, label: "Ta i bruk", Icon: RocketIcon },
];

export function TabNav() {
  const { mode, setMode } = useThemeStore();

  return (
    <div className={styles.row}>
      <nav className={styles.tabs}>
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              isActive ? styles.tabActive : styles.tab
            }
          >
            <span className={styles.num}>{t.n}</span>
            <t.Icon aria-hidden />
            {t.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.modeToggle} role="group" aria-label="Fargemodus">
        <button
          className={mode === "light" ? styles.modeActive : styles.modeBtn}
          onClick={() => setMode("light")}
        >
          Lys modus
        </button>
        <button
          className={mode === "dark" ? styles.modeActive : styles.modeBtn}
          onClick={() => setMode("dark")}
        >
          Mørk modus
        </button>
      </div>
    </div>
  );
}
