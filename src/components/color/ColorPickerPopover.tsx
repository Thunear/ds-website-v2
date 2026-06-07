import { HexColorInput, HexColorPicker } from "react-colorful";
import { RaindropIcon, WarningIcon } from "@/components/ui/icons";
import { eyeDropperSupported, pickColorFromScreen } from "./useEyeDropper";
import { BASE_CONTRAST_WARNING } from "./contrastWarning";
import styles from "./ColorPickerPopover.module.css";

interface Props {
  color: string;
  onChange: (hex: string) => void;
  /** Warn that this base colour has too little contrast for components. */
  lowContrast?: boolean;
}

/** Content of the "Velg farge" popover that sets a scale's source colour. */
export function ColorPickerPopover({ color, onChange, lowContrast }: Props) {
  return (
    <div className={styles.root}>
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
      {lowContrast && (
        <div className={styles.alert} role="alert">
          <WarningIcon aria-hidden className={styles.alertIcon} />
          <span>{BASE_CONTRAST_WARNING}</span>
        </div>
      )}
    </div>
  );
}
