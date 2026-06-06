import { HexColorInput, HexColorPicker } from "react-colorful";
import { RaindropIcon } from "@/components/ui/icons";
import { eyeDropperSupported, pickColorFromScreen } from "./useEyeDropper";
import styles from "./ColorPickerPopover.module.css";

interface Props {
  color: string;
  onChange: (hex: string) => void;
}

/** Content of the "Velg farge" popover that sets a scale's source colour. */
export function ColorPickerPopover({ color, onChange }: Props) {
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
    </div>
  );
}
