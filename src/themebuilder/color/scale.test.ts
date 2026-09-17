import { describe, expect, it } from "vitest";
import chroma from "chroma-js";
import {
  defaultLuminances,
  generateColorScale,
  interpolationColor,
  MUTED_STEPS,
  STEP_LUMINANCE,
  type MutedStepName,
} from "./scale";
import { contrastRatio, relativeLuminance } from "./contrast";
import { MUTED_CHROMA_MAX } from "./chroma";
import { STEP_DEFS, type ColorStepName } from "./types";

const stepHex = (scale: ReturnType<typeof generateColorScale>, n: ColorStepName) =>
  scale.steps.find((s) => s.name === n)!.hex;

describe("generateColorScale", () => {
  it("produces all 19 steps in grid order", () => {
    const scale = generateColorScale("accent", "#0062BA");
    expect(scale.steps).toHaveLength(19);
    expect(scale.steps.map((s) => s.name)).toEqual(STEP_DEFS.map((d) => d.name));
  });

  it("keeps the same relative luminance per step across different scales", () => {
    // The core invariant: equal contrast between steps theme-wide.
    const a = generateColorScale("accent", "#0062BA");
    const b = generateColorScale("brand2", "#5B3FA0");
    for (const name of Object.keys(STEP_LUMINANCE.light) as ColorStepName[]) {
      const la = a.steps.find((s) => s.name === name)!.luminance;
      const lb = b.steps.find((s) => s.name === name)!.luminance;
      expect(la).toBeCloseTo(lb, 2);
    }
  });

  it("hits the Designsystemet target luminance per step", () => {
    const s = generateColorScale("accent", "#0062BA", "light");
    for (const [name, target] of Object.entries(STEP_LUMINANCE.light)) {
      const got = s.steps.find((st) => st.name === name)!.luminance;
      expect(got).toBeCloseTo(target, 2);
    }
  });

  it("honours a custom luminance curve", () => {
    const custom = defaultLuminances("light");
    custom["border-default"] = 0.5; // override one step
    const s = generateColorScale("accent", "#0062BA", "light", custom);
    expect(s.steps.find((x) => x.name === "border-default")!.luminance).toBeCloseTo(
      0.5,
      2,
    );
  });

  it("text-default meets ~8:1 against background-default in light mode", () => {
    const s = generateColorScale("accent", "#0062BA", "light");
    const ratio = contrastRatio(
      stepHex(s, "text-default"),
      stepHex(s, "background-default"),
    );
    expect(ratio).toBeGreaterThan(7);
  });

  it("base-default equals the chosen colour", () => {
    const s = generateColorScale("accent", "#0062ba");
    expect(stepHex(s, "base-default").toLowerCase()).toBe("#0062ba");
  });

  it("base-contrast-default picks white for a dark base", () => {
    const s = generateColorScale("accent", "#0062BA");
    expect(stepHex(s, "base-contrast-default")).toBe("#ffffff");
  });

  it("base-contrast-default picks black for a light base", () => {
    const s = generateColorScale("warning", "#F5D90A");
    expect(stepHex(s, "base-contrast-default")).toBe("#000000");
  });

  it("base-contrast-subtle keeps >= 4.5:1 against base-default for any hue/mode", () => {
    const samples = ["#0062BA", "#0D7A5F", "#5B3FA0", "#F5D90A", "#C01B1B", "#7A7A7A"];
    for (const hex of samples) {
      for (const mode of ["light", "dark"] as const) {
        const s = generateColorScale("c", hex, mode);
        const ratio = contrastRatio(
          stepHex(s, "base-contrast-subtle"),
          stepHex(s, "base-default"),
        );
        // At least 4.5 (tiny tolerance for the rare mid-luminance gamut edge).
        expect(ratio).toBeGreaterThanOrEqual(4.45);
      }
    }
  });

  it("base-contrast-subtle stays tinted (not pure black/white)", () => {
    const s = generateColorScale("accent", "#0062BA");
    const c = chroma(stepHex(s, "base-contrast-subtle")).oklch()[1];
    expect(c).toBeGreaterThan(0.01);
  });

  it("base hover/active progress monotonically away from base-default", () => {
    const s = generateColorScale("accent", "#0062BA");
    const base = relativeLuminance(stepHex(s, "base-default"));
    const hover = relativeLuminance(stepHex(s, "base-hover"));
    const active = relativeLuminance(stepHex(s, "base-active"));
    const dHover = hover - base;
    const dActive = active - base;
    // Same direction, with active shifted further than hover.
    expect(Math.sign(dActive)).toBe(Math.sign(dHover));
    expect(Math.abs(dActive)).toBeGreaterThan(Math.abs(dHover));
  });

  it("dark mode reference reduces OKLCH chroma by 30%, light keeps it", () => {
    const sourceChroma = chroma("#0062BA").oklch()[1];
    expect(interpolationColor("#0062BA", "light")).toBe("#0062BA");
    const darkChroma = chroma(interpolationColor("#0062BA", "dark")).oklch()[1];
    expect(darkChroma).toBeCloseTo(sourceChroma * 0.7, 2);
  });

  it("dark mode flips background dark and text light", () => {
    const s = generateColorScale("accent", "#0062BA", "dark");
    expect(relativeLuminance(stepHex(s, "background-default"))).toBeLessThan(0.1);
    expect(relativeLuminance(stepHex(s, "text-default"))).toBeGreaterThan(0.4);
  });

  describe("inverted", () => {
    const inv = generateColorScale("accent", "#0062BA", "light", undefined, "inverted");

    it("anchors background-default to the source colour's luminance", () => {
      expect(relativeLuminance(stepHex(inv, "background-default"))).toBeCloseTo(
        relativeLuminance("#0062BA"),
        2,
      );
    });

    it("ramps text-default up to ~white", () => {
      expect(relativeLuminance(stepHex(inv, "text-default"))).toBeGreaterThan(0.9);
    });

    it("turns base-default into the contrast colour (white for a dark source)", () => {
      expect(stepHex(inv, "base-default")).toBe("#ffffff");
      expect(stepHex(inv, "base-contrast-default").toLowerCase()).toBe("#0062ba");
    });
  });

  describe("base-only", () => {
    const bo = generateColorScale("accent", "#0062BA", "light", undefined, "base-only");

    it("makes the contrast steps neutral grey (no chroma)", () => {
      for (const n of ["background-tinted", "surface-tinted", "border-default", "text-default"] as const) {
        const c = chroma(stepHex(bo, n)).oklch()[1];
        expect(c).toBeLessThan(0.02);
      }
    });

    it("keeps the base steps coloured", () => {
      expect(stepHex(bo, "base-default").toLowerCase()).toBe("#0062ba");
      expect(chroma(stepHex(bo, "base-default")).oklch()[1]).toBeGreaterThan(0.05);
    });

    it("keeps the same per-step luminance as a normal scale", () => {
      const normal = generateColorScale("accent", "#0062BA");
      for (const name of Object.keys(STEP_LUMINANCE.light) as ColorStepName[]) {
        expect(
          relativeLuminance(stepHex(bo, name)),
        ).toBeCloseTo(relativeLuminance(stepHex(normal, name)), 2);
      }
    });
  });
});

