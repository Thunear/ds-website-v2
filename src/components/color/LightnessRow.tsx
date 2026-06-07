import { GRID_GROUPS } from "@/color/types";
import { CONTRAST_STEP_NAMES, defaultLuminanceArray } from "@/color/scale";
import { LIGHTNESS_PRESETS, matchPreset } from "@/color/presets";
import { useThemeStore } from "@/theme/ThemeStore";
import { ArrowUndoIcon } from "@/components/ui/icons";
import { ChromaSlider } from "./ChromaSlider";
import styles from "./LightnessRow.module.css";

const round3 = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Inline lightness editor: a vertical slider per contrast step, aligned with the
 * grid columns and sitting right above the first scale. The Base group is left
 * empty since those steps aren't positioned by the curve.
 */
export function LightnessRow() {
  const { mode, activeTheme, setLightness, setLightnessCurve, resetLightness } =
    useThemeStore();
  const values = activeTheme.lightness?.[mode] ?? defaultLuminanceArray(mode);
  const lightCurve = activeTheme.lightness?.light ?? defaultLuminanceArray("light");
  const darkCurve = activeTheme.lightness?.dark ?? defaultLuminanceArray("dark");
  const presetId = matchPreset(lightCurve, darkCurve)?.id ?? "custom";

  const applyPreset = (id: string) => {
    const preset = LIGHTNESS_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    if (preset.id === "aa") {
      resetLightness("light");
      resetLightness("dark");
    } else {
      setLightnessCurve("light", preset.light);
      setLightnessCurve("dark", preset.dark);
    }
  };

  return (
    <div className={styles.row}>
      <div className={styles.meta}>
        <span className={styles.label}>Lyshetskurve</span>
        <select
          className={styles.select}
          value={presetId}
          onChange={(e) => applyPreset(e.target.value)}
          aria-label="Forhåndsinnstilling for lyshet"
        >
          {LIGHTNESS_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
          {presetId === "custom" && <option value="custom">Tilpasset</option>}
        </select>
        <button
          className={styles.reset}
          disabled={presetId === "aa"}
          onClick={() => applyPreset("aa")}
        >
          <ArrowUndoIcon aria-hidden /> Tilbakestill
        </button>
      </div>

      <div className={styles.groups}>
        {GRID_GROUPS.map((group) => (
          <div
            key={group.group}
            className={styles.group}
            style={{ flex: group.steps.length }}
          >
            {group.group === "base"
              ? null
              : group.steps.map((def) => {
                  const vi = (CONTRAST_STEP_NAMES as string[]).indexOf(def.name);
                  return (
                    <div key={def.name} className={styles.cell}>
                      <ChromaSlider
                        value={values[vi]}
                        max={1}
                        variant="accent"
                        modified={false}
                        label={values[vi].toFixed(2)}
                        onChange={(v) => setLightness(mode, vi, round3(v))}
                        onReset={() => {}}
                      />
                    </div>
                  );
                })}
          </div>
        ))}
      </div>

      <div className={styles.actionsSpacer} />
    </div>
  );
}
