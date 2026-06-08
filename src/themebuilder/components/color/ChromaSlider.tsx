import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ChromaSlider.module.css";

interface Props {
  /** Current multiplier (1 = generated default). */
  value: number;
  max: number;
  onChange: (value: number) => void;
  /** Reset to the generated default (double-click). */
  onReset: () => void;
  /** Whether this step has been changed from its default. */
  modified: boolean;
  /** Text shown under the track (e.g. the resulting chroma). */
  label: string;
  /** Visual style: neutral (saturation) or accent + fill (lightness). */
  variant?: "neutral" | "accent";
}

/** A slim vertical slider used for per-step chroma or lightness. */
export function ChromaSlider({
  value,
  max,
  onChange,
  onReset,
  modified,
  label,
  variant = "neutral",
}: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const fromClientY = useCallback(
    (clientY: number) => {
      const rect = trackRef.current!.getBoundingClientRect();
      const t = 1 - (clientY - rect.top) / rect.height; // 0 bottom .. 1 top
      return Math.min(max, Math.max(0, t * max));
    },
    [max],
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => onChange(fromClientY(e.clientY));
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, fromClientY, onChange]);

  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={styles.wrap}>
      <div
        ref={trackRef}
        className={styles.track}
        data-dragging={dragging || undefined}
        data-modified={modified || undefined}
        data-variant={variant}
        title={modified ? "Dobbeltklikk for å nullstille" : undefined}
        onPointerDown={(e) => {
          e.preventDefault();
          setDragging(true);
          onChange(fromClientY(e.clientY));
        }}
        onDoubleClick={onReset}
      >
        {variant === "accent" && (
          <div className={styles.fill} style={{ height: `${pct}%` }} />
        )}
        <div className={styles.thumb} style={{ bottom: `${pct}%` }} />
      </div>
      <span
        className={styles.value}
        data-variant={variant}
        data-modified={modified || undefined}
      >
        {label}
      </span>
    </div>
  );
}
