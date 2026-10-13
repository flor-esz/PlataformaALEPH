import React, { useState } from "react";
import { createPortal } from "react-dom";
import { DEFS, type Def } from "./defs";
import { I } from "./icons";

export function InfoBtn({
  k,
  def,
  tone,
  size,
}: {
  k?: string;
  def?: Def | null;
  tone?: "dark";
  size?: "lg";
}) {
  const d = def || DEFS[k];
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState(false);
  const [pos, setPos] = useState<any>(null);
  const bRef = React.useRef<HTMLButtonElement>(null),
    pRef = React.useRef<HTMLDivElement>(null),
    tm = React.useRef<any>(null);
  const id = React.useId();
  const clear = () => clearTimeout(tm.current);
  const openSoon = () => {
    clear();
    tm.current = setTimeout(() => setOpen(true), 140);
  };
  const closeSoon = () => {
    clear();
    if (!pin) tm.current = setTimeout(() => setOpen(false), 180);
  };
  const closeNow = () => {
    clear();
    setOpen(false);
    setPin(false);
  };
  React.useLayoutEffect(() => {
    if (!open || !bRef.current || !pRef.current) {
      setPos(null);
      return;
    }
    const b = bRef.current.getBoundingClientRect(),
      W = pRef.current.offsetWidth,
      H = pRef.current.offsetHeight;
    const vw = window.innerWidth,
      vh = window.innerHeight;
    const left = Math.min(
      Math.max(b.left + b.width / 2 - W / 2, 12),
      vw - W - 12,
    );
    const above = b.bottom + 12 + H > vh - 12 && b.top - 12 - H > 12;
    setPos({
      left,
      top: above ? b.top - 12 - H : b.bottom + 12,
      above,
      ax: Math.min(Math.max(b.left + b.width / 2 - left - 6, 14), W - 26),
    });
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const down = (e) => {
      if (bRef.current && bRef.current.contains(e.target)) return;
      if (pRef.current && pRef.current.contains(e.target)) return;
      closeNow();
    };
    const key = (e) => {
      if (e.key === "Escape") {
        closeNow();
        if (bRef.current) bRef.current.focus();
      }
    };
    const scr = () => closeNow();
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", scr, true);
    window.addEventListener("resize", scr);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", scr, true);
      window.removeEventListener("resize", scr);
    };
  }, [open]);
  React.useEffect(() => () => clearTimeout(tm.current), []);
  if (!d) return null;
  const host =
    open && bRef.current ? bRef.current.closest(".ed") || document.body : null;
  const pop = host
    ? createPortal(
        <div
          className={"ipop " + (pos ? (pos.above ? "above" : "below") : "")}
          id={id}
          role="tooltip"
          ref={pRef}
          style={
            pos
              ? { left: pos.left, top: pos.top }
              : { left: 0, top: 0, visibility: "hidden" }
          }
          onMouseEnter={clear}
          onMouseLeave={closeSoon}
        >
          {pos ? (
            <span className="ipop-arrow" style={{ left: pos.ax }}></span>
          ) : null}
          {pin ? (
            <button
              type="button"
              className="ipop-x"
              aria-label="Cerrar definición"
              onClick={closeNow}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          ) : null}
          <div className="ipop-eye">Definición</div>
          <h4>{d.t}</h4>
          <p>{d.d}</p>
          {d.items ? (
            <ul className="ipop-list">
              {d.items.map(([n, t]) => (
                <li key={n}>
                  <b>{n}:</b> {t}
                </li>
              ))}
            </ul>
          ) : null}
          {d.how ? (
            <div className="ipop-how">
              <b>Cómo se lee. </b>
              {d.how}
            </div>
          ) : null}
        </div>,
        host,
      )
    : null;
  return (
    <>
      <button
        type="button"
        ref={bRef}
        className={
          "ibtn" +
          (size === "lg" ? " lg" : "") +
          (tone === "dark" ? " on-dark" : "")
        }
        aria-label={"Definición: " + d.t}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onMouseEnter={openSoon}
        onMouseLeave={closeSoon}
        onClick={() => {
          if (open && pin) {
            closeNow();
          } else {
            clear();
            setOpen(true);
            setPin(true);
          }
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d={I.info} />
        </svg>
      </button>
      {pop}
    </>
  );
}
