import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
} from "recharts";
import { fmtInt } from "./format";
import { ALC_COLOR, ALC_DASH } from "./theme";

/* ================= Piezas de gráfica ================= */
/* ================= Piezas de gráfica ================= */
export function Tip({ active, payload, label, T, unit, title }: any) {
  if (!active || !payload || !payload.length) return null;
  const rows = [...payload]
    .filter((p) => p.value != null)
    .sort((a, b) => b.value - a.value);
  return (
    <div className="tt">
      <div className="t">{title ? title(label) : label}</div>
      {rows.map((p) => (
        <div className="r" key={p.dataKey}>
          <i style={{ background: p.color || p.payload.fill }}></i>
          <span>{p.name}</span>
          <b>{typeof p.value === "number" ? fmtInt(p.value) : p.value}</b>
        </div>
      ))}
      {unit ? (
        <div className="unit" style={{ marginTop: 6 }}>
          {unit}
        </div>
      ) : null}
    </div>
  );
}

export const axisProps = (T: any) => ({
  tick: {
    fill: T.axis,
    fontSize: 11.5,
    fontFamily: "Inter, system-ui, sans-serif",
  },
  tickLine: false,
  axisLine: false,
});

/* Nombre de eje (todas las gráficas). Siempre horizontal, para leerlo sin girar la cabeza:
   eje vertical → arriba, alineado a la izquierda sobre sus etiquetas; eje horizontal → centrado debajo.
   Las gráficas reservan el espacio con margin.top (AX_TOP) y la altura del eje X (AX_XH / AX_XH0). */
export const AX_TOP = 30,
  AX_XH = 44,
  AX_XH0 = 24;

export const AX_STYLE = {
  fill: "var(--ink-2)",
  fontSize: 11,
  fontWeight: 600,
  fontFamily: "Inter, system-ui, sans-serif",
};

/* Ancho real del nombre de un eje (11 px, seminegrita) para reservar el espacio de las etiquetas del eje vertical */
let _mc: CanvasRenderingContext2D | null | undefined;
export const titleW = (t: string) => {
  try {
    _mc = _mc || document.createElement("canvas").getContext("2d");
    _mc.font = "600 11px Inter, system-ui, sans-serif";
    return Math.ceil(_mc.measureText(t).width);
  } catch (e) {
    return t.length * 6.4;
  }
};
export const NARROW = () => window.innerWidth < 640;
export const yW = (w: number, t: string) =>
  NARROW() ? w : Math.max(w, titleW(t) + 12);
export const axT = (text: any, side?: any) => ({
  value: text,
  content: ({ viewBox: v }) =>
    !v ? null : side === "y" ? (
      <text x={v.x} y={v.y - 16} textAnchor="start" {...AX_STYLE}>
        {text}
      </text>
    ) : side === "yr" ? (
      titleW(text) + 8 <= v.width ? (
        <text x={v.x + v.width - 8} y={v.y - 16} textAnchor="end" {...AX_STYLE}>
          {text}
        </text>
      ) : (
        <text x={v.x} y={v.y - 16} textAnchor="start" {...AX_STYLE}>
          {text}
        </text>
      )
    ) : (
      <text
        x={v.x + v.width / 2}
        y={v.y + Math.min(v.height - 5, 33)}
        textAnchor="middle"
        {...AX_STYLE}
      >
        {text}
      </text>
    ),
});

/* Eje de años: todos los años cuando caben (≥ 32 px por año); si no, intervalos regulares y simétricos
   que incluyen el primer y el último año (10 años → 2015, 2018, 2021, 2024). Nunca saltos irregulares. */
export const YEAR_MIN_PX = 32;

export const yearTick =
  (T) =>
  ({ x, y, payload, index, width, visibleTicksCount }) => {
    const n = visibleTicksCount || 1,
      band = (width || 0) / n;
    let k = 1;
    while (k < n - 1 && (band * k < YEAR_MIN_PX || (n - 1) % k)) k++;
    if (index % k) return null;
    return (
      <text
        x={x}
        y={y}
        dy="12"
        textAnchor="middle"
        fill={T.axis}
        fontSize="11.5"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {payload.value}
      </text>
    );
  };

export const yearAxis = (T: any) => ({
  dataKey: "year",
  ...axisProps(T),
  interval: 0,
  tick: yearTick(T),
  height: AX_XH,
  label: axT("Año", "x"),
});

