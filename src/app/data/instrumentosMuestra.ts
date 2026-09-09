// ─── Catálogo de muestra de instrumentos ───────────────────────────────────────
// Contenido generado, NO un catálogo real de 1.842 instrumentos — dato de
// muestra hasta que exista la fuente real. Sin imports de App.tsx a propósito
// (mismo criterio que el resto de src/app/components/ui/*.tsx): este archivo
// se importa desde PanelRegional.tsx y desde App.tsx (vía HallazgosFiltrados),
// así que si importara algo de vuelta desde App.tsx armaría el mismo tipo de
// ciclo ya documentado en theme.ts — no hace falta, no necesita nada de ahí.
import type { Vigencia, EstadoInstrumento } from "../components/ui/TablaExploratoria";
import type { Estructura } from "../components/ui/DocumentosEstructuraPanel";

// ─── Public types ─────────────────────────────────────────────────────────────
export type EstadoProcesamiento = "Analizados" | "Con metadatos" | "Procesados" | "Scrapeados" | "Pendientes";

export type Instrumento = {
  nombre: string;
  tipo: string;
  entidad: string;
  sector: string;
  // Año aproximado, NO una fecha real por instrumento -- ajustado para que,
  // agrupando por jerarquia y por año, la suma cuadre razonablemente con la
  // curva ya usada en EvolucionInstrumentosPanel (ver AÑO_BUCKET_RANGOS).
  año: number;
  jerarquia: string;
  vigencia: Vigencia;
  estado: EstadoInstrumento;
  // Dimensión independiente de `jerarquia` -- un mismo instrumento tiene
  // ambos campos a la vez (ver ESTADO_PROCESAMIENTO_RATIOS más abajo).
  estadoProcesamiento: EstadoProcesamiento;
  // % por nivel viene de DOC_ESTRUCTURA_PCT_MUESTRA (mismo que ya usa
  // DocumentosEstructuraPanel en Panel País) -- sí varía por nivel, a
  // diferencia de estadoProcesamiento.
  estructura: Estructura;
};

// ─── Pools de generación ────────────────────────────────────────────────────────
// ENTIDAD_POOL/SECTOR_POOL exportados: son exactamente el universo de valores
// que puede tener `entidad`/`sector` en INSTRUMENTOS_MUESTRA (el generador
// cicla sobre estos mismos arrays), así que HallazgosFiltrados.tsx los reusa
// como opciones del <select> de su barra de filtros en vez de recalcular los
// valores únicos a partir del catálogo generado.
const NOMBRE_POOL = ["D.S.", "Ley", "R.M.", "Decreto", "Resolución"];
export const ENTIDAD_POOL = ["Min. Economía", "Asamblea", "SENAPI", "Min. Trabajo", "Aduana Nacional", "Alcaldía Municipal"];
export const SECTOR_POOL = ["Comercio", "Financiero", "Innovación", "Agroindustria", "Minería", "Textil y Confección"];
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

// % no estructurado por nivel N2–N6 (mismo orden que JERARQUIA_N2N6_TOTALES)
// -- fuente única: App.tsx importa esto en vez de mantener su propia copia,
// para que DocumentosEstructuraPanel en Panel País y el campo `estructura`
// de este catálogo siempre coincidan.
export const DOC_ESTRUCTURA_PCT_MUESTRA = [6, 12, 18, 25, 35];

// Curva histórica de instrumentos (Evolución de instrumentos en el tiempo) --
// dato de muestra, no hay snapshot histórico real todavía. Fuente única:
// App.tsx importa esto en vez de mantener su propia copia, para que
// EvolucionInstrumentosPanel y el campo `año` de este catálogo describan la
// misma curva (ver AÑO_BUCKET_RANGOS más abajo).
export const EVOLUCION_ANIOS = [2015, 2018, 2021, 2024, 2026];
export const EVOLUCION_FACTORES = [0.63, 0.75, 0.84, 0.94, 1.00];

// Mismas proporciones que ya usa EstadoProcesamientoPanel en Panel Regional
// (38% Analizados, 24% Con metadatos, 20% Procesados, 12% Scrapeados, 6%
// Pendientes). Fuente única: PanelRegional.tsx importa este array (no
// mantiene su propia copia de los nombres/porcentajes) para que la barra
// apilada y este catálogo de muestra siempre coincidan.
export const ESTADO_PROCESAMIENTO_RATIOS: { nombre: EstadoProcesamiento; pct: number }[] = [
  { nombre: "Analizados", pct: 38 },
  { nombre: "Con metadatos", pct: 24 },
  { nombre: "Procesados", pct: 20 },
  { nombre: "Scrapeados", pct: 12 },
  { nombre: "Pendientes", pct: 6 },
];

