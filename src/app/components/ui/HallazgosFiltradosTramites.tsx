// Header/BarraFiltrosBarreras (vía el shell) y ALL_TRAMITES/ESTADO_HITL_META
// viven en App.tsx, y App.tsx importa este archivo de forma estática para el
// case "hallazgos-filtrados-tramites" de renderView() -- mismo criterio ya
// documentado en HallazgosFiltrados.tsx/HallazgosFiltradosShell.tsx: todo lo
// que se importa de vuelta desde App.tsx solo se usa dentro del cuerpo de
// HallazgosFiltradosTramites(), nunca en el top-level de este módulo, así
// que el import estático es seguro.
import { ALL_TRAMITES, ESTADO_HITL_META } from "../../App";
import type { View } from "../../App";
// C viene de ./theme (no de App.tsx): SEVERIDAD_TRAMITE_COLOR de más abajo se
// evalúa en el top-level de este módulo, así que necesita la fuente sin
// ciclo -- ver comentario en theme.ts sobre por qué C importado desde App.tsx
// no es seguro fuera del cuerpo de un componente.
import { C } from "../../theme";
import { Badge } from "./TablaExploratoria";
import { HallazgosFiltradosShell, type Columna } from "./HallazgosFiltradosShell";

type TramiteItem = (typeof ALL_TRAMITES)[number];

function textoCelda(valor: string) {
  return <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: "#6B7A8D" }}>{valor}</span>;
}

// ALL_TRAMITES solo trae severidad "Crítica"/"Alta" (ver TRAMITES_PRIORITARIOS_
// BASE en App.tsx) -- SEVERITY_COLOR de App.tsx usa las formas masculinas
// ("Crítico"/"Alto", para Barreras), así que acá va un mapeo propio en vez de
// reusar SeverityBadge (que con esas keys caería siempre al color de "Bajo").
const SEVERIDAD_TRAMITE_COLOR: Record<string, string> = { "Crítica": C.critico, "Alta": C.alto };
function SeveridadTramiteBadge({ nivel }: { nivel: string }) {
  const color = SEVERIDAD_TRAMITE_COLOR[nivel] ?? C.bajo;
  return <Badge label={nivel} bg={color + "22"} color={color} />;
}

const COLUMNAS_BASE: Columna<TramiteItem>[] = [
  { key: "nombre", header: "Trámite", cell: it => <span className="text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#14161A" }}>{it.nombre}</span> },
  { key: "pais", header: "País", cell: it => textoCelda(it.pais) },
  { key: "entidad", header: "Entidad", cell: it => textoCelda(it.entidad) },
  { key: "tipo", header: "Tipo de usuario", cell: it => textoCelda(it.tipo) },
  { key: "sector", header: "Sector", cell: it => textoCelda(it.sector) },
  { key: "severidad", header: "Severidad", cell: it => <SeveridadTramiteBadge nivel={it.severidad} /> },
  { key: "estadoHitl", header: "Estado HITL", cell: it => <Badge label={it.estadoHitl} {...ESTADO_HITL_META[it.estadoHitl]} /> },
  { key: "costo", header: "Costo estimado", cell: it => <span className="text-[12px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>{it.costo.monetario}</span> },
  { key: "accionSugerida", header: "Acción sugerida", cell: it => textoCelda(it.accionSugerida) },
];
// "tipoUsuario" (la key que usan los clics en gráfica) es el mismo campo que
// la columna base "tipo" -- este mapeo evita una columna "Tipo de usuario"
// redundante junto a "Tipo de usuario" (la base ya la muestra).
const CAMPO_BASE_POR_FILTRO: Record<string, string> = { tipoUsuario: "tipo" };

export type HallazgosFiltradosTramitesProps = {
  filtros: { label: string; key: string; value: string }[];
  resultados: TramiteItem[];
  onSetFiltro: (key: string, value: string) => void;
  onQuitarFiltro: (key: string) => void;
  onLimpiarTodos: () => void;
  onNavigate: (v: View) => void;
  notaCalculo?: string;
};

// ─── Hallazgos filtrados — Trámites ─────────────────────────────────────────
// Mismo shell que HallazgosFiltrados.tsx (Instrumentos) y
// HallazgosFiltradosBarreras.tsx, con su propio objeto `filtros` (ver
// App.tsx, case "hallazgos-filtrados-tramites") -- no comparte estado con
// esas otras dos pantallas.
export function HallazgosFiltradosTramites({ filtros, resultados, onSetFiltro, onQuitarFiltro, onLimpiarTodos, onNavigate, notaCalculo }: HallazgosFiltradosTramitesProps) {
  return (
    <HallazgosFiltradosShell<TramiteItem>
      filtros={filtros}
      resultados={resultados}
      columnasBase={COLUMNAS_BASE}
      campoBasePorFiltro={CAMPO_BASE_POR_FILTRO}
      onSetFiltro={onSetFiltro}
      onQuitarFiltro={onQuitarFiltro}
      onLimpiarTodos={onLimpiarTodos}
      onNavigate={onNavigate}
      notaCalculo={notaCalculo}
      onRowClick={it => onNavigate({ screen: "tramite-detail", id: it.id })}
      // Clasificación/Subdimensión/Jerarquía quedan visual-only: son conceptos
      // de Barreras, ALL_TRAMITES no los tiene. "Tipo de usuario" no está en
      // la barra (solo se llega a él por clic en gráfica, ver CABLEAR
      // GRÁFICAS DE TRÁMITES) -- por eso no figura en camposReales tampoco,
      // solo se lee de `filtros` para el chip/columna, no hay select acá.
      camposReales={["pais", "sector", "entidad", "severidad"]}
      sectors={Array.from(new Set(ALL_TRAMITES.map(t => t.sector))).sort()}
      entidades={Array.from(new Set(ALL_TRAMITES.map(t => t.entidad))).sort()}
    />
  );
}

export default HallazgosFiltradosTramites;