describe("muted steps", () => {
  const samples = ["#0062BA", "#0D7A5F", "#5B3FA0", "#F5D90A", "#C01B1B", "#E8641B", "#1E2B3C"];
  const mutedNames = Object.keys(MUTED_STEPS) as MutedStepName[];
  const oklchChroma = (hex: string) => chroma(hex).oklch()[1] || 0;

  it("keep the exact luminance (and so the contrast) of their source step", () => {
    for (const hex of samples) {
      for (const mode of ["light", "dark"] as const) {
        const s = generateColorScale("c", hex, mode);
        for (const n of mutedNames) {
          expect(relativeLuminance(stepHex(s, n))).toBeCloseTo(
            relativeLuminance(stepHex(s, MUTED_STEPS[n])),
            2,
          );
        }
      }
    }
  });

  it("are less colourful than their source and capped near neutral", () => {
    for (const hex of samples) {
      for (const mode of ["light", "dark"] as const) {
        const s = generateColorScale("c", hex, mode);
        for (const n of mutedNames) {
          const muted = oklchChroma(stepHex(s, n));
          const source = oklchChroma(stepHex(s, MUTED_STEPS[n]));
          if (source > 0.001) expect(muted).toBeLessThan(source);
          // Re-fitting the luminance can nudge chroma a hair past the cap.
          expect(muted).toBeLessThanOrEqual(MUTED_CHROMA_MAX + 0.01);
        }
      }
    }
  });

  it("keep a hint of the hue for a vivid source (not pure grey)", () => {
    const s = generateColorScale("accent", "#0062BA");
    const source = chroma("#0062BA").oklch()[2];
    for (const n of ["border-muted", "text-muted"] as const) {
      const [, c, h] = chroma(stepHex(s, n)).oklch();
      expect(c).toBeGreaterThan(0.015);
      // Hue preserved (within a few degrees).
      expect(Math.abs(((h - source + 540) % 360) - 180)).toBeLessThan(8);
    }
  });

  it("follow a custom luminance curve through their source step", () => {
    const custom = defaultLuminances("light");
    custom["border-default"] = 0.4;
    const s = generateColorScale("accent", "#0062BA", "light", custom);
    expect(relativeLuminance(stepHex(s, "border-muted"))).toBeCloseTo(0.4, 2);
  });

  it("stay neutral grey on a base-only scale", () => {
    const bo = generateColorScale("accent", "#0062BA", "light", undefined, "base-only");
    for (const n of mutedNames) expect(oklchChroma(stepHex(bo, n))).toBeLessThan(0.02);
  });
});

describe("colourful muted style", () => {
  it("makes each muted step identical to its source step", () => {
    for (const mode of ["light", "dark"] as const) {
      const s = generateColorScale("accent", "#0062BA", mode, undefined, "normal", "colorful");
      for (const n of Object.keys(MUTED_STEPS) as MutedStepName[]) {
        expect(stepHex(s, n)).toBe(stepHex(s, MUTED_STEPS[n]));
      }
    }
  });

  it("defaults to neutral (muted differs from source)", () => {
    const s = generateColorScale("accent", "#0062BA");
    expect(stepHex(s, "border-muted")).not.toBe(stepHex(s, "border-default"));
  });
});
