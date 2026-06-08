import { CheckmarkIcon, RocketIcon } from "@/shared/ui/icons";
import styles from "./ThemeShowcase.module.css";

const BARS = [40, 72, 55, 88, 63, 95];

/**
 * A gallery of UI that visibly re-brands with the selected theme — the
 * "see the power of theming" moment (à la shadcn). Everything reads `var(--fb-*)`.
 */
export function ThemeShowcase() {
  return (
    <section className={styles.section} aria-label="Eksempel på temaet i bruk">
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Buttons + badges */}
          <div className={styles.card}>
            <span className={styles.cardLabel}>Knapper</span>
            <div className={styles.buttons}>
              <button className={styles.btnPrimary}>
                Primær <RocketIcon aria-hidden />
              </button>
              <button className={styles.btnSecondary}>Sekundær</button>
              <button className={styles.btnOutline}>Outline</button>
            </div>
            <div className={styles.badges}>
              <span className={styles.badge}>Ny</span>
              <span className={styles.badgeSoft}>Anbefalt</span>
              <span className={styles.badgeSoft}>Stabil</span>
            </div>
          </div>

          {/* Milestone form */}
          <div className={`${styles.card} ${styles.span2}`}>
            <span className={styles.cardLabel}>Sett opp et mål</span>
            <div className={styles.formRow}>
              <label className={styles.field}>
                <span>Navn på mål</span>
                <input className={styles.input} placeholder="F.eks. ny tjeneste" readOnly />
              </label>
              <label className={styles.field}>
                <span>Frist</span>
                <input className={styles.input} placeholder="Des 2026" readOnly />
              </label>
            </div>
            <button className={styles.btnPrimaryWide}>Opprett mål</button>
          </div>

          {/* Analytics */}
          <div className={styles.card}>
            <span className={styles.cardLabel}>Statistikk</span>
            <div className={styles.statRow}>
              <span className={styles.statNum}>418k</span>
              <span className={styles.badge}>+10%</span>
            </div>
            <p className={styles.statSub}>Besøk siste 30 dager</p>
            <svg className={styles.spark} viewBox="0 0 120 40" preserveAspectRatio="none" aria-hidden>
              <polyline
                points="0,32 20,24 40,28 60,14 80,20 100,8 120,12"
                fill="none"
                stroke="var(--fb-accent)"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          {/* Chart + toggle */}
          <div className={styles.card}>
            <span className={styles.cardLabel}>Aktivitet</span>
            <div className={styles.chart}>
              {BARS.map((h, i) => (
                <div key={i} className={styles.bar} style={{ height: `${h}%` }} aria-hidden />
              ))}
            </div>
            <div className={styles.toggleRow}>
              <span>Vis detaljer</span>
              <span className={styles.toggle} aria-hidden>
                <span className={styles.knob} />
              </span>
            </div>
          </div>

          {/* Checklist */}
          <div className={styles.card}>
            <span className={styles.cardLabel}>Kvalitet</span>
            <ul className={styles.list}>
              {["Universelt utformet", "Godt testet", "Åpen kildekode"].map((t) => (
                <li key={t}>
                  <span className={styles.check}>
                    <CheckmarkIcon aria-hidden />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