/* Zoom de años: si en el ancho real de la gráfica no caben todos los años (la misma regla del eje: ≥ 32 px por año),
   la gráfica lleva una barra con dos manijas para acotar el período; al acotarlo, el eje muestra cada año.
   Cada gráfica mide su propio ancho y se recalcula al cambiar el tamaño de la ventana. Componente Brush de Recharts. */
export const PLOT_PAD = 48 + 18; // eje Y + margen derecho

export function useYearZoom(nAnios: number) {
  const ref = React.useRef<any>(null);
  const [z, setZ] = useState(false);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const w = el.clientWidth;
      if (w) setZ(w - PLOT_PAD < nAnios * YEAR_MIN_PX);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, z];
}

/* Barra minimalista: riel claro de 6 px, tramo elegido en cian suave y manijas en píldora azul. Sin textos: el eje ya muestra los años. */
export const BrushHandle = ({ x, y, width, height }: any) => (
  <g style={{ cursor: "ew-resize" }}>
    <rect
      x={x - 4}
      y={y - 14}
      width={width + 8}
      height={height + 28}
      fill="transparent"
    />
    <rect
      x={x + width / 2 - 3}
      y={y + height / 2 - 8}
      width="6"
      height="16"
      rx="3"
      fill="#004e70"
    />
  </g>
);

export const zoomBrush = (z: any) =>
  z ? (
    <Brush
      dataKey="year"
      height={6}
      travellerWidth={10}
      stroke="none"
      fill="#e7e4de"
      traveller={BrushHandle}
      tickFormatter={() => ""}
      ariaLabel="Seleccionar período"
    />
  ) : null;

export const ZoomHint = (z: any) =>
  z ? (
    <p className="zhint">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M8 7l-4 5 4 5M16 7l4 5-4 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Arrastra los extremos de la barra inferior para ver el detalle año por
      año.
    </p>
  ) : null;

/* Categorías «Otros»: la categoría lleva asterisco y la gráfica una nota al pie, solo cuando la categoría está visible.
   El contenido de cada nota NO está en la documentación: queda marcado «Pendiente · Por definir por el BID» hasta que se cargue la información real
   cada categoría (se completa con los datos reales). No se escriben contenidos supuestos. */
export const OTROS: Record<string, (u?: any) => string> = {
  "Otras entidades": () => "Por definir por el BID.",
  "Otras actividades": () => "Por definir por el BID.",
};

export const star = (n: any) => (OTROS[n] ? n + "*" : n);

export const otrosNote = (cats: any, u?: any) => {
  const k = cats.find((c) => OTROS[c]);
  return k ? (
    <p className="fnote">
      <span aria-hidden="true">*</span> <b>{k}:</b>{" "}
      <span className="tbd">Pendiente</span> {OTROS[k](u)}
    </p>
  ) : null;
};

/* Eje de valores sin marcas (barras horizontales con el valor al final de cada barra): solo lleva el nombre.
   Es una función y no un componente: Recharts solo reconoce <XAxis> como hijo directo de la gráfica. */
export const valAxis = (text: any) => (
  <XAxis
    type="number"
    tick={false}
    tickLine={false}
    axisLine={false}
    height={AX_XH0}
    label={axT(text, "x")}
  />
);

export function EndDot(props: any) {
  const { cx, cy, index, stroke, dataLen, T } = props;
  if (index !== dataLen - 1) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r="4.5"
      fill={stroke}
      stroke={T.surface}
      strokeWidth="2"
    />
  );
}

/* Lectura por año: en gráficas con panel lateral, el cursor no abre tooltip flotante; solo marca el año con la línea vertical
   y el panel de la derecha pasa de «Valor actual» a ese año. Al salir, el panel vuelve al valor actual. */
export const yearHover = (setY: any) =>
  setY
    ? {
        onMouseMove: (st) =>
          setY(
            st && st.isTooltipActive && st.activeLabel != null
              ? st.activeLabel
              : null,
          ),
        onMouseLeave: () => setY(null),
      }
    : {};
export const sideTip = (T: any) => ({
  content: () => null,
  cursor: { stroke: T.axis, strokeWidth: 1 },
});

