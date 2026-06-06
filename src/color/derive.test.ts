import { describe, expect, it } from "vitest";
import chroma from "chroma-js";
import { applyChromaMultiplier, chromaOf, deriveScale } from "./derive";
import { relativeLuminance } from "./contrast";
import { defaultLuminances } from "./scale";
import { createScale } from "@/theme/config";

describe("applyChromaMultiplier", () => {
  it("changes chroma but preserves WCAG luminance (safe mode)", () => {
    const start = "#3a7bd5";
    const startLum = relativeLuminance(start);
    const less = applyChromaMultiplier(start, 0.4);
    const more = applyChromaMultiplier(start, 1.4);

    // luminance held constant
    expect(relativeLuminance(less)).toBeCloseTo(startLum, 2);
    expect(relativeLuminance(more)).toBeCloseTo(startLum, 2);
    // chroma actually moved in the requested direction
    expect(chromaOf(less)).toBeLessThan(chromaOf(start));
    expect(chromaOf(more)).toBeGreaterThan(chromaOf(start));
  });

  it("a 0 multiplier yields a neutral grey", () => {
    const grey = applyChromaMultiplier("#3a7bd5", 0);
    expect(chromaOf(grey)).toBeLessThan(0.02);
  });
});

describe("deriveScale chroma adjustment", () => {
  it("applies a per-step chroma multiplier without shifting luminance", () => {
    const cfg = createScale("accent", "#0062BA");
    cfg.chroma = { light: { "border-default": 0.3 } };
    const lum = defaultLuminances("light");

    const plain = deriveScale(createScale("accent", "#0062BA"), "light", lum);
    const adjusted = deriveScale(cfg, "light", lum);

    const stepOf = (s: ReturnType<typeof deriveScale>) =>
      s.steps.find((x) => x.name === "border-default")!;

    expect(chromaOf(stepOf(adjusted).hex)).toBeLessThan(
      chromaOf(stepOf(plain).hex),
    );
    expect(stepOf(adjusted).luminance).toBeCloseTo(stepOf(plain).luminance, 2);
  });

  it("hex override still wins over a chroma multiplier", () => {
    const cfg = createScale("accent", "#0062BA");
    cfg.chroma = { light: { "surface-hover": 0.2 } };
    cfg.overrides = { light: { "surface-hover": "#abcdef" } };
    const s = deriveScale(cfg, "light", defaultLuminances("light"));
    expect(
      s.steps.find((x) => x.name === "surface-hover")!.hex.toLowerCase(),
    ).toBe("#abcdef");
    // sanity: chroma helper available
    expect(chroma("#abcdef").oklch().length).toBe(3);
  });
});
