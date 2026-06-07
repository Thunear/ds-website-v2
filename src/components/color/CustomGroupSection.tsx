import { useState } from "react";
import { deriveCustomColor } from "@/color/derive";
import { RAMP_PRESETS, matchRampPreset, rampFromPreset } from "@/color/ramps";
import type { CustomColor, CustomGroup } from "@/theme/config";
import { useThemeStore } from "@/theme/ThemeStore";
import { Popover } from "@/components/ui/Popover";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PaletteIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { ChromaSlider } from "./ChromaSlider";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { EditScalePopover } from "./EditScalePopover";
import styles from "./CustomGroupSection.module.css";

const MIN_STEPS = 2;
const MAX_STEPS = 20;
const CHROMA_MAX = 1.5;
const round3 = (n: number) => Math.round(n * 1000) / 1000;

export function CustomGroupSection({ groups }: { groups: CustomGroup[] }) {
  const { addCustomGroup } = useThemeStore();
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2>Egendefinerte fargegrupper</h2>
        <p className={styles.lead}>
          Frie fargeramper for grafer og visualiseringer. En gruppe deler antall
          steg og lyshet; hver farge i gruppen tegnes langs den samme rampen.
          Disse følger ikke den globale lyshetskurven.
        </p>
      </div>

      {groups.map((group) => (
        <GroupBlock key={group.id} group={group} />
      ))}

      <button className={styles.addGroup} onClick={addCustomGroup}>
        <PlusIcon aria-hidden /> Legg til ny egendefinert fargegruppe
      </button>
    </section>
  );
}

