import { useState } from "react";
import { X, Download, ChevronDown } from "lucide-react";
import { C, HDR_BTN_PRIMARY, HDR_BTN_SECONDARY } from "../../theme";
// Header vive en App.tsx, y App.tsx importa este archivo de forma estática
// para el case "hallazgos-filtrados" de renderView() -- mismo criterio ya
// documentado junto a los imports de PanelRegional.tsx/ImpactoEconomico.tsx/
// IndiceIDR.tsx en App.tsx: Header solo se usa dentro del cuerpo de
// HallazgosFiltrados(), nunca en el top-level de este módulo, así que el
// import estático es seguro (ver comentario en theme.ts sobre el porqué).
import { Header } from "../../App";
import type { View } from "../../App";
import type { Instrumento } from "../../data/instrumentosMuestra";
import { Badge, VIGENCIA_META, ESTADO_META } from "./TablaExploratoria";

const PAGE_SIZE = 25;

// ─── Public types ─────────────────────────────────────────────────────────────
export type HallazgosFiltradosProps = {
  filtros: { label: string; key: string; value: string }[];
  resultados: Instrumento[];
  onQuitarFiltro: (key: string) => void;
  onLimpiarTodos: () => void;
  onNavigate: (v: View) => void;
};

// ─── Chip de filtro activo ──────────────────────────────────────────────────────
function FiltroChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: C.steel2 + "26", color: C.steel3 }}>
      <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500 }}>{label}</span>
      <button
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0, color: "inherit" }}
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ─── Hallazgos filtrados ─────────────────────────────────────────────────────
// Primer caso de esta pantalla: solo la fila de "Instrumentos por jerarquía
// normativa" en Panel Regional navega acá hoy (ver PanelRegional.tsx). Barreras,
// Trámites y el resto de gráficas de Panorama Regulatorio todavía no -- queda
// pendiente extender el patrón pantalla por pantalla.
export function HallazgosFiltrados({ filtros, resultados, onQuitarFiltro, onLimpiarTodos, onNavigate }: HallazgosFiltradosProps) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(resultados.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = resultados.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      {/* Sin breadcrumb arriba, a propósito (ver comentario junto a Header en
          App.tsx) -- todas las demás pantallas sí lo muestran. */}
      <Header
        title="Hallazgos filtrados"
        actions={
          <>
            <button style={HDR_BTN_PRIMARY} onClick={() => onNavigate({ screen: "reportes" })}>
              <Download size={13} /><span className="hidden sm:inline">Generar reporte</span><span className="sm:hidden">Reporte</span>
            </button>
            {/* TODO: dropdown de opciones de descarga */}
            <button style={HDR_BTN_SECONDARY}>
              Descargar <ChevronDown size={13} />
            </button>
          </>
        }
      />
      <p className="uppercase mb-5" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, color: C.textMuted }}>
        {resultados.length} resultados
      </p>

      {/* Chips de filtros activos */}
      {filtros.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {filtros.map(f => (
            <FiltroChip key={f.key} label={`${f.label}: ${f.value}`} onRemove={() => onQuitarFiltro(f.key)} />
          ))}
          <button
            onClick={onLimpiarTodos}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ backgroundColor: C.border, color: C.textMuted, border: "none", cursor: "pointer", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500 }}
          >
            Limpiar todos <X size={12} />
          </button>
        </div>
      )}

      {/* Tabla — mismas columnas y badges que TablaExploratoria (reusados, no
          redefinidos: Badge/VIGENCIA_META/ESTADO_META vienen de ese archivo). */}
      <div className="rounded-lg" style={{ backgroundColor: C.card }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Nombre", "Tipo", "Entidad", "Sector", "Año", "Jerarquía", "Vigencia", "Estado"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-widest whitespace-nowrap"
                    style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((it, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td className="px-4 py-3 text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{it.nombre}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{it.tipo}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{it.entidad}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{it.sector}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{it.año}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{it.jerarquia}</td>
                  <td className="px-4 py-3"><Badge label={it.vigencia} {...VIGENCIA_META[it.vigencia]} /></td>
                  <td className="px-4 py-3"><Badge label={it.estado} {...ESTADO_META[it.estado]} /></td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
                    Sin resultados para estos filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: C.border }}>
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
              {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, resultados.length)} de {resultados.length}
            </span>
            <div className="flex gap-2">
              {[...Array(pageCount)].map((_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: "none",
                    backgroundColor: i === safePage ? C.steel4 : C.border,
                    color: i === safePage ? "white" : C.textMuted,
                    fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HallazgosFiltrados;
