// Header/BarraFiltrosBarreras (vía el shell) y ALL_BARRERAS/SeverityBadge/
// ESTADO_HITL_META/COUNTRIES/SECTOR/ENTIDAD lists viven en App.tsx, y App.tsx
// importa este archivo de forma estática para el case
// "hallazgos-filtrados-barreras" de renderView() -- mismo criterio ya
// documentado en HallazgosFiltrados.tsx/HallazgosFiltradosShell.tsx: todo lo
// que se importa de vuelta desde App.tsx solo se usa dentro del cuerpo de
// HallazgosFiltradosBarreras(), nunca en el top-level de este módulo, así
// que el import estático es seguro.
import { ALL_BARRERAS, SeverityBadge, ESTADO_HITL_META } from "../../App";
import type { View } from "../../App";
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
};

// ─── Hallazgos filtrados — Barreras ─────────────────────────────────────────
// Mismo shell que HallazgosFiltrados.tsx (Instrumentos) y
// HallazgosFiltradosTramites.tsx, con su propio objeto `filtros` (ver
// App.tsx, case "hallazgos-filtrados-barreras") -- no comparte estado con
// esas otras dos pantallas aunque una key como "subdimension" exista en las
// tres, cada una vive en su propia URL/estado.
export function HallazgosFiltradosBarreras({ filtros, resultados, onSetFiltro, onQuitarFiltro, onLimpiarTodos, onNavigate }: HallazgosFiltradosBarrerasProps) {
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
      onRowClick={it => onNavigate({ screen: "barrera-detail", id: it.id })}
      // Los 7 campos de la barra existen en ALL_BARRERAS -- ninguno queda
      // visual-only acá (a diferencia de Instrumentos).
      camposReales={["pais", "sector", "entidad", "clasificacion", "subdimension", "jerarquia", "severidad"]}
      sectors={Array.from(new Set(ALL_BARRERAS.map(b => b.sector))).sort()}
      entidades={Array.from(new Set(ALL_BARRERAS.map(b => b.entidad))).sort()}
    />
  );
}

export default HallazgosFiltradosBarreras;
