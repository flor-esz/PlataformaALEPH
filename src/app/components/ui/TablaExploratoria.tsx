import type React from "react";

const TXT_MUTED: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: "#6B7A8D",
};

// ─── Public types ─────────────────────────────────────────────────────────────
export type Vigencia = "Vigente" | "Por confirmar";
export type EstadoInstrumento = "Analizado" | "Procesado";

export type TablaExploratoriaFila = {
  nombre: string;
  tipo: string;
  entidad: string;
  sector: string;
  año: number;
  jerarquia: string;
  vigencia: Vigencia;
  estado: EstadoInstrumento;
};

export type TablaExploratoriaProps = {
  filas: TablaExploratoriaFila[];
  onVerTablaCompleta?: () => void;
};

// Exportados para que HallazgosFiltrados.tsx (misma tabla, distinta pantalla)
// reuse exactamente los mismos badges en vez de redefinir los colores.
export const VIGENCIA_META: Record<Vigencia, { bg: string; color: string }> = {
  "Vigente":       { bg: "#E7F1DC", color: "#3B6D11" },
  "Por confirmar": { bg: "#F6EBD6", color: "#8A5A12" },
};

export const ESTADO_META: Record<EstadoInstrumento, { bg: string; color: string }> = {
  Analizado: { bg: "#E6F4EA", color: "#2D7A3A" },
  Procesado: { bg: "#E8F0FA", color: "#26456B" },
};

export function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: bg, color, fontFamily: "IBM Plex Sans, sans-serif" }}
    >
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function TablaExploratoria({ filas, onVerTablaCompleta }: TablaExploratoriaProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 600, color: "#14161A" }}>
          Tabla exploratoria
        </h2>
        <button
          onClick={onVerTablaCompleta}
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
          Ver tabla completa
        </button>
      </div>

      <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: "#FAFBFC", border: "1px solid #DCE3EB" }}>
        <table className="w-full min-w-[780px]">
          <thead>
            <tr style={{ borderBottom: "1px solid #DCE3EB" }}>
              {["Nombre", "Tipo", "Entidad", "Sector", "Año", "Jerarquía", "Vigencia", "Estado"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#6B7A8D" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #DCE3EB" }}>
                <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: "#14161A" }}>{f.nombre}</td>
                <td className="px-5 py-3 text-[13px]" style={TXT_MUTED}>{f.tipo}</td>
                <td className="px-5 py-3 text-[13px]" style={TXT_MUTED}>{f.entidad}</td>
                <td className="px-5 py-3 text-[13px]" style={TXT_MUTED}>{f.sector}</td>
                <td className="px-5 py-3 text-[13px]" style={TXT_MUTED}>{f.año}</td>
                <td className="px-5 py-3 text-[13px]" style={TXT_MUTED}>{f.jerarquia}</td>
                <td className="px-5 py-3"><Badge label={f.vigencia} {...VIGENCIA_META[f.vigencia]} /></td>
                <td className="px-5 py-3"><Badge label={f.estado} {...ESTADO_META[f.estado]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
