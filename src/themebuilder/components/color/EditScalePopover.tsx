import { useState } from "react";
import { isValidScaleName } from "@/themebuilder/color/scale";
import { TrashIcon } from "@/shared/ui/icons";
import styles from "./EditScalePopover.module.css";

interface Props {
  name: string;
  onRename: (name: string) => void;
  onDelete: () => void;
}

/** Content of the "Rediger" popover: rename + delete a colour scale. */
export function EditScalePopover({ name, onRename, onDelete }: Props) {
  const [draft, setDraft] = useState(name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const valid = isValidScaleName(draft);

  if (confirmingDelete) {
    return (
      <div className={styles.root}>
        <h3>Slette {name} farge?</h3>
        <p className={styles.desc}>Er du sikker på at du vil slette denne fargen?</p>
        <div className={styles.actions}>
          <button
            className={styles.secondary}
            onClick={() => setConfirmingDelete(false)}
          >
            Nei, behold fargen
          </button>
          <button className={styles.danger} onClick={onDelete}>
            Ja, slett
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <h3>Rediger {name}</h3>
      <label className={styles.label}>Navn</label>
      <p className={styles.hint}>Bruk kun bokstavene a–z, tall og bindestrek</p>
      <input
        className={styles.input}
        value={draft}
        onChange={(e) => {
          const next = e.target.value.toLowerCase();
          setDraft(next);
          // Commit live so the row + generated CSS vars update as you type;
          // only push valid names to keep the config clean.
          if (isValidScaleName(next)) onRename(next);
        }}
        aria-invalid={!valid}
      />
      {!valid && <p className={styles.error}>Ugyldig navn.</p>}
      <button
        className={styles.deleteLink}
        onClick={() => setConfirmingDelete(true)}
      >
        <TrashIcon aria-hidden /> Slett fargeskala
      </button>
    </div>
  );
}
