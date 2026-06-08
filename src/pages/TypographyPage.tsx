import { Fragment, useState } from "react";
import { useThemeStore } from "@/theme/ThemeStore";
import type { FontConfig, SizeMode, TypographyComponent } from "@/theme/config";
import * as T from "@/theme/typography";
import { Popover } from "@/components/ui/Popover";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { EditScalePopover } from "@/components/color/EditScalePopover";
import styles from "./TypographyPage.module.css";

export function TypographyPage() {
  const { activeTheme, updateTypography: up, setActiveMode } = useThemeStore();
  const typo = activeTheme.typography;
  const modes = activeTheme.sizing.modes;
  const modeNames = modes.map((m) => m.name);
  const activeMode = activeTheme.sizing.activeMode;
  const modeFontSizes = Object.fromEntries(
    modes.map((m) => [m.name, m.fontSize]),
  );

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h2>Typografi</h2>
          <p className={styles.lead}>
            Hver font får en modulær skala (et anker-steg + et forhold), så
            størrelsene genereres automatisk og skalerer med størrelses-modusene
            fra Størrelser-siden. Ankeret er body (= modus-font-size): steg{" "}
            <em>under</em> ankeret blir mindre (small/detail/tags), steg{" "}
            <em>over</em> blir større (headinger). Overstyr en celle når du
            trenger en helt eksakt px.
          </p>
        </div>
      </div>

      {/* Steps */}
      <section className={styles.section}>
        <h3>Steg</h3>
        <p className={styles.sub}>
          De navngitte trinnene komponentene peker til (f.eks. 1–9), delt på
          tvers av alle fonter. Hvert steg får en generert px-verdi ut fra
          fontens anker og forhold.
        </p>
        <div className={styles.chipGroups}>
          <ChipList
            items={typo.steps}
            numeric
            onRename={(o, n) => up((t) => T.renameStep(t, o, n))}
            onRemove={(name) => up((t) => T.removeStep(t, name))}
            onAdd={(name) => up((t) => T.addStep(t, name))}
            canRemove={typo.steps.length > 1}
          />
        </div>
      </section>

      {/* Fonts */}
      <section className={styles.section}>
        <h3>Fonter</h3>
        <div className={styles.fonts}>
          {typo.fonts.map((font) => (
            <FontCard
              key={font.id}
              font={font}
              steps={typo.steps}
              modes={modes}
              activeMode={activeMode}
              canDelete={typo.fonts.length > 1}
            />
          ))}
        </div>
        <button className={styles.addRow} onClick={() => up((t) => T.addFont(t))}>
          <PlusIcon aria-hidden /> Legg til font
        </button>
      </section>

      {/* Components */}
      <section className={styles.section}>
        <div className={styles.componentsHead}>
          <h3>Komponenter</h3>
          <div className={styles.modeSwitch} role="group" aria-label="Aktiv størrelse">
            <span className={styles.modeSwitchLabel}>Aktiv størrelse</span>
            <div className={styles.segmented}>
              {modeNames.map((m) => (
                <button
                  key={m}
                  className={m === activeMode ? styles.segActive : styles.seg}
                  onClick={() => setActiveMode(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.components}>
          {typo.components.map((comp) => (
            <ComponentRow
              key={comp.id}
              comp={comp}
              activeMode={activeMode}
              modes={modeNames}
              modeFontSizes={modeFontSizes}
            />
          ))}
        </div>
        <button
          className={styles.addRow}
          onClick={() => up((t) => T.addComponent(t, ""))}
        >
          <PlusIcon aria-hidden /> Legg til komponent
        </button>
      </section>
    </div>
  );
}

/* ---------------- chips (steps) ---------------- */

function ChipList({
  title,
  description,
  items,
  onRename,
  onRemove,
  onAdd,
  canRemove,
  numeric = false,
}: {
  title?: string;
  description?: string;
  items: string[];
  onRename: (oldName: string, newName: string) => void;
  onRemove: (name: string) => void;
  onAdd: (name: string) => void;
  canRemove: boolean;
  numeric?: boolean;
}) {
  const [adding, setAdding] = useState("");
  const nextNumber = () => {
    const max = Math.max(0, ...items.map(Number).filter((n) => !Number.isNaN(n)));
    return String(max + 1);
  };
  return (
    <div className={styles.chipGroup}>
      {title && <span className={styles.chipTitle}>{title}</span>}
      {description && <p className={styles.chipDesc}>{description}</p>}
      <div className={styles.chips}>
        {items.map((name) => (
          <span key={name} className={styles.chip}>
            <EditableText value={name} onCommit={(v) => onRename(name, v)} />
            {canRemove && (
              <button
                className={styles.chipRemove}
                aria-label={`Fjern ${name}`}
                onClick={() => onRemove(name)}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {numeric ? (
          <button className={styles.smallAdd} onClick={() => onAdd(nextNumber())}>
            + Legg til
          </button>
        ) : (
          <input
            className={styles.chipAdd}
            placeholder="+ ny"
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && adding.trim()) {
                onAdd(adding.trim());
                setAdding("");
              }
            }}
            onBlur={() => {
              if (adding.trim()) onAdd(adding.trim());
              setAdding("");
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- font card ---------------- */

function FontCard({
  font,
  steps,
  modes,
  activeMode,
  canDelete,
}: {
  font: FontConfig;
  steps: string[];
  modes: SizeMode[];
  activeMode: string;
  canDelete: boolean;
}) {
  const { updateTypography: up } = useThemeStore();
  const matchedRatio = T.RATIOS.find(
    (r) => Math.abs(r.value - font.scale.ratio) < 0.001,
  );
  return (
    <div className={styles.fontCard}>
      <div className={styles.fontHead}>
        <label className={styles.field}>
          <span>Navn</span>
          <input
            value={font.name}
            onChange={(e) =>
              up((t) => T.updateFont(t, font.id, { name: e.target.value }))
            }
          />
        </label>
        <label className={styles.field}>
          <span>Font-familie</span>
          <input
            value={font.fontFamily}
            onChange={(e) =>
              up((t) => T.updateFont(t, font.id, { fontFamily: e.target.value }))
            }
          />
        </label>
        {canDelete && (
          <button
            className={`${styles.iconBtn} ${styles.danger}`}
            aria-label="Slett font"
            onClick={() => up((t) => T.removeFont(t, font.id))}
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <div className={styles.weights}>
        <div className={styles.weightsHead}>
          <span className={styles.subLabel}>Vekter</span>
          <span className={styles.weightHint}>
            navn komponenter peker til → Figma-stilnavn
          </span>
        </div>
        <div className={styles.weightsRow}>
          {font.weights.map((w, i) => (
            <span key={i} className={styles.weight}>
              <input
                className={styles.weightName}
                value={w.name}
                placeholder="navn"
                onChange={(e) =>
                  up((t) => T.updateWeight(t, font.id, i, { name: e.target.value }))
                }
              />
              <input
                className={styles.weightVal}
                value={w.value}
                placeholder="Figma-stil"
                onChange={(e) =>
                  up((t) => T.updateWeight(t, font.id, i, { value: e.target.value }))
                }
              />
              <button
                className={styles.chipRemove}
                aria-label="Fjern vekt"
                onClick={() => up((t) => T.removeWeight(t, font.id, i))}
              >
                ×
              </button>
            </span>
          ))}
          <button
            className={styles.smallAdd}
            onClick={() => up((t) => T.addWeight(t, font.id))}
          >
            + vekt
          </button>
        </div>
      </div>

      {/* Modular scale: anchor + ratio drive the whole generated table. */}
      <div className={styles.scaleRow}>
        <label className={styles.field}>
          <span>Anker-steg (= modus-font-size)</span>
          <select
            value={font.scale.anchorStep}
            onChange={(e) =>
              up((t) => T.setFontScale(t, font.id, { anchorStep: e.target.value }))
            }
          >
            {steps.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Forhold</span>
          <select
            value={matchedRatio ? String(matchedRatio.value) : "custom"}
            onChange={(e) => {
              if (e.target.value === "custom") return;
              up((t) =>
                T.setFontScale(t, font.id, { ratio: Number(e.target.value) }),
              );
            }}
          >
            {T.RATIOS.map((r) => (
              <option key={r.name} value={r.value}>
                {r.name} · {r.value}
              </option>
            ))}
            <option value="custom">Egendefinert</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>Verdi</span>
          <input
            className={styles.ratioInput}
            type="number"
            step={0.001}
            min={1}
            value={font.scale.ratio}
            onChange={(e) =>
              up((t) =>
                T.setFontScale(t, font.id, { ratio: Number(e.target.value) }),
              )
            }
          />
        </label>
      </div>

      <div className={styles.scaleBody}>
      <table className={styles.sizeTable}>
        <thead>
          <tr>
            <th className={styles.cornerCell}>steg</th>
            {modes.map((m) => (
              <th key={m.name}>
                {m.name}
                <span className={styles.colSub}>{m.fontSize}px</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {steps.map((step) => (
            <tr key={step}>
              <th className={styles.stepCell}>
                {step}
                {step === font.scale.anchorStep && (
                  <span className={styles.anchorTag}>anker</span>
                )}
              </th>
              {modes.map((m) => {
                const generated = T.generatedSize(steps, font, m.fontSize, step);
                const override = font.overrides?.[m.name]?.[step];
                const isOverridden = override != null;
                return (
                  <td key={m.name}>
                    <span
                      className={`${styles.cell} ${
                        isOverridden ? styles.cellPinned : ""
                      }`}
                    >
                      <input
                        type="number"
                        value={override ?? ""}
                        placeholder={String(generated)}
                        onChange={(e) =>
                          up((t) =>
                            T.setOverride(
                              t,
                              font.id,
                              m.name,
                              step,
                              e.target.value === "" ? null : Number(e.target.value),
                            ),
                          )
                        }
                      />
                      {isOverridden && (
                        <button
                          className={styles.cellReset}
                          aria-label="Tilbakestill til generert"
                          title="Tilbakestill til generert"
                          onClick={() =>
                            up((t) =>
                              T.setOverride(t, font.id, m.name, step, null),
                            )
                          }
                        >
                          ×
                        </button>
                      )}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

        <Specimen
          font={font}
          steps={steps}
          modes={modes}
          activeMode={activeMode}
        />
      </div>
    </div>
  );
}

/** Visual type-scale specimen: a grid of all modes side by side, each step
    rendered at its generated px so the modular rise (the ratio) is visible. */
function Specimen({
  font,
  steps,
  modes,
  activeMode,
}: {
  font: FontConfig;
  steps: string[];
  modes: SizeMode[];
  activeMode: string;
}) {
  return (
    <div className={styles.specimen}>
      <div
        className={styles.specimenGrid}
        style={{
          gridTemplateColumns: `max-content repeat(${modes.length}, max-content)`,
        }}
      >
        <span className={styles.specimenCorner}>steg</span>
        {modes.map((m) => (
          <span
            key={m.name}
            className={`${styles.specimenHead} ${
              m.name === activeMode ? styles.specimenHeadActive : ""
            }`}
          >
            {m.name}
            <span className={styles.specimenHeadPx}>{m.fontSize}px</span>
          </span>
        ))}
        {steps.map((step) => {
          const isAnchor = step === font.scale.anchorStep;
          return (
            <Fragment key={step}>
              <span className={styles.specimenStepCell}>
                {step}
                {isAnchor && (
                  <span className={styles.specimenAnchor}>anker</span>
                )}
              </span>
              {modes.map((m) => {
                const size = T.resolveFontSize(
                  steps,
                  font,
                  m.name,
                  m.fontSize,
                  step,
                );
                return (
                  <span key={m.name} className={styles.specimenCell}>
                    <span
                      className={styles.specimenSample}
                      style={{
                        fontFamily: font.fontFamily,
                        fontSize: `${size}px`,
                      }}
                    >
                      Ag
                    </span>
                    <span className={styles.specimenCellPx}>{size}</span>
                  </span>
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- component row ---------------- */

function ComponentRow({
  comp,
  activeMode,
  modes,
  modeFontSizes,
}: {
  comp: TypographyComponent;
  activeMode: string;
  modes: string[];
  modeFontSizes: Record<string, number>;
}) {
  const { activeTheme, updateTypography: up } = useThemeStore();
  const typo = activeTheme.typography;
  const font = typo.fonts.find((f) => f.id === comp.fontId) ?? typo.fonts[0];
  const resolved = T.resolveComponent(typo, comp, activeMode, modeFontSizes);

  return (
    <div className={styles.componentRow}>
      <div className={styles.previewCol}>
        <div className={styles.compNameRow}>
          <span className={styles.compName}>{comp.name}</span>
          {comp.locked ? (
            <span className={styles.lockedTag}>påkrevd</span>
          ) : (
            <Popover
              placement="bottom-start"
              trigger={
                <button className={styles.iconBtn} aria-label="Rediger komponent">
                  <PencilIcon />
                </button>
              }
            >
              <EditScalePopover
                name={comp.name}
                onRename={(name) =>
                  up((t) => T.updateComponent(t, comp.id, { name }))
                }
                onDelete={() => up((t) => T.removeComponent(t, comp.id))}
              />
            </Popover>
          )}
          <span className={styles.previewMeta}>
            {resolved.fontFamily} · {resolved.size}px · {resolved.weight} ·{" "}
            {resolved.mode}
          </span>
        </div>
        <span
          className={styles.previewText}
          style={{
            fontFamily: resolved.fontFamily,
            fontSize: `${resolved.size}px`,
            fontWeight: resolved.weight,
          }}
        >
          Aa Gj 123
        </span>
      </div>

      <div className={styles.compControls}>
        <Select
          label="Font"
          value={comp.fontId}
          options={typo.fonts.map((f) => ({ value: f.id, label: f.name }))}
          onChange={(v) => up((t) => T.updateComponent(t, comp.id, { fontId: v }))}
        />
        <Select
          label="Steg"
          value={comp.step}
          options={typo.steps.map((s) => ({ value: s, label: s }))}
          onChange={(v) => up((t) => T.updateComponent(t, comp.id, { step: v }))}
        />
        <Select
          label="Vekt"
          value={comp.weight}
          options={font.weights.map((w) => ({ value: w.name, label: w.name }))}
          onChange={(v) => up((t) => T.updateComponent(t, comp.id, { weight: v }))}
        />
        <Select
          label="Størrelse"
          value={comp.mode ?? ""}
          options={[
            { value: "", label: "Følg aktiv" },
            ...modes.map((m) => ({ value: m, label: m })),
          ]}
          onChange={(v) =>
            up((t) => T.updateComponent(t, comp.id, { mode: v || undefined }))
          }
        />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EditableText({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <input
      className={styles.chipInput}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft.trim() && draft !== value && onCommit(draft.trim())}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      size={Math.max(4, draft.length)}
    />
  );
}
