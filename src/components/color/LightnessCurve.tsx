import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { GRID_GROUPS } from "@/color/types";
import { defaultLuminanceArray } from "@/color/scale";
import { LIGHTNESS_PRESETS, matchPreset } from "@/color/presets";
import { useThemeStore } from "@/theme/ThemeStore";
import { ArrowUndoIcon } from "@/components/ui/icons";
import styles from "./LightnessCurve.module.css";

const CURVE_H = 190;
const TOP_PAD = 12;
const BOTTOM_PAD = 14;
const PLOT_H = CURVE_H - TOP_PAD - BOTTOM_PAD;
const GRID_TICKS = [0, 0.25, 0.5, 0.75, 1];

const round3 = (n: number) => Math.round(n * 1000) / 1000;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Flatten the grid groups into a per-step layout. Contrast steps get a running
 * `valueIndex` into the curve values; the Base group is kept as an empty slot
 * so its width is reserved and the handles line up with the grid columns.
 */
function buildLayout() {
  let valueIndex = 0;
  return GRID_GROUPS.map((group) => ({
    group,
    isBase: group.group === "base",
    steps:
      group.group === "base"
        ? []
        : group.steps.map((def) => ({ def, valueIndex: valueIndex++ })),
  }));
}
const LAYOUT = buildLayout();

const yFor = (v: number) => TOP_PAD + (1 - v) * PLOT_H;

export function LightnessCurve() {
  const {
    mode,
    activeTheme,
    setLightness,
    setLightnessCurve,
    resetLightness,
  } = useThemeStore();
  const values = activeTheme.lightness?.[mode] ?? defaultLuminanceArray(mode);

  const lightCurve = activeTheme.lightness?.light ?? defaultLuminanceArray("light");
  const darkCurve = activeTheme.lightness?.dark ?? defaultLuminanceArray("dark");
  const activePresetId = matchPreset(lightCurve, darkCurve)?.id ?? "custom";

  const applyPreset = (id: string) => {
    const preset = LIGHTNESS_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    if (preset.id === "aa") {
      // AA == the defaults; clear so it reads as "not customised".
      resetLightness("light");
      resetLightness("dark");
    } else {
      setLightnessCurve("light", preset.light);
      setLightnessCurve("dark", preset.dark);
    }
  };

  const areaRef = useRef<HTMLDivElement | null>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cx, setCx] = useState<number[]>([]);
  const [plotW, setPlotW] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);

  const measure = useCallback(() => {
    const area = areaRef.current;
    if (!area) return;
    const left = area.getBoundingClientRect().left;
    setPlotW(area.clientWidth);
    setCx(
      colRefs.current.map((c) => {
        if (!c) return 0;
        const r = c.getBoundingClientRect();
        return r.left - left + r.width / 2;
      }),
    );
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (areaRef.current) ro.observe(areaRef.current);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    if (drag === null) return;
    const onMove = (e: PointerEvent) => {
      const rect = areaRef.current!.getBoundingClientRect();
      const v = 1 - (e.clientY - rect.top - TOP_PAD) / PLOT_H;
      setLightness(mode, drag, round3(Math.min(1, Math.max(0, v))));
    };
    const onUp = () => setDrag(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, mode, setLightness]);

  const haveGeometry = cx.length === values.length && plotW > 0;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h3>Lyshetskurve</h3>
          <p className={styles.sub}>
            Juster mål-luminansen for hvert steg. Endringen gjelder alle
            fargeskalaene i <strong>{mode === "dark" ? "mørk" : "lys"}</strong>{" "}
            modus.
          </p>
        </div>
        <div className={styles.headerControls}>
          <label className={styles.presetField}>
            <span className={styles.presetLabel}>Forhåndsinnstilling</span>
            <select
              className={styles.presetSelect}
              value={activePresetId}
              onChange={(e) => applyPreset(e.target.value)}
            >
              {LIGHTNESS_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
              {activePresetId === "custom" && (
                <option value="custom">Tilpasset</option>
              )}
            </select>
          </label>
          <button
            className={styles.reset}
            onClick={() => applyPreset("aa")}
            disabled={activePresetId === "aa"}
          >
            <ArrowUndoIcon aria-hidden /> Tilbakestill kurve
          </button>
        </div>
      </div>

      <div className={styles.plotRow}>
        {/* y-axis ticks, aligned to the grid's scale-name column */}
        <div className={styles.yAxis} style={{ height: CURVE_H }}>
          {GRID_TICKS.map((v) => (
            <span key={v} className={styles.yTick} style={{ top: yFor(v) }}>
              {v.toFixed(2)}
            </span>
          ))}
        </div>

        <div className={styles.plotCol}>
          <div ref={areaRef} className={styles.curveArea} style={{ height: CURVE_H }}>
            {/* measurement columns – mirror the grid's grouped-flex layout */}
            <div className={styles.cols}>
              {LAYOUT.map((l) => (
                <div
                  key={l.group.group}
                  className={styles.cGroup}
                  style={{ flex: l.group.steps.length }}
                >
                  {l.steps.map((s) => (
                    <div
                      key={s.def.name}
                      className={styles.cCol}
                      ref={(el) => {
                        colRefs.current[s.valueIndex] = el;
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {haveGeometry && (
              <svg className={styles.svg} width={plotW} height={CURVE_H}>
                {GRID_TICKS.map((v) => (
                  <line
                    key={v}
                    x1={0}
                    x2={plotW}
                    y1={yFor(v)}
                    y2={yFor(v)}
                    className={styles.grid}
                  />
                ))}
                {values.map((v, i) => (
                  <line
                    key={i}
                    x1={cx[i]}
                    x2={cx[i]}
                    y1={yFor(v)}
                    y2={CURVE_H - BOTTOM_PAD}
                    className={styles.stem}
                  />
                ))}
                <polyline
                  className={styles.line}
                  points={values.map((v, i) => `${cx[i]},${yFor(v)}`).join(" ")}
                />
                {values.map((v, i) => (
                  <circle
                    key={i}
                    cx={cx[i]}
                    cy={yFor(v)}
                    r={7}
                    className={styles.handle}
                    data-active={drag === i || undefined}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setDrag(i);
                    }}
                  />
                ))}
              </svg>
            )}
          </div>

          {/* labels under the curve, same grouped-flex layout → aligned */}
          <div className={styles.labelRow}>
            {LAYOUT.map((l) => (
              <div
                key={l.group.group}
                className={styles.lGroup}
                style={{ flex: l.group.steps.length }}
              >
                {l.steps.map((s) => (
                  <div key={s.def.name} className={styles.lCol}>
                    <span className={styles.lGroupName}>{cap(s.def.group)}</span>
                    <span className={styles.lLabel}>{s.def.label}</span>
                    <span className={styles.lValue}>
                      {values[s.valueIndex].toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* matches the rows' right-hand actions column so the plot aligns */}
        <div className={styles.actionsSpacer} />
      </div>
    </div>
  );
}
