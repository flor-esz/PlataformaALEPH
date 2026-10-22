// ─── Contrato de datos de las pantallas rediseñadas ──────────────────────────
// Cada pantalla es PRESENTACIONAL: recibe por props los datos del alcance que
// está viendo (regional o un país) y avisa con callbacks cuando el usuario
// cambia de país o abre un detalle. No hace consultas ni conoce el backend.
//
// Convención: `country === "Todos"` es la vista regional; cualquier otro valor
// es el nombre de un país. Los datos de `data` corresponden a ESE alcance.
//
// Si `data` no se pasa, cada pantalla usa datos de ejemplo (fixtures.ts), así
// que se puede integrar primero y conectar después.
import type { Sev } from "./theme";

export type { Sev };
export type Par = [nombre: string, valor: number];

export interface PaisRef {
  id: string;
  name: string;
}

/** Cifras del encabezado (a la derecha del título). */
export type HeroStat = [valor: string, etiqueta: string, infoKey?: string];

/** Selector extra del encabezado (Sector, Subsector…). */
export interface HeroFilter {
  label: string;
  value: string;
  options: [valor: string, texto: string][];
  onChange: (v: string) => void;
}

export interface ScreenProps<D> {
  /** "Todos" = vista regional. */
  country: string;
  /** Países disponibles (selector del encabezado y orden de las tarjetas). */
  paises?: PaisRef[];
  /** Datos del alcance actual. Si falta, se usan datos de ejemplo. */
  data?: D;
  onCountryChange: (country: string) => void;
  /** Selectores extra del encabezado (opcional). */
  filtros?: HeroFilter[];
  userInitials?: string;
  /** Pie de página: "15 de septiembre de 2026". Si falta, usa el de ejemplo. */
  ultimaActualizacion?: string;
  /** Pie de página: "2015–2024". Si falta, usa el de ejemplo. */
  anios?: string;
}

// ── Panorama ────────────────────────────────────────────────────────────────
export interface IndicadorAcervo {
  label: string;
  unit: string;
  /** Decimales al mostrar el valor (0 = entero). */
  decimals: number;
  /** Un valor por país, en el orden de `PanoramaData.paises`. */
  valores: number[];
  /** Promedio regional (ALC) del indicador. Si falta, se calcula con `valores`. */
  promedio?: number;
}
export interface PanoramaData {
  stats: HeroStat[];
  years: number[];
  /** Todos los países, con su acervo vigente actual. */
  paises: { id: string; name: string; now: number }[];
  /** Acervo vigente por año: [país][año], en el orden de `paises`. */
  seriePais: number[][];
  /** Alcance actual: [sector, serie por año]. */
  sectores: [sector: string, serie: number[]][];
  /** Alcance actual: [tipo de regulación, serie por año]. */
  tipos: [tipo: string, serie: number[]][];
  /** Por clave de indicador (cantidad, edad, palabras, longitud, lectura…). */
  indicadores: Record<string, IndicadorAcervo>;
  /** Solo vista por país: serie anual de cada indicador (por clave). */
  serieIndicador?: Record<string, number[]>;
  /** Promedio ALC del acervo vigente por año (mismo orden que `years`). Si falta, se calcula. */
  promedioAlc?: number[];
  /** Solo vista por país: serie anual del promedio ALC de cada indicador (por clave). */
  serieIndicadorAlc?: Record<string, number[]>;
}

// ── Barreras ────────────────────────────────────────────────────────────────
export interface BarreraFila {
  id?: string;
  barrera: string;
  sector: string;
  tipo: "Entrada" | "Operación";
  ambito: string;
  regulacion: string;
  entidad: string;
  severidad: Sev;
  accion: string;
}
/** Fila de un gráfico de barreras (ámbito, jerarquía, sector o entidad), con TODOS
 *  sus desgloses. La pantalla elige qué mostrar; no calcula ni reparte nada. */
export interface DesgloseBarrera {
  k: string;
  entrada: number;
  operacion: number;
  alta: number;
  media: number;
  baja: number;
  /** Opcional: cruce tipo × severidad (para el filtro de severidad desglosado por
   *  tipo). Si falta, se reparte en proporción a entrada/operación. */
  cruce?: Partial<Record<Sev, { entrada: number; operacion: number }>>;
}
export interface BarrerasData {
  stats: HeroStat[];
  total: number;
  entrada: number;
  operacion: number;
  /** Alta, Media, Baja (ese orden). */
  sev: [Sev, number][];
  ambito: DesgloseBarrera[];
  /** Del nivel normativo más alto al más bajo (el color sigue a la posición original). */
  jerarquia: DesgloseBarrera[];
  sector: DesgloseBarrera[];
  /** Instrumentos normativos por sector (misma posición que `sector`). */
  instrumentos: number[];
  entidad: DesgloseBarrera[];
  /** Solo vista regional: [id, país, entrada, operación]. */
  paises?: [string, string, number, number][];
  /** Solo vista por país. */
  acciones?: Par[];
  /** Opcional, vista por país: desagregación de cada acción sugerida →
   *  `accionMatriz[acción][tipo de norma][sector] = n.º de barreras`. Los tipos y sectores deben
   *  coincidir con `jerarquia[].k` y `sector[].k`. Si falta, la pantalla reparte un ejemplo. */
  /** Afectación a la MIPYME: [Alta, Media, Baja] con n.º de barreras. */
  mip?: Par[];
  accionMatriz?: Record<string, Record<string, Record<string, number>>>;
  tabla?: BarreraFila[];
}

