import { useState } from "react";
import { GRID_GROUPS } from "@/color/types";
import { useThemeStore } from "@/theme/ThemeStore";
import { ScaleRow } from "@/components/color/ScaleRow";
import { LightnessCurve } from "@/components/color/LightnessCurve";
import { ContextPreview } from "@/components/color/ContextPreview";
import { ScaleDetailView } from "@/components/color/ScaleDetailView";
import { CustomGroupSection } from "@/components/color/CustomGroupSection";
import { Popover } from "@/components/ui/Popover";
import { CogIcon, PlusIcon } from "@/components/ui/icons";
import styles from "./ColorsPage.module.css";

const DEFAULT_NEW_COLORS = ["#0062BA", "#0D7A5F", "#5B3FA0", "#B8500F", "#9A1750"];

export function ColorsPage() {
  const { activeTheme, addScale } = useThemeStore();
  const [toggles, setToggles] = useState({
    severity: false,
    contrastLimits: false,
    lightness: false,
  });

  const handleAdd = () => {
    const n = activeTheme.colors.length + 1;
    const color = DEFAULT_NEW_COLORS[n % DEFAULT_NEW_COLORS.length];
    addScale(`farge-${n}`, color);
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h2>Sett opp fargene dine</h2>
          <p className={styles.lead}>
            Velg en kilde-farge per skala. Hvert steg får samme relative
            luminans på tvers av alle skalaene, slik at kontrasten mellom to steg
            er lik i hele temaet.
          </p>
        </div>
        <Popover
          placement="bottom-end"
          trigger={
            <button className={styles.advancedBtn}>
              <CogIcon aria-hidden /> Avanserte innstillinger
            </button>
          }
        >
          <div className={styles.advancedPanel}>
            <Toggle
              label="Rediger severity farger"
              checked={toggles.severity}
              onChange={(v) => setToggles((t) => ({ ...t, severity: v }))}
            />
            <Toggle
              label="Vis kontrastgrenser"
              checked={toggles.contrastLimits}
              onChange={(v) => setToggles((t) => ({ ...t, contrastLimits: v }))}
            />
            <Toggle
              label="Rediger lightness"
              checked={toggles.lightness}
              onChange={(v) => setToggles((t) => ({ ...t, lightness: v }))}
            />
          </div>
        </Popover>
      </div>

      {toggles.lightness && <LightnessCurve />}

      <div
        className={styles.grid}
        data-contrast-limits={toggles.contrastLimits || undefined}
      >
        <GridHeader />
        <div className={styles.rows}>
          {activeTheme.colors.map((scale, i) => (
            <ScaleRow
              key={scale.id}
              scale={scale}
              index={i}
              count={activeTheme.colors.length}
            />
          ))}
        </div>
        <button className={styles.addRow} onClick={handleAdd}>
          <PlusIcon aria-hidden /> Legg til ny fargeskala
        </button>
      </div>

      <CustomGroupSection groups={activeTheme.customGroups} />

      <ContextPreview />

      <ScaleDetailView />
    </div>
  );
}

function GridHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.headerSpacer} />
      <div className={styles.headerGroups}>
        {GRID_GROUPS.map((group) => (
          <div
            key={group.group}
            className={styles.headerGroup}
            style={{ flex: group.steps.length }}
          >
            <div className={styles.groupTitle}>{group.title}</div>
            <div className={styles.subLabels}>
              {group.steps.map((s) => (
                <span key={s.name} className={styles.subLabel}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.headerActionsSpacer} />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={styles.toggle}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={styles.switch}
        data-on={checked || undefined}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.knob} />
      </button>
      {label}
    </label>
  );
}
