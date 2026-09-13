import { useState } from "react";
import { X, Download, ChevronDown, Info } from "lucide-react";
import { C, HDR_BTN_PRIMARY, HDR_BTN_SECONDARY } from "../../theme";
// Header y BarraFiltrosBarreras viven en App.tsx, y App.tsx importa (directa
// o indirectamente, vía las 3 pantallas que usan este shell) este archivo de
// forma estática -- mismo criterio ya documentado junto a los imports de
// PanelRegional.tsx/ImpactoEconomico.tsx/IndiceIDR.tsx en App.tsx: ambos
// solo se usan dentro del cuerpo de HallazgosFiltradosShell(), nunca en el
// top-level de este módulo, así que el import estático es seguro (ver
// comentario en theme.ts sobre el porqué).
import { Header, BarraFiltrosBarreras } from "../../App";
import type { View, Country } from "../../App";

// ─── Shell compartido de "Hallazgos filtrados" ─────────────────────────────
// Extraído de lo que antes era HallazgosFiltrados.tsx (la variante de
// Instrumentos, que sigue viviendo en ese archivo) para que Barreras y
// Trámites lo reusen con su propio dataset/columnas/lógica de filtrado, sin
// duplicar Header + barra de filtros + chips + columnas dinámicas +
// paginación en cada uno. Cada pantalla nueva sigue teniendo su propio
// objeto `filtros` independiente (ver App.tsx) -- este shell no comparte
// estado entre pantallas, solo el maquetado/mecánica.
export type Columna<T> = { key: string; header: string; cell: (it: T) => React.ReactNode };

// Campos de BarraFiltrosBarreras que una pantalla puede declarar "reales"
// (tocan `filtros`/la tabla) -- los que no se listan en `camposReales` quedan
// visual-only (estado local del shell, no afectan nada), mismo criterio ya
// usado en la variante de Instrumentos para País/Clasificación/Subdimensión/
// Severidad.
export type CampoBarraFiltros = "pais" | "sector" | "entidad" | "clasificacion" | "subdimension" | "jerarquia" | "severidad";

export type HallazgosFiltradosShellProps<T> = {
  filtros: { label: string; key: string; value: string }[];
  resultados: T[];
  columnasBase: Columna<T>[];
  // Igual que en la variante de Instrumentos: algunas keys de filtro no se
  // llaman igual que el campo base que en realidad acotan (ej. "anioDesde"/
  // "anioHasta" son un rango sobre `año`) -- este mapeo evita duplicar
  // columna en esos casos, de forma genérica.
  campoBasePorFiltro?: Record<string, string>;
  onSetFiltro: (key: string, value: string) => void;
  onQuitarFiltro: (key: string) => void;
  onLimpiarTodos: () => void;
  onNavigate: (v: View) => void;
  // Si se pasa, cada fila de la tabla navega a su detalle (Barreras/Trámites).
  // La variante de Instrumentos no lo usa (no tiene pantalla de detalle).
  onRowClick?: (it: T) => void;
  camposReales: CampoBarraFiltros[];
  sectors: string[];
  entidades: string[];
  jerarquiaOptions?: string[];
  // Selects "Año desde"/"Año hasta" -- solo la variante de Instrumentos los
  // usa (Barreras/Trámites no filtran por año todavía).
  mostrarPeriodo?: boolean;
  pageSize?: number;
  // Si se pasa, se muestra una caja informativa arriba de la tabla (debajo de
  // los chips de filtro) explicando cómo se calculó el KPI desde el que se
  // navegó acá -- ver KpiCard.onClick en Barreras/Trámites/Impacto Económico.
  notaCalculo?: string;
};

function textoCelda(valor: string | number) {
  return <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{valor}</span>;
}

const AÑOS_PERIODO = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 1990 + i);
const selStylePeriodo: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: C.text,
  backgroundColor: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "7px 10px",
  fontSize: 12,
  outline: "none",
  cursor: "pointer",
  minHeight: 36,
};

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

