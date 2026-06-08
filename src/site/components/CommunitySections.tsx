import { Link } from "react-router-dom";
import { GlobeIcon, CopyIcon, PlusIcon } from "@/shared/ui/icons";
import { Logo } from "@/shared/ui/Logo";
import { useFrontTheme } from "../theme/FrontThemeProvider";
import styles from "./CommunitySections.module.css";

const NEWS = [
  {
    tag: "Bloggen",
    title: "Nå kan du bruke Designsystemet uavhengig av rammeverk",
    text: "@digdir/designsystemet-web er lansert.",
  },
  {
    tag: "Bloggen",
    title: "Store samfunnsgevinster med Designsystemet",
    text: "En ny samfunnsøkonomisk analyse viser tydelig verdi – både i frigjort tid og kvalitet.",
  },
  {
    tag: "Bloggen",
    title: "@digdir/designsystemet-web prerelease 2",
    text: "Andre prerelease av pakken, som gjør det mulig å bruke Designsystemet uten React.",
  },
];

const PARTNERS = [
  "Digdir",
  "Mattilsynet",
  "KS Digital",
  "Utdanningsdirektoratet",
  "Brønnøysundregistrene",
];

export function CommunitySections() {
  const { themeId } = useFrontTheme();
  return (
    <>
      {/* Siste nytt -------------------------------------------------------- */}
      <section className={styles.newsBand}>
        <div className={styles.inner}>
          <h2 className={styles.bandHeading}>Siste nytt fra Designsystemet</h2>
          <div className={styles.newsGrid}>
            {NEWS.map((n) => (
              <article key={n.title} className={styles.newsCard}>
                <div className={styles.newsArt} aria-hidden />
                <div className={styles.newsBody}>
                  <span className={styles.tag}>{n.tag}</span>
                  <h3 className={styles.newsTitle}>{n.title}</h3>
                  <p className={styles.newsText}>{n.text}</p>
                  <span className={styles.author}>
                    <span className={styles.authorDot} aria-hidden />
                    Designsystemet
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Lages på tvers ---------------------------------------------------- */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <h2 className={styles.bandHeading}>Lages på tvers av virksomheter</h2>
          <p className={styles.bandLead}>
            Et felles løft for bedre brukeropplevelser på tvers. Sammen utvikler vi et
            felles fundament for gode, tilgjengelige og helhetlige digitale løsninger.
          </p>
          <div className={styles.partners}>
            {PARTNERS.map((p) => (
              <div key={p} className={styles.partner}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bli med ----------------------------------------------------------- */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.join}>
            <Logo className={styles.joinLogo} />
            <div className={styles.joinBody}>
              <h2>Bli med å utvikle Designsystemet!</h2>
              <p>
                Ved å samarbeide kan vi lage mer gjenkjennelige brukeropplevelser på
                tvers av offentlig sektor – og spare oss for å gjøre de samme oppgavene
                flere ganger. Vil du høre mer eller hjelpe til? Ta kontakt med oss!
              </p>
              <div className={styles.joinLinks}>
                <Link to={`/temabygger?theme=${themeId}`} className={styles.joinLink}>
                  <PlusIcon aria-hidden /> Bli med på Slack
                </Link>
                <a href="#" className={styles.joinLink}>
                  <CopyIcon aria-hidden /> Bidra på GitHub
                </a>
                <a href="#" className={styles.joinLink}>
                  <GlobeIcon aria-hidden /> Send en epost
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
