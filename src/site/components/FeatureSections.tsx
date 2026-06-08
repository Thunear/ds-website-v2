import { Link } from "react-router-dom";
import { useFrontTheme } from "../theme/FrontThemeProvider";
import styles from "./FeatureSections.module.css";

/** Themed mock illustration: a toolbox with brand-coloured cards. */
function ToolboxArt() {
  return (
    <div className={styles.art} aria-hidden>
      <div className={styles.toolbox}>
        <span className={`${styles.tool} ${styles.tool1}`} />
        <span className={`${styles.tool} ${styles.tool2}`} />
        <span className={`${styles.tool} ${styles.tool3}`} />
        <div className={styles.toolboxFront} />
      </div>
    </div>
  );
}

/** Themed mock of a component panel. */
function ComponentArt() {
  return (
    <div className={styles.art} aria-hidden>
      <div className={styles.panel}>
        <div className={styles.panelRow}>
          <span className={styles.chip} />
          <span className={`${styles.chip} ${styles.chipSoft}`} />
        </div>
        <span className={styles.line} />
        <span className={`${styles.line} ${styles.lineShort}`} />
        <div className={styles.panelRow}>
          <span className={styles.btnArt} />
          <span className={styles.checkbox} />
        </div>
      </div>
    </div>
  );
}

/** Themed mock of the "set up theme" tool. */
function ThemeArt() {
  return (
    <div className={styles.art} aria-hidden>
      <div className={styles.panel}>
        <span className={styles.cardLabelArt}>Sett opp tema</span>
        <div className={styles.dots}>
          <span style={{ background: "var(--fb-accent)" }} />
          <span style={{ background: "var(--fb-shape-2)" }} />
          <span style={{ background: "var(--fb-shape-3)" }} />
          <span style={{ background: "var(--fb-shape-4)" }} />
        </div>
        <div className={styles.previewRow}>
          <span className={styles.swatchArt} style={{ background: "var(--fb-accent)" }} />
          <span className={styles.swatchArt} style={{ background: "var(--fb-accent-tint)" }} />
          <span className={styles.swatchArt} style={{ background: "var(--fb-shape-2)" }} />
        </div>
        <span className={styles.line} />
        <span className={`${styles.line} ${styles.lineShort}`} />
      </div>
    </div>
  );
}

export function FeatureSections() {
  const { themeId } = useFrontTheme();
  return (
    <div className={styles.wrap}>
      <section className={styles.feature}>
        <ToolboxArt />
        <div className={styles.text}>
          <h2>En felles digital verktøykasse</h2>
          <p>
            Designsystemet er en felles verktøykasse med UI-komponenter og
            retningslinjer for utvikling av digitale tjenester. Det er gratis, brukes
            sammen med virksomhetens egen visuelle profil og bidrar til effektiv
            produktutvikling og helhetlige brukeropplevelser.
          </p>
          <Link to="/kom-i-gang" className={styles.link}>
            Les mer om Designsystemet
          </Link>
        </div>
      </section>

      <section className={`${styles.feature} ${styles.reverse}`}>
        <ComponentArt />
        <div className={styles.text}>
          <h2>Tilgjengelige og fleksible komponenter</h2>
          <p>
            Når vi lager de mest grunnleggende komponentene bare én gang, sikrer vi god
            kvalitet og ivaretar krav til universell utforming. Komponentene finnes for
            Figma, CSS og React, og kan settes sammen på mange måter.
          </p>
          <Link to="/komponenter" className={styles.link}>
            Les mer om universell utforming
          </Link>
        </div>
      </section>

      <section className={styles.feature}>
        <ThemeArt />
        <div className={styles.text}>
          <h2>Bruk egne tema</h2>
          <p>
            Designsystemet støtter ulike identiteter gjennom tema. På den måten kan alle
            ta utgangspunkt i samme designsystem, men tilpasse til ulike
            avsenderidentiteter – akkurat som denne siden gjør nå.
          </p>
          <Link to={`/temabygger?theme=${themeId}`} className={styles.linkBtn}>
            Bygg ditt tema
          </Link>
        </div>
      </section>
    </div>
  );
}
