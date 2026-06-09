import { HexColorInput, HexColorPicker } from "react-colorful";
import type { ScaleVariant } from "@/themebuilder/color/types";
import { RaindropIcon, WarningIcon } from "@/shared/ui/icons";
import { eyeDropperSupported, pickColorFromScreen } from "./useEyeDropper";
import { BASE_CONTRAST_WARNING } from "./contrastWarning";
import styles from "./ColorPickerPopover.module.css";

interface Props {
  color: string;
  onChange: (hex: string) => void;
  /** Warn that this base colour has too little contrast for components. */
  lowContrast?: boolean;
  /** When provided, shows the scale-variant chooser in the right column. */
  variant?: ScaleVariant;
  onVariantChange?: (variant: ScaleVariant) => void;
}

const VARIANTS: { value: ScaleVariant; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "base-only", label: "Kun base-farger" },
  { value: "inverted", label: "Invertert" },
];

const VARIANTS_DESC =
  "Normal gir hele skalaen toner av fargen. Kun base-farger holder resten " +
  "nøytralt grå. Invertert gjør fargen til bakgrunn med lyse kanter og tekst.";

/** Content of the "Velg farge" popover that sets a scale's source colour. */
export function ColorPickerPopover({
  color,
  onChange,
  lowContrast,
  variant = "normal",
  onVariantChange,
}: Props) {
  return (
    <div className={styles.root}>
      <div className={styles.columns}>
        <div className={styles.left}>
          <h3>Velg farge</h3>
          <p className={styles.desc}>
            Velg en kilde-farge. De 16 stegene i skalaen genereres automatisk.
          </p>
          <HexColorPicker color={color} onChange={onChange} />
          <div className={styles.controls}>
            <div className={styles.hexRow}>
              <span className={styles.hash}>#</span>
              <HexColorInput
                color={color}
                onChange={onChange}
                className={styles.hexInput}
              />
            </div>
            {eyeDropperSupported() && (
              <button
                type="button"
                className={styles.eyedropper}
                title="Plukk farge fra skjermen"
                onClick={async () => {
                  const hex = await pickColorFromScreen();
                  if (hex) onChange(hex);
                }}
              >
                <RaindropIcon />
              </button>
            )}
          </div>
        </div>

        {onVariantChange && (
          <div className={styles.right}>
            <h4 className={styles.rightTitle}>Type skala</h4>
            <p className={styles.desc}>{VARIANTS_DESC}</p>
            <div className={styles.variants} role="radiogroup" aria-label="Type skala">
              {VARIANTS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  role="radio"
                  aria-checked={variant === v.value}
                  className={variant === v.value ? styles.variantOn : styles.variant}
                  onClick={() => onVariantChange(v.value)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {lowContrast && (
        <div className={styles.alert} role="alert">
          <WarningIcon aria-hidden className={styles.alertIcon} />
          <span>{BASE_CONTRAST_WARNING}</span>
        </div>
      )}
    </div>
  );
}
