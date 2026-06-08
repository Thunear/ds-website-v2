import type { ReactNode } from "react";
import { useThemeStore } from "@/themebuilder/theme/ThemeStore";
import {
  RADIUS_PRESETS,
  RADIUS_VARS,
  isCapped,
  matchPreset,
  radiusByLabel,
  radiusValue,
} from "@/themebuilder/theme/borderRadius";
import { Logo } from "@/shared/ui/Logo";
import styles from "./BorderRadiusPage.module.css";

export function BorderRadiusPage() {
  const { activeTheme, setBorderRadius } = useThemeStore();
  const base = activeTheme.borderRadius;
  const active = matchPreset(base);

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div className={styles.head}>
          <h2>Border-radius</h2>
          <p className={styles.lead}>
            Velg hvor rund temaet ditt skal være. Et preset setter én base-verdi,
            og vi genererer seks variabler ut fra den — med maksgrenser som
            holder hierarkiet på plass: store flater rundes mer enn små.
          </p>
        </div>

        <div className={styles.infoCard}>
          <Logo className={styles.infoLogo} />
          <div>
            <strong>Hvordan fungerer border-radius?</strong>
            <p>
              Når du setter en base-verdi genererer vi en skala for deg. Hver
              variabel har en formel av base og en maksgrense, slik at vi unngår
              at f.eks. avkrysningsbokser blir helt runde mens store paneler bare
              er litt avrundet. Maksgrensene kan endres i tokenstrukturen om du
              ønsker.
            </p>
          </div>
        </div>
      </div>

      {/* Preset picker */}
      <section className={styles.section}>
        <h3>Velg avrunding</h3>
        <p className={styles.sub}>
          Presetet setter base-verdien hele skalaen genereres fra. Du kan også
          skrive inn en egendefinert base.
        </p>
        <div className={styles.presetRow}>
          {RADIUS_PRESETS.map((p) => (
            <button
              key={p.name}
              className={active?.name === p.name ? styles.presetActive : styles.preset}
              onClick={() => setBorderRadius(p.base)}
            >
              <span
                className={styles.presetSwatch}
                style={{ borderRadius: Math.min(p.base, 20) }}
              />
              <span className={styles.presetName}>{p.name}</span>
              <span className={styles.presetVal}>{p.base}px</span>
            </button>
          ))}
          <label className={styles.baseField}>
            <span>Egendefinert base</span>
            <input
              type="number"
              min={0}
              value={base}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      {/* Examples first — immediate visual feedback when switching preset */}
      <section className={styles.section}>
        <h3>Se det i praksis</h3>
        <p className={styles.sub}>
          Bytt preset over og se hvordan flatene endrer seg. Større flater rundes
          mer enn små, knapper kan bli helt runde, og input-felter bremses ved
          8px.
        </p>
        <ComponentGallery base={base} />
        <div className={styles.previewGrid}>
          <HierarchyPreview base={base} />
          <FormPreview base={base} />
        </div>
      </section>

      {/* The six variables, at the bottom as the underlying "fasit" */}
      <section className={styles.section}>
        <h3>Variablene</h3>
        <p className={styles.sub}>
          Slik regnes hvert steg ut fra base = {base}px. Når en formel passerer
          maksgrensen, bremses verdien — det er slik input-felter holdes rolige
          selv om knapper kan bli helt runde.
        </p>
        <div className={styles.varList}>
          {RADIUS_VARS.map((v) => {
            const px = radiusValue(v, base);
            const capped = isCapped(v, base);
            return (
              <div key={v.name} className={styles.varCard}>
                <div className={styles.varInfo}>
                  <span className={styles.varName}>{v.name}</span>
                  <div className={styles.varChips}>
                    <span className={styles.chip}>{v.formula}</span>
                    <span
                      className={`${styles.chip} ${capped ? styles.chipCap : ""}`}
                    >
                      {v.maxLabel}
                    </span>
                  </div>
                  <p className={styles.varDesc}>{v.description}</p>
                </div>
                <div className={styles.varDemo}>
                  <span className={styles.varPx}>{px}px</span>
                  <span
                    className={styles.demoBox}
                    style={{ borderRadius: Math.min(px, 48) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** A strip of real UI elements that all visibly respond to the preset at once. */
function ComponentGallery({ base }: { base: number }) {
  const sm = radiusByLabel("sm", base);
  const md = radiusByLabel("md", base);
  const def = radiusByLabel("default", base);
  const full = radiusByLabel("full", base);
  return (
    <div className={styles.gallery}>
      <Tile label="Knapp · default" sub={`${def}px`}>
        <button className={styles.galBtn} style={{ borderRadius: def }}>
          Lagre
        </button>
      </Tile>
      <Tile label="Input · md" sub={`${md}px`}>
        <div className={styles.galInput} style={{ borderRadius: md }}>
          Søk …
        </div>
      </Tile>
      <Tile label="Avkrysning · sm" sub={`${sm}px`}>
        <span className={styles.galCheck} style={{ borderRadius: sm }} />
      </Tile>
      <Tile label="Avatar · full" sub="rund">
        <span className={styles.galAvatar} style={{ borderRadius: full }}>
          ON
        </span>
      </Tile>
      <Tile label="Merke · full" sub="rund">
        <span className={styles.galBadge} style={{ borderRadius: full }}>
          Ny
        </span>
      </Tile>
    </div>
  );
}

function Tile({
  label,
  sub,
  children,
}: {
  label: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.tile}>
      <div className={styles.tileStage}>{children}</div>
      <span className={styles.tileLabel}>{label}</span>
      <span className={styles.tileSub}>{sub}</span>
    </div>
  );
}

/** Panel ⊃ card ⊃ tag — three nesting levels, each a smaller radius variable. */
function HierarchyPreview({ base }: { base: number }) {
  const xl = radiusByLabel("xl", base);
  const lg = radiusByLabel("lg", base);
  const sm = radiusByLabel("sm", base);
  return (
    <div className={styles.previewCol}>
      <span className={styles.previewTitle}>Hierarki</span>
      <div className={styles.panel} style={{ borderRadius: xl }}>
        <span className={styles.annotate}>Panel · xl · {xl}px</span>
        <div className={styles.card} style={{ borderRadius: lg }}>
          <span className={styles.annotate}>Kort · lg · {lg}px</span>
          <div className={styles.cardRow}>
            <span className={styles.tag} style={{ borderRadius: sm }}>
              Tag
            </span>
            <span className={styles.tagLabel}>sm · {sm}px</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Login form: container (lg), inputs (md, capped), round button (full). */
function FormPreview({ base }: { base: number }) {
  const lg = radiusByLabel("lg", base);
  const md = radiusByLabel("md", base);
  const def = radiusByLabel("default", base);
  return (
    <div className={styles.previewCol}>
      <span className={styles.previewTitle}>Skjema</span>
      <div className={styles.form} style={{ borderRadius: lg }}>
        <span className={styles.formTitle}>Logg inn i portalen</span>
        <label className={styles.formField}>
          <span>Navn</span>
          <span className={styles.input} style={{ borderRadius: md }}>
            Ola Normann
          </span>
        </label>
        <label className={styles.formField}>
          <span>Passord</span>
          <span className={styles.input} style={{ borderRadius: md }}>
            ••••••••
          </span>
        </label>
        <a className={styles.link}>Glemt passord?</a>
        <button className={styles.submit} style={{ borderRadius: def }}>
          Logg inn
        </button>
      </div>
      <span className={styles.annotate}>
        Skjema lg · {lg}px · felt md · {md}px · knapp default · {def}px
      </span>
    </div>
  );
}
