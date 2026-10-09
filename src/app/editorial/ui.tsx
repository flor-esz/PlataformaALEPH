import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts";
import { fmtInt } from "./format";
import { I, Icon } from "./icons";
import { T, type Sev } from "./theme";
import { MEJORA } from "./theme";

export function Pips({ n, color }: { n: number; color: string }) {
  return (
    <span className="pips" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <i key={i} style={{ background: i < n ? color : undefined }}></i>
      ))}
    </span>
  );
}
export function Mejora({ t }: { t: string }) {
  return (
    <span className="pill" style={{ background: MEJORA.bg, color: MEJORA.fg }}>
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12l5 5L20 7" />
      </svg>
      {t}
    </span>
  );
}
export function SevPill({ s }: { s: Sev }) {
  const c = T.sev[s];
  const n = { Alta: 3, Media: 2, Baja: 1 }[s];
  return (
    <span className="pill" style={{ background: c + "1f", color: s === "Baja" ? "var(--ink-2)" : c }}>
      <Pips n={n} color={c} />
      {s}
    </span>
  );
}

/* Selector desplegable propio (reemplaza el <select> nativo) */
export function Dd({
  value,
  options,
  onChange,
  label,
  pre,
  tone,
}: {
  value: string;
  options: any[][];
  onChange: (v: string) => void;
  label: string;
  pre?: string;
  tone?: "dark";
}) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const idx = Math.max(
    0,
    options.findIndex((o) => o[0] === value),
  );
  const cur = options.find((o) => o[0] === value) ?? [value, value];
  const pick = (v) => {
    onChange(v);
    setOpen(false);
  };
  const onKey = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setHi(idx);
        setOpen(true);
        return;
      }
      setHi((h) => (h + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if ((e.key === "Enter" || e.key === " ") && open) {
      e.preventDefault();
      pick(options[hi][0]);
    }
  };
  return (
    <div className={"dd" + (tone === "dark" ? " on-dark" : "")} ref={ref}>
      <button
        type="button"
        className={"dd-btn" + (open ? " is-open" : "")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => {
          setHi(idx);
          setOpen(!open);
        }}
        onKeyDown={onKey}
      >
        {pre ? <span className="dd-pre">{pre}</span> : null}
        <span>{cur[1]}</span>
        <Icon d={I.chev} cls="dd-chev" />
      </button>
      {open ? (
        <ul className="dd-menu" role="listbox" aria-label={label}>
          {options.map((o, i) => (
            <li
              key={o[0]}
              role="option"
              aria-selected={o[0] === value}
              className={"dd-opt" + (i === hi ? " hi" : "") + (o[0] === value ? " on" : "")}
              onMouseEnter={() => setHi(i)}
              onClick={() => pick(o[0])}
            >
              <span className="dd-chk" aria-hidden="true">
                {o[0] === value ? <Icon d="M5 12.5l4.5 4.5L19 7.5" /> : null}
              </span>
              <span className="dd-txt">
                <b>{o[2] || o[1]}</b>
                {o[3] ? <small>{o[3]}</small> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
export function Fseg({
  v,
  set,
  items,
  label,
  tone,
}: {
  v: string;
  set: (v: string) => void;
  items: string[];
  label: string;
  tone?: "dark";
}) {
  return (
    <div className={"fseg" + (tone === "dark" ? " on-dark" : "")} role="group" aria-label={label}>
      {items.map((k) => (
        <button type="button" key={k} aria-pressed={v === k} onClick={() => set(k)}>
          {k}
        </button>
      ))}
    </div>
  );
}
export function DdState({
  options,
  init,
  label,
  tone,
  pre,
}: {
  options: any[][];
  init?: string;
  label: string;
  tone?: "dark";
  pre?: string;
}) {
  const [v, setV] = useState(init || options[0][0]);
  return <Dd value={v} onChange={setV} options={options} label={label} tone={tone} pre={pre} />;
}
export function FsegState({ items, label }: { items: string[]; label: string }) {
  const [v, setV] = useState(items[0]);
  return <Fseg v={v} set={setV} items={items} label={label} />;
}
export const DIS_OPTS = [
  ["tipo", "Tipo", "Tipo de barrera", "Entrada y Operación"],
  ["sev", "Severidad", "Nivel de severidad", "Alta, Media y Baja"],
  ["total", "Total", "Sin desagregar", "Total de barreras"],
];
export function Ctl({ f, setF, d, setD, vlabel, vpre }: any) {
  return (
    <div className="ctlrow" role="group" aria-label="Filtros de la gráfica">
      <div className="cg">
        <span className="clbl">
          <span className="clbl-t">Severidad</span>
          <span className="clbl-ico" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
          </span>
        </span>
        <Fseg v={f} set={setF} items={["Todos", "Alta", "Media", "Baja"]} label="Nivel de severidad" />
      </div>
      <div className="cg cg-view">
        <span className="clbl clbl-t">{vlabel || "Filtros"}</span>
        <Dd
          value={d}
          onChange={setD}
          options={DIS_OPTS}
          label={vlabel ? "Desglosar por" : "Desagregar barras por"}
          pre={vpre || "Filtros:"}
        />
      </div>
    </div>
  );
}
export function DonutList({ data, totalLabel, size, heads, aria, marker, legend, unit }: any) {
  const [hs, setHs] = useState(null);
  const tot = data.reduce((a, d) => a + d.value, 0);
  const raw = data.map((d: any) => (tot ? (d.value / tot) * 1000 : 0)),
    fl = raw.map(Math.floor);
  let rem = 1000 - fl.reduce((a, b) => a + b, 0);
  raw
    .map((r, i) => [r - fl[i], i])
    .sort((a, b) => b[0] - a[0])
    .slice(0, rem)
    .forEach(([, i]) => fl[i]++);
  const dd = data.map((d, i) => ({ ...d, i, pc: (fl[i] / 10).toFixed(1).replace(".", ",") }));
  const hsel = hs != null ? dd[hs] : null;
  return (
    <div className="sevbody" style={{ "--ds": (size || 244) + "px" }}>
      <div className="donut" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={dd}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="92%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={3}
              cornerRadius={9}
              stroke="none"
              isAnimationActive={false}
              activeIndex={hs == null ? -1 : hs}
              activeShape={(q) => (
                <Sector
                  cx={q.cx}
                  cy={q.cy}
                  innerRadius={q.innerRadius - 2}
                  outerRadius={q.outerRadius + 7}
                  startAngle={q.startAngle}
                  endAngle={q.endAngle}
                  fill={q.fill}
                  cornerRadius={9}
                />
              )}
              labelLine={false}
              onMouseEnter={(_, i) => setHs(i)}
              onMouseLeave={() => setHs(null)}
            >
              {dd.map((d) => (
                <Cell key={d.name} fill={d.color} fillOpacity={hs == null || hs === d.i ? 1 : 0.3} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="dctr">
          {hsel ? (
            <>
              <span className="cl">{hsel.cap || hsel.name}</span>
              <b className="cv">
                {hsel.pc}
                <small>%</small>
              </b>
              <span className="cs">
                {fmtInt(hsel.value)} {unit || "barreras"}
              </span>
            </>
          ) : (
            <>
              <span className="cl">{totalLabel}</span>
              <b className="cv">{fmtInt(tot)}</b>
              <span className="cs">100 %</span>
            </>
          )}
        </div>
      </div>
      <div className="sevtab">
        {legend || null}
        <div className="sevhd" aria-hidden="true">
          <span>{heads[0]}</span>
          <span>{unit ? unit[0].toUpperCase() + unit.slice(1) : "Barreras"}</span>
          <span>% total</span>
        </div>
        <ul className="sevlist" aria-label={aria}>
          {dd.map((d) => (
            <li
              key={d.name}
              tabIndex="0"
              className={hs === d.i ? "on" : ""}
              style={{ "--c": d.color }}
              onMouseEnter={() => setHs(d.i)}
              onMouseLeave={() => setHs(null)}
              onFocus={() => setHs(d.i)}
              onBlur={() => setHs(null)}
            >
              <span className="sl">
                {marker === "pips" ? <Pips n={3 - d.i} color={d.color} /> : <i className="dot"></i>}
                <span>{d.name}</span>
              </span>
              <b className="n1">{fmtInt(d.value)}</b>
              <span className="n2">{d.pc} %</span>
              {d.parts ? (
                <div className="sevsub">
                  <div className="sbar" aria-hidden="true">
                    {d.parts
                      .filter((q) => q.v > 0)
                      .map((q) => (
                        <i key={q.k} style={{ flex: q.v, background: q.color }}></i>
                      ))}
                  </div>
                  <div className="svals">
                    {d.parts.map((q) => (
                      <span key={q.k} style={{ opacity: q.v > 0 ? 1 : 0.45 }}>
                        <i style={{ background: q.color }}></i>
                        {q.k} <b>{fmtInt(q.v)}</b>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export function CtlSev({ f, setF }: any) {
  return (
    <div className="ctlrow" role="group" aria-label="Filtros de la gráfica">
      <div className="cg">
        <span className="clbl">
          <span className="clbl-t">Severidad</span>
          <span className="clbl-ico" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
          </span>
        </span>
        <Fseg v={f} set={setF} items={["Todos", "Alta", "Media", "Baja"]} label="Nivel de severidad" />
      </div>
    </div>
  );
}
