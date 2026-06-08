import styles from "./Confetti.module.css";

/**
 * Decorative geometric shapes scattered behind the hero. Purely decorative
 * (aria-hidden); colours follow the selected theme via `var(--fb-shape-*)`.
 */
export function Confetti() {
  return (
    <div className={styles.field} aria-hidden>
      <span className={`${styles.shape} ${styles.square1}`} />
      <span className={`${styles.shape} ${styles.circle1}`} />
      <span className={`${styles.shape} ${styles.triangle1}`} />
      <span className={`${styles.shape} ${styles.square2}`} />
      <span className={`${styles.shape} ${styles.circle2}`} />
      <span className={`${styles.shape} ${styles.triangle2}`} />
      <span className={`${styles.shape} ${styles.square3}`} />
      <span className={`${styles.shape} ${styles.circle3}`} />
    </div>
  );
}
