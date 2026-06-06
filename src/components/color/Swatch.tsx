import type { CSSProperties } from "react";
import type { ColorStep } from "@/color/types";
import { bestContrastColor } from "@/color/contrast";
import { Popover } from "@/components/ui/Popover";
import { SwatchInfoPopover } from "./SwatchInfoPopover";
import styles from "./Swatch.module.css";

interface Props {
  scaleId: string;
  scaleName: string;
  step: ColorStep;
  backgroundHex: string;
  isOverridden: boolean;
  isChromaAdjusted: boolean;
}

export function Swatch({
  scaleId,
  scaleName,
  step,
  backgroundHex,
  isOverridden,
  isChromaAdjusted,
}: Props) {
  const marker = bestContrastColor(step.hex);
  const modified = isOverridden || isChromaAdjusted;
  const title = isOverridden
    ? `${step.group} ${step.label} — hex overstyrt`
    : isChromaAdjusted
      ? `${step.group} ${step.label} — metning endret`
      : `${step.group} ${step.label}`;

  return (
    <Popover
      placement="bottom"
      trigger={
        <button
          className={styles.swatch}
          style={{ background: step.hex, "--ring": marker } as CSSProperties}
          data-modified={modified || undefined}
          title={title}
          aria-label={title}
        >
          {isOverridden ? (
            <span className={styles.dot} style={{ background: marker }} aria-hidden />
          ) : isChromaAdjusted ? (
            <span className={styles.ring} style={{ borderColor: marker }} aria-hidden />
          ) : null}
        </button>
      }
    >
      <SwatchInfoPopover
        scaleId={scaleId}
        scaleName={scaleName}
        step={step}
        backgroundHex={backgroundHex}
        isOverridden={isOverridden}
      />
    </Popover>
  );
}
