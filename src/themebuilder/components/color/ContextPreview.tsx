import { useState, type CSSProperties } from "react";
import { deriveScale, resolveLuminances } from "@/themebuilder/color/derive";
import type { ColorMode } from "@/themebuilder/color/types";
import type { ColorScaleConfig, ThemeConfig } from "@/themebuilder/theme/config";
import { useThemeStore } from "@/themebuilder/theme/ThemeStore";
import { CheckmarkIcon, PaletteIcon } from "@/shared/ui/icons";
import { Popover } from "@/shared/ui/Popover";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { baseHasLowContrast } from "./contrastWarning";
import styles from "./ContextPreview.module.css";

/**
 * Previews each colour scale as a small form, in light and dark side by side,
 * styled entirely with that scale's generated tokens.
 *
 * The point of the preview is the muted steps: resting states (input, checkbox
 * and switch borders, the off-switch knob, the card surface) use the muted
 * tokens, while interaction and selected states use the coloured ones. With
 * neutral muted steps the components read quiet and the accent stands out; with
 * colourful muted steps the whole form takes the hue.
 */
export function ContextPreview() {
  const { activeTheme } = useThemeStore();

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2>Forhåndsvisning i kontekst</h2>
        <p className={styles.lead}>
          Hver skala vises i lys og mørk modus. Hviletilstander (kanter på
          input, checkbox og switch, samt flaten) bruker muted-stegene, mens
          valgte og aktive tilstander bruker fargen. Sett muted-stegene til
          «Fargerike» i fargevelgeren for et helfarget uttrykk.
        </p>
      </div>

      <div className={styles.scales}>
        {activeTheme.colors.map((scale) => (
          <ScalePreview key={scale.id} scale={scale} theme={activeTheme} />
        ))}
      </div>
    </section>
  );
}

const CHECKS = [
  "Utstyr",
  "Universell utforming",
  "Sikkerheitstiltak",
  "Informasjonsskilt",
];

interface FormState {
  checked: boolean[];
  toggleCheck: (i: number) => void;
  switchOn: boolean;
  setSwitchOn: (v: boolean) => void;
  switchOff: boolean;
  setSwitchOff: (v: boolean) => void;
}

/** One scale: a header with the colour control, then a light and a dark panel. */
function ScalePreview({
  scale,
  theme,
}: {
  scale: ColorScaleConfig;
  theme: ThemeConfig;
}) {
  const { updateScale } = useThemeStore();
  const variant = scale.variant ?? "normal";
  const muted = scale.muted ?? "neutral";

  // Shared form state so light and dark stay in step when you interact.
  const [checked, setChecked] = useState<boolean[]>([false, true, false, false]);
  const [switchOn, setSwitchOn] = useState(true);
  const [switchOff, setSwitchOff] = useState(false);
  const form: FormState = {
    checked,
    toggleCheck: (i) => setChecked((c) => c.map((v, j) => (j === i ? !v : v))),
    switchOn,
    setSwitchOn,
    switchOff,
    setSwitchOff,
  };

  const light = deriveScale(scale, "light", resolveLuminances(theme, "light"));
  const lightHex = (name: string) =>
    light.steps.find((s) => s.name === name)!.hex;
  const lowContrast = baseHasLowContrast(
    lightHex("base-default"),
    lightHex("surface-tinted"),
  );

  return (
    <div className={styles.scale}>
      <div className={styles.scaleHead}>
        <Popover
          placement="bottom-start"
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
            variant={variant}
            onVariantChange={(variant) => updateScale(scale.id, { variant })}
            muted={muted}
            onMutedChange={(muted) => updateScale(scale.id, { muted })}
            lowContrast={lowContrast}
          />
        </Popover>
        <span className={styles.badge}>
          {muted === "colorful" ? "Fargerike muted-steg" : "Nøytrale muted-steg"}
        </span>
      </div>

      <div className={styles.pair}>
        <PreviewPanel scale={scale} theme={theme} mode="light" form={form} />
        <PreviewPanel scale={scale} theme={theme} mode="dark" form={form} />
      </div>
    </div>
  );
}

function PreviewPanel({
  scale,
  theme,
  mode,
  form,
}: {
  scale: ColorScaleConfig;
  theme: ThemeConfig;
  mode: ColorMode;
  form: FormState;
}) {
  const derived = deriveScale(scale, mode, resolveLuminances(theme, mode));
  const c = (name: string) => derived.steps.find((s) => s.name === name)!.hex;
  const variant = scale.variant ?? "normal";

  // The card sits on surface-muted: near-neutral by default, tinted when the
  // muted steps are colourful. Inverted / base-only scales keep the flat
  // surface-default, where their coloured/neutral components read best.
  const panelBg =
    variant === "inverted" || variant === "base-only"
      ? c("surface-default")
      : c("surface-muted");

  // Expose the scale's tokens as CSS vars so the CSS can drive hover/focus/
  // checked states (which inline styles can't).
  const vars = {
    "--c-panel": panelBg,
    "--c-surface": c("surface-default"),
    "--c-surface-tinted": c("surface-tinted"),
    "--c-surface-hover": c("surface-hover"),
    "--c-surface-active": c("surface-active"),
    "--c-surface-muted": c("surface-muted"),
    "--c-border-subtle": c("border-subtle"),
    "--c-border": c("border-default"),
    "--c-border-strong": c("border-strong"),
    "--c-border-muted": c("border-muted"),
    "--c-text": c("text-default"),
    "--c-text-subtle": c("text-subtle"),
    "--c-text-muted": c("text-muted"),
    "--c-base": c("base-default"),
    "--c-base-hover": c("base-hover"),
    "--c-base-active": c("base-active"),
    "--c-on-base": c("base-contrast-default"),
  } as CSSProperties;

  return (
    <div className={styles.panelWrap}>
      <span className={styles.panelCaption}>
        {scale.name} ({mode === "light" ? "lys" : "mørk"})
      </span>
      <div className={styles.panel} style={vars}>
        <label className={styles.field}>
          <span className={styles.label}>Fullt navn</span>
          <input className={styles.input} defaultValue="Input tekst" />
        </label>

        <fieldset className={styles.fieldset}>
          <legend className={styles.label}>Kva omfattar søknaden?</legend>
          <div className={styles.checks}>
            {CHECKS.map((label, i) => (
              <Check
                key={label}
                label={label}
                checked={form.checked[i]}
                onToggle={() => form.toggleCheck(i)}
              />
            ))}
          </div>
        </fieldset>

        <div className={styles.switches}>
          <Switch
            label="Switch på"
            on={form.switchOn}
            onToggle={() => form.setSwitchOn(!form.switchOn)}
          />
          <Switch
            label="Switch av"
            on={form.switchOff}
            onToggle={() => form.setSwitchOff(!form.switchOff)}
          />
        </div>

        <span className={styles.tag}>
          <span className={styles.tagDot} aria-hidden />
          Text
        </span>
      </div>
    </div>
  );
}

function Switch({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <span className={styles.switchRow}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={styles.switch}
        data-on={on || undefined}
        onClick={onToggle}
      >
        <span className={styles.knob} />
      </button>
      <span className={styles.switchLabel} aria-hidden>
        {label}
      </span>
    </span>
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
