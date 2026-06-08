import { useState } from "react";
import { deriveScale, resolveLuminances } from "@/themebuilder/color/derive";
import { useThemeStore } from "@/themebuilder/theme/ThemeStore";
import { EyeIcon, PaletteIcon, RocketIcon } from "@/shared/ui/icons";
import styles from "./ScaleDetailView.module.css";

const CARD_ICONS = [RocketIcon, PaletteIcon, EyeIcon];

/** A richer detail view of a single chosen scale, built from its tokens. */
export function ScaleDetailView() {
  const { activeTheme, mode } = useThemeStore();
  const luminances = resolveLuminances(activeTheme, mode);
  const [selectedId, setSelectedId] = useState(activeTheme.colors[0]?.id);

  const scale =
    activeTheme.colors.find((s) => s.id === selectedId) ?? activeTheme.colors[0];
  if (!scale) return null;

  const derived = deriveScale(scale, mode, luminances);
  const c = (name: string) => derived.steps.find((s) => s.name === name)!.hex;

  const surfaceCards = [
    { surface: "surface-tinted", highlight: false },
    { surface: "surface-default", highlight: true },
    { surface: "surface-hover", highlight: false },
  ] as const;

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2>Detaljvisning av fargeskala</h2>
        <p className={styles.lead}>
          En mer detaljert visning av hvordan den valgte fargeskalaen ser ut i
          ulike komponenter.
        </p>
      </div>

      <div className={styles.panel}>
        <span className={styles.pickLabel}>Velg fargeskala</span>
        <div className={styles.tabs} role="tablist">
          {activeTheme.colors.map((s) => {
            const active = s.id === scale.id;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={active}
                className={active ? styles.tabActive : styles.tab}
                style={
                  active
                    ? { background: c("base-default"), color: c("base-contrast-default") }
                    : undefined
                }
                onClick={() => setSelectedId(s.id)}
              >
                {s.name}
              </button>
            );
          })}
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            <div className={styles.surfaceCards}>
              {surfaceCards.map(({ surface, highlight }, i) => {
                const Icon = CARD_ICONS[i];
                return (
                  <div
                    key={surface}
                    className={styles.surfaceCard}
                    style={{
                      background: c(surface),
                      borderColor: highlight ? c("border-default") : c("border-subtle"),
                      borderWidth: highlight ? 2 : 1,
                    }}
                  >
                    <span
                      className={styles.cardIcon}
                      style={{
                        background: highlight ? c("base-default") : c("surface-default"),
                        color: highlight ? c("base-contrast-default") : c("base-default"),
                      }}
                    >
                      <Icon aria-hidden />
                    </span>
                    <h3
                      className={styles.cardTitle}
                      style={{ color: highlight ? c("base-default") : c("text-default") }}
                    >
                      Surface eksempel
                    </h3>
                    <p className={styles.cardBody} style={{ color: c("text-subtle") }}>
                      Et eksempel på innhold som ligger på denne flaten.
                    </p>
                  </div>
                );
              })}
            </div>

            <div
              className={styles.bottomRow}
              style={{ background: c("surface-tinted") }}
            >
              <div
                className={styles.borderPanel}
                style={{ background: c("surface-default"), color: c("text-default") }}
              >
                <h3 className={styles.subTitle}>Border-fargene</h3>
                {[
                  ["Border subtle", "border-subtle"],
                  ["Border default", "border-default"],
                  ["Border strong", "border-strong"],
                ].map(([label, token]) => (
                  <div
                    key={token}
                    className={styles.borderField}
                    style={{ borderColor: c(token), color: c("base-default") }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div
                className={styles.statCard}
                style={{ background: c("surface-default") }}
              >
                <div
                  className={styles.statRing}
                  style={{
                    borderColor: c("base-default"),
                    background: c("surface-tinted"),
                    color: c("base-default"),
                  }}
                >
                  50
                </div>
              </div>
            </div>
          </div>

          <aside
            className={styles.basePanel}
            style={{ background: c("base-default"), color: c("base-contrast-default") }}
          >
            <div
              className={styles.baseGlow}
              style={{ background: c("base-hover") }}
              aria-hidden
            />
            <h3 className={styles.baseTitle}>
              Eksempel som viser de tre base-fargene
            </h3>
            <div className={styles.baseChips}>
              {[
                ["Default", "base-default"],
                ["Hover", "base-hover"],
                ["Active", "base-active"],
              ].map(([label, token]) => (
                <span
                  key={token}
                  className={styles.baseChip}
                  style={{
                    background: c(token),
                    color: c("base-contrast-default"),
                    borderColor: c("base-contrast-subtle"),
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            <div
              className={styles.baseCard}
              style={{ background: c("surface-default"), color: c("text-default") }}
            >
              <strong>Innhold</strong>
              <span style={{ color: c("text-subtle") }}>
                Et kort som ligger oppå base-fargen.
              </span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
