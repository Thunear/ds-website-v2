import { useState } from "react";
import { useThemeStore } from "@/themebuilder/theme/ThemeStore";
import { PencilIcon, PlusIcon } from "@/shared/ui/icons";
import styles from "./ThemeBar.module.css";

export function ThemeBar() {
  const { config, activeTheme, selectTheme, addTheme, renameTheme } =
    useThemeStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(activeTheme.name);

  const commitRename = () => {
    const name = draft.trim();
    if (name) renameTheme(activeTheme.id, name);
    else setDraft(activeTheme.name);
    setEditing(false);
  };

  return (
    <section className={styles.bar}>
      <div className={styles.deco} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.title}>
          {editing ? (
            <input
              autoFocus
              className={styles.titleInput}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setDraft(activeTheme.name);
                  setEditing(false);
                }
              }}
            />
          ) : (
            <>
              <h1>{activeTheme.name}</h1>
              <button
                className={styles.editBtn}
                aria-label="Endre navn på tema"
                onClick={() => {
                  setDraft(activeTheme.name);
                  setEditing(true);
                }}
              >
                <PencilIcon aria-hidden />
              </button>
            </>
          )}
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
