/**
 * Border-radius model. The theme stores a single `borderRadius` number — the
 * *base* value, set by a preset. The six radius variables are derived from it:
 * each has a multiplier of the base and a max cap so that, however large the
 * base gets, small surfaces never out-round large ones (the hierarchy holds).
 *
 * Nothing here is persisted beyond the base number; the cap structure lives in
 * the generated tokens, where it can be tweaked.
 */

export interface RadiusVar {
  /** Full token name, e.g. "border-radius-sm". */
  name: string;
  /** Short label used in compact UI, e.g. "sm". */
  label: string;
  /** Human-readable formula, e.g. "Base × 0.5". */
  formula: string;
  /** Human-readable cap, e.g. "Maks 4px". */
  maxLabel: string;
  /** What this step is meant for (drives the hierarchy story). */
  description: string;
  /** Base multiplier for normal steps. */
  multiplier?: number;
  /** px cap for normal steps; absent = uncapped. */
  max?: number;
  /** Special steps that don't follow the multiplier/cap rule. */
  special?: "default" | "full";
}

/** Value used for the fully-round step; large enough to round any element. */
export const FULL_RADIUS = 9999;

export const RADIUS_VARS: RadiusVar[] = [
  {
    name: "border-radius-sm",
    label: "sm",
    formula: "Base × 0.5",
    maxLabel: "Maks 4px",
    description:
      "Små flater og detaljer — brikker, tags og avkrysningsbokser. Minst avrunding i hierarkiet.",
    multiplier: 0.5,
    max: 4,
  },
  {
    name: "border-radius-md",
    label: "md",
    formula: "Base × 1",
    maxLabel: "Maks 8px",
    description:
      "Skjemafelt og knapper som ikke skal være helt runde. Bremses ved 8px slik at input-felter ikke blir for runde.",
    multiplier: 1,
    max: 8,
  },
  {
    name: "border-radius-lg",
    label: "lg",
    formula: "Base × 2",
    maxLabel: "Maks 20px",
    description: "Kort og mindre paneler.",
    multiplier: 2,
    max: 20,
  },
  {
    name: "border-radius-xl",
    label: "xl",
    formula: "Base × 3",
    maxLabel: "Maks 28px",
    description:
      "Store paneler og seksjoner — den største avrundingen i hierarkiet.",
    multiplier: 3,
    max: 28,
  },
  {
    name: "border-radius-default",
    label: "default",
    formula: "Følger base",
    maxLabel: "Ingen grense",
    description:
      "Standardverdien resten av systemet faller tilbake på. Følger base-verdien direkte.",
    special: "default",
  },
  {
    name: "border-radius-full",
    label: "full",
    formula: "Alltid rund",
    maxLabel: "9999px",
    description:
      "Helt runde flater — pille-knapper, runde avatarer og merker.",
    special: "full",
  },
];

/** A preset the user picks; it sets the base value the scale is generated from. */
export interface RadiusPreset {
  name: string;
  base: number;
}

export const RADIUS_PRESETS: RadiusPreset[] = [
  { name: "Ingen", base: 0 },
  { name: "Small", base: 4 },
  { name: "Medium", base: 8 },
  { name: "Large", base: 12 },
  { name: "Full", base: 999 },
];

/** The resolved px value for a variable, given the current base. */
export function radiusValue(v: RadiusVar, base: number): number {
  if (v.special === "full") return FULL_RADIUS;
  if (v.special === "default") return base;
  const raw = base * (v.multiplier ?? 1);
  return v.max != null ? Math.min(raw, v.max) : raw;
}

/** True when a normal step is being held back by its cap at this base. */
export function isCapped(v: RadiusVar, base: number): boolean {
  if (v.special || v.max == null) return false;
  return base * (v.multiplier ?? 1) > v.max;
}

const BY_LABEL = new Map(RADIUS_VARS.map((v) => [v.label, v]));

/** Resolve a variable's px by its short label (used by previews). */
export function radiusByLabel(label: string, base: number): number {
  const v = BY_LABEL.get(label);
  return v ? radiusValue(v, base) : base;
}

/** The preset whose base matches, if any (so we can highlight it). */
export function matchPreset(base: number): RadiusPreset | undefined {
  return RADIUS_PRESETS.find((p) => p.base === base);
}
