import type React from "react";

const TXT_MUTED: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: "#6B7A8D",
};

// ─── Public types ─────────────────────────────────────────────────────────────
export type EstadoProcesamientoEtapa = {
  nombre: string;
  pct: number;
  color: string;
};

export type EstadoProcesamientoPanelProps = {
  etapas: EstadoProcesamientoEtapa[];
  onVerDetalle?: () => void;
};

// ─── Main component ───────────────────────────────────────────────────────────
export function EstadoProcesamientoPanel({ etapas, onVerDetalle }: EstadoProcesamientoPanelProps) {
  return (
    <div className="rounded-lg" style={{ backgroundColor: "#FAFBFC", padding: 20 }}>
      <div className="flex items-center justify-between mb-4">
        <p
          className="uppercase tracking-widest"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, color: "#6B7A8D" }}
        >
          Estado de procesamiento
        </p>
        <button
          onClick={onVerDetalle}
          style={{
            backgroundColor: "#14161A",
            color: "white",
            border: "none",
            borderRadius: 999,
            padding: "6px 12px",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Ver detalle →
        </button>
      </div>

      {/* Barra apilada */}
      <div className="flex rounded-md overflow-hidden" style={{ height: 10 }}>
        {etapas.map(e => (
          <div key={e.nombre} style={{ width: `${e.pct}%`, backgroundColor: e.color }} />
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
        {etapas.map(e => (
          <div key={e.nombre} className="flex items-center gap-1.5">
            <span
              className="rounded-full flex-shrink-0"
              style={{ width: 8, height: 8, backgroundColor: e.color, display: "inline-block" }}
            />
            <span style={{ ...TXT_MUTED, fontSize: 12 }}>{e.nombre} {e.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
