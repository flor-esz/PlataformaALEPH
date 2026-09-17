import { useState } from "react";
import type React from "react";
import { EjeCargaInfoIcon } from "./EjeCargaInfoIcon";

const TXT_MUTED: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: "#6B7A8D",
};

// ─── Public types ─────────────────────────────────────────────────────────────
export type BarrerasPorPaisEntrada = {
  nombre: string;
  total: number;
  // Opcional: si no viene, la fila muestra una barra sólida proporcional al
  // máximo de las filas (sin leyenda "% Validado") en vez de la barra roja/
  // azul de validado — usado por pantallas donde "% Validado" no aplica
  // (ej. Trámites).
  validadoPct?: number;
};

export type BarrerasPorPaisEje = { nombre: string; datos: BarrerasPorPaisEntrada[] };

export type BarrerasPorPaisCardProps = {
  pais: string;
  total: number;
  // Un eje por opción del <select> del header (Barreras: Entrada/Operación
  // -- 2 ejes; Trámites: Accesibilidad/Certidumbre/Cumplimiento/
  // Proporcionalidad -- 4 ejes). El <select> solo se muestra si hay más de
  // un eje; con 1 solo eje, la card queda igual que si nunca hubiera tenido
  // dropdown (mismo resultado visual que antes tenía showEntradaSelect={false}).
  ejes: BarrerasPorPaisEje[];
  coberturaPct: number;
  validadoHitlPct: number;
  onVerBarreras: () => void;
  // Texto del botón final — por defecto "Ver barreras por país →".
  buttonLabel?: string;
  // Si se pasa, cada subfila (Comercio/Competencia/Inversión, etc.) se
  // vuelve clicable, con el nombre del eje activo y el nombre de esa
  // subfila. Cuando se omite, se comporta exactamente igual que hoy (no
  // clicable).
  onEjeItemClick?: (eje: string, nombre: string) => void;
  // Opcional: texto de apoyo ("qué mide este eje") por nombre de eje,
  // mostrado con un ícono (i) junto al eje activo -- usado por Trámites
  // (EJE_CARGA_INFO en App.tsx). Si no se pasa (caso Barreras), no se
  // renderiza ícono.
  infoPorEje?: Record<string, { enfoque: string; pregunta: string }>;
};

// ─── Single subdimensión row ────────────────────────────────────────────────
function EntradaRow({ nombre, total, validadoPct, maxTotal, onClick }: BarrerasPorPaisEntrada & { maxTotal: number; onClick?: () => void }) {
  return (
    <div className="flex items-center gap-3" onClick={onClick} style={{ cursor: onClick ? "pointer" : undefined }}>
      <span
        className="flex-shrink-0 leading-tight overflow-hidden"
        style={{ ...TXT_MUTED, fontSize: 11, width: 88, whiteSpace: "nowrap", textOverflow: "ellipsis" }}
        title={nombre}
      >
        {nombre}
      </span>
      <div className="flex-1 rounded-full overflow-hidden flex" style={{ height: 10 }}>
        {validadoPct !== undefined ? (
          <>
            <div style={{ width: `${validadoPct}%`, backgroundColor: "#C75450" }} />
            <div style={{ width: `${100 - validadoPct}%`, backgroundColor: "#26456B" }} />
          </>
        ) : (
          <div style={{ width: `${maxTotal > 0 ? (total / maxTotal) * 100 : 0}%`, backgroundColor: "#26456B" }} />
        )}
      </div>
      <div className="flex-shrink-0 text-right" style={{ width: 60 }}>
        <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, color: "#14161A", lineHeight: 1.2 }}>{total}</p>
        {validadoPct !== undefined && <p style={{ ...TXT_MUTED, fontSize: 10, lineHeight: 1.2 }}>{validadoPct}% Validado</p>}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function BarrerasPorPaisCard({ pais, total, ejes, coberturaPct, validadoHitlPct, onVerBarreras, buttonLabel, onEjeItemClick, infoPorEje }: BarrerasPorPaisCardProps) {
  const [ejeIdx, setEjeIdx] = useState(0);
  const ejeActivo = ejes[ejeIdx];
  const filas = ejeActivo?.datos ?? [];
  const maxTotal = Math.max(...filas.map(e => e.total), 1);
  return (
    <div className="rounded-lg flex flex-col" style={{ backgroundColor: "#FAFBFC", padding: 18 }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 15, color: "#14161A" }}>{pais}</p>
          <p style={{ ...TXT_MUTED, fontSize: 11 }}>{total.toLocaleString("es")} total</p>
        </div>
        {ejes.length > 1 && (
          <div className="flex items-center gap-1.5">
            <EjeCargaInfoIcon info={infoPorEje?.[ejeActivo?.nombre ?? ""]} />
            <select
              value={ejeIdx}
              onChange={e => setEjeIdx(Number(e.target.value))}
              style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#6B7A8D", backgroundColor: "transparent", border: "1px solid #DCE3EB", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
            >
              {ejes.map((e, i) => <option key={e.nombre} value={i}>{e.nombre}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 mb-4">
        {filas.map(e => <EntradaRow key={e.nombre} {...e} maxTotal={maxTotal} onClick={onEjeItemClick && ejeActivo ? () => onEjeItemClick(ejeActivo.nombre, e.nombre) : undefined} />)}
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
        {buttonLabel ?? "Ver barreras por país →"}
      </button>
    </div>
  );
}
