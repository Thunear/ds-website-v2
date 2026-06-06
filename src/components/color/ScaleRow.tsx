import { GRID_GROUPS } from "@/color/types";
import { deriveScale, resolveLuminances } from "@/color/derive";
import type { SemanticScaleConfig } from "@/theme/config";
import { useThemeStore } from "@/theme/ThemeStore";
import { Popover } from "@/components/ui/Popover";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PaletteIcon,
  PencilIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { Swatch } from "./Swatch";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { EditScalePopover } from "./EditScalePopover";
import styles from "./ScaleRow.module.css";

export function ScaleRow({
  scale,
  index,
  count,
}: {
  scale: SemanticScaleConfig;
  index: number;
  count: number;
}) {
  const { mode, activeTheme, updateScale, removeScale, moveScale } =
    useThemeStore();
  const luminances = resolveLuminances(activeTheme, mode);
  const derived = deriveScale(scale, mode, luminances);
  const stepByName = new Map(derived.steps.map((s) => [s.name, s]));
  const backgroundHex = stepByName.get("background-default")!.hex;

  return (
    <div className={styles.row}>
      <div className={styles.meta}>
        <div className={styles.metaText}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{scale.name}</span>
            <Popover
              placement="bottom-start"
              trigger={
                <button className={styles.iconBtn} aria-label="Rediger navn">
                  <PencilIcon />
                </button>
              }
            >
              <EditScalePopover
                name={scale.name}
                onRename={(name) => updateScale(scale.id, { name })}
                onDelete={() => removeScale(scale.id)}
              />
            </Popover>
          </div>
          <div className={styles.hexRow}>
            <span
              className={styles.colorChip}
              style={{ background: scale.hex }}
              aria-hidden
            />
            <span className={styles.hex}>{scale.hex.toUpperCase()}</span>
            <Popover
              placement="bottom-start"
              trigger={
                <button className={styles.iconBtn} aria-label="Endre farge">
                  <PaletteIcon />
                </button>
              }
            >
              <ColorPickerPopover
                color={scale.hex}
                onChange={(hex) => updateScale(scale.id, { hex })}
              />
            </Popover>
          </div>
        </div>
      </div>

      <div className={styles.groups}>
        {GRID_GROUPS.map((group) => (
          <div
            key={group.group}
            className={styles.group}
            style={{ flex: group.steps.length }}
          >
            {group.steps.map((def) => {
              const step = stepByName.get(def.name)!;
              const isOverridden = Boolean(scale.overrides?.[mode]?.[def.name]);
              const mult = scale.chroma?.[mode]?.[def.name] ?? 1;
              const isChromaAdjusted = !isOverridden && mult !== 1;
              return (
                <Swatch
                  key={def.name}
                  scaleId={scale.id}
                  scaleName={scale.name}
                  step={step}
                  backgroundHex={backgroundHex}
                  isOverridden={isOverridden}
                  isChromaAdjusted={isChromaAdjusted}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.rowActions}>
        <div className={styles.reorder}>
          <button
            className={styles.reorderBtn}
            aria-label="Flytt opp"
            disabled={index === 0}
            onClick={() => moveScale(scale.id, -1)}
          >
            <ChevronUpIcon />
          </button>
          <button
            className={styles.reorderBtn}
            aria-label="Flytt ned"
            disabled={index === count - 1}
            onClick={() => moveScale(scale.id, 1)}
          >
            <ChevronDownIcon />
          </button>
        </div>
        <button
          className={`${styles.iconBtn} ${styles.danger}`}
          aria-label="Slett fargeskala"
          onClick={() => removeScale(scale.id)}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