function GroupBlock({ group }: { group: CustomGroup }) {
  const {
    renameCustomGroup,
    removeCustomGroup,
    setGroupSteps,
    setGroupLightness,
    setGroupLightnessCurve,
    addCustomColor,
  } = useThemeStore();
  const [saturationEdit, setSaturationEdit] = useState(false);
  const [lightnessEdit, setLightnessEdit] = useState(false);
  const steps = group.lightness.length;
  const presetId = matchRampPreset(group.lightness)?.id ?? "custom";

  const applyRamp = (id: string) => {
    const preset = RAMP_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const top = group.lightness[0];
    const bottom = group.lightness[group.lightness.length - 1];
    setGroupLightnessCurve(group.id, rampFromPreset(preset, steps, top, bottom));
  };

  return (
    <div className={styles.group}>
      <div className={styles.groupBar}>
        <span className={styles.groupName}>{group.name}</span>
        <Popover
          placement="bottom-start"
          trigger={
            <button className={styles.iconBtn} aria-label="Rediger gruppenavn">
              <PencilIcon />
            </button>
          }
        >
          <EditScalePopover
            name={group.name}
            onRename={(name) => renameCustomGroup(group.id, name)}
            onDelete={() => removeCustomGroup(group.id)}
          />
        </Popover>

        <div className={styles.stepper}>
          <span className={styles.stepperLabel}>Steg</span>
          <button
            className={styles.stepBtn}
            aria-label="Færre steg"
            disabled={steps <= MIN_STEPS}
            onClick={() => setGroupSteps(group.id, steps - 1)}
          >
            −
          </button>
          <span className={styles.stepCount}>{steps}</span>
          <button
            className={styles.stepBtn}
            aria-label="Flere steg"
            disabled={steps >= MAX_STEPS}
            onClick={() => setGroupSteps(group.id, steps + 1)}
          >
            <PlusIcon />
          </button>
        </div>

        <label className={styles.satToggle}>
          <button
            type="button"
            role="switch"
            aria-checked={saturationEdit}
            className={styles.switch}
            data-on={saturationEdit || undefined}
            onClick={() => setSaturationEdit((v) => !v)}
          >
            <span className={styles.knob} />
          </button>
          Rediger metning
        </label>

        <label className={styles.satToggle}>
          <button
            type="button"
            role="switch"
            aria-checked={lightnessEdit}
            className={styles.switch}
            data-on={lightnessEdit || undefined}
            onClick={() => setLightnessEdit((v) => !v)}
          >
            <span className={styles.knob} />
          </button>
          Rediger lyshetskurve
        </label>

        {lightnessEdit && (
          <label className={styles.presetField}>
            <span className={styles.presetLabel}>Lyshetskurve</span>
            <select
              className={styles.presetSelect}
              value={presetId}
              onChange={(e) => applyRamp(e.target.value)}
            >
              {RAMP_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
              {presetId === "custom" && (
                <option value="custom">Tilpasset</option>
              )}
            </select>
          </label>
        )}

        <button
          className={`${styles.iconBtn} ${styles.danger} ${styles.deleteGroup}`}
          aria-label="Slett gruppe"
          onClick={() => removeCustomGroup(group.id)}
        >
          <TrashIcon />
        </button>
      </div>

      {/* Shared lightness ramp for the group — sliders shown in edit mode. */}
      {lightnessEdit && (
        <div className={styles.lightnessPanel}>
          <div className={styles.row}>
            <div className={styles.metaLabel} />
            <div className={styles.cells}>
              {group.lightness.map((lum, i) => (
                <div key={i} className={styles.cell}>
                  <ChromaSlider
                    value={lum}
                    max={1}
                    variant="accent"
                    modified={false}
                    label={lum.toFixed(2)}
                    onChange={(v) => setGroupLightness(group.id, i, round3(v))}
                    onReset={() => {}}
                  />
                  <span className={styles.stepNum}>{i + 1}</span>
                </div>
              ))}
            </div>
            <div className={styles.actionsSpacer} />
          </div>
        </div>
      )}

      {group.colors.map((color, i) => (
        <ColorRow
          key={color.id}
          group={group}
          color={color}
          saturationEdit={saturationEdit}
          canMoveUp={i > 0}
          canMoveDown={i < group.colors.length - 1}
        />
      ))}

      <button
        className={styles.addColor}
        onClick={() => addCustomColor(group.id)}
      >
        <PlusIcon aria-hidden /> Legg til ny fargeskala
      </button>
    </div>
  );
}

function ColorRow({
  group,
  color,
  saturationEdit,
  canMoveUp,
  canMoveDown,
}: {
  group: CustomGroup;
  color: CustomColor;
  saturationEdit: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const {
    updateCustomColor,
    removeCustomColor,
    moveCustomColor,
    setColorChroma,
  } = useThemeStore();
  const swatches = deriveCustomColor(group.lightness, color);

  return (
    <div className={styles.row}>
      <div className={styles.meta}>
        <div className={styles.line}>
          <span className={styles.name}>{color.name}</span>
          <Popover
            placement="bottom-start"
            trigger={
              <button className={styles.iconBtn} aria-label="Rediger navn">
                <PencilIcon />
              </button>
            }
          >
            <EditScalePopover
              name={color.name}
              onRename={(name) => updateCustomColor(group.id, color.id, { name })}
              onDelete={() => removeCustomColor(group.id, color.id)}
            />
          </Popover>
        </div>
        <div className={styles.line}>
          <span
            className={styles.colorChip}
            style={{ background: color.hex }}
            aria-hidden
          />
          <span className={styles.hex}>{color.hex.toUpperCase()}</span>
          <Popover
            placement="bottom-start"
            trigger={
              <button className={styles.iconBtn} aria-label="Endre farge">
                <PaletteIcon />
              </button>
            }
          >
            <ColorPickerPopover
              color={color.hex}
              onChange={(hex) => updateCustomColor(group.id, color.id, { hex })}
            />
          </Popover>
        </div>
      </div>

      <div className={styles.cells}>
        {swatches.map((step, i) => (
          <div key={i} className={styles.cell}>
            <span className={styles.swatch} style={{ background: step.hex }} />
            {saturationEdit && (
              <ChromaSlider
                value={color.chroma?.[i] ?? 1}
                max={CHROMA_MAX}
                modified={(color.chroma?.[i] ?? 1) !== 1}
                label={(color.chroma?.[i] ?? 1).toFixed(2)}
                onChange={(v) =>
                  setColorChroma(group.id, color.id, i, round3(v))
                }
                onReset={() => setColorChroma(group.id, color.id, i, 1)}
              />
            )}
          </div>
        ))}
      </div>

      <div className={styles.rowActions}>
        <div className={styles.reorder}>
          <button
            className={styles.reorderBtn}
            aria-label="Flytt opp"
            disabled={!canMoveUp}
            onClick={() => moveCustomColor(group.id, color.id, -1)}
          >
            <ChevronUpIcon />
          </button>
          <button
            className={styles.reorderBtn}
            aria-label="Flytt ned"
            disabled={!canMoveDown}
            onClick={() => moveCustomColor(group.id, color.id, 1)}
          >
            <ChevronDownIcon />
          </button>
        </div>
        <button
          className={`${styles.iconBtn} ${styles.danger}`}
          aria-label="Slett farge"
          onClick={() => removeCustomColor(group.id, color.id)}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
