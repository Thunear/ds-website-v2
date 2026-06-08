import { useState } from "react";
import { GRID_GROUPS } from "@/themebuilder/color/types";
import { deriveScale, resolveLuminances } from "@/themebuilder/color/derive";
import {
  SEVERITY_DEFAULTS,
  SEVERITY_NAMES,
  type SeverityName,
} from "@/themebuilder/theme/config";
import { useThemeStore } from "@/themebuilder/theme/ThemeStore";
import { Popover } from "@/shared/ui/Popover";
import { PaletteIcon } from "@/shared/ui/icons";
import { ColorGridHeader } from "./ColorGridHeader";
import { ColorPickerPopover } from "./ColorPickerPopover";
import styles from "./SeveritySection.module.css";

/**
 * The fixed status colours (info/success/warning/danger). Names and count are
 * locked; only the source colour can be changed. Generated like any semantic
 * scale, so they follow the global lightness curve.
 */
export function SeveritySection() {
  const { activeTheme, mode, setSeverityColor } = useThemeStore();
  const [show, setShow] = useState(false);
  const severity = activeTheme.severity ?? SEVERITY_DEFAULTS;
  const luminances = resolveLuminances(activeTheme, mode);

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div className={styles.titleRow}>
          <h2>Severity-farger</h2>
          <label className={styles.toggle}>
            <button
              type="button"
              role="switch"
              aria-checked={show}
              className={styles.switch}
              data-on={show || undefined}
              onClick={() => setShow((v) => !v)}
            >
              <span className={styles.knob} />
            </button>
            Vis severity-farger
          </label>
        </div>
        <p className={styles.lead}>
          Faste statusfarger (info, success, warning, danger). Navnene er låst —
          du kan kun endre selve fargen.
        </p>
      </div>

      {show && (
        <div className={styles.grid}>
          <ColorGridHeader />
          {SEVERITY_NAMES.map((name) => (
            <SeverityRow
              key={name}
              name={name}
              hex={severity[name]}
              mode={mode}
              luminances={luminances}
              onChange={(hex) => setSeverityColor(name, hex)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SeverityRow({
  name,
  hex,
  mode,
  luminances,
  onChange,
}: {
  name: SeverityName;
  hex: string;
  mode: ReturnType<typeof useThemeStore>["mode"];
  luminances: ReturnType<typeof resolveLuminances>;
  onChange: (hex: string) => void;
}) {
  const derived = deriveScale({ id: `severity-${name}`, name, hex }, mode, luminances);
  const stepByName = new Map(derived.steps.map((s) => [s.name, s]));

  return (
    <div className={styles.row}>
      <div className={styles.meta}>
        <span className={styles.name}>{name}</span>
        <div className={styles.hexRow}>
          <span className={styles.colorChip} style={{ background: hex }} aria-hidden />
          <span className={styles.hex}>{hex.toUpperCase()}</span>
          <Popover
            placement="bottom-start"
            trigger={
              <button className={styles.iconBtn} aria-label="Endre farge">
                <PaletteIcon />
              </button>
            }
          >
            <ColorPickerPopover color={hex} onChange={onChange} />
          </Popover>
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
              return (
                <span
                  key={def.name}
                  className={styles.swatch}
                  style={{ background: step.hex }}
                  title={`${step.group} ${step.label} — ${step.hex}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.actionsSpacer} />
    </div>
  );
}