// Reparte `total` índices entre los `items` proporcionalmente a su `pct`,
// intercalados (no en bloques contiguos) y con la cuota de cada uno exacta
// -- en cada paso avanza el que va más atrasado respecto de su proporción
// objetivo (reparto proporcional tipo "Bresenham"). Reusado para
// estadoProcesamiento, año (por nivel), estructura (por nivel), y exportado
// para que App.tsx lo reuse al asignar canalTransmision/afectacionMipyme/
// tipoAfectacion a ALL_TRAMITES (mismo criterio, evita reimplementar el
// mismo reparto proporcional dos veces).
export function repartoProporcional<T>(total: number, items: { valor: T; pct: number }[]): T[] {
  const cuotas = items.map(it => Math.round(total * (it.pct / 100)));
  const sumaSinUltima = cuotas.slice(0, -1).reduce((s, v) => s + v, 0);
  cuotas[cuotas.length - 1] = total - sumaSinUltima; // ajuste para que sume exacto

  const asignados = new Array(cuotas.length).fill(0);
  const resultado: T[] = [];
  for (let i = 0; i < total; i++) {
    let elegido = 0;
    let mejorScore = -Infinity;
    for (let k = 0; k < cuotas.length; k++) {
      if (asignados[k] >= cuotas[k]) continue; // ya cumplió su cuota
      const score = cuotas[k] * (i + 1) - asignados[k] * total; // proporción objetivo vs. avance actual
      if (score > mejorScore) { mejorScore = score; elegido = k; }
    }
    asignados[elegido]++;
    resultado.push(items[elegido].valor);
  }
  return resultado;
}

// Es una dimensión independiente de `jerarquia`: por eso se calcula UNA vez
// sobre el total global (1.842), no por nivel N2–N6 -- si se calculara por
// nivel, cada nivel terminaría con su propio 38/24/20/12/6% en vez de ser el
// total el que cuadra con esas proporciones.
function buildEstadoProcesamientoPorIndice(total: number): EstadoProcesamiento[] {
  return repartoProporcional(total, ESTADO_PROCESAMIENTO_RATIOS.map(e => ({ valor: e.nombre, pct: e.pct })));
}

const TOTAL_INSTRUMENTOS = JERARQUIA_N2N6_TOTALES.reduce((s, { total }) => s + total, 0); // 1.842
// Calculado UNA sola vez sobre el total global -- ver comentario de la
// función de arriba sobre por qué esto no puede calcularse por nivel.
const ESTADO_PROCESAMIENTO_POR_INDICE_GLOBAL = buildEstadoProcesamientoPorIndice(TOTAL_INSTRUMENTOS);

// A diferencia de estadoProcesamiento, `año` SÍ debe variar por nivel: la
// consigna es que agrupando por jerarquia y por año se reconstruya la misma
// curva que EvolucionInstrumentosPanel ya muestra, y esa curva escala cada
// nivel por separado (buildJerarquiaN2N6 sobre el total de cada año). Cada
// bucket cubre el tramo de años entre un punto de la curva y el anterior
// (1990 como piso del primer tramo), con la fracción INCREMENTAL de esa
// curva (no la acumulada) como `pct` de repartoProporcional.
const AÑO_BUCKET_RANGOS: { years: number[]; pct: number }[] = (() => {
  let factorAnterior = 0;
  return EVOLUCION_ANIOS.map((anioTope, i) => {
    const factor = EVOLUCION_FACTORES[i];
    const pct = (factor - factorAnterior) * 100;
    factorAnterior = factor;
    const anioDesde = i === 0 ? 1990 : EVOLUCION_ANIOS[i - 1] + 1;
    const years: number[] = [];
    for (let y = anioDesde; y <= anioTope; y++) years.push(y);
    return { years, pct };
  });
})();

