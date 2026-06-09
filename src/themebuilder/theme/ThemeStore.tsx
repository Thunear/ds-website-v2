import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ColorMode,
  ColorStepName,
  ScaleVariant,
} from "@/themebuilder/color/types";
import { defaultLuminanceArray } from "@/themebuilder/color/scale";
import { resampleLightness, resizeChroma } from "@/themebuilder/color/derive";
import * as Sz from "./sizing";
import { removeModeColumn, renameModeColumn } from "./typography";
import {
  createCustomColor,
  createCustomGroup,
  createScale,
  createTheme,
  defaultBuilderConfig,
  defaultSizing,
  defaultTypography,
  SEVERITY_DEFAULTS,
  type BuilderConfig,
  type CustomGroup,
  type SeverityName,
  type ThemeConfig,
  type TypographyConfig,
} from "./config";

const STORAGE_KEY = "themebuilder-v2.config";
/** Bump when the persisted shape or seed defaults change, to drop stale state. */
const STORAGE_VERSION = 12;

/** Seed fields added after a theme was first saved (avoids resetting state). */
function normalize(config: BuilderConfig): BuilderConfig {
  return {
    ...config,
    themes: config.themes.map((t) => {
      const withTypo = t.typography
        ? t
        : { ...t, typography: defaultTypography() };
      return withTypo.sizing
        ? withTypo
        : { ...withTypo, sizing: defaultSizing() };
    }),
  };
}

function load(): BuilderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        version?: number;
        config?: BuilderConfig;
      };
      if (parsed.version === STORAGE_VERSION && parsed.config) {
        return normalize(parsed.config);
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return defaultBuilderConfig();
}

interface ThemeStore {
  config: BuilderConfig;
  activeTheme: ThemeConfig;
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;

  // theme-level
  addTheme: (name?: string) => void;
  /** Add + select a theme seeded from a front-page brand palette. */
  seedFromPalette: (
    name: string,
    palette: { accent: string; brand1: string; brand2: string },
  ) => void;
  renameTheme: (id: string, name: string) => void;
  selectTheme: (id: string) => void;
  removeTheme: (id: string) => void;

  // semantic scales (the main grid)
  addScale: (name: string, hex: string) => void;
  updateScale: (
    id: string,
    patch: { name?: string; hex?: string; variant?: ScaleVariant },
  ) => void;
  removeScale: (id: string) => void;
  /** Move a semantic scale up (-1) or down (+1). */
  moveScale: (id: string, direction: -1 | 1) => void;

  // custom colour groups
  addCustomGroup: () => void;
  removeCustomGroup: (groupId: string) => void;
  renameCustomGroup: (groupId: string, name: string) => void;
  setGroupSteps: (groupId: string, steps: number) => void;
  setGroupLightness: (groupId: string, index: number, value: number) => void;
  setGroupLightnessCurve: (groupId: string, values: number[]) => void;
  addCustomColor: (groupId: string) => void;
  updateCustomColor: (
    groupId: string,
    colorId: string,
    patch: { name?: string; hex?: string },
  ) => void;
  moveCustomColor: (groupId: string, colorId: string, direction: -1 | 1) => void;
  removeCustomColor: (groupId: string, colorId: string) => void;
  setColorChroma: (
    groupId: string,
    colorId: string,
    index: number,
    value: number,
  ) => void;

  // severity colours (fixed names, recolourable)
  setSeverityColor: (name: SeverityName, hex: string) => void;

  // typography (fonts + components)
  updateTypography: (fn: (t: TypographyConfig) => TypographyConfig) => void;

  // sizing system (base/step + shared modes; modes are shared with typography)
  setSizeBase: (base: number) => void;
  setSizeStep: (step: number) => void;
  setSizeModeFontSize: (name: string, fontSize: number) => void;
  setActiveMode: (name: string) => void;
  addSizeMode: (name: string) => void;
  removeSizeMode: (name: string) => void;
  renameSizeMode: (oldName: string, newName: string) => void;

  // border radius (single base value; the scale is derived from it)
  setBorderRadius: (base: number) => void;

  setOverride: (
    id: string,
    mode: ColorMode,
    step: ColorStepName,
    hex: string | null,
  ) => void;
  setChroma: (
    id: string,
    mode: ColorMode,
    step: ColorStepName,
    multiplier: number | null,
  ) => void;

  // lightness curve (theme-wide, per mode)
  setLightness: (mode: ColorMode, index: number, value: number) => void;
  setLightnessCurve: (mode: ColorMode, values: number[]) => void;
  resetLightness: (mode: ColorMode) => void;
}

const Ctx = createContext<ThemeStore | null>(null);

