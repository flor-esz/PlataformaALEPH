import type React from "react";

const TXT_MUTED: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: "#6B7A8D",
};

// ─── Public types ─────────────────────────────────────────────────────────────
export type EvolucionSegmento = {
  nombre: string;
  valor: number;
  color: string;
};

export type EvolucionAnio = {
  anio: number;
  total: number;
  segmentos: EvolucionSegmento[];
};

export type EvolucionInstrumentosPanelProps = {
  anios: EvolucionAnio[];
  onVerTodo?: () => void;
  className?: string;
  // Título del header — por defecto "Evolución de instrumentos en el tiempo"
  // (usado en Panel País); otras pantallas pueden reusar el componente con
  // un título distinto para la misma métrica.
  label?: string;
  // Si se pasa, cada segmento de la barra apilada de cada año se vuelve
  // clicable, con el año de esa fila y el nombre del segmento (jerarquía).
  // Cuando se omite, se comporta exactamente igual que hoy (no clicable).
  onSegmentClick?: (anio: number, jerarquia: string) => void;
};

// ─── Build a stable legend: first-encounter order across all years ────────────
function buildLegend(anios: EvolucionAnio[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const a of anios) {
    for (const s of a.segmentos) {
      if (!map.has(s.nombre)) map.set(s.nombre, s.color);
    }
  }
  return map;
}

// ─── Single year row ──────────────────────────────────────────────────────────
function AnioRow({ anio, total, segmentos, onSegmentClick }: EvolucionAnio & { onSegmentClick?: (anio: number, jerarquia: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex-shrink-0"
        style={{ ...TXT_MUTED, fontFamily: "Space Grotesk, sans-serif", fontSize: 13, width: 40 }}
      >
        {anio}
      </span>
      <div className="flex-1 rounded overflow-hidden" style={{ height: 16, backgroundColor: "#DCE3EB" }}>
        <div className="h-full flex">
          {segmentos.filter(s => s.valor > 0).map(s => (
            <div
              key={s.nombre}
              onClick={onSegmentClick ? () => onSegmentClick(anio, s.nombre) : undefined}
              style={{ width: `${total > 0 ? (s.valor / total) * 100 : 0}%`, backgroundColor: s.color, cursor: onSegmentClick ? "pointer" : undefined }}
            />
          ))}
        </div>
      </div>
      <span
        className="flex-shrink-0 text-right"
        style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, color: "#14161A", width: 48 }}
      >
        {total.toLocaleString("es")}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function EvolucionInstrumentosPanel({ anios, onVerTodo, className, label, onSegmentClick }: EvolucionInstrumentosPanelProps) {
  const legend = buildLegend(anios);

  return (
    <div className={["rounded-lg", className ?? ""].join(" ").trim()} style={{ backgroundColor: "#FAFBFC", padding: 20 }}>
      <div className="flex items-center justify-between mb-4">
        <p
          className="uppercase tracking-widest"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, color: "#6B7A8D" }}
        >
          {label ?? "Evolución de instrumentos en el tiempo"}
        </p>
        <button
          onClick={onVerTodo}
          style={{
            backgroundColor: "#14161A",
            color: "white",
            border: "none",
            borderRadius: 999,
            padding: "6px 14px",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Ver todo
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {anios.map(a => <AnioRow key={a.anio} {...a} onSegmentClick={onSegmentClick} />)}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5">
        {[...legend.entries()].map(([nombre, color]) => (
          <div key={nombre} className="flex items-center gap-1.5">
            <span
              className="rounded-full flex-shrink-0"
              style={{ width: 8, height: 8, backgroundColor: color, display: "inline-block" }}
            />
            <span style={{ ...TXT_MUTED, fontSize: 12 }}>{nombre}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
