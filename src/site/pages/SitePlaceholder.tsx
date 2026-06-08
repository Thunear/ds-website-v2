import styles from "./SitePlaceholder.module.css";

/** Placeholder for designsystemet.no sections not built yet (Grunnleggende, …). */
export function SitePlaceholder({ title }: { title: string }) {
  return (
    <div className={styles.placeholder}>
      <h1>{title}</h1>
      <p>Innhold kommer.</p>
    </div>
  );
}
