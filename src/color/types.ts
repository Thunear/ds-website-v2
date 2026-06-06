/**
 * The 16 generated steps of a Designsystemet-style colour scale.
 *
 * The first 11 steps (background → text) are "contrast steps": every scale
 * shares the same target relative luminance per step, so the contrast between
 * any two steps is identical across every scale in the theme. The final 5
 * "base" steps are derived from the user's chosen colour directly.
 */
export type ColorStepName =
  | "background-default"
  | "background-tinted"
  | "surface-default"
  | "surface-tinted"
  | "surface-hover"
  | "surface-active"
  | "border-subtle"
  | "border-default"
  | "border-strong"
  | "text-subtle"
  | "text-default"
  | "base-default"
  | "base-hover"
  | "base-active"
  | "base-contrast-subtle"
  | "base-contrast-default";

export type ColorGroup = "background" | "surface" | "border" | "text" | "base";

export type ColorMode = "light" | "dark";

export interface ColorStep {
  name: ColorStepName;
  group: ColorGroup;
  /** Sub-label shown in the grid header, e.g. "Default", "Hover". */
  label: string;
  hex: string;
  /** WCAG relative luminance (0–1) of the produced colour. */
  luminance: number;
}

export interface ColorScale {
  /** User-facing name, e.g. "accent", "brand1". Lowercase a–z, 0–9, "-". */
  name: string;
  /** The source colour the user picked. */
  baseHex: string;
  mode: ColorMode;
  steps: ColorStep[];
}

/** Ordered metadata describing every step and which group it belongs to. */
export const STEP_DEFS: Array<{
  name: ColorStepName;
  group: ColorGroup;
  label: string;
}> = [
  { name: "background-default", group: "background", label: "Default" },
  { name: "background-tinted", group: "background", label: "Tinted" },
  { name: "surface-default", group: "surface", label: "Default" },
  { name: "surface-tinted", group: "surface", label: "Tinted" },
  { name: "surface-hover", group: "surface", label: "Hover" },
  { name: "surface-active", group: "surface", label: "Active" },
  { name: "border-subtle", group: "border", label: "Subtle" },
  { name: "border-default", group: "border", label: "Default" },
  { name: "border-strong", group: "border", label: "Strong" },
  { name: "text-subtle", group: "text", label: "Subtle" },
  { name: "text-default", group: "text", label: "Default" },
  { name: "base-default", group: "base", label: "Default" },
  { name: "base-hover", group: "base", label: "Hover" },
  { name: "base-active", group: "base", label: "Active" },
  { name: "base-contrast-subtle", group: "base", label: "Contrast Subtle" },
  { name: "base-contrast-default", group: "base", label: "Contrast Default" },
];

/** Steps bucketed by group, in order — used to lay out the grid columns. */
export const GRID_GROUPS: Array<{
  group: ColorGroup;
  title: string;
  steps: typeof STEP_DEFS;
}> = (["background", "surface", "border", "text", "base"] as ColorGroup[]).map(
  (group) => ({
    group,
    title: group.charAt(0).toUpperCase() + group.slice(1),
    steps: STEP_DEFS.filter((s) => s.group === group),
  }),
);
