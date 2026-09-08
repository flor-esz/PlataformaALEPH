// ─── Catálogo de muestra de instrumentos ───────────────────────────────────────
// Contenido generado, NO un catálogo real de 1.842 instrumentos — dato de
// muestra hasta que exista la fuente real. Sin imports de App.tsx a propósito
// (mismo criterio que el resto de src/app/components/ui/*.tsx): este archivo
// se importa desde PanelRegional.tsx y desde App.tsx (vía HallazgosFiltrados),
// así que si importara algo de vuelta desde App.tsx armaría el mismo tipo de
// ciclo ya documentado en theme.ts — no hace falta, no necesita nada de ahí.
import type { Vigencia, EstadoInstrumento } from "../components/ui/TablaExploratoria";

// ─── Public types ─────────────────────────────────────────────────────────────
export type Instrumento = {
  nombre: string;
  tipo: string;
  entidad: string;
  sector: string;
  año: number;
  jerarquia: string;
  vigencia: Vigencia;
  estado: EstadoInstrumento;
};

// ─── Pools de generación ────────────────────────────────────────────────────────
const NOMBRE_POOL = ["D.S.", "Ley", "R.M.", "Decreto", "Resolución"];
const ENTIDAD_POOL = ["Min. Economía", "Asamblea", "SENAPI", "Min. Trabajo", "Aduana Nacional", "Alcaldía Municipal"];
const SECTOR_POOL = ["Comercio", "Financiero", "Innovación", "Agroindustria", "Minería", "Textil y Confección"];
const TIPO_POR_NOMBRE: Record<string, string> = {
  "D.S.": "Decreto",
  "Ley": "Ley",
  "R.M.": "Resolución",
  "Decreto": "Decreto",
  "Resolución": "Resolución",
};

// Niveles N2–N6 y sus totales — MISMOS números que ya usa BarrasComposicion en
// Panel Regional (210/486/512/398/236 sobre 1.842). Fuente única: PanelRegional.tsx
// importa este array (no mantiene su propia copia) para que el gráfico y este
// catálogo de muestra siempre coincidan, incluso si estos valores cambian el
// día que lleguen datos reales.
export const JERARQUIA_N2N6_TOTALES: { nivel: string; total: number }[] = [
  { nivel: "N2 Legislativo", total: 210 },
  { nivel: "N3 Reglamentario", total: 486 },
  { nivel: "N4 Resolutivo / Agencias", total: 512 },
  { nivel: "N5 Técnico-operativo", total: 398 },
  { nivel: "N6 Procedimental/Trámites", total: 236 },
];

// ─── Generador ──────────────────────────────────────────────────────────────────
// Genera `cantidad` filas cíclicas sobre los pools de arriba — no es un
// catálogo real, solo contenido plausible para maquetar HallazgosFiltrados.tsx.
function generarInstrumentos(nivel: string, cantidad: number, startYear = 1990, endYear = 2023): Instrumento[] {
  const yearSpan = endYear - startYear + 1;
  // Código correlativo por prefijo de nombre (ej. "D.S. 4523", "D.S. 4524"...),
  // arrancando en 4500 y subiendo cada vez que ese mismo prefijo se repite.
  const correlativoPorNombre: Record<string, number> = {};

  const filas: Instrumento[] = [];
  for (let i = 0; i < cantidad; i++) {
    const nombreBase = NOMBRE_POOL[i % NOMBRE_POOL.length];
    correlativoPorNombre[nombreBase] = (correlativoPorNombre[nombreBase] ?? 4500) + 1;

    const vigencia: Vigencia = i % 5 === 0 ? "Por confirmar" : "Vigente"; // ~20% / 80%
    const estado: EstadoInstrumento = i % 10 < 3 ? "Procesado" : "Analizado"; // ~30% / 70%

    filas.push({
      nombre: `${nombreBase} ${correlativoPorNombre[nombreBase]}`,
      tipo: TIPO_POR_NOMBRE[nombreBase] ?? nombreBase,
      entidad: ENTIDAD_POOL[i % ENTIDAD_POOL.length],
      sector: SECTOR_POOL[i % SECTOR_POOL.length],
      año: startYear + (i % yearSpan),
      jerarquia: nivel,
      vigencia,
      estado,
    });
  }
  return filas;
}

// El total de cada nivel coincide EXACTO con JERARQUIA_N2N6_TOTALES (210 +
// 486 + 512 + 398 + 236 = 1.842) — si esos totales cambian, esta generación
// se recalcula sola, no queda hardcodeada por separado.
export const INSTRUMENTOS_MUESTRA: Instrumento[] = JERARQUIA_N2N6_TOTALES.flatMap(
  ({ nivel, total }) => generarInstrumentos(nivel, total)
);
