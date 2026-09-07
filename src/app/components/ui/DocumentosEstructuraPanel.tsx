import type React from "react";

const TXT_MUTED: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: "#6B7A8D",
};

// ─── Public types ─────────────────────────────────────────────────────────────
export type DocumentosEstructuraFila = {
  nombre: string;
  pctNoEstructurado: number;
};

export type DocumentosEstructuraPanelProps = {
  filas: DocumentosEstructuraFila[];
  onVerTabla?: () => void;
  className?: string;
};

// ─── Single row ───────────────────────────────────────────────────────────────
function EstructuraRow({ nombre, pctNoEstructurado }: DocumentosEstructuraFila) {
  const pctEstructurado = 100 - pctNoEstructurado;
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex-shrink-0 leading-tight overflow-hidden"
        style={{ ...TXT_MUTED, fontSize: 11, width: 150, whiteSpace: "nowrap", textOverflow: "ellipsis" }}
        title={nombre}
      >
        {nombre}
      </span>
      <div className="flex-1 rounded overflow-hidden flex" style={{ height: 13 }}>
        <div style={{ width: `${pctEstructurado}%`, backgroundColor: "#3E6E9E" }} />
        <div style={{ width: `${pctNoEstructurado}%`, backgroundColor: "#DCE3EB" }} />
      </div>
      <span
        className="flex-shrink-0 text-right"
        style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, color: "#6B7A8D", width: 34 }}
      >
        {pctNoEstructurado}%
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DocumentosEstructuraPanel({ filas, onVerTabla, className }: DocumentosEstructuraPanelProps) {
  return (
    <div className={["rounded-lg", className ?? ""].join(" ").trim()} style={{ backgroundColor: "#FAFBFC", padding: 20 }}>
      <div className="flex items-center justify-between mb-4">
        <p
          className="uppercase tracking-widest"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, color: "#6B7A8D" }}
        >
          Estructura de documentos por nivel
        </p>
        <button
          onClick={onVerTabla}
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

      <div className="flex flex-col gap-3 mb-4">
        {filas.map(f => <EstructuraRow key={f.nombre} {...f} />)}
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, backgroundColor: "#3E6E9E", display: "inline-block" }} />
          <span style={{ ...TXT_MUTED, fontSize: 12 }}>Estructurado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, backgroundColor: "#DCE3EB", display: "inline-block" }} />
          <span style={{ ...TXT_MUTED, fontSize: 12 }}>No estructurado</span>
        </div>
      </div>
    </div>
  );
}