export function ThemeStoreProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<BuilderConfig>(load);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, config }),
    );
  }, [config]);

  const updateActiveTheme = useCallback(
    (fn: (t: ThemeConfig) => ThemeConfig) => {
      setConfig((c) => ({
        ...c,
        themes: c.themes.map((t) => (t.id === c.activeThemeId ? fn(t) : t)),
      }));
    },
    [],
  );

  const updateGroup = useCallback(
    (groupId: string, fn: (g: CustomGroup) => CustomGroup) => {
      updateActiveTheme((t) => ({
        ...t,
        customGroups: t.customGroups.map((g) =>
          g.id === groupId ? fn(g) : g,
        ),
      }));
    },
    [updateActiveTheme],
  );

  const store = useMemo<ThemeStore>(() => {
    const activeTheme =
      config.themes.find((t) => t.id === config.activeThemeId) ??
      config.themes[0];

    return {
      config,
      activeTheme,
      mode: config.mode,
      setMode: (mode) => setConfig((c) => ({ ...c, mode })),

      addTheme: (name = "Nytt tema") =>
        setConfig((c) => {
          const t = createTheme(name);
          return { ...c, themes: [...c.themes, t], activeThemeId: t.id };
        }),
      seedFromPalette: (name, palette) =>
        setConfig((c) => {
          // Idempotent: if a theme already seeded from this palette exists,
          // just select it instead of adding another duplicate. (The front page
          // re-runs this on every "Fortsett i temabyggeren" navigation.)
          const accentOf = (t: ThemeConfig) =>
            t.colors.find((s) => s.name === "accent")?.hex.toLowerCase();
          const existing = c.themes.find(
            (t) => t.name === name && accentOf(t) === palette.accent.toLowerCase(),
          );
          if (existing) {
            return existing.id === c.activeThemeId
              ? c
              : { ...c, activeThemeId: existing.id };
          }
          const t = createTheme(name);
          // Map the seed colours onto the standard semantic scales by name.
          const byName: Record<string, string> = {
            accent: palette.accent,
            "accent-inverted": palette.accent,
            brand1: palette.brand1,
            brand2: palette.brand2,
          };
          const seeded = {
            ...t,
            colors: t.colors.map((s) =>
              byName[s.name] ? { ...s, hex: byName[s.name] } : s,
            ),
          };
          return { ...c, themes: [...c.themes, seeded], activeThemeId: seeded.id };
        }),
      renameTheme: (id, name) =>
        setConfig((c) => ({
          ...c,
          themes: c.themes.map((t) => (t.id === id ? { ...t, name } : t)),
        })),
      selectTheme: (id) => setConfig((c) => ({ ...c, activeThemeId: id })),
      removeTheme: (id) =>
        setConfig((c) => {
          if (c.themes.length <= 1) return c;
          const themes = c.themes.filter((t) => t.id !== id);
          const activeThemeId =
            c.activeThemeId === id ? themes[0].id : c.activeThemeId;
          return { ...c, themes, activeThemeId };
        }),

      addScale: (name, hex) =>
        updateActiveTheme((t) => ({
          ...t,
          colors: [...t.colors, createScale(name, hex)],
        })),
      updateScale: (id, patch) =>
        updateActiveTheme((t) => ({
          ...t,
          colors: t.colors.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      removeScale: (id) =>
        updateActiveTheme((t) => ({
          ...t,
          colors: t.colors.filter((s) => s.id !== id),
        })),
      moveScale: (id, direction) =>
        updateActiveTheme((t) => {
          const i = t.colors.findIndex((s) => s.id === id);
          if (i < 0 || t.colors[i].name === "neutral") return t;
          // Skip past the locked "neutral" scale so it stays pinned.
          let j = i + direction;
          while (j >= 0 && j < t.colors.length && t.colors[j].name === "neutral") {
            j += direction;
          }
          if (j < 0 || j >= t.colors.length) return t;
          const colors = t.colors.slice();
          [colors[i], colors[j]] = [colors[j], colors[i]];
          return { ...t, colors };
        }),

      addCustomGroup: () =>
        updateActiveTheme((t) => ({
          ...t,
          customGroups: [
            ...t.customGroups,
            createCustomGroup(`gruppe-${t.customGroups.length + 1}`, "#0062BA"),
          ],
        })),
      removeCustomGroup: (groupId) =>
        updateActiveTheme((t) => ({
          ...t,
          customGroups: t.customGroups.filter((g) => g.id !== groupId),
        })),
      renameCustomGroup: (groupId, name) =>
        updateGroup(groupId, (g) => ({ ...g, name })),
      setGroupSteps: (groupId, steps) =>
        updateGroup(groupId, (g) => ({
          ...g,
          lightness: resampleLightness(g.lightness, steps),
          colors: g.colors.map((c) =>
            c.chroma ? { ...c, chroma: resizeChroma(c.chroma, steps) } : c,
          ),
        })),
      setGroupLightness: (groupId, index, value) =>
        updateGroup(groupId, (g) => {
          const lightness = g.lightness.slice();
          lightness[index] = value;
          return { ...g, lightness };
        }),
      setGroupLightnessCurve: (groupId, values) =>
        updateGroup(groupId, (g) => ({ ...g, lightness: values.slice() })),
      addCustomColor: (groupId) =>
        updateGroup(groupId, (g) => ({
          ...g,
          colors: [
            ...g.colors,
            createCustomColor(`farge-${g.colors.length + 1}`, "#0062BA"),
          ],
        })),
      updateCustomColor: (groupId, colorId, patch) =>
        updateGroup(groupId, (g) => ({
          ...g,
          colors: g.colors.map((c) =>
            c.id === colorId ? { ...c, ...patch } : c,
          ),
        })),
      moveCustomColor: (groupId, colorId, direction) =>
        updateGroup(groupId, (g) => {
          const i = g.colors.findIndex((c) => c.id === colorId);
          const j = i + direction;
          if (i < 0 || j < 0 || j >= g.colors.length) return g;
          const colors = g.colors.slice();
          [colors[i], colors[j]] = [colors[j], colors[i]];
          return { ...g, colors };
        }),
      removeCustomColor: (groupId, colorId) =>
        updateGroup(groupId, (g) => ({
          ...g,
          colors: g.colors.filter((c) => c.id !== colorId),
        })),
      setColorChroma: (groupId, colorId, index, value) =>
        updateGroup(groupId, (g) => ({
          ...g,
          colors: g.colors.map((c) => {
            if (c.id !== colorId) return c;
            const chroma = (c.chroma ?? g.lightness.map(() => 1)).slice();
            chroma[index] = value;
            return { ...c, chroma };
          }),
        })),

      setSeverityColor: (name, hex) =>
        updateActiveTheme((t) => ({
          ...t,
          severity: { ...(t.severity ?? SEVERITY_DEFAULTS), [name]: hex },
        })),

      updateTypography: (fn) =>
        updateActiveTheme((t) => ({
          ...t,
          typography: fn(t.typography ?? defaultTypography()),
        })),

      setSizeBase: (base) =>
        updateActiveTheme((t) => ({ ...t, sizing: Sz.setBase(t.sizing, base) })),
      setSizeStep: (step) =>
        updateActiveTheme((t) => ({ ...t, sizing: Sz.setStep(t.sizing, step) })),
      setSizeModeFontSize: (name, fontSize) =>
        updateActiveTheme((t) => ({
          ...t,
          sizing: Sz.setModeFontSize(t.sizing, name, fontSize),
        })),
      setActiveMode: (name) =>
        updateActiveTheme((t) => ({
          ...t,
          sizing: Sz.setActiveMode(t.sizing, name),
        })),
      addSizeMode: (name) =>
        updateActiveTheme((t) => {
          if (!name || t.sizing.modes.some((m) => m.name === name)) return t;
          // Sizes are generated, so a new mode needs no typography seeding.
          return { ...t, sizing: Sz.addMode(t.sizing, name) };
        }),
      removeSizeMode: (name) =>
        updateActiveTheme((t) => {
          if (t.sizing.modes.length <= 1) return t;
          return {
            ...t,
            sizing: Sz.removeMode(t.sizing, name),
            typography: removeModeColumn(t.typography, name),
          };
        }),
      renameSizeMode: (oldName, newName) =>
        updateActiveTheme((t) => {
          if (
            !newName ||
            newName === oldName ||
            t.sizing.modes.some((m) => m.name === newName)
          )
            return t;
          return {
            ...t,
            sizing: Sz.renameMode(t.sizing, oldName, newName),
            typography: renameModeColumn(t.typography, oldName, newName),
          };
        }),

      setBorderRadius: (base) =>
        updateActiveTheme((t) => ({ ...t, borderRadius: Math.max(0, base) })),

      setOverride: (id, mode, step, hex) =>
        updateActiveTheme((t) => ({
          ...t,
          colors: t.colors.map((s) => {
            if (s.id !== id) return s;
            const overrides = { ...s.overrides };
            const forMode = { ...overrides[mode] };
            if (hex === null) delete forMode[step];
            else forMode[step] = hex;
            if (Object.keys(forMode).length === 0) delete overrides[mode];
            else overrides[mode] = forMode;
            return { ...s, overrides };
          }),
        })),
      setChroma: (id, mode, step, multiplier) =>
        updateActiveTheme((t) => ({
          ...t,
          colors: t.colors.map((s) => {
            if (s.id !== id) return s;
            const chromaCfg = { ...s.chroma };
            const forMode = { ...chromaCfg[mode] };
            if (multiplier === null) delete forMode[step];
            else forMode[step] = multiplier;
            if (Object.keys(forMode).length === 0) delete chromaCfg[mode];
            else chromaCfg[mode] = forMode;
            return { ...s, chroma: chromaCfg };
          }),
        })),

      setLightness: (mode, index, value) =>
        updateActiveTheme((t) => {
          const current = t.lightness?.[mode] ?? defaultLuminanceArray(mode);
          const next = current.slice();
          next[index] = value;
          return { ...t, lightness: { ...t.lightness, [mode]: next } };
        }),
      setLightnessCurve: (mode, values) =>
        updateActiveTheme((t) => ({
          ...t,
          lightness: { ...t.lightness, [mode]: values.slice() },
        })),
      resetLightness: (mode) =>
        updateActiveTheme((t) => {
          const lightness = { ...t.lightness };
          delete lightness[mode];
          return { ...t, lightness };
        }),
    };
  }, [config, updateActiveTheme, updateGroup]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useThemeStore(): ThemeStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useThemeStore must be used within ThemeStoreProvider");
  return ctx;
}
