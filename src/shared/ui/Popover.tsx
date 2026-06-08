import {
  cloneElement,
  isValidElement,
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
  | "top-end";

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
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !floatingRef.current) return;
    const a = anchorRef.current.getBoundingClientRect();
    const f = floatingRef.current.getBoundingClientRect();
    const gap = 8;
    const below = placement.startsWith("bottom");

    let top = below ? a.bottom + gap : a.top - f.height - gap;
    let left: number;
    if (placement.endsWith("start")) left = a.left;
    else if (placement.endsWith("end")) left = a.right - f.width;
    else left = a.left + a.width / 2 - f.width / 2;

    // keep within viewport
    left = Math.max(8, Math.min(left, window.innerWidth - f.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - f.height - 8));
    setPos({ top, left });
  }, [open, placement]);

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
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
