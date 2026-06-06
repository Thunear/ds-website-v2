/** Minimal typing for the (Chromium) EyeDropper API. */
interface EyeDropperResult {
  sRGBHex: string;
}
interface EyeDropperLike {
  open: () => Promise<EyeDropperResult>;
}
type EyeDropperCtor = new () => EyeDropperLike;

export const eyeDropperSupported = (): boolean =>
  typeof window !== "undefined" && "EyeDropper" in window;

/** Open the native eyedropper; resolves to a hex string or null if cancelled. */
export async function pickColorFromScreen(): Promise<string | null> {
  const Ctor = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper;
  if (!Ctor) return null;
  try {
    const { sRGBHex } = await new Ctor().open();
    return sRGBHex;
  } catch {
    // user cancelled (Escape)
    return null;
  }
}
