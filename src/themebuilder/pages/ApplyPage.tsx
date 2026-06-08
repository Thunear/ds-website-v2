import { useMemo, useState, type ReactNode } from "react";
import { useThemeStore } from "@/themebuilder/theme/ThemeStore";
import { buildConfigJson } from "@/themebuilder/theme/exportConfig";
import { CopyIcon } from "@/shared/ui/icons";
import styles from "./ApplyPage.module.css";

const TOKEN =
  /"(?:\\.|[^"\\])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

/** Lightweight JSON syntax highlighting (no dependency). */
function highlight(json: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN.exec(json)) !== null) {
    if (m.index > last) nodes.push(json.slice(last, m.index));
    const tok = m[0];
    let cls = styles.num;
    if (tok.startsWith('"')) cls = /:\s*$/.test(tok) ? styles.key : styles.str;
    else if (tok === "true" || tok === "false" || tok === "null") cls = styles.lit;
    nodes.push(
      <span key={key++} className={cls}>
        {tok}
      </span>,
    );
    last = m.index + tok.length;
  }
  if (last < json.length) nodes.push(json.slice(last));
  return nodes;
}

export function ApplyPage() {
  const { config } = useThemeStore();
  const json = useMemo(() => buildConfigJson(config), [config]);
  const highlighted = useMemo(() => highlight(json), [json]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard?.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h2>Ta i bruk</h2>
          <p className={styles.lead}>
            Konfigurasjonsfilen for temaene dine. Lagre den i prosjektet og
            generer design-tokens og CSS med Designsystemet-CLI. Den er
            kilden-til-sannhet — endrer du fargene her, oppdateres fila.
          </p>
        </div>
        <button className={styles.copyBtn} onClick={copy}>
          <CopyIcon aria-hidden /> {copied ? "Kopiert!" : "Kopier"}
        </button>
      </div>

      <pre className={styles.code}>
        <code>{highlighted}</code>
      </pre>
    </div>
  );
}
