import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { fmtInt } from "./format";

/* ================= Piezas de gráfica ================= */
export function Tip({ active, payload, label, unit, title }: any) {
  if (!active || !payload || !payload.length) return null;
  const rows = [...payload].filter((p) => p.value != null).sort((a, b) => b.value - a.value);
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
  tick: { fill: T.axis, fontSize: 11.5, fontFamily: "Inter, system-ui, sans-serif" },
  tickLine: false,
  axisLine: false,
});

export function EndDot(props: any) {
  const { cx, cy, index, stroke, dataLen, T } = props;
  if (index !== dataLen - 1) return null;
  return <circle cx={cx} cy={cy} r="4.5" fill={stroke} stroke={T.surface} strokeWidth="2" />;
}

export function MultiLine({ T, data, series, colors, setHighlight, yLabel, hl }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        onMouseLeave={() => setHighlight && setHighlight(null)}
      >
        <CartesianGrid vertical={false} stroke={T.grid} />
        <XAxis dataKey="year" {...axisProps(T)} interval="preserveStartEnd" minTickGap={14} />
        <YAxis
          {...axisProps(T)}
          width={48}
          tickFormatter={(v) => fmtInt(v)}
          label={
            yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fill: T.axis, fontSize: 11, dx: 4, dy: 40 } : undefined
          }
        />
        <Tooltip
          content={<Tip title={(l: any) => "Año " + l} />}
          cursor={{ stroke: T.axis, strokeWidth: 1, strokeDasharray: "0" }}
        />
        {series.map((s, i) => {
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
              dot={(p) => <EndDot {...p} key={s + p.index} dataLen={data.length} T={T} stroke={dim ? T.muted : col} />}
              activeDot={{ r: 5, stroke: T.surface, strokeWidth: 2 }}
              isAnimationActive={false}
              strokeOpacity={dim ? 0.9 : 1}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function NowBox({ title, rows, hl, setHl, hint, onPick }: any) {
  return (
    <div className="now" role="list" aria-label={title}>
      <h4>{title}</h4>
      {rows.map((r) => (
        <div
          role="listitem"
          className={"row" + (hl === r.name ? " on" : "")}
          key={r.name}
          onMouseEnter={() => setHl && setHl(r.name)}
          onMouseLeave={() => setHl && setHl(null)}
          onClick={() => onPick && onPick(r.name)}
          style={onPick ? { cursor: "pointer" } : undefined}
        >
          <span className="dot" style={{ background: r.color }}></span>
          <span className="nm" title={r.name}>
            {r.name}
          </span>
          <span className="n">{r.fmt ? r.fmt(r.value) : fmtInt(r.value)}</span>
        </div>
      ))}
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}
