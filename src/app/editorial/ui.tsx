import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts";
import { CardHead } from "./cardhead";
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
    <span
      className="pill mj"
      style={{ background: MEJORA.bg, color: MEJORA.fg }}
    >
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
    <span
      className="pill"
      style={{ background: c + "1f", color: s === "Baja" ? "var(--ink-2)" : c }}
    >
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
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
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
      setHi(
        (h) =>
          (h + (e.key === "ArrowDown" ? 1 : -1) + options.length) %
          options.length,
      );
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
              className={
                "dd-opt" +
                (i === hi ? " hi" : "") +
                (o[0] === value ? " on" : "")
              }
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
    <div
      className={"fseg" + (tone === "dark" ? " on-dark" : "")}
      role="group"
      aria-label={label}
    >
      {items.map((k) => (
        <button
          type="button"
          key={k}
          aria-pressed={v === k}
          onClick={() => set(k)}
        >
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
  return (
    <Dd
      value={v}
      onChange={setV}
      options={options}
      label={label}
      tone={tone}
      pre={pre}
    />
  );
}
export function FsegState({
  items,
  label,
}: {
  items: string[];
  label: string;
}) {
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
        <Fseg
          v={f}
          set={setF}
          items={["Todos", "Alta", "Media", "Baja"]}
          label="Nivel de severidad"
        />
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
/* Definiciones de los niveles de severidad: texto literal del BID (comentarios del 6 oct). Aplican a barreras y trámites. */

export function DonutList({
  data,
  totalLabel,
  size,
  heads,
  aria,
  marker,
  legend,
  unit,
  sel,
  onSel,
  compact,
}: any) {
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
  const dd = data.map((d, i) => ({
    ...d,
    i,
    pc: (fl[i] / 10).toFixed(1).replace(".", ","),
  }));
  const hsel = hs != null ? dd[hs] : null;
  const si = onSel ? dd.findIndex((d) => d.name === sel) : -1; // X1: fila elegida (se queda marcada; el hover solo la acompaña)
  const act = hs != null ? hs : si >= 0 ? si : -1;
  return (
    <div
      className={
        "sevbody" + (onSel ? " selectable" : "") + (compact ? " compact" : "")
      }
      style={{ "--ds": (size || 244) + "px" }}
    >
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
              activeIndex={act}
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
              onClick={onSel ? (_, i) => onSel(dd[i].name) : undefined}
            >
              {dd.map((d) => (
                <Cell
                  key={d.name}
                  fill={d.color}
                  fillOpacity={hs == null || hs === d.i ? 1 : 0.3}
                />
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
          <span>
            {unit ? unit[0].toUpperCase() + unit.slice(1) : "Barreras"}
          </span>
          <span>% total</span>
        </div>
        <ul className="sevlist" aria-label={aria}>
          {dd.map((d) => (
            <li
              key={d.name}
              tabIndex="0"
              className={(hs === d.i ? "on" : "") + (si === d.i ? " sel" : "")}
              style={{ "--c": d.color }}
              onMouseEnter={() => setHs(d.i)}
              onMouseLeave={() => setHs(null)}
              onFocus={() => setHs(d.i)}
              onBlur={() => setHs(null)}
              {...(onSel
                ? {
                    role: "button",
                    "aria-pressed": si === d.i,
                    onClick: () => onSel(d.name),
                    onKeyDown: (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSel(d.name);
                      }
                    },
                  }
                : {})}
            >
              <span className="sl">
                {marker === "pips" ? (
                  <Pips n={3 - d.i} color={d.color} />
                ) : (
                  <i className="dot"></i>
                )}
                <span>{d.name}</span>
              </span>
              <b className="n1">{fmtInt(d.value)}</b>
              <span className="n2">{d.pc} %</span>
              {d.desc ? (
                <p className="rdesc">
                  <span className="tbd">Pendiente</span> Por definir por el BID.
                </p>
              ) : null}
              {d.parts ? (
                <div className="sevsub">
                  <div className="sbar" aria-hidden="true">
                    {d.parts
                      .filter((q) => q.v > 0)
                      .map((q) => (
                        <i
                          key={q.k}
                          style={{ flex: q.v, background: q.color }}
                        ></i>
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
        <Fseg
          v={f}
          set={setF}
          items={["Todos", "Alta", "Media", "Baja"]}
          label="Nivel de severidad"
        />
      </div>
    </div>
  );
}

/* B10: banderas simplificadas en SVG (sin escudos ni detalles finos), proporción 3:2 */
export const starPts = (cx: number, cy: number, R: number) => {
  const r = R * 0.42;
  return [...Array(10)]
    .map((_, k) => {
      const a = -Math.PI / 2 + (k * Math.PI) / 5,
        rr = k % 2 ? r : R;
      return (
        (cx + rr * Math.cos(a)).toFixed(2) +
        "," +
        (cy + rr * Math.sin(a)).toFixed(2)
      );
    })
    .join(" ");
};
export const FLAGS: Record<string, React.ReactNode> = {
  AR: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect width="30" height="6.67" fill="#74acdf" />
      <rect y="13.33" width="30" height="6.67" fill="#74acdf" />
      <circle cx="15" cy="10" r="2.2" fill="#f6b40e" />
    </>
  ),
  BO: (
    <>
      <rect width="30" height="6.67" fill="#d52b1e" />
      <rect y="6.67" width="30" height="6.67" fill="#f9e300" />
      <rect y="13.33" width="30" height="6.67" fill="#007934" />
    </>
  ),
  CL: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect y="10" width="30" height="10" fill="#d52b1e" />
      <rect width="10" height="10" fill="#0039a6" />
      <polygon points={starPts(5, 5, 3)} fill="#fff" />
    </>
  ),
  CO: (
    <>
      <rect width="30" height="10" fill="#fcd116" />
      <rect y="10" width="30" height="5" fill="#003893" />
      <rect y="15" width="30" height="5" fill="#ce1126" />
    </>
  ),
  PE: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect width="10" height="20" fill="#d91023" />
      <rect x="20" width="10" height="20" fill="#d91023" />
    </>
  ),
  PA: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect x="15" width="15" height="10" fill="#da121a" />
      <rect y="10" width="15" height="10" fill="#072357" />
      <polygon points={starPts(7.5, 5, 2.6)} fill="#072357" />
      <polygon points={starPts(22.5, 15, 2.6)} fill="#da121a" />
    </>
  ),
};
export function Flag({ id, name }: { id: string; name: string }) {
  const cid = "fl-" + id;
  return (
    <svg
      className="flagsvg"
      viewBox="0 0 30 20"
      role="img"
      aria-label={"Bandera de " + name}
    >
      <defs>
        <clipPath id={cid}>
          <rect width="30" height="20" rx="3" />
        </clipPath>
      </defs>
      <g clipPath={"url(#" + cid + ")"}>{FLAGS[id] || null}</g>
      <rect
        x=".25"
        y=".25"
        width="29.5"
        height="19.5"
        rx="2.8"
        fill="none"
        stroke="rgba(16,34,45,.18)"
        strokeWidth=".5"
      />
    </svg>
  );
}
/* Definiciones de los niveles de severidad: texto literal del BID (comentarios del 6 oct). Aplican a barreras y trámites. */
export const SEV_DEFS: Record<string, string> = {
  Alta: "La restricción o carga es severa y puede bloquear, excluir, desalentar fuertemente o dificultar sustancialmente la entrada, operación o cumplimiento.",
  Media:
    "La carga o restricción es significativa y exige recursos, tiempo o ajustes no triviales que alteran las opciones o decisiones que toma la empresa.",
  Baja: "Existe una carga o restricción menor concreta y observable que implica costo, tiempo o incertidumbre marginal.",
};
/* B4: severidad en un solo recuadro; las definiciones van en un panel interno diferenciado */

/* B4: severidad en un solo recuadro. El panel conserva «Cómo leer la severidad»; las definiciones de nivel se abren
   con un botón (panel flotante fijo en escritorio, despliegue dentro de la tarjeta en celular) para mantener la altura original. */
/* Definiciones de severidad vigentes (Word BID 8 oct); se muestran en las tarjetas de Barreras y de Trámites */
export const SEV_DEFS_TR: Record<string, string> = {
  Alta: "El trámite impone costos, tiempos, gestiones o esfuerzos elevados o desproporcionados que obstaculizan sustancialmente su cumplimiento, pudiendo desalentar su realización, provocar su abandono o impedir que se complete.",
  Media:
    "El trámite impone costos, tiempos, gestiones o esfuerzos considerables que generan dificultades importantes para su cumplimiento, requieren recursos o acciones adicionales significativas y pueden demorar o desalentar su realización.",
  Baja: "El trámite impone costos, tiempos, gestiones o esfuerzos adicionales que generan dificultades concretas para su cumplimiento, aunque estas son relativamente acotadas y pueden superarse sin mayores obstáculos.",
};
export function SevPanel({
  T,
  title,
  data,
  totalLabel,
  unit,
  aria,
  def,
  defs,
}: any) {
  return (
    <section className="card sevone">
      <CardHead title={title} noInfo={true} />
      <div className="sevone-in">
        <div className="sevone-chart">
          <DonutList
            data={data}
            totalLabel={totalLabel}
            unit={unit}
            heads={["Nivel"]}
            aria={aria}
            marker="pips"
            compact={true}
          />
        </div>
        <div className="sevone-defs">
          <span className="sd-top">
            <span className="ico" aria-hidden="true">
              <Icon d={I.info} />
            </span>
            Cómo leer la severidad
          </span>
          <ul className="sd-list">
            {["Alta", "Media", "Baja"].map((s, i) => (
              <li key={s}>
                <span className="sd-k">
                  <Pips n={3 - i} color={T.sev[s]} />
                  <b>{s}</b>
                </span>
                <p>{(defs || SEV_DEFS_TR)[s]}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
