import chroma from "chroma-js";

/**
 * A predefined brand theme for the designsystemet.no front page. A team picks
 * one and the whole site re-brands to it. Each theme is defined by a few source
 * colours; supporting shades are derived (see {@link frontThemeVars}).
 */
export interface FrontTheme {
  id: string;
  label: string;
  /** Primary brand colour: buttons, links, highlights. */
  accent: string;
  /** Supporting colours for decorative shapes (confetti). */
  brand: [string, string, string, string];
  /** The four logo-diamond fills, in the Logo.tsx order (c1..c4). */
  logo: [string, string, string, string];
  /** Font stack — only fonts pre-installed on both Windows and macOS. */
  font: string;
  /** Base corner radius in px; the sm/md/lg scale is derived from it. */
  radius: number;
}

/** Two Win/Mac-safe stacks reused across themes: a clean sans and an elegant serif. */
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

export const FRONT_THEMES: FrontTheme[] = [
  {
    // Default — keeps today's Designsystemet expression (matches Logo.tsx).
    id: "designsystemet",
    label: "Designsystemet",
    accent: "#0062BA",
    brand: ["#1E98F5", "#F45F63", "#E5AA20", "#68707C"],
    logo: ["#1E98F5", "#68707C", "#E5AA20", "#F45F63"],
    font: SANS,
    radius: 8,
  },
  {
    id: "skog",
    label: "Skog",
    accent: "#0D7A5F",
    brand: ["#13A37F", "#7FB069", "#E0A458", "#2E5E4E"],
    logo: ["#13A37F", "#2E5E4E", "#E0A458", "#7FB069"],
    font: SANS,
    radius: 3,
  },
  {
    id: "plomme",
    label: "Plomme",
    accent: "#7B4FB0",
    brand: ["#9B6DD6", "#E26D9E", "#F0B450", "#5B4A7A"],
    logo: ["#9B6DD6", "#5B4A7A", "#F0B450", "#E26D9E"],
    font: SERIF,
    radius: 16,
  },
  {
    id: "solnedgang",
    label: "Solnedgang",
    // Darkened so white text clears 4.5:1 (was #D9533B at 4.0:1 → dark on-accent).
    accent: "#C53F2A",
    brand: ["#F2724B", "#F2A03D", "#E5573F", "#9C4A3C"],
    logo: ["#F2724B", "#9C4A3C", "#F2A03D", "#E5573F"],
    font: SERIF,
    radius: 11,
  },
  {
    id: "hav",
    label: "Hav",
    accent: "#0A7D9C",
    brand: ["#1AA6C2", "#43C6B8", "#5B8DEF", "#2C5F73"],
    logo: ["#1AA6C2", "#2C5F73", "#43C6B8", "#5B8DEF"],
    font: SANS,
    radius: 20,
  },
];

export const DEFAULT_FRONT_THEME = FRONT_THEMES[0];

export function getFrontTheme(id: string | null | undefined): FrontTheme {
  return FRONT_THEMES.find((t) => t.id === id) ?? DEFAULT_FRONT_THEME;
}

/** Pick black or white text for best contrast on a background colour. */
function onColor(bg: string): string {
  return chroma.contrast(bg, "white") >= 4.5 ? "#ffffff" : "#1a1d21";
}

/**
 * The CSS custom properties for a theme. Spread onto a wrapper element; every
 * themed surface on the front page reads these via `var(--fb-*)` / `var(--logo-*)`.
 *
 * `dark` flips the surfaces/text the brand sits on: tints mix toward a dark
 * surface and accent text is lightened so it stays readable on a dark page.
 */
export function frontThemeVars(t: FrontTheme, dark = false): Record<string, string> {
  const accent = chroma(t.accent);
  // Accent used as text/links on the page background (must read on light + dark).
  const accentText = dark ? chroma.mix(accent, "white", 0.5, "rgb") : accent;
  // Soft "tint" surface (badges, secondary buttons, hero band).
  const tint = dark
    ? chroma.mix(accent, "#161b24", 0.84, "rgb")
    : chroma.mix(accent, "white", 0.86, "rgb");
  // Text/icons sitting on that tint surface.
  const onTint = dark ? accentText : accent.darken(0.7);
  return {
    "--fb-accent": accent.hex(),
    "--fb-accent-hover": accent.darken(0.7).hex(),
    "--fb-accent-tint": tint.hex(),
    "--fb-accent-text": accentText.hex(),
    "--fb-on-accent": onColor(t.accent),
    "--fb-on-tint": onTint.hex(),
    "--fb-shape-1": t.brand[0],
    "--fb-shape-2": t.brand[1],
    "--fb-shape-3": t.brand[2],
    "--fb-shape-4": t.brand[3],
    "--logo-c1": t.logo[0],
    "--logo-c2": t.logo[1],
    "--logo-c3": t.logo[2],
    "--logo-c4": t.logo[3],
    "--fb-font": t.font,
    // Override the global radius scale for the storefront subtree so cards,
    // inputs and badges change shape with the theme (pills stay pills).
    "--radius-sm": `${Math.round(t.radius / 2)}px`,
    "--radius-md": `${t.radius}px`,
    "--radius-lg": `${Math.round(t.radius * 1.6)}px`,
  };
}
