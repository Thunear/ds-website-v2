import { Link } from "react-router-dom";
import { ArrowRightIcon, PaletteIcon, RocketIcon, SquareIcon } from "@/shared/ui/icons";
import { useFrontTheme } from "../theme/FrontThemeProvider";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { ThemeShowcase } from "../components/ThemeShowcase";
import { FeatureSections } from "../components/FeatureSections";
import { CommunitySections } from "../components/CommunitySections";
import { Confetti } from "../components/Confetti";
import styles from "./FrontPage.module.css";

const CARDS = [
  {
    title: "Kom i gang",
    text: "Lær hvordan du kommer i gang med Designsystemet.",
    Icon: RocketIcon,
    to: "/kom-i-gang",
  },
  {
    title: "Komponenter",
    text: "Se oversikten over rammeverkuavhengige UI-komponenter.",
    Icon: SquareIcon,
    to: "/komponenter",
  },
  {
    title: "Mønstre",
    text: "Forstå hvordan felles mønstre gir gjenkjennelige brukeropplevelser.",
    Icon: PaletteIcon,
    to: "/monstre",
  },
];

/**
 * designsystemet.no front page. Leads with the theming idea — pick a brand
 * theme and watch the whole site (and a gallery of UI) re-brand — then continues
 * into the regular site content.
 */
export function FrontPage() {
  const { themeId } = useFrontTheme();
  return (
    <div className={styles.page}>
      {/* Hero + theme picker */}
      <section className={styles.hero}>
        <Confetti />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Bygget for fleksibilitet</p>
          <h1 className={styles.title}>
            Fundamentet for ditt eget designsystem
          </h1>
          <p className={styles.lead}>
            Et sett gjennomtenkte komponenter og mønstre du kan tilpasse, utvide og
            bygge videre på. Bruk mindre tid på grunnmuren og mer på det som gjør dere
            unike. Bytt mellom temaene under og se hvordan det samme systemet kan se
            helt ulikt ut.
          </p>

          <div className={styles.cta}>
            <ThemeSwitcher />
            <Link to={`/temabygger?theme=${themeId}`} className={styles.ctaPrimary}>
              Bygg ditt eget <ArrowRightIcon aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* shadcn-style overview of themed UI */}
      <ThemeShowcase />

      {/* The three main entry cards, now further down */}
      <section className={styles.cardsWrap}>
        <div className={styles.cardsHeader}>
          <h2 className={styles.cardsTitle}>Hva kan vi hjelpe deg med i dag?</h2>
          <p className={styles.cardsLead}>
            Kom i gang, utforsk komponentene eller lær mønstrene bak gode tjenester.
          </p>
        </div>
        <div className={styles.cards}>
          {CARDS.map((c) => (
            <Link key={c.title} to={c.to} className={styles.card}>
              <span className={styles.cardIcon}>
                <c.Icon aria-hidden />
              </span>
              <h2 className={styles.cardTitle}>{c.title}</h2>
              <p className={styles.cardText}>{c.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Regular site content */}
      <FeatureSections />
      <CommunitySections />
    </div>
  );
}