export function MultiLine({
  T,
  data,
  series,
  colors,
  highlight,
  setHighlight,
  yT,
  hl,
  refKey,
  setYear,
  onPin,
  zoom,
}: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: AX_TOP, right: 18, left: 0, bottom: zoom ? 10 : 0 }}
        {...yearHover(setYear)}
        onMouseLeave={() => {
          setHighlight && setHighlight(null);
          setYear && setYear(null);
        }}
      >
        <CartesianGrid vertical={false} stroke={T.grid} />
        <XAxis {...yearAxis(T)} />
        {zoomBrush(zoom)}
        <YAxis
          {...axisProps(T)}
          width={48}
          tickFormatter={(v) => fmtInt(v)}
          label={yT ? axT(yT, "y") : undefined}
        />
        {setYear ? (
          <Tooltip {...sideTip(T)} />
        ) : (
          <Tooltip
            content={<Tip T={T} title={(l) => "Año " + l} />}
            cursor={{ stroke: T.axis, strokeWidth: 1, strokeDasharray: "0" }}
          />
        )}
        {series
          .map((s, i) => [s, i])
          .sort((a, b) => Number(a[0] === hl) - Number(b[0] === hl))
          .map(([s, i]) => {
            const dim = hl != null && hl !== s;
            const col = colors[i];
            return (
              <Line
                key={s}
                type="monotone"
                dataKey={s}
                name={s}
                stroke={dim ? T.muted : col}
                strokeWidth={hl === s ? 2.75 : 2}
                dot={(p) => (
                  <EndDot
                    {...p}
                    key={s + p.index}
                    dataLen={data.length}
                    T={T}
                    stroke={dim ? T.muted : col}
                  />
                )}
                activeDot={{ r: 5, stroke: T.surface, strokeWidth: 2 }}
                isAnimationActive={false}
                strokeOpacity={dim ? 0.9 : 1}
              />
            );
          })}
        {refKey ? (
          <Line
            key={refKey}
            type="monotone"
            dataKey={refKey}
            name={refKey}
            stroke={hl != null && hl !== refKey ? T.muted : ALC_COLOR}
            strokeWidth={hl === refKey ? 2.25 : 1.75}
            strokeDasharray={ALC_DASH}
            dot={false}
            activeDot={{ r: 4, stroke: T.surface, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        ) : null}
        {onPin
          ? [...series, ...(refKey ? [refKey] : [])].map((s) => (
              <Line
                key={"hit-" + s}
                type="monotone"
                dataKey={s}
                stroke="transparent"
                strokeWidth={14}
                dot={false}
                activeDot={false}
                legendType="none"
                tooltipType="none"
                isAnimationActive={false}
                style={{ cursor: "pointer" }}
                onClick={() => onPin(s)}
              />
            ))
          : null}
      </LineChart>
    </ResponsiveContainer>
  );
}

export const YearBack = ({ onBack, ultimo }: any) =>
  onBack ? (
    <button type="button" className="yback" onClick={onBack}>
      Volver a {ultimo}
    </button>
  ) : null;

export function NowBox({
  title,
  rows,
  hl,
  setHl,
  hint,
  onPick,
  year,
  onBack,
  onClear,
  ultimo,
}: any) {
  const pinned = onClear && hl != null;
  return (
    <div
      className={
        "now" + (year != null ? " is-year" : "") + (pinned ? " is-pinned" : "")
      }
      role="list"
      aria-label={title}
      aria-live="polite"
    >
      <h4>
        {year != null ? <b>Año {year}</b> : <span>{title}</span>}
        {year != null ? <YearBack onBack={onBack} ultimo={ultimo} /> : null}
        {pinned ? (
          <button type="button" className="yback yclear" onClick={onClear}>
            Quitar resaltado
          </button>
        ) : null}
      </h4>
      {rows.map((r) => (
        <div
          role="listitem"
          className={
            "row" + (hl === r.name ? " on" : "") + (r.ref ? " ref-row" : "")
          }
          key={r.name}
          onMouseEnter={() => setHl && setHl(r.name)}
          onMouseLeave={() => setHl && setHl(null)}
          onClick={() => onPick && onPick(r.name)}
          tabIndex={onPick ? 0 : undefined}
          aria-pressed={onPick ? hl === r.name : undefined}
          onKeyDown={(e) => {
            if (onPick && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onPick(r.name);
            }
          }}
          style={onPick ? { cursor: "pointer" } : undefined}
        >
          {r.ref ? (
            <span className="dash ref" style={{ color: r.color }}></span>
          ) : (
            <span className="dot" style={{ background: r.color }}></span>
          )}
          <span className="nm" title={r.label || r.name}>
            {r.label || r.name}
          </span>
          <span className="n">{r.fmt ? r.fmt(r.value) : fmtInt(r.value)}</span>
        </div>
      ))}
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}
