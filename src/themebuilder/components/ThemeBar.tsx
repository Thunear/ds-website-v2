import { useState, type CSSProperties } from "react";
import chroma from "chroma-js";
import { useThemeStore } from "@/themebuilder/theme/ThemeStore";
import { PencilIcon, PlusIcon, TrashIcon } from "@/shared/ui/icons";
import { Popover } from "@/shared/ui/Popover";
import styles from "./ThemeBar.module.css";

/** The active theme's source accent colour drives the bar's tint + active pill. */
function barVars(accentHex: string): CSSProperties {
  const accent = chroma(accentHex);
  return {
    "--bar-accent": accent.hex(),
    "--bar-on-accent": chroma.contrast(accentHex, "white") >= 4.5 ? "#fff" : "#1a1d21",
    "--bar-tint": chroma.mix(accent, "white", 0.82, "rgb").hex(),
    "--bar-tint-2": chroma.mix(accent, "white", 0.6, "rgb").hex(),
  } as CSSProperties;
}

export function ThemeBar() {
  const { config, activeTheme, selectTheme, addTheme, renameTheme, removeTheme } =
    useThemeStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(activeTheme.name);
  const [confirming, setConfirming] = useState(false);

  const canDelete = config.themes.length > 1;
  const accentHex =
    activeTheme.colors.find((s) => s.name === "accent")?.hex ?? "#0062BA";

  return (
    <section className={styles.bar} style={barVars(accentHex)}>
      <div className={styles.deco} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.title}>
          <h1>{activeTheme.name}</h1>
          <Popover
            placement="bottom"
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (o) {
                setDraft(activeTheme.name);
                setConfirming(false);
              }
            }}
            trigger={
              <button className={styles.editBtn} aria-label="Rediger tema">
                <PencilIcon aria-hidden />
              </button>
            }
          >
            {confirming ? (
              <div className={styles.editPop}>
                <h3 className={styles.editTitle}>Slette «{activeTheme.name}»?</h3>
                <p className={styles.editHint}>Dette kan ikke angres.</p>
                <div className={styles.editActions}>
                  <button
                    className={styles.secondary}
                    onClick={() => setConfirming(false)}
                  >
                    Behold
                  </button>
                  <button
                    className={styles.danger}
                    onClick={() => {
                      removeTheme(activeTheme.id);
                      setOpen(false);
                    }}
                  >
                    Ja, slett
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.editPop}>
                <label className={styles.editLabel} htmlFor="theme-name">
                  Navn på tema
                </label>
                <input
                  id="theme-name"
                  autoFocus
                  className={styles.editInput}
                  value={draft}
                  onChange={(e) => {
                    const next = e.target.value;
                    setDraft(next);
                    // Commit live so the title updates as you type.
                    if (next.trim()) renameTheme(activeTheme.id, next.trim());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setOpen(false);
                  }}
                />
                {canDelete && (
                  <button
                    className={styles.deleteLink}
                    onClick={() => setConfirming(true)}
                  >
                    <TrashIcon aria-hidden /> Slett tema
                  </button>
                )}
              </div>
            )}
          </Popover>
        </div>

        <div className={styles.switcher}>
          {config.themes.map((t) => (
            <button
              key={t.id}
              className={t.id === activeTheme.id ? styles.themePillActive : styles.themePill}
              onClick={() => selectTheme(t.id)}
            >
              {t.name}
            </button>
          ))}
          <button className={styles.addBtn} onClick={() => addTheme()}>
            <PlusIcon aria-hidden /> Legg til tema
          </button>
        </div>
      </div>
    </section>
  );
}