// Reparte `cantidad` (el total de UN nivel) entre los tramos de
// AÑO_BUCKET_RANGOS y, dentro de cada tramo, cicla sus años para variar el
// valor exacto (no afecta la cuota por tramo, que es la que tiene que cuadrar
// con la curva). No hace falta año exacto por instrumento -- alcanza con que
// la distribución por rangos cuadre razonablemente, como pide la consigna.
function buildAniosPorNivel(cantidad: number): number[] {
  const bucketPorIndice = repartoProporcional(cantidad, AÑO_BUCKET_RANGOS.map((b, i) => ({ valor: i, pct: b.pct })));
  const contadorPorBucket = new Array(AÑO_BUCKET_RANGOS.length).fill(0);
  return bucketPorIndice.map(bucketIdx => {
    const years = AÑO_BUCKET_RANGOS[bucketIdx].years;
    const anio = years[contadorPorBucket[bucketIdx] % years.length];
    contadorPorBucket[bucketIdx]++;
    return anio;
  });
}

// Reparte `cantidad` (el total de UN nivel) entre Estructurado/No estructurado
// según el % de ESE nivel en DOC_ESTRUCTURA_PCT_MUESTRA -- a diferencia de
// estadoProcesamiento, esto sí varía por nivel (mismo criterio que Panel País).
function buildEstructuraPorNivel(cantidad: number, pctNoEstructurado: number): Estructura[] {
  return repartoProporcional<Estructura>(cantidad, [
    { valor: "No estructurado", pct: pctNoEstructurado },
    { valor: "Estructurado", pct: 100 - pctNoEstructurado },
  ]);
}

// ─── Generador ──────────────────────────────────────────────────────────────────
// Genera `cantidad` filas cíclicas sobre los pools de arriba — no es un
// catálogo real, solo contenido plausible para maquetar HallazgosFiltrados.tsx.
// `startIndex` es la posición de la primera fila de este nivel dentro de la
// secuencia global de 1.842 (ver ensamblado de INSTRUMENTOS_MUESTRA más abajo)
// -- se usa solo para leer estadoProcesamiento de
// ESTADO_PROCESAMIENTO_POR_INDICE_GLOBAL, así que esa dimensión queda
// distribuida sobre el total y no reinicia sus proporciones en cada nivel.
function generarInstrumentos(nivel: string, cantidad: number, startIndex: number, pctNoEstructurado: number): Instrumento[] {
  // Código correlativo por prefijo de nombre (ej. "D.S. 4523", "D.S. 4524"...),
  // arrancando en 4500 y subiendo cada vez que ese mismo prefijo se repite.
  const correlativoPorNombre: Record<string, number> = {};
  const aniosNivel = buildAniosPorNivel(cantidad);
  const estructurasNivel = buildEstructuraPorNivel(cantidad, pctNoEstructurado);

  const filas: Instrumento[] = [];
  for (let i = 0; i < cantidad; i++) {
    const nombreBase = NOMBRE_POOL[i % NOMBRE_POOL.length];
    correlativoPorNombre[nombreBase] = (correlativoPorNombre[nombreBase] ?? 4500) + 1;

    const vigencia: Vigencia = i % 5 === 0 ? "Por confirmar" : "Vigente"; // ~20% / 80%
    const estado: EstadoInstrumento = i % 10 < 3 ? "Procesado" : "Analizado"; // ~30% / 70%
    const estadoProcesamiento = ESTADO_PROCESAMIENTO_POR_INDICE_GLOBAL[startIndex + i];

    filas.push({
      nombre: `${nombreBase} ${correlativoPorNombre[nombreBase]}`,
      tipo: TIPO_POR_NOMBRE[nombreBase] ?? nombreBase,
      entidad: ENTIDAD_POOL[i % ENTIDAD_POOL.length],
      sector: SECTOR_POOL[i % SECTOR_POOL.length],
      año: aniosNivel[i],
      jerarquia: nivel,
      vigencia,
      estado,
      estadoProcesamiento,
      estructura: estructurasNivel[i],
    });
  }
  return filas;
}

// El total de cada nivel coincide EXACTO con JERARQUIA_N2N6_TOTALES (210 +
// 486 + 512 + 398 + 236 = 1.842) — si esos totales cambian, esta generación
// se recalcula sola, no queda hardcodeada por separado. Mismo criterio para
// estadoProcesamiento vía ESTADO_PROCESAMIENTO_RATIOS y para estructura vía
// DOC_ESTRUCTURA_PCT_MUESTRA.
export const INSTRUMENTOS_MUESTRA: Instrumento[] = (() => {
  let offset = 0;
  const filas: Instrumento[] = [];
  JERARQUIA_N2N6_TOTALES.forEach(({ nivel, total }, i) => {
    filas.push(...generarInstrumentos(nivel, total, offset, DOC_ESTRUCTURA_PCT_MUESTRA[i]));
    offset += total;
  });
  return filas;
})();
