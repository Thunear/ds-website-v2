import { useState, type CSSProperties } from "react";
import { deriveScale, resolveLuminances } from "@/themebuilder/color/derive";
import type { LuminanceMap } from "@/themebuilder/color/scale";
import type { ColorMode } from "@/themebuilder/color/types";
import type { ColorScaleConfig } from "@/themebuilder/theme/config";
import { useThemeStore } from "@/themebuilder/theme/ThemeStore";
import { CheckmarkIcon, PaletteIcon } from "@/shared/ui/icons";
import { Popover } from "@/shared/ui/Popover";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { baseHasLowContrast } from "./contrastWarning";
import styles from "./ContextPreview.module.css";

/**
 * Previews each colour scale inside a realistic, interactive form (a public-
 * service context) styled entirely with that scale's generated tokens, so the
 * user can see every step working together across common components.
 */
export function ContextPreview() {
  const { activeTheme, mode } = useThemeStore();
  const luminances = resolveLuminances(activeTheme, mode);

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2>Forhåndsvisning i kontekst</h2>
        <p className={styles.lead}>
          Hvert panel er det samme skjemaet, fargelagt med én skala. Komponentene
          er interaktive – prøv input, knapper, switch og avkrysning.
        </p>
      </div>

      <div className={styles.panels}>
        {activeTheme.colors.map((scale, index) => (
          <PreviewPanel
            key={scale.id}
            scale={scale}
            index={index}
            mode={mode}
            luminances={luminances}
          />
        ))}
      </div>
    </section>
  );
}

function PreviewPanel({
  scale,
  index,
  mode,
  luminances,
}: {
  scale: ColorScaleConfig;
  index: number;
  mode: ColorMode;
  luminances: LuminanceMap;
}) {
  const { updateScale } = useThemeStore();
  const derived = deriveScale(scale, mode, luminances);
  const c = (name: string) => derived.steps.find((s) => s.name === name)!.hex;
  const lowContrast = baseHasLowContrast(c("base-default"), c("surface-tinted"));

  // Left-column panels keep the control on the right and open the picker to the
  // right (over the neighbour); right-column panels mirror it — so the popover
  // never covers the panel you're editing.
  const onRight = index % 2 === 0;

  const [consent, setConsent] = useState(true);
  const [digital, setDigital] = useState(true);
  const [paper, setPaper] = useState(false);

  // Expose the scale's tokens as CSS vars so the CSS can drive hover/focus/
  // checked states (which inline styles can't).
  const vars = {
    "--c-surface": c("surface-default"),
    "--c-surface-tinted": c("surface-tinted"),
    "--c-surface-hover": c("surface-hover"),
    "--c-surface-active": c("surface-active"),
    "--c-border-subtle": c("border-subtle"),
    "--c-border": c("border-default"),
    "--c-text": c("text-default"),
    "--c-text-subtle": c("text-subtle"),
    "--c-base": c("base-default"),
    "--c-base-hover": c("base-hover"),
    "--c-base-active": c("base-active"),
    "--c-on-base": c("base-contrast-default"),
  } as CSSProperties;

  const picker = (
    <Popover
      placement={onRight ? "right-start" : "left-start"}
      trigger={
        <button
          type="button"
          className={styles.colorBtn}
          aria-label={`Endre fargen ${scale.name}`}
        >
          <span
            className={styles.colorChip}
            style={{ background: scale.hex }}
            aria-hidden
          />
          <span className={styles.colorName}>{scale.name}</span>
          <span className={styles.colorHex}>{scale.hex.toUpperCase()}</span>
          <PaletteIcon className={styles.colorPalette} aria-hidden />
        </button>
      }
    >
      <ColorPickerPopover
        color={scale.hex}
        onChange={(hex) => updateScale(scale.id, { hex })}
        variant={scale.variant ?? "normal"}
        onVariantChange={(variant) => updateScale(scale.id, { variant })}
        lowContrast={lowContrast}
      />
    </Popover>
  );
  const status = <span className={styles.status}>Påbegynt</span>;

  return (
    <div className={styles.panel} style={vars}>
      <div className={styles.panelHead}>
        {onRight ? (
          <>
            {status}
            {picker}
          </>
        ) : (
          <>
            {picker}
            {status}
          </>
        )}
      </div>

      <h3 className={styles.title}>Søknad om tilskudd</h3>
      <p className={styles.help}>Fyll ut skjemaet for å sende inn søknaden din.</p>

      <label className={styles.field}>
        <span className={styles.label}>Fullt navn</span>
        <input className={styles.input} defaultValue="Ola Nordmann" />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>E-postadresse</span>
        <input className={styles.input} placeholder="navn@example.no" />
      </label>

      <div className={styles.switchRow}>
        <span className={styles.label}>Jeg samtykker til behandling</span>
        <button
          type="button"
          role="switch"
          aria-checked={consent}
          aria-label="Jeg samtykker til behandling"
          className={styles.switch}
          data-on={consent || undefined}
          onClick={() => setConsent((v) => !v)}
        >
          <span className={styles.knob} />
        </button>
      </div>

      <div className={styles.checks}>
        <Check label="Digital post" checked={digital} onToggle={() => setDigital((v) => !v)} />
        <Check label="Papirpost" checked={paper} onToggle={() => setPaper((v) => !v)} />
      </div>

      <div className={styles.buttons}>
        <button type="button" className={styles.primary}>
          Send søknad
        </button>
        <button type="button" className={styles.secondary}>
          Avbryt
        </button>
      </div>
    </div>
  );
}

function Check({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={styles.check}
      onClick={onToggle}
    >
      <span className={styles.box} data-on={checked || undefined}>
        {checked && <CheckmarkIcon aria-hidden />}
      </span>
      {label}
    </button>
  );
}
