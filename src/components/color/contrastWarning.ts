import { contrastRatio } from "@/color/contrast";

/** Minimum contrast a base colour needs against the surface it sits on. */
export const BASE_MIN_CONTRAST = 3;

/** True when base-default is too low-contrast against surface-tinted. */
export function baseHasLowContrast(
  baseDefaultHex: string,
  surfaceTintedHex: string,
): boolean {
  return contrastRatio(baseDefaultHex, surfaceTintedHex) < BASE_MIN_CONTRAST;
}

/** Shared advisory text shown on the warning icon popover and the picker alert. */
export const BASE_CONTRAST_WARNING =
  "Vær forsiktig: denne base-fargen har under 3:1 kontrast mot flaten " +
  "(surface). Base-fargene brukes i komponenter som Switch og Button, så " +
  "for lav kontrast bryter WCAG. Velg en kraftigere farge, eller behandle " +
  "skalaen mer dekorativt (f.eks. som en egendefinert fargegruppe).";
