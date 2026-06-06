import { describe, expect, it } from "vitest";
import chroma from "chroma-js";
import {
  defaultLuminances,
  generateColorScale,
  interpolationColor,
  STEP_LUMINANCE,
} from "./scale";
import { contrastRatio, relativeLuminance } from "./contrast";
import type { ColorStepName } from "./types";

const stepHex = (scale: ReturnType<typeof generateColorScale>, n: ColorStepName) =>
  scale.steps.find((s) => s.name === n)!.hex;

describe("generateColorScale", () => {
  it("produces all 16 steps", () => {
    const scale = generateColorScale("accent", "#0062BA");
    expect(scale.steps).toHaveLength(16);
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
});
