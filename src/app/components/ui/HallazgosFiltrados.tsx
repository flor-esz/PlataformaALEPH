import type { View } from "../../App";
import type { Instrumento } from "../../data/instrumentosMuestra";
import { JERARQUIA_N2N6_TOTALES, SECTOR_POOL, ENTIDAD_POOL } from "../../data/instrumentosMuestra";
import { Badge, VIGENCIA_META, ESTADO_META } from "./TablaExploratoria";
import { HallazgosFiltradosShell, type Columna } from "./HallazgosFiltradosShell";

// ─── Columnas base de Instrumentos ──────────────────────────────────────────
function textoCelda(valor: string | number) {
  return <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: "#6B7A8D" }}>{valor}</span>;
}

const COLUMNAS_BASE: Columna<Instrumento>[] = [
  { key: "nombre", header: "Nombre", cell: it => <span className="text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#14161A" }}>{it.nombre}</span> },
  { key: "tipo", header: "Tipo", cell: it => textoCelda(it.tipo) },
  { key: "entidad", header: "Entidad", cell: it => textoCelda(it.entidad) },
  { key: "sector", header: "Sector", cell: it => textoCelda(it.sector) },
  { key: "año", header: "Año", cell: it => textoCelda(it.año) },
  { key: "jerarquia", header: "Jerarquía", cell: it => textoCelda(it.jerarquia) },
  { key: "vigencia", header: "Vigencia", cell: it => <Badge label={it.vigencia} {...VIGENCIA_META[it.vigencia]} /> },
  { key: "estado", header: "Estado", cell: it => <Badge label={it.estado} {...ESTADO_META[it.estado]} /> },
];

// Algunas keys de filtro no se llaman igual que el campo de Instrumento que
// en realidad acotan (ej. "anioDesde"/"anioHasta" son un rango sobre `año`,
// que ya es columna base) -- este mapeo es lo que hace que el "no duplicar
// columna" siga siendo genérico para esos casos, sin hardcodear el nombre
// del filtro en el shell ni en el filtrado de App.tsx.
const CAMPO_BASE_POR_FILTRO: Record<string, string> = { anioDesde: "año", anioHasta: "año" };

// ─── Public types ─────────────────────────────────────────────────────────────
export type HallazgosFiltradosProps = {
  filtros: { label: string; key: string; value: string }[];
  resultados: Instrumento[];
  // Setea/reemplaza una key de filtro ("" = quitarla) -- usado por los
  // <select> de la barra de filtros. onQuitarFiltro (la X de un chip) y
  // onSetFiltro(key, "") hacen exactamente lo mismo: filtros/chips y la
  // barra de filtros leen y escriben el mismo estado, no son dos fuentes
  // separadas (ver App.tsx, case "hallazgos-filtrados").
  onSetFiltro: (key: string, value: string) => void;
  onQuitarFiltro: (key: string) => void;
  onLimpiarTodos: () => void;
  onNavigate: (v: View) => void;
};

// ─── Hallazgos filtrados — Instrumentos ─────────────────────────────────────
// Solo la fila de "Instrumentos por jerarquía normativa"/"Cantidad de
// palabras" y los segmentos de "Estado de procesamiento"/"Evolución de
// instrumentos"/"Estructura de documentos" navegan acá hoy (ver
// PanelRegional.tsx y CountryDashboard en App.tsx). Usa el mismo shell que
// HallazgosFiltradosBarreras.tsx/HallazgosFiltradosTramites.tsx -- Instrumento
// no tiene pantalla de detalle propia, por eso no pasa onRowClick.
export function HallazgosFiltrados({ filtros, resultados, onSetFiltro, onQuitarFiltro, onLimpiarTodos, onNavigate }: HallazgosFiltradosProps) {
  return (
    <HallazgosFiltradosShell<Instrumento>
      filtros={filtros}
      resultados={resultados}
      columnasBase={COLUMNAS_BASE}
      campoBasePorFiltro={CAMPO_BASE_POR_FILTRO}
      onSetFiltro={onSetFiltro}
      onQuitarFiltro={onQuitarFiltro}
      onLimpiarTodos={onLimpiarTodos}
      onNavigate={onNavigate}
      // País/Clasificación/Subdimensión/Severidad quedan visual-only:
      // Instrumento no tiene esos campos (son conceptos de Barreras). TODO:
      // si el catálogo de instrumentos suma esas dimensiones, agregarlas acá.
      camposReales={["sector", "entidad", "jerarquia"]}
      sectors={SECTOR_POOL}
      entidades={ENTIDAD_POOL}
      jerarquiaOptions={JERARQUIA_N2N6_TOTALES.map(j => j.nivel)}
      mostrarPeriodo
    />
  );
}

export default HallazgosFiltrados;
