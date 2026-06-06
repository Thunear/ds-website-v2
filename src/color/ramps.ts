/**
 * Distribution presets for a custom group's lightness ramp. Each preset is an
 * easing curve applied between the ramp's current top and bottom luminance, so
 * switching preset reshapes the spacing without changing the endpoints.
 */
export interface RampPreset {
  id: string;
  label: string;
  ease: (t: number) => number;
}

export const RAMP_PRESETS: RampPreset[] = [
  { id: "linear", label: "Lineær", ease: (t) => t },
  // Big luminance change early, then levels off (more dark steps).
  { id: "steep-start", label: "Bratt start", ease: (t) => 1 - (1 - t) ** 2 },
  // Stays near the top, then drops fast at the end (more light steps).
  { id: "steep-end", label: "Bratt slutt", ease: (t) => t ** 2 },
  // Gentle at both ends, steep in the middle.
  { id: "s-curve", label: "S-kurve", ease: (t) => t * t * (3 - 2 * t) },
];

/** Build a ramp of `steps` luminances from `top` → `bottom` using the preset. */
export function rampFromPreset(
  preset: RampPreset,
  steps: number,
  top: number,
  bottom: number,
): number[] {
  if (steps <= 1) return [top];
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    return Number((top + (bottom - top) * preset.ease(t)).toFixed(3));
  });
}

const approx = (a: number[], b: number[]) =>
  a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 0.006);

/** Which preset a ramp matches (using its own endpoints), or null if custom. */
export function matchRampPreset(values: number[]): RampPreset | null {
  if (values.length < 2) return null;
  const top = values[0];
  const bottom = values[values.length - 1];
  return (
    RAMP_PRESETS.find((p) =>
      approx(rampFromPreset(p, values.length, top, bottom), values),
    ) ?? null
  );
}
