import { GRID_GROUPS } from "@/color/types";
import { chromaOf, deriveScale, resolveLuminances } from "@/color/derive";
import type { SemanticScaleConfig } from "@/theme/config";
import { useThemeStore } from "@/theme/ThemeStore";
import { Popover } from "@/components/ui/Popover";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  LockIcon,
  PaletteIcon,
  PencilIcon,
  TrashIcon,
  WarningIcon,
} from "@/components/ui/icons";
import { Swatch } from "./Swatch";
import { ChromaSlider } from "./ChromaSlider";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { EditScalePopover } from "./EditScalePopover";
import {
  BASE_CONTRAST_WARNING,
  baseHasLowContrast,
} from "./contrastWarning";
import styles from "./ScaleRow.module.css";

/** Max chroma multiplier for the bulk saturation sliders. */
const CHROMA_MAX = 1.5;

export function ScaleRow({
  scale,
  index,
  count,
  chromaEdit = false,
  reorderable = true,
}: {
  scale: SemanticScaleConfig;
  index: number;
  count: number;
  chromaEdit?: boolean;
  reorderable?: boolean;
}) {
  const { mode, activeTheme, updateScale, removeScale, moveScale, setChroma } =
    useThemeStore();
  const luminances = resolveLuminances(activeTheme, mode);
  const derived = deriveScale(scale, mode, luminances);
  const stepByName = new Map(derived.steps.map((s) => [s.name, s]));
  const backgroundHex = stepByName.get("background-default")!.hex;
  const lowContrast = baseHasLowContrast(
    stepByName.get("base-default")!.hex,
    stepByName.get("surface-tinted")!.hex,
  );
  // "neutral" is required: it can't be renamed or deleted.
  const locked = scale.name === "neutral";

  return (
    <div className={styles.row}>
      <div className={styles.meta}>
        <div className={styles.metaText}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{scale.name}</span>
            {locked ? (
              <Popover
                placement="bottom-start"
                trigger={
                  <button
                    className={styles.iconBtn}
                    aria-label="Låst farge – les mer"
                  >
                    <LockIcon />
                  </button>
                }
              >
                <div className={styles.warnPopover}>
                  <strong>Låst farge</strong>
                  <p>
                    «neutral» er en påkrevd farge og brukes gjennom hele
                    systemet. Den kan ikke gis nytt navn eller slettes — men du
                    kan fortsatt endre selve fargen.
                  </p>
                </div>
              </Popover>
            ) : (
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
            )}
            {lowContrast && (
              <Popover
                placement="bottom-start"
                trigger={
                  <button
                    className={styles.warnBtn}
                    aria-label="Lav kontrast – les mer"
                  >
                    <WarningIcon />
                  </button>
                }
              >
                <div className={styles.warnPopover}>
                  <strong>Lav kontrast</strong>
                  <p>{BASE_CONTRAST_WARNING}</p>
                </div>
              </Popover>
            )}
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
                lowContrast={lowContrast}
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
                <div key={def.name} className={styles.cell}>
                  <Swatch
                    scaleId={scale.id}
                    scaleName={scale.name}
                    step={step}
                    backgroundHex={backgroundHex}
                    isOverridden={isOverridden}
                    isChromaAdjusted={isChromaAdjusted}
                  />
                  {chromaEdit && (
                    <ChromaSlider
                      value={mult}
                      max={CHROMA_MAX}
                      modified={mult !== 1}
                      label={chromaOf(step.hex).toFixed(3)}
                      onChange={(v) =>
                        setChroma(
                          scale.id,
                          mode,
                          def.name,
                          Math.abs(v - 1) < 0.005 ? null : v,
                        )
                      }
                      onReset={() => setChroma(scale.id, mode, def.name, null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.rowActions}>
        {reorderable && (
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
        )}
        {!locked && (
          <button
            className={`${styles.iconBtn} ${styles.danger}`}
            aria-label="Slett fargeskala"
            onClick={() => removeScale(scale.id)}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}
