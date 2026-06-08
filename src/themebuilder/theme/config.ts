/**
 * The theme config model. This mirrors the config file that is the source of
 * truth for the whole pipeline (themebuilder → code → Figma). The themebuilder
 * only ever reads/writes this shape; everything else (the colour grid, etc.) is
 * derived from it.
 */
import type { ColorMode, ColorStepName } from "@/themebuilder/color/types";

/**
 * A semantic scale (the main grid): the user picks a source colour and the 16
 * named steps are generated, following the theme's global lightness curve.
 */
export interface ColorScaleConfig {
  /** Stable id, independent of the (renameable) name. */
  id: string;
  name: string;
  /** The source colour the user picked; the 16 steps are generated from it. */
  hex: string;
  /** Manual per-step hex overrides (per mode) that win over generated values. */
  overrides?: Partial<
    Record<ColorMode, Partial<Record<ColorStepName, string>>>
  >;
  /** Per-step chroma multiplier (per mode), default 1; preserves luminance. */
  chroma?: Partial<Record<ColorMode, Partial<Record<ColorStepName, number>>>>;
}

/** Alias for readability where a value is specifically a semantic scale. */
export type SemanticScaleConfig = ColorScaleConfig;

/**
 * One colour inside a custom group: a base hue rendered across the group's
 * shared lightness ramp, optionally with a per-step saturation multiplier.
 */
export interface CustomColor {
  id: string;
  name: string;
  hex: string;
  /** Per-step chroma multiplier (length = group steps); absent = all 1. */
  chroma?: number[];
}

/**
 * A custom colour group: a free ramp for charts/graphics. The group owns the
 * step count and the lightness of every step; each colour in it is drawn across
 * that shared ramp. Not bound by the semantic contrast curve.
 */
export interface CustomGroup {
  id: string;
  name: string;
  /** Shared target relative luminance (0–1) per step; length = step count. */
  lightness: number[];
  colors: CustomColor[];
}

/** Fixed semantic status colours. The user may recolour them, not rename/add. */
export type SeverityName = "info" | "success" | "warning" | "danger";

export const SEVERITY_NAMES: SeverityName[] = [
  "info",
  "success",
  "warning",
  "danger",
];

export const SEVERITY_DEFAULTS: Record<SeverityName, string> = {
  info: "#0A71C0",
  success: "#068718",
  warning: "#EA9B1B",
  danger: "#C01B1B",
};

/**
 * A named font weight. `value` is the Figma style name (e.g. "Medium",
 * "Semi bold") — kept as a string because Figma needs it; the preview maps it
 * to a numeric CSS weight.
 */
export interface FontWeight {
  name: string;
  value: string;
}

/**
 * A modular type scale: the step named `anchorStep` equals the mode-font-size
 * (ratio^0), and each step away from it is multiplied by `ratio`. So sizes are
 * generated, not hand-typed, and scale across modes via the mode-font-size.
 */
export interface FontScale {
  anchorStep: string;
  ratio: number;
}

/**
 * A font: a family + its weights + a modular scale. Sizes are generated from
 * the scale; `overrides[mode][step]` holds only the cells the user pinned to a
 * specific px (e.g. a fixed tiny Detail), and wins over the generated value.
 */
export interface FontConfig {
  id: string;
  name: string;
  fontFamily: string;
  weights: FontWeight[];
  scale: FontScale;
  overrides?: Record<string, Record<string, number>>;
}

/** A typography component (heading, body, label …) → font + step + weight. */
export interface TypographyComponent {
  id: string;
  name: string;
  /** heading/body are required and can't be renamed or deleted. */
  locked?: boolean;
  fontId: string;
  step: string;
  weight: string;
  /** Optional mode override; otherwise follows the active mode. */
  mode?: string;
}

export interface TypographyConfig {
  /** Shared size-step names (base, lg, xl, 2xl …), ordered. */
  steps: string[];
  fonts: FontConfig[];
  components: TypographyComponent[];
}

/**
 * One size mode (sm/md/lg, or a custom one like "kompakt"). `fontSize` is the
 * Designsystemet `--ds-size-mode-font-size`: the context font-size that drives
 * the whole generated size scale, and the axis typography scales along too.
 */
export interface SizeMode {
  name: string;
  /** mode-font-size in px. */
  fontSize: number;
}

/**
 * The sizing system. `base` + `step` set the global rhythm; each mode supplies
 * a `fontSize`. Every size token N is generated as
 *   unit  = step / base × mode-font-size
 *   sizeN = floor(unit × N)            (round down to 1px)
 * Modes here are the single source of truth shared with typography.
 */
