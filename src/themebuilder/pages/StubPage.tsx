import styles from "./StubPage.module.css";

/** Placeholder for tabs not yet built — keeps the system extensible. */
export function StubPage({ title }: { title: string }) {
  return (
    <div className={styles.stub}>
      <h2>{title}</h2>
      <p>Denne fanen er ikke bygget ennå.</p>
    </div>
  );
}
