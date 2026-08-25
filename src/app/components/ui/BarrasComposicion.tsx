import type React from "react";
import { Card } from "./card";

// Categorical ramp — same palette as the rest of the app's ranking/grouping visuals.
// These colors encode IDENTITY (which category), never severity.
const CAT_PALETTE = [
  "#26456B",
  "#3E6E9E",
  "#5E8FC2",
  "#7FA8D4",
  "#A0C1E0",
  "#BDD0DD",
  "#4A7A9B",
  "#6B9AB8",
];

const TXT_MUTED: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: "#6B7A8D",
};

// ─── Public types ─────────────────────────────────────────────────────────────
export type BarrasComposicionComponente = {
  nombre: string;
  valor: number;
};

export type BarrasComposicionCategoria = {
  nombre: string;
  total: number;
  componentes: BarrasComposicionComponente[];
};

export type BarrasComposicionProps = {
  label: string;
  total: number | string;
  categorias: BarrasComposicionCategoria[];
  className?: string;
};

// ─── Build a stable color map: first-encounter order across all bars ───────────
function buildColorMap(
  categorias: BarrasComposicionCategoria[]
): Map<string, string> {
  const map = new Map<string, string>();
  let idx = 0;
  for (const cat of categorias) {
    for (const comp of cat.componentes) {
      if (!map.has(comp.nombre)) {
        map.set(comp.nombre, CAT_PALETTE[idx % CAT_PALETTE.length]);
        idx++;
      }
    }
  }
  return map;
}

// ─── Single bar row ───────────────────────────────────────────────────────────
function ComposicionRow({
  nombre,
  total,
  componentes,
  maxTotal,
  colorMap,
}: {
  nombre: string;
  total: number;
  componentes: BarrasComposicionComponente[];
  maxTotal: number;
  colorMap: Map<string, string>;
}) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const active = componentes.filter((c) => c.valor > 0);

  return (
    <div className="flex items-center gap-3">
      <span
        className="flex-shrink-0 leading-tight overflow-hidden"
        style={{
          ...TXT_MUTED,
          fontSize: 11,
          width: 156,
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
        title={nombre}
      >
        {nombre}
      </span>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 12, backgroundColor: "#E6ECF3" }}
      >
        <div
          className="h-full flex rounded-full overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          {active.map((c) => (
            <div
              key={c.nombre}
              style={{
                flex: c.valor,
                backgroundColor: colorMap.get(c.nombre) ?? "#ccc",
                minWidth: 2,
              }}
            />
          ))}
        </div>
      </div>
      <span
        className="flex-shrink-0 text-right"
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 12,
          fontWeight: 600,
          color: "#6B7A8D",
          width: 28,
        }}
      >
        {total}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function BarrasComposicion({
  label,
  total,
  categorias,
  className,
}: BarrasComposicionProps) {
  const colorMap = buildColorMap(categorias);
  const maxTotal =
    categorias.length > 0 ? Math.max(...categorias.map((c) => c.total)) : 0;
  const legendEntries = [...colorMap.entries()];

  const displayTotal =
    typeof total === "number" ? total.toLocaleString("es") : total;

  return (
    <Card
      className={["gap-0 overflow-hidden", className ?? ""].join(" ").trim()}
    >
      {/* ── Header: label only (no selector) ── */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid #DCE3EB" }}
      >
        <p
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            color: "#6B7A8D",
            textTransform: "uppercase",
            letterSpacing: "0.09em",
            lineHeight: 1,
          }}
        >
          {label}
        </p>
      </div>

      {/* ── Total figure ── */}
      <div className="px-5 pt-5 pb-1 flex items-baseline gap-2">
        <span
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 36,
            fontWeight: 600,
            color: "#14161A",
            lineHeight: 1,
          }}
        >
          {displayTotal}
        </span>
        <span
          style={{
            ...TXT_MUTED,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          total
        </span>
      </div>

      {/* ── Bars — order preserved as received ── */}
      <div className="px-5 pt-4 pb-5 flex flex-col gap-3">
        {categorias.map((cat) => (
          <ComposicionRow
            key={cat.nombre}
            nombre={cat.nombre}
            total={cat.total}
            componentes={cat.componentes}
            maxTotal={maxTotal}
            colorMap={colorMap}
          />
        ))}
      </div>

      {/* ── Footer categorical legend ── */}
      <div
        className="px-5 py-3 flex items-center gap-5 flex-wrap"
        style={{ borderTop: "1px solid #DCE3EB" }}
      >
        {legendEntries.map(([nombre, color]) => (
          <div key={nombre} className="flex items-center gap-1.5">
            <span
              className="rounded-full flex-shrink-0"
              style={{
                width: 8,
                height: 8,
                backgroundColor: color,
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 11,
                color: "#6B7A8D",
              }}
            >
              {nombre}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
