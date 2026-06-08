import { useState } from "react";
import { useThemeStore } from "@/theme/ThemeStore";
import { SIZE_TOKENS } from "@/theme/config";
import { sizeValue } from "@/theme/sizing";
import { Logo } from "@/components/ui/Logo";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import styles from "./SizesPage.module.css";

export function SizesPage() {
  const {
    activeTheme,
    setSizeBase,
    setSizeStep,
    setSizeModeFontSize,
    setActiveMode,
    addSizeMode,
    removeSizeMode,
    renameSizeMode,
  } = useThemeStore();
  const sizing = activeTheme.sizing;
  const { base, step, modes, activeMode } = sizing;

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div className={styles.head}>
          <h2>Størrelser</h2>
          <p className={styles.lead}>
            Hele størrelses-skalaen genereres automatisk. Du setter bare en base
            og et steg, og en font-size per størrelse (modus). Bytt modus i kode
            eller Figma, og padding, marg og alt som bruker størrelser skalerer
            opp eller ned.
          </p>
        </div>

        <div className={styles.infoCard}>
          <Logo className={styles.infoLogo} />
          <div>
            <strong>Hvordan regnes en størrelse ut?</strong>
            <p>
              <code>unit = steg / base × modus-font-size</code> og{" "}
              <code>size-N = nedrundet(unit × N)</code>. Når base og modus-font-
              size er like, blir <code>unit = steg</code>. Modusene deles med
              typografien — samme akse skalerer fonter og avstander sammen.
            </p>
          </div>
        </div>
      </div>

      {/* Base + step */}
      <section className={styles.section}>
        <h3>Grunnverdier</h3>
        <p className={styles.sub}>
          Felles for alle modus. Base er font-size-en skalaen er kalibrert mot;
          steg er grunnrytmen i px.
        </p>
        <div className={styles.baseRow}>
          <NumField
            label="Base"
            value={base}
            onChange={setSizeBase}
            hint="referanse-font-size"
          />
          <NumField
            label="Steg"
            value={step}
            onChange={setSizeStep}
            hint="px per hakk"
          />
        </div>
      </section>

      {/* Modes */}
      <section className={styles.section}>
        <h3>Modus</h3>
        <p className={styles.sub}>
          Hvert modus er én font-size. Lag gjerne et eget, f.eks. «kompakt», med
          lavere font-size for tettere visning.
        </p>
        <div className={styles.modeGrid}>
          {modes.map((m) => (
            <div
              key={m.name}
              className={`${styles.modeCard} ${
                m.name === activeMode ? styles.modeActive : ""
              }`}
            >
              <div className={styles.modeCardHead}>
                <label className={styles.fieldLabel}>
                  <span>Navn</span>
                  <ModeName
                    value={m.name}
                    onCommit={(v) => renameSizeMode(m.name, v)}
                  />
                </label>
                {modes.length > 1 && (
                  <button
                    className={`${styles.iconBtn} ${styles.danger}`}
                    aria-label={`Slett ${m.name}`}
                    onClick={() => removeSizeMode(m.name)}
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>

              <label className={styles.fieldLabel}>
                <span>font-size</span>
                <span className={styles.inputWrap}>
                  <input
                    type="number"
                    min={1}
                    value={m.fontSize}
                    onChange={(e) =>
                      setSizeModeFontSize(m.name, Number(e.target.value))
                    }
                  />
                  <span className={styles.unitTag}>px</span>
                </span>
              </label>

              <div className={styles.modeCardFoot}>
                <span className={styles.unitInfo}>
                  unit {fmt(sizeValue(base, step, m.fontSize, 1))}px
                </span>
                {m.name === activeMode ? (
                  <span className={styles.activeBadge}>Aktiv</span>
                ) : (
                  <button
                    className={styles.previewBtn}
                    onClick={() => setActiveMode(m.name)}
                  >
                    Forhåndsvis
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            className={styles.addCard}
            onClick={() => addSizeMode(nextModeName(modes.map((m) => m.name)))}
          >
            <PlusIcon className={styles.addCardIcon} aria-hidden />
            Legg til modus
          </button>
        </div>
      </section>

      {/* Generated scale */}
      <section className={styles.section}>
        <h3>Generert skala</h3>
        <p className={styles.sub}>
          Tokenene Designsystemet bruker (0–15, så 18, 22, 26, 30). Skrivebeskyttet
          — endre base, steg eller modus-font-size for å justere.
        </p>
        <div className={styles.scaleChunks}>
          {chunk(SIZE_TOKENS, Math.ceil(SIZE_TOKENS.length / 2)).map(
            (tokens, ci) => (
              <table key={ci} className={styles.scaleTable}>
                <thead>
                  <tr>
                    <th className={styles.tokenHead}>token</th>
                    {modes.map((m) => (
                      <th
                        key={m.name}
                        className={m.name === activeMode ? styles.colActive : ""}
                      >
                        {m.name}
                        <span className={styles.colSub}>{m.fontSize}px</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token}>
                      <th className={styles.tokenCell}>size-{token}</th>
                      {modes.map((m) => (
                        <td
                          key={m.name}
                          className={
                            m.name === activeMode ? styles.colActive : ""
                          }
                        >
                          {sizeValue(base, step, m.fontSize, token)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ),
          )}
        </div>
      </section>

      {/* Context preview */}
      <section className={styles.section}>
        <div className={styles.previewHead}>
          <div>
            <h3>Se det i praksis</h3>
            <p className={styles.sub}>
              Samme oppsett, ulik modus. Padding, avstand og font følger
              størrelsene og skalerer sammen.
            </p>
          </div>
          <div className={styles.segmented} role="group" aria-label="Modus">
            {modes.map((m) => (
              <button
                key={m.name}
                className={m.name === activeMode ? styles.segActive : styles.seg}
                onClick={() => setActiveMode(m.name)}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
        <SizePreview
          base={base}
          step={step}
          fontSize={
            modes.find((m) => m.name === activeMode)?.fontSize ?? base
          }
        />
      </section>
    </div>
  );
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/** First free "modus-N" name not already taken. */
function nextModeName(existing: string[]): string {
  let n = existing.length + 1;
  while (existing.includes(`modus-${n}`)) n++;
  return `modus-${n}`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function NumField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint: string;
}) {
  return (
    <label className={styles.numField}>
      <span className={styles.numLabel}>{label}</span>
      <span className={styles.numInputWrap}>
        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className={styles.unitTag}>px</span>
      </span>
      <span className={styles.numHint}>{hint}</span>
    </label>
  );
}

function ModeName({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <input
      className={styles.modeNameInput}
      value={draft}
      aria-label="Modus-navn"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft.trim() && draft !== value && onCommit(draft.trim())}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
    />
  );
}

/** A small layout whose spacing + font all come from size tokens of one mode. */
function SizePreview({
  base,
  step,
  fontSize,
}: {
  base: number;
  step: number;
  fontSize: number;
}) {
  const px = (n: number) => sizeValue(base, step, fontSize, n);
  return (
    <div className={styles.preview}>
      <div
        className={styles.card}
        style={{ padding: px(6), borderRadius: 8, gap: px(4) }}
      >
        <div className={styles.cardHeader} style={{ gap: px(3) }}>
          <span className={styles.avatar} style={{ width: px(11), height: px(11) }} />
          <div style={{ display: "flex", flexDirection: "column", gap: px(1) }}>
            <span style={{ fontSize: fontSize, fontWeight: 600 }}>
              Ola Normann
            </span>
            <span style={{ fontSize: fontSize * 0.8, color: "var(--app-text-muted)" }}>
              Saksbehandler
            </span>
          </div>
        </div>
        <p
          className={styles.body}
          style={{ fontSize: fontSize * 0.95, margin: 0 }}
        >
          Denne flaten bruker size-tokens til padding og avstand. Bytt modus, og
          alt skalerer sammen.
        </p>
        <div className={styles.actions} style={{ gap: px(2) }}>
          <button
            className={styles.primary}
            style={{ padding: `${px(2)}px ${px(4)}px`, fontSize, borderRadius: 8 }}
          >
            Lagre
          </button>
          <button
            className={styles.ghost}
            style={{ padding: `${px(2)}px ${px(4)}px`, fontSize, borderRadius: 8 }}
          >
            Avbryt
          </button>
        </div>
      </div>
      <span className={styles.annotate}>
        padding size-6 · {px(6)}px · avstand size-3/4 · knapp size-2/4
      </span>
    </div>
  );
}
