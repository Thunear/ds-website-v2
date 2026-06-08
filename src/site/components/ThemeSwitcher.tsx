import { useFrontTheme } from "../theme/FrontThemeProvider";
import styles from "./ThemeSwitcher.module.css";

/** Row of brand-theme swatches that re-brand the whole front page on click. */
export function ThemeSwitcher() {
  const { themes, themeId, setThemeId } = useFrontTheme();
  return (
    <div className={styles.wrap}>
      <span className={styles.label}>Prøv et tema</span>
      <div className={styles.swatches} role="group" aria-label="Velg fargetema">
        {themes.map((t) => (
          <button
            key={t.id}
            type="button"
            className={t.id === themeId ? styles.swatchActive : styles.swatch}
            style={{
              background: `linear-gradient(135deg, ${t.accent} 0 50%, ${t.brand[1]} 50% 100%)`,
            }}
            aria-pressed={t.id === themeId}
            aria-label={t.label}
            title={t.label}
            onClick={() => setThemeId(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
