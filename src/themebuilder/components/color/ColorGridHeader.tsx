import { GRID_GROUPS } from "@/themebuilder/color/types";
import styles from "./ColorGridHeader.module.css";

/** The grouped column header (Background / Surface / … + sub-labels), aligned
 *  to the row layout via the shared --label-w / --actions-w / gap tokens. */
export function ColorGridHeader() {
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