export function HallazgosFiltradosShell<T>({
  filtros,
  resultados,
  columnasBase,
  campoBasePorFiltro = {},
  onSetFiltro,
  onQuitarFiltro,
  onLimpiarTodos,
  onNavigate,
  onRowClick,
  camposReales,
  sectors,
  entidades,
  jerarquiaOptions,
  mostrarPeriodo,
  pageSize = 25,
  notaCalculo,
}: HallazgosFiltradosShellProps<T>) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(resultados.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = resultados.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const esReal = (campo: CampoBarraFiltros) => camposReales.includes(campo);
  const valorFiltro = (key: string) => filtros.find(f => f.key === key)?.value ?? "";

  // Estado local para los campos de la barra que esta pantalla declaró
  // visual-only (no en `camposReales`) -- no tocan `filtros`/la tabla.
  const [paisVisual, setPaisVisual] = useState<Country>("Todos");
  const [sectorVisual, setSectorVisual] = useState("");
  const [entidadVisual, setEntidadVisual] = useState("");
  const [clasificacionVisual, setClasificacionVisual] = useState("");
  const [subdimensionVisual, setSubdimensionVisual] = useState("");
  const [jerarquiaVisual, setJerarquiaVisual] = useState("");
  const [severidadVisual, setSeveridadVisual] = useState("");

  const anioDesdeActivo = valorFiltro("anioDesde");
  const anioHastaActivo = valorFiltro("anioHasta");

  const limpiarTodo = () => {
    setPaisVisual("Todos");
    setSectorVisual("");
    setEntidadVisual("");
    setClasificacionVisual("");
    setSubdimensionVisual("");
    setJerarquiaVisual("");
    setSeveridadVisual("");
    onLimpiarTodos();
  };

  const clavesColumnasBase = new Set(columnasBase.map(c => c.key));
  // Una columna extra por cada filtro activo cuyo campo no sea ya una de las
  // columnas base (ver campoBasePorFiltro arriba para los casos donde la key
  // de filtro no se llama igual que el campo que acota).
  const columnasExtra: Columna<T>[] = filtros
    .filter(f => !clavesColumnasBase.has(campoBasePorFiltro[f.key] ?? f.key))
    .map(f => ({
      key: f.key,
      header: f.label,
      cell: it => textoCelda(String((it as unknown as Record<string, unknown>)[f.key] ?? "—")),
    }));
  const columnas: Columna<T>[] = [...columnasBase, ...columnasExtra];

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

      {/* Barra de filtros — mismo componente que Barreras (BarraFiltrosBarreras),
          no un maquetado duplicado por pantalla. Los campos no listados en
          `camposReales` quedan visual-only (estado local, no filtran). */}
      <BarraFiltrosBarreras
        twoRows
        country={esReal("pais") ? ((valorFiltro("pais") || "Todos") as Country) : paisVisual}
        setCountry={esReal("pais") ? (v => onSetFiltro("pais", v === "Todos" ? "" : v)) : setPaisVisual}
        sector={esReal("sector") ? valorFiltro("sector") : sectorVisual}
        setSector={esReal("sector") ? (v => onSetFiltro("sector", v)) : setSectorVisual}
        entidad={esReal("entidad") ? valorFiltro("entidad") : entidadVisual}
        setEntidad={esReal("entidad") ? (v => onSetFiltro("entidad", v)) : setEntidadVisual}
        clasificacion={esReal("clasificacion") ? valorFiltro("clasificacion") : clasificacionVisual}
        setClasificacion={esReal("clasificacion") ? (v => { onSetFiltro("clasificacion", v); onSetFiltro("subdimension", ""); }) : setClasificacionVisual}
        subdimension={esReal("subdimension") ? valorFiltro("subdimension") : subdimensionVisual}
        setSubdimension={esReal("subdimension") ? (v => onSetFiltro("subdimension", v)) : setSubdimensionVisual}
        jerarquia={esReal("jerarquia") ? valorFiltro("jerarquia") : jerarquiaVisual}
        setJerarquia={esReal("jerarquia") ? (v => onSetFiltro("jerarquia", v)) : setJerarquiaVisual}
        severidad={esReal("severidad") ? valorFiltro("severidad") : severidadVisual}
        setSeveridad={esReal("severidad") ? (v => onSetFiltro("severidad", v)) : setSeveridadVisual}
        sectors={sectors}
        entidades={entidades}
        jerarquiaOptions={jerarquiaOptions}
      />

      {/* Período — rango sobre un campo de año (aproximado en Instrumentos).
          Si solo se define uno de los dos, el filtrado del case en App.tsx lo
          trata como rango abierto (>= o <= según cuál falte). */}
      {mostrarPeriodo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <select className="grow" style={selStylePeriodo} value={anioDesdeActivo} onChange={e => onSetFiltro("anioDesde", e.target.value)}>
            <option value="">Año desde</option>
            {AÑOS_PERIODO.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>
          <select className="grow" style={selStylePeriodo} value={anioHastaActivo} onChange={e => onSetFiltro("anioHasta", e.target.value)}>
            <option value="">Año hasta</option>
            {AÑOS_PERIODO.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>
        </div>
      )}

      {/* Chips de filtros activos */}
      {filtros.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {filtros.map(f => (
            <FiltroChip key={f.key} label={`${f.label}: ${f.value}`} onRemove={() => onQuitarFiltro(f.key)} />
          ))}
          <button
            onClick={limpiarTodo}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ backgroundColor: C.border, color: C.textMuted, border: "none", cursor: "pointer", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500 }}
          >
            Limpiar todos <X size={12} />
          </button>
        </div>
      )}

      {/* Nota de cálculo — solo cuando se navegó acá desde un KPI que explica
          su propio valor (ver notaCalculo en HallazgosFiltradosShellProps). */}
      {notaCalculo && (
        <div className="flex items-start gap-2 mb-5 px-4 py-3 rounded-lg" style={{ backgroundColor: C.canvas, border: `1px solid ${C.border}` }}>
          <Info size={15} color={C.textMuted} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{notaCalculo}</p>
        </div>
      )}

      {/* Tabla — columnas base + una por cada filtro activo que no sea ya una
          de ellas (ver `columnas` arriba). */}
      <div className="rounded-lg" style={{ backgroundColor: C.card }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {columnas.map(c => (
                  <th key={c.key} className="px-4 py-3 text-left text-[11px] uppercase tracking-widest whitespace-nowrap"
                    style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{c.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((it, i) => (
                <tr
                  key={i}
                  onClick={onRowClick ? () => onRowClick(it) : undefined}
                  className={onRowClick ? "hover:bg-[#F4F7FB] transition-colors" : undefined}
                  style={{ borderBottom: `1px solid ${C.border}`, cursor: onRowClick ? "pointer" : undefined }}
                >
                  {columnas.map(c => (
                    <td key={c.key} className="px-4 py-3">{c.cell(it)}</td>
                  ))}
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={columnas.length} className="px-4 py-8 text-center text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
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
              {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, resultados.length)} de {resultados.length}
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
