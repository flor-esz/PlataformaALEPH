// Header/BarraFiltrosBarreras (vía el shell) y ALL_BARRERAS/SeverityBadge/
// ESTADO_HITL_META/COUNTRIES/SECTOR/ENTIDAD lists viven en App.tsx, y App.tsx
// importa este archivo de forma estática para el case
// "hallazgos-filtrados-barreras" de renderView() -- mismo criterio ya
// documentado en HallazgosFiltrados.tsx/HallazgosFiltradosShell.tsx: todo lo
// que se importa de vuelta desde App.tsx solo se usa dentro del cuerpo de
// HallazgosFiltradosBarreras(), nunca en el top-level de este módulo, así
// que el import estático es seguro.
import { ALL_BARRERAS, SeverityBadge, ESTADO_HITL_META, JERARQUIA_BARRERAS_A_N2N6 } from "../../App";
import type { View, HojaExcel, ReporteEstrategicoData } from "../../App";
import { Badge } from "./TablaExploratoria";
import { HallazgosFiltradosShell, type Columna } from "./HallazgosFiltradosShell";

type BarreraItem = (typeof ALL_BARRERAS)[number];

function textoCelda(valor: string) {
  return <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: "#6B7A8D" }}>{valor}</span>;
}

const COLUMNAS_BASE: Columna<BarreraItem>[] = [
  { key: "titulo", header: "Barrera", cell: it => <span className="text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#14161A" }}>{it.titulo}</span> },
  { key: "pais", header: "País", cell: it => textoCelda(it.pais) },
  { key: "clasificacion", header: "Clasificación", cell: it => textoCelda(it.clasificacion) },
  { key: "subdimension", header: "Subdimensión", cell: it => textoCelda(it.subdimension) },
  { key: "sector", header: "Sector", cell: it => textoCelda(it.sector) },
  { key: "severidad", header: "Severidad", cell: it => <SeverityBadge level={it.severidad} /> },
  { key: "instrumento", header: "Instrumento", cell: it => textoCelda(it.instrumento) },
  { key: "canalTransmision", header: "Canal", cell: it => textoCelda(it.canalTransmision) },
  { key: "estadoHitl", header: "Estado HITL", cell: it => <Badge label={it.validacion.estadoHitl} {...ESTADO_HITL_META[it.validacion.estadoHitl]} /> },
];
// "estadoHitl" es filtro sobre `validacion.estadoHitl` (anidado), no un campo
// de primer nivel -- este mapeo evita que el shell agregue una columna
// redundante para esa key si algún día se filtra por ella.
const CAMPO_BASE_POR_FILTRO: Record<string, string> = { estadoHitl: "validacion.estadoHitl" };

export type HallazgosFiltradosBarrerasProps = {
  filtros: { label: string; key: string; value: string }[];
  resultados: BarreraItem[];
  onSetFiltro: (key: string, value: string) => void;
  onQuitarFiltro: (key: string) => void;
  onLimpiarTodos: () => void;
  onNavigate: (v: View) => void;
  notaCalculo?: string;
};

// ─── Hallazgos filtrados — Barreras ─────────────────────────────────────────
// Mismo shell que HallazgosFiltrados.tsx (Instrumentos) y
// HallazgosFiltradosTramites.tsx, con su propio objeto `filtros` (ver
// App.tsx, case "hallazgos-filtrados-barreras") -- no comparte estado con
// esas otras dos pantallas aunque una key como "subdimension" exista en las
// tres, cada una vive en su propia URL/estado.
export function HallazgosFiltradosBarreras({ filtros, resultados, onSetFiltro, onQuitarFiltro, onLimpiarTodos, onNavigate, notaCalculo }: HallazgosFiltradosBarrerasProps) {
  // Excel: una sola hoja con las 15 columnas pedidas, sobre `resultados` (ya
  // filtrado en pantalla, no ALL_BARRERAS sin filtrar). Jerarquía traducida a
  // N2-N6 (mismo criterio que el resto de la pantalla, ver JERARQUIA_
  // BARRERAS_A_N2N6 en App.tsx).
  const hojaBarreras: HojaExcel = {
    nombre: "Barreras",
    filas: resultados.map(b => ({
      "ID": b.id,
      "País": b.pais,
      "Sector": b.sector,
      "Entidad": b.entidad,
      "Instrumento": b.instrumento,
      "Jerarquía": JERARQUIA_BARRERAS_A_N2N6[b.jerarquia] ?? b.jerarquia,
      "Cita": b.pasajeResaltado,
      "Descripción": b.descripcion,
      "Eje (Entrada/Operación)": b.clasificacion,
      "Subcategoría": b.subdimension,
      "Canal de transmisión": b.canalTransmision,
      "Severidad IA": b.validacion.severidadIA,
      "Severidad validada": b.validacion.severidadValidada,
      "Estado HITL": b.validacion.estadoHitl,
      "Acción de mejora": b.accionSugerida.accion,
    })),
  };
  // Reporte Estratégico (PDF) -- mínimo, mismo criterio ya usado antes
  // (Instrumentos): sin hallazgos destacados ni acciones AMR inventados para
  // este catálogo genérico -- esas 2 secciones quedan vacías.
  const estrategicoData: ReporteEstrategicoData = {
    paisLabel: "Barreras filtradas",
    isRegional: true,
    codigo: "RegLAC-BARR-2026-001",
    sectorLabel: "Todos los sectores",
    fechaCorte: "Marzo 2026",
    filtrosActivos: filtros.map(f => ({ label: f.label, value: f.value })),
    mensajes: { titulo: "", items: [] },
    bloquesKpi: [
      {
        titulo: "Barreras filtradas",
        variante: "panorama",
        items: [{ label: "Total de barreras", val: String(resultados.length) }],
      },
    ],
    graficas: [],
    accionesAMR: { titulo: "", items: [] },
    hallazgosDestacados: { titulo: "", items: [] },
  };

  return (
    <HallazgosFiltradosShell<BarreraItem>
      filtros={filtros}
      resultados={resultados}
      columnasBase={COLUMNAS_BASE}
      campoBasePorFiltro={CAMPO_BASE_POR_FILTRO}
      onSetFiltro={onSetFiltro}
      onQuitarFiltro={onQuitarFiltro}
      onLimpiarTodos={onLimpiarTodos}
      onNavigate={onNavigate}
      notaCalculo={notaCalculo}
      onRowClick={it => onNavigate({ screen: "barrera-detail", id: it.id })}
      // Los 7 campos de la barra existen en ALL_BARRERAS -- ninguno queda
      // visual-only acá (a diferencia de Instrumentos).
      camposReales={["pais", "sector", "entidad", "clasificacion", "subdimension", "jerarquia", "severidad"]}
      sectors={Array.from(new Set(ALL_BARRERAS.map(b => b.sector))).sort()}
      entidades={Array.from(new Set(ALL_BARRERAS.map(b => b.entidad))).sort()}
      descargar={{ hojas: [hojaBarreras], nombreArchivoBase: "barreras-filtradas", estrategicoData }}
    />
  );
}

export default HallazgosFiltradosBarreras;
