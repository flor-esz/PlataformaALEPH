import type React from "react";

const TXT_MUTED: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: "#6B7A8D",
};

// ─── Public types ─────────────────────────────────────────────────────────────
export type BarrerasPorPaisEntrada = {
  nombre: string;
  total: number;
  validadoPct: number;
};

export type BarrerasPorPaisCardProps = {
  pais: string;
  total: number;
  entrada: BarrerasPorPaisEntrada[];
  coberturaPct: number;
  validadoHitlPct: number;
  onVerBarreras: () => void;
};

// ─── Single subdimensión row ────────────────────────────────────────────────
function EntradaRow({ nombre, total, validadoPct }: BarrerasPorPaisEntrada) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex-shrink-0 leading-tight overflow-hidden"
        style={{ ...TXT_MUTED, fontSize: 11, width: 88, whiteSpace: "nowrap", textOverflow: "ellipsis" }}
        title={nombre}
      >
        {nombre}
      </span>
      <div className="flex-1 rounded-full overflow-hidden flex" style={{ height: 10 }}>
        <div style={{ width: `${validadoPct}%`, backgroundColor: "#C75450" }} />
        <div style={{ width: `${100 - validadoPct}%`, backgroundColor: "#26456B" }} />
      </div>
      <div className="flex-shrink-0 text-right" style={{ width: 60 }}>
        <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, color: "#14161A", lineHeight: 1.2 }}>{total}</p>
        <p style={{ ...TXT_MUTED, fontSize: 10, lineHeight: 1.2 }}>{validadoPct}% Validado</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function BarrerasPorPaisCard({ pais, total, entrada, coberturaPct, validadoHitlPct, onVerBarreras }: BarrerasPorPaisCardProps) {
  return (
    <div className="rounded-lg flex flex-col" style={{ backgroundColor: "#FAFBFC", padding: 18 }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 15, color: "#14161A" }}>{pais}</p>
          <p style={{ ...TXT_MUTED, fontSize: 11 }}>{total.toLocaleString("es")} total</p>
        </div>
        {/* TODO: cablear Operación cuando haya diseño para ese estado */}
        <select
          defaultValue="Entrada"
          style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#6B7A8D", backgroundColor: "transparent", border: "1px solid #DCE3EB", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
        >
          <option value="Entrada">Entrada</option>
        </select>
      </div>

      <div className="flex flex-col gap-2.5 mb-4">
        {entrada.map(e => <EntradaRow key={e.nombre} {...e} />)}
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="uppercase" style={{ ...TXT_MUTED, fontSize: 10.5 }}>Cobertura {coberturaPct}%</span>
        <span className="uppercase" style={{ ...TXT_MUTED, fontSize: 10.5 }}>{validadoHitlPct}% Validado HITL</span>
      </div>

      <button
        className="w-full"
        onClick={onVerBarreras}
        style={{ backgroundColor: "#26456B", color: "white", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 600, borderRadius: 8, padding: 8, border: "none", cursor: "pointer" }}
      >
        Ver barreras por país →
      </button>
    </div>
  );
}
