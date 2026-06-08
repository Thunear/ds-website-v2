/** Pure operations on a TypographyConfig (used by the store's updateTypography). */
import {
  makeId,
  type FontConfig,
  type TypographyComponent,
  type TypographyConfig,
} from "./config";

const DEFAULT_PX = 16;

/** Named modular-scale ratios (musical intervals), for the ratio picker. */
export const RATIOS: { name: string; value: number }[] = [
  { name: "Minor second", value: 1.067 },
  { name: "Major second", value: 1.125 },
  { name: "Minor third", value: 1.2 },
  { name: "Major third", value: 1.25 },
  { name: "Perfect fourth", value: 1.333 },
  { name: "Augmented fourth", value: 1.414 },
  { name: "Perfect fifth", value: 1.5 },
  { name: "Golden ratio", value: 1.618 },
];

/**
 * The generated px for a step in a mode: mode-font-size × ratio^(distance from
 * the anchor step). Anchored to the mode-font-size so it scales across modes.
 */
export function generatedSize(
  steps: string[],
  font: FontConfig,
  modeFontSize: number,
  step: string,
): number {
  const i = steps.indexOf(step);
  const a = steps.indexOf(font.scale.anchorStep);
  if (i < 0 || a < 0) return modeFontSize;
  return Math.round(modeFontSize * Math.pow(font.scale.ratio, i - a));
}

/** The effective px: a pinned override if present, otherwise the generated size. */
export function resolveFontSize(
  steps: string[],
  font: FontConfig,
  mode: string,
  modeFontSize: number,
  step: string,
): number {
  const override = font.overrides?.[mode]?.[step];
  if (override != null && override > 0) return override;
  return generatedSize(steps, font, modeFontSize, step);
}

function mapFonts(
  t: TypographyConfig,
  fn: (f: FontConfig) => FontConfig,
): TypographyConfig {
  return { ...t, fonts: t.fonts.map(fn) };
}

function mapFont(
  t: TypographyConfig,
  id: string,
  fn: (f: FontConfig) => FontConfig,
): TypographyConfig {
  return mapFonts(t, (f) => (f.id === id ? fn(f) : f));
}

/** Map a Figma weight label (e.g. "Semi bold") to a numeric CSS font-weight. */
const WEIGHT_MAP: Record<string, number> = {
  thin: 100,
  hairline: 100,
  extralight: 200,
  ultralight: 200,
  light: 300,
  regular: 400,
  normal: 400,
  book: 400,
  medium: 500,
  semibold: 600,
  demibold: 600,
  bold: 700,
  extrabold: 800,
  ultrabold: 800,
  black: 900,
  heavy: 900,
};

export function cssWeight(label: string): number {
  const key = label.toLowerCase().replace(/[\s_-]/g, "");
  return WEIGHT_MAP[key] ?? (Number(label) || 400);
}

export function addFont(t: TypographyConfig): TypographyConfig {
  const font: FontConfig = {
    id: makeId("font"),
    name: `font-${t.fonts.length + 1}`,
    fontFamily: "Inter",
    weights: [
      { name: "regular", value: "Regular" },
      { name: "medium", value: "Medium" },
      { name: "semibold", value: "Semibold" },
    ],
    scale: { anchorStep: t.steps[0] ?? "1", ratio: 1.2 },
  };
  return { ...t, fonts: [...t.fonts, font] };
}

export function removeFont(t: TypographyConfig, id: string): TypographyConfig {
  if (t.fonts.length <= 1) return t;
  return { ...t, fonts: t.fonts.filter((f) => f.id !== id) };
}

export function updateFont(
  t: TypographyConfig,
  id: string,
  patch: Partial<Pick<FontConfig, "name" | "fontFamily">>,
): TypographyConfig {
  return mapFont(t, id, (f) => ({ ...f, ...patch }));
}

/** Patch a font's modular scale (anchor step and/or ratio). */
export function setFontScale(
  t: TypographyConfig,
  fontId: string,
  patch: Partial<FontConfig["scale"]>,
): TypographyConfig {
  return mapFont(t, fontId, (f) => ({ ...f, scale: { ...f.scale, ...patch } }));
}

/** Pin (px) or clear (null) a single cell; cleared cells fall back to generated. */
export function setOverride(
  t: TypographyConfig,
  fontId: string,
  mode: string,
  step: string,
  px: number | null,
): TypographyConfig {
  return mapFont(t, fontId, (f) => {
    const overrides = { ...f.overrides };
    const forMode = { ...overrides[mode] };
    if (px === null || Number.isNaN(px)) delete forMode[step];
    else forMode[step] = px;
    if (Object.keys(forMode).length === 0) delete overrides[mode];
    else overrides[mode] = forMode;
    const hasAny = Object.keys(overrides).length > 0;
    return { ...f, overrides: hasAny ? overrides : undefined };
  });
}

export function addWeight(t: TypographyConfig, fontId: string): TypographyConfig {
  return mapFont(t, fontId, (f) => ({
    ...f,
    weights: [
      ...f.weights,
      { name: `vekt-${f.weights.length + 1}`, value: "Regular" },
    ],
  }));
}

export function updateWeight(
  t: TypographyConfig,
  fontId: string,
  index: number,
  patch: Partial<{ name: string; value: string }>,
): TypographyConfig {
  return mapFont(t, fontId, (f) => ({
    ...f,
    weights: f.weights.map((w, i) => (i === index ? { ...w, ...patch } : w)),
  }));
}