// ── Trámites ────────────────────────────────────────────────────────────────
export interface TramiteFila {
  id?: string;
  tramite: string;
  sector: string;
  entidad: string;
  etapa: string;
  usuario: string;
  severidad: Sev;
  costo: string;
  accion: string;
}
/** Fila de un gráfico de trámites con su severidad real. */
export interface DesgloseTramite {
  k: string;
  alta: number;
  media: number;
  baja: number;
}
export interface TramitesData {
  stats: HeroStat[];
  tot: number;
  ent: number;
  sec: number;
  /** Costo administrativo estimado, millones de USD. */
  cost: number;
  /** Trámites por severidad: [alta, media, baja]. */
  sev: [number, number, number];
  sector: DesgloseTramite[];
  entidad: DesgloseTramite[];
  etapa: DesgloseTramite[];
  usuario: DesgloseTramite[];
  acc: Par[];
  /** Solo vista regional. */
  paises?: {
    id: string;
    name: string;
    tot: number;
    sev: [number, number, number];
  }[];
  /** Solo vista por país. */
  afe?: Par[];
  mip?: Par[];
  /** Opcional: desagregación de la acción sugerida por entidad emisora →
   *  `accionEntidad[acción][entidad] = n.º de trámites` (las entidades deben coincidir con `entidad[].k`).
   *  Si falta, la pantalla reparte un ejemplo. */
  accionEntidad?: Record<string, Record<string, number>>;
  /** [actividad, parte del costo (0-1), parte del número de trámites (0-1)] */
  cAct?: [string, number, number][];
  /** [tipo de usuario, parte del costo (0-1)] */
  cUsu?: Par[];
  tabla?: TramiteFila[];
}

/* ───────────── Costeo (antes «Impacto económico») ───────────── */

/** Filtros del encabezado; «Todos» = sin filtro. Afectan toda la pantalla. */
export interface CosteoFiltros {
  pais: string;
  /** Sector administrativo. */
  sec: string;
  /** Entidad responsable. */
  ent: string;
  /** Tipo de usuario (Empresarial / Ciudadano). */
  usu: string;
}
/** Costo en millones de USD, dividido en tiempo activo (CA) y espera de la administración (COP). */
export interface CosteoFila {
  k: string;
  v: number;
  ca: number;
  cop: number;
  /** Nº de trámites con los que se calculó (usuarios, países). */
  n?: number;
  /** Color fijo del país. */
  c?: string;
}
export interface CosteoTramite {
  k: string;
  sec: string;
  ent: string;
  usu: string;
  /** Costo unitario (USD). */
  cu: number;
  /** Volumen anual. */
  vol: number;
  /** Costo agregado (millones de USD) y su división CA / COP. */
  v: number;
  ca: number;
  cop: number;
  acc: string;
  eta: string;
  sev: Sev;
}
export interface CosteoData {
  /** Costo administrativo estimado total (millones de USD): CET = CA + COP. */
  cost: number;
  ca: number;
  cop: number;
  /** Trámites costeados. */
  costeados: number;
  /** Costo promedio por transacción (USD). */
  avg: number;
  sector: CosteoFila[];
  entidad: CosteoFila[];
  usuarios: CosteoFila[];
  /** Ordenados por costo agregado, de mayor a menor. */
  tram: CosteoTramite[];
  /** Costo activo repartido en las ocho actividades estándar. */
  act: { k: string; v: number; p: number }[];
  pais: CosteoFila[];
}

/* ---------- Índice de Distorsiones Regulatorias (IDR) ---------- */
/** Puntaje 0–100 de una categoría. */
export interface IdrPunto {
  k: string;
  v: number;
}
export interface IdrData {
  /** Puntaje del subíndice Barreras y del subíndice Trámites (promedio de los países elegidos). */
  b: number;
  t: number;
  /** Componentes del subíndice Barreras. */
  ent: number;
  ope: number;
  /** Las seis cargas del subíndice Trámites. */
  cargas: IdrPunto[];
  tipos: IdrPunto[];
  secs: IdrPunto[];
  ents: IdrPunto[];
  adms: IdrPunto[];
  /** Evolución del subíndice Barreras: una fila por año con una clave por país y el promedio ALC. */
  evo: Record<string, number>[];
  paises: {
    k: string;
    b: number;
    t: number;
    idr: number;
    c: string;
    on: boolean;
  }[];
  /** Fuentes procesadas / previstas, % de cobertura y % de hallazgos validados (pie de página). */
  fp: number;
  ft: number;
  cob: number;
  val: number;
}

/* ---------- Reportes ---------- */
export type ReporteTipo = "estrategico" | "operativo" | "xbar" | "xtra";
export type ReporteFormato = "PDF" | "PPT editable" | "Excel";
/** Filtros del alcance ("Todos"/"Todas" = sin filtrar). `pais` es obligatorio: "" = sin elegir. */
export interface ReporteFiltros {
  pais: string;
  /** Sector económico (con tipo «Barreras»). */
  sec: string;
  /** Sector administrativo (con tipo «Trámites»). */
  adm: string;
  tipo: string;
  hitl: string;
  /** Año inicial y final del periodo (desde ≤ hasta). */
  desde: string;
  hasta: string;
  sev: string;
  usu: string;
}
/** Lo que el usuario eligió al pulsar «Generar» / «Descargar». */
export interface ReporteSeleccion {
  tipo: ReporteTipo;
  formatos: ReporteFormato[];
  filtros: ReporteFiltros;
  /** Registros estimados con esos filtros. */
  barreras: number;
  tramites: number;
}
export interface ReporteConteo {
  nb: number;
  nt: number;
  cob: number;
}