export interface SizingConfig {
  /** Reference font-size the scale is calibrated against (e.g. 18). */
  base: number;
  /** Grunnrytmen — px per "hakk" (e.g. 4). */
  step: number;
  modes: SizeMode[];
  /** Currently previewed mode (shared with typography). */
  activeMode: string;
}

/** Designsystemet's standard size-token keys: 0–15 then 18, 22, 26, 30. */
export const SIZE_TOKENS: number[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 22, 26, 30,
];

export function defaultSizing(): SizingConfig {
  return {
    base: 18,
    step: 4,
    modes: [
      { name: "sm", fontSize: 16 },
      { name: "md", fontSize: 18 },
      { name: "lg", fontSize: 21 },
    ],
    activeMode: "md",
  };
}

export function defaultTypography(): TypographyConfig {
  const fontId = makeId("font");
  const heading = (name: string, step: string): TypographyComponent => ({
    id: makeId("comp"),
    name: `heading-${name}`,
    locked: true,
    fontId,
    step,
    weight: "semibold",
  });

  const text = (name: string, step: string): TypographyComponent => ({
    id: makeId("comp"),
    name,
    fontId,
    step,
    weight: "regular",
  });

  // Size steps are a numeric ladder. The body anchor sits at step "3" so there
  // is room *below* it (steps 1–2 → smaller than body, e.g. small/detail tags)
  // and above it (steps 4–9 → headings). Sizes are generated from the scale.
  return {
    steps: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    fonts: [
      {
        id: fontId,
        name: "primary",
        fontFamily: "Inter",
        weights: [
          { name: "regular", value: "Regular" },
          { name: "medium", value: "Medium" },
          { name: "semibold", value: "Semibold" },
        ],
        scale: { anchorStep: "3", ratio: 1.2 },
      },
    ],
    components: [
      heading("2xl", "9"),
      heading("xl", "8"),
      heading("lg", "7"),
      heading("md", "6"),
      heading("sm", "5"),
      heading("xs", "4"),
      { id: makeId("comp"), name: "body", locked: true, fontId, step: "3", weight: "regular" },
      text("small", "2"),
      text("detail", "1"),
    ],
  };
}

export interface ThemeConfig {
  id: string;
  name: string;
  /** Semantic scales shown in the main grid. */
  colors: ColorScaleConfig[];
  /** Custom colour groups (charts/graphics). */
  customGroups: CustomGroup[];
  /** Source colours for the fixed severity scales. */
  severity: Record<SeverityName, string>;
  /** Fonts + typography components. */
  typography: TypographyConfig;
  /** Sizing system (base/step + shared modes) for spacing & scaling. */
  sizing: SizingConfig;
  /**
   * Per-mode lightness curve for the semantic scales (the 11 contrast steps in
   * grid order). Absent = the Designsystemet defaults.
   */
  lightness?: Partial<Record<ColorMode, number[]>>;
  /** Room for the other tabs — populated later. */
  borderRadius: number;
}

export interface BuilderConfig {
  activeThemeId: string;
  mode: ColorMode;
  themes: ThemeConfig[];
}

let idCounter = 0;
export function makeId(prefix = "id"): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function createScale(name: string, hex: string): ColorScaleConfig {
  return { id: makeId("scale"), name, hex };
}

/** Evenly spaced luminance ramp (lightest → darkest) for a new custom group. */
export function defaultCustomLightness(steps: number): number[] {
  const top = 0.95;
  const bottom = 0.08;
  if (steps <= 1) return [top];
  return Array.from({ length: steps }, (_, i) =>
    Number((top - (i / (steps - 1)) * (top - bottom)).toFixed(3)),
  );
}

export function createCustomColor(name: string, hex: string): CustomColor {
  return { id: makeId("color"), name, hex };
}

export function createCustomGroup(
  name: string,
  hex: string,
  steps = 9,
): CustomGroup {
  return {
    id: makeId("group"),
    name,
    lightness: defaultCustomLightness(steps),
    colors: [createCustomColor("farge-1", hex)],
  };
}

export function createTheme(name: string): ThemeConfig {
  return {
    id: makeId("theme"),
    name,
    colors: [
      createScale("accent", "#0062BA"),
      createScale("brand1", "#0D7A5F"),
      createScale("brand2", "#b07ab7"),
      createScale("neutral", "#24272B"),
    ],
    customGroups: [],
    severity: { ...SEVERITY_DEFAULTS },
    typography: defaultTypography(),
    sizing: defaultSizing(),
    borderRadius: 4,
  };
}

export function defaultBuilderConfig(): BuilderConfig {
  const first = createTheme("Mitt flotte tema");
  const second = createTheme("Mitt andre tema");
  return {
    activeThemeId: first.id,
    mode: "light",
    themes: [first, second],
  };
}
