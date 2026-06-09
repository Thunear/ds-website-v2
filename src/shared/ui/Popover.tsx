import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Popover.module.css";

type Placement =
  | "bottom"
  | "top"
  | "bottom-start"
  | "top-start"
  | "bottom-end"
  | "top-end"
  | "right"
  | "left"
  | "right-start"
  | "left-start"
  | "right-end"
  | "left-end";

interface PopoverProps {
  /** Element that toggles the popover. Must accept onClick + ref. */
  trigger: ReactElement;
  children: ReactNode;
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Minimal headless popover: portals content to the body, anchors it to the
 * trigger with fixed positioning, and dismisses on outside-click / Escape.
 */
export function Popover({
  trigger,
  children,
  placement = "bottom-start",
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    if (controlledOpen === undefined) setUncontrolled(v);
  };

  const anchorRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    arrowSide: "top" | "bottom" | "left" | "right";
    arrowOffset: number;
  } | null>(null);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current || !floatingRef.current) return;
    const a = anchorRef.current.getBoundingClientRect();
    const f = floatingRef.current.getBoundingClientRect();
    const gap = 8;
    const side = placement.startsWith("left") || placement.startsWith("right");

    // Viewport-relative target + which popover edge the arrow sits on.
    let top: number;
    let left: number;
    let arrowSide: "top" | "bottom" | "left" | "right";
    let arrowOffset: number;

    if (side) {
      const toRight = placement.startsWith("right");
      left = toRight ? a.right + gap : a.left - f.width - gap;
      if (placement.endsWith("end")) top = a.bottom - f.height;
      else if (placement.endsWith("start")) top = a.top;
      else top = a.top + a.height / 2 - f.height / 2;
      arrowSide = toRight ? "left" : "right";
      arrowOffset = a.top + a.height / 2 - top; // vertical, within popover
    } else {
      const below = placement.startsWith("bottom");
      top = below ? a.bottom + gap : a.top - f.height - gap;
      if (placement.endsWith("end")) left = a.right - f.width;
      else if (placement.endsWith("start")) left = a.left;
      else left = a.left + a.width / 2 - f.width / 2;
      arrowSide = below ? "top" : "bottom";
      arrowOffset = a.left + a.width / 2 - left; // horizontal, within popover
    }

    // Keep within the viewport.
    left = Math.max(8, Math.min(left, window.innerWidth - f.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - f.height - 8));

    // Clamp the arrow so it stays on the popover edge.
    const limit = side ? f.height : f.width;
    arrowOffset = Math.max(16, Math.min(arrowOffset, limit - 16));

    // Position in document space (position:absolute) so it scrolls with the
    // page glued to the trigger — no per-scroll re-positioning (avoids jitter).
    setPos({
      top: top + window.scrollY,
      left: left + window.scrollX,
      arrowSide,
      arrowOffset,
    });
  }, [placement]);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  // Recompute on resize (the trigger may shift); scrolling is handled natively
  // by absolute/document positioning.
  useEffect(() => {
    if (!open) return;
    const onResize = () => updatePosition();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (
        floatingRef.current?.contains(e.target as Node) ||
        anchorRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  });

  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<any>, {
        ref: (node: HTMLElement | null) => {
          anchorRef.current = node;
        },
        onClick: (e: React.MouseEvent) => {
          (trigger.props as any).onClick?.(e);
          setOpen(!open);
        },
      })
    : trigger;

  return (
    <>
      {triggerEl}
      {open &&
        createPortal(
          <div
            ref={floatingRef}
            className={styles.floating}
            style={{
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              visibility: pos ? "visible" : "hidden",
            }}
            role="dialog"
          >
            {pos && (
              <span
                aria-hidden
                className={
                  {
                    top: styles.arrowTop,
                    bottom: styles.arrowBottom,
                    left: styles.arrowLeft,
                    right: styles.arrowRight,
                  }[pos.arrowSide]
                }
                style={
                  pos.arrowSide === "top" || pos.arrowSide === "bottom"
                    ? { left: pos.arrowOffset }
                    : { top: pos.arrowOffset }
                }
              />
            )}
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
