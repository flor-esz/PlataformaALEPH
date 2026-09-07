import type React from "react";

const TXT_MUTED: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: "#6B7A8D",
};

// ─── Public types ─────────────────────────────────────────────────────────────
export type EstadoScraping = "Completo" | "Parcial" | "Pendiente";

export type FuenteTrazabilidadFila = {
  fuente: string;
  estado: EstadoScraping;
  ultimaCaptura: string;
  errores: number | null;
  capturados: number;
  totalEsperado: number;
};

export type FuentesTrazabilidadTableProps = {
  filas: FuenteTrazabilidadFila[];
  onVerDetalle?: () => void;
};

const ESTADO_META: Record<EstadoScraping, { bg: string; color: string }> = {
  Completo:  { bg: "#E7F1DC", color: "#3B6D11" },
  Parcial:   { bg: "#F6EBD6", color: "#8A5A12" },
  Pendiente: { bg: "#DCE3EB", color: "#6B7A8D" },
};

function EstadoBadge({ estado }: { estado: EstadoScraping }) {
  const meta = ESTADO_META[estado];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: meta.bg, color: meta.color, fontFamily: "IBM Plex Sans, sans-serif" }}
    >
      {estado}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function FuentesTrazabilidadTable({ filas, onVerDetalle }: FuentesTrazabilidadTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 600, color: "#14161A" }}>
          Fuentes y trazabilidad
        </h2>
        <button
          onClick={onVerDetalle}
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
          Ver detalle
        </button>
      </div>

      <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: "#FAFBFC", border: "1px solid #DCE3EB" }}>
        <table className="w-full min-w-[640px]">
          <thead>
            <tr style={{ borderBottom: "1px solid #DCE3EB" }}>
              {["Fuente oficial", "Estado de scraping", "Última captura", "Errores", "Cobertura"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#6B7A8D" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => {
              const pct = f.totalEsperado > 0 ? Math.round((f.capturados / f.totalEsperado) * 100) : 0;
              return (
                <tr key={i} style={{ borderBottom: "1px solid #DCE3EB" }}>
                  <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: "#14161A" }}>{f.fuente}</td>
                  <td className="px-5 py-3"><EstadoBadge estado={f.estado} /></td>
                  <td className="px-5 py-3 text-[13px]" style={TXT_MUTED}>{f.ultimaCaptura}</td>
                  <td className="px-5 py-3 text-[13px]" style={TXT_MUTED}>{f.errores === null ? "—" : f.errores}</td>
                  <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: "#14161A" }}>
                    {f.capturados} de {f.totalEsperado} · {pct}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
