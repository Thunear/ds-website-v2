import { useState } from "react";
import chroma from "chroma-js";
import type { ColorStep } from "@/color/types";
import { chromaOf, cssVarName } from "@/color/derive";
import { contrastRatio } from "@/color/contrast";
import { useThemeStore } from "@/theme/ThemeStore";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { ArrowUndoIcon, CopyIcon } from "@/components/ui/icons";
import styles from "./SwatchInfoPopover.module.css";

/** Slider range for the chroma multiplier. */
const CHROMA_MAX = 1.5;

interface Props {
  scaleId: string;
  scaleName: string;
  step: ColorStep;
  /** background-default of this scale, for the contrast readout. */
  backgroundHex: string;
  isOverridden: boolean;
}

function oklchString(hex: string): string {
  const [l, c, h] = chroma(hex).oklch();
  const hue = Number.isNaN(h) ? 0 : h;
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${hue.toFixed(0)})`;
}

export function SwatchInfoPopover({
  scaleId,
  scaleName,
  step,
  backgroundHex,
  isOverridden,
}: Props) {
  const { setOverride, setChroma, mode, activeTheme } = useThemeStore();
  const [showPicker, setShowPicker] = useState(false);
  const cssVar = cssVarName(scaleName, step.name);
  const ratio = contrastRatio(step.hex, backgroundHex);

  const scaleCfg = activeTheme.colors.find((c) => c.id === scaleId);
  const chromaMult = scaleCfg?.chroma?.[mode]?.[step.name] ?? 1;

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.bigSwatch} style={{ background: step.hex }} />
        <div>
          <h3>
            {scaleName} {step.group} {step.label}
          </h3>
          <p className={styles.desc}>
            CSS-variabel for steget «{step.label}» i {step.group}-gruppen.
          </p>
        </div>
      </div>

      <dl className={styles.readouts}>
        <Row label="Hexkode" value={step.hex} onCopy={() => copy(step.hex)} />
        <Row
          label="OKLCH"
          value={oklchString(step.hex)}
          onCopy={() => copy(oklchString(step.hex))}
        />
        <Row label="CSS variabel" value={cssVar} onCopy={() => copy(cssVar)} />
        <Row label="Relativ luminans" value={step.luminance.toFixed(2)} />
        <Row label="Kontrast mot bakgrunn" value={`${ratio.toFixed(2)}:1`} />
      </dl>

      <div className={styles.sectionHead}>
        <strong>Metning (Trygg modus)</strong>
        {chromaMult !== 1 && (
          <button
            className={styles.reset}
            onClick={() => setChroma(scaleId, mode, step.name, null)}
          >
            <ArrowUndoIcon aria-hidden /> Standard
          </button>
        )}
      </div>
      <p className={styles.warn}>
        Juster metning uten å endre kontrast mot bakgrunnen.
      </p>
      <div className={styles.sliderRow}>
        <input
          type="range"
          min={0}
          max={CHROMA_MAX}
          step={0.01}
          value={chromaMult}
          disabled={isOverridden}
          onChange={(e) =>
            setChroma(scaleId, mode, step.name, Number(e.target.value))
          }
          className={styles.slider}
        />
        <span className={styles.sliderValue}>{chromaOf(step.hex).toFixed(3)}</span>
      </div>
      {isOverridden && (
        <p className={styles.warn}>
          Metning er deaktivert mens en hex-overstyring er aktiv.
        </p>
      )}

      <div className={styles.overrideHead}>
        <strong>Overstyr fargen</strong>
        {isOverridden && (
          <button
            className={styles.reset}
            onClick={() => setOverride(scaleId, mode, step.name, null)}
          >
            <ArrowUndoIcon aria-hidden /> Skru tilbake til standard
          </button>
        )}
      </div>
      <p className={styles.warn}>
        Du kan overstyre hex-koden direkte. Dette kan bryte
        kontrastreglene til resten av systemet.
      </p>

      {showPicker && (
        <div className={styles.picker}>
          <HexColorPicker
            color={step.hex}
            onChange={(hex) => setOverride(scaleId, mode, step.name, hex)}
          />
        </div>
      )}

      <div className={styles.hexRow}>
        <HexColorInput
          prefixed
          color={step.hex}
          className={styles.hexInput}
          onChange={(hex) => setOverride(scaleId, mode, step.name, hex)}
        />
        <button
          className={styles.toggle}
          onClick={() => setShowPicker((v) => !v)}
        >
          {showPicker ? "Skjul" : "Velg"}
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
}) {
  return (
    <div className={styles.readout}>
      <dt>{label}</dt>
      <dd>
        <span>{value}</span>
        {onCopy && (
          <button className={styles.copy} onClick={onCopy} aria-label="Kopier">
            <CopyIcon aria-hidden />
          </button>
        )}
      </dd>
    </div>
  );
}
