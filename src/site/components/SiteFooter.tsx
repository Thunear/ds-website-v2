import { Logo } from "@/shared/ui/Logo";
import styles from "./SiteFooter.module.css";

const COLS = [
  {
    heading: "Om nettstedet",
    links: [
      "Om designsystemet",
      "Personvernerklæring",
      "Tilgjengelighetserklæring",
      "Administrer informasjonskapsler",
    ],
  },
  {
    heading: "Kom i kontakt med oss",
    links: ["designsystem@digdir.no", "Bli med på Slack", "Github", "Figma"],
  },
];

/** Site-wide footer for designsystemet.no. */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo className={styles.logo} />
          <p>
            Designsystemet er en felles verktøykasse med grunnleggende UI-komponenter,
            retningslinjer og mønstre. Det er åpent og gratis for alle.
          </p>
        </div>
        {COLS.map((col) => (
          <nav key={col.heading} className={styles.col}>
            <h3>{col.heading}</h3>
            <ul>
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className={styles.bottom}>
        <span>© 2026 Designsystemet</span>
        <span className={styles.digdir}>Digdir</span>
      </div>
    </footer>
  );
}
