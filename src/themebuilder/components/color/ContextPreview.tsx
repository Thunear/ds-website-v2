import { deriveScale, resolveLuminances } from "@/themebuilder/color/derive";
import type { LuminanceMap } from "@/themebuilder/color/scale";
import type { ColorMode } from "@/themebuilder/color/types";
import type { ColorScaleConfig } from "@/themebuilder/theme/config";
import { useThemeStore } from "@/themebuilder/theme/ThemeStore";
import { CheckmarkIcon } from "@/shared/ui/icons";
import styles from "./ContextPreview.module.css";

/**
 * Previews each colour scale inside a small UI card, styled entirely with that
 * scale's generated tokens so the user can see how the colours work in context.
 */
export function ContextPreview() {
  const { activeTheme, mode } = useThemeStore();
  const luminances = resolveLuminances(activeTheme, mode);

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2>Forhåndsvisning i kontekst</h2>
        <p className={styles.lead}>
          Se hvordan hver fargeskala ser ut i en komponent. Hvert kort bruker
          fargene fra sin egen skala. Kontrastfargen i knappen veksler mellom
          hvit og svart for best mulig kontrast.
        </p>
      </div>

      <div className={styles.cards}>
        {activeTheme.colors.map((scale) => (
          <PreviewCard
            key={scale.id}
            scale={scale}
            mode={mode}
            luminances={luminances}
          />
        ))}
      </div>
    </section>
  );
}

function PreviewCard({
  scale,
  mode,
  luminances,
}: {
  scale: ColorScaleConfig;
  mode: ColorMode;
  luminances: LuminanceMap;
}) {
  const derived = deriveScale(scale, mode, luminances);
  const c = (name: string) => derived.steps.find((s) => s.name === name)!.hex;

  return (
    <div
      className={styles.card}
      style={{
        background: c("background-tinted"),
        borderColor: c("border-subtle"),
        color: c("text-default"),
      }}
    >
      <h3 className={styles.cardTitle}>{scale.name}</h3>
      <p className={styles.cardSub} style={{ color: c("text-subtle") }}>
        Farger gjør livet mer fargerikt
      </p>

      <div className={styles.checks}>
        <span className={styles.check}>
          <span
            className={styles.boxChecked}
            style={{ background: c("base-default"), borderColor: c("base-default") }}
          >
            <CheckmarkIcon aria-hidden style={{ color: c("base-contrast-default") }} />
          </span>
          Checkbox 1
        </span>
        <span className={styles.check}>
          <span
            className={styles.box}
            style={{ background: c("surface-default"), borderColor: c("border-default") }}
          />
          Checkbox 2
        </span>
      </div>

      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.primary}
          style={{ background: c("base-default"), color: c("base-contrast-default") }}
        >
          Primær
        </button>
        <button
          type="button"
          className={styles.secondary}
          style={{ borderColor: c("border-default"), color: c("base-default") }}
        >
          Sekundær
        </button>
      </div>
    </div>
  );
}
