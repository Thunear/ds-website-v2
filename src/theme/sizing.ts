/**
 * Pure helpers for the Designsystemet sizing system.
 *
 * The whole scale is generated from two global numbers + one font-size per mode:
 *   unit   = step / base × mode-font-size
 *   size-N = floor(unit × N)              // round(down, …, 1px)
 *
 * Switching mode scales every token by `mode-font-size / base`, so a "kompakt"
 * mode is just a mode with a smaller font-size.
 */
import { SIZE_TOKENS, type SizingConfig } from "./config";

export function sizeUnit(base: number, step: number, modeFontSize: number): number {
  if (base <= 0) return 0;
  return (step / base) * modeFontSize;
}

/** A single generated token value (rounded down to whole px, like DS). */
export function sizeValue(
  base: number,
  step: number,
  modeFontSize: number,
  token: number,
): number {
  return Math.floor(sizeUnit(base, step, modeFontSize) * token);
}

export interface SizeRow {
  token: number;
  px: number;
}

/** The full token table (SIZE_TOKENS) resolved for one mode. */
export function generateSizeScale(
  sizing: SizingConfig,
  modeName: string,
): SizeRow[] {
  const mode =
    sizing.modes.find((m) => m.name === modeName) ?? sizing.modes[0];
  const mfs = mode?.fontSize ?? sizing.base;
  return SIZE_TOKENS.map((token) => ({
    token,
    px: sizeValue(sizing.base, sizing.step, mfs, token),
  }));
}

/* ---- pure sizing ops (the store composes these with typography column sync) ---- */

export function setBase(s: SizingConfig, base: number): SizingConfig {
  return { ...s, base: Math.max(1, base) };
}

export function setStep(s: SizingConfig, step: number): SizingConfig {
  return { ...s, step: Math.max(0, step) };
}

export function setActiveMode(s: SizingConfig, name: string): SizingConfig {
  return { ...s, activeMode: name };
}

export function setModeFontSize(
  s: SizingConfig,
  name: string,
  fontSize: number,
): SizingConfig {
  return {
    ...s,
    modes: s.modes.map((m) =>
      m.name === name ? { ...m, fontSize: Math.max(1, fontSize) } : m,
    ),
  };
}

export function addMode(s: SizingConfig, name: string): SizingConfig {
  if (!name || s.modes.some((m) => m.name === name)) return s;
  const copy = s.modes.find((m) => m.name === s.activeMode) ?? s.modes[0];
  return { ...s, modes: [...s.modes, { name, fontSize: copy?.fontSize ?? s.base }] };
}

export function removeMode(s: SizingConfig, name: string): SizingConfig {
  if (s.modes.length <= 1) return s;
  const modes = s.modes.filter((m) => m.name !== name);
  const activeMode = s.activeMode === name ? modes[0].name : s.activeMode;
  return { ...s, modes, activeMode };
}

export function renameMode(
  s: SizingConfig,
  oldName: string,
  newName: string,
): SizingConfig {
  if (!newName || newName === oldName || s.modes.some((m) => m.name === newName))
    return s;
  return {
    ...s,
    modes: s.modes.map((m) => (m.name === oldName ? { ...m, name: newName } : m)),
    activeMode: s.activeMode === oldName ? newName : s.activeMode,
  };
}