export function removeWeight(
  t: TypographyConfig,
  fontId: string,
  index: number,
): TypographyConfig {
  return mapFont(t, fontId, (f) => ({
    ...f,
    weights: f.weights.filter((_, i) => i !== index),
  }));
}

/* ---- shared steps ---- */

export function addStep(t: TypographyConfig, name: string): TypographyConfig {
  if (!name || t.steps.includes(name)) return t;
  // Sizes are generated, so a new step needs no per-font seeding.
  return { ...t, steps: [...t.steps, name] };
}

export function removeStep(t: TypographyConfig, name: string): TypographyConfig {
  if (t.steps.length <= 1) return t;
  const steps = t.steps.filter((s) => s !== name);
  const fallback = steps[0];
  const cleaned = mapFonts({ ...t, steps }, (f) => {
    const overrides = f.overrides
      ? Object.fromEntries(
          Object.entries(f.overrides).map(([m, cells]) => {
            const rest = { ...cells };
            delete rest[name];
            return [m, rest];
          }),
        )
      : undefined;
    return {
      ...f,
      scale:
        f.scale.anchorStep === name
          ? { ...f.scale, anchorStep: fallback }
          : f.scale,
      overrides,
    };
  });
  return {
    ...cleaned,
    components: cleaned.components.map((c) =>
      c.step === name ? { ...c, step: fallback } : c,
    ),
  };
}

export function renameStep(
  t: TypographyConfig,
  oldName: string,
  newName: string,
): TypographyConfig {
  if (!newName || newName === oldName || t.steps.includes(newName)) return t;
  const steps = t.steps.map((s) => (s === oldName ? newName : s));
  const renamed = mapFonts({ ...t, steps }, (f) => {
    const overrides = f.overrides
      ? Object.fromEntries(
          Object.entries(f.overrides).map(([m, cells]) => {
            const next = { ...cells };
            if (oldName in next) {
              next[newName] = next[oldName];
              delete next[oldName];
            }
            return [m, next];
          }),
        )
      : undefined;
    return {
      ...f,
      scale:
        f.scale.anchorStep === oldName
          ? { ...f.scale, anchorStep: newName }
          : f.scale,
      overrides,
    };
  });
  return {
    ...renamed,
    components: renamed.components.map((c) =>
      c.step === oldName ? { ...c, step: newName } : c,
    ),
  };
}

/* ---- mode columns (driven by the shared sizing modes) ---- */

/** Drop a mode's overrides and clear any component overrides pointing at it. */
export function removeModeColumn(
  t: TypographyConfig,
  name: string,
): TypographyConfig {
  const stripped = mapFonts(t, (f) => {
    if (!f.overrides?.[name]) return f;
    const overrides = { ...f.overrides };
    delete overrides[name];
    return {
      ...f,
      overrides: Object.keys(overrides).length ? overrides : undefined,
    };
  });
  return {
    ...stripped,
    components: stripped.components.map((c) =>
      c.mode === name ? { ...c, mode: undefined } : c,
    ),
  };
}

export function renameModeColumn(
  t: TypographyConfig,
  oldName: string,
  newName: string,
): TypographyConfig {
  const renamed = mapFonts(t, (f) => {
    if (!f.overrides?.[oldName]) return f;
    const overrides = { ...f.overrides };
    overrides[newName] = overrides[oldName];
    delete overrides[oldName];
    return { ...f, overrides };
  });
  return {
    ...renamed,
    components: renamed.components.map((c) =>
      c.mode === oldName ? { ...c, mode: newName } : c,
    ),
  };
}

/* ---- components ---- */

export function addComponent(t: TypographyConfig, name: string): TypographyConfig {
  const font = t.fonts[0];
  const comp: TypographyComponent = {
    id: makeId("comp"),
    name: name || `komponent-${t.components.length + 1}`,
    fontId: font.id,
    step: t.steps[0],
    weight: font.weights[0]?.name ?? "regular",
  };
  return { ...t, components: [...t.components, comp] };
}

export function updateComponent(
  t: TypographyConfig,
  id: string,
  patch: Partial<Omit<TypographyComponent, "id" | "locked">>,
): TypographyConfig {
  return {
    ...t,
    components: t.components.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  };
}

export function removeComponent(t: TypographyConfig, id: string): TypographyConfig {
  return { ...t, components: t.components.filter((c) => c.id !== id) };
}

/* ---- resolution (for previews) ---- */

export interface ResolvedComponent {
  font: FontConfig | undefined;
  fontFamily: string;
  size: number;
  weight: number;
  mode: string;
}

export function resolveComponent(
  t: TypographyConfig,
  comp: TypographyComponent,
  activeMode: string,
  modeFontSizes: Record<string, number>,
): ResolvedComponent {
  const font = t.fonts.find((f) => f.id === comp.fontId) ?? t.fonts[0];
  const mode = comp.mode ?? activeMode;
  const mfs = modeFontSizes[mode] ?? DEFAULT_PX;
  const size = font
    ? resolveFontSize(t.steps, font, mode, mfs, comp.step)
    : DEFAULT_PX;
  const label = font?.weights.find((w) => w.name === comp.weight)?.value ?? "Regular";
  return {
    font,
    fontFamily: font?.fontFamily ?? "Inter",
    size,
    weight: cssWeight(label),
    mode,
  };
}
