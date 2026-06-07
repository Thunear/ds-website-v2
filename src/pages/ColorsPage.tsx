import { useState } from "react";
import { useThemeStore } from "@/theme/ThemeStore";
import { ScaleRow } from "@/components/color/ScaleRow";
import { ColorGridHeader } from "@/components/color/ColorGridHeader";
import { SeveritySection } from "@/components/color/SeveritySection";
import { LightnessRow } from "@/components/color/LightnessRow";
import { ContextPreview } from "@/components/color/ContextPreview";
import { ScaleDetailView } from "@/components/color/ScaleDetailView";
import { CustomGroupSection } from "@/components/color/CustomGroupSection";
import { PlusIcon } from "@/components/ui/icons";
import styles from "./ColorsPage.module.css";

const DEFAULT_NEW_COLORS = [
  "#0062BA",
  "#0D7A5F",
  "#5B3FA0",
  "#B8500F",
  "#9A1750",
];

export function ColorsPage() {
  const { activeTheme, addScale } = useThemeStore();
  const [toggles, setToggles] = useState({
    lightness: false,
    chroma: false,
  });

  const handleAdd = () => {
    const n = activeTheme.colors.length + 1;
    const color = DEFAULT_NEW_COLORS[n % DEFAULT_NEW_COLORS.length];
    addScale(`farge-${n}`, color);
  };

  // "neutral" is pinned to the bottom and not reorderable.
  const movableScales = activeTheme.colors.filter((s) => s.name !== "neutral");
  const neutralScales = activeTheme.colors.filter((s) => s.name === "neutral");
  const orderedScales = [...movableScales, ...neutralScales];

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h2>Semantiske farger</h2>
          <p className={styles.lead}>
            Hovedfargene for grensesnittet. Velg en kilde-farge per skala —
            hvert steg får samme relative luminans på tvers av alle skalaene,
            slik at kontrasten mellom to steg er lik i hele temaet.
          </p>
        </div>
        <div className={styles.headToggles}>
          <Toggle
            label="Rediger lightness"
            checked={toggles.lightness}
            onChange={(v) => setToggles((t) => ({ ...t, lightness: v }))}
          />
          <Toggle
            label="Rediger fargemetning"
            checked={toggles.chroma}
            onChange={(v) => setToggles((t) => ({ ...t, chroma: v }))}
          />
        </div>
      </div>

      <div className={styles.grid}>
        <ColorGridHeader />
        {toggles.lightness && <LightnessRow />}
        <div className={styles.rows}>
          {orderedScales.map((scale) => {
            const isNeutral = scale.name === "neutral";
            return (
              <ScaleRow
                key={scale.id}
                scale={scale}
                index={isNeutral ? 0 : movableScales.indexOf(scale)}
                count={movableScales.length}
                reorderable={!isNeutral}
                chromaEdit={toggles.chroma}
              />
            );
          })}
        </div>
        <button className={styles.addRow} onClick={handleAdd}>
          <PlusIcon aria-hidden /> Legg til ny fargeskala
        </button>
      </div>

      <CustomGroupSection groups={activeTheme.customGroups} />

      <SeveritySection />

      <ContextPreview />

      <ScaleDetailView />
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
