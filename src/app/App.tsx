import { useState, useEffect, useRef, useMemo, createContext, useContext, lazy, Suspense } from "react";
// Cargados con React.lazy (no import estático): estos módulos importan { C, Header }
// de vuelta desde este archivo (ciclo App.tsx <-> revision/*.tsx) y usan C en el
// top-level de su módulo (ej. fieldStyle, ANALISTAS, SEV_COLOR). Un import estático
// aquí arriba dispara ese ciclo antes de que `export const C` quede inicializado más
// abajo -> ReferenceError "Cannot access 'C' before initialization" en tiempo de
// ejecución (no lo atrapa `vite build`, solo se ve corriendo la app en el navegador).
// lazy() difiere la evaluación del módulo hasta el primer render, cuando C ya existe.
const RevisionRepositorio = lazy(() => import("./revision/RevisionRepositorio"));
const RevisionAsesorDetalle = lazy(() => import("./revision/RevisionAsesorDetalle"));
const RevisionAnalistaChecklist = lazy(() => import("./revision/RevisionAnalistaChecklist"));
const RevisionTriageModalesDemo = lazy(() => import("./revision/RevisionTriageModales"));
const RevisionDecisionFinal = lazy(() => import("./revision/RevisionDecisionFinal"));
const RevisionAjuste = lazy(() => import("./revision/RevisionAjuste"));
const RevisionDevolverAnalista = lazy(() => import("./revision/RevisionDevolverAnalista"));
const RevisionVerHallazgo = lazy(() => import("./revision/RevisionVerHallazgo"));
const RevisionLogErrores = lazy(() => import("./revision/RevisionLogErrores"));
const RevisionNotificaciones = lazy(() => import("./revision/RevisionNotificaciones"));
// store.tsx no importa nada de este archivo (ver comentario ahí) -> import estático seguro.
import { RevisionProvider, useRevision, type Notificacion, type NotifKind } from "./revision/store";
import { PanelTipoSubdimension } from "./components/ui/PanelTipoSubdimension";
import type { TipoDato } from "./components/ui/PanelTipoSubdimension";
import { BarrasComposicion } from "./components/ui/BarrasComposicion";
import type { BarrasComposicionCategoria } from "./components/ui/BarrasComposicion";
import { IrrGeneralCard } from "./components/ui/IrrGeneralCard";
import { EvolucionInstrumentosPanel } from "./components/ui/EvolucionInstrumentosPanel";
import { DocumentosEstructuraPanel } from "./components/ui/DocumentosEstructuraPanel";
import { FuentesTrazabilidadTable } from "./components/ui/FuentesTrazabilidadTable";
import { TablaExploratoria } from "./components/ui/TablaExploratoria";
import { BarrerasPorPaisCard } from "./components/ui/BarrerasPorPaisCard";
import { MatrizRegional } from "./components/ui/MatrizRegional";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./components/ui/dropdown-menu";
// C y los HDR_BTN_* viven en ./theme, que no importa nada de este archivo, y
// no en App.tsx -- ver comentario junto a `export { C }` más abajo para el
// porqué (el resumen: PanelRegional.tsx e ImpactoEconomico.tsx se importan
// de forma estática más abajo, y a su vez importaban C desde "./App", lo que
// armaba un ciclo App.tsx <-> esos archivos. ImpactoEconomico.tsx usaba C en
// el top-level de su módulo (fuera del cuerpo del componente) y eso reventaba
// en runtime con "Cannot access 'C' before initialization" -- justo el bug
// que theme.ts evita de raíz).
import { C, HDR_BTN_PRIMARY, HDR_BTN_SECONDARY, HDR_BTN_PILL } from "./theme";
// PanelRegional importa { Header, KpiCard, ... } de vuelta desde este archivo
// (mismo ciclo App.tsx <-> otros módulos documentado arriba), pero nunca los
// usa en el top-level de su módulo -- solo dentro del cuerpo de la función
// PanelRegional(), que React recién ejecuta en render, momento en el que
// este módulo ya terminó de inicializar COUNTRY_DATA, JERARQUIA_NORMATIVA_
// DATA, etc. Por eso el import puede ser estático (no hace falta lazy()).
import PanelRegional from "./PanelRegional";
// Mismo criterio que PanelRegional para { Header, KpiCard, COUNTRY_TRAMITES_
// DATA, ... } -- ImpactoEconomico.tsx solo los usa dentro del cuerpo de su
// componente, nunca en el top-level de su módulo. Import estático seguro.
import ImpactoEconomico from "./ImpactoEconomico";
// Mismo criterio que PanelRegional / ImpactoEconomico -- IndiceIDR.tsx solo
// usa lo que importa de vuelta desde este archivo dentro del cuerpo de
// IndiceIDR(), nunca en el top-level de su módulo. Import estático seguro.
import IndiceIDR from "./IndiceIDR";
// Mismo criterio -- HallazgosFiltrados.tsx solo usa Header dentro del cuerpo
// de HallazgosFiltrados(), nunca en el top-level de su módulo. Import
// estático seguro. instrumentosMuestra.ts no importa nada de este archivo
// (self-contained, mismo criterio que components/ui/*.tsx) así que ese
// import no forma parte de ningún ciclo.
import { HallazgosFiltrados } from "./components/ui/HallazgosFiltrados";
// Mismo criterio -- HallazgosFiltradosBarreras.tsx/HallazgosFiltradosTramites.tsx
// (y el shell que ambas comparten con HallazgosFiltrados.tsx) solo usan lo
// que importan de vuelta desde este archivo dentro del cuerpo de sus
// respectivos componentes, nunca en el top-level de sus módulos.
import { HallazgosFiltradosBarreras } from "./components/ui/HallazgosFiltradosBarreras";
import { HallazgosFiltradosTramites } from "./components/ui/HallazgosFiltradosTramites";
import { INSTRUMENTOS_MUESTRA, EVOLUCION_ANIOS, EVOLUCION_FACTORES, DOC_ESTRUCTURA_PCT_MUESTRA, repartoProporcional } from "./data/instrumentosMuestra";
import {
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartBar,
  ChevronDown,
  ChevronRight,
  LogOut,
  Bell,
  Download,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  Globe,
  BarChart2,
  BookOpen,
  Settings,
  ClipboardList,
  Check,
  X,
  Menu,
  Eye,
  EyeOff,
  CircleCheck,
  Circle,
  AlertCircle,
  Info,
  ClipboardCheck,
  Inbox,
  CornerUpLeft,
  Ban,
  FilterX,
  Edit3,
} from "lucide-react";

// ─── Mobile hook ──────────────────────────────────────────────────────────────
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type Country = "Todos" | "Argentina" | "Bolivia" | "Chile" | "Ecuador" | "Perú";
type Section = "dashboard" | "barreras" | "tramites" | "comparativa" | "repositorio" | "impacto-economico" | "administracion" | "reportes" | "documentacion" | "revision"  | "indice";
export type UserRole = "administrador" | "usuario-bid" | "asesor" | "analista" | "validador";
const ROLE_LABEL: Record<UserRole, string> = {
  administrador: "Administrador",
  "usuario-bid": "Usuario BID",
  asesor: "Asesor (ESZ)",
  analista: "Analista jurídico-económico",
  validador: "Validador BID",
};
export type View =
  | { screen: "panel-regional" }
  | { screen: "impacto-economico" }
  | { screen: "country-dashboard"; country: string }
  | { screen: "barreras"; sector?: string }
  | { screen: "barrera-detail"; id: string }
  | { screen: "tramites"; sector?: string }
  | { screen: "tramite-detail"; id: string }
  | { screen: "distorsion-detail"; id: string }
  | { screen: "placeholder"; label: string }
  | { screen: "administracion"; tab?: string }
  | { screen: "reportes"; prefill?: ReportesPrefill }
  | { screen: "reporte-pdf"; context?: string }
  | { screen: "documentacion" }
  | { screen: "revision-repositorio" }
  | { screen: "revision-triage-modales" }
  | { screen: "revision-asesor-detalle"; id: string }
  | { screen: "revision-analista-checklist"; id: string }
  | { screen: "revision-decision-final"; id: string }
  | { screen: "revision-ajuste"; id: string }
  | { screen: "revision-devolver-analista"; id: string }
  | { screen: "revision-ver-hallazgo"; id: string }
  | { screen: "revision-log-errores" }
  | { screen: "revision-log-errores-detalle"; id: string }
  | { screen: "revision-notificaciones" }
  | { screen: "indice" }
  | { screen: "hallazgos-filtrados"; filtros: Record<string, string> }
  | { screen: "hallazgos-filtrados-barreras"; filtros: Record<string, string> }
  | { screen: "hallazgos-filtrados-tramites"; filtros: Record<string, string> };
type AuthView = "login" | "recover" | "recover-sent" | "recover-new" | "recover-confirmed" | "recover-expired";

type ReportesPrefill = {
  tipoHallazgo?: "distorsion" | "carga";
  pais?: Country;
  sectores?: string[];
  eje?: string;
  subdimDistorsion?: string;
  severidades?: string[];
  entidad?: string;
  tipoCarga?: string;
  subdimCarga?: string;
  tipoTramite?: string;
};

// ─── Colours ──────────────────────────────────────────────────────────────────
// C se importa de ./theme (ver comentario junto a los imports, arriba).
// `export { C }` (no solo `import`) para no romper a los archivos lazy de
// revision/* que hoy hacen `import { C } from "../App"`.
export { C };

const SEVERITY_COLOR: Record<string, string> = {
  Crítico: C.critico,
  Alto: C.alto,
  Mediano: C.mediano,
  Bajo: C.bajo,
};

// Rampa categórica — rankings y series sin semántica de severidad
const CAT = ["#26456B", "#3E6E9E", "#5E8FC2", "#7FA8D4", "#A0C1E0"];

// ─── Data ─────────────────────────────────────────────────────────────────────
export const COUNTRY_DATA: Record<string, { barreras: number; criticas: number; tramites: number; costo: string; sectores: number }> = {
  Argentina: { barreras: 698, criticas: 94, tramites: 312, costo: "USD 13.1 M", sectores: 6 },
  Bolivia:   { barreras: 632, criticas: 87, tramites: 428, costo: "USD 11.2 M", sectores: 6 },
  Chile:     { barreras: 445, criticas: 48, tramites: 195, costo: "USD 7.1 M",  sectores: 4 },
  Ecuador:   { barreras: 581, criticas: 68, tramites: 221, costo: "USD 11.7 M", sectores: 6 },
  Perú:      { barreras: 534, criticas: 56, tramites: 280, costo: "USD 9.4 M",  sectores: 5 },
};

// Lista real de países activos (sin "Todos") — fuente única para Panel Regional
// y cualquier otra pantalla que necesite iterar/contar países reales.
export const COUNTRIES: Country[] = Object.keys(COUNTRY_DATA) as Country[];

// ─── Periodo de análisis (compartido) ──────────────────────────────────────────
// Antes esto era el texto fijo "enero 2015 – marzo 2026" repetido en cada
// pantalla (BandaCobertura de Panel País, ReportesScreen/ReportePDFScreen,
// las bandas informativas de Impacto Económico e Índice/IDR, etc.). Ahora es
// un período POR PAÍS, editable desde Administración → Catálogos, expuesto
// vía Context para que cualquier pantalla (dentro o fuera de App.tsx) lo lea
// sin duplicar el estado ni pasarlo a mano por props en cada nivel.
export type PeriodoAnalisis = { desde: string; hasta: string }; // "YYYY-MM"
export type PeriodosAnalisisMap = Record<Exclude<Country, "Todos">, PeriodoAnalisis>;

// Mismos valores ya hardcodeados en el resto de la plataforma -- a propósito,
// para que nada cambie visualmente hasta que alguien edite un país puntual
// desde Administración.
const PERIODOS_ANALISIS_DEFAULT: PeriodosAnalisisMap = {
  Argentina: { desde: "2015-01", hasta: "2026-03" },
  Bolivia:   { desde: "2015-01", hasta: "2026-03" },
  Chile:     { desde: "2015-01", hasta: "2026-03" },
  Ecuador:   { desde: "2015-01", hasta: "2026-03" },
  Perú:      { desde: "2015-01", hasta: "2026-03" },
};

const MESES_LARGOS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// "2015-01" -> "enero 2015"
function formatearMesAnio(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  return `${MESES_LARGOS_ES[(m - 1 + 12) % 12]} ${y}`;
}

// { desde: "2015-01", hasta: "2026-03" } -> "enero 2015 – marzo 2026"
export function formatearPeriodo(periodo: PeriodoAnalisis): string {
  return `${formatearMesAnio(periodo.desde)} – ${formatearMesAnio(periodo.hasta)}`;
}

// Para vistas "Regional"/"Todos los países": el rango que cubre a los 5
// países (mínimo de todos los "desde", máximo de todos los "hasta"). Las
// cadenas "YYYY-MM" ordenan igual lexicográfica que cronológicamente, así
// que un sort() alcanza, sin parsear fechas.
export function periodoRegional(periodos: PeriodosAnalisisMap): PeriodoAnalisis {
  const entradas = Object.values(periodos);
  const desdes = entradas.map(e => e.desde).sort();
  const hastas = entradas.map(e => e.hasta).sort();
  return { desde: desdes[0], hasta: hastas[hastas.length - 1] };
}

type PeriodoAnalisisContextValue = {
  periodosAnalisis: PeriodosAnalisisMap;
  setPeriodoAnalisisPais: (pais: Exclude<Country, "Todos">, periodo: PeriodoAnalisis) => void;
};

const PeriodoAnalisisContext = createContext<PeriodoAnalisisContextValue | null>(null);

export function PeriodoAnalisisProvider({ children }: { children: React.ReactNode }) {
  const [periodosAnalisis, setPeriodosAnalisis] = useState<PeriodosAnalisisMap>(PERIODOS_ANALISIS_DEFAULT);
  const setPeriodoAnalisisPais = (pais: Exclude<Country, "Todos">, periodo: PeriodoAnalisis) =>
    setPeriodosAnalisis(prev => ({ ...prev, [pais]: periodo }));
  const value = useMemo(() => ({ periodosAnalisis, setPeriodoAnalisisPais }), [periodosAnalisis]);
  return <PeriodoAnalisisContext.Provider value={value}>{children}</PeriodoAnalisisContext.Provider>;
}

// Lee/edita el periodo de análisis compartido. Debe usarse dentro de
// <PeriodoAnalisisProvider> (envuelve todo App(), ver más abajo) -- mismo
// criterio que useRevision()/<RevisionProvider> en revision/store.tsx.
export function usePeriodoAnalisis(): PeriodoAnalisisContextValue {
  const ctx = useContext(PeriodoAnalisisContext);
  if (!ctx) throw new Error("usePeriodoAnalisis() debe usarse dentro de <PeriodoAnalisisProvider>.");
  return ctx;
}

// Cobertura % por país — dato de muestra, sin fuente real todavía.
// TODO: reemplazar con dato real cuando exista un campo de cobertura en el modelo de datos.
export const COBERTURA_MUESTRA: Record<Exclude<Country, "Todos">, number> = {
  Argentina: 92,
  Bolivia: 88,
  Chile: 95,
  Ecuador: 85,
  Perú: 90,
};

// ─── Panel País — datos derivados y de muestra ─────────────────────────────────
// Proporción N2–N6 usada tanto acá como en Panel Regional (210/486/512/398/236
// sobre un total de 1,842). dato de muestra — pendiente valores reales N2–N6
// con Franco/Juanjo.
const JERARQUIA_N2N6_LABELS = ["N2 Legislativo", "N3 Reglamentario", "N4 Resolutivo / Agencias", "N5 Técnico-operativo", "N6 Procedimental/Trámites"];
const JERARQUIA_N2N6_RATIOS = [0.114, 0.264, 0.278, 0.216, 0.128];

// Reparte totalInstrumentos entre los 5 niveles N2–N6 según JERARQUIA_N2N6_RATIOS,
// ajustando el último nivel para que la suma cuadre exacto con el total.
function buildJerarquiaN2N6(totalInstrumentos: number): BarrasComposicionCategoria[] {
  const valores = JERARQUIA_N2N6_RATIOS.map(r => Math.round(totalInstrumentos * r));
  const sumaSinUltimo = valores.slice(0, -1).reduce((s, v) => s + v, 0);
  valores[valores.length - 1] = totalInstrumentos - sumaSinUltimo;
  return JERARQUIA_N2N6_LABELS.map((nombre, i) => ({
    nombre,
    total: valores[i],
    componentes: [{ nombre, valor: valores[i] }],
  }));
}

// Curva histórica de instrumentos — dato de muestra, no hay snapshot histórico
// real todavía. TODO: reemplazar por valores reales por año cuando existan.
// EVOLUCION_ANIOS/EVOLUCION_FACTORES vienen de data/instrumentosMuestra.ts —
// fuente única compartida con el campo `año` de INSTRUMENTOS_MUESTRA (ver
// AÑO_BUCKET_RANGOS ahí), para que esta curva y ese catálogo describan la
// misma evolución.
function buildEvolucion(totalActual: number): { anio: number; total: number; segmentos: { nombre: string; valor: number; color: string }[] }[] {
  return EVOLUCION_ANIOS.map((anio, i) => {
    const total = Math.round(totalActual * EVOLUCION_FACTORES[i]);
    const niveles = buildJerarquiaN2N6(total);
    return {
      anio,
      total,
      segmentos: niveles.map((n, j) => ({ nombre: n.nombre, valor: n.total, color: CAT[j % CAT.length] })),
    };
  });
}

// Trámites y respaldo normativo — dato de muestra, pendiente definir metodología
// real. Se aplican sobre COUNTRY_DATA[país].tramites (real) ajustando el último
// segmento para que la suma cuadre exacto con el total real de trámites.
const RESPALDO_RATIOS = { conRespaldo: 0.779, sinRespaldo: 0.221 };
const TIPO_USUARIO_RATIOS = { empresarial: 0.471, ciudadano: 0.393, mixto: 0.136 };

// % no estructurado por nivel N2–N6 (mismo orden) — dato de muestra, igual para
// los 5 países por ahora. Viene de data/instrumentosMuestra.ts -- fuente única
// compartida con el campo `estructura` de INSTRUMENTOS_MUESTRA.

// IRR general por país en escala 0–100 — dato de muestra, sin fuente real.
// TODO: falta decidir si esta escala (0–100) o la escala 1–4 de irrPromedio
// (COUNTRY_BARRERAS_DATA / KpiCard "IRR promedio" en BarrerasScreen) es la
// oficial — son dos escalas conviviendo hoy.
// Exportado: es el mismo "Puntaje general" (0–100) que consume IndiceIDR.tsx
// para el KPI y la grilla "IDR por país" — no hay un IDR_GENERAL_MUESTRA
// separado, es este mismo dato (visible como "IDR", interno como IRR, ver
// PROJECT.md / conversación sobre el rebrand IRR → IDR de solo texto visible).
export const IRR_GENERAL_MUESTRA: Record<Exclude<Country, "Todos">, number> = {
  Argentina: 58.4,
  Bolivia: 61.3,
  Chile: 66.0,
  Ecuador: 55.7,
  Perú: 63.8,
};

// Proporción de hallazgos detectados que efectivamente se usan en el cálculo
// del IDR, tras excluir los sin fuente trazable o en log_errores — dato de
// muestra, la regla real de exclusión ya está descrita en el pie de
// metodología de IndiceIDR.tsx, falta implementarla contra datos reales.
// TODO: reemplazar por el cálculo real (fuente trazable / log_errores) cuando
// exista ese cruce con los datos de scraping/trazabilidad.
export const IDR_USADAS_RATIO_MUESTRA = 0.71;

// Fuentes oficiales / procesadas / entidades emisoras por país — dato de
// muestra, sin fuente real (mismo pendiente que Panel Regional).
const FUENTES_MUESTRA: Record<Exclude<Country, "Todos">, { oficiales: number; procesadas: number; entidadesEmisoras: number }> = {
  Argentina: { oficiales: 6, procesadas: 5, entidadesEmisoras: 9 },
  Bolivia:   { oficiales: 5, procesadas: 4, entidadesEmisoras: 8 },
  Chile:     { oficiales: 3, procesadas: 3, entidadesEmisoras: 5 },
  Ecuador:   { oficiales: 5, procesadas: 4, entidadesEmisoras: 7 },
  Perú:      { oficiales: 4, procesadas: 3, entidadesEmisoras: 6 },
};

// Entidades gestoras por país — derivado de COUNTRY_DATA[país].sectores (real),
// no hay fuente propia todavía. dato de muestra.
const ENTIDADES_GESTORAS_MUESTRA: Record<Exclude<Country, "Todos">, number> = COUNTRIES.reduce((acc, pais) => {
  acc[pais as Exclude<Country, "Todos">] = Math.round(COUNTRY_DATA[pais].sectores * 1.6);
  return acc;
}, {} as Record<Exclude<Country, "Todos">, number>);

// Instrumentos por cantidad de palabras, 5 valores por nivel N2→N6 (decrecientes)
// — dato de muestra.
const INSTRUMENTOS_POR_PALABRAS_MUESTRA: Record<Exclude<Country, "Todos">, number[]> = {
  Argentina: [35, 29, 26, 24, 21],
  Bolivia:   [26, 22, 20, 18, 16],
  Chile:     [29, 25, 22, 21, 18],
  Ecuador:   [28, 23, 21, 19, 17],
  Perú:      [34, 29, 26, 24, 21],
};

// Fuentes y trazabilidad por país, 4 filas de muestra c/u — dato de muestra,
// sin fuente real. TODO: definir si esto se conecta a un catálogo real de
// instrumentos individuales (hoy el modelo de datos solo tiene agregados).
const FUENTES_TRAZABILIDAD_MUESTRA: Record<Exclude<Country, "Todos">, {
  fuente: string; estado: "Completo" | "Parcial" | "Pendiente"; ultimaCaptura: string; errores: number | null; capturados: number; totalEsperado: number;
}[]> = {
  Argentina: [
    { fuente: "Gaceta Oficial de Argentina", estado: "Completo",  ultimaCaptura: "12 mar 2026", errores: null, capturados: 128, totalEsperado: 128 },
    { fuente: "Congreso de la Nación",       estado: "Parcial",   ultimaCaptura: "05 mar 2026", errores: 3,    capturados: 54,  totalEsperado: 61  },
    { fuente: "Ministerio de Economía",      estado: "Completo",  ultimaCaptura: "12 mar 2026", errores: null, capturados: 76,  totalEsperado: 76  },
    { fuente: "AFIP",                        estado: "Pendiente", ultimaCaptura: "20 feb 2026", errores: null, capturados: 0,   totalEsperado: 42  },
  ],
  Bolivia: [
    { fuente: "Gaceta Oficial de Bolivia",             estado: "Completo",  ultimaCaptura: "12 mar 2026", errores: null, capturados: 112, totalEsperado: 112 },
    { fuente: "Asamblea Legislativa Plurinacional",    estado: "Parcial",   ultimaCaptura: "04 mar 2026", errores: 5,    capturados: 48,  totalEsperado: 58  },
    { fuente: "Ministerio de Economía y Finanzas Públicas", estado: "Completo", ultimaCaptura: "12 mar 2026", errores: null, capturados: 69, totalEsperado: 69 },
    { fuente: "SENAPI",                                 estado: "Pendiente", ultimaCaptura: "18 feb 2026", errores: null, capturados: 0,   totalEsperado: 33  },
  ],
  Chile: [
    { fuente: "Diario Oficial de Chile",                    estado: "Completo",  ultimaCaptura: "12 mar 2026", errores: null, capturados: 96, totalEsperado: 96 },
    { fuente: "Congreso Nacional",                          estado: "Parcial",   ultimaCaptura: "06 mar 2026", errores: 2,    capturados: 41, totalEsperado: 47 },
    { fuente: "Ministerio de Economía, Fomento y Turismo",  estado: "Completo",  ultimaCaptura: "12 mar 2026", errores: null, capturados: 58, totalEsperado: 58 },
    { fuente: "INAPI",                                      estado: "Pendiente", ultimaCaptura: "22 feb 2026", errores: null, capturados: 0,  totalEsperado: 29 },
  ],
  Ecuador: [
    { fuente: "Registro Oficial de Ecuador",                 estado: "Completo",  ultimaCaptura: "12 mar 2026", errores: null, capturados: 101, totalEsperado: 101 },
    { fuente: "Asamblea Nacional",                           estado: "Parcial",   ultimaCaptura: "05 mar 2026", errores: 4,    capturados: 44,  totalEsperado: 52  },
    { fuente: "Ministerio de Producción, Comercio Exterior", estado: "Completo",  ultimaCaptura: "12 mar 2026", errores: null, capturados: 63,  totalEsperado: 63  },
    { fuente: "SENADI",                                      estado: "Pendiente", ultimaCaptura: "19 feb 2026", errores: null, capturados: 0,   totalEsperado: 31  },
  ],
  Perú: [
    { fuente: "Gaceta Oficial de Perú",  estado: "Completo",  ultimaCaptura: "12 mar 2026", errores: null, capturados: 105, totalEsperado: 105 },
    { fuente: "Asamblea Legislativa",    estado: "Parcial",   ultimaCaptura: "05 mar 2026", errores: 3,    capturados: 45,  totalEsperado: 53  },
    { fuente: "Ministerio de Economía",  estado: "Completo",  ultimaCaptura: "12 mar 2026", errores: null, capturados: 62,  totalEsperado: 62  },
    { fuente: "SENAPI",                  estado: "Pendiente", ultimaCaptura: "21 feb 2026", errores: null, capturados: 0,   totalEsperado: 30  },
  ],
};

// Tabla exploratoria por país, 3 filas de muestra c/u — dato de muestra, sin
// fuente real (mismo pendiente de catálogo real señalado arriba).
const TABLA_EXPLORATORIA_MUESTRA: Record<Exclude<Country, "Todos">, {
  nombre: string; tipo: string; entidad: string; sector: string; año: number; jerarquia: string; vigencia: "Vigente" | "Por confirmar"; estado: "Analizado" | "Procesado";
}[]> = {
  Argentina: [
    { nombre: "Decreto 1188-A",                    tipo: "Decreto",               entidad: "Min. de Economía y Finanzas Públicas", sector: "Servicios Financieros y de Seguros", año: 2021, jerarquia: "Reglamentario",  vigencia: "Vigente",       estado: "Analizado" },
    { nombre: "Ley de Inversión Extranjera Art. 5", tipo: "Ley",                   entidad: "Congreso de la Nación",                 sector: "Construcción y Obra Pública",        año: 2018, jerarquia: "Legal",          vigencia: "Vigente",       estado: "Analizado" },
    { nombre: "Res. MEM-0012",                      tipo: "Resolución",            entidad: "Min. de Desarrollo Productivo",         sector: "Textil y Confección",                año: 2023, jerarquia: "Administrativo", vigencia: "Por confirmar", estado: "Procesado" },
  ],
  Bolivia: [
    { nombre: "Decreto Ejecutivo 447", tipo: "Decreto",     entidad: "Alcaldía Municipal de La Paz",        sector: "Construcción y Obra Pública",      año: 2020, jerarquia: "Administrativo", vigencia: "Vigente",       estado: "Analizado" },
    { nombre: "Ley 843 Art. 92",       tipo: "Ley",         entidad: "Asamblea Legislativa Plurinacional",  sector: "Construcción y Obra Pública",      año: 2016, jerarquia: "Legal",          vigencia: "Vigente",       estado: "Analizado" },
    { nombre: "Res. IICA 2021-88",     tipo: "Resolución",  entidad: "ASFI",                                sector: "Servicios Financieros y de Seguros", año: 2021, jerarquia: "Reglamentario", vigencia: "Por confirmar", estado: "Procesado" },
  ],
  Chile: [
    { nombre: "D.S. 92",       tipo: "Decreto Supremo",     entidad: "Min. de Economía, Fomento y Turismo", sector: "Minería y Exportaciones",  año: 2022, jerarquia: "Reglamentario",  vigencia: "Vigente",       estado: "Analizado" },
    { nombre: "Ley 21.000",    tipo: "Ley",                 entidad: "Congreso Nacional",                    sector: "Servicios Financieros",    año: 2019, jerarquia: "Legal",          vigencia: "Vigente",       estado: "Analizado" },
    { nombre: "Res. Ex. 340",  tipo: "Resolución Exenta",   entidad: "SII",                                  sector: "Agroindustria",            año: 2024, jerarquia: "Administrativo", vigencia: "Por confirmar", estado: "Procesado" },
  ],
  Ecuador: [
    { nombre: "Decreto PCM-027-2022",   tipo: "Decreto",     entidad: "Presidencia de la República",               sector: "Textil y Confección",   año: 2022, jerarquia: "Reglamentario",  vigencia: "Vigente",       estado: "Analizado" },
    { nombre: "Ley ZOLI Art. 12",       tipo: "Ley",         entidad: "Asamblea Nacional",                          sector: "Textil y Confección",   año: 2017, jerarquia: "Legal",          vigencia: "Vigente",       estado: "Analizado" },
    { nombre: "Res. MEM-0012-2021",     tipo: "Resolución",  entidad: "Min. de Producción, Comercio Exterior",      sector: "Petróleo y Gas",        año: 2021, jerarquia: "Administrativo", vigencia: "Por confirmar", estado: "Procesado" },
  ],
  Perú: [
    { nombre: "D.S. 4523",  tipo: "Decreto Supremo",      entidad: "Ministerio de Economía y Finanzas", sector: "Servicios Financieros y de Seguros", año: 2022, jerarquia: "Reglamentario",  vigencia: "Vigente",       estado: "Analizado" },
    { nombre: "Ley 1178",   tipo: "Ley",                  entidad: "Congreso de la República",           sector: "Agroindustria",                      año: 2019, jerarquia: "Legal",          vigencia: "Vigente",       estado: "Analizado" },
    { nombre: "R.M. 220",   tipo: "Resolución Ministerial", entidad: "Ministerio de la Producción",      sector: "Manufactura",                        año: 2024, jerarquia: "Administrativo", vigencia: "Por confirmar", estado: "Procesado" },
  ],
};

const COUNTRY_COLORS: Record<string, string> = {
  Argentina: C.critico,
  Bolivia:   C.alto,
  Ecuador:   C.mediano,
  Perú:      C.steel2,
  Chile:     C.bajo,
};

const HN_SECTORES = [
  { sector: "Autopartes y Arneses", barreras: 90, altas: 46, criticas: 21, tramites: 71 },
  { sector: "Agroindustria Cafetalera", barreras: 65, altas: 45, criticas: 15, tramites: 64 },
  { sector: "Servicios Financieros y de Seguros", barreras: 72, altas: 33, criticas: 17, tramites: 57 },
  { sector: "Textil y Confección", barreras: 60, altas: 55, criticas: 3, tramites: 60 },
  { sector: "Construcción y Obra Pública", barreras: 45, altas: 19, criticas: 18, tramites: 63 },
  { sector: "Fibras Sintéticas", barreras: 65, altas: 31, criticas: 17, tramites: 45 },
];

type SectorEntry = { sector: string; barreras: number; altas: number; criticas: number; tramites: number; analizado: boolean };
const COUNTRY_SECTORS: Record<string, SectorEntry[]> = {
  Bolivia: [
    { sector: "Autopartes y Arneses",                   barreras: 90, altas: 46, criticas: 21, tramites: 71, analizado: true },
    { sector: "Agroindustria Cafetalera",                barreras: 65, altas: 45, criticas: 15, tramites: 64, analizado: true },
    { sector: "Servicios Financieros y de Seguros",      barreras: 72, altas: 33, criticas: 17, tramites: 57, analizado: true },
    { sector: "Textil y Confección",                     barreras: 60, altas: 55, criticas:  3, tramites: 60, analizado: true },
    { sector: "Construcción y Obra Pública",             barreras: 45, altas: 19, criticas: 18, tramites: 63, analizado: true },
    { sector: "Fibras Sintéticas",                       barreras: 65, altas: 31, criticas: 17, tramites: 45, analizado: true },
    { sector: "Energías Renovables",                     barreras:  0, altas:  0, criticas:  0, tramites:  0, analizado: false },
    { sector: "Minería y Metalurgia",                    barreras:  0, altas:  0, criticas:  0, tramites:  0, analizado: false },
  ],
  Argentina: [
    { sector: "Agroindustria y Commodities",             barreras:148, altas: 72, criticas: 22, tramites: 68, analizado: true },
    { sector: "Manufactura Automotriz",                  barreras:121, altas: 58, criticas: 18, tramites: 55, analizado: true },
    { sector: "Servicios Financieros",                   barreras: 98, altas: 44, criticas: 14, tramites: 49, analizado: true },
    { sector: "Tecnología e Innovación",                 barreras: 85, altas: 39, criticas: 12, tramites: 40, analizado: true },
    { sector: "Construcción",                            barreras: 76, altas: 28, criticas: 17, tramites: 52, analizado: true },
    { sector: "Farmacéutico y Salud",                    barreras: 70, altas: 33, criticas: 11, tramites: 48, analizado: true },
    { sector: "Logística y Transporte",                  barreras:  0, altas:  0, criticas:  0, tramites:  0, analizado: false },
    { sector: "Turismo y Hotelería",                     barreras:  0, altas:  0, criticas:  0, tramites:  0, analizado: false },
  ],
  Chile: [
    { sector: "Minería y Exportaciones",                 barreras:105, altas: 50, criticas: 13, tramites: 51, analizado: true },
    { sector: "Agroindustria",                           barreras: 88, altas: 40, criticas: 10, tramites: 43, analizado: true },
    { sector: "Servicios Financieros",                   barreras: 76, altas: 34, criticas:  9, tramites: 38, analizado: true },
    { sector: "Tecnología",                              barreras: 62, altas: 27, criticas:  8, tramites: 32, analizado: true },
    { sector: "Energías Renovables",                     barreras: 55, altas: 22, criticas:  8, tramites: 31, analizado: true },
    { sector: "Retail y Comercio",                       barreras:  0, altas:  0, criticas:  0, tramites:  0, analizado: false },
    { sector: "Acuicultura",                             barreras:  0, altas:  0, criticas:  0, tramites:  0, analizado: false },
  ],
  Ecuador: [
    { sector: "Petróleo y Gas",                          barreras:122, altas: 55, criticas: 17, tramites: 49, analizado: true },
    { sector: "Agroindustria Bananera",                  barreras: 95, altas: 43, criticas: 13, tramites: 41, analizado: true },
    { sector: "Flores y Exportaciones",                  barreras: 84, altas: 38, criticas: 11, tramites: 37, analizado: true },
    { sector: "Manufactura",                             barreras: 78, altas: 32, criticas: 10, tramites: 45, analizado: true },
    { sector: "Turismo",                                 barreras: 62, altas: 24, criticas:  8, tramites: 29, analizado: true },
    { sector: "Pesca y Acuicultura",                     barreras: 55, altas: 20, criticas:  9, tramites: 20, analizado: true },
    { sector: "Servicios Digitales",                     barreras:  0, altas:  0, criticas:  0, tramites:  0, analizado: false },
    { sector: "Construcción",                            barreras:  0, altas:  0, criticas:  0, tramites:  0, analizado: false },
  ],
  Perú: [
    { sector: "Minería",                                 barreras:118, altas: 52, criticas: 14, tramites: 55, analizado: true },
    { sector: "Agroindustria",                           barreras: 94, altas: 41, criticas: 12, tramites: 46, analizado: true },
    { sector: "Textil y Confección",                     barreras: 80, altas: 36, criticas: 10, tramites: 41, analizado: true },
    { sector: "Manufactura",                             barreras: 72, altas: 30, criticas: 10, tramites: 60, analizado: true },
    { sector: "Turismo y Gastronomía",                   barreras: 60, altas: 24, criticas:  8, tramites: 38, analizado: true },
    { sector: "Pesca",                                   barreras:  0, altas:  0, criticas:  0, tramites:  0, analizado: false },
    { sector: "Gas Natural",                             barreras:  0, altas:  0, criticas:  0, tramites:  0, analizado: false },
  ],
};

const HN_TIPOS_NEW = [
  { name: "Entrada",    value: 187, color: C.steel3 },
  { name: "Operación", value: 142, color: C.steel3 },
];

const IRR_BY_CLASIFICACION = {
  "Entrada": [
    { name: "4 · Crítico", value: 41, color: C.critico },
    { name: "3 · Alto",    value: 96, color: C.alto },
    { name: "2 · Mediano", value: 38, color: C.mediano },
    { name: "1 · Bajo",    value: 12, color: C.bajo },
  ],
  "Operación": [
    { name: "4 · Crítico", value: 33, color: C.critico },
    { name: "3 · Alto",    value: 71, color: C.alto },
    { name: "2 · Mediano", value: 29, color: C.mediano },
    { name: "1 · Bajo",    value: 9,  color: C.bajo },
  ],
};

// Barreras data for Agroindustria Cafetalera
// Campos nuevos (idHallazgo, pais, anio, entidad, enlaceOficial, tipoRestriccion,
// canalTransmision, afectacionMipyme, validacion, accionSugerida) en cada
// barrera de BARRERAS_CAFE/BARRERAS_TEXTIL: dato de muestra, sin fuente real
// todavía. TODO: definir de dónde saldrán realmente (scraping, panel de
// validación HITL real, etc.) y conectar validacion.* con el store real del
// módulo de Revisión/HITL en vez de datos sueltos por barrera.
const BARRERAS_CAFE = [
  {
    id: "bloqueo-renovacion",
    titulo: "Bloqueo por Renovación de Registros",
    severidad: "Crítico",
    sector: "Agroindustria Cafetalera",
    instrumento: "Reglamento General de Registros Sanitarios",
    tramitesAfectados: ["cert-exportacion", "registro-sanitario"],
    clasificacion: "Operación",
    subdimension: "Competencia",
    jerarquia: "Reglamentario",
    idHallazgo: "BOL-BAR-0842",
    pais: "Bolivia" as Country,
    anio: 2022,
    entidad: "ARSA — Agencia de Regulación Sanitaria",
    enlaceOficial: "gaceta.gob.bo/normas/reglamento-4521",
    tipoRestriccion: "Certificación previa obligatoria",
    canalTransmision: "Tiempo/incertidumbre",
    afectacionMipyme: "Alta" as const,
    accionCategoria: "Eliminar" as const,
    fuente: "Gaceta Oficial de Bolivia" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Crítico" as const,
      estadoHitl: "Publicado" as const,
      comentarioBID: "Confirmado como barrera crítica: bloqueo total de despacho sin alternativa operativa.",
      comentarioConsultor: "Recomendamos declaración jurada digital con verificación ex-post para no interrumpir cadenas de exportación.",
      comentarioGobierno: "ARSA evalúa la propuesta; pendiente de aprobación por Directorio.",
    },
    accionSugerida: {
      accion: "Sustituir por declaración jurada con verificación posterior",
      prioridad: "Alta" as const,
      tipoCambioRequerido: "Reglamentario · sin pasar por el legislativo",
      factibilidad: "Alta" as const,
      objetivoLegitimo: "Sí, objetivo válido · carga desproporcionada",
    },
    descripcion: "Se prohíbe procesar o despachar lotes de café para exportación ante demoras puramente administrativas en la renovación del registro sanitario, paralizando contenedores en puerto a pesar del historial de cumplimiento.",
    diagnostico: "La exigencia de registro sanitario vigente como condición para despacho bloquea exportaciones aun cuando la renovación se encuentre en trámite y el exportador tenga historial de cumplimiento. Esto genera pérdidas estimadas por contenedores paralizados en puerto, afectando competitividad y generando costos financieros adicionales por almacenaje prolongado.",
    textNormativo: `Artículo 47. — Del despacho de productos alimenticios para exportación.\n\nNingún lote de producto alimenticio destinado a la exportación podrá ser procesado, empacado o despachado sin que el titular cuente con registro sanitario vigente y en plena validez a la fecha de emisión de la guía de tránsito correspondiente. La autoridad sanitaria queda facultada para retener preventivamente cualquier envío en el que el registro sanitario del titular se encuentre en proceso de renovación, independientemente del historial de cumplimiento del exportador.\n\nEl incumplimiento de esta disposición acarreará la suspensión inmediata de operaciones de exportación hasta la regularización del registro, sin perjuicio de las sanciones administrativas correspondientes.`,
    pasajeResaltado: "Ningún lote de producto alimenticio destinado a la exportación podrá ser procesado, empacado o despachado sin que el titular cuente con registro sanitario vigente y en plena validez",
    reforma: {
      dice: "Ningún lote podrá ser despachado sin que el titular cuente con registro sanitario vigente a la fecha de emisión de la guía de tránsito.",
      debeDedir: "Los exportadores con registro en proceso de renovación y con historial de cumplimiento de al menos dos ciclos consecutivos podrán operar bajo declaración jurada digital ante la autoridad sanitaria, quien dispondrá de 30 días para resolver la renovación sin suspensión de operaciones.",
      palanca: "Simplificación / Control ex-post",
    },
  },
  {
    id: "restriccion-operadores",
    titulo: "Restricción a Operadores Sin Planta",
    severidad: "Crítico",
    sector: "Agroindustria Cafetalera",
    instrumento: "Ley de Regulación de Exportaciones de Café PCM-2019",
    tramitesAfectados: ["registro-exportador"],
    clasificacion: "Entrada",
    subdimension: "Comercio",
    jerarquia: "Legal",
    idHallazgo: "BOL-BAR-0843",
    pais: "Bolivia" as Country,
    anio: 2019,
    entidad: "SENAVEX",
    enlaceOficial: "gaceta.gob.bo/normas/ley-pcm-2019-045",
    tipoRestriccion: "Requisito de infraestructura propia",
    canalTransmision: "Modelo de negocio",
    afectacionMipyme: "Alta" as const,
    accionCategoria: "Simplificar" as const,
    fuente: "Asamblea Legislativa Plurinacional" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Alto" as const,
      estadoHitl: "Por decidir" as const,
      comentarioBID: "Impacto significativo en modelos de maquila; validar alcance real de casos afectados.",
      comentarioConsultor: "Sugerimos permitir maquila certificada como alternativa formal a la planta propia.",
      comentarioGobierno: "En revisión por el Ministerio de Desarrollo Productivo.",
    },
    accionSugerida: {
      accion: "Reconocer convenios de maquila certificada como alternativa a la planta propia",
      prioridad: "Alta" as const,
      tipoCambioRequerido: "Legal · requiere modificación de ley",
      factibilidad: "Media" as const,
      objetivoLegitimo: "Sí, objetivo válido · medio desproporcionado",
    },
    descripcion: "Se restringe la inscripción como tostador-exportador a empresas que no poseen instalaciones propias y operan mediante arrendamiento de capacidad instalada (modelo de maquila).",
    diagnostico: "El marco normativo desconoce los modelos de negocio modernos de tostadores que operan por maquila en plantas de terceros certificadas. Esta restricción impide el acceso al mercado internacional de exportadores artesanales y medianos que no pueden costear instalaciones propias.",
    textNormativo: `Artículo 12. — Requisitos para inscripción como exportador de café tostado.\n\nPara obtener la inscripción en el Registro de Exportadores de Café Tostado, el solicitante deberá acreditar la propiedad o arrendamiento a largo plazo (mínimo 5 años) de las instalaciones de tostado, incluyendo equipos industriales propios. No se admitirá la inscripción de personas naturales o jurídicas que operen mediante convenios de capacidad compartida, maquila o arrendamiento de capacidad instalada de terceros.\n\nEsta disposición busca garantizar la trazabilidad y calidad del café de exportación, vinculando la responsabilidad del exportador a instalaciones físicas verificables.`,
    pasajeResaltado: "No se admitirá la inscripción de personas naturales o jurídicas que operen mediante convenios de capacidad compartida, maquila o arrendamiento de capacidad instalada de terceros.",
    reforma: {
      dice: "No se admitirá la inscripción de personas que operen mediante maquila o arrendamiento de capacidad instalada de terceros.",
      debeDedir: "Se reconocerá la inscripción de exportadores que cuenten con convenios de maquila con plantas certificadas por SENASA, presentando el contrato vigente y el plan de trazabilidad aprobado por la autoridad competente.",
      palanca: "Desregulación",
    },
  },
];

const BARRERAS_TEXTIL = [
  {
    id: "reportes-semestrales",
    titulo: "Reportes Semestrales Físicos",
    severidad: "Crítico",
    sector: "Textil y Confección",
    instrumento: "Decreto Ejecutivo PCM-027-2022",
    tramitesAfectados: ["declaracion-mensual-isv"],
    clasificacion: "Entrada",
    subdimension: "Competencia",
    jerarquia: "Reglamentario",
    idHallazgo: "BOL-BAR-0844",
    pais: "Bolivia" as Country,
    anio: 2022,
    entidad: "Secretaría de Finanzas",
    enlaceOficial: "gaceta.gob.bo/normas/decreto-pcm-027-2022",
    tipoRestriccion: "Reporte físico obligatorio",
    canalTransmision: "Costo administrativo",
    afectacionMipyme: "Media" as const,
    accionCategoria: "Sustituir" as const,
    fuente: "Ministerio de Economía y Finanzas Públicas" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Alto" as const,
      estadoHitl: "Etapa 3" as const,
      comentarioBID: "Carga administrativa duplicada confirmada; evaluar digitalización.",
      comentarioConsultor: "Proponemos transmisión electrónica vía portal SEFIN-Digital.",
      comentarioGobierno: "Pendiente de asignación a analista para revisión técnica.",
    },
    accionSugerida: {
      accion: "Digitalizar el reporte semestral vía portal SEFIN-Digital",
      prioridad: "Media" as const,
      tipoCambioRequerido: "Reglamentario · sin pasar por el legislativo",
      factibilidad: "Alta" as const,
      objetivoLegitimo: "Sí, objetivo válido · medio desproporcionado",
    },
    descripcion: "Exige entregar informes de operaciones en formato físico bajo riesgo de sanciones, duplicando la contabilidad.",
    diagnostico: "La obligación de reporte físico semestral duplica el esfuerzo administrativo en empresas que ya llevan contabilidad digital. Las sanciones por incumplimiento se aplican por igual a empresas ZOLI que operan con sistemas electrónicos avanzados.",
    textNormativo: `Artículo 9. — Obligación de reporte semestral de operaciones.\n\nLas empresas acogidas al régimen de Zona Libre de Industria y Comercio (ZOLI) deberán presentar ante la Secretaría de Finanzas, dentro de los primeros quince días hábiles de enero y julio de cada año, un informe físico y certificado por contador público colegiado de todas las operaciones realizadas en el semestre anterior.\n\nDicho informe deberá incluir inventario de materias primas, producción terminada, exportaciones realizadas y personal empleado. La falta de presentación oportuna del informe en formato físico y con la firma del contador certificado acarreará multas de hasta el 2% del valor de las exportaciones del período.`,
    pasajeResaltado: "deberán presentar ante la Secretaría de Finanzas... un informe físico y certificado por contador público colegiado",
    reforma: {
      dice: "Las empresas ZOLI deberán presentar un informe físico certificado ante la Secretaría de Finanzas.",
      debeDedir: "Las empresas ZOLI podrán transmitir electrónicamente sus informes semestrales a través del portal SEFIN-Digital, con firma electrónica avanzada. Los datos de exportación se importarán automáticamente desde el sistema aduanero SARAH.",
      palanca: "Digitalización",
    },
  },
];

// Trámites data
const TRAMITES_CAFE = [
  {
    id: "cert-exportacion",
    nombre: "Certificado de Exportación y de Origen",
    entidad: "Dirección General de Aduanas / IHCAFE",
    etapa: "Operación",
    tipo: "Empresarial",
    sector: "Agroindustria Cafetalera",
    prioritario: true,
    costo: { monetario: "USD 420/operación", tiempo: "11 h", frecuencia: "Alta (36 ops/año)", cargaTotal: "USD 15,120/año", plazoDias: 3 },
    barrerasAfectadas: ["bloqueo-renovacion"],
    diagnostico: "El proceso de certificación enlaza la emisión del certificado a la disponibilidad física exacta de sacos por lote de acopio, generando cuellos de botella en períodos de alta demanda y obligando al exportador a retrasar despachos ya acordados con compradores internacionales.",
    pasos: [
      { id: 1, nombre: "Identificación y comprensión de requisitos", descripcion: "Esfuerzo cognitivo para leer, interpretar y asimilar el marco legal, instructivos y fichas del trámite", friccion: false, tiempo: "30 min", costo: "USD 0" },
      { id: 2, nombre: "Generación de nueva información", descripcion: "Producción de documentos sustantivos desde cero (memorias, planes, diagramas) exigidos por la norma", friccion: false, tiempo: "1 h", costo: "USD 10" },
      { id: 3, nombre: "Recolección de información pre-existente", descripcion: "Búsqueda, impresión, fotocopiado y cotejo de documentos ya existentes en el archivo del solicitante.", friccion: true, friccionDetalle: "Se identifican requisitos nuevos excesivos y repetitivos, ya que pide un estudio especilizado que toma mucho tiempo de elaborar", simplificacion: "Se sugiere eliminar el requisito de estudio especializado para reducir el tiempo de esta actividad", tiempo: "3 h", costo: "USD 60" },
      { id: 4, nombre: "Reuniones con personal interno", descripcion: "Coordinación dentro de la organización para firmas de representación legal o validación del expediente", friccion: false, tiempo: "2 h", costo: "USD 80" },
      { id: 5, nombre: "Llenado de formatos y/o elaboración de solicitudes y reportes", descripcion: "Captura de datos en formularios gubernamentales físicos o plataformas electrónicas oficiales.", friccion: false, tiempo: "1 h", costo: "USD 120" },
      { id: 6, nombre: "Contratación y reuniones con servicios externos", descripcion: "Interacción logística para coordinar notarios, peritos o auditores exigidos por ley.", friccion: false, tiempo: "1.5 h", costo: "USD 70" },
      { id: 7, nombre: "Creación y administración de archivos de respaldo", descripcion: "Resguardo y ordenamiento de expedientes físicos/digitales para futuras inspecciones de la autoridad.", friccion: false, tiempo: "1 h", costo: "USD 50" },
      { id: 8, nombre: "Pagos, espera en oficinas públicas y translados", descripcion: "Fricción física por el canal de atención presencial: transporte, filas y transacciones físicas.", friccion: false, tiempo: "1 h", costo: "USD 30" },
    ],
  },
  {
    id: "registro-sanitario",
    nombre: "Obtención de Registro Sanitario de Alimentos",
    entidad: "ARSA — Agencia de Regulación Sanitaria",
    etapa: "Apertura",
    tipo: "Empresarial",
    sector: "Agroindustria Cafetalera",
    costo: { monetario: "USD 850/producto", tiempo: "18 h", frecuencia: "Baja (cada 5 años)", cargaTotal: "USD 850/producto" },
    barrerasAfectadas: ["bloqueo-renovacion"],
    diagnostico: "El proceso de registro sanitario trata cada presentación o empaque como un producto distinto, obligando a las empresas a repetir el trámite completo y pagar la tarifa íntegra por cada variación de empaque del mismo producto.",
    pasos: [
      { id: 1, nombre: "Identificación y comprensión de requisitos", descripcion: "Esfuerzo cognitivo para leer, interpretar y asimilar el marco legal, instructivos y fichas del trámite", friccion: false, tiempo: "30 min", costo: "USD 0" },
      { id: 2, nombre: "Generación de nueva información", descripcion: "Producción de documentos sustantivos desde cero (memorias, planes, diagramas) exigidos por la norma", friccion: false, tiempo: "1 h", costo: "USD 10" },
      { id: 3, nombre: "Recolección de información pre-existente", descripcion: "Búsqueda, impresión, fotocopiado y cotejo de documentos ya existentes en el archivo del solicitante.", friccion: true, friccionDetalle: "Se identifican requisitos nuevos excesivos y repetitivos, ya que pide un estudio especilizado que toma mucho tiempo de elaborar", simplificacion: "Se sugiere eliminar el requisito de estudio especializado para reducir el tiempo de esta actividad", tiempo: "3 h", costo: "USD 60" },
      { id: 4, nombre: "Reuniones con personal interno", descripcion: "Coordinación dentro de la organización para firmas de representación legal o validación del expediente", friccion: false, tiempo: "2 h", costo: "USD 80" },
      { id: 5, nombre: "Llenado de formatos y/o elaboración de solicitudes y reportes", descripcion: "Captura de datos en formularios gubernamentales físicos o plataformas electrónicas oficiales.", friccion: false, tiempo: "1 h", costo: "USD 120" },
      { id: 6, nombre: "Contratación y reuniones con servicios externos", descripcion: "Interacción logística para coordinar notarios, peritos o auditores exigidos por ley.", friccion: false, tiempo: "1.5 h", costo: "USD 70" },
      { id: 7, nombre: "Creación y administración de archivos de respaldo", descripcion: "Resguardo y ordenamiento de expedientes físicos/digitales para futuras inspecciones de la autoridad.", friccion: false, tiempo: "1 h", costo: "USD 50" },
      { id: 8, nombre: "Pagos, espera en oficinas públicas y translados", descripcion: "Fricción física por el canal de atención presencial: transporte, filas y transacciones físicas.", friccion: false, tiempo: "1 h", costo: "USD 30" },
    ],
  },
];

const TRAMITES_TEXTIL = [
  {
    id: "declaracion-mensual-isv",
    nombre: "Declaración Jurada Mensual de ISV",
    entidad: "Servicio de Administración de Rentas (SAR)",
    etapa: "Operación",
    tipo: "Empresarial",
    sector: "Textil y Confección",
    costo: { monetario: "USD 180/mes", tiempo: "6 h", frecuencia: "Mensual (12/año)", cargaTotal: "USD 2,160/año" },
    barrerasAfectadas: ["reportes-semestrales"],
    diagnostico: "El proceso exige reportar manualmente cada carnet de proveedor, repitiendo información que el Estado ya posee en sus propios registros de facturación electrónica.",
    pasos: [
      { id: 1, nombre: "Identificación y comprensión de requisitos", descripcion: "Esfuerzo cognitivo para leer, interpretar y asimilar el marco legal, instructivos y fichas del trámite", friccion: false, tiempo: "30 min", costo: "USD 0" },
      { id: 2, nombre: "Generación de nueva información", descripcion: "Producción de documentos sustantivos desde cero (memorias, planes, diagramas) exigidos por la norma", friccion: false, tiempo: "1 h", costo: "USD 10" },
      { id: 3, nombre: "Recolección de información pre-existente", descripcion: "Búsqueda, impresión, fotocopiado y cotejo de documentos ya existentes en el archivo del solicitante.", friccion: true, friccionDetalle: "Se identifican requisitos nuevos excesivos y repetitivos, ya que pide un estudio especilizado que toma mucho tiempo de elaborar", simplificacion: "Se sugiere eliminar el requisito de estudio especializado para reducir el tiempo de esta actividad", tiempo: "3 h", costo: "USD 60" },
      { id: 4, nombre: "Reuniones con personal interno", descripcion: "Coordinación dentro de la organización para firmas de representación legal o validación del expediente", friccion: false, tiempo: "2 h", costo: "USD 80" },
      { id: 5, nombre: "Llenado de formatos y/o elaboración de solicitudes y reportes", descripcion: "Captura de datos en formularios gubernamentales físicos o plataformas electrónicas oficiales.", friccion: false, tiempo: "1 h", costo: "USD 120" },
      { id: 6, nombre: "Contratación y reuniones con servicios externos", descripcion: "Interacción logística para coordinar notarios, peritos o auditores exigidos por ley.", friccion: false, tiempo: "1.5 h", costo: "USD 70" },
      { id: 7, nombre: "Creación y administración de archivos de respaldo", descripcion: "Resguardo y ordenamiento de expedientes físicos/digitales para futuras inspecciones de la autoridad.", friccion: false, tiempo: "1 h", costo: "USD 50" },
      { id: 8, nombre: "Pagos, espera en oficinas públicas y translados", descripcion: "Fricción física por el canal de atención presencial: transporte, filas y transacciones físicas.", friccion: false, tiempo: "1 h", costo: "USD 30" },
    ],
  },
];

// Plantilla estándar de 8 pasos — idéntica a la que ya usan TRAMITES_CAFE/
// TRAMITES_TEXTIL (mismo nombre/descripción en los 7 pasos sin fricción);
// solo el paso 3 (con fricción) se personaliza por trámite.
function pasosEstandarMuestra(friccionDetalle: string, simplificacion: string) {
  return [
    { id: 1, nombre: "Identificación y comprensión de requisitos", descripcion: "Esfuerzo cognitivo para leer, interpretar y asimilar el marco legal, instructivos y fichas del trámite", friccion: false, tiempo: "30 min", costo: "USD 0" },
    { id: 2, nombre: "Generación de nueva información", descripcion: "Producción de documentos sustantivos desde cero (memorias, planes, diagramas) exigidos por la norma", friccion: false, tiempo: "1 h", costo: "USD 10" },
    { id: 3, nombre: "Recolección de información pre-existente", descripcion: "Búsqueda, impresión, fotocopiado y cotejo de documentos ya existentes en el archivo del solicitante.", friccion: true, friccionDetalle, simplificacion, tiempo: "3 h", costo: "USD 60" },
    { id: 4, nombre: "Reuniones con personal interno", descripcion: "Coordinación dentro de la organización para firmas de representación legal o validación del expediente", friccion: false, tiempo: "2 h", costo: "USD 80" },
    { id: 5, nombre: "Llenado de formatos y/o elaboración de solicitudes y reportes", descripcion: "Captura de datos en formularios gubernamentales físicos o plataformas electrónicas oficiales.", friccion: false, tiempo: "1 h", costo: "USD 120" },
    { id: 6, nombre: "Contratación y reuniones con servicios externos", descripcion: "Interacción logística para coordinar notarios, peritos o auditores exigidos por ley.", friccion: false, tiempo: "1.5 h", costo: "USD 70" },
    { id: 7, nombre: "Creación y administración de archivos de respaldo", descripcion: "Resguardo y ordenamiento de expedientes físicos/digitales para futuras inspecciones de la autoridad.", friccion: false, tiempo: "1 h", costo: "USD 50" },
    { id: 8, nombre: "Pagos, espera en oficinas públicas y translados", descripcion: "Fricción física por el canal de atención presencial: transporte, filas y transacciones físicas.", friccion: false, tiempo: "1 h", costo: "USD 30" },
  ];
}

// Registros completos de muestra para las filas de TRAMITES_PRIORITARIOS_MUESTRA
// que no tienen trámite real correspondiente en TRAMITES_CAFE/TRAMITES_TEXTIL
// (Bolivia "Certificado de Exportación y de Origen" y "Declaración Jurada
// Mensual de ISV" SÍ lo tienen — no se duplican acá). Misma forma que un
// trámite real: id, nombre, entidad, tipo, etapa, sector, prioritario, costo,
// pasos, diagnostico, barrerasAfectadas. Se concatenan a ALL_TRAMITES más
// abajo para que TramiteDetail() los encuentre igual que a los reales, sin
// ninguna rama especial de código.
// dato de muestra — TODO: falta catálogo real de trámites individuales para
// Argentina, Chile, Ecuador y Perú (y estos 2 adicionales de Bolivia).
const TRAMITES_MUESTRA = [
  // dato de muestra
  {
    id: "certificado-de-origen-mercosur-ar",
    nombre: "Certificado de Origen Mercosur",
    entidad: "Dirección General de Aduanas",
    etapa: "Operación",
    tipo: "Empresarial",
    sector: "Agroindustria y Commodities",
    prioritario: true,
    costo: { monetario: "USD 380/operación", tiempo: "10 h", frecuencia: "Alta (30 ops/año)", cargaTotal: "USD 11,400/año", plazoDias: 4 },
    barrerasAfectadas: [],
    diagnostico: "El certificado de origen sigue exigiendo trámite físico paralelo al sistema aduanero digital, duplicando el esfuerzo del exportador y generando demoras que afectan el cumplimiento de plazos de embarque con compradores del Mercosur.",
    pasos: pasosEstandarMuestra(
      "Se exige presentar el certificado de origen en papel membretado con firma húmeda del despachante, aun cuando la operación completa se gestiona por el sistema informático María (Aduana digital).",
      "Aceptar firma electrónica avanzada del despachante y eliminar el requisito de papel membretado para operaciones ya validadas en el sistema aduanero digital."
    ),
  },
  // dato de muestra
  {
    id: "habilitacion-municipal-comercial-ar",
    nombre: "Habilitación Municipal Comercial",
    entidad: "Municipalidad de Buenos Aires",
    etapa: "Apertura",
    tipo: "Empresarial",
    sector: "Comercio y Servicios",
    prioritario: false,
    costo: { monetario: "USD 210/trámite", tiempo: "8 h", frecuencia: "Baja (1 vez, renovación cada 5 años)", cargaTotal: "USD 210/trámite", plazoDias: 20 },
    barrerasAfectadas: [],
    diagnostico: "La habilitación comercial depende de una inspección presencial con disponibilidad muy limitada, lo que retrasa la apertura de nuevos locales varias semanas más allá del tiempo administrativo del trámite en sí.",
    pasos: pasosEstandarMuestra(
      "La inspección previa de habilitación debe agendarse presencialmente y solo se realiza los días martes, generando esperas de hasta 6 semanas antes de poder operar.",
      "Habilitar agenda de inspección en línea con múltiples días disponibles y permitir operación provisional bajo declaración jurada mientras se programa la visita."
    ),
  },
  // dato de muestra
  {
    id: "registro-de-marca-y-producto-ar",
    nombre: "Registro de Marca y Producto",
    entidad: "INPI",
    etapa: "Apertura",
    tipo: "Empresarial",
    sector: "Manufactura y Consumo",
    prioritario: false,
    costo: { monetario: "USD 320/registro", tiempo: "6 h", frecuencia: "Baja (cada 10 años)", cargaTotal: "USD 320/registro", plazoDias: 240 },
    barrerasAfectadas: [],
    diagnostico: "El plazo de examen de fondo se extiende más de 8 meses sin distinguir entre solicitudes nuevas y renovaciones de marcas sin oposición, dejando a las empresas sin certeza jurídica sobre su marca durante ese período.",
    pasos: pasosEstandarMuestra(
      "El examen de fondo de la solicitud de marca se realiza en estricto orden de ingreso sin priorización posible, incluso para renovaciones de marcas ya registradas previamente.",
      "Crear una vía expedita de examen para renovaciones y marcas sin oposición de terceros, reduciendo el plazo de resolución de 240 a 60 días."
    ),
  },
  // dato de muestra
  {
    id: "declaracion-jurada-de-iva-ar",
    nombre: "Declaración Jurada de IVA",
    entidad: "AFIP",
    etapa: "Operación",
    tipo: "Empresarial",
    sector: "Multisectorial",
    prioritario: false,
    costo: { monetario: "USD 150/mes", tiempo: "5 h", frecuencia: "Mensual (12/año)", cargaTotal: "USD 1,800/año", plazoDias: 1 },
    barrerasAfectadas: [],
    diagnostico: "La declaración mensual duplica información que AFIP ya posee a través de la facturación electrónica, generando horas de trabajo administrativo evitables en un trámite de alta frecuencia.",
    pasos: pasosEstandarMuestra(
      "El aplicativo exige reingresar manualmente el detalle de comprobantes de proveedores que ya están cargados en el sistema de facturación electrónica de AFIP.",
      "Prellenar automáticamente el detalle de comprobantes desde el sistema de facturación electrónica, dejando solo la validación final a cargo del contribuyente."
    ),
  },
  // dato de muestra
  {
    id: "habilitacion-municipal-de-negocio-bo",
    nombre: "Habilitación Municipal de Negocio",
    entidad: "Alcaldía Municipal de La Paz",
    etapa: "Apertura",
    tipo: "Empresarial",
    sector: "Comercio y Servicios",
    prioritario: false,
    costo: { monetario: "USD 180/trámite", tiempo: "9 h", frecuencia: "Baja (1 vez, renovación anual)", cargaTotal: "USD 180/trámite", plazoDias: 25 },
    barrerasAfectadas: [],
    diagnostico: "La falta de un catastro digital de uso de suelo obliga a una verificación manual caso por caso, generando demoras de varias semanas antes de poder habilitar un nuevo local comercial.",
    pasos: pasosEstandarMuestra(
      "La verificación de compatibilidad de uso de suelo se realiza de forma manual cruzando planos físicos, sin un sistema de consulta digital por dirección.",
      "Digitalizar el catastro de uso de suelo para que la compatibilidad se verifique automáticamente al ingresar la dirección del local."
    ),
  },
  // dato de muestra — distinto del real "Obtención de Registro Sanitario de
  // Alimentos" (id "registro-sanitario"): el nombre no coincide exacto, así
  // que no se reusa ese id (ver TODO de la tarea anterior sobre este
  // near-miss).
  {
    id: "registro-sanitario-de-alimentos-arsa-bo",
    nombre: "Registro Sanitario de Alimentos (ARSA)",
    entidad: "ARSA — Agencia de Regulación Sanitaria",
    etapa: "Apertura",
    tipo: "Empresarial",
    sector: "Agroindustria Cafetalera",
    prioritario: false,
    costo: { monetario: "USD 850/producto", tiempo: "16 h", frecuencia: "Baja (cada 5 años)", cargaTotal: "USD 850/producto", plazoDias: 45 },
    barrerasAfectadas: [],
    diagnostico: "El registro trata cada variación de presentación como un producto distinto, obligando a las empresas a repetir el trámite y pagar la tarifa completa por cada cambio de empaque del mismo producto.",
    pasos: pasosEstandarMuestra(
      "Cada variación de presentación o tamaño de empaque del mismo producto requiere un registro sanitario completamente nuevo, con la tarifa íntegra.",
      "Permitir que las variaciones de empaque de un mismo producto ya registrado se notifiquen, sin exigir un nuevo registro completo."
    ),
  },
  // dato de muestra
  {
    id: "autorizacion-de-ampliacion-de-planta-cl",
    nombre: "Autorización de Ampliación de Planta",
    entidad: "Superintendencia del Medio Ambiente",
    etapa: "Expansión",
    tipo: "Empresarial",
    sector: "Industria y Manufactura",
    prioritario: true,
    costo: { monetario: "USD 640/trámite", tiempo: "22 h", frecuencia: "Baja (1 vez por proyecto)", cargaTotal: "USD 640/trámite", plazoDias: 90 },
    barrerasAfectadas: [],
    diagnostico: "La evaluación ambiental no distingue el tamaño ni el riesgo real de la ampliación, sometiendo a proyectos menores al mismo proceso extenso que exigen las inversiones de gran escala.",
    pasos: pasosEstandarMuestra(
      "Toda ampliación de planta debe pasar por evaluación de impacto ambiental completa, sin distinción entre ampliaciones menores de bajo riesgo y proyectos de gran escala.",
      "Crear una vía de evaluación ambiental expedita para ampliaciones menores que no incrementen significativamente las emisiones o el consumo de recursos."
    ),
  },
  // dato de muestra — nombre incluye la entidad para no colisionar con el
  // mismo trámite de Perú (mismo nombre base "Certificado de Origen para
  // Exportación", distinta entidad).
  {
    id: "certificado-de-origen-para-exportacion-aduanas-chile-cl",
    nombre: "Certificado de Origen para Exportación (Aduanas Chile)",
    entidad: "Dirección Nacional de Aduanas",
    etapa: "Operación",
    tipo: "Empresarial",
    sector: "Minería y Exportaciones",
    prioritario: false,
    costo: { monetario: "USD 300/operación", tiempo: "9 h", frecuencia: "Alta (28 ops/año)", cargaTotal: "USD 8,400/año", plazoDias: 3 },
    barrerasAfectadas: [],
    diagnostico: "La exigencia de firma física retrasa la emisión del certificado varios días en cada operación de exportación, un costo recurrente relevante dado el volumen alto de embarques anuales.",
    pasos: pasosEstandarMuestra(
      "El certificado exige la firma física del representante legal en la oficina de la Cámara de Comercio, sin opción de firma electrónica reconocida.",
      "Habilitar la firma electrónica avanzada para la emisión del certificado de origen, eliminando la necesidad de presencia física."
    ),
  },
  // dato de muestra
  {
    id: "patente-municipal-de-actividad-cl",
    nombre: "Patente Municipal de Actividad",
    entidad: "Municipalidad de Santiago",
    etapa: "Apertura",
    tipo: "Empresarial",
    sector: "Comercio y Servicios",
    prioritario: false,
    costo: { monetario: "USD 190/trámite", tiempo: "7 h", frecuencia: "Baja (renovación anual)", cargaTotal: "USD 190/trámite", plazoDias: 15 },
    barrerasAfectadas: [],
    diagnostico: "La ausencia de un canal digital de pago obliga a los contribuyentes a trasladarse presencialmente cada año solo para renovar una patente cuyo monto ya está determinado por el municipio.",
    pasos: pasosEstandarMuestra(
      "El pago y la renovación de la patente solo pueden hacerse de forma presencial en la tesorería municipal, sin opción de pago o renovación en línea.",
      "Habilitar el pago y la renovación de la patente municipal a través de la plataforma de pagos en línea del municipio."
    ),
  },
  // dato de muestra — nombre incluye la sigla del ente recaudador para no
  // colisionar con el mismo trámite de Ecuador (mismo nombre base
  // "Declaración Mensual de IVA", distinta entidad).
  {
    id: "declaracion-mensual-de-iva-sii-cl",
    nombre: "Declaración Mensual de IVA (SII)",
    entidad: "Servicio de Impuestos Internos (SII)",
    etapa: "Operación",
    tipo: "Empresarial",
    sector: "Multisectorial",
    prioritario: false,
    costo: { monetario: "USD 140/mes", tiempo: "4 h", frecuencia: "Mensual (12/año)", cargaTotal: "USD 1,680/año", plazoDias: 1 },
    barrerasAfectadas: [],
    diagnostico: "La declaración mensual duplica información que el SII ya recibe por la facturación electrónica, generando una carga administrativa recurrente evitable con un prellenado automático.",
    pasos: pasosEstandarMuestra(
      "El formulario exige reingresar el detalle de facturas de proveedores que el SII ya recibe a través de la facturación electrónica.",
      "Prellenar automáticamente el formulario con el detalle de facturación electrónica ya disponible en los sistemas del SII."
    ),
  },
  // dato de muestra
  {
    id: "certificado-fitosanitario-de-exportacion-ec",
    nombre: "Certificado Fitosanitario de Exportación",
    entidad: "Agrocalidad",
    etapa: "Operación",
    tipo: "Empresarial",
    sector: "Agroindustria Bananera",
    prioritario: true,
    costo: { monetario: "USD 260/operación", tiempo: "12 h", frecuencia: "Alta (40 ops/año)", cargaTotal: "USD 10,400/año", plazoDias: 2 },
    barrerasAfectadas: [],
    diagnostico: "La falta de agenda en línea para la inspección fitosanitaria obliga a los exportadores a coordinar visitas presenciales que frecuentemente retrasan el embarque en los puertos de salida.",
    pasos: pasosEstandarMuestra(
      "La inspección fitosanitaria previa al embarque solo puede solicitarse de forma presencial en la oficina regional de Agrocalidad, sin agenda en línea.",
      "Habilitar la solicitud y agenda de inspección fitosanitaria en línea, con confirmación automática de horario disponible."
    ),
  },
  // dato de muestra
  {
    id: "permiso-de-funcionamiento-municipal-ec",
    nombre: "Permiso de Funcionamiento Municipal",
    entidad: "Municipio de Quito",
    etapa: "Apertura",
    tipo: "Empresarial",
    sector: "Comercio y Servicios",
    prioritario: false,
    costo: { monetario: "USD 170/trámite", tiempo: "8 h", frecuencia: "Baja (renovación anual)", cargaTotal: "USD 170/trámite", plazoDias: 20 },
    barrerasAfectadas: [],
    diagnostico: "Las inspecciones de bomberos y municipales se tramitan de forma independiente pese a evaluar el mismo local, duplicando visitas y extendiendo el plazo total de habilitación.",
    pasos: pasosEstandarMuestra(
      "El permiso exige inspección del Cuerpo de Bomberos y del municipio por separado, cada una con su propia solicitud y plazos independientes.",
      "Unificar la inspección de bomberos y municipal en una sola visita coordinada, con una única solicitud de permiso."
    ),
  },
  // dato de muestra — nombre incluye la sigla del ente sanitario para no
  // colisionar con el mismo trámite de Bolivia (mismo nombre base
  // "Registro Sanitario de Alimentos", distinta entidad).
  {
    id: "registro-sanitario-de-alimentos-arcsa-ec",
    nombre: "Registro Sanitario de Alimentos (ARCSA)",
    entidad: "ARCSA",
    etapa: "Apertura",
    tipo: "Empresarial",
    sector: "Manufactura",
    prioritario: false,
    costo: { monetario: "USD 600/producto", tiempo: "15 h", frecuencia: "Baja (cada 5 años)", cargaTotal: "USD 600/producto", plazoDias: 40 },
    barrerasAfectadas: [],
    diagnostico: "El registro no distingue entre un producto nuevo y una variación menor de empaque de un producto ya aprobado, multiplicando el costo y el tiempo para las empresas que amplían su línea de presentaciones.",
    pasos: pasosEstandarMuestra(
      "Cada variación de empaque o presentación del mismo producto requiere un registro sanitario nuevo con la tarifa completa.",
      "Permitir la notificación de variaciones de empaque de un producto ya registrado, sin exigir un nuevo registro completo."
    ),
  },
  // dato de muestra — nombre incluye la sigla del ente recaudador para no
  // colisionar con el mismo trámite de Chile.
  {
    id: "declaracion-mensual-de-iva-sri-ec",
    nombre: "Declaración Mensual de IVA (SRI)",
    entidad: "Servicio de Rentas Internas (SRI)",
    etapa: "Operación",
    tipo: "Empresarial",
    sector: "Multisectorial",
    prioritario: false,
    costo: { monetario: "USD 130/mes", tiempo: "4 h", frecuencia: "Mensual (12/año)", cargaTotal: "USD 1,560/año", plazoDias: 1 },
    barrerasAfectadas: [],
    diagnostico: "La declaración mensual duplica información que el SRI ya posee mediante la facturación electrónica, generando una carga recurrente evitable en un trámite de alta frecuencia.",
    pasos: pasosEstandarMuestra(
      "El formulario exige reingresar manualmente el detalle de comprobantes que el SRI ya recibe por facturación electrónica.",
      "Prellenar automáticamente la declaración con el detalle de comprobantes ya recibidos por facturación electrónica."
    ),
  },
  // dato de muestra
  {
    id: "permiso-de-operacion-mef-pe",
    nombre: "Permiso de Operación MEF",
    entidad: "Ministerio de Economía y Finanzas",
    etapa: "Operación",
    tipo: "Empresarial",
    sector: "Servicios Financieros y de Seguros",
    prioritario: true,
    costo: { monetario: "USD 410/trámite", tiempo: "14 h", frecuencia: "Baja (1 vez, renovación cada 3 años)", cargaTotal: "USD 410/trámite", plazoDias: 60 },
    barrerasAfectadas: [],
    diagnostico: "La exigencia de autorización previa sin distinguir el historial de cumplimiento de la entidad solicitante retrasa el inicio de operaciones incluso en renovaciones de bajo riesgo.",
    pasos: pasosEstandarMuestra(
      "El permiso exige autorización previa del MEF antes de iniciar operaciones, incluso para entidades con historial de cumplimiento consecutivo en renovaciones anteriores.",
      "Sustituir la autorización previa por una declaración jurada con verificación posterior para entidades con historial de cumplimiento comprobado."
    ),
  },
  // dato de muestra — nombre incluye la sigla de la entidad para no
  // colisionar con el mismo trámite de Chile.
  {
    id: "certificado-de-origen-para-exportacion-sunat-pe",
    nombre: "Certificado de Origen para Exportación (SUNAT)",
    entidad: "SUNAT",
    etapa: "Operación",
    tipo: "Empresarial",
    sector: "Minería",
    prioritario: false,
    costo: { monetario: "USD 290/operación", tiempo: "8 h", frecuencia: "Alta (32 ops/año)", cargaTotal: "USD 9,280/año", plazoDias: 3 },
    barrerasAfectadas: [],
    diagnostico: "La falta de integración entre la cámara de comercio y el sistema aduanero obliga a un trámite presencial adicional por cada operación de exportación, pese a que la información ya está validada digitalmente en SUNAT.",
    pasos: pasosEstandarMuestra(
      "El certificado debe tramitarse en ventanilla física de la cámara de comercio correspondiente, sin integración directa con el sistema aduanero SUNAT.",
      "Integrar la emisión del certificado de origen al sistema aduanero de SUNAT, eliminando el trámite presencial en ventanilla."
    ),
  },
  // dato de muestra
  {
    id: "licencia-municipal-de-funcionamiento-pe",
    nombre: "Licencia Municipal de Funcionamiento",
    entidad: "Municipalidad de Lima",
    etapa: "Apertura",
    tipo: "Empresarial",
    sector: "Comercio y Servicios",
    prioritario: false,
    costo: { monetario: "USD 160/trámite", tiempo: "7 h", frecuencia: "Baja (renovación anual)", cargaTotal: "USD 160/trámite", plazoDias: 15 },
    barrerasAfectadas: [],
    diagnostico: "Las inspecciones de Defensa Civil y municipales se gestionan de forma independiente sobre el mismo local, duplicando visitas y extendiendo el plazo total de habilitación del negocio.",
    pasos: pasosEstandarMuestra(
      "La licencia exige inspección de Defensa Civil y municipal por separado, cada una con su propia solicitud y cronograma.",
      "Unificar la inspección de Defensa Civil y la municipal en una sola visita coordinada, bajo una única solicitud de licencia."
    ),
  },
  // dato de muestra
  {
    id: "declaracion-mensual-de-igv-pe",
    nombre: "Declaración Mensual de IGV",
    entidad: "SUNAT",
    etapa: "Operación",
    tipo: "Empresarial",
    sector: "Multisectorial",
    prioritario: false,
    costo: { monetario: "USD 120/mes", tiempo: "4 h", frecuencia: "Mensual (12/año)", cargaTotal: "USD 1,440/año", plazoDias: 1 },
    barrerasAfectadas: [],
    diagnostico: "La declaración mensual duplica información que SUNAT ya posee mediante la facturación electrónica, generando una carga administrativa recurrente evitable con un prellenado automático.",
    pasos: pasosEstandarMuestra(
      "El formulario exige reingresar el detalle de comprobantes que SUNAT ya recibe por facturación electrónica.",
      "Prellenar automáticamente la declaración con el detalle de comprobantes ya recibidos por facturación electrónica."
    ),
  },
];

// Trámites prioritarios por país — dato de muestra. TODO: no hay catálogo
// real de trámites individuales priorizados para ningún país todavía (mismo
// pendiente ya anotado en Barreras) — estas filas alimentan la tabla
// "Trámites prioritarios" hasta que exista ese catálogo, y también
// pais/severidad/estadoHitl/accionSugerida de ALL_TRAMITES (ver más abajo).
// Reubicado acá arriba (antes vivía junto a TRAMITES_PRIORITARIOS_MUESTRA)
// porque ALL_TRAMITES ahora lo necesita para enriquecerse — `id` sigue
// resolviéndose con slugOrRealId más abajo, sin cambios en ese mecanismo.
const TRAMITES_PRIORITARIOS_BASE: Record<Exclude<Country, "Todos">, {
  tramite: string; entidad: string; eje: string; costo: string;
  severidad: "Crítica" | "Alta"; estadoHitl: "Publicado" | "Por decidir" | "Etapa 3"; accion: string;
  tipoUsuario: "Empresarial" | "Ciudadano"; sector: string;
}[]> = {
  Argentina: [
    { tramite: "Certificado de Origen Mercosur",  entidad: "Dirección General de Aduanas",   eje: "Comercio exterior",        costo: "USD 380/operación", severidad: "Crítica", estadoHitl: "Por decidir", accion: "Emitir certificado electrónico integrado al sistema aduanero", tipoUsuario: "Empresarial", sector: "Agroindustria y Commodities" },
    { tramite: "Habilitación Municipal Comercial", entidad: "Municipalidad de Buenos Aires",  eje: "Apertura de negocio",      costo: "USD 210/trámite",   severidad: "Alta",    estadoHitl: "Publicado",   accion: "Unificar habilitación con inspección única por rubro", tipoUsuario: "Empresarial", sector: "Comercio y Servicios" },
    { tramite: "Registro de Marca y Producto",     entidad: "INPI",                           eje: "Cumplimiento normativo",   costo: "USD 320/registro",  severidad: "Alta",    estadoHitl: "Etapa 3",     accion: "Reducir plazos de examen de fondo con revisión digital", tipoUsuario: "Empresarial", sector: "Manufactura y Consumo" },
    { tramite: "Declaración Jurada de IVA",        entidad: "AFIP",                           eje: "Cumplimiento tributario",  costo: "USD 150/mes",       severidad: "Alta",    estadoHitl: "Publicado",   accion: "Prellenar declaración con datos de facturación electrónica", tipoUsuario: "Empresarial", sector: "Multisectorial" },
  ],
  Bolivia: [
    { tramite: "Certificado de Exportación y de Origen", entidad: "Dirección General de Aduanas / IHCAFE", eje: "Comercio exterior",       costo: "USD 420/operación", severidad: "Crítica", estadoHitl: "Publicado",   accion: "Digitalizar certificado vía ventanilla única de comercio exterior", tipoUsuario: "Empresarial", sector: "Agroindustria Cafetalera" },
    { tramite: "Habilitación Municipal de Negocio",      entidad: "Alcaldía Municipal de La Paz",           eje: "Apertura de negocio",     costo: "USD 180/trámite",   severidad: "Alta",    estadoHitl: "Por decidir", accion: "Habilitar registro en línea con validación automática de zonificación", tipoUsuario: "Empresarial", sector: "Comercio y Servicios" },
    { tramite: "Registro Sanitario de Alimentos (ARSA)", entidad: "ARSA — Agencia de Regulación Sanitaria", eje: "Cumplimiento sanitario",  costo: "USD 850/producto",  severidad: "Alta",    estadoHitl: "Etapa 3",     accion: "Permitir variaciones de empaque bajo el mismo registro sanitario", tipoUsuario: "Empresarial", sector: "Agroindustria Cafetalera" },
    { tramite: "Declaración Jurada Mensual de ISV",      entidad: "Servicio de Impuestos Nacionales (SIN)", eje: "Cumplimiento tributario", costo: "USD 180/mes",       severidad: "Alta",    estadoHitl: "Publicado",   accion: "Prellenar la declaración con datos de facturación electrónica", tipoUsuario: "Empresarial", sector: "Textil y Confección" },
  ],
  Chile: [
    { tramite: "Autorización de Ampliación de Planta",   entidad: "Superintendencia del Medio Ambiente", eje: "Ambiental",                costo: "USD 640/trámite",  severidad: "Crítica", estadoHitl: "Por decidir", accion: "Habilitar evaluación ambiental expedita para ampliaciones menores", tipoUsuario: "Empresarial", sector: "Industria y Manufactura" },
    { tramite: "Certificado de Origen para Exportación (Aduanas Chile)", entidad: "Dirección Nacional de Aduanas",       eje: "Comercio exterior",        costo: "USD 300/operación", severidad: "Alta",   estadoHitl: "Publicado",   accion: "Emitir certificado electrónico integrado al sistema aduanero", tipoUsuario: "Empresarial", sector: "Minería y Exportaciones" },
    { tramite: "Patente Municipal de Actividad",         entidad: "Municipalidad de Santiago",           eje: "Apertura de negocio",      costo: "USD 190/trámite",   severidad: "Alta",   estadoHitl: "Etapa 3",     accion: "Digitalizar el pago y renovación de patente", tipoUsuario: "Empresarial", sector: "Comercio y Servicios" },
    { tramite: "Declaración Mensual de IVA (SII)",       entidad: "Servicio de Impuestos Internos (SII)", eje: "Cumplimiento tributario", costo: "USD 140/mes",       severidad: "Alta",   estadoHitl: "Publicado",   accion: "Prellenar declaración con datos de facturación electrónica", tipoUsuario: "Empresarial", sector: "Multisectorial" },
  ],
  Ecuador: [
    { tramite: "Certificado Fitosanitario de Exportación", entidad: "Agrocalidad",                        eje: "Comercio exterior",        costo: "USD 260/operación", severidad: "Crítica", estadoHitl: "Por decidir", accion: "Emitir certificado electrónico integrado a ventanilla única", tipoUsuario: "Empresarial", sector: "Agroindustria Bananera" },
    { tramite: "Permiso de Funcionamiento Municipal",       entidad: "Municipio de Quito",                 eje: "Apertura de negocio",      costo: "USD 170/trámite",   severidad: "Alta",    estadoHitl: "Publicado",   accion: "Unificar permiso con inspección única por rubro", tipoUsuario: "Empresarial", sector: "Comercio y Servicios" },
    { tramite: "Registro Sanitario de Alimentos (ARCSA)",   entidad: "ARCSA",                              eje: "Cumplimiento sanitario",   costo: "USD 600/producto",  severidad: "Alta",    estadoHitl: "Etapa 3",     accion: "Permitir variaciones de empaque bajo el mismo registro", tipoUsuario: "Empresarial", sector: "Manufactura" },
    { tramite: "Declaración Mensual de IVA (SRI)",          entidad: "Servicio de Rentas Internas (SRI)",  eje: "Cumplimiento tributario",  costo: "USD 130/mes",       severidad: "Alta",    estadoHitl: "Publicado",   accion: "Prellenar declaración con datos de facturación electrónica", tipoUsuario: "Empresarial", sector: "Multisectorial" },
  ],
  Perú: [
    { tramite: "Permiso de Operación MEF",                entidad: "Ministerio de Economía y Finanzas", eje: "Cumplimiento normativo",  costo: "USD 410/trámite",   severidad: "Crítica", estadoHitl: "Por decidir", accion: "Sustituir permiso previo por declaración jurada con fiscalización posterior", tipoUsuario: "Empresarial", sector: "Servicios Financieros y de Seguros" },
    { tramite: "Certificado de Origen para Exportación (SUNAT)", entidad: "SUNAT",                       eje: "Comercio exterior",       costo: "USD 290/operación", severidad: "Alta",    estadoHitl: "Publicado",   accion: "Emitir certificado electrónico integrado a ventanilla única", tipoUsuario: "Empresarial", sector: "Minería" },
    { tramite: "Licencia Municipal de Funcionamiento",    entidad: "Municipalidad de Lima",              eje: "Apertura de negocio",     costo: "USD 160/trámite",   severidad: "Alta",    estadoHitl: "Etapa 3",     accion: "Unificar licencia con inspección única por rubro", tipoUsuario: "Empresarial", sector: "Comercio y Servicios" },
    { tramite: "Declaración Mensual de IGV",              entidad: "SUNAT",                              eje: "Cumplimiento tributario", costo: "USD 120/mes",       severidad: "Alta",    estadoHitl: "Publicado",   accion: "Prellenar declaración con datos de facturación electrónica", tipoUsuario: "Empresarial", sector: "Multisectorial" },
  ],
};

// pais/severidad/estadoHitl/accionSugerida de cada trámite de ALL_TRAMITES —
// dato de muestra agregado tras el fix de HallazgosFiltradosTramites, MISMO
// criterio que ALL_BARRERAS (que ya los tenía). En vez de fabricar un
// segundo dato de muestra desconectado, se reusa por nombre exacto de
// trámite lo que ya existe en TRAMITES_PRIORITARIOS_BASE (arriba) — así la
// tabla "Trámites prioritarios" y esta pantalla siempre coinciden para el
// mismo trámite.
// fuente -- dato de muestra NUEVO, mismo criterio que ALL_BARRERAS.fuente:
// cada trámite toma su fuente de FUENTES_TRAZABILIDAD_MUESTRA[pais] (nunca de
// la lista de otro país), asignada acá cíclicamente por índice de fila dentro
// de cada país (reparto simple, no hace falta lógica sofisticada).
const TRAMITE_META_POR_NOMBRE = new Map<string, { pais: Country; severidad: "Crítica" | "Alta"; estadoHitl: "Publicado" | "Por decidir" | "Etapa 3"; accionSugerida: string; fuente: string }>();
for (const pais of COUNTRIES) {
  const fuentesPais = FUENTES_TRAZABILIDAD_MUESTRA[pais];
  TRAMITES_PRIORITARIOS_BASE[pais].forEach((fila, idx) => {
    const fuente = fuentesPais[idx % fuentesPais.length].fuente;
    TRAMITE_META_POR_NOMBRE.set(fila.tramite, { pais, severidad: fila.severidad, estadoHitl: fila.estadoHitl, accionSugerida: fila.accion, fuente });
  });
}
// Único trámite de ALL_TRAMITES sin nombre exacto en TRAMITES_PRIORITARIOS_
// BASE: "Obtención de Registro Sanitario de Alimentos" (TRAMITES_CAFE) es un
// trámite propio del café, distinto del genérico "Registro Sanitario de
// Alimentos (ARSA)" que sí tiene par ahí (Bolivia). Dato de muestra —
// fuente reusa la misma que su par más cercano ("Registro Sanitario de
// Alimentos (ARSA)", índice 2 en Bolivia).
const TRAMITE_META_FALLBACK = {
  pais: "Bolivia" as Country,
  severidad: "Alta" as const,
  estadoHitl: "Publicado" as const,
  accionSugerida: "Permitir variaciones de empaque bajo el mismo registro sanitario sin repetir el trámite completo",
  fuente: FUENTES_TRAZABILIDAD_MUESTRA["Bolivia"][2].fuente,
};

// canalTransmision/afectacionMipyme/tipoAfectacion -- dato de muestra NUEVO,
// sin metodología real todavía (mismo criterio que el resto de datos de
// muestra del proyecto). Asignado con repartoProporcional (mismo reparto que
// ya usa INSTRUMENTOS_MUESTRA, ver data/instrumentosMuestra.ts) sobre las
// proporciones de CANALES_TRANSMISION_TRAMITES_MUESTRA/MIPYME_MUESTRA/
// TRAMITES_AFECTACIONES_MUESTRA (más abajo), para que la distribución
// agregada por país cuadre razonablemente con esos datos ya definidos -- no
// tiene que ser exacto, alcanza con el orden de magnitud.
const CANT_TRAMITES_TOTAL = TRAMITES_CAFE.length + TRAMITES_TEXTIL.length + TRAMITES_MUESTRA.length;
const CANAL_TRANSMISION_TRAMITES_POR_INDICE = repartoProporcional(CANT_TRAMITES_TOTAL, [
  { valor: "Costo administrativo", pct: 33 },
  { valor: "Tiempo/incertidumbre", pct: 25 },
  { valor: "Incumbentes/competencia", pct: 14 },
  { valor: "Capital/liquidez", pct: 11 },
  { valor: "Capacidad técnica", pct: 10 },
  { valor: "Modelo de negocio", pct: 7 },
]);
// Misma escala 62/30/8 usada para redefinir MIPYME_MUESTRA (ver más abajo,
// junto a CANALES_TRANSMISION_MUESTRA) a partir de la distribución real de
// ALL_BARRERAS.afectacionMipyme.
const AFECTACION_MIPYME_TRAMITES_POR_INDICE = repartoProporcional<"Alta" | "Media" | "Baja">(CANT_TRAMITES_TOTAL, [
  { valor: "Alta", pct: 62 },
  { valor: "Media", pct: 30 },
  { valor: "Baja", pct: 8 },
]);
const TIPO_AFECTACION_POR_INDICE = repartoProporcional(CANT_TRAMITES_TOTAL, [
  { valor: "Costos administrativos", pct: 40 },
  { valor: "Demoras", pct: 24 },
  { valor: "Duplicidad", pct: 17 },
  { valor: "Discrecionalidad", pct: 11 },
  { valor: "Falta de interoperabilidad", pct: 8 },
]);
// accionCategoria -- mismo criterio, categoría corta adicional (NO reemplaza
// accionSugerida, la descripción larga que ya usan las tablas). Proporciones
// de TRAMITES_ACCION_MEJORA_MUESTRA (180/113/86/52/47 sobre 478 ≈ 38/24/18/
// 11/10%) -- mismos números que ACCION_MEJORA_MUESTRA (Barreras), solo
// cambian 2 de los 5 nombres de categoría.
const ACCION_CATEGORIA_TRAMITES_POR_INDICE = repartoProporcional(CANT_TRAMITES_TOTAL, [
  { valor: "Simplificar", pct: 38 },
  { valor: "Digitalizar", pct: 24 },
  { valor: "Interoperar", pct: 18 },
  { valor: "Clarificar", pct: 11 },
  { valor: "Proporcionalizar", pct: 10 },
]);

// tipoCarga/subdimension -- mismo criterio que los 3 campos de arriba, dato
// de muestra nuevo. Los porcentajes son literales (no una referencia viva a
// PANEL_CARGA_TIPO_DATA, que se define más abajo en el archivo -- un const
// no puede usarse antes de su declaración aunque sea en el mismo módulo),
// pero son los mismos números reales de ahí: por tipoCarga, Accesibilidad
// 168/Certidumbre 247/Cumplimiento 141/Proporcionalidad 56 (total 612); por
// subdimensión dentro de cada tipoCarga, la proporción de cada una sobre el
// total de su tipoCarga. Reparto en dos niveles (primero tipoCarga, después
// subdimension dentro de cada tipoCarga) para que la distribución agregada
// cuadre razonablemente con "CARGA POR EJE" / "Trámites por país", que sí
// usan PANEL_CARGA_TIPO_DATA en vivo.
const TIPO_CARGA_POR_INDICE = repartoProporcional(CANT_TRAMITES_TOTAL, [
  { valor: "Accesibilidad", pct: 28 },
  { valor: "Certidumbre", pct: 40 },
  { valor: "Cumplimiento", pct: 23 },
  { valor: "Proporcionalidad", pct: 9 },
]);
const SUBDIM_RATIOS_POR_TIPO_CARGA: Record<string, { valor: string; pct: number }[]> = {
  "Accesibilidad": [
    { valor: "Duplicidad e interoperabilidad", pct: 56 },
    { valor: "Digitalización y accesibilidad", pct: 44 },
  ],
  "Certidumbre": [
    { valor: "Discrecionalidad administrativa", pct: 23 },
    { valor: "Trámites y requisitos de cumplimiento", pct: 19 },
    { valor: "Certidumbre procedimental", pct: 17 },
    { valor: "Duplicidad e interoperabilidad", pct: 16 },
    { valor: "Diseño y estructura de trámites", pct: 15 },
    { valor: "Recursos y debido proceso", pct: 10 },
  ],
  "Cumplimiento": [
    { valor: "Trámites y requisitos de cumplimiento", pct: 58 },
    { valor: "Costos y cargas recurrentes", pct: 42 },
  ],
  "Proporcionalidad": [
    { valor: "Proporcionalidad e inspecciones basado en riesgo", pct: 100 },
  ],
};
const SUBDIMENSION_CARGA_POR_INDICE: string[] = (() => {
  const cursorPorTipoCarga: Record<string, number> = {};
  const subdimAsignadaPorTipoCarga: Record<string, string[]> = {};
  for (const [tipoCarga, ratios] of Object.entries(SUBDIM_RATIOS_POR_TIPO_CARGA)) {
    const cantidadEnGrupo = TIPO_CARGA_POR_INDICE.filter(t => t === tipoCarga).length;
    subdimAsignadaPorTipoCarga[tipoCarga] = repartoProporcional(cantidadEnGrupo, ratios);
    cursorPorTipoCarga[tipoCarga] = 0;
  }
  return TIPO_CARGA_POR_INDICE.map(tipoCarga => {
    const idx = cursorPorTipoCarga[tipoCarga]++;
    return subdimAsignadaPorTipoCarga[tipoCarga][idx];
  });
})();

export const ALL_TRAMITES = [...TRAMITES_CAFE, ...TRAMITES_TEXTIL, ...TRAMITES_MUESTRA].map((t, i) => ({
  ...t,
  ...(TRAMITE_META_POR_NOMBRE.get(t.nombre) ?? TRAMITE_META_FALLBACK),
  tipoCarga: TIPO_CARGA_POR_INDICE[i],
  subdimension: SUBDIMENSION_CARGA_POR_INDICE[i],
  canalTransmision: CANAL_TRANSMISION_TRAMITES_POR_INDICE[i],
  afectacionMipyme: AFECTACION_MIPYME_TRAMITES_POR_INDICE[i],
  tipoAfectacion: TIPO_AFECTACION_POR_INDICE[i],
  accionCategoria: ACCION_CATEGORIA_TRAMITES_POR_INDICE[i],
}));

// Registros completos de muestra para las filas de TOP_BARRERAS_POR_PAIS_MUESTRA
// que no tienen barrera real correspondiente en BARRERAS_CAFE/BARRERAS_TEXTIL
// (Bolivia "Bloqueo por Renovación de Registros" SÍ la tiene — no se duplica
// acá). Misma forma que una barrera real: id, titulo, severidad, sector,
// instrumento, tramitesAfectados, clasificacion, jerarquia, idHallazgo, pais,
// anio, entidad, enlaceOficial, tipoRestriccion, canalTransmision,
// afectacionMipyme, validacion, accionSugerida, descripcion, diagnostico,
// textNormativo, pasajeResaltado, reforma. Se concatenan a ALL_BARRERAS más
// abajo para que BarreraDetail() las encuentre igual que a las reales, sin
// ninguna rama especial de código.
// dato de muestra — TODO: falta catálogo real de barreras individuales para
// Argentina, Chile, Ecuador y Perú (y estas 2 adicionales de Bolivia).
const BARRERAS_MUESTRA = [
  // dato de muestra
  {
    id: "registro-obligatorio-de-autopartes-ar",
    titulo: "Registro Obligatorio de Autopartes",
    severidad: "Crítico",
    sector: "Manufactura Automotriz",
    instrumento: "Res. 445/2023",
    tramitesAfectados: [],
    clasificacion: "Entrada",
    subdimension: "Inversión",
    jerarquia: "Reglamentario",
    idHallazgo: "ARG-BAR-0801",
    pais: "Argentina" as Country,
    anio: 2023,
    entidad: "Ministerio de Desarrollo Productivo",
    enlaceOficial: "boletinoficial.gob.ar/normas/resolucion-445-2023",
    tipoRestriccion: "Registro previo obligatorio por lote de producción",
    canalTransmision: "Costo administrativo",
    afectacionMipyme: "Alta" as const,
    accionCategoria: "Clarificar" as const,
    fuente: "Gaceta Oficial de Argentina" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Crítico" as const,
      estadoHitl: "Publicado" as const,
      comentarioBID: "Confirmado como barrera crítica: el registro por lote no agrega control real sobre la calidad ya certificada.",
      comentarioConsultor: "Recomendamos migrar a un registro único por línea de producto homologada.",
      comentarioGobierno: "El Ministerio de Desarrollo Productivo aprobó la simplificación a registro por línea.",
    },
    accionSugerida: {
      accion: "Sustituir el registro por lote por un registro único por línea de producto homologada",
      prioridad: "Alta" as const,
      tipoCambioRequerido: "Reglamentario · sin pasar por el legislativo",
      factibilidad: "Alta" as const,
      objetivoLegitimo: "Sí, objetivo válido · carga desproporcionada",
    },
    descripcion: "Cada lote de producción de autopartes debe registrarse individualmente antes de su comercialización, aun contando con certificación de origen ya homologada para la línea de producto.",
    diagnostico: "La exigencia de registro previo por cada lote de producción, en lugar de por línea de producto, multiplica los trámites que enfrentan los fabricantes de autopartes sin aportar control adicional sobre la calidad ya certificada por el laboratorio homologado.",
    textNormativo: "Artículo 6. — Del registro de autopartes de origen nacional.\n\nToda persona física o jurídica que fabrique o ensamble autopartes destinadas al mercado automotor deberá inscribir cada lote de producción ante el Registro Nacional de Autopartes con carácter previo a su comercialización, acompañando certificado de origen nacional emitido por laboratorio homologado. La comercialización de lotes no registrados será pasible de las sanciones previstas en la normativa vigente, con independencia de que el producto cumpla con las especificaciones técnicas exigidas.",
    pasajeResaltado: "deberá inscribir cada lote de producción ante el Registro Nacional de Autopartes con carácter previo a su comercialización",
    reforma: {
      dice: "Toda persona física o jurídica... deberá inscribir cada lote de producción ante el Registro Nacional de Autopartes con carácter previo a su comercialización.",
      debeDedir: "El registro se realizará por línea de producto homologada; las variaciones de lote de una misma línea ya registrada se notificarán electrónicamente sin requerir una nueva inscripción previa.",
      palanca: "Simplificación",
    },
  },
  // dato de muestra
  {
    id: "demora-en-renovacion-de-permisos-agroindustriales-ar",
    titulo: "Demora en Renovación de Permisos Agroindustriales",
    severidad: "Crítico",
    sector: "Agroindustria y Commodities",
    instrumento: "Decreto 1187/2022",
    tramitesAfectados: [],
    clasificacion: "Operación",
    subdimension: "Innovación",
    jerarquia: "Reglamentario",
    idHallazgo: "ARG-BAR-0802",
    pais: "Argentina" as Country,
    anio: 2022,
    entidad: "Ministerio de Agricultura, Ganadería y Pesca",
    enlaceOficial: "boletinoficial.gob.ar/normas/decreto-1187-2022",
    tipoRestriccion: "Renovación sin plazo máximo de resolución",
    canalTransmision: "Tiempo/incertidumbre",
    afectacionMipyme: "Media" as const,
    accionCategoria: "Eliminar" as const,
    fuente: "Congreso de la Nación" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Alto" as const,
      estadoHitl: "Por decidir" as const,
      comentarioBID: "Impacto relevante en continuidad operativa; validar frecuencia real de demoras.",
      comentarioConsultor: "Sugerimos silencio administrativo positivo pasado el plazo de 30 días.",
      comentarioGobierno: "En revisión por la Secretaría de Agricultura, Ganadería y Pesca.",
    },
    accionSugerida: {
      accion: "Establecer un plazo máximo de 30 días con silencio administrativo positivo para la renovación",
      prioridad: "Alta" as const,
      tipoCambioRequerido: "Reglamentario · sin pasar por el legislativo",
      factibilidad: "Media" as const,
      objetivoLegitimo: "Sí, objetivo válido · carga desproporcionada",
    },
    descripcion: "La renovación de permisos de acopio y procesamiento agroindustrial no tiene plazo máximo de resolución y prohíbe operar bajo silencio administrativo.",
    diagnostico: "La ausencia de un plazo máximo de resolución, combinada con la prohibición de operar bajo silencio administrativo, expone a los establecimientos agroindustriales a paralizaciones de acopio por demoras administrativas ajenas a su control.",
    textNormativo: "Artículo 14. — De la renovación de permisos de acopio y procesamiento.\n\nLa renovación del permiso de acopio y procesamiento agroindustrial deberá solicitarse con una antelación mínima de sesenta días a su vencimiento. La autoridad de aplicación resolverá la solicitud dentro del plazo que las necesidades del servicio permitan, sin que la falta de resolución habilite al solicitante a continuar operando bajo el permiso vencido. Vencido el permiso sin resolución expresa, el establecimiento deberá suspender sus operaciones de acopio hasta contar con la renovación formal.",
    pasajeResaltado: "sin que la falta de resolución habilite al solicitante a continuar operando bajo el permiso vencido",
    reforma: {
      dice: "...sin que la falta de resolución habilite al solicitante a continuar operando bajo el permiso vencido.",
      debeDedir: "Si la autoridad no resuelve la renovación dentro de 30 días hábiles de presentada la solicitud completa, el establecimiento podrá continuar operando bajo el permiso vigente hasta la resolución expresa (silencio positivo).",
      palanca: "Certidumbre procedimental",
    },
  },
  // dato de muestra
  {
    id: "capital-minimo-para-nuevas-entidades-financieras-ar",
    titulo: "Capital Mínimo para Nuevas Entidades Financieras",
    severidad: "Crítico",
    sector: "Servicios Financieros",
    instrumento: "Ley 27.349, Art. 9",
    tramitesAfectados: [],
    clasificacion: "Entrada",
    subdimension: "Comercio",
    jerarquia: "Legal",
    idHallazgo: "ARG-BAR-0803",
    pais: "Argentina" as Country,
    anio: 2017,
    entidad: "Banco Central de la República Argentina",
    enlaceOficial: "boletinoficial.gob.ar/normas/ley-27349-art-9",
    tipoRestriccion: "Capital mínimo desproporcionado",
    canalTransmision: "Capital/liquidez",
    afectacionMipyme: "Alta" as const,
    accionCategoria: "Proporcionalizar" as const,
    fuente: "Ministerio de Economía" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Alto" as const,
      estadoHitl: "Etapa 3" as const,
      comentarioBID: "Barrera relevante al acceso de fondos de garantía de menor escala.",
      comentarioConsultor: "Proponemos un esquema de capital escalonado con capitalización progresiva supervisada.",
      comentarioGobierno: "Pendiente de asignación a analista para revisión técnica.",
    },
    accionSugerida: {
      accion: "Escalonar el capital mínimo según el volumen de garantías proyectado",
      prioridad: "Media" as const,
      tipoCambioRequerido: "Legal · requiere modificación de ley",
      factibilidad: "Media" as const,
      objetivoLegitimo: "Sí, objetivo válido · medio desproporcionado",
    },
    descripcion: "Las sociedades de garantía recíproca deben acreditar un capital mínimo fijo sin importar la escala de operaciones proyectada.",
    diagnostico: "El capital mínimo fijo, sin escalonamiento por tamaño de cartera proyectada, excluye a fondos de garantía de menor escala orientados específicamente a microempresas, contradiciendo el objetivo declarado de la ley de ampliar el acceso al financiamiento de las PyME.",
    textNormativo: "Artículo 9. — Del capital mínimo para sociedades de garantía recíproca.\n\nLas sociedades de garantía recíproca que soliciten autorización para operar deberán acreditar un capital social integrado no inferior al equivalente a cien mil unidades de valor adquisitivo, con independencia de la escala de operaciones proyectada o del segmento de pequeñas y medianas empresas al que orienten su actividad. La autoridad de aplicación no admitirá esquemas de capitalización progresiva ni excepciones por tamaño de cartera.",
    pasajeResaltado: "deberán acreditar un capital social integrado no inferior al equivalente a cien mil unidades de valor adquisitivo, con independencia de la escala de operaciones proyectada",
    reforma: {
      dice: "...deberán acreditar un capital social integrado no inferior al equivalente a cien mil unidades de valor adquisitivo, con independencia de la escala de operaciones proyectada.",
      debeDedir: "El capital mínimo se escalonará según el volumen de garantías proyectado a otorgar, permitiendo un capital inicial reducido para fondos orientados a microempresas con plan de capitalización progresiva supervisado por el BCRA.",
      palanca: "Proporcionalidad",
    },
  },
  // dato de muestra
  {
    id: "restriccion-de-venta-local-en-zoli-bo",
    titulo: "Restricción de Venta Local en ZOLI",
    severidad: "Crítico",
    sector: "Textil y Confección",
    instrumento: "Ley ZOLI Art. 12",
    tramitesAfectados: [],
    clasificacion: "Entrada",
    subdimension: "Competencia",
    jerarquia: "Legal",
    idHallazgo: "BOL-BAR-0845",
    pais: "Bolivia" as Country,
    anio: 2015,
    entidad: "SENAVEX",
    enlaceOficial: "gaceta.gob.bo/normas/ley-zoli-art-12",
    tipoRestriccion: "Prohibición de venta en mercado interno",
    canalTransmision: "Costo administrativo",
    afectacionMipyme: "Media" as const,
    accionCategoria: "Simplificar" as const,
    fuente: "SENAPI" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Crítico" as const,
      estadoHitl: "Publicado" as const,
      comentarioBID: "Confirmado: la prohibición absoluta limita el aprovechamiento de capacidad instalada en baja demanda de exportación.",
      comentarioConsultor: "Recomendamos un cupo de venta interna con pago de tributos de importación sobre el excedente.",
      comentarioGobierno: "SENAVEX evalúa la propuesta de cupo; pendiente de aprobación.",
    },
    accionSugerida: {
      accion: "Permitir un cupo de venta interna sobre el excedente de producción, con pago de tributos correspondiente",
      prioridad: "Media" as const,
      tipoCambioRequerido: "Legal · requiere modificación de ley",
      factibilidad: "Media" as const,
      objetivoLegitimo: "Sí, objetivo válido · medio desproporcionado",
    },
    descripcion: "Las mercancías producidas en la Zona Libre de Industria y Comercio no pueden venderse en el mercado interno bajo ninguna modalidad.",
    diagnostico: "La prohibición absoluta de venta interna, sin un cupo o arancel compensatorio para el excedente de producción, impide a las empresas ZOLI aprovechar su capacidad instalada en periodos de baja demanda de exportación.",
    textNormativo: "Artículo 12. — De la comercialización de mercancías producidas en Zona Libre de Industria y Comercio.\n\nLas mercancías producidas por empresas instaladas en la Zona Libre de Industria y Comercio (ZOLI) se destinarán exclusivamente a la exportación, quedando prohibida su venta o comercialización en el mercado interno bajo cualquier modalidad. La autoridad aduanera podrá disponer el decomiso de las mercancías que se introduzcan al mercado nacional en contravención de la presente disposición, sin perjuicio de las sanciones administrativas correspondientes.",
    pasajeResaltado: "quedando prohibida su venta o comercialización en el mercado interno bajo cualquier modalidad",
    reforma: {
      dice: "...quedando prohibida su venta o comercialización en el mercado interno bajo cualquier modalidad.",
      debeDedir: "Se permitirá la venta en el mercado interno de hasta un 15% de la producción anual, previo pago de los tributos de importación correspondientes a ese excedente.",
      palanca: "Proporcionalizar",
    },
  },
  // dato de muestra
  {
    id: "monopolio-de-distribucion-estatal-bo",
    titulo: "Monopolio de Distribución Estatal",
    severidad: "Crítico",
    sector: "Fibras Sintéticas",
    instrumento: "Decreto Ejecutivo 2891",
    tramitesAfectados: [],
    clasificacion: "Entrada",
    subdimension: "Inversión",
    jerarquia: "Legal",
    idHallazgo: "BOL-BAR-0846",
    pais: "Bolivia" as Country,
    anio: 2016,
    entidad: "Min. de Economía y Finanzas Públicas",
    enlaceOficial: "gaceta.gob.bo/normas/decreto-ejecutivo-2891",
    tipoRestriccion: "Reserva de distribución a favor de entidad estatal",
    canalTransmision: "Incumbentes/competencia",
    afectacionMipyme: "Alta" as const,
    accionCategoria: "Eliminar" as const,
    fuente: "Gaceta Oficial de Bolivia" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Crítico" as const,
      estadoHitl: "Etapa 3" as const,
      comentarioBID: "Barrera de competencia significativa; la exclusividad no tiene justificación de política pública clara.",
      comentarioConsultor: "Recomendamos eliminar la exclusividad y habilitar venta directa entre privados.",
      comentarioGobierno: "Pendiente de asignación a analista para revisión técnica.",
    },
    accionSugerida: {
      accion: "Eliminar la exclusividad de distribución y permitir venta directa entre productores y transformadoras",
      prioridad: "Alta" as const,
      tipoCambioRequerido: "Legal · requiere modificación de ley",
      factibilidad: "Baja" as const,
      objetivoLegitimo: "No, sin justificación de política pública clara",
    },
    descripcion: "La distribución mayorista de fibras sintéticas nacionales se reserva exclusivamente a una empresa pública, sin permitir venta directa entre privados.",
    diagnostico: "La reserva exclusiva de distribución mayorista a favor de una sola empresa estatal elimina la competencia en un eslabón central de la cadena, encareciendo el acceso de las empresas transformadoras a la materia prima nacional.",
    textNormativo: "Artículo 4. — De la distribución mayorista de fibras sintéticas.\n\nLa distribución mayorista de fibras sintéticas de producción nacional se reserva de manera exclusiva a la empresa pública del sector, quedando prohibida la comercialización mayorista directa entre productores privados y empresas transformadoras sin la intermediación de la entidad estatal. Los productores privados que incumplan esta disposición serán pasibles de la suspensión de su registro de operador.",
    pasajeResaltado: "se reserva de manera exclusiva a la empresa pública del sector, quedando prohibida la comercialización mayorista directa entre productores privados y empresas transformadoras",
    reforma: {
      dice: "...se reserva de manera exclusiva a la empresa pública del sector, quedando prohibida la comercialización mayorista directa entre productores privados y empresas transformadoras...",
      debeDedir: "Los productores privados podrán comercializar directamente con empresas transformadoras, manteniendo la empresa pública como un canal adicional no exclusivo de distribución.",
      palanca: "Desregulación",
    },
  },
  // dato de muestra
  {
    id: "reporte-semestral-de-produccion-minera-cl",
    titulo: "Reporte Semestral de Producción Minera",
    severidad: "Crítico",
    sector: "Minería y Exportaciones",
    instrumento: "Decreto PCM-027-2022",
    tramitesAfectados: [],
    clasificacion: "Entrada",
    subdimension: "Comercio",
    jerarquia: "Reglamentario",
    idHallazgo: "CHL-BAR-0801",
    pais: "Chile" as Country,
    anio: 2022,
    entidad: "SERNAGEOMIN",
    enlaceOficial: "diariooficial.interior.gob.cl/normas/decreto-pcm-027-2022",
    tipoRestriccion: "Reporte físico obligatorio",
    canalTransmision: "Costo administrativo",
    afectacionMipyme: "Media" as const,
    accionCategoria: "Sustituir" as const,
    fuente: "Diario Oficial de Chile" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Alto" as const,
      estadoHitl: "Etapa 3" as const,
      comentarioBID: "Carga administrativa duplicada confirmada; evaluar digitalización.",
      comentarioConsultor: "Proponemos transmisión electrónica vía plataforma SERNAGEOMIN Digital.",
      comentarioGobierno: "Pendiente de asignación a analista para revisión técnica.",
    },
    accionSugerida: {
      accion: "Digitalizar el reporte semestral vía plataforma SERNAGEOMIN Digital",
      prioridad: "Media" as const,
      tipoCambioRequerido: "Reglamentario · sin pasar por el legislativo",
      factibilidad: "Alta" as const,
      objetivoLegitimo: "Sí, objetivo válido · medio desproporcionado",
    },
    descripcion: "Las empresas mineras deben presentar un informe físico y certificado de producción cada semestre, en paralelo a lo que ya reportan digitalmente al SII.",
    diagnostico: "La exigencia de reporte físico semestral duplica el esfuerzo de empresas que ya reportan su producción de forma digital al Servicio de Impuestos Internos, generando una carga administrativa recurrente sin beneficio adicional de control.",
    textNormativo: "Artículo 8. — Del reporte semestral de producción.\n\nToda empresa minera con faena en operación deberá presentar ante el Servicio Nacional de Geología y Minería un informe físico y certificado de producción semestral, dentro de los primeros quince días hábiles de enero y julio de cada año. El informe deberá incluir el detalle de mineral extraído, procesado y comercializado, con la firma del ingeniero responsable de la faena. La falta de presentación en formato físico dará lugar a la aplicación de las multas previstas en el Código de Minería.",
    pasajeResaltado: "deberá presentar ante el Servicio Nacional de Geología y Minería un informe físico y certificado de producción semestral",
    reforma: {
      dice: "...deberá presentar ante el Servicio Nacional de Geología y Minería un informe físico y certificado de producción semestral...",
      debeDedir: "Las empresas mineras podrán transmitir electrónicamente su reporte semestral de producción a través de la plataforma SERNAGEOMIN Digital, con firma electrónica avanzada del ingeniero responsable.",
      palanca: "Digitalización",
    },
  },
  // dato de muestra
  {
    id: "garantia-de-inversion-renovable-excesiva-cl",
    titulo: "Garantía de Inversión Renovable Excesiva",
    severidad: "Crítico",
    sector: "Energías Renovables",
    instrumento: "Res. Exenta 118/2021",
    tramitesAfectados: [],
    clasificacion: "Operación",
    subdimension: "Inversión",
    jerarquia: "Administrativo",
    idHallazgo: "CHL-BAR-0802",
    pais: "Chile" as Country,
    anio: 2021,
    entidad: "Comisión Nacional de Energía",
    enlaceOficial: "diariooficial.interior.gob.cl/normas/res-exenta-118-2021",
    tipoRestriccion: "Garantía financiera desproporcionada",
    canalTransmision: "Capital/liquidez",
    afectacionMipyme: "Alta" as const,
    accionCategoria: "Eliminar" as const,
    fuente: "Congreso Nacional" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Crítico" as const,
      estadoHitl: "Por decidir" as const,
      comentarioBID: "Barrera significativa al financiamiento de proyectos renovables de menor escala.",
      comentarioConsultor: "Sugerimos escalonar la garantía según etapa de desarrollo del proyecto.",
      comentarioGobierno: "En revisión por la Comisión Nacional de Energía.",
    },
    accionSugerida: {
      accion: "Escalonar la garantía de seriedad según la etapa de desarrollo del proyecto",
      prioridad: "Alta" as const,
      tipoCambioRequerido: "Reglamentario · sin pasar por el legislativo",
      factibilidad: "Media" as const,
      objetivoLegitimo: "Sí, objetivo válido · carga desproporcionada",
    },
    descripcion: "Los proyectos de generación renovable deben constituir una garantía de seriedad equivalente al 100% de la inversión estimada, sin importar la etapa de desarrollo.",
    diagnostico: "Exigir una garantía equivalente al 100% de la inversión total, sin escalonamiento por etapa de desarrollo del proyecto, encarece desproporcionadamente el acceso al financiamiento para desarrolladores de proyectos renovables de menor escala.",
    textNormativo: "Artículo 5. — De la garantía de seriedad para proyectos de generación renovable.\n\nTodo proyecto de generación de energía renovable que solicite conexión al sistema eléctrico nacional deberá constituir una garantía de seriedad equivalente al 100% de la inversión estimada del proyecto, la que se mantendrá vigente hasta la puesta en servicio de la instalación. La garantía se hará efectiva íntegramente en caso de desistimiento del proyecto, independientemente de la etapa de desarrollo en que este se encuentre.",
    pasajeResaltado: "deberá constituir una garantía de seriedad equivalente al 100% de la inversión estimada del proyecto",
    reforma: {
      dice: "...deberá constituir una garantía de seriedad equivalente al 100% de la inversión estimada del proyecto...",
      debeDedir: "La garantía se escalonará según la etapa de desarrollo del proyecto, partiendo de un 10% en etapa de factibilidad hasta el 100% previo a la conexión definitiva al sistema eléctrico.",
      palanca: "Proporcionalizar",
    },
  },
  // dato de muestra
  {
    id: "requisito-tecnico-desproporcionado-en-financieras-cl",
    titulo: "Requisito Técnico Desproporcionado en Financieras",
    severidad: "Crítico",
    sector: "Servicios Financieros",
    instrumento: "Ley 21.000, Art. 33",
    tramitesAfectados: [],
    clasificacion: "Entrada",
    subdimension: "Competencia",
    jerarquia: "Legal",
    idHallazgo: "CHL-BAR-0803",
    pais: "Chile" as Country,
    anio: 2017,
    entidad: "Comisión para el Mercado Financiero (CMF)",
    enlaceOficial: "diariooficial.interior.gob.cl/normas/ley-21000-art-33",
    tipoRestriccion: "Requisito técnico desproporcionado",
    canalTransmision: "Capacidad técnica",
    afectacionMipyme: "Media" as const,
    accionCategoria: "Simplificar" as const,
    fuente: "Ministerio de Economía, Fomento y Turismo" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Alto" as const,
      estadoHitl: "Publicado" as const,
      comentarioBID: "Confirmado: la restricción limita el ingreso de profesionales calificados sin evidencia de mayor riesgo.",
      comentarioConsultor: "Recomendamos admitir certificaciones internacionales reconocidas sujetas a examen de idoneidad.",
      comentarioGobierno: "La CMF aprobó evaluar la admisión de certificaciones internacionales.",
    },
    accionSugerida: {
      accion: "Admitir certificaciones profesionales internacionales reconocidas como alternativa al título universitario",
      prioridad: "Media" as const,
      tipoCambioRequerido: "Legal · requiere modificación de ley",
      factibilidad: "Media" as const,
      objetivoLegitimo: "Sí, objetivo válido · medio desproporcionado",
    },
    descripcion: "Los asesores de inversión deben acreditar título universitario específico, sin admitirse certificaciones profesionales internacionales de la industria financiera.",
    diagnostico: "La exclusión de certificaciones profesionales internacionales reconocidas de la industria financiera como equivalentes al título universitario limita el ingreso de profesionales calificados que no siguieron la vía académica tradicional, sin evidencia de que ello reduzca el riesgo para los inversionistas.",
    textNormativo: "Artículo 33. — De los requisitos técnicos para asesores de inversión.\n\nLas personas naturales que se registren como asesores de inversión ante la Comisión para el Mercado Financiero deberán acreditar título profesional universitario en el área de administración, economía o ingeniería comercial, no admitiéndose certificaciones profesionales internacionales de la industria financiera como equivalente al título universitario exigido.",
    pasajeResaltado: "no admitiéndose certificaciones profesionales internacionales de la industria financiera como equivalente al título universitario exigido",
    reforma: {
      dice: "...no admitiéndose certificaciones profesionales internacionales de la industria financiera como equivalente al título universitario exigido.",
      debeDedir: "Se admitirán certificaciones profesionales internacionales reconocidas de la industria financiera (CFA, CFP y equivalentes) como alternativa válida al título universitario, sujeto a examen de idoneidad de la CMF.",
      palanca: "Simplificación",
    },
  },
  // dato de muestra
  {
    id: "demora-en-autorizacion-de-operaciones-petroleras-ec",
    titulo: "Demora en Autorización de Operaciones Petroleras",
    severidad: "Crítico",
    sector: "Petróleo y Gas",
    instrumento: "Regl. LORHUHI Art. 22",
    tramitesAfectados: [],
    clasificacion: "Operación",
    subdimension: "Competencia",
    jerarquia: "Reglamentario",
    idHallazgo: "ECU-BAR-0801",
    pais: "Ecuador" as Country,
    anio: 2020,
    entidad: "Ministerio de Energía y Minas",
    enlaceOficial: "registroficial.gob.ec/normas/regl-lorhuhi-art-22",
    tipoRestriccion: "Autorización previa sin plazo máximo",
    canalTransmision: "Tiempo/incertidumbre",
    afectacionMipyme: "Baja" as const,
    accionCategoria: "Clarificar" as const,
    fuente: "Registro Oficial de Ecuador" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Alto" as const,
      estadoHitl: "Por decidir" as const,
      comentarioBID: "Impacto relevante en la planificación de proyectos de recuperación mejorada.",
      comentarioConsultor: "Sugerimos un plazo máximo de 45 días con silencio administrativo positivo.",
      comentarioGobierno: "En revisión por el Ministerio de Energía y Minas.",
    },
    accionSugerida: {
      accion: "Establecer un plazo máximo de 45 días con silencio administrativo positivo",
      prioridad: "Media" as const,
      tipoCambioRequerido: "Reglamentario · sin pasar por el legislativo",
      factibilidad: "Media" as const,
      objetivoLegitimo: "Sí, objetivo válido · medio desproporcionado",
    },
    descripcion: "Las operadoras que requieren implementar recuperación mejorada deben esperar una autorización previa sin plazo máximo definido para su resolución.",
    diagnostico: "La ausencia de un plazo máximo definido para resolver la autorización de recuperación mejorada, combinada con la prohibición de iniciar actividad sin resolución expresa, genera incertidumbre en la planificación de proyectos que ya cuentan con toda la documentación técnica exigida.",
    textNormativo: "Artículo 22. — De la autorización de operaciones de recuperación mejorada.\n\nLas operadoras que requieran implementar técnicas de recuperación mejorada en campos en producción deberán solicitar autorización previa del Ministerio de Energía y Minas, la que será resuelta dentro del plazo que la complejidad técnica del proyecto amerite. La operadora no podrá iniciar actividad alguna de recuperación mejorada mientras no cuente con la resolución de autorización expresa, aun cuando cuente con la totalidad de la documentación técnica exigida.",
    pasajeResaltado: "la que será resuelta dentro del plazo que la complejidad técnica del proyecto amerite",
    reforma: {
      dice: "...la que será resuelta dentro del plazo que la complejidad técnica del proyecto amerite.",
      debeDedir: "La autorización se resolverá dentro de un plazo máximo de 45 días hábiles contados desde la presentación de la documentación técnica completa, transcurrido el cual sin resolución expresa se entenderá aprobada.",
      palanca: "Certidumbre procedimental",
    },
  },
  // dato de muestra
  {
    id: "certificacion-fitosanitaria-redundante-ec",
    titulo: "Certificación Fitosanitaria Redundante",
    severidad: "Crítico",
    sector: "Flores y Exportaciones",
    instrumento: "Res. MAG-006-2022",
    tramitesAfectados: [],
    clasificacion: "Entrada",
    subdimension: "Inversión",
    jerarquia: "Administrativo",
    idHallazgo: "ECU-BAR-0802",
    pais: "Ecuador" as Country,
    anio: 2022,
    entidad: "Agrocalidad",
    enlaceOficial: "registroficial.gob.ec/normas/res-mag-006-2022",
    tipoRestriccion: "Certificación duplicada por destino",
    canalTransmision: "Costo administrativo",
    afectacionMipyme: "Alta" as const,
    accionCategoria: "Eliminar" as const,
    fuente: "Asamblea Nacional" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Crítico" as const,
      estadoHitl: "Publicado" as const,
      comentarioBID: "Confirmado: la duplicidad de certificados no reduce el riesgo fitosanitario real.",
      comentarioConsultor: "Recomendamos reconocer la certificación general salvo requisitos específicos del destino.",
      comentarioGobierno: "Agrocalidad aprobó el reconocimiento de la certificación general.",
    },
    accionSugerida: {
      accion: "Reconocer la certificación fitosanitaria general como válida para todos los destinos salvo requisitos específicos no cubiertos",
      prioridad: "Alta" as const,
      tipoCambioRequerido: "Reglamentario · sin pasar por el legislativo",
      factibilidad: "Alta" as const,
      objetivoLegitimo: "Sí, objetivo válido · carga desproporcionada",
    },
    descripcion: "Cada exportación de flores requiere un certificado fitosanitario específico por país de destino, aun contando con certificación general vigente para el mismo predio.",
    diagnostico: "La exigencia de un certificado fitosanitario específico por cada país de destino, superpuesto a la certificación general ya vigente para el mismo predio y período de cosecha, multiplica los trámites de los exportadores de flores sin reducir el riesgo fitosanitario real.",
    textNormativo: "Artículo 3. — De la certificación fitosanitaria de flores para exportación.\n\nToda partida de flores destinada a la exportación deberá contar con un certificado fitosanitario específico emitido por cada país de destino, aun cuando la partida ya cuente con certificación fitosanitaria general vigente emitida por Agrocalidad para el mismo cultivo y predio de origen dentro del mismo período de cosecha.",
    pasajeResaltado: "deberá contar con un certificado fitosanitario específico emitido por cada país de destino, aun cuando la partida ya cuente con certificación fitosanitaria general vigente",
    reforma: {
      dice: "...deberá contar con un certificado fitosanitario específico emitido por cada país de destino, aun cuando la partida ya cuente con certificación fitosanitaria general vigente...",
      debeDedir: "La certificación fitosanitaria general vigente para el predio y período de cosecha será válida para todos los destinos de exportación, salvo que el país de destino exija un requisito fitosanitario adicional específico no cubierto por la certificación general.",
      palanca: "Simplificación",
    },
  },
  // dato de muestra
  {
    id: "reserva-de-mercado-para-exportadores-establecidos-ec",
    titulo: "Reserva de Mercado para Exportadores Establecidos",
    severidad: "Crítico",
    sector: "Agroindustria Bananera",
    instrumento: "Decreto 1234-EC",
    tramitesAfectados: [],
    clasificacion: "Entrada",
    subdimension: "Comercio",
    jerarquia: "Reglamentario",
    idHallazgo: "ECU-BAR-0803",
    pais: "Ecuador" as Country,
    anio: 2019,
    entidad: "Ministerio de Producción, Comercio Exterior, Inversiones y Pesca",
    enlaceOficial: "registroficial.gob.ec/normas/decreto-1234-ec",
    tipoRestriccion: "Cupo de exportación reservado a operadores históricos",
    canalTransmision: "Incumbentes/competencia",
    afectacionMipyme: "Alta" as const,
    accionCategoria: "Proporcionalizar" as const,
    fuente: "Ministerio de Producción, Comercio Exterior" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Crítico" as const,
      estadoHitl: "Etapa 3" as const,
      comentarioBID: "Barrera de competencia significativa: el requisito de historial excluye por diseño a nuevos entrantes calificados.",
      comentarioConsultor: "Recomendamos reservar un porcentaje del cupo para nuevos exportadores calificados.",
      comentarioGobierno: "Pendiente de asignación a analista para revisión técnica.",
    },
    accionSugerida: {
      accion: "Reservar un porcentaje mínimo del cupo de exportación para nuevos exportadores calificados",
      prioridad: "Alta" as const,
      tipoCambioRequerido: "Reglamentario · sin pasar por el legislativo",
      factibilidad: "Media" as const,
      objetivoLegitimo: "No, sin justificación de política pública clara",
    },
    descripcion: "Los cupos de exportación bananera a mercados preferenciales se asignan solo a exportadores con historial de tres años en ese mercado, excluyendo a nuevos entrantes calificados.",
    diagnostico: "El requisito de historial de operaciones de tres años excluye por diseño a nuevos exportadores con capacidad de producción y calidad suficiente, consolidando la posición de los operadores ya establecidos y limitando la entrada de nuevos competidores al mercado de exportación preferencial.",
    textNormativo: "Artículo 7. — De la asignación de cupos de exportación bananera.\n\nLos cupos anuales de exportación de banano a mercados con acuerdo comercial preferencial se asignarán exclusivamente a los exportadores que hayan operado en el mercado de destino durante los tres años previos a la apertura del período de asignación, quedando excluidos los nuevos exportadores sin historial de operaciones en dicho mercado, independientemente de su capacidad de producción y cumplimiento de estándares de calidad.",
    pasajeResaltado: "quedando excluidos los nuevos exportadores sin historial de operaciones en dicho mercado, independientemente de su capacidad de producción",
    reforma: {
      dice: "...quedando excluidos los nuevos exportadores sin historial de operaciones en dicho mercado, independientemente de su capacidad de producción y cumplimiento de estándares de calidad.",
      debeDedir: "Un porcentaje mínimo del 15% del cupo anual se reservará para nuevos exportadores que acrediten capacidad de producción y cumplimiento de estándares de calidad, sin exigir historial previo de operaciones en el mercado de destino.",
      palanca: "Neutralidad competitiva",
    },
  },
  // dato de muestra
  {
    id: "certidumbre-por-renovacion-de-registros-pe",
    titulo: "Certidumbre por Renovación de Registros",
    severidad: "Crítico",
    sector: "Agroindustria",
    instrumento: "Regl. Gral. Registros Sanitarios, Art. 47",
    tramitesAfectados: [],
    clasificacion: "Operación",
    subdimension: "Innovación",
    jerarquia: "Reglamentario",
    idHallazgo: "PER-BAR-0801",
    pais: "Perú" as Country,
    anio: 2018,
    entidad: "Ministerio de la Producción",
    enlaceOficial: "elperuano.pe/normas/regl-gral-registros-sanitarios-art-47",
    tipoRestriccion: "Certificación previa obligatoria",
    canalTransmision: "Tiempo/incertidumbre",
    afectacionMipyme: "Alta" as const,
    accionCategoria: "Sustituir" as const,
    fuente: "Gaceta Oficial de Perú" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Crítico" as const,
      estadoHitl: "Por decidir" as const,
      comentarioBID: "Confirmado como barrera crítica: bloqueo de despacho sin alternativa operativa para renovaciones en trámite.",
      comentarioConsultor: "Recomendamos declaración jurada digital con verificación ex-post.",
      comentarioGobierno: "En revisión por el Ministerio de la Producción.",
    },
    accionSugerida: {
      accion: "Sustituir por declaración jurada con verificación posterior",
      prioridad: "Alta" as const,
      tipoCambioRequerido: "Reglamentario · sin pasar por el legislativo",
      factibilidad: "Alta" as const,
      objetivoLegitimo: "Sí, objetivo válido · carga desproporcionada",
    },
    descripcion: "El despacho de productos alimenticios para exportación se bloquea si el registro sanitario está en proceso de renovación, sin alternativa operativa.",
    diagnostico: "La exigencia de registro sanitario vigente como condición para despacho bloquea exportaciones aun cuando la renovación se encuentre en trámite y el exportador tenga historial de cumplimiento, generando pérdidas por contenedores paralizados en puerto.",
    textNormativo: "Artículo 47. — Del despacho de productos alimenticios para exportación.\n\nNingún lote de producto alimenticio destinado a la exportación podrá ser procesado, empacado o despachado sin que el titular cuente con registro sanitario vigente y en plena validez a la fecha de emisión de la guía de tránsito correspondiente. La autoridad sanitaria queda facultada para retener preventivamente cualquier envío en el que el registro sanitario del titular se encuentre en proceso de renovación, independientemente del historial de cumplimiento del exportador.",
    pasajeResaltado: "Ningún lote de producto alimenticio destinado a la exportación podrá ser procesado, empacado o despachado sin que el titular cuente con registro sanitario vigente y en plena validez",
    reforma: {
      dice: "Ningún lote podrá ser despachado sin que el titular cuente con registro sanitario vigente a la fecha de emisión de la guía de tránsito.",
      debeDedir: "Los exportadores con registro en proceso de renovación y con historial de cumplimiento de al menos dos ciclos consecutivos podrán operar bajo declaración jurada digital ante la autoridad sanitaria, quien dispondrá de 30 días para resolver la renovación sin suspensión de operaciones.",
      palanca: "Simplificación / Control ex-post",
    },
  },
  // dato de muestra
  {
    id: "restriccion-de-registro-minero-pe",
    titulo: "Restricción de Registro Minero",
    severidad: "Crítico",
    sector: "Minería",
    instrumento: "D.S. 4523-2023",
    tramitesAfectados: [],
    clasificacion: "Entrada",
    subdimension: "Competencia",
    jerarquia: "Reglamentario",
    idHallazgo: "PER-BAR-0802",
    pais: "Perú" as Country,
    anio: 2023,
    entidad: "Ministerio de Energía y Minas",
    enlaceOficial: "elperuano.pe/normas/ds-4523-2023",
    tipoRestriccion: "Restricción de registro por tamaño de operación",
    canalTransmision: "Costo administrativo",
    afectacionMipyme: "Alta" as const,
    accionCategoria: "Simplificar" as const,
    fuente: "Asamblea Legislativa" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Crítico" as const,
      estadoHitl: "Publicado" as const,
      comentarioBID: "Confirmado: el umbral excluye por diseño a pequeños productores de la exportación directa.",
      comentarioConsultor: "Recomendamos crear una categoría de registro simplificado para pequeña minería.",
      comentarioGobierno: "El Ministerio de Energía y Minas aprobó evaluar la categoría simplificada.",
    },
    accionSugerida: {
      accion: "Crear una categoría de registro simplificado para pequeños productores y mineros artesanales",
      prioridad: "Alta" as const,
      tipoCambioRequerido: "Reglamentario · sin pasar por el legislativo",
      factibilidad: "Media" as const,
      objetivoLegitimo: "No, sin justificación de política pública clara",
    },
    descripcion: "Solo las concesiones con producción certificada superior a las 500 toneladas métricas mensuales pueden inscribirse en el Registro Nacional de Productores Mineros.",
    diagnostico: "El umbral mínimo de producción para el registro excluye por diseño a los pequeños productores y mineros artesanales de la exportación directa, obligándolos a comercializar a través de intermediarios registrados y reduciendo su margen sobre el valor exportado.",
    textNormativo: "Artículo 5. — Del Registro Nacional de Productores Mineros.\n\nSolo podrán inscribirse en el Registro Nacional de Productores Mineros aquellas concesiones con producción certificada superior a las 500 toneladas métricas mensuales, quedando excluidos los pequeños productores y productores mineros artesanales de la posibilidad de exportar directamente sin la intermediación de un productor registrado.",
    pasajeResaltado: "quedando excluidos los pequeños productores y productores mineros artesanales de la posibilidad de exportar directamente sin la intermediación de un productor registrado",
    reforma: {
      dice: "...quedando excluidos los pequeños productores y productores mineros artesanales de la posibilidad de exportar directamente sin la intermediación de un productor registrado.",
      debeDedir: "Se creará una categoría de registro simplificado para pequeños productores y mineros artesanales que les permita exportar directamente, sujeto a los mismos controles de trazabilidad y origen que los productores de mayor escala.",
      palanca: "Neutralidad competitiva",
    },
  },
  // dato de muestra
  {
    id: "capital-minimo-desproporcionado-pe",
    titulo: "Capital Mínimo Desproporcionado",
    severidad: "Crítico",
    sector: "Textil y Confección",
    instrumento: "Ley 1178, Art. 6",
    tramitesAfectados: [],
    clasificacion: "Entrada",
    subdimension: "Inversión",
    jerarquia: "Legal",
    idHallazgo: "PER-BAR-0803",
    pais: "Perú" as Country,
    anio: 2021,
    entidad: "Superintendencia de Banca, Seguros y AFP (SBS)",
    enlaceOficial: "elperuano.pe/normas/ley-1178-art-6",
    tipoRestriccion: "Capital mínimo desproporcionado",
    canalTransmision: "Capital/liquidez",
    afectacionMipyme: "Alta" as const,
    accionCategoria: "Eliminar" as const,
    fuente: "Ministerio de Economía" as const,
    validacion: {
      severidadIA: "Crítico" as const,
      severidadValidada: "Alto" as const,
      estadoHitl: "Etapa 3" as const,
      comentarioBID: "Barrera relevante al acceso de liquidez para proveedores textiles de menor escala.",
      comentarioConsultor: "Sugerimos escalonar el capital mínimo según volumen proyectado de operaciones.",
      comentarioGobierno: "Pendiente de asignación a analista para revisión técnica.",
    },
    accionSugerida: {
      accion: "Escalonar el capital mínimo según el volumen de facturas proyectado a descontar",
      prioridad: "Media" as const,
      tipoCambioRequerido: "Legal · requiere modificación de ley",
      factibilidad: "Baja" as const,
      objetivoLegitimo: "Sí, objetivo válido · medio desproporcionado",
    },
    descripcion: "Las empresas de factoring de facturas textiles deben acreditar un capital mínimo fijo, sin relación con el volumen de operaciones proyectado.",
    diagnostico: "El capital mínimo fijo, sin relación con el volumen real de operaciones proyectado, excluye a empresas de factoring especializadas en proveedores textiles de menor escala, limitando el acceso a liquidez de la cadena de suministro del sector.",
    textNormativo: "Artículo 6. — Del capital mínimo para empresas de factoring textil.\n\nLas empresas que operen como factores de facturas comerciales del sector textil y confecciones deberán acreditar un capital social mínimo equivalente a doscientas unidades impositivas tributarias, con independencia del volumen de facturas a descontar o del segmento de proveedores textiles al que orienten su operación.",
    pasajeResaltado: "deberán acreditar un capital social mínimo equivalente a doscientas unidades impositivas tributarias, con independencia del volumen de facturas a descontar",
    reforma: {
      dice: "...deberán acreditar un capital social mínimo equivalente a doscientas unidades impositivas tributarias, con independencia del volumen de facturas a descontar...",
      debeDedir: "El capital mínimo se determinará en proporción al volumen de facturas proyectado a descontar, con un piso reducido para empresas de factoring especializadas en proveedores textiles de pequeña escala, sujeto a supervisión de la SBS.",
      palanca: "Proporcionalizar",
    },
  },
];

// impactoEstimado -- dato de muestra NUEVO, sin metodología real de costeo
// por barrera individual todavía (solo el agregado por país en
// COUNTRY_DATA[pais].costo / ImpactoEconomico.tsx). Se reparte
// proporcionalmente ese agregado entre las barreras del mismo país,
// ponderando por severidad, afectación MIPYME y canal de transmisión -- las
// 3 variables reales ya existentes en cada registro que más se asocian a
// magnitud económica -- más un desempate determinístico por id (±10%) para
// que dos barreras del mismo país nunca queden con el mismo valor mostrado
// aunque coincidan en las 3 categorías (pasa con 2 de Bolivia). Todas las
// barreras hoy son
// severidad "Crítico" (no hay variación real de severidad todavía), así que
// en la práctica la variación viene de MIPYME + canal + el desempate.
const IMPACTO_SEVERIDAD_PESO: Record<string, number> = { "Crítico": 1.5, "Alto": 1.15, "Mediano": 0.85, "Bajo": 0.6 };
const IMPACTO_MIPYME_PESO: Record<string, number> = { "Alta": 1.3, "Media": 1.0, "Baja": 0.7 };
const IMPACTO_CANAL_PESO: Record<string, number> = {
  "Capital/liquidez": 1.3, "Modelo de negocio": 1.25, "Capacidad técnica": 1.15,
  "Incumbentes/competencia": 1.1, "Tiempo/incertidumbre": 1.0, "Costo administrativo": 0.85,
};
function parseCostoUSD(costo: string): number {
  return parseFloat(costo.replace(/[^\d.]/g, "")) * 1_000_000;
}
function tieBreakPorId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 201;
  return 0.9 + (h / 201) * 0.2; // [0.90, 1.10] -- ±3% no bastaba para separar el
  // dígito mostrado en dos barrerras de Bolivia con severidad/MIPYME/canal
  // idénticos; verificado con las 17 barreras reales que ±10% sí alcanza.
}
function attachImpactoEstimado<T extends { id: string; pais: Country; severidad: string; afectacionMipyme: string; canalTransmision: string }>(barreras: T[]): (T & { impactoEstimado: string })[] {
  const porPais = new Map<Country, T[]>();
  for (const b of barreras) {
    if (!porPais.has(b.pais)) porPais.set(b.pais, []);
    porPais.get(b.pais)!.push(b);
  }
  const pesoPorBarrera = new Map<T, number>();
  for (const b of barreras) {
    pesoPorBarrera.set(b,
      IMPACTO_SEVERIDAD_PESO[b.severidad] * IMPACTO_MIPYME_PESO[b.afectacionMipyme] * IMPACTO_CANAL_PESO[b.canalTransmision] * tieBreakPorId(b.id)
    );
  }
  return barreras.map(b => {
    const grupo = porPais.get(b.pais)!;
    const totalPais = parseCostoUSD(COUNTRY_DATA[b.pais].costo);
    const sumaPesos = grupo.reduce((s, g) => s + pesoPorBarrera.get(g)!, 0);
    const usd = totalPais * pesoPorBarrera.get(b)! / sumaPesos;
    return { ...b, impactoEstimado: `USD ${(usd / 1_000_000).toFixed(1)}M/año` };
  });
}

export const ALL_BARRERAS = attachImpactoEstimado([...BARRERAS_CAFE, ...BARRERAS_TEXTIL, ...BARRERAS_MUESTRA]);

// ─── Filtros compartidos de hallazgos (Reportes / Reporte PDF) ────────────────
// Único lugar donde vive la lógica de filtrado de ALL_BARRERAS/ALL_TRAMITES
// para reportes -- ReportesScreen() (vista previa) y ReportePDFScreen() (ficha
// final) usan EXACTAMENTE esta misma función, para que las dos pantallas nunca
// puedan desalinearse entre sí (antes ReportePDFScreen ignoraba los filtros y
// mostraba fichas de muestra fijas sin relación con lo filtrado en Reportes).
export type FiltrosHallazgos = {
  pais: Country;
  sectores: string[];
  severidades: string[];
  estadoHitl: string[];
  fuentes: string[];
  tipoTramite: string; // solo aplica a trámites; "" = todos
  coberturaMin: number;
  idrMin: number;
};

export const FILTROS_HALLAZGOS_DEFAULT: FiltrosHallazgos = {
  pais: "Todos", sectores: [], severidades: [], estadoHitl: [], fuentes: [], tipoTramite: "", coberturaMin: 0, idrMin: 0,
};

function paisesIncluidosPorMinimos(pais: Country, coberturaMin: number, idrMin: number): Exclude<Country, "Todos">[] | null {
  if (pais !== "Todos") return null;
  return COUNTRIES.filter(c =>
    COBERTURA_MUESTRA[c as Exclude<Country, "Todos">] >= coberturaMin &&
    IRR_GENERAL_MUESTRA[c as Exclude<Country, "Todos">] >= idrMin
  ) as Exclude<Country, "Todos">[];
}

export function filtrarBarreras(f: FiltrosHallazgos) {
  const paisesIncluidos = paisesIncluidosPorMinimos(f.pais, f.coberturaMin, f.idrMin);
  return ALL_BARRERAS.filter(b => {
    if (f.pais !== "Todos" && b.pais !== f.pais) return false;
    if (f.sectores.length > 0 && !f.sectores.includes(b.sector)) return false;
    if (f.severidades.length > 0 && !f.severidades.includes(b.severidad)) return false;
    if (f.estadoHitl.length > 0 && !f.estadoHitl.includes(b.validacion?.estadoHitl ?? "")) return false;
    if (f.fuentes.length > 0 && !f.fuentes.includes(b.fuente)) return false;
    if (paisesIncluidos && !paisesIncluidos.includes(b.pais as Exclude<Country, "Todos">)) return false;
    return true;
  });
}

export function filtrarTramites(f: FiltrosHallazgos) {
  const paisesIncluidos = paisesIncluidosPorMinimos(f.pais, f.coberturaMin, f.idrMin);
  return ALL_TRAMITES.filter(t => {
    if (f.pais !== "Todos" && t.pais !== f.pais) return false;
    if (f.sectores.length > 0 && !f.sectores.includes(t.sector)) return false;
    if (f.tipoTramite && t.tipo !== f.tipoTramite) return false;
    if (f.estadoHitl.length > 0 && !f.estadoHitl.includes(t.estadoHitl ?? "")) return false;
    if (f.fuentes.length > 0 && !f.fuentes.includes(t.fuente)) return false;
    if (paisesIncluidos && !paisesIncluidos.includes(t.pais as Exclude<Country, "Todos">)) return false;
    return true;
  });
}

// ─── Exportación de reportes (PDF / Excel) ─────────────────────────────────────
// Usado por ReportesScreen() (Excel, sobre previewBarreras/previewTramites) y
// ReportePDFScreen() (Excel + PDF, sobre los mismos hallazgosBarreras/
// hallazgosTramites ya filtrados con filtrarBarreras/filtrarTramites) -- nunca
// se recalcula el filtro acá, solo se recibe el array ya filtrado. Esto sigue
// funcionando igual el día que haya datos reales: ALL_BARRERAS/ALL_TRAMITES
// pueden pasar a venir de una API en vez de ser arrays en memoria y esta
// exportación no cambia, porque solo depende de recibir el array ya filtrado.

// Nombre de archivo seguro: sin acentos, espacios ni caracteres especiales.
function slugArchivo(s: string): string {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // quita acentos
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "todos";
}
function fechaSlugHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

// Genera y descarga el .xlsx de hallazgos filtrados -- una hoja, columnas
// distintas según tipoHallazgo (ver especificación en la tarea de export).
export async function exportarHallazgosExcel(
  tipoHallazgo: "distorsion" | "carga",
  hallazgos: (typeof ALL_BARRERAS[number] | typeof ALL_TRAMITES[number])[],
  paisLabel: string,
) {
  const XLSX = await import("xlsx");
  const rows = tipoHallazgo === "distorsion"
    ? (hallazgos as typeof ALL_BARRERAS).map(b => ({
        "ID hallazgo": b.idHallazgo,
        "Barrera": b.titulo,
        "País": b.pais,
        "Clasificación": b.clasificacion,
        "Subdimensión": b.subdimension,
        "Sector": b.sector,
        "Severidad": b.severidad,
        "Instrumento": b.instrumento,
        "Fuente": b.fuente,
        "Canal de transmisión": b.canalTransmision,
        "Afectación MIPYME": b.afectacionMipyme,
        "Acción de mejora (categoría)": b.accionCategoria,
        "Estado HITL": b.validacion.estadoHitl,
        "Impacto estimado": b.impactoEstimado,
      }))
    : (hallazgos as typeof ALL_TRAMITES).map(t => ({
        "ID trámite": t.id,
        "Trámite": t.nombre,
        "País": t.pais,
        "Entidad": t.entidad,
        "Tipo de usuario": t.tipo,
        "Sector": t.sector,
        "Severidad": t.severidad,
        "Fuente": t.fuente,
        "Canal de transmisión": t.canalTransmision,
        "Afectación MIPYME": t.afectacionMipyme,
        "Acción de mejora (categoría)": t.accionCategoria,
        "Estado HITL": t.estadoHitl,
        "Costo estimado": t.costo.monetario,
      }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, tipoHallazgo === "distorsion" ? "Distorsión" : "Carga");
  XLSX.writeFile(wb, `RegLAC_datos_${tipoHallazgo}_${slugArchivo(paisLabel)}_${fechaSlugHoy()}.xlsx`);
}

// Captura `container` bloque por bloque (cada elemento con className
// "pdf-block" -- portada, encabezado de instrumento, cada ficha individual)
// y arma un PDF paginado, sin cortar ningún bloque a la mitad entre páginas
// cuando cabe completo en una página. Cada ficha ya lleva
// `pageBreakInside: "avoid"` en su estilo (ver FichaDistorsion/FichaCarga)
// para que también se respete si algún día se imprime directo desde el
// navegador en vez de por este camino.
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
}

export async function exportarReportePdf(container: HTMLElement, nombreArchivo: string) {
  const [html2canvasMod, jsPdfMod] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const html2canvas = html2canvasMod.default;
  const { jsPDF } = jsPdfMod;

  const bloques = Array.from(container.querySelectorAll<HTMLElement>(".pdf-block"));
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Margen uniforme en las 4 direcciones -- antes se ubicaba cada imagen a
  // ancho completo de página (0 margen). Mismo valor para portada y fichas.
  const MARGIN = 15;
  const contentWidth = pageWidth - MARGIN * 2;
  const contentBottom = pageHeight - MARGIN;
  // Espacio vertical entre dos fichas que comparten página (el margin-bottom
  // que cada ficha tiene en pantalla no se captura -- getBoundingClientRect/
  // html2canvas miden la caja del bloque sin su margen externo).
  const GAP_ENTRE_BLOQUES = 5;

  let cursorY = MARGIN;
  let esPrimerBloque = true;

  for (const bloque of bloques) {
    const esPortada = esPrimerBloque;
    const canvas = await html2canvas(bloque, { scale: 1.5, useCORS: true, backgroundColor: "#ffffff" });
    // JPEG en vez de PNG -- un reporte de 17 fichas en PNG sin comprimir pesa
    // ~170MB (impracticable para descargar); el contenido es texto/tarjetas
    // sobre fondo blanco, no fotografía, así que JPEG calidad 0.85 reduce el
    // peso a un rango normal sin pérdida visible de nitidez del texto.
    const imgData = canvas.toDataURL("image/jpeg", 0.85);

    let imgWidth = contentWidth;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
    let x = MARGIN;

    if (esPortada) {
      // Portada: es la tapa del documento, no una tarjeta dentro de la
      // página -- el fondo (mismo color que la portada real, C.steel4) debe
      // llegar a los 4 bordes de la hoja. Se pinta un rectángulo a página
      // completa con ese color y la imagen capturada (que ya trae su propio
      // padding interno: logo, título, filtros, pie) se apoya encima a
      // ancho completo, sin el MARGIN que sí aplica a las fichas -- como
      // ambos son exactamente el mismo azul, no se nota costura entre el
      // relleno y la imagen aunque esta no llegue a cubrir el 100% del alto.
      const [r, g, b] = hexToRgb(C.steel4);
      pdf.setFillColor(r, g, b);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      let pw = pageWidth;
      let ph = (canvas.height * pw) / canvas.width;
      let px = 0;
      if (ph > pageHeight) {
        const factor = pageHeight / ph;
        ph = pageHeight;
        pw = pw * factor;
        px = (pageWidth - pw) / 2;
      }
      const py = (pageHeight - ph) / 2;
      pdf.addImage(imgData, "JPEG", px, py, pw, ph);
      pdf.addPage();
      cursorY = MARGIN;
      esPrimerBloque = false;
      continue;
    }

    // Ficha (o encabezado de instrumento) más alta que el área con margen de
    // una página entera: se reduce a escala para que quepa completa en una
    // sola página en vez de cortarla -- "no cortar una ficha a la mitad" es
    // la prioridad sobre mantener el ancho completo del margen.
    const maxHeightUnaPagina = contentBottom - MARGIN;
    if (imgHeight > maxHeightUnaPagina) {
      const factor = maxHeightUnaPagina / imgHeight;
      imgHeight = maxHeightUnaPagina;
      imgWidth = imgWidth * factor;
      x = MARGIN + (contentWidth - imgWidth) / 2;
    }

    if (!esPrimerBloque && cursorY + imgHeight > contentBottom) {
      pdf.addPage();
      cursorY = MARGIN;
    }
    pdf.addImage(imgData, "JPEG", x, cursorY, imgWidth, imgHeight);
    cursorY += imgHeight + GAP_ENTRE_BLOQUES;
    esPrimerBloque = false;
  }

  pdf.save(`${nombreArchivo}.pdf`);
}

// ─── Distorsiones de carga ─────────────────────────────────────────────────────
const IRR_LABELS: Record<number, string> = { 4: "Crítico", 3: "Alto", 2: "Mediano", 1: "Bajo" };

type Distorsion = {
  id: string;
  nombre: string;
  tipoCarga: string;
  subdimension: string;
  irr: number;
  tramiteId: string;
  tramiteNombre: string;
  etapaCicloVida: string;
  instrumento: string;
  articulo: string;
  textNormativo: string;
  pasajeResaltado: string;
  diagnostico: string;
  justificacion: string;
};

const ALL_DISTORSIONES: Distorsion[] = [
  {
    id: "DC-001",
    nombre: "Vinculación de certificado al lote de origen",
    tipoCarga: "Certidumbre",
    subdimension: "Certidumbre procedimental",
    irr: 4,
    tramiteId: "cert-exportacion",
    tramiteNombre: "Certificado de Exportación y de Origen",
    etapaCicloVida: "Operación",
    instrumento: "Reglamento General de Registros Sanitarios, Art. 47",
    articulo: "Art. 47, párrafo tercero",
    textNormativo: "El certificado de exportación debe emitirse por operación individual y estar vinculado al número de registro sanitario del lote de acopio correspondiente. No se admitirán certificados globales ni agrupados por período.",
    pasajeResaltado: "estar vinculado al número de registro sanitario del lote de acopio correspondiente",
    diagnostico: "La exigencia de vincular el certificado a un lote específico impide la emisión anticipada o por volumen, creando un cuello de botella en períodos de alta demanda. El exportador no puede despachar sin el certificado físico, lo que genera demoras cuando el registro sanitario del lote está en proceso de renovación.",
    justificacion: "La regulación responde a un objetivo legítimo de trazabilidad sanitaria, pero el diseño del requisito es desproporcionado: exige coincidencia exacta de lote cuando bastaría con verificar el número de registro sanitario vigente del producto. La restricción no guarda proporción con el riesgo sanitario real del café de exportación.",
  },
  {
    id: "DC-002",
    nombre: "Prohibición de certificación global por período",
    tipoCarga: "Accesibilidad",
    subdimension: "Diseño y estructura de trámites",
    irr: 3,
    tramiteId: "cert-exportacion",
    tramiteNombre: "Certificado de Exportación y de Origen",
    etapaCicloVida: "Operación",
    instrumento: "Reglamento General de Registros Sanitarios, Art. 47",
    articulo: "Art. 47, párrafo cuarto",
    textNormativo: "No se admitirán certificados globales ni agrupados por período. Cada solicitud de certificado corresponde a una operación de exportación identificada con número de guía aduanera independiente.",
    pasajeResaltado: "No se admitirán certificados globales ni agrupados por período",
    diagnostico: "La prohibición de certificados globales multiplica la carga administrativa para exportadores con alta frecuencia de operaciones. Empresas con 36 operaciones anuales deben gestionar 36 expedientes idénticos en lugar de una autorización marco.",
    justificacion: "La medida carece de justificación técnica en el contexto del sistema de trazabilidad electrónica ya existente. Otros países de la región permiten certificados por volumen o por período de cosecha sin menoscabo del control sanitario.",
  },
  {
    id: "DC-003",
    nombre: "Registro por presentación de empaque",
    tipoCarga: "Cumplimiento",
    subdimension: "Trámites y requisitos de cumplimiento",
    irr: 4,
    tramiteId: "registro-sanitario",
    tramiteNombre: "Obtención de Registro Sanitario de Alimentos",
    etapaCicloVida: "Apertura",
    instrumento: "Reglamento Técnico Sanitario de Alimentos, Disposición 12-B",
    articulo: "Disposición 12-B, inciso ii",
    textNormativo: "Toda presentación, envase o empaque diferente del mismo producto alimenticio constituirá un producto diferente a efectos del registro sanitario y deberá tramitar su propio registro de forma independiente.",
    pasajeResaltado: "constituirá un producto diferente a efectos del registro sanitario",
    diagnostico: "El tratamiento de cada presentación como producto independiente obliga a duplicar íntegramente el trámite de registro, incluyendo análisis de laboratorio, formulario completo y pago de arancel, aun cuando la fórmula y el proceso productivo sean idénticos. El costo incremental por presentación adicional es de USD 850.",
    justificacion: "La distinción por empaque no guarda relación con el riesgo sanitario del producto, que depende de su composición y proceso, no de su envase. La normativa internacional (Codex Alimentarius) no exige registros separados por presentación cuando la formulación es la misma.",
  },
  {
    id: "DC-004",
    nombre: "Reporte manual de carnets de proveedor",
    tipoCarga: "Cumplimiento",
    subdimension: "Duplicidad e interoperabilidad",
    irr: 4,
    tramiteId: "declaracion-mensual-isv",
    tramiteNombre: "Declaración Jurada Mensual de ISV",
    etapaCicloVida: "Operación",
    instrumento: "Resolución SAR-DGT-2019-0044",
    articulo: "Art. 8, párrafo segundo",
    textNormativo: "El contribuyente deberá adjuntar a la declaración mensual un listado detallado de los carnets de identificación tributaria de todos sus proveedores y el monto de las compras efectuadas, debidamente certificado por contador público colegiado.",
    pasajeResaltado: "listado detallado de los carnets de identificación tributaria de todos sus proveedores",
    diagnostico: "La información sobre carnets de proveedores ya reposa en los registros de facturación electrónica del SAR. La exigencia de reportarla nuevamente en formato físico certificado crea una carga de cumplimiento sin valor informativo adicional para la administración.",
    justificacion: "El requisito viola el principio de interoperabilidad entre sistemas públicos. El Estado ya dispone de la información en el sistema de facturación electrónica; la exigencia de duplicación tiene por único efecto generar costos de cumplimiento para el contribuyente sin reducir el riesgo fiscal.",
  },
  {
    id: "DC-005",
    nombre: "Certificación contable obligatoria mensual",
    tipoCarga: "Accesibilidad",
    subdimension: "Costos y cargas recurrentes",
    irr: 3,
    tramiteId: "declaracion-mensual-isv",
    tramiteNombre: "Declaración Jurada Mensual de ISV",
    etapaCicloVida: "Operación",
    instrumento: "Resolución SAR-DGT-2019-0044",
    articulo: "Art. 8, párrafo segundo, in fine",
    textNormativo: "El listado de carnets de proveedor deberá estar debidamente certificado por contador público colegiado con firma y sello originales en cada página.",
    pasajeResaltado: "debidamente certificado por contador público colegiado con firma y sello originales",
    diagnostico: "La certificación mensual por contador implica un costo recurrente de USD 60–120 por declaración, equivalente a USD 720–1,440 anuales, por un trámite cuyo contenido podría verificarse automáticamente contra los registros fiscales existentes.",
    justificacion: "La exigencia de certificación profesional presencial sobre información ya disponible en formato digital es desproporcionada y crea una barrera de costo recurrente que afecta desproporcionalmente a las micro y pequeñas empresas del sector textil.",
  },
  {
    id: "DC-006",
    nombre: "Restricción a operadores de maquila en zona franca",
    tipoCarga: "Certidumbre",
    subdimension: "Certidumbre procedimental",
    irr: 4,
    tramiteId: "registro-exportador",
    tramiteNombre: "Registro de Exportador",
    etapaCicloVida: "Apertura",
    instrumento: "Decreto PCM-027-2022, Art. 14",
    articulo: "Art. 14, párrafo primero",
    textNormativo: "Para obtener el registro de exportador en la categoría de productos procesados, el solicitante deberá acreditar que las operaciones de transformación se realizan en instalaciones propias ubicadas dentro del territorio nacional, excluidas las zonas de libre comercio.",
    pasajeResaltado: "excluidas las zonas de libre comercio",
    diagnostico: "La exclusión de zonas francas impide que los operadores de maquila accedan al registro de exportador en la categoría de procesados, obligándolos a tramitar bajo categorías menos convenientes o a reubicar operaciones, con un impacto estimado de USD 1,200 por operación de exportación.",
    justificacion: "La restricción no tiene correlato en la normativa de origen preferencial que Bolivia aplica en sus acuerdos comerciales. La exclusión de zonas francas discrimina a un modelo de negocio legítimo sin que medie riesgo de fraude adicional al verificable por los mecanismos de control aduanero ordinarios.",
  },
];

// ─── Extended tramites with numeric cost + extra rows for list/pagination ─────
const TRAMITES_COST_MAP: Record<string, number> = {
  "cert-exportacion": 15120,
  "registro-sanitario": 850,
  "declaracion-mensual-isv": 2160,
};
const TRAMITES_EXT = [
  ...ALL_TRAMITES.map(t => ({
    ...t,
    costoNum: TRAMITES_COST_MAP[t.id] ?? 0,
    requisitos: t.pasos.length,
    tamano: "Grande",
    ciclo: t.etapa,
    año: 2022,
  })),
  { id: "habilitacion-municipal",  nombre: "Habilitación Municipal de Negocio",          entidad: "Alcaldía Municipal de La Paz",             etapa: "Apertura",   tipo: "Empresarial", sector: "Construcción y Obra Pública",         costoNum: 4200,  requisitos: 9,  tamano: "Mediana",  ciclo: "Apertura",   año: 2021, costo: { monetario: "USD 4,200/año"   }, barrerasAfectadas: [], pasos: [] },
  { id: "permiso-operacion-mef",   nombre: "Permiso de Operación MEF",                   entidad: "Min. de Economía y Finanzas",              etapa: "Operación",  tipo: "Empresarial", sector: "Servicios Financieros y de Seguros",  costoNum: 8900,  requisitos: 12, tamano: "Grande",   ciclo: "Operación",  año: 2023, costo: { monetario: "USD 8,900/año"   }, barrerasAfectadas: [], pasos: [] },
  { id: "registro-exportador",     nombre: "Registro de Exportador",                     entidad: "SENAVEX",                                 etapa: "Apertura",   tipo: "Empresarial", sector: "Agroindustria Cafetalera",            costoNum: 1200,  requisitos: 7,  tamano: "Pequeña",  ciclo: "Apertura",   año: 2020, costo: { monetario: "USD 1,200/op."   }, barrerasAfectadas: ["restriccion-operadores"], pasos: [] },
  { id: "licencia-funcionamiento", nombre: "Licencia de Funcionamiento Industrial",      entidad: "SENAVEX",                                 etapa: "Apertura",   tipo: "Empresarial", sector: "Textil y Confección",                 costoNum: 3400,  requisitos: 10, tamano: "Mediana",  ciclo: "Apertura",   año: 2022, costo: { monetario: "USD 3,400/año"   }, barrerasAfectadas: [], pasos: [] },
  { id: "declaracion-planilla",    nombre: "Declaración de Planilla Laboral",             entidad: "Min. de Trabajo, Empleo y Prev. Social", etapa: "Operación",  tipo: "Empresarial", sector: "Autopartes y Arneses",                costoNum: 960,   requisitos: 5,  tamano: "Grande",   ciclo: "Operación",  año: 2019, costo: { monetario: "USD 960/año"     }, barrerasAfectadas: [], pasos: [] },
  { id: "autorizacion-transito",   nombre: "Autorización de Tránsito Aduanero",          entidad: "Aduana Nacional de Bolivia",              etapa: "Operación",  tipo: "Empresarial", sector: "Autopartes y Arneses",                costoNum: 2700,  requisitos: 8,  tamano: "Grande",   ciclo: "Operación",  año: 2021, costo: { monetario: "USD 2,700/op."   }, barrerasAfectadas: [], pasos: [] },
  { id: "inspeccion-sanitaria",    nombre: "Inspección Sanitaria Periódica",              entidad: "SENASAG",                                 etapa: "Operación",  tipo: "Empresarial", sector: "Agroindustria Cafetalera",            costoNum: 1800,  requisitos: 6,  tamano: "Mediana",  ciclo: "Operación",  año: 2020, costo: { monetario: "USD 1,800/año"   }, barrerasAfectadas: [], pasos: [] },
  { id: "registro-marca",          nombre: "Registro de Marca Comercial",                 entidad: "SENAPI",                                  etapa: "Apertura",   tipo: "Ciudadano",   sector: "Textil y Confección",                 costoNum: 480,   requisitos: 5,  tamano: "Micro",    ciclo: "Apertura",   año: 2018, costo: { monetario: "USD 480/marca"   }, barrerasAfectadas: [], pasos: [] },
  { id: "cierre-empresa",          nombre: "Cancelación de Matrícula de Comercio",       entidad: "FUNDEMPRESA",                             etapa: "Cierre",     tipo: "Empresarial", sector: "Servicios Financieros y de Seguros",  costoNum: 620,   requisitos: 7,  tamano: "Pequeña",  ciclo: "Cierre",     año: 2023, costo: { monetario: "USD 620/trámite" }, barrerasAfectadas: [], pasos: [] },
  { id: "autorizacion-ampliacion", nombre: "Autorización de Ampliación de Planta",       entidad: "Min. de Medio Ambiente y Agua",           etapa: "Expansión",  tipo: "Empresarial", sector: "Construcción y Obra Pública",         costoNum: 11200, requisitos: 14, tamano: "Grande",   ciclo: "Expansión",  año: 2024, costo: { monetario: "USD 11,200/op." }, barrerasAfectadas: [], pasos: [] },
];

// ─── Regional Dashboard data ───────────────────────────────────────────────────
const COUNTRY_CARGA: Record<string, { total: number; criticas: number }> = {
  Argentina: { total: 478, criticas: 62 },
  Bolivia:   { total: 397, criticas: 52 },
  Chile:     { total: 289, criticas: 33 },
  Ecuador:   { total: 368, criticas: 47 },
  Perú:      { total: 319, criticas: 41 },
};

export const JERARQUIA_NORMATIVA_DATA: BarrasComposicionCategoria[] = [
  { nombre: "Argentina", total: 421, componentes: [
    { nombre: "Constitucional",  valor: 8   },
    { nombre: "Legal",           valor: 76  },
    { nombre: "Reglamentario",   valor: 139 },
    { nombre: "Administrativo",  valor: 126 },
    { nombre: "Técnico o local", valor: 72  },
  ]},
  { nombre: "Perú",      total: 415, componentes: [
    { nombre: "Constitucional",  valor: 8   },
    { nombre: "Legal",           valor: 75  },
    { nombre: "Reglamentario",   valor: 137 },
    { nombre: "Administrativo",  valor: 124 },
    { nombre: "Técnico o local", valor: 71  },
  ]},
  { nombre: "Chile",     total: 358, componentes: [
    { nombre: "Constitucional",  valor: 7   },
    { nombre: "Legal",           valor: 64  },
    { nombre: "Reglamentario",   valor: 118 },
    { nombre: "Administrativo",  valor: 107 },
    { nombre: "Técnico o local", valor: 62  },
  ]},
  { nombre: "Ecuador",   total: 336, componentes: [
    { nombre: "Constitucional",  valor: 7   },
    { nombre: "Legal",           valor: 60  },
    { nombre: "Reglamentario",   valor: 111 },
    { nombre: "Administrativo",  valor: 101 },
    { nombre: "Técnico o local", valor: 57  },
  ]},
  { nombre: "Bolivia",   total: 312, componentes: [
    { nombre: "Constitucional",  valor: 6   },
    { nombre: "Legal",           valor: 56  },
    { nombre: "Reglamentario",   valor: 103 },
    { nombre: "Administrativo",  valor: 94  },
    { nombre: "Técnico o local", valor: 53  },
  ]},
];

const CLASIFICACION_BARRERAS_DATA: BarrasComposicionCategoria[] = [
  { nombre: "Entrada", total: 231, componentes: [
    { nombre: "Comercio",    valor: 89 },
    { nombre: "Competencia", valor: 76 },
    { nombre: "Inversión",   valor: 66 },
  ]},
  { nombre: "Operación", total: 166, componentes: [
    { nombre: "Competencia", valor: 61 },
    { nombre: "Inversión",   valor: 57 },
    { nombre: "Innovación",  valor: 48 },
  ]},
];

const CARGA_TIPO_BOL_DATA: BarrasComposicionCategoria[] = [
  { nombre: "Certidumbre", total: 247, componentes: [
    { nombre: "Discrecionalidad administrativa",             valor: 58 },
    { nombre: "Trámites y requisitos de cumplimiento",       valor: 47 },
    { nombre: "Certidumbre procedimental",                   valor: 43 },
    { nombre: "Duplicidad e interoperabilidad",              valor: 39 },
    { nombre: "Diseño y estructura de trámites",             valor: 36 },
    { nombre: "Recursos y debido proceso",                   valor: 24 },
  ]},
  { nombre: "Accesibilidad", total: 168, componentes: [
    { nombre: "Duplicidad e interoperabilidad",  valor: 94 },
    { nombre: "Digitalización y accesibilidad",  valor: 74 },
  ]},
  { nombre: "Cumplimiento", total: 141, componentes: [
    { nombre: "Trámites y requisitos de cumplimiento", valor: 82 },
    { nombre: "Costos y cargas recurrentes",           valor: 59 },
  ]},
  { nombre: "Proporcionalidad", total: 56, componentes: [
    { nombre: "Proporcionalidad e inspecciones basado en riesgo", valor: 56 },
  ]},
];

const PANEL_BARRERAS_CLASIFICACION_DATA: Record<string, TipoDato> = {
  "Entrada": {
    niveles: { n4: 58, n3: 97, n2: 52, n1: 24 },
    subdimensiones: [
      { nombre: "Comercio",    niveles: { n4: 22, n3: 38, n2: 19, n1: 10 } },
      { nombre: "Competencia", niveles: { n4: 19, n3: 32, n2: 17, n1: 8  } },
      { nombre: "Inversión",   niveles: { n4: 17, n3: 27, n2: 16, n1: 6  } },
    ],
  },
  "Operación": {
    niveles: { n4: 33, n3: 71, n2: 44, n1: 18 },
    subdimensiones: [
      { nombre: "Competencia", niveles: { n4: 12, n3: 26, n2: 16, n1: 7 } },
      { nombre: "Inversión",   niveles: { n4: 12, n3: 24, n2: 15, n1: 6 } },
      { nombre: "Innovación",  niveles: { n4: 9,  n3: 21, n2: 13, n1: 5 } },
    ],
  },
};

const PANEL_CARGA_TIPO_DATA: Record<string, TipoDato> = {
  "Accesibilidad": {
    niveles: { n4: 31, n3: 62, n2: 49, n1: 26 },
    subdimensiones: [
      { nombre: "Duplicidad e interoperabilidad", niveles: { n4: 18, n3: 35, n2: 27, n1: 14 } },
      { nombre: "Digitalización y accesibilidad", niveles: { n4: 13, n3: 27, n2: 22, n1: 12 } },
    ],
  },
  "Certidumbre": {
    niveles: { n4: 52, n3: 94, n2: 68, n1: 33 },
    subdimensiones: [
      { nombre: "Discrecionalidad administrativa",       niveles: { n4: 14, n3: 22, n2: 15, n1: 7 } },
      { nombre: "Trámites y requisitos de cumplimiento", niveles: { n4: 10, n3: 18, n2: 13, n1: 6 } },
      { nombre: "Certidumbre procedimental",             niveles: { n4: 9,  n3: 16, n2: 12, n1: 6 } },
      { nombre: "Duplicidad e interoperabilidad",        niveles: { n4: 8,  n3: 15, n2: 11, n1: 5 } },
      { nombre: "Diseño y estructura de trámites",       niveles: { n4: 7,  n3: 14, n2: 10, n1: 5 } },
      { nombre: "Recursos y debido proceso",             niveles: { n4: 4,  n3: 9,  n2: 7,  n1: 4 } },
    ],
  },
  "Cumplimiento": {
    niveles: { n4: 29, n3: 54, n2: 38, n1: 20 },
    subdimensiones: [
      { nombre: "Trámites y requisitos de cumplimiento", niveles: { n4: 17, n3: 31, n2: 22, n1: 12 } },
      { nombre: "Costos y cargas recurrentes",           niveles: { n4: 12, n3: 23, n2: 16, n1: 8  } },
    ],
  },
  "Proporcionalidad": {
    niveles: { n4: 11, n3: 21, n2: 16, n1: 8 },
    subdimensiones: [
      { nombre: "Proporcionalidad e inspecciones basado en riesgo", niveles: { n4: 11, n3: 21, n2: 16, n1: 8 } },
    ],
  },
};

// ─── Per-country barreras data ────────────────────────────────────────────────
// Jerarquía data (Bolivia canonical; others scale proportionally from same shape)
type JerarquiaBar = { nombre: string; total: number; n4: number; n3: number; n2: number; n1: number };

function scaleJerarquia(base: JerarquiaBar[], factor: number): JerarquiaBar[] {
  return base.map(b => ({
    nombre: b.nombre,
    n4: Math.round(b.n4 * factor),
    n3: Math.round(b.n3 * factor),
    n2: Math.round(b.n2 * factor),
    n1: Math.round(b.n1 * factor),
    total: Math.round(b.total * factor),
  }));
}
function scaleTipoDato(base: Record<string, TipoDato>, factor: number): Record<string, TipoDato> {
  const result: Record<string, TipoDato> = {};
  for (const key of Object.keys(base)) {
    const d = base[key];
    result[key] = {
      niveles: { n4: Math.round(d.niveles.n4 * factor), n3: Math.round(d.niveles.n3 * factor), n2: Math.round(d.niveles.n2 * factor), n1: Math.round(d.niveles.n1 * factor) },
      subdimensiones: d.subdimensiones.map(s => ({
        nombre: s.nombre,
        niveles: { n4: Math.round(s.niveles.n4 * factor), n3: Math.round(s.niveles.n3 * factor), n2: Math.round(s.niveles.n2 * factor), n1: Math.round(s.niveles.n1 * factor) },
      })),
    };
  }
  return result;
}

const BOL_JERARQUIA: JerarquiaBar[] = [
  { nombre: "Constitucional",  total: 12,  n4: 4,  n3: 5,  n2: 2,  n1: 1  },
  { nombre: "Legal",           total: 78,  n4: 19, n3: 33, n2: 19, n1: 7  },
  { nombre: "Reglamentario",   total: 131, n4: 31, n3: 56, n2: 31, n1: 13 },
  { nombre: "Administrativo",  total: 118, n4: 27, n3: 50, n2: 29, n1: 12 },
  { nombre: "Técnico o local", total: 58,  n4: 10, n3: 24, n2: 15, n1: 9  },
];

export const COUNTRY_BARRERAS_DATA: Record<Country, {
  total: number; criticas: number; irrPromedio: string; sectores: number;
  clasificacion: Record<string, TipoDato>;
  jerarquia: JerarquiaBar[];
}> = (() => {
  const bol = { total: 397, criticas: 91, irrPromedio: "2.8", sectores: 6 };
  const countries: Array<[Country, number, number, string, number]> = [
    ["Todos",     2914, 341, "2.5", 6],
    ["Argentina",  782,  94, "2.6", 6],
    ["Bolivia",    397,  91, "2.8", 6],
    ["Chile",      480,  44, "2.1", 6],
    ["Ecuador",    654,  62, "2.4", 6],
    ["Perú",       601,  50, "2.3", 6],
  ];
  const result = {} as Record<Country, { total: number; criticas: number; irrPromedio: string; sectores: number; clasificacion: Record<string, TipoDato>; jerarquia: JerarquiaBar[] }>;
  for (const [c, total, criticas, irrPromedio, sectores] of countries) {
    const f = total / bol.total;
    result[c] = { total, criticas, irrPromedio, sectores, clasificacion: scaleTipoDato(PANEL_BARRERAS_CLASIFICACION_DATA, f), jerarquia: scaleJerarquia(BOL_JERARQUIA, f) };
  }
  return result;
})();

// Mapea el IRR promedio (escala 1–4, string numérico) a una etiqueta
// categórica de severidad — usado en el KPI "Severidad promedio" del Panel
// Regional de Barreras.
function severidadLabel(v: number): string {
  if (v >= 3.5) return "Alta";
  if (v >= 2.5) return "Media-Alta";
  if (v >= 1.5) return "Media";
  return "Baja";
}

// Mapea el "Puntaje general" del IDR (escala 0–100, IRR_GENERAL_MUESTRA) a una
// etiqueta de nivel de fricción — usado por el KPI "Nivel de fricciones" de
// IndiceIDR.tsx. Escala 0–100, NO confundir con severidadLabel (que es
// escala 1–4).
export function nivelFriccionLabel(v: number): string {
  if (v >= 75) return "Alto";
  if (v >= 50) return "Medio-Alto";
  if (v >= 25) return "Medio";
  return "Bajo";
}

// % validado HITL por país — dato de muestra, sin fuente real todavía (primer
// cruce entre Barreras y el módulo de Validación HITL). "Todos" es el valor
// usado por el KPI regional.
// TODO: reemplazar con el cálculo real cuando exista el cruce Barreras↔HITL.
export const VALIDADO_HITL_MUESTRA: Record<Country, number> = {
  Todos: 68,
  Argentina: 65,
  Bolivia: 68,
  Chile: 74,
  Ecuador: 61,
  Perú: 70,
};

// Badge de estado HITL — reutilizado por la tabla regional y la tabla por
// país de Barreras (antes duplicado en la primera, ahora en un solo lugar).
type EstadoHitl = "Publicado" | "Por decidir" | "Etapa 3";
export const ESTADO_HITL_META: Record<EstadoHitl, { bg: string; color: string }> = {
  "Publicado":   { bg: C.verde2, color: C.verde1 },
  "Por decidir": { bg: C.ambar2, color: C.ambarTexto },
  "Etapa 3":     { bg: "#E8F0FA", color: C.alto },
};

// Top 3 barreras por país según IRR — dato de muestra: no hay catálogo real
// de barreras individuales para Argentina, Chile, Ecuador y Perú todavía
// (solo Bolivia tiene BARRERAS_NIVEL4_LIST; sus 3 filas de abajo reusan
// entradas reales de esa lista).
// TODO: reemplazar por catálogo real por país cuando exista.
const TOP_BARRERAS_POR_PAIS_MUESTRA: Record<Exclude<Country, "Todos">, {
  irr: 4 | 3 | 2 | 1;
  clasificacion: "Entrada" | "Operación";
  subdimension: string;
  sector: string;
  instrumento: string;
  estadoHitl: "Publicado" | "Por decidir" | "Etapa 3";
}[]> = {
  Argentina: [
    { irr: 4, clasificacion: "Entrada",   subdimension: "Comercio",                  sector: "Manufactura Automotriz",      instrumento: "Res. 445/2023",      estadoHitl: "Publicado" },
    { irr: 4, clasificacion: "Operación", subdimension: "Certidumbre procedimental", sector: "Agroindustria y Commodities", instrumento: "Decreto 1187/2022",  estadoHitl: "Por decidir" },
    { irr: 4, clasificacion: "Entrada",   subdimension: "Inversión",                 sector: "Servicios Financieros",       instrumento: "Ley 27.349, Art. 9", estadoHitl: "Etapa 3" },
  ],
  // Reusa 3 entradas reales de BARRERAS_NIVEL4_LIST (bloqueo-renovacion,
  // "Restricción de Venta Local en ZOLI", "Monopolio de Distribución Estatal").
  Bolivia: [
    { irr: 4, clasificacion: "Operación", subdimension: "Certidumbre procedimental", sector: "Agroindustria Cafetalera", instrumento: "Regl. Gral. Registros Sanitarios, Art. 47", estadoHitl: "Por decidir" },
    { irr: 4, clasificacion: "Entrada",   subdimension: "Comercio",                  sector: "Textil y Confección",      instrumento: "Ley ZOLI Art. 12",                          estadoHitl: "Publicado" },
    { irr: 4, clasificacion: "Entrada",   subdimension: "Competencia",               sector: "Fibras Sintéticas",        instrumento: "Decreto Ejecutivo 2891",                    estadoHitl: "Etapa 3" },
  ],
  Chile: [
    { irr: 4, clasificacion: "Entrada",   subdimension: "Comercio",   sector: "Minería y Exportaciones", instrumento: "Decreto PCM-027-2022", estadoHitl: "Etapa 3" },
    { irr: 4, clasificacion: "Operación", subdimension: "Inversión",  sector: "Energías Renovables",     instrumento: "Res. Exenta 118/2021", estadoHitl: "Por decidir" },
    { irr: 4, clasificacion: "Entrada",   subdimension: "Inversión",  sector: "Servicios Financieros",   instrumento: "Ley 21.000, Art. 33",  estadoHitl: "Publicado" },
  ],
  Ecuador: [
    { irr: 4, clasificacion: "Operación", subdimension: "Certidumbre procedimental", sector: "Petróleo y Gas",          instrumento: "Regl. LORHUHI Art. 22", estadoHitl: "Por decidir" },
    { irr: 4, clasificacion: "Entrada",   subdimension: "Comercio",                  sector: "Flores y Exportaciones",  instrumento: "Res. MAG-006-2022",     estadoHitl: "Publicado" },
    { irr: 4, clasificacion: "Entrada",   subdimension: "Competencia",               sector: "Agroindustria Bananera",  instrumento: "Decreto 1234-EC",       estadoHitl: "Etapa 3" },
  ],
  Perú: [
    { irr: 4, clasificacion: "Operación", subdimension: "Certidumbre procedimental", sector: "Agroindustria",       instrumento: "Regl. Gral. Registros Sanitarios, Art. 47", estadoHitl: "Por decidir" },
    { irr: 4, clasificacion: "Entrada",   subdimension: "Comercio",                  sector: "Minería",             instrumento: "D.S. 4523-2023",                            estadoHitl: "Publicado" },
    { irr: 4, clasificacion: "Entrada",   subdimension: "Inversión",                 sector: "Textil y Confección", instrumento: "Ley 1178, Art. 6",                          estadoHitl: "Etapa 3" },
  ],
};

// Sufijo de país usado para armar ids de muestra (slug + sufijo) en las
// tablas "Top N" de Barreras y Trámites.
const PAIS_SUFIJO: Record<Exclude<Country, "Todos">, string> = {
  Argentina: "ar", Bolivia: "bo", Chile: "cl", Ecuador: "ec", Perú: "pe",
};

// Slug de muestra a partir de un nombre/título — usado SOLO cuando no hay un
// registro real con ese mismo nombre/título en ALL_BARRERAS o ALL_TRAMITES
// (ver slugOrRealId más abajo, que hace esa verificación primero).
function slugConSufijo(texto: string, sufijo: string): string {
  const sinTildes = texto.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const slug = sinTildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug}-${sufijo}`;
}

// Antes de generar un id de muestra, busca si ya existe un registro real con
// el mismo nombre/título exacto — si existe, reusa su id real (así el
// onClick ya cableado en las tablas lleva directo a la ficha real en vez de
// caer en el fallback simplificado de BarreraDetail()/TramiteDetail()).
function slugOrRealId(reales: { id: string; nombre: string }[], nombre: string, pais: Exclude<Country, "Todos">): string {
  const real = reales.find(r => r.nombre === nombre);
  return real ? real.id : slugConSufijo(nombre, PAIS_SUFIJO[pais]);
}

// Agrega "id", "titulo", "canal" y "jerarquia" de muestra a cada fila de
// TOP_BARRERAS_POR_PAIS_MUESTRA (se reutiliza tal cual, sin reescribir sus
// campos) para armar la tabla "Top 3 barreras según IRR" del Panel País y la
// tabla regional de Barreras. El id se resuelve con slugOrRealId: si el
// título coincide exacto con una barrera de ALL_BARRERAS (hoy solo
// Bolivia[0], "Bloqueo por Renovación de Registros"), usa ese id real —
// el resto son ids de muestra, sin ficha real todavía. No hay catálogo real
// de barreras individuales para Argentina, Chile, Ecuador y Perú (mismo
// pendiente ya anotado), así que BarreraDetail() les arma una ficha
// reducida solo con lo que trae la fila de la tabla.
const TOP_BARRERAS_PAIS_TABLA_EXTRA: Record<Exclude<Country, "Todos">, { titulo: string; canal: string; jerarquia: string }[]> = {
  Argentina: [
    { titulo: "Registro Obligatorio de Autopartes",                 canal: "Costo administrativo",    jerarquia: "Reglamentario" },
    { titulo: "Demora en Renovación de Permisos Agroindustriales",  canal: "Tiempo/incertidumbre",     jerarquia: "Reglamentario" },
    { titulo: "Capital Mínimo para Nuevas Entidades Financieras",   canal: "Capital/liquidez",         jerarquia: "Legal" },
  ],
  Bolivia: [
    { titulo: "Bloqueo por Renovación de Registros",  canal: "Tiempo/incertidumbre",    jerarquia: "Reglamentario" },
    { titulo: "Restricción de Venta Local en ZOLI",   canal: "Costo administrativo",    jerarquia: "Legal" },
    { titulo: "Monopolio de Distribución Estatal",    canal: "Incumbentes/competencia", jerarquia: "Legal" },
  ],
  Chile: [
    { titulo: "Reporte Semestral de Producción Minera",            canal: "Costo administrativo", jerarquia: "Reglamentario" },
    { titulo: "Garantía de Inversión Renovable Excesiva",          canal: "Capital/liquidez",      jerarquia: "Administrativo" },
    { titulo: "Requisito Técnico Desproporcionado en Financieras", canal: "Capacidad técnica",     jerarquia: "Legal" },
  ],
  Ecuador: [
    { titulo: "Demora en Autorización de Operaciones Petroleras",  canal: "Tiempo/incertidumbre",     jerarquia: "Reglamentario" },
    { titulo: "Certificación Fitosanitaria Redundante",            canal: "Costo administrativo",     jerarquia: "Administrativo" },
    { titulo: "Reserva de Mercado para Exportadores Establecidos", canal: "Incumbentes/competencia",  jerarquia: "Reglamentario" },
  ],
  Perú: [
    { titulo: "Certidumbre por Renovación de Registros", canal: "Tiempo/incertidumbre", jerarquia: "Reglamentario" },
    { titulo: "Restricción de Registro Minero",          canal: "Costo administrativo", jerarquia: "Reglamentario" },
    { titulo: "Capital Mínimo Desproporcionado",         canal: "Capital/liquidez",     jerarquia: "Legal" },
  ],
};

type TopBarrerasPaisFila = {
  irr: 4 | 3 | 2 | 1; clasificacion: "Entrada" | "Operación"; subdimension: string; sector: string; instrumento: string; estadoHitl: "Publicado" | "Por decidir" | "Etapa 3";
  id: string; titulo: string; canal: string; jerarquia: string; pais: Exclude<Country, "Todos">;
};

const ALL_BARRERAS_POR_NOMBRE = ALL_BARRERAS.map(b => ({ id: b.id, nombre: b.titulo }));

const TOP_BARRERAS_PAIS_TABLA: Record<Exclude<Country, "Todos">, TopBarrerasPaisFila[]> = (() => {
  const result = {} as Record<Exclude<Country, "Todos">, TopBarrerasPaisFila[]>;
  for (const pais of COUNTRIES) {
    const key = pais as Exclude<Country, "Todos">;
    result[key] = TOP_BARRERAS_POR_PAIS_MUESTRA[key].map((b, i) => {
      const extra = TOP_BARRERAS_PAIS_TABLA_EXTRA[key][i];
      const id = slugOrRealId(ALL_BARRERAS_POR_NOMBRE, extra.titulo, key);
      return { ...b, ...extra, id, pais: key };
    });
  }
  return result;
})();

// Reparto por canal / acción de mejora / segmento MIPYME, junto a las barreras
// del país — Perú es la base dada; el resto se escala con el mismo factor que
// ya usa scaleTipoDato (total del país / total de Bolivia).
// dato de muestra — nuevo, conecta con "Impacto económico".
function scaleMuestraPorPais(baseParaPeru: { nombre: string; valor: number }[]): Record<Exclude<Country, "Todos">, { nombre: string; valor: number }[]> {
  const bolTotal = COUNTRY_BARRERAS_DATA["Bolivia"].total;
  const result = {} as Record<Exclude<Country, "Todos">, { nombre: string; valor: number }[]>;
  for (const pais of COUNTRIES) {
    const key = pais as Exclude<Country, "Todos">;
    const factor = COUNTRY_BARRERAS_DATA[key].total / bolTotal;
    result[key] = key === "Perú" ? baseParaPeru : baseParaPeru.map(b => ({ nombre: b.nombre, valor: Math.round(b.valor * factor) }));
  }
  return result;
}

// Agrega la entrada "Todos" a un Record de 5 países sumando elemento a
// elemento (mismos nombres/orden en las 5 series) — usado por paneles que
// necesitan el agregado regional (ej. Impacto Económico).
function conTotalTodos(porPais: Record<Exclude<Country, "Todos">, { nombre: string; valor: number }[]>): Record<Country, { nombre: string; valor: number }[]> {
  const nombres = porPais["Bolivia"].map(f => f.nombre);
  const todos = nombres.map((nombre, i) => ({
    nombre,
    valor: COUNTRIES.reduce((s, pais) => s + porPais[pais as Exclude<Country, "Todos">][i].valor, 0),
  }));
  return { ...porPais, Todos: todos };
}

export const CANALES_TRANSMISION_MUESTRA = conTotalTodos(scaleMuestraPorPais([
  { nombre: "Costo administrativo",    valor: 92 },
  { nombre: "Capital/liquidez",        valor: 78 },
  { nombre: "Tiempo/incertidumbre",    valor: 71 },
  { nombre: "Capacidad técnica",       valor: 64 },
  { nombre: "Modelo de negocio",       valor: 56 },
  { nombre: "Incumbentes/competencia", valor: 36 },
]));

const ACCION_MEJORA_MUESTRA = scaleMuestraPorPais([
  { nombre: "Eliminar",         valor: 180 },
  { nombre: "Simplificar",      valor: 113 },
  { nombre: "Sustituir",        valor: 86 },
  { nombre: "Clarificar",       valor: 52 },
  { nombre: "Proporcionalizar", valor: 47 },
]);

// Filas por nivel de afectación MIPYME (Alta/Media/Baja) -- ANTES mostraba
// tamaño de empresa (Microempresa/Pequeña/Mediana), que no tiene forma de
// mapearse al campo real barrera.afectacionMipyme ("Alta"/"Media"/"Baja",
// agregado a ALL_BARRERAS en la tarea de Detalle de Barrera). Cambiado para
// poder cablear el drill-down de "Barreras con afectación MIPYME" /
// "Afectación MIPYME" a HallazgosFiltradosBarreras/Tramites.
// Proporción base (62% Alta / 30% Media / 8% Baja) viene de contar
// ALL_BARRERAS.afectacionMipyme sobre sus 17 registros reales (11 Alta / 5
// Media / 1 Baja ≈ 65/29/6%, redondeado) — no se recalcula en vivo desde
// ALL_BARRERAS para no depender de su orden de declaración en el archivo,
// pero son los mismos números fuente. Mismo criterio usado para
// canalTransmision/afectacionMipyme/tipoAfectacion de ALL_TRAMITES, más abajo.
export const MIPYME_MUESTRA = conTotalTodos(scaleMuestraPorPais([
  { nombre: "Alta",  valor: 156 },
  { nombre: "Media", valor: 71 },
  { nombre: "Baja",  valor: 14 },
]));

// % no estructurado por nivel N2–N6 usado en el Panel País de Barreras —
// distinto del que usa Panorama Regulatorio (DOC_ESTRUCTURA_PCT_MUESTRA),
// dato de muestra por ahora.
const DOC_ESTRUCTURA_PCT_BARRERAS_MUESTRA = [8, 15, 22, 29, 40];

// Canal de transmisión económica de muestra por subdimensión — usado para
// enriquecer las filas reales de BARRERAS_NIVEL4_LIST (Bolivia) en la tabla
// "Top 3 barreras según IRR" del Panel País.
const CANAL_POR_SUBDIMENSION_MUESTRA: Record<string, string> = {
  "Certidumbre procedimental":             "Tiempo/incertidumbre",
  "Discrecionalidad administrativa":       "Tiempo/incertidumbre",
  "Comercio":                              "Costo administrativo",
  "Trámites y requisitos de cumplimiento": "Costo administrativo",
  "Duplicidad e interoperabilidad":        "Costo administrativo",
  "Inversión":                             "Capital/liquidez",
  "Competencia":                           "Incumbentes/competencia",
};

// ─── Barreras nivel-4 list (Bolivia) ──────────────────────────────────────────
const BARRERAS_NIVEL4_LIST = [
  { id: "bloqueo-renovacion",   titulo: "Bloqueo por Renovación de Registros",        irr: 4, clasificacion: "Operación",  subdimension: "Certidumbre procedimental",             jerarquia: "Reglamentario",  sector: "Agroindustria Cafetalera",              entidad: "ARSA",                                               instrumento: "Regl. Gral. Registros Sanitarios, Art. 47" },
  { id: "restriccion-operadores", titulo: "Restricción de Operadores de Maquila",     irr: 4, clasificacion: "Entrada",    subdimension: "Comercio",                             jerarquia: "Legal",          sector: "Agroindustria Cafetalera",              entidad: "SENAVEX",                                            instrumento: "Decreto PCM-027-2022" },
  { id: "reportes-semestrales", titulo: "Registro Físico Obligatorio",                irr: 4, clasificacion: "Operación",  subdimension: "Trámites y requisitos de cumplimiento", jerarquia: "Reglamentario",  sector: "Textil y Confección",                   entidad: "Min. de Desarrollo Productivo",                      instrumento: "Res. MEM-0012-2021" },
  { id: "",                     titulo: "Capital Mínimo Desproporcionado",            irr: 4, clasificacion: "Entrada",    subdimension: "Comercio",                             jerarquia: "Legal",          sector: "Servicios Financieros y de Seguros",    entidad: "ASFI",                                               instrumento: "Ley del Sistema Financiero, Art. 12" },
  { id: "",                     titulo: "Autorización Ex-ante por Lote",              irr: 4, clasificacion: "Operación",  subdimension: "Discrecionalidad administrativa",       jerarquia: "Reglamentario",  sector: "Agroindustria Cafetalera",              entidad: "Min. de Economía y Finanzas Públicas",               instrumento: "Decreto 1188-A" },
  { id: "",                     titulo: "Restricción de Venta Local en ZOLI",         irr: 4, clasificacion: "Entrada",    subdimension: "Comercio",                             jerarquia: "Legal",          sector: "Textil y Confección",                   entidad: "SENAVEX",                                            instrumento: "Ley ZOLI Art. 12" },
  { id: "",                     titulo: "Monopolio de Espectro Radioeléctrico",       irr: 4, clasificacion: "Entrada",    subdimension: "Comercio",                             jerarquia: "Legal",          sector: "Servicios Financieros y de Seguros",    entidad: "ASFI",                                               instrumento: "Ley de Telecomunicaciones, Art. 8" },
  { id: "",                     titulo: "Habilitación Sanitaria por Presentación",    irr: 4, clasificacion: "Entrada",    subdimension: "Certidumbre procedimental",             jerarquia: "Reglamentario",  sector: "Agroindustria Cafetalera",              entidad: "SENASAG",                                            instrumento: "Decreto MEFP-044" },
  { id: "",                     titulo: "Registros Superpuestos entre Entidades",     irr: 4, clasificacion: "Operación",  subdimension: "Duplicidad e interoperabilidad",        jerarquia: "Reglamentario",  sector: "Servicios Financieros y de Seguros",    entidad: "ASFI",                                               instrumento: "Res. IICA 2021-88" },
  { id: "",                     titulo: "Declaración Presencial Obligatoria",         irr: 4, clasificacion: "Operación",  subdimension: "Trámites y requisitos de cumplimiento", jerarquia: "Administrativo", sector: "Construcción y Obra Pública",           entidad: "Alcaldía Municipal de La Paz",                       instrumento: "Decreto Ejecutivo 447" },
  { id: "",                     titulo: "Canal Rojo Aduanero Obligatorio",            irr: 4, clasificacion: "Operación",  subdimension: "Discrecionalidad administrativa",       jerarquia: "Reglamentario",  sector: "Autopartes y Arneses",                  entidad: "Aduana Nacional de Bolivia",                         instrumento: "Reglamento Aduanero CAC" },
  { id: "",                     titulo: "Tasa de Habilitación Excesiva",              irr: 4, clasificacion: "Entrada",    subdimension: "Inversión",                            jerarquia: "Legal",          sector: "Construcción y Obra Pública",           entidad: "Min. de Economía y Finanzas Públicas",               instrumento: "Ley 843 Art. 92" },
  { id: "",                     titulo: "Reserva Obligatoria de Actividad",           irr: 4, clasificacion: "Entrada",    subdimension: "Competencia",                          jerarquia: "Legal",          sector: "Servicios Financieros y de Seguros",    entidad: "Banco Central de Bolivia",                           instrumento: "Código de Comercio Art. 88" },
  { id: "",                     titulo: "Visado Físico de Exportación",               irr: 4, clasificacion: "Operación",  subdimension: "Trámites y requisitos de cumplimiento", jerarquia: "Reglamentario",  sector: "Agroindustria Cafetalera",              entidad: "SENAVEX",                                            instrumento: "Reglamento SENAVEX" },
  { id: "",                     titulo: "Aprobación Ministerial Previa",              irr: 4, clasificacion: "Entrada",    subdimension: "Inversión",                            jerarquia: "Reglamentario",  sector: "Construcción y Obra Pública",           entidad: "Min. de Desarrollo Productivo",                      instrumento: "Res. MEM-0012" },
  { id: "",                     titulo: "Certificación Técnica Redundante",           irr: 4, clasificacion: "Operación",  subdimension: "Duplicidad e interoperabilidad",        jerarquia: "Administrativo", sector: "Autopartes y Arneses",                  entidad: "Aduana Nacional de Bolivia",                         instrumento: "NOM-SFP-2022" },
  { id: "",                     titulo: "Monopolio de Distribución Estatal",          irr: 4, clasificacion: "Entrada",    subdimension: "Competencia",                          jerarquia: "Legal",          sector: "Fibras Sintéticas",                     entidad: "Min. de Economía y Finanzas Públicas",               instrumento: "Decreto Ejecutivo 2891" },
  { id: "",                     titulo: "Contrato Mínimo de 5 Años",                  irr: 4, clasificacion: "Entrada",    subdimension: "Inversión",                            jerarquia: "Reglamentario",  sector: "Servicios Financieros y de Seguros",    entidad: "ASFI",                                               instrumento: "Ley de Inversión Extranjera Art. 5" },
];

const SUBDIMS_BY_CLASIFICACION: Record<string, string[]> = {
  "Entrada":   ["Comercio", "Competencia", "Inversión"],
  "Operación": ["Competencia", "Innovación", "Inversión"],
};

const SUBDIMS_BY_TIPO_CARGA: Record<string, string[]> = {
  "Accesibilidad":    ["Digitalización y accesibilidad", "Duplicidad e interoperabilidad"],
  "Certidumbre":      ["Certidumbre procedimental", "Discrecionalidad administrativa", "Diseño y estructura de trámites", "Duplicidad e interoperabilidad", "Recursos y debido proceso", "Trámites y requisitos de cumplimiento"],
  "Cumplimiento":     ["Costos y cargas recurrentes", "Trámites y requisitos de cumplimiento"],
  "Proporcionalidad": ["Proporcionalidad normativa"],
};

const BARRERA_META: Record<string, { subdimension: string; etapaCicloVida: string }> = {
  "bloqueo-renovacion":    { subdimension: "Certidumbre procedimental",             etapaCicloVida: "Operación" },
  "restriccion-operadores": { subdimension: "Comercio",                              etapaCicloVida: "Apertura"  },
  "reportes-semestrales":  { subdimension: "Trámites y requisitos de cumplimiento", etapaCicloVida: "Operación" },
};

// ─── Tramites screen data constants ───────────────────────────────────────────
const INDICADORES_CUALITATIVOS: Record<string, { name: string; value: number; color: string }[]> = {
  "Cumplimiento":     [{ name: "4 · Crítico", value: 62,  color: C.critico }, { name: "3 · Alto",    value: 154, color: C.alto }, { name: "2 · Mediano", value: 141, color: C.mediano }, { name: "1 · Bajo", value: 71, color: C.bajo }],
  "Accesibilidad":    [{ name: "4 · Crítico", value: 88,  color: C.critico }, { name: "3 · Alto",    value: 167, color: C.alto }, { name: "2 · Mediano", value: 118, color: C.mediano }, { name: "1 · Bajo", value: 55, color: C.bajo }],
  "Certidumbre":      [{ name: "4 · Crítico", value: 104, color: C.critico }, { name: "3 · Alto",    value: 149, color: C.alto }, { name: "2 · Mediano", value: 112, color: C.mediano }, { name: "1 · Bajo", value: 63, color: C.bajo }],
  "Proporcionalidad": [{ name: "4 · Crítico", value: 47,  color: C.critico }, { name: "3 · Alto",    value: 131, color: C.alto }, { name: "2 · Mediano", value: 166, color: C.mediano }, { name: "1 · Bajo", value: 84, color: C.bajo }],
};

const CARGA_REG_DATA = [
  { name: "Carga administrativa excesiva",                     value: 163, color: C.steel2 },
  { name: "Controles superpuestos",                            value: 121, color: C.steel2 },
  { name: "Alta discrecionalidad",                             value: 98,  color: C.steel2 },
  { name: "Baja proporcionalidad con el objetivo de política", value: 46,  color: C.steel2 },
];

const TOP_ENTIDADES_BOLIVIA = [
  { name: "SENAVEX",                                        value: 68 },
  { name: "Aduana Nacional de Bolivia",                     value: 54 },
  { name: "SENASAG",                                        value: 47 },
  { name: "Min. de Trabajo y Previsión Social",             value: 38 },
  { name: "Servicio de Impuestos Nacionales (SIN)",         value: 35 },
  { name: "FUNDEMPRESA",                                    value: 29 },
  { name: "Min. de Medio Ambiente y Agua",                  value: 24 },
  { name: "YPFB",                                           value: 21 },
  { name: "Min. de Producción y Desarrollo Productivo",     value: 18 },
  { name: "ANH",                                            value: 14 },
];

// ─── Trámites — datos por país (junto a COUNTRY_BARRERAS_DATA) ────────────────
// Construido igual que COUNTRY_BARRERAS_DATA: factor = trámites del país /
// trámites de Bolivia (428). "Todos" no existe en COUNTRY_DATA, así que su
// factor se arma sumando los 5 países (1,436 / 428).
// costoEstimadoUSD y criticos: dato derivado (escalado proporcional desde el
// valor real de Bolivia), no medido directamente por país todavía.
// topEntidades: TODO: solo Bolivia tiene catálogo real de entidades emisoras;
// para el resto es la misma composición de TOP_ENTIDADES_BOLIVIA reescalada,
// no un catálogo propio todavía.
export const COUNTRY_TRAMITES_DATA: Record<Country, {
  total: number; costoEstimadoUSD: number; criticos: number;
  cargaPorTipo: Record<string, TipoDato>;
  topEntidades: { name: string; value: number }[];
  tipoUsuario: { empresarial: number; ciudadano: number; mixto: number };
}> = (() => {
  const bolTramites = COUNTRY_DATA["Bolivia"].tramites; // 428
  const totalTodos = COUNTRIES.reduce((s, p) => s + COUNTRY_DATA[p].tramites, 0); // 1,436
  const result = {} as Record<Country, { total: number; costoEstimadoUSD: number; criticos: number; cargaPorTipo: Record<string, TipoDato>; topEntidades: { name: string; value: number }[]; tipoUsuario: { empresarial: number; ciudadano: number; mixto: number } }>;
  for (const c of ["Todos", ...COUNTRIES] as Country[]) {
    const total = c === "Todos" ? totalTodos : COUNTRY_DATA[c].tramites;
    const factor = total / bolTramites;
    const empresarial = Math.round(total * 0.51);
    const ciudadano = Math.round(total * 0.33);
    const mixto = total - empresarial - ciudadano; // asegura que sume exacto al total real del país
    result[c] = {
      total,
      costoEstimadoUSD: Math.round(12_400_000 * factor),
      criticos: Math.round(123 * factor),
      cargaPorTipo: scaleTipoDato(PANEL_CARGA_TIPO_DATA, factor),
      topEntidades: TOP_ENTIDADES_BOLIVIA.map(e => ({ name: e.name, value: Math.round(e.value * factor) })),
      tipoUsuario: { empresarial, ciudadano, mixto },
    };
  }
  return result;
})();

// % validado HITL por país (trámites) — dato de muestra, mismo criterio que
// Barreras. TODO: primer cruce entre Trámites y el módulo de Validación
// HITL, no existe ese cálculo real todavía.
const TRAMITES_VALIDADO_HITL_MUESTRA: Record<Country, number> = {
  Todos: 60,
  Argentina: 58,
  Bolivia: 60,
  Chile: 66,
  Ecuador: 55,
  Perú: 63,
};

const ALL_TRAMITES_POR_NOMBRE = ALL_TRAMITES.map(t => ({ id: t.id, nombre: t.nombre }));

type TramitePrioritarioFila = {
  id: string; tramite: string; entidad: string; eje: string; costo: string;
  severidad: "Crítica" | "Alta"; estadoHitl: EstadoHitl; accion: string;
  tipoUsuario: "Empresarial" | "Ciudadano"; sector: string;
};

export const TRAMITES_PRIORITARIOS_MUESTRA: Record<Exclude<Country, "Todos">, TramitePrioritarioFila[]> = (() => {
  const result = {} as Record<Exclude<Country, "Todos">, TramitePrioritarioFila[]>;
  for (const pais of COUNTRIES) {
    const key = pais as Exclude<Country, "Todos">;
    result[key] = TRAMITES_PRIORITARIOS_BASE[key].map(fila => ({
      ...fila,
      id: slugOrRealId(ALL_TRAMITES_POR_NOMBRE, fila.tramite, key),
    }));
  }
  return result;
})();

// Reparto por etapa del ciclo empresarial / acción de mejora / afectación,
// con el mismo factor que ya usa COUNTRY_TRAMITES_DATA (país.tramites /
// Bolivia.tramites) — distinto del factor de Barreras (scaleMuestraPorPais,
// que usa el total de barreras). `baseCountry` indica qué país trae los
// valores de referencia sin escalar (por defecto Bolivia, que es también el
// denominador del factor, así que su propio factor ya da 1 exacto; para un
// país base distinto — ej. Perú en ETAPA_CICLO_MUESTRA — hace falta el caso
// especial para no reescalarlo).
// dato de muestra — todos los TODO relevantes están junto a cada const.
function scaleMuestraPorPaisTramites(baseValues: { nombre: string; valor: number }[], baseCountry: Exclude<Country, "Todos"> = "Bolivia"): Record<Exclude<Country, "Todos">, { nombre: string; valor: number }[]> {
  const bolTramites = COUNTRY_DATA["Bolivia"].tramites;
  const result = {} as Record<Exclude<Country, "Todos">, { nombre: string; valor: number }[]>;
  for (const pais of COUNTRIES) {
    const key = pais as Exclude<Country, "Todos">;
    if (key === baseCountry) { result[key] = baseValues; continue; }
    const factor = COUNTRY_DATA[key].tramites / bolTramites;
    result[key] = baseValues.map(b => ({ nombre: b.nombre, valor: Math.round(b.valor * factor) }));
  }
  return result;
}

// Misma taxonomía de 4 valores que ya usa el filtro "Etapa del ciclo de
// vida" de esta pantalla (Apertura/Operación/Expansión/Cierre) — no agregar
// otras etapas. Perú es la base dada; no necesita cuadrar con el total de
// trámites (son trámites que pueden repetirse entre etapas).
// TODO: sin metodología real — falta definir cómo se calcula la etapa del
// ciclo empresarial a partir de trámites individuales reales.
const ETAPA_CICLO_MUESTRA = scaleMuestraPorPaisTramites([
  { nombre: "Apertura", valor: 52 },
  { nombre: "Operación", valor: 96 },
  { nombre: "Expansión", valor: 71 },
  { nombre: "Cierre", valor: 34 },
], "Perú");

// Distinta de ACCION_MEJORA_MUESTRA (Barreras) — no reusar esos números
// aunque el patrón visual sea el mismo. Bolivia es la base dada.
// TODO: sin metodología real — falta definir cómo se calcula la acción de
// mejora sugerida a partir de trámites individuales reales.
const TRAMITES_ACCION_MEJORA_MUESTRA = scaleMuestraPorPaisTramites([
  { nombre: "Simplificar", valor: 180 },
  { nombre: "Digitalizar", valor: 113 },
  { nombre: "Interoperar", valor: 86 },
  { nombre: "Clarificar", valor: 52 },
  { nombre: "Proporcionalizar", valor: 47 },
]);

// Antes esta sección repetía los mismos números que "Acciones de mejora en
// trámites" — son series independientes. Bolivia es la base dada.
// TODO: sin metodología real — falta definir cómo se calculan las
// afectaciones a partir de trámites individuales reales.
const TRAMITES_AFECTACIONES_MUESTRA = scaleMuestraPorPaisTramites([
  { nombre: "Costos administrativos", valor: 165 },
  { nombre: "Demoras", valor: 98 },
  { nombre: "Duplicidad", valor: 71 },
  { nombre: "Discrecionalidad", valor: 44 },
  { nombre: "Falta de interoperabilidad", valor: 33 },
]);

// Mismos 6 canales que CANALES_TRANSMISION_MUESTRA (Barreras), pero serie
// INDEPENDIENTE — no son los mismos números (Trámites totaliza 1,436 vs.
// 2,914 de Barreras). Alimenta el panel "Trámites afectados por canal de
// transmisión económica" de Impacto Económico.
// dato de muestra — sin metodología real, igual que la de Barreras.
export const CANALES_TRANSMISION_TRAMITES_MUESTRA = conTotalTodos(scaleMuestraPorPaisTramites([
  { nombre: "Costo administrativo",    valor: 140 },
  { nombre: "Capital/liquidez",        valor: 48 },
  { nombre: "Tiempo/incertidumbre",    valor: 105 },
  { nombre: "Capacidad técnica",       valor: 40 },
  { nombre: "Modelo de negocio",       valor: 30 },
  { nombre: "Incumbentes/competencia", valor: 57 },
]));

// Badge de severidad de trámites — "Crítica"/"Alta" (distinto del vocabulario
// "Crítico"/"Alto"/"Mediano"/"Bajo" de SeverityBadge/SEVERITY_COLOR, que es
// el de la escala IRR de Barreras). Mismo patrón visual que SeverityBadge.
const TRAMITE_SEVERIDAD_COLOR: Record<"Crítica" | "Alta", string> = {
  "Crítica": C.critico,
  "Alta": C.alto,
};
export function TramiteSeveridadBadge({ level }: { level: "Crítica" | "Alta" }) {
  const color = TRAMITE_SEVERIDAD_COLOR[level];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase"
      style={{ backgroundColor: color + "22", color, border: `1px solid ${color}44` }}
    >
      {level}
    </span>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────
export function SeverityBadge({ level }: { level: string }) {
  const color = SEVERITY_COLOR[level] || C.bajo;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase"
      style={{ backgroundColor: color + "22", color, border: `1px solid ${color}44` }}
    >
      {level}
    </span>
  );
}

function KpiTooltip({ content }: { content: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex", verticalAlign: "middle", marginLeft: 5, cursor: "help" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={e => { e.stopPropagation(); setVisible(v => !v); }}
    >
      <Info size={12} color={C.textMuted} />
      {visible && (
        <span style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          width: 248,
          backgroundColor: "#14161A",
          color: "#C8D4DF",
          borderRadius: 8,
          padding: "9px 12px",
          fontSize: 12,
          fontFamily: "IBM Plex Sans, sans-serif",
          lineHeight: 1.55,
          zIndex: 200,
          boxShadow: "0 6px 20px rgba(0,0,0,0.28)",
          pointerEvents: "none",
          whiteSpace: "normal",
          display: "block",
        }}>
          {content}
          <span style={{
            position: "absolute",
            top: "100%", left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid #14161A",
          }} />
        </span>
      )}
    </span>
  );
}

export function BandaCobertura({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-lg"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 14, fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, lineHeight: 1.4 }}>
        {text}
      </span>
    </div>
  );
}

export function KpiCard({ label, value, valueSuffix, sub, valueColor, tooltip }: {
  label: string; value: string; valueSuffix?: string; sub?: string; valueColor?: string; tooltip?: string;
}) {
  return (
    <div className="rounded-lg p-5 flex flex-col justify-between h-[140px]" style={{ backgroundColor: C.card, overflow: "visible", position: "relative" }}>
      <p className="text-[11px] tracking-widest uppercase font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
        {label}
        {tooltip && <KpiTooltip content={tooltip} />}
      </p>
      <p className="font-semibold leading-none" style={{ fontFamily: "Space Grotesk, sans-serif", color: valueColor || C.text, fontSize: 36 }}>
        {value}
        {valueSuffix && (
          <span style={{ fontSize: 18, fontWeight: 500, color: C.textMuted, marginLeft: 3 }}>{valueSuffix}</span>
        )}
      </p>
      {sub && <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{sub}</p>}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  activeCountry,
  activeSection, setActiveSection,
  activeView,
  userRole, setUserRole,
  onNavigate,
  onLogout,
  isDrawerOpen,
  onDrawerClose,
}: {
  activeCountry: Country;
  activeSection: Section;
  setActiveSection: (s: Section) => void;
  activeView: View;
  userRole: UserRole;
  setUserRole: (r: UserRole) => void;
  onNavigate: (v: View) => void;
  onLogout: () => void;
  isDrawerOpen?: boolean;
  onDrawerClose?: () => void;
}) {
  const isMobile = useIsMobile();
  const [adminOpen, setAdminOpen] = useState(activeView.screen === "administracion");
  const [revisionOpen, setRevisionOpen] = useState(activeView.screen.startsWith("revision"));
  const [lang, setLang] = useState<"ES" | "EN">("ES");

  const nav = (fn: () => void) => { fn(); onDrawerClose?.(); };

  const navItem = (label: string, section: Section, icon: React.ReactNode, onClick?: () => void, forceActive?: boolean) => {
    const active = forceActive !== undefined ? forceActive : activeSection === section;
    return (
      <button
        key={label}
        className="w-full flex items-center gap-3 px-6 py-2.5 text-left relative transition-colors"
        style={{
          color: active ? "#FAFBFC" : "#8FA3BA",
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 15,
          background: "none",
          border: "none",
        }}
        onClick={() => {
          setActiveSection(section);
          onClick?.();
        }}
      >
        {active && (
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r" style={{ backgroundColor: C.steel2 }} />
        )}
        {icon}
        {label}
      </button>
    );
  };

  const sidebarPanel = (
    <div className="flex flex-col h-full" style={{ width: isMobile ? "100%" : 240, backgroundColor: C.sidebar }}>
      {/* Logo + close */}
      <div className="px-6 pt-7 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white text-[22px] tracking-wider" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, letterSpacing: 3 }}>RegLAC</span>
        </div>
        {isMobile && (
          <button onClick={onDrawerClose} style={{ background: "none", border: "none", color: "#8FA3BA" }}>
            <X size={22} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItem("Panorama Regulatorio", "dashboard", <BarChart2 size={18} />, () => nav(() => {
          onNavigate({ screen: "panel-regional" });
        }))}
        {navItem("Barreras Regulatorias", "barreras", <AlertTriangle size={18} />, () => nav(() => onNavigate({ screen: "barreras" })))}
        {navItem("Trámites con potencial de mejora", "tramites", <FileText size={18} />, () => nav(() => onNavigate({ screen: "tramites" })))}
        {navItem("Impacto económico", "impacto-economico", <Globe size={18} />, () => nav(() => onNavigate({ screen: "impacto-economico" })))}
        {navItem("Reportes", "reportes", <ClipboardList size={18} />, () => nav(() => onNavigate({ screen: "reportes" })))}
        {navItem("Documentación", "documentacion", <BookOpen size={18} />, () => nav(() => onNavigate({ screen: "documentacion" })))}
        {navItem("Índice / IDR", "indice", <ChartBar size={18} />, () => nav(() => { onNavigate({ screen: "indice" });}))}
        {/* Revisión — visible para asesor, analista, validador y administrador,
            SIEMPRE expandible con los mismos 2 sub-ítems para los 4 roles:
            "Hallazgos" (Repositorio -- Etapa 1 del Asesor ahora vive ahí como
            una fila más, con su propia matriz de visibilidad por rol/etapa) y
            "Log de errores". Antes el Asesor entraba directo a un hallazgo fijo
            porque el Repositorio nunca incluía Etapa 1 en su matriz -- eso ya
            se corrigió, así que todos los roles navegan igual. */}
        {(userRole === "asesor" || userRole === "analista" || userRole === "validador" || userRole === "administrador") && (
          <>
            <button
              className="w-full flex items-center gap-3 px-6 py-3 text-left relative"
              style={{ color: activeSection === "revision" ? "#FAFBFC" : "#8FA3BA", fontFamily: "Space Grotesk, sans-serif", fontSize: 15, background: "none", border: "none" }}
              onClick={() => { setRevisionOpen(!revisionOpen); if (!revisionOpen) { nav(() => onNavigate({ screen: "revision-repositorio" })); } }}
            >
              <ClipboardCheck size={18} />
              <span className="flex-1">Validación HITL</span>
              {revisionOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {revisionOpen && (
              <div className="ml-4 border-l pl-2" style={{ borderColor: "#2A3A4A" }}>
                {navItem("Hallazgos", "revision", <ClipboardList size={16} />, () => nav(() => onNavigate({ screen: "revision-repositorio" })), activeView.screen === "revision-repositorio")}
                {navItem("Log de errores", "revision", <FileText size={16} />, () => nav(() => onNavigate({ screen: "revision-log-errores" })), activeView.screen === "revision-log-errores")}
              </div>
            )}
          </>
        )}
        {/* Administración submenu — visible solo para Administrador */}
        {userRole === "administrador" && (
          <>
            <button
              className="w-full flex items-center gap-3 px-6 py-3 text-left relative"
              style={{ color: activeSection === "administracion" ? "#FAFBFC" : "#8FA3BA", fontFamily: "Space Grotesk, sans-serif", fontSize: 15, background: "none", border: "none" }}
              onClick={() => { setAdminOpen(!adminOpen); if (!adminOpen) { nav(() => onNavigate({ screen: "administracion", tab: "usuarios" })); } }}
            >
              <Settings size={18} />
              <span className="flex-1">Administración</span>
              {adminOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {adminOpen && (
              <div className="ml-4 border-l pl-2" style={{ borderColor: "#2A3A4A" }}>
                {navItem("Usuarios", "administracion", <Settings size={16} />, () => nav(() => onNavigate({ screen: "administracion", tab: "usuarios" })), activeView.screen === "administracion" && (activeView as { screen: "administracion"; tab?: string }).tab === "usuarios")}
                {navItem("Catálogos", "administracion", <Settings size={16} />, () => nav(() => onNavigate({ screen: "administracion", tab: "catalogos" })), activeView.screen === "administracion" && (activeView as { screen: "administracion"; tab?: string }).tab === "catalogos")}
                {navItem("Fuentes", "administracion", <Settings size={16} />, () => nav(() => onNavigate({ screen: "administracion", tab: "fuentes" })), activeView.screen === "administracion" && (activeView as { screen: "administracion"; tab?: string }).tab === "fuentes")}
                {navItem("Bitácora", "administracion", <Settings size={16} />, () => nav(() => onNavigate({ screen: "administracion", tab: "bitacora" })), activeView.screen === "administracion" && (activeView as { screen: "administracion"; tab?: string }).tab === "bitacora")}
              </div>
            )}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-6 py-5 border-t flex flex-col gap-4" style={{ borderColor: "#2A3040" }}>
        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0" style={{ backgroundColor: C.steel3, fontFamily: "Space Grotesk, sans-serif" }}>AM</div>
          <div>
            <p className="text-[13px] text-white font-medium" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Ana Mejía</p>
            <p className="text-[11px]" style={{ color: "#5A6A7A", fontFamily: "IBM Plex Sans, sans-serif" }}>{ROLE_LABEL[userRole]}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 text-[#8FA3BA] hover:text-white transition-colors"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 15, background: "none", border: "none", cursor: "pointer" }}
        >
          <LogOut size={18} />
          Salir
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isDrawerOpen && (
          <>
            {/* Scrim */}
            <div className="fixed inset-0 z-40" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onDrawerClose} />
            {/* Drawer panel */}
            <div className="fixed top-0 left-0 bottom-0 z-50 flex flex-col overflow-hidden" style={{ width: "min(300px, 85vw)", backgroundColor: C.sidebar }}>
              {sidebarPanel}
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen flex-shrink-0" style={{ width: 240, backgroundColor: C.sidebar }}>
      {sidebarPanel}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
// HDR_BTN_PRIMARY/SECONDARY/PILL se importan de ./theme (ver comentario junto
// a los imports, arriba) — re-exportados para no romper a nadie que ya los
// importe desde "./App".
export { HDR_BTN_PRIMARY, HDR_BTN_SECONDARY, HDR_BTN_PILL };

// ─── Campana de notificaciones (Lote 7) ────────────────────────────────────
// Vive aquí, no en src/app/revision/, a propósito: Header se usa en decenas de
// lugares de este archivo (fuera de Revisión también) y siempre corre dentro
// del <RevisionProvider> que envuelve el return de App() -- así que puede
// llamar useRevision() con seguridad sin que cambie la firma de props de
// Header ni haya que tocar sus demás usos. RevisionNotificaciones.tsx (la
// pantalla "ver todas") sí vive en revision/ y se carga vía lazy() como el
// resto -- por eso el mapeo ícono/color de abajo está duplicado ahí: no hay
// un módulo intermedio "seguro" para compartirlo sin el riesgo de ciclo ya
// documentado junto a los imports de revision/* arriba.
const NOTIF_KIND_META: Record<NotifKind, { icon: React.ElementType; color: string; bg: string }> = {
  asignacion: { icon: Inbox, color: C.steel4, bg: `${C.steel3}22` },
  devolucion: { icon: CornerUpLeft, color: C.ambarTexto, bg: C.ambar2 },
  publicado: { icon: Check, color: C.verde1, bg: C.verde2 },
  "no-usado": { icon: Ban, color: C.ambarTexto, bg: C.ambar2 },
  "descartado-triage": { icon: FilterX, color: C.ambarTexto, bg: C.ambar2 },
};
const NOTIF_ACCION_ICON: Record<string, React.ElementType> = {
  "Abrir checklist": ArrowRight,
  "Revisar y reenviar": Edit3,
  "Ver publicado": Eye,
  "Ver motivo": FileText,
};

function NotificationBell() {
  const { notificaciones, currentUserId, onNavigate, marcarLeida, marcarTodasLeidas } = useRevision();
  const [open, setOpen] = useState(false);
  const mias = notificaciones.filter(n => n.destinatarioId === currentUserId);
  const nuevas = mias.filter(n => !n.leida);
  const anteriores = mias.filter(n => n.leida).slice(0, 3);
  const hasUnread = nuevas.length > 0;

  const handleAction = (n: Notificacion) => {
    marcarLeida(n.id);
    setOpen(false);
    if (n.accion) onNavigate(n.accion.screen, n.accion.id);
  };

  const renderItem = (n: Notificacion) => {
    const meta = NOTIF_KIND_META[n.kind];
    const AccionIcon = n.accion ? (NOTIF_ACCION_ICON[n.accion.label] ?? ArrowRight) : null;
    return (
      <div key={n.id} className="flex items-start gap-2.5 px-4 py-3 border-b last:border-0" style={{ borderColor: C.border }}>
        <span className="flex items-center justify-center flex-shrink-0" style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: meta.bg, marginTop: 1 }}>
          <meta.icon size={13} color={meta.color} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12.5, fontWeight: 600, color: C.text }}>{n.titulo}</p>
          <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, marginTop: 1 }}>{n.subtitulo} · {n.fecha}</p>
          {n.accion && (
            <button
              onClick={() => handleAction(n)}
              className="flex items-center gap-1 mt-1"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.steel4, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, fontWeight: 500 }}
            >
              {AccionIcon && <AccionIcon size={11} strokeWidth={2} />}
              {n.accion.label}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 rounded-full flex items-center justify-center relative"
        style={{ backgroundColor: C.steel2, border: "none", cursor: "pointer" }}
      >
        <Bell size={16} color="white" />
        {hasUnread && (
          <span style={{ position: "absolute", top: 5, right: 6, width: 7, height: 7, borderRadius: "50%", backgroundColor: C.critico, border: "1.5px solid white" }} />
        )}
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 rounded-lg overflow-hidden"
            style={{ top: "calc(100% + 8px)", width: 360, maxWidth: "90vw", backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 50 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.border }}>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 14, fontWeight: 600, color: C.text }}>Notificaciones</p>
              {hasUnread && (
                <button onClick={marcarTodasLeidas} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11 }}>
                  Marcar todas como leídas
                </button>
              )}
            </div>
            <div style={{ maxHeight: 420, overflowY: "auto" }}>
              {mias.length === 0 ? (
                <p className="px-4 py-6 text-center" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted }}>Sin notificaciones todavía.</p>
              ) : (
                <>
                  {nuevas.length > 0 && (
                    <>
                      <p className="px-4 pt-3 pb-1" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted }}>Nuevas</p>
                      {nuevas.map(renderItem)}
                    </>
                  )}
                  {anteriores.length > 0 && (
                    <>
                      <p className="px-4 pt-3 pb-1" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted }}>Anteriores</p>
                      {anteriores.map(renderItem)}
                    </>
                  )}
                </>
              )}
            </div>
            <button
              onClick={() => { setOpen(false); onNavigate("revision-notificaciones"); }}
              className="w-full text-center py-2.5"
              style={{ background: "none", borderWidth: 0, borderTopWidth: 1, borderStyle: "solid", borderColor: C.border, cursor: "pointer", color: C.steel4, fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 500 }}
            >
              Ver todas las notificaciones
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// breadcrumb es opcional: HallazgosFiltrados.tsx pide explícitamente
// "sin breadcrumb arriba", así que cuando se omite no se renderiza esa
// línea (no solo texto vacío) — todos los demás usos ya pasan un
// breadcrumb no vacío, así que su comportamiento no cambia.
export function Header({ breadcrumb, title, subtitle, actions }: { breadcrumb?: string; title: string; subtitle?: string; actions?: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <div className="mb-5 md:mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {breadcrumb && <p className="text-[10px] md:text-[11px] uppercase tracking-widest mb-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{breadcrumb}</p>}
          <h1 className="text-[22px] md:text-[28px] font-semibold leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{title}</h1>
          {subtitle && <p className="text-[12px] md:text-[13px] mt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          {actions}
          {!isMobile && (
            <>
              <NotificationBell />
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: C.text, fontFamily: "Space Grotesk, sans-serif" }}>AM</div>
                <span className="text-[14px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>Ana Mejía</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section divider (used across dashboard screens) ──────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="mt-10 mb-6">
      <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, fontSize: 13, color: C.text, textTransform: "uppercase", letterSpacing: "0.10em" }}>
        {label}
      </h2>
      <div style={{ height: 1, backgroundColor: C.border, marginTop: 8 }} />
    </div>
  );
}

// ─── Panorama Regulatorio (Country Dashboard) ─────────────────────────────────
// Screen fusionado: siempre anclado a UN país (sin modo agregado "Todos").
function CountryDashboard({ country, onCountryChange, onNavigate }: { country: string; onCountryChange?: (c: Country) => void; onNavigate: (v: View) => void }) {
  // Antes del early return de abajo -- regla de los Hooks, mismo criterio
  // que ya se aplicó en ReportePDFScreen().
  const { periodosAnalisis } = usePeriodoAnalisis();
  const d = COUNTRY_DATA[country];
  if (!d) return null;

  // ── Datos derivados para el país activo ─────────────────────────────────────
  const paisKey = country as Exclude<Country, "Todos">;
  const instrumentos = JERARQUIA_NORMATIVA_DATA.find(c => c.nombre === country)?.total ?? 0;

  const fuentes = FUENTES_MUESTRA[paisKey] ?? FUENTES_MUESTRA["Bolivia"];
  const irrGeneral = IRR_GENERAL_MUESTRA[paisKey] ?? IRR_GENERAL_MUESTRA["Bolivia"];

  const instrumentosPorPalabras = INSTRUMENTOS_POR_PALABRAS_MUESTRA[paisKey] ?? INSTRUMENTOS_POR_PALABRAS_MUESTRA["Bolivia"];
  const instrumentosPorPalabrasData: BarrasComposicionCategoria[] = JERARQUIA_N2N6_LABELS.map((nombre, i) => ({
    nombre,
    total: instrumentosPorPalabras[i],
    componentes: [{ nombre, valor: instrumentosPorPalabras[i] }],
  }));
  const instrumentosPorPalabrasTotal = instrumentosPorPalabras.reduce((s, v) => s + v, 0);

  const docEstructuraFilas = JERARQUIA_N2N6_LABELS.map((nombre, i) => ({ nombre, pctNoEstructurado: DOC_ESTRUCTURA_PCT_MUESTRA[i] }));

  const fuentesTrazabilidad = FUENTES_TRAZABILIDAD_MUESTRA[paisKey] ?? FUENTES_TRAZABILIDAD_MUESTRA["Bolivia"];
  const tablaExploratoria = TABLA_EXPLORATORIA_MUESTRA[paisKey] ?? TABLA_EXPLORATORIA_MUESTRA["Bolivia"];

  // Trámites y respaldo normativo — se ajusta el último segmento de cada
  // reparto para que la suma cuadre exacto con d.tramites (real).
  const conRespaldo = Math.round(d.tramites * RESPALDO_RATIOS.conRespaldo);
  const sinRespaldo = d.tramites - conRespaldo;
  const entidadesGestoras = ENTIDADES_GESTORAS_MUESTRA[paisKey] ?? ENTIDADES_GESTORAS_MUESTRA["Bolivia"];

  const tramitesEmpresarial = Math.round(d.tramites * TIPO_USUARIO_RATIOS.empresarial);
  const tramitesCiudadano = Math.round(d.tramites * TIPO_USUARIO_RATIOS.ciudadano);
  const tramitesMixto = d.tramites - tramitesEmpresarial - tramitesCiudadano;
  const tipoUsuarioFilas = [
    { nombre: "Empresarial", valor: tramitesEmpresarial, color: C.steel4 },
    { nombre: "Ciudadano",   valor: tramitesCiudadano,   color: C.steel3 },
    { nombre: "Mixto",       valor: tramitesMixto,        color: C.steel2 },
  ];

  const headerActions = (
    <>
      <button style={HDR_BTN_PILL} onClick={() => onNavigate({ screen: "tramites" })}>Ver trámites</button>
      <button style={HDR_BTN_PILL} onClick={() => onNavigate({ screen: "barreras" })}>Ver barreras</button>
      <button style={HDR_BTN_PRIMARY} onClick={() => onNavigate({ screen: "reportes" })}>
        <Download size={13} /><span className="hidden sm:inline">Generar reporte</span><span className="sm:hidden">Reporte</span>
      </button>
      {/* TODO: dropdown de opciones de descarga */}
      <button style={HDR_BTN_SECONDARY}>
        Descargar <ChevronDown size={13} />
      </button>
    </>
  );

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb={`Panorama Regulatorio › Panel País › ${country}`} title={`Panel ${country}`} actions={headerActions} />

      {/* Country selector — sin "Todos los países": esta pantalla siempre está anclada a un país */}
      {onCountryChange && (
        <div className="flex flex-wrap gap-2 mb-5">
          <select
            className="grow"
            style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, outline: "none", cursor: "pointer", minHeight: 36 }}
            value={country}
            onChange={e => onCountryChange(e.target.value as Country)}
          >
            <option value="Argentina">Argentina</option>
            <option value="Bolivia">Bolivia</option>
            <option value="Chile">Chile</option>
            <option value="Ecuador">Ecuador</option>
            <option value="Perú">Perú</option>
          </select>
        </div>
      )}

      <BandaCobertura text={`Periodo de análisis: ${formatearPeriodo(periodosAnalisis[paisKey] ?? periodosAnalisis["Bolivia"])} · última actualización 12 mar 2026 · cobertura ${COBERTURA_MUESTRA[paisKey] ?? COBERTURA_MUESTRA["Bolivia"]}%`} />

      {/* onSegmentClick: INSTRUMENTOS_MUESTRA no tiene país (es un catálogo a
          nivel regional, mismo criterio ya aplicado al filtro "País" de
          HallazgosFiltrados) -- el filtro resultante trae resultados a nivel
          regional para ese año+jerarquía, no acotados a este país. */}
      <EvolucionInstrumentosPanel
        anios={buildEvolucion(instrumentos)}
        className="mb-6"
        onVerTodo={() => onNavigate({ screen: "hallazgos-filtrados", filtros: {} })}
        onSegmentClick={(anio, jerarquia) => onNavigate({ screen: "hallazgos-filtrados", filtros: { anioDesde: String(anio), anioHasta: String(anio), jerarquia } })}
      />

      {/* KPIs fila 1 — datos reales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <KpiCard label="Instrumentos analizados" value={instrumentos.toLocaleString("es")} sub="leyes, decretos, reglamentos" />
        <KpiCard label="Trámites identificados" value={d.tramites.toLocaleString("es")} sub="ciudadanos y empresariales" />
        <KpiCard label="Sectores cubiertos" value={String(d.sectores)} sub={country} />
      </div>

      {/* KPIs fila 2 — Fuentes: dato de muestra, sin fuente real aún; IRR general: escala 0–100 de muestra */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Fuentes oficiales" value={String(fuentes.oficiales)} />
        <KpiCard label="Fuentes procesadas" value={String(fuentes.procesadas)} />
        <KpiCard label="Entidades emisoras" value={String(fuentes.entidadesEmisoras)} />
        {/* TODO: 0–100 sin metodología definida — conviven con la escala 1–4 de
            irrPromedio (COUNTRY_BARRERAS_DATA / KpiCard "IRR promedio" en
            BarrerasScreen). Falta decidir cuál es la oficial. */}
        <IrrGeneralCard valor={irrGeneral} onVerDetalle={() => onNavigate({ screen: "indice" })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-stretch">
        <BarrasComposicion
          label="Instrumentos por jerarquía normativa"
          total={instrumentos}
          categorias={buildJerarquiaN2N6(instrumentos)}
          onRowClick={(cat) => onNavigate({ screen: "hallazgos-filtrados", filtros: { jerarquia: cat.nombre } })}
        />
        {/* Misma categoría N2–N6 que el gráfico de arriba (solo cambia qué
            número se muestra a la derecha), así que el filtro es el mismo
            `jerarquia`, no una dimensión nueva. */}
        <BarrasComposicion
          label="Instrumentos por: Cantidad de palabras"
          total={instrumentosPorPalabrasTotal}
          categorias={instrumentosPorPalabrasData}
          onRowClick={(cat) => onNavigate({ screen: "hallazgos-filtrados", filtros: { jerarquia: cat.nombre } })}
          headerRight={
            <select
              defaultValue="palabras"
              // TODO: sin lógica de cambio de medida todavía
              style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, backgroundColor: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
            >
              <option value="palabras">Cantidad de palabras</option>
            </select>
          }
        />
      </div>

      <DocumentosEstructuraPanel
        filas={docEstructuraFilas}
        className="mb-6"
        onVerTabla={() => onNavigate({ screen: "hallazgos-filtrados", filtros: {} })}
        onSegmentClick={(nivel, estructura) => onNavigate({ screen: "hallazgos-filtrados", filtros: { jerarquia: nivel, estructura } })}
      />

      {/* "Fuentes y trazabilidad" es sobre FUENTES de scraping, no sobre
          registros individuales de instrumentos/barreras/trámites -- no
          calza con ninguno de los 3 HallazgosFiltrados*, se deja como
          estaba (apunta a "indice", un placeholder genérico igual que
          antes de este barrido). */}
      <FuentesTrazabilidadTable filas={fuentesTrazabilidad} onVerDetalle={() => onNavigate({ screen: "indice" })} />

      <SectionDivider label="Trámites y respaldo normativo" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8 items-stretch">
        <KpiCard label="Con respaldo normativo identificado" value={conRespaldo.toLocaleString("es")} />
        <KpiCard label="Sin respaldo normativo identificado" value={sinRespaldo.toLocaleString("es")} />
        <KpiCard label="Entidades gestoras" value={String(entidadesGestoras)} />
        <div className="rounded-lg p-5" style={{ backgroundColor: C.card }}>
          <p className="text-[11px] uppercase tracking-widest font-medium mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Tipo de usuario</p>
          <div className="flex flex-col gap-2.5">
            {tipoUsuarioFilas.map(f => (
              <div key={f.nombre} className="flex items-center gap-2.5">
                <span className="flex-shrink-0" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, width: 72 }}>{f.nombre}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 10, backgroundColor: C.border }}>
                  <div style={{ width: `${d.tramites > 0 ? (f.valor / d.tramites) * 100 : 0}%`, height: "100%", backgroundColor: f.color }} />
                </div>
                <span className="flex-shrink-0 text-right" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, color: C.textMuted, width: 32 }}>{f.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TablaExploratoria filas={tablaExploratoria} onVerTablaCompleta={() => onNavigate({ screen: "hallazgos-filtrados", filtros: {} })} />
    </div>
  );
}

// ─── BarraFiltrosBarreras ──────────────────────────────────────────────────────
// Exportada: HallazgosFiltrados.tsx la reusa (mismo maquetado de 2 filas) en
// vez de duplicar los 7 selects -- ver comentario junto a su import ahí.
export function BarraFiltrosBarreras({ country, setCountry, sector, setSector, entidad, setEntidad, clasificacion, setClasificacion, subdimension, setSubdimension, jerarquia, setJerarquia, severidad, setSeveridad, sectors, entidades, jerarquiaOptions, twoRows }: {
  country: Country; setCountry: (c: Country) => void;
  sector: string; setSector: (v: string) => void;
  entidad: string; setEntidad: (v: string) => void;
  clasificacion: string; setClasificacion: (v: string) => void;
  subdimension: string; setSubdimension: (v: string) => void;
  jerarquia: string; setJerarquia: (v: string) => void;
  severidad: string; setSeveridad: (v: string) => void;
  sectors: string[];
  entidades: string[];
  // Override de las opciones del <select> de jerarquía -- por defecto son las
  // 5 de la jerarquía normativa de Barreras (Constitucional/Legal/...).
  // HallazgosFiltrados.tsx pasa las 5 de jerarquía de Instrumentos (N2–N6),
  // que son una escala DISTINTA -- mismo campo "jerarquía", dos taxonomías
  // que ya conviven en la plataforma (ver JERARQUIA_N2N6_TOTALES vs. esta).
  jerarquiaOptions?: string[];
  // true: 2 filas (3 + 4 columnas) — usado en el panel regional (country === "Todos"),
  // que necesita acomodar los 7 filtros junto al resto del contenido de la pantalla.
  // Sin agregar filtros nuevos, es solo maquetación.
  twoRows?: boolean;
}) {
  const sel = (disabled?: boolean): React.CSSProperties => ({
    fontFamily: "IBM Plex Sans, sans-serif",
    color: disabled ? C.textMuted : C.text,
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "7px 10px",
    fontSize: 12,
    outline: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    minHeight: 36,
    opacity: disabled ? 0.55 : 1,
  });

  const subdimOpts = clasificacion ? (SUBDIMS_BY_CLASIFICACION[clasificacion] ?? []) : [];

  const paisSelect = (
    <select key="pais" className="grow" style={sel()} value={country} onChange={e => setCountry(e.target.value as Country)}>
      <option value="Todos">Todos los países</option>
      <option value="Argentina">Argentina</option>
      <option value="Bolivia">Bolivia</option>
      <option value="Chile">Chile</option>
      <option value="Ecuador">Ecuador</option>
      <option value="Perú">Perú</option>
    </select>
  );
  const sectorSelect = (
    <select key="sector" className="grow" style={sel()} value={sector} onChange={e => setSector(e.target.value)}>
      <option value="">Todos los sectores</option>
      {sectors.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  );
  const entidadSelect = (
    <select key="entidad" className="grow" style={sel()} value={entidad} onChange={e => setEntidad(e.target.value)}>
      <option value="">Entidad emisora</option>
      {entidades.map(e => <option key={e} value={e}>{e}</option>)}
    </select>
  );
  const clasificacionSelect = (
    <select key="clasificacion" className="grow" style={sel()} value={clasificacion} onChange={e => { setClasificacion(e.target.value); setSubdimension(""); }}>
      <option value="">Clasificación</option>
      <option value="Entrada">Entrada</option>
      <option value="Operación">Operación</option>
    </select>
  );
  const subdimensionSelect = (
    <select key="subdimension" className="grow" style={sel(!clasificacion)} value={subdimension} disabled={!clasificacion}
      onChange={e => setSubdimension(e.target.value)}>
      <option value="">Subdimensión</option>
      {subdimOpts.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  );
  const jerarquiaSelect = (
    <select key="jerarquia" className="grow" style={sel()} value={jerarquia} onChange={e => setJerarquia(e.target.value)}>
      <option value="">Jerarquía normativa</option>
      {(jerarquiaOptions ?? ["Constitucional", "Legal", "Reglamentario", "Administrativo", "Técnico o local"]).map(j => (
        <option key={j} value={j}>{j}</option>
      ))}
    </select>
  );
  const severidadSelect = (
    <select key="severidad" className="grow" style={sel()} value={severidad} onChange={e => setSeveridad(e.target.value)}>
      <option value="">Severidad</option>
      <option value="Crítico">4 · Crítico</option>
      <option value="Alto">3 · Alto</option>
      <option value="Mediano">2 · Mediano</option>
      <option value="Bajo">1 · Bajo</option>
    </select>
  );

  if (twoRows) {
    return (
      <div className="flex flex-col gap-2 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {paisSelect}{sectorSelect}{entidadSelect}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {clasificacionSelect}{subdimensionSelect}{jerarquiaSelect}{severidadSelect}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-5 p-0 rounded-lg">
      {paisSelect}{sectorSelect}{entidadSelect}{clasificacionSelect}{subdimensionSelect}{jerarquiaSelect}{severidadSelect}
    </div>
  );
}

// ─── Barreras por jerarquía normativa (card) ───────────────────────────────────
// Reutilizada por BarrerasScreen tanto en modo por país como en el panel
// regional (country === "Todos") — solo cambia qué `cd` se le pasa y si lleva
// `footer` (el panel regional agrega cobertura + % validado HITL debajo).
function BarrerasPorJerarquiaCard({ cd, jerarquiaActiva, footer, onSegmentClick }: {
  cd: { criticas: number; jerarquia: JerarquiaBar[] };
  jerarquiaActiva?: string;
  footer?: React.ReactNode;
  // Si se pasa, cada segmento de severidad dentro de cada fila se vuelve
  // clicable, con el nombre de esa jerarquía y la severidad de ese segmento.
  onSegmentClick?: (jerarquia: string, severidad: string) => void;
}) {
  const JERARQUIA_BARS = cd.jerarquia;
  const maxTotal = Math.max(...JERARQUIA_BARS.map(b => b.total), 1);
  const SEV_COLORS = ["#C75450", "#26456B", "#3E6E9E", "#7FA8D4"] as const;
  return (
    <div className="rounded-xl flex flex-col h-full" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      {/* Card header */}
      <div className="px-5 pt-4 pb-0" style={{ borderBottom: `1px solid ${C.border}` }}>
        <p className="text-[11px] uppercase tracking-widest font-medium pb-4" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
          Barreras por jerarquía normativa
        </p>
      </div>

      <div className="px-5 pt-4 pb-5 flex flex-col flex-1">
        {/* Context line */}
        {(() => {
          const n4Total = JERARQUIA_BARS.reduce((s, b) => s + b.n4, 0);
          const n4Reformable = JERARQUIA_BARS
            .filter(b => ["Reglamentario", "Administrativo", "Técnico o local"].includes(b.nombre))
            .reduce((s, b) => s + b.n4, 0);
          const totalCriticas = cd.criticas;
          const reformable = n4Total > 0 ? Math.round(n4Reformable / n4Total * totalCriticas) : 0;
          if (reformable > totalCriticas) return null;
          return (
            <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 14, lineHeight: 1.5, color: C.text, marginBottom: 16 }}>
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500 }}>{reformable}</span>
              {" de "}
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500 }}>{totalCriticas}</span>
              {" barreras críticas están en normas de nivel reglamentario o inferior, reformables sin pasar por el legislativo."}
            </p>
          );
        })()}

        {/* Divider */}
        <div style={{ borderBottom: `1px solid ${C.border}`, marginBottom: 16 }} />

        {/* Bars — flex-1, justified to fill height */}
        <div className="flex flex-col flex-1 justify-between">
          {JERARQUIA_BARS.map(bar => {
            const active = !jerarquiaActiva || jerarquiaActiva === bar.nombre;
            const pct = (bar.total / maxTotal) * 100;
            const segs = [
              { v: bar.n4, color: SEV_COLORS[0], severidad: "Crítico" },
              { v: bar.n3, color: SEV_COLORS[1], severidad: "Alto" },
              { v: bar.n2, color: SEV_COLORS[2], severidad: "Mediano" },
              { v: bar.n1, color: SEV_COLORS[3], severidad: "Bajo" },
            ].filter(s => s.v > 0);
            return (
              <div key={bar.nombre} className="flex items-center gap-3" style={{ opacity: active ? 1 : 0.28, transition: "opacity 0.2s" }}>
                <span className="flex-shrink-0" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, width: 116, lineHeight: 1.3 }}>{bar.nombre}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 14, backgroundColor: "#E6ECF3" }}>
                  <div className="h-full flex rounded-full overflow-hidden" style={{ width: `${pct}%` }}>
                    {segs.map((s, si) => (
                      <div
                        key={si}
                        onClick={onSegmentClick ? () => onSegmentClick(bar.nombre, s.severidad) : undefined}
                        style={{ flex: s.v, backgroundColor: s.color, minWidth: s.v > 0 ? 2 : 0, cursor: onSegmentClick ? "pointer" : undefined }}
                      />
                    ))}
                  </div>
                </div>
                <span className="flex-shrink-0 text-right" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, color: C.textMuted, width: 28 }}>{bar.total}</span>
              </div>
            );
          })}
        </div>

        {footer && (
          <div className="pt-4 mt-4" style={{ borderTop: `1px solid ${C.border}` }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Panel de composición genérico (barra + número) ────────────────────────────
// Reutilizado por "Canales de transmisión económica", "Barreras por acción de
// mejora sugerida" y "Barreras con afectación MIPYME" en el Panel País de
// Barreras — mismo lenguaje visual que BarrasComposicion, pero SIN leyenda de
// severidad (esto es composición, no severidad): degradado C.steel4→steel1 y
// dos tonos más claros de la misma rampa categórica para filas adicionales.
export function ComposicionSimplePanel({ label, filas, actionLabel, onAction, formatValor, headerExtra, onRowClick }: {
  label: string;
  filas: { nombre: string; valor: number }[];
  actionLabel?: string;
  onAction?: () => void;
  // Formatea el texto mostrado a la derecha de cada fila (ej. moneda) sin
  // afectar el ancho de la barra, que sigue calculándose del `valor` crudo.
  formatValor?: (v: number) => string;
  // Contenido extra en el header, antes del botón de acción (ej. un select
  // visual de "medida").
  headerExtra?: React.ReactNode;
  // Si se pasa, cada fila se vuelve clicable, con su `nombre`. Cuando se
  // omite, se comporta exactamente igual que hoy (no clicable).
  onRowClick?: (nombre: string) => void;
}) {
  const maxValor = Math.max(...filas.map(f => f.valor), 1);
  const gradient = [C.steel4, C.steel3, C.steel2, C.steel1, "#A0C1E0", "#BDD0DD"];
  return (
    <div className="rounded-xl flex flex-col h-full" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      <div className="px-5 pt-4 pb-4 flex items-center justify-between gap-3" style={{ borderBottom: `1px solid ${C.border}` }}>
        <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{label}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {headerExtra}
          {actionLabel && (
            <button
              onClick={onAction}
              style={{ backgroundColor: C.text, color: "white", border: "none", borderRadius: 999, padding: "6px 14px", fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
      <div className="px-5 pt-4 pb-5 flex flex-col gap-3 flex-1 justify-center">
        {filas.map((f, i) => {
          const pct = (f.valor / maxValor) * 100;
          return (
            <div
              key={f.nombre}
              className="flex items-center gap-3"
              onClick={onRowClick ? () => onRowClick(f.nombre) : undefined}
              style={{ cursor: onRowClick ? "pointer" : undefined }}
            >
              <span className="flex-shrink-0" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, width: 150, lineHeight: 1.3 }}>{f.nombre}</span>
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 12, backgroundColor: "#E6ECF3" }}>
                <div style={{ width: `${pct}%`, height: "100%", backgroundColor: gradient[i % gradient.length] }} />
              </div>
              <span className="flex-shrink-0 text-right" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, color: C.textMuted, width: formatValor ? 76 : 32 }}>{formatValor ? formatValor(f.valor) : f.valor}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Screen 3 — Barreras ──────────────────────────────────────────────────────
function BarrerasScreen({ initialSector, country = "Bolivia", onCountryChange, onNavigate }: { initialSector?: string; country?: Country; onCountryChange?: (c: Country) => void; onNavigate: (v: View) => void }) {
  // Regional (country === "Todos") usa el rango que cubre a los 5 países;
  // por país usa el de ese país puntual -- ambas ramas de este componente
  // (más abajo) lo necesitan.
  const { periodosAnalisis } = usePeriodoAnalisis();
  const periodoTextoBarreras = country === "Todos"
    ? formatearPeriodo(periodoRegional(periodosAnalisis))
    : formatearPeriodo(periodosAnalisis[country as Exclude<Country, "Todos">] ?? periodosAnalisis["Bolivia"]);
  const [sector, setSector] = useState(initialSector || "");
  const [entidad, setEntidad] = useState("");
  const [clasificacion, setClasificacion] = useState("");
  const [subdimension, setSubdimension] = useState("");
  const [jerarquia, setJerarquia] = useState("");
  const [severidadFil, setSeveridadFil] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const sectors = Array.from(new Set(BARRERAS_NIVEL4_LIST.map(b => b.sector)));
  const entidades = Array.from(new Set(BARRERAS_NIVEL4_LIST.map(b => b.entidad).filter(Boolean))).sort();

  const filtered = BARRERAS_NIVEL4_LIST
    .filter(b => !sector || b.sector === sector)
    .filter(b => !entidad || b.entidad === entidad)
    .filter(b => !clasificacion || b.clasificacion === clasificacion)
    .filter(b => !subdimension || b.subdimension === subdimension)
    .filter(b => !jerarquia || b.jerarquia === jerarquia)
    .filter(b => severidadFil === "" || severidadFil === "Crítico");

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const reset = (fn: (v: string) => void) => (v: string) => { fn(v); setPage(0); };

  // ── Panel regional (país === "Todos") ───────────────────────────────────────
  // Si country !== "Todos", cae al layout por país de siempre (sin cambios,
  // ver el return más abajo).
  const cd = COUNTRY_BARRERAS_DATA[country] ?? COUNTRY_BARRERAS_DATA["Bolivia"];
  if (country === "Todos") {
    const severidadPromedio = severidadLabel(parseFloat(cd.irrPromedio));
    const validadoHitlRegional = VALIDADO_HITL_MUESTRA["Todos"];
    const paisesRow1 = COUNTRIES.slice(0, 3);
    const paisesRow2 = COUNTRIES.slice(3);

    // dato de muestra: no hay desglose real de % validado HITL por
    // subdimensión, se usa el mismo % del país en todas sus filas de "Entrada".
    const buildEntradaPorPais = (pais: Country) => {
      const cdPais = COUNTRY_BARRERAS_DATA[pais];
      const subdims = cdPais.clasificacion["Entrada"]?.subdimensiones ?? [];
      return subdims.map(s => ({
        nombre: s.nombre,
        total: s.niveles.n4 + s.niveles.n3 + s.niveles.n2 + s.niveles.n1,
        validadoPct: VALIDADO_HITL_MUESTRA[pais],
      }));
    };

    // TOP_BARRERAS_PAIS_TABLA ya trae "id" y "pais" por fila (ver más abajo,
    // reutilizado tal cual — no se reconstruye la lista a mano acá).
    const topBarrerasFilas = COUNTRIES.flatMap(pais => TOP_BARRERAS_PAIS_TABLA[pais as Exclude<Country, "Todos">] ?? []);

    const SEV_LEGEND = [
      { label: "4 · Crítico", color: "#C75450" },
      { label: "3 · Alto",    color: "#26456B" },
      { label: "2 · Mediano", color: "#3E6E9E" },
      { label: "1 · Bajo",    color: "#7FA8D4" },
    ];

    const reportesPrefill: ReportesPrefill = {
      tipoHallazgo: "distorsion",
      pais: country,
      sectores: sector ? [sector] : [],
      eje: clasificacion || "",
      subdimDistorsion: subdimension || "",
      severidades: severidadFil ? [severidadFil] : [],
      entidad: entidad || "",
    };

    const paisCard = (pais: Country) => (
      <BarrerasPorPaisCard
        key={pais}
        pais={pais}
        total={COUNTRY_BARRERAS_DATA[pais].total}
        entrada={buildEntradaPorPais(pais)}
        coberturaPct={COBERTURA_MUESTRA[pais as Exclude<Country, "Todos">]}
        validadoHitlPct={VALIDADO_HITL_MUESTRA[pais]}
        onVerBarreras={() => onCountryChange?.(pais)}
        onEntradaClick={(subdimension) => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { pais, clasificacion: "Entrada", subdimension } })}
      />
    );

    return (
      <div className="p-4 md:p-8 overflow-y-auto h-full">
        <Header
          breadcrumb="Barreras Regulatorias › Panel Regional"
          title="Barreras Regulatorias"
          actions={
            <>
              {/* TODO: destino de "Ver metodología" (¿documentación / metodología del IRR?) */}
              <button style={HDR_BTN_PILL}>Ver metodología</button>
              <button style={HDR_BTN_PRIMARY} onClick={() => onNavigate({ screen: "reportes", prefill: reportesPrefill })}>
                <ExternalLink size={13} /><span className="hidden sm:inline">Generar reporte</span><span className="sm:hidden">Reporte</span>
              </button>
              {/* TODO: dropdown de opciones de descarga */}
              <button style={HDR_BTN_SECONDARY}>
                Descargar <ChevronDown size={13} />
              </button>
            </>
          }
        />

        <BandaCobertura text={`Periodo de análisis: ${periodoTextoBarreras} · Cobertura regional: 86% de fuentes procesadas · Última actualización: 12 de marzo de 2026 · ${COUNTRIES.length} países activos`} />

        <BarraFiltrosBarreras
          country={country} setCountry={c => { onCountryChange?.(c); }}
          sector={sector} setSector={reset(setSector)}
          entidad={entidad} setEntidad={reset(setEntidad)}
          clasificacion={clasificacion} setClasificacion={reset(setClasificacion)}
          subdimension={subdimension} setSubdimension={reset(setSubdimension)}
          jerarquia={jerarquia} setJerarquia={reset(setJerarquia)}
          severidad={severidadFil} setSeveridad={reset(setSeveridadFil)}
          sectors={sectors}
          entidades={entidades}
          twoRows
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <KpiCard label="Hallazgos de barreras" value={cd.total.toLocaleString("es-BO")} />
          <KpiCard label="Hallazgos críticos" value={String(cd.criticas)} valueColor={C.critico} />
          <KpiCard label="Severidad promedio" value={severidadPromedio} sub={`IDR ${cd.irrPromedio}/4`} />
          <KpiCard label="Sectores afectados" value={String(cd.sectores)} />
          {/* TODO: primer cruce Barreras↔Validación HITL, no existe ese cálculo real todavía */}
          <KpiCard label="% Validado HITL" value={String(validadoHitlRegional)} valueSuffix="%" />
        </div>

        {/* Barreras por país */}
        <p className="uppercase mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, color: C.textMuted }}>Barreras por país</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
          {paisesRow1.map(paisCard)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
          {paisesRow2.map(paisCard)}
        </div>

        {/* Leyenda de severidad */}
        <div className="flex flex-wrap items-center gap-5 mb-6">
          {SEV_LEGEND.map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, backgroundColor: s.color, display: "inline-block" }} />
              <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted }}>{s.label}</span>
            </div>
          ))}
        </div>

        <MatrizRegional
          clasificacion={cd.clasificacion}
          onCellClick={(clasificacion, subdimension) => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { clasificacion, subdimension } })}
        />

        <div className="mt-6 mb-6">
          <BarrerasPorJerarquiaCard
            cd={cd}
            jerarquiaActiva={jerarquia}
            onSegmentClick={(jerarquia, severidad) => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { jerarquia, severidad } })}
            footer={
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted }}>Cobertura 91%</span>
                <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted }}>{validadoHitlRegional}% validado HITL</span>
              </div>
            }
          />
        </div>

        {/* Top 3 barreras según IRR por país — dato de muestra (ver TODO en TOP_BARRERAS_POR_PAIS_MUESTRA) */}
        <div className="rounded-lg" style={{ backgroundColor: C.card }}>
          <div className="p-5 border-b" style={{ borderColor: C.border }}>
            <h3 className="text-[13px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
              Top 3 barreras según IDR por país
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["País", "IDR", "Clasificación", "Subdimensión", "Sector", "Instrumento", "Estado HITL"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-widest whitespace-nowrap"
                      style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topBarrerasFilas.map((b, i) => (
                  <tr
                    key={i}
                    className="hover:bg-[#F4F7FB] transition-colors"
                    style={{ borderBottom: `1px solid ${C.border}`, cursor: b.id ? "pointer" : "default" }}
                    onClick={() => { if (b.id) onNavigate({ screen: "barrera-detail", id: b.id }); }}
                  >
                    <td className="px-4 py-3 text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{b.pais}</td>
                    <td className="px-4 py-3"><SeverityBadge level={IRR_LABELS[b.irr]} /></td>
                    <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{b.clasificacion}</td>
                    <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 180 }}>{b.subdimension}</td>
                    <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{b.sector}</td>
                    <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 180 }}>{b.instrumento}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
                        style={{ backgroundColor: ESTADO_HITL_META[b.estadoHitl].bg, color: ESTADO_HITL_META[b.estadoHitl].color, fontFamily: "IBM Plex Sans, sans-serif" }}>
                        {b.estadoHitl}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      {(() => {
        const countryLabel = country === "Todos" ? "5 países" : country;
        const activeFilters: string[] = [];
        if (sector) activeFilters.push(`Sector: ${sector}`);
        if (entidad) activeFilters.push(`Entidad: ${entidad}`);
        if (clasificacion) activeFilters.push(`Clasificación: ${clasificacion}`);
        if (subdimension) activeFilters.push(`Subdimensión: ${subdimension}`);
        if (jerarquia) activeFilters.push(`Jerarquía: ${jerarquia}`);
        if (severidadFil) activeFilters.push(`Severidad: ${severidadFil}`);
        const exportCtx = JSON.stringify({ tipo: "distorsion", pais: countryLabel, sector: sector || "Todos los sectores", filtros: activeFilters, registros: `${filtered.length} de ${BARRERAS_NIVEL4_LIST.length} barreras`, fecha: new Date().toLocaleString("es-BO"), periodo: periodoTextoBarreras });
        const cd = COUNTRY_BARRERAS_DATA[country] ?? COUNTRY_BARRERAS_DATA["Bolivia"];
        const reportesPrefill: ReportesPrefill = {
          tipoHallazgo: "distorsion",
          pais: country,
          sectores: sector ? [sector] : [],
          eje: clasificacion || "",
          subdimDistorsion: subdimension || "",
          severidades: severidadFil ? [severidadFil] : [],
          entidad: entidad || "",
        };
        return (
          <>
            <Header
              breadcrumb="Regulaciones › Barreras"
              title="Barreras"
              subtitle={countryLabel}
              actions={
                <>
                  <button style={HDR_BTN_SECONDARY} onClick={() => onNavigate({ screen: "reporte-pdf", context: exportCtx })}>
                    <Download size={13} /><span className="hidden sm:inline">Exportar PDF</span><span className="sm:hidden">PDF</span>
                  </button>
                  <button style={HDR_BTN_PRIMARY} onClick={() => onNavigate({ screen: "reportes", prefill: reportesPrefill })}>
                    <ExternalLink size={13} /><span className="hidden sm:inline">Generar reporte</span><span className="sm:hidden">Reporte</span>
                  </button>
                </>
              }
            />

            <BandaCobertura text={`Periodo de análisis: ${periodoTextoBarreras} · cobertura ${COBERTURA_MUESTRA[country as Exclude<Country, "Todos">] ?? COBERTURA_MUESTRA["Bolivia"]}%`} />

            <BarraFiltrosBarreras
              country={country} setCountry={c => { onCountryChange?.(c); }}
              sector={sector} setSector={reset(setSector)}
              entidad={entidad} setEntidad={reset(setEntidad)}
              clasificacion={clasificacion} setClasificacion={reset(setClasificacion)}
              subdimension={subdimension} setSubdimension={reset(setSubdimension)}
              jerarquia={jerarquia} setJerarquia={reset(setJerarquia)}
              severidad={severidadFil} setSeveridad={reset(setSeveridadFil)}
              sectors={sectors}
              entidades={entidades}
            />

            {/* TODO: confirmar con Franco si este panel pertenece a Barreras o
                es exclusivo de Panorama Regulatorio -- hoy se muestra la misma
                métrica (evolución de instrumentos por país) en dos pantallas.
                Mismo componente compartido que la instancia de Panorama País
                (arriba) -- mismo destino (Instrumentos), mismo criterio: sin
                `pais` en el filtro porque INSTRUMENTOS_MUESTRA no tiene ese
                campo (catálogo a nivel regional). */}
            <EvolucionInstrumentosPanel
              anios={buildEvolucion(JERARQUIA_NORMATIVA_DATA.find(c => c.nombre === country)!.total)}
              label="Barreras en instrumentos por jerarquía normativa"
              className="mb-6"
              onVerTodo={() => onNavigate({ screen: "hallazgos-filtrados", filtros: {} })}
              onSegmentClick={(anio, jerarquia) => onNavigate({ screen: "hallazgos-filtrados", filtros: { anioDesde: String(anio), anioHasta: String(anio), jerarquia } })}
            />

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <KpiCard label="Total barreras" value={cd.total.toLocaleString("es-BO")} sub={countryLabel} />
              <KpiCard label="Barreras críticas" value={String(cd.criticas)} sub="nivel 4 · atención prioritaria" valueColor={C.critico} />
              <KpiCard label="IDR promedio" value={severidadLabel(Number(cd.irrPromedio))} sub={`IDR ${cd.irrPromedio}/4 · Escala 1 a 4`} />
              <KpiCard label="Sectores afectados" value={String(cd.sectores)} sub="con barreras registradas" />
              {/* TODO: primer cruce Barreras↔Validación HITL, no existe ese cálculo real todavía */}
              <KpiCard label="% Validado HITL" value={String(VALIDADO_HITL_MUESTRA[country])} valueSuffix="%" />
            </div>
          </>
        );
      })()}

      {/* IRR por clasificación · Matriz regional */}
      {(() => {
        const cd = COUNTRY_BARRERAS_DATA[country] ?? COUNTRY_BARRERAS_DATA["Bolivia"];
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" style={{ alignItems: "stretch" }}>
            <PanelTipoSubdimension
              label="IDR por clasificación"
              tipos={["Entrada", "Operación"]}
              datos={cd.clasificacion}
              className="h-full"
              onRowClick={(clasificacion, subdimension) => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { pais: country, clasificacion, subdimension } })}
              onSegmentClick={(clasificacion, subdimension, severidad) => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { pais: country, clasificacion, subdimension, severidad } })}
            />
            <MatrizRegional
              clasificacion={cd.clasificacion}
              onCellClick={(clasificacion, subdimension) => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { pais: country, clasificacion, subdimension } })}
            />
          </div>
        );
      })()}

      {/* Barreras por jerarquía normativa · Canales de transmisión económica */}
      {(() => {
        const cd = COUNTRY_BARRERAS_DATA[country] ?? COUNTRY_BARRERAS_DATA["Bolivia"];
        const coberturaPais = COBERTURA_MUESTRA[country as Exclude<Country, "Todos">] ?? COBERTURA_MUESTRA["Bolivia"];
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" style={{ alignItems: "stretch" }}>
            <BarrerasPorJerarquiaCard
              cd={cd}
              jerarquiaActiva={jerarquia}
              onSegmentClick={(jerarquia, severidad) => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { pais: country, jerarquia, severidad } })}
              footer={
                <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted }}>
                  Cobertura {coberturaPais}% · {VALIDADO_HITL_MUESTRA[country]}% validado HITL
                </p>
              }
            />
            <ComposicionSimplePanel
              label="Canales de transmisión económica"
              filas={CANALES_TRANSMISION_MUESTRA[country as Exclude<Country, "Todos">] ?? CANALES_TRANSMISION_MUESTRA["Bolivia"]}
              onRowClick={(canalTransmision) => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { pais: country, canalTransmision } })}
            />
          </div>
        );
      })()}

      {/* Barreras por acción de mejora sugerida · Barreras con afectación MIPYME */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" style={{ alignItems: "stretch" }}>
        {/* TODO: acción de mejora sugerida a nivel agregado es un concepto
            nuevo sin metodología real -- falta definir cómo se calcula a
            partir de barreras individuales cuando exista ese detalle.
            barrera.accionCategoria (corta, ver ALL_BARRERAS) es la que
            filtra acá -- barrera.accionSugerida.accion sigue siendo la
            descripción larga que ya usan las tablas, sin tocar. */}
        <ComposicionSimplePanel
          label="Barreras por acción de mejora sugerida"
          filas={ACCION_MEJORA_MUESTRA[country as Exclude<Country, "Todos">] ?? ACCION_MEJORA_MUESTRA["Bolivia"]}
          onRowClick={(accionCategoria) => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { pais: country, accionCategoria } })}
        />
        <ComposicionSimplePanel
          label="Barreras con afectación MIPYME"
          filas={MIPYME_MUESTRA[country as Exclude<Country, "Todos">] ?? MIPYME_MUESTRA["Bolivia"]}
          actionLabel="Ver tabla completa"
          onAction={() => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { pais: country } })}
          onRowClick={(afectacionMipyme) => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { pais: country, afectacionMipyme } })}
        />
      </div>

      {/* Corrección: sus filas usan las etiquetas N2–N6 de INSTRUMENTOS
          (JERARQUIA_N2N6_LABELS), solo con un % propio de Barreras (DOC_
          ESTRUCTURA_PCT_BARRERAS_MUESTRA) como flavor -- es el mismo dato
          que la instancia de Panorama Regulatorio (estructura documental de
          instrumentos por nivel N2–N6), no algo propio de Barreras. Por eso
          apunta a HallazgosFiltradosInstrumentos igual que esa instancia, no
          a HallazgosFiltradosBarreras (ahí sí "N2 Legislativo" no existe
          como valor real, porque barrera.jerarquia usa otra escala). Sin
          `pais` en el filtro: Instrumento no tiene ese campo (INSTRUMENTOS_
          MUESTRA es un catálogo a nivel regional, mismo criterio ya
          documentado en el resto de gráficas de Instrumentos). */}
      <DocumentosEstructuraPanel
        filas={JERARQUIA_N2N6_LABELS.map((nombre, i) => ({ nombre, pctNoEstructurado: DOC_ESTRUCTURA_PCT_BARRERAS_MUESTRA[i] }))}
        className="mb-6"
        onVerTabla={() => onNavigate({ screen: "hallazgos-filtrados", filtros: {} })}
        onSegmentClick={(nivel, estructura) => onNavigate({ screen: "hallazgos-filtrados", filtros: { jerarquia: nivel, estructura } })}
      />

      {/* Top 3 barreras según IRR */}
      {(() => {
        const esBolivia = country === "Bolivia";
        const tablaFilas = esBolivia
          ? pageItems.map((b, i) => ({
              ...b,
              canal: CANAL_POR_SUBDIMENSION_MUESTRA[b.subdimension] ?? "Modelo de negocio",
              estadoHitl: (["Publicado", "Por decidir", "Etapa 3"] as const)[i % 3] as EstadoHitl,
            }))
          : TOP_BARRERAS_PAIS_TABLA[country as Exclude<Country, "Todos">] ?? TOP_BARRERAS_PAIS_TABLA["Bolivia"];

        return (
          <div className="rounded-lg" style={{ backgroundColor: C.card }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <h3 className="text-[13px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
                Top 3 barreras según IDR{" "}
                <span style={{ color: C.critico }}>({esBolivia ? (filtered.length < BARRERAS_NIVEL4_LIST.length ? filtered.length : 91) : tablaFilas.length})</span>
              </h3>
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
                {esBolivia ? `${filtered.length} registros filtrados` : `${tablaFilas.length} registros de muestra`}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Barrera", "IDR", "Severidad", "Clasificación", "Subdimensión", "Jerarquía", "Sector", "Instrumento", "Canal", "Estado HITL"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-widest whitespace-nowrap"
                        style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tablaFilas.map((b, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#F4F7FB] transition-colors"
                      style={{ borderBottom: `1px solid ${C.border}`, cursor: b.id ? "pointer" : "default" }}
                      onClick={() => { if (b.id) onNavigate({ screen: "barrera-detail", id: b.id }); }}
                    >
                      <td className="px-4 py-3 text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text, maxWidth: 200 }}>{b.titulo}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, color: C.critico }}>
                          {b.irr} · Crítico
                        </span>
                      </td>
                      <td className="px-4 py-3"><SeverityBadge level={IRR_LABELS[b.irr]} /></td>
                      <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{b.clasificacion}</td>
                      <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 180 }}>{b.subdimension}</td>
                      <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{b.jerarquia}</td>
                      <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{b.sector}</td>
                      <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 180 }}>{b.instrumento}</td>
                      <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{b.canal}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
                          style={{ backgroundColor: ESTADO_HITL_META[b.estadoHitl].bg, color: ESTADO_HITL_META[b.estadoHitl].color, fontFamily: "IBM Plex Sans, sans-serif" }}>
                          {b.estadoHitl}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {esBolivia && pageCount > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: C.border }}>
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
                </span>
                <div className="flex gap-2">
                  {[...Array(pageCount)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i)}
                      style={{
                        width: 28, height: 28, borderRadius: 6, border: "none",
                        backgroundColor: i === page ? C.steel4 : C.border,
                        color: i === page ? "white" : C.textMuted,
                        fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ─── Screen 4 — Barrera Detail ────────────────────────────────────────────────
// ─── Panel de ficha genérico (label izquierda muted, valor derecha) ───────────
// Reutilizado por los 3 paneles de la Ficha lateral de BarreraDetail
// (Identificación / Clasificación / Validación) — mismo patrón visual que ya
// usaba el panel único "Ficha".
function FichaPanel({ title, rows }: { title: string; rows: [string, React.ReactNode][] }) {
  return (
    <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      <p className="text-[11px] uppercase tracking-widest font-medium mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{title}</p>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between py-2 border-b last:border-0 gap-3" style={{ borderColor: C.border }}>
          <span className="text-[12px] flex-shrink-0" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{k}</span>
          <span className="text-[12px] font-medium text-right" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text, maxWidth: "60%" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function BarreraDetail({ id, onNavigate }: { id: string; onNavigate: (v: View) => void }) {
  const barrera = ALL_BARRERAS.find(b => b.id === id);
  if (!barrera) return null;

  const affectedTramites = ALL_TRAMITES.filter(t => barrera.tramitesAfectados.includes(t.id));

  const textParts = barrera.textNormativo.split(barrera.pasajeResaltado);

  const identificacionRows: [string, React.ReactNode][] = [
    ["ID del hallazgo", barrera.idHallazgo],
    ["Instrumento", barrera.instrumento],
    ["Enlace oficial", (
      <a
        href={`https://${barrera.enlaceOficial}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1"
        style={{ color: C.steel3, fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 500, textDecoration: "none" }}
      >
        {barrera.enlaceOficial} <ExternalLink size={11} />
      </a>
    )],
    ["Entidad", barrera.entidad],
    ["Jerarquía", barrera.jerarquia],
  ];

  const clasificacionRows: [string, React.ReactNode][] = [
    ["Clasificación", barrera.clasificacion],
    ["Subdimensión", BARRERA_META[barrera.id]?.subdimension ?? "—"],
    ["Tipo de restricción", barrera.tipoRestriccion],
    ["Etapa del ciclo de vida", BARRERA_META[barrera.id]?.etapaCicloVida ?? "—"],
    ["Sector", barrera.sector],
    ["Severidad", barrera.severidad],
    ["Año", String(barrera.anio)],
    ["Canal de transmisión", barrera.canalTransmision],
    ["Afectación MIPYME", barrera.afectacionMipyme],
  ];

  const estadoHitlMeta = ESTADO_HITL_META[barrera.validacion.estadoHitl];
  const validacionRows: [string, React.ReactNode][] = [
    ["Severidad IA", barrera.validacion.severidadIA],
    ["Severidad validada", barrera.validacion.severidadValidada],
    ["Estado HITL", (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
        style={{ backgroundColor: estadoHitlMeta.bg, color: estadoHitlMeta.color, fontFamily: "IBM Plex Sans, sans-serif" }}>
        {barrera.validacion.estadoHitl}
      </span>
    )],
    ["Comentario del BID", barrera.validacion.comentarioBID],
    ["Comentario del Consultor", barrera.validacion.comentarioConsultor],
    ["Comentario del gobierno", barrera.validacion.comentarioGobierno],
  ];

  // Filas de la tarjeta "Acción sugerida" — bold cuando el valor es una
  // etiqueta Alta/Media/Baja (Prioridad, Factibilidad).
  const accionSugeridaRows: [string, string][] = [
    ["Acción sugerida", barrera.accionSugerida.accion],
    ["Prioridad", barrera.accionSugerida.prioridad],
    ["Tipo de cambio requerido", barrera.accionSugerida.tipoCambioRequerido],
    ["Factibilidad", barrera.accionSugerida.factibilidad],
    ["Objetivo legítimo y proporcionalidad", barrera.accionSugerida.objetivoLegitimo],
  ];
  const ESCALA_ALTA_MEDIA_BAJA = ["Alta", "Media", "Baja"];

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header
        breadcrumb="Barreras Regulatorias › Detalle Barrera"
        title={barrera.titulo}
        actions={
          <>
            <button style={HDR_BTN_PRIMARY} onClick={() => onNavigate({ screen: "reportes", prefill: { tipoHallazgo: "distorsion", pais: barrera.pais, sectores: [barrera.sector] } })}>
              <Download size={13} /><span className="hidden sm:inline">Generar reporte</span><span className="sm:hidden">Reporte</span>
            </button>
            {/* TODO: dropdown de opciones de descarga */}
            <button style={HDR_BTN_SECONDARY}>
              Descargar <ChevronDown size={13} />
            </button>
          </>
        }
      />

      <button className="flex items-center gap-1 text-[12px] mb-4 min-h-[44px]" style={{ color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
        onClick={() => onNavigate({ screen: "barreras", sector: barrera.sector })}>
        ← Volver a Barreras
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <SeverityBadge level={barrera.severidad} />
            <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{barrera.sector} · {barrera.pais}</span>
          </div>

          {/* Legal text */}
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}>
              <div>
                <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Texto normativo de origen</p>
                <p className="text-[12px] font-semibold mt-0.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{barrera.instrumento}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Jerarquía: {barrera.jerarquia}</p>
                <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{barrera.pais} · {barrera.anio}</p>
              </div>
            </div>
            <div className="flex">
              <div className="w-1 flex-shrink-0" style={{ backgroundColor: C.steel2 }} />
              <div className="p-5">
                <p className="text-[12px] italic mb-1 text-right" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>texto de muestra</p>
                <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>
                  {textParts[0]}
                  <mark style={{ backgroundColor: "#C7545025", borderBottom: `2px solid ${C.critico}`, padding: "1px 2px" }}>
                    {barrera.pasajeResaltado}
                  </mark>
                  {textParts[1]}
                </p>
              </div>
            </div>
          </div>

          {/* Diagnostic */}
          <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[11px] uppercase tracking-widest font-medium mb-2" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Diagnóstico económico</p>
            <p className="text-[13px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{barrera.diagnostico}</p>
          </div>

          {/* Acción sugerida — reemplaza el bloque "Propuesta de reforma" (Dice/Debe
              Decir). El campo `reforma` (dice/debeDedir/palanca) NO se borra del tipo
              de dato, solo deja de renderizarse acá. */}
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.steel2 }}>
            <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
              <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#CFE0F0" }}>Acción sugerida</p>
            </div>
            <div className="px-5">
              {accionSugeridaRows.map(([k, v], i) => (
                <div key={k} className="flex items-start justify-between gap-3 py-3"
                  style={{ borderBottom: i < accionSugeridaRows.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
                  <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#CFE0F0" }}>{k}</span>
                  <span
                    className="text-right"
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: 13,
                      color: "white",
                      fontWeight: ESCALA_ALTA_MEDIA_BAJA.includes(v) ? 700 : 400,
                      maxWidth: "60%",
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <FichaPanel title="Identificación" rows={identificacionRows} />
          <FichaPanel title="Clasificación" rows={clasificacionRows} />
          <FichaPanel title="Validación" rows={validacionRows} />

          {/* Bridge to tramites */}
          <div className="rounded-lg p-5 hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.steel2}44` }}>
            <p className="text-[11px] uppercase tracking-widest font-medium mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel3 }}>
              Esta barrera afecta a {affectedTramites.length} trámite{affectedTramites.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-col gap-2">
              {affectedTramites.map(t => (
                <button key={t.id} className="flex items-center justify-between p-3 rounded-lg text-left w-full hover:shadow-sm transition-shadow"
                  style={{ backgroundColor: "#EFF4FA", border: `1px solid ${C.steel2}33`, fontFamily: "IBM Plex Sans, sans-serif" }}
                  onClick={() => onNavigate({ screen: "tramite-detail", id: t.id })}>
                  <div>
                    <p className="text-[12px] font-medium" style={{ color: C.text }}>{t.nombre}</p>
                    <p className="text-[11px]" style={{ color: C.textMuted }}>{t.etapa} · {t.tipo}</p>
                  </div>
                  <ArrowRight size={13} color={C.steel3} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GraficoEscala1a4 ─────────────────────────────────────────────────────────
function GraficoEscala1a4({ dimension, setDimension, data, total }: {
  dimension: string;
  setDimension: (v: string) => void;
  data: { name: string; value: number; color: string }[];
  total: string;
}) {
  return (
    <div className="rounded-lg p-6" style={{ backgroundColor: C.card }}>
      <div className="flex items-center justify-between mb-4 gap-2">
        <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Indicadores cualitativos</p>
        <select
          className="outline-none"
          style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            color: C.text,
            backgroundColor: C.canvas,
            border: `1px solid ${C.border}`,
            borderRadius: 7,
            padding: "5px 8px",
            fontSize: 11,
            cursor: "pointer",
          }}
          value={dimension}
          onChange={e => setDimension(e.target.value)}
        >
          {["Cumplimiento", "Accesibilidad", "Certidumbre", "Proporcionalidad"].map(d => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-5 items-center">
        <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
          <PieChart width={120} height={120}>
            <Pie data={data} cx={55} cy={55} innerRadius={36} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, fontWeight: 600, color: C.text, lineHeight: 1 }}>{total}</span>
            <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 9, color: C.textMuted, lineHeight: 1.3, textTransform: "uppercase", letterSpacing: "0.06em" }}>total</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 flex-1">
          {data.map(d => (
            <div key={d.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color, display: "inline-block" }} />
                <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.text }}>{d.name}</span>
              </div>
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, color: C.textMuted, minWidth: 28, textAlign: "right" }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen 5 — Trámites ──────────────────────────────────────────────────────
function TramitesScreen({ country = "Bolivia", onCountryChange, onNavigate }: { country?: Country; onCountryChange?: (c: Country) => void; onNavigate: (v: View) => void }) {
  // Mismo criterio que BarrerasScreen: regional usa el rango de los 5
  // países, por país usa el de ese país puntual.
  const { periodosAnalisis } = usePeriodoAnalisis();
  const periodoTextoTramites = country === "Todos"
    ? formatearPeriodo(periodoRegional(periodosAnalisis))
    : formatearPeriodo(periodosAnalisis[country as Exclude<Country, "Todos">] ?? periodosAnalisis["Bolivia"]);
  const [sector, setSector] = useState("");
  const [entidad, setEntidad] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [tipoCarga, setTipoCarga] = useState("");
  const [subdimension, setSubdimension] = useState("");
  const [etapaCiclo, setEtapaCiclo] = useState("");
  const [tamano, setTamano] = useState("");
  const [ano, setAno] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const countryLabel = country === "Todos" ? "5 países" : country;

  const sectors = Array.from(new Set(TRAMITES_EXT.map(t => t.sector)));
  const entidades = Array.from(new Set(TRAMITES_EXT.map(t => t.entidad.split("—")[0].split("/")[0].trim())));
  const subdimOpts = tipoCarga ? (SUBDIMS_BY_TIPO_CARGA[tipoCarga] ?? []) : [];

  const filtered = TRAMITES_EXT
    .filter(t => !sector || t.sector === sector)
    .filter(t => !entidad || t.entidad.split("—")[0].split("/")[0].trim() === entidad)
    .filter(t => !tipoUsuario || t.tipo === tipoUsuario)
    .filter(t => !tipoCarga || true)
    .filter(t => !subdimension || true)
    .filter(t => !etapaCiclo || t.etapa === etapaCiclo)
    .filter(t => !tamano || t.tamano === tamano)
    .filter(t => !ano || String((t as any).año) === ano)
    .sort((a, b) => b.costoNum - a.costoNum);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const selStyle: React.CSSProperties = {
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
  const selDisabled = (off: boolean): React.CSSProperties => ({ ...selStyle, opacity: off ? 0.55 : 1, cursor: off ? "not-allowed" : "pointer" });

  const scmTooltip = "Esta metodología mide el tiempo que le toma al solicitante todo el proceso de identificar los requerimientos de trámite, presentarlo ante una autoridad y esperar una resolución final; no contempla costos financieros, como pagos de derechos o costo de insumos para preparar el trámite.";

  const resetPage = (fn: React.Dispatch<React.SetStateAction<string>>) => (v: string) => { fn(v); setPage(0); };

  // Alimenta las 5 KpiCard en ambos modos (por país y "Todos") — antes
  // estaban hardcodeadas sin importar el país seleccionado.
  const td = COUNTRY_TRAMITES_DATA[country] ?? COUNTRY_TRAMITES_DATA["Bolivia"];

  // ── Panel regional (país === "Todos") ───────────────────────────────────────
  if (country === "Todos") {
    const paisesRow1 = COUNTRIES.slice(0, 3);
    const paisesRow2 = COUNTRIES.slice(3);

    const paisCard = (pais: Country) => {
      const tdPais = COUNTRY_TRAMITES_DATA[pais];
      const subdims = tdPais.cargaPorTipo["Accesibilidad"]?.subdimensiones ?? [];
      const entrada = subdims.map(s => ({
        nombre: s.nombre,
        total: s.niveles.n4 + s.niveles.n3 + s.niveles.n2 + s.niveles.n1,
      }));
      return (
        <BarrerasPorPaisCard
          key={pais}
          pais={pais}
          total={tdPais.total}
          entrada={entrada}
          coberturaPct={COBERTURA_MUESTRA[pais as Exclude<Country, "Todos">]}
          validadoHitlPct={TRAMITES_VALIDADO_HITL_MUESTRA[pais]}
          onVerBarreras={() => onCountryChange?.(pais)}
          buttonLabel="Ver trámites por país →"
          showEntradaSelect={false}
          onEntradaClick={(subdimension) => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais, tipoCarga: "Accesibilidad", subdimension } })}
        />
      );
    };

    // dato de muestra — no hay catálogo real de trámites individuales
    // priorizados para ningún país todavía (mismo pendiente ya anotado en
    // Barreras).
    const tramitesPrioritariosFilas = COUNTRIES.flatMap(pais =>
      (TRAMITES_PRIORITARIOS_MUESTRA[pais as Exclude<Country, "Todos">] ?? []).map(t => ({ pais, ...t }))
    );
    const prioritariosPageCount = Math.ceil(tramitesPrioritariosFilas.length / PAGE_SIZE);
    const prioritariosPageItems = tramitesPrioritariosFilas.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const maxEntidad = Math.max(...td.topEntidades.map(e => e.value), 1);

    const SEV_LEGEND_TRAMITES = [
      { label: "Crítica", color: C.critico },
      { label: "Alta", color: C.alto },
    ];

    return (
      <div className="p-4 md:p-8 overflow-y-auto h-full">
        <Header
          breadcrumb="Trámites con potencial de mejora"
          title="Trámites con potencial de mejora"
          actions={
            <>
              {/* TODO: destino de "Ver metodología" (¿documentación / metodología del SCM?) */}
              <button style={HDR_BTN_PILL}>Ver metodología</button>
              <button style={HDR_BTN_PRIMARY} onClick={() => onNavigate({ screen: "reportes", prefill: { tipoHallazgo: "carga", pais: "Todos" } })}>
                <ExternalLink size={13} /><span className="hidden sm:inline">Generar reporte</span><span className="sm:hidden">Reporte</span>
              </button>
              {/* TODO: dropdown de opciones de descarga */}
              <button style={HDR_BTN_SECONDARY}>
                Descargar <ChevronDown size={13} />
              </button>
            </>
          }
        />

        <BandaCobertura text={`Periodo de análisis: ${periodoTextoTramites} · Cobertura regional: 86% de fuentes procesadas · ${COUNTRIES.length} países activos`} />

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <KpiCard label="Total de trámites identificados" value={td.total.toLocaleString("es-BO")} />
          <KpiCard label="Trámites con potencial de mejora" value={td.total.toLocaleString("es-BO")} />
          <KpiCard label="Costo estimado SCM" value={`USD ${(td.costoEstimadoUSD / 1_000_000).toFixed(1)} M`} valueColor={C.steel4} tooltip={scmTooltip} />
          <KpiCard label="Trámites críticos" value={String(td.criticos)} valueColor={C.critico} />
          {/* TODO: primer cruce Trámites↔Validación HITL, no existe ese cálculo real todavía */}
          <KpiCard label="% Validado HITL" value={String(TRAMITES_VALIDADO_HITL_MUESTRA["Todos"])} valueSuffix="%" />
        </div>

        {/* Trámites por país */}
        <p className="uppercase mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, color: C.textMuted }}>Trámites por país</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
          {paisesRow1.map(paisCard)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
          {paisesRow2.map(paisCard)}
        </div>

        {/* Leyenda de severidad */}
        <div className="flex flex-wrap items-center gap-5 mb-6">
          {SEV_LEGEND_TRAMITES.map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, backgroundColor: s.color, display: "inline-block" }} />
              <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" style={{ alignItems: "stretch" }}>
          {/* Tipo de usuario */}
          <div className="rounded-lg p-5" style={{ backgroundColor: C.card }}>
            <p className="text-[11px] uppercase tracking-widest font-medium mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Tipo de usuario</p>
            <div className="flex flex-col gap-2.5">
              {[
                { nombre: "Empresarial", valor: td.tipoUsuario.empresarial, color: C.steel4 },
                { nombre: "Ciudadano", valor: td.tipoUsuario.ciudadano, color: C.steel3 },
                { nombre: "Mixto", valor: td.tipoUsuario.mixto, color: C.steel2 },
              ].map(f => (
                <div
                  key={f.nombre}
                  className="flex items-center gap-2.5"
                  onClick={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { tipoUsuario: f.nombre } })}
                  style={{ cursor: "pointer" }}
                >
                  <span className="flex-shrink-0" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, width: 72 }}>{f.nombre}</span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: 10, backgroundColor: C.border }}>
                    <div style={{ width: `${td.total > 0 ? (f.valor / td.total) * 100 : 0}%`, height: "100%", backgroundColor: f.color }} />
                  </div>
                  <span className="flex-shrink-0 text-right" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, color: C.textMuted, width: 32 }}>{f.valor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trámites por: Entidad */}
          <div className="rounded-xl flex flex-col h-full" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="px-5 pt-4 pb-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
              <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Trámites por: Entidad</p>
              <select
                defaultValue="entidad"
                // TODO: sin lógica de cambio de dimensión todavía
                style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, backgroundColor: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
              >
                <option value="entidad">Entidad</option>
              </select>
            </div>
            <div className="px-5 pt-4 flex flex-col gap-2.5 flex-1">
              {td.topEntidades.map(e => (
                <div
                  key={e.name}
                  className="flex items-center gap-3"
                  onClick={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { entidad: e.name } })}
                  style={{ cursor: "pointer" }}
                >
                  <span className="flex-shrink-0 leading-tight" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, width: 150 }}>{e.name}</span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: 10, backgroundColor: "#E6ECF3" }}>
                    <div style={{ width: `${(e.value / maxEntidad) * 100}%`, height: "100%", backgroundColor: C.steel2 }} />
                  </div>
                  <span className="flex-shrink-0 text-right" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, color: C.textMuted, width: 32 }}>{e.value}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 mt-2 flex items-center justify-between" style={{ borderTop: `1px solid ${C.border}` }}>
              <span className="uppercase" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10.5, color: C.textMuted }}>Cobertura 91%</span>
              <button
                onClick={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: {} })}
                style={{ backgroundColor: C.text, color: "white", border: "none", borderRadius: 999, padding: "6px 14px", fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Ver tabla completa
              </button>
            </div>
          </div>
        </div>

        {/* Trámites prioritarios */}
        <div className="rounded-lg" style={{ backgroundColor: C.card }}>
          <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: C.border }}>
            <h3 className="text-[13px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Trámites prioritarios</h3>
            <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.steel3 }}>({tramitesPrioritariosFilas.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Trámite", "País", "Entidad", "Eje", "Costo", "Severidad", "Estado HITL", "Acción sugerida"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-widest whitespace-nowrap"
                      style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prioritariosPageItems.map((t, i) => (
                  <tr
                    key={i}
                    className="cursor-pointer hover:bg-[#F4F7FB] transition-colors"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onClick={() => onNavigate({ screen: "tramite-detail", id: t.id })}
                  >
                    <td className="px-4 py-3 text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text, maxWidth: 200 }}>{t.tramite}</td>
                    <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{t.pais}</td>
                    <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 180 }}>{t.entidad}</td>
                    <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{t.eje}</td>
                    <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{t.costo}</td>
                    <td className="px-4 py-3"><TramiteSeveridadBadge level={t.severidad} /></td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
                        style={{ backgroundColor: ESTADO_HITL_META[t.estadoHitl].bg, color: ESTADO_HITL_META[t.estadoHitl].color, fontFamily: "IBM Plex Sans, sans-serif" }}>
                        {t.estadoHitl}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-semibold" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.steel3, maxWidth: 220 }}>{t.accion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {prioritariosPageCount > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: C.border }}>
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, tramitesPrioritariosFilas.length)} de {tramitesPrioritariosFilas.length}
              </span>
              <div className="flex gap-2">
                {[...Array(prioritariosPageCount)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: "none",
                      backgroundColor: i === page ? C.steel4 : C.border,
                      color: i === page ? "white" : C.textMuted,
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

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      {(() => {
        const activeFilters: string[] = [];
        if (sector) activeFilters.push(`Sector: ${sector}`);
        if (entidad) activeFilters.push(`Entidad: ${entidad}`);
        if (tipoUsuario) activeFilters.push(`Tipo de usuario: ${tipoUsuario}`);
        if (tipoCarga) activeFilters.push(`Tipo de carga: ${tipoCarga}`);
        if (subdimension) activeFilters.push(`Subdimensión: ${subdimension}`);
        if (etapaCiclo) activeFilters.push(`Etapa: ${etapaCiclo}`);
        if (tamano) activeFilters.push(`Tamaño: ${tamano}`);
        if (ano) activeFilters.push(`Año: ${ano}`);
        const exportCtx = JSON.stringify({ tipo: "carga", pais: countryLabel, sector: sector || "Todos los sectores", filtros: activeFilters, registros: `${filtered.length} de ${TRAMITES_EXT.length} trámites`, fecha: new Date().toLocaleString("es-BO"), periodo: periodoTextoTramites });
        const reportesPrefill: ReportesPrefill = {
          tipoHallazgo: "carga",
          pais: country,
          sectores: sector ? [sector] : [],
          tipoCarga: tipoCarga || "",
          subdimCarga: subdimension || "",
          tipoTramite: tipoUsuario || "",
          entidad: entidad || "",
        };
        return (
          <Header
            breadcrumb="Regulaciones › Trámites"
            title="Trámites"
            subtitle={`${countryLabel} · Todos los sectores`}
            actions={
              <>
                <button style={HDR_BTN_SECONDARY} onClick={() => onNavigate({ screen: "reporte-pdf", context: exportCtx })}>
                  <Download size={13} /><span className="hidden sm:inline">Exportar PDF</span><span className="sm:hidden">PDF</span>
                </button>
                <button style={HDR_BTN_PRIMARY} onClick={() => onNavigate({ screen: "reportes", prefill: reportesPrefill })}>
                  <ExternalLink size={13} /><span className="hidden sm:inline">Generar reporte</span><span className="sm:hidden">Reporte</span>
                </button>
              </>
            }
          />
        );
      })()}

      <BandaCobertura text={`Periodo de análisis: ${periodoTextoTramites} · cobertura ${COBERTURA_MUESTRA[country as Exclude<Country, "Todos">] ?? COBERTURA_MUESTRA["Bolivia"]}%`} />

      {/* Filter bar — wraps to multiple rows; order: País · Sector · Entidad · Tipo usuario · Tipo carga · Subdim · Etapa · Tamaño · Año */}
      <div className="flex flex-wrap gap-2 mb-5">
        <select className="grow" style={selStyle} value={country} onChange={e => { onCountryChange?.(e.target.value as Country); setPage(0); }}>
          <option value="Todos">Todos los países</option>
          <option value="Argentina">Argentina</option>
          <option value="Bolivia">Bolivia</option>
          <option value="Chile">Chile</option>
          <option value="Ecuador">Ecuador</option>
          <option value="Perú">Perú</option>
        </select>
        <select className="grow" style={selStyle} value={sector} onChange={e => resetPage(setSector)(e.target.value)}>
          <option value="">Todos los sectores</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="grow" style={selStyle} value={entidad} onChange={e => resetPage(setEntidad)(e.target.value)}>
          <option value="">Entidad emisora</option>
          {entidades.map(e => <option key={e} value={e}>{e.length > 36 ? e.slice(0, 36) + "…" : e}</option>)}
        </select>
        <select className="grow" style={selStyle} value={tipoUsuario} onChange={e => resetPage(setTipoUsuario)(e.target.value)}>
          <option value="">Tipo de usuario</option>
          <option value="Empresarial">Empresarial</option>
          <option value="Ciudadano">Ciudadano</option>
        </select>
        <select className="grow" style={selStyle} value={tipoCarga} onChange={e => { setTipoCarga(e.target.value); setSubdimension(""); setPage(0); }}>
          <option value="">Tipo de carga</option>
          <option value="Accesibilidad">Accesibilidad</option>
          <option value="Certidumbre">Certidumbre</option>
          <option value="Cumplimiento">Cumplimiento</option>
          <option value="Proporcionalidad">Proporcionalidad</option>
        </select>
        <select className="grow" style={selDisabled(!tipoCarga)} value={subdimension} disabled={!tipoCarga}
          onChange={e => resetPage(setSubdimension)(e.target.value)}>
          <option value="">Subdimensión</option>
          {subdimOpts.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="grow" style={selStyle} value={etapaCiclo} onChange={e => resetPage(setEtapaCiclo)(e.target.value)}>
          <option value="">Etapa del ciclo de vida</option>
          <option value="Apertura">Apertura</option>
          <option value="Operación">Operación</option>
          <option value="Cierre">Cierre</option>
          <option value="Expansión">Expansión</option>
        </select>
        <select className="grow" style={selStyle} value={tamano} onChange={e => resetPage(setTamano)(e.target.value)}>
          <option value="">Tamaño de empresa</option>
          <option value="Micro">Micro</option>
          <option value="Pequeña">Pequeña</option>
          <option value="Mediana">Mediana</option>
          <option value="Grande">Grande</option>
        </select>
        <select className="grow" style={selStyle} value={ano} onChange={e => resetPage(setAno)(e.target.value)}>
          <option value="">Todos los años</option>
          {[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026].map(y => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>

      {/* KPIs — antes hardcodeados sin importar el país, ahora alimentados
          desde COUNTRY_TRAMITES_DATA[country] */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Total trámites" value={td.total.toLocaleString("es-BO")} sub={countryLabel} />
        <KpiCard
          label="Costo estimado de trámites"
          value={`USD ${(td.costoEstimadoUSD / 1_000_000).toFixed(1)} M`}
          sub="simulado · anual"
          valueColor={C.steel4}
          tooltip={scmTooltip}
        />
        <KpiCard label="Empresariales" value={String(td.tipoUsuario.empresarial)} sub={`${td.total > 0 ? Math.round((td.tipoUsuario.empresarial / td.total) * 100) : 0}% del total`} />
        <KpiCard label="Ciudadanos" value={String(td.tipoUsuario.ciudadano)} sub={`${td.total > 0 ? Math.round((td.tipoUsuario.ciudadano / td.total) * 100) : 0}% del total`} />
        <KpiCard label="Cargas críticas" value={String(td.criticos)} sub="nivel 4" valueColor={C.critico} />
      </div>

      {/* Row: Carga por tipo | Top 10 entidades — antes usaban las constantes
          sueltas de Bolivia (PANEL_CARGA_TIPO_DATA / TOP_ENTIDADES_BOLIVIA)
          sin importar el país; ahora usan td.cargaPorTipo / td.topEntidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Sin onSegmentClick (a diferencia de "IDR por clasificación" en
            Barreras): los segmentos de la barra son Crítico/Alto/Mediano/Bajo,
            pero ALL_TRAMITES.severidad solo tiene "Crítica"/"Alta" (2
            niveles, forma femenina) -- ningún segmento clickeado matchearía
            un valor real, mismo criterio de no forzar una dimensión que no
            existe en el dataset. onRowClick sí queda (tipoCarga+subdimension,
            que sí existen). */}
        <PanelTipoSubdimension
          label="CARGA POR EJE"
          tipos={["Accesibilidad", "Certidumbre", "Cumplimiento", "Proporcionalidad"]}
          datos={td.cargaPorTipo}
          onRowClick={(tipoCarga, subdimension) => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais: country, tipoCarga, subdimension } })}
        />
        <div className="rounded-lg p-6" style={{ backgroundColor: C.card }}>
          <p className="text-[11px] uppercase tracking-widest mb-4 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Top 10 entidades por número de trámites</p>
          <div className="flex flex-col gap-2.5">
            {(() => {
              const maxEntidad = Math.max(...td.topEntidades.map(e => e.value), 1);
              return td.topEntidades.map(item => (
                <div
                  key={item.name}
                  className="flex items-center gap-3"
                  onClick={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais: country, entidad: item.name } })}
                  style={{ cursor: "pointer" }}
                >
                  <span className="text-[11px] flex-shrink-0 leading-tight" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, width: 188 }}>{item.name}</span>
                  <div className="flex-1 rounded-full overflow-hidden h-[8px]" style={{ backgroundColor: "#E6ECF3" }}>
                    <div className="h-full rounded-full" style={{ width: `${(item.value / maxEntidad) * 100}%`, backgroundColor: C.steel2 }} />
                  </div>
                  <span className="text-[12px] font-semibold flex-shrink-0" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted, width: 24, textAlign: "right" }}>{item.value}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Etapa del ciclo empresarial + Afectación MIPYME (apiladas en la
          columna izquierda) · Tipo de usuario (columna derecha, altura
          distinta) — dato de muestra, ver TODO junto a cada const. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" style={{ alignItems: "stretch" }}>
        <div className="flex flex-col gap-4">
          <ComposicionSimplePanel
            label="Etapa del ciclo empresarial"
            filas={ETAPA_CICLO_MUESTRA[country as Exclude<Country, "Todos">] ?? ETAPA_CICLO_MUESTRA["Bolivia"]}
            actionLabel="Ver tabla completa"
            onAction={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais: country } })}
            onRowClick={(etapaCiclo) => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais: country, etapaCiclo } })}
          />
          <ComposicionSimplePanel
            label="Afectación MIPYME"
            filas={MIPYME_MUESTRA[country as Exclude<Country, "Todos">] ?? MIPYME_MUESTRA["Bolivia"]}
            actionLabel="Ver tabla completa"
            onAction={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais: country } })}
            onRowClick={(afectacionMipyme) => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais: country, afectacionMipyme } })}
          />
        </div>
        <ComposicionSimplePanel
          label="Tipo de usuario"
          filas={[
            { nombre: "Empresarial", valor: td.tipoUsuario.empresarial },
            { nombre: "Ciudadano", valor: td.tipoUsuario.ciudadano },
            { nombre: "Mixto", valor: td.tipoUsuario.mixto },
          ]}
          actionLabel="Ver tabla completa"
          onAction={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais: country } })}
          onRowClick={(tipoUsuario) => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais: country, tipoUsuario } })}
        />
      </div>

      {/* Acciones de mejora en trámites · Afectaciones — series independientes
          (antes esta segunda sección repetía los números de la primera) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" style={{ alignItems: "stretch" }}>
        {/* tramite.accionCategoria (corta, ver ALL_TRAMITES) es la que filtra
            acá -- tramite.accionSugerida sigue siendo la descripción larga
            que ya usan las tablas, sin tocar. */}
        <ComposicionSimplePanel
          label="Acciones de mejora en trámites"
          filas={TRAMITES_ACCION_MEJORA_MUESTRA[country as Exclude<Country, "Todos">] ?? TRAMITES_ACCION_MEJORA_MUESTRA["Bolivia"]}
          actionLabel="Ver más"
          onAction={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais: country } })}
          onRowClick={(accionCategoria) => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais: country, accionCategoria } })}
        />
        <ComposicionSimplePanel
          label="Afectaciones"
          filas={TRAMITES_AFECTACIONES_MUESTRA[country as Exclude<Country, "Todos">] ?? TRAMITES_AFECTACIONES_MUESTRA["Bolivia"]}
          actionLabel="Ver más"
          onAction={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais: country } })}
          onRowClick={(tipoAfectacion) => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { pais: country, tipoAfectacion } })}
        />
      </div>

      {/* Trámites prioritarios — dato de muestra (TRAMITES_PRIORITARIOS_MUESTRA),
          filtrado por país; antes esta tabla mostraba TRAMITES_EXT (catálogo
          de Bolivia) sin importar el país seleccionado en el filtro de arriba. */}
      {(() => {
        const filasPais = TRAMITES_PRIORITARIOS_MUESTRA[country as Exclude<Country, "Todos">] ?? TRAMITES_PRIORITARIOS_MUESTRA["Bolivia"];
        const prioritariosPageCount = Math.ceil(filasPais.length / PAGE_SIZE);
        const prioritariosPageItems = filasPais.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
        return (
          <div className="rounded-lg" style={{ backgroundColor: C.card }}>
            <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: C.border }}>
              <h3 className="text-[13px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Trámites prioritarios</h3>
              <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.steel3 }}>({filasPais.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Trámite", "Tipo de usuario", "Entidad", "Sector", "Eje", "Costo", "Severidad", "Estado HITL", "Acción sugerida"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-widest whitespace-nowrap"
                        style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prioritariosPageItems.map((t, i) => (
                    <tr
                      key={i}
                      className="cursor-pointer hover:bg-[#F4F7FB] transition-colors"
                      style={{ borderBottom: `1px solid ${C.border}` }}
                      onClick={() => onNavigate({ screen: "tramite-detail", id: t.id })}
                    >
                      <td className="px-4 py-3 text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text, maxWidth: 200 }}>{t.tramite}</td>
                      <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{t.tipoUsuario}</td>
                      <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 180 }}>{t.entidad}</td>
                      <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 160 }}>{t.sector}</td>
                      <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{t.eje}</td>
                      <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{t.costo}</td>
                      <td className="px-4 py-3"><TramiteSeveridadBadge level={t.severidad} /></td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
                          style={{ backgroundColor: ESTADO_HITL_META[t.estadoHitl].bg, color: ESTADO_HITL_META[t.estadoHitl].color, fontFamily: "IBM Plex Sans, sans-serif" }}>
                          {t.estadoHitl}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-semibold" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.steel3, maxWidth: 220 }}>{t.accion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {prioritariosPageCount > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: C.border }}>
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filasPais.length)} de {filasPais.length}
                </span>
                <div className="flex gap-2">
                  {[...Array(prioritariosPageCount)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i)}
                      style={{
                        width: 28, height: 28, borderRadius: 6, border: "none",
                        backgroundColor: i === page ? C.steel4 : C.border,
                        color: i === page ? "white" : C.textMuted,
                        fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ─── Screen 6 — Trámite Detail ────────────────────────────────────────────────
function TramiteDetail({ id, onNavigate }: { id: string; onNavigate: (v: View) => void }) {
  const tramite = ALL_TRAMITES.find(t => t.id === id);
  if (!tramite) return null;

  const linkedDistorsiones = ALL_DISTORSIONES.filter(d => d.tramiteId === id);

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <button className="flex items-center gap-1 text-[12px] mb-4" style={{ color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
        onClick={() => onNavigate({ screen: "tramites" })}>
        ← Volver a Trámites
      </button>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Regulaciones › Trámites › Detalle</p>
        <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-[12px] font-medium"
          style={{ backgroundColor: C.text, color: "#FAFBFC", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
          onClick={() => onNavigate({ screen: "reporte-pdf", context: tramite.sector })}>
          <Download size={13} /> <span className="hidden sm:inline">Exportar PDF</span><span className="sm:hidden">PDF</span>
        </button>
      </div>

      <div className="flex items-start justify-between mt-2 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
            <h1 className="text-[24px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{tramite.nombre}</h1>
            {(tramite as any).prioritario ? (
              <span className="text-[11px] px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif" }}>Prioritario</span>
            ) : (
              <span className="text-[11px] px-3 py-1 rounded-full" style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>No prioritario</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{tramite.entidad}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>{tramite.etapa}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: C.steel3 + "22", color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif" }}>{tramite.tipo}</span>
          </div>
        </div>
      </div>

      {/* KPI block — wraps to 2 rows when 6 cards */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="rounded-lg p-4 min-w-[140px] flex-1" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Tiempo promedio</p>
          <p className="text-[20px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{tramite.costo.tiempo}</p>
        </div>
        {(tramite.costo as any).plazoDias !== undefined && (
          <div className="rounded-lg p-4 min-w-[140px] flex-1" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Plazo de resolución</p>
            <p className="text-[20px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{(tramite.costo as any).plazoDias} días</p>
          </div>
        )}
        <div className="rounded-lg p-4 min-w-[150px] flex-1" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Frecuencia anual</p>
          <p className="text-[15px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{tramite.costo.frecuencia}</p>
        </div>
        <div className="rounded-lg p-4 min-w-[140px] flex-1" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Carga total</p>
          <p className="text-[18px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.critico }}>{tramite.costo.cargaTotal}</p>
          <p className="text-[10px] mt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>simulado · modelo SCM</p>
        </div>
        {(tramite.costo as any).plazoDias !== undefined && (
          <div className="rounded-lg p-4 min-w-[140px] flex-1" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Costo por tiempo</p>
            <p className="text-[18px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel3 }}>USD 38/h</p>
            <p className="text-[10px] mt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>simulado · costo/hora</p>
          </div>
        )}
        <div className="rounded-lg p-4 min-w-[160px] flex-1" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Costo monetario</p>
          <p className="text-[20px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>{tramite.costo.monetario}</p>
          <p className="text-[10px] mt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>simulado</p>
        </div>
      </div>

      {/* Process flow + right column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left — Flujo del proceso (vertical) */}
        <div className="rounded-lg p-6" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[11px] uppercase tracking-widest font-medium mb-5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Actividades Estándar</p>
          <div className="flex flex-col">
            {tramite.pasos.map((paso, i) => (
              <div key={paso.id} className="flex gap-4">
                {/* Spine */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{
                      backgroundColor: paso.friccion ? C.critico : C.steel3,
                      color: "white",
                      fontFamily: "Space Grotesk, sans-serif",
                      boxShadow: paso.friccion ? `0 0 0 4px ${C.critico}22` : `0 0 0 4px ${C.steel3}22`,
                    }}>
                    {paso.friccion ? <AlertTriangle size={15} /> : paso.id}
                  </div>
                  {i < tramite.pasos.length - 1 && (
                    <div className="w-0.5 flex-1 my-1 min-h-[24px]" style={{ backgroundColor: paso.friccion ? C.critico + "66" : C.border }} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-5 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif", color: paso.friccion ? C.critico : C.text }}>{paso.nombre}</p>
                    {((paso as any).tiempo || (paso as any).costo) && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {(paso as any).tiempo && (
                          <span className="text-[11px] px-2 py-0.5 rounded" style={{ backgroundColor: C.canvas, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif", border: `1px solid ${C.border}` }}>{(paso as any).tiempo}</span>
                        )}
                        {(paso as any).costo && (
                          <span className="text-[11px] px-2 py-0.5 rounded font-medium" style={{ backgroundColor: C.steel4 + "11", color: C.steel4, fontFamily: "Space Grotesk, sans-serif", border: `1px solid ${C.steel4}22` }}>{(paso as any).costo}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[12px] mt-1 leading-snug" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{paso.descripcion}</p>
                  {paso.friccion && paso.friccionDetalle && (
                    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: C.critico + "0E", border: `1px solid ${C.critico}40` }}>
                      <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.critico }}>Fricción identificada</p>
                      <p className="text-[12px] leading-snug mb-2" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{paso.friccionDetalle}</p>
                      <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel3 }}>Acción de simplificación</p>
                      <p className="text-[12px] leading-snug" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{paso.simplificacion}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Diagnóstico + Barreras */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[11px] uppercase tracking-widest font-medium mb-2" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Diagnóstico global</p>
            <p className="text-[13px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{tramite.diagnostico}</p>
          </div>

          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}>
              <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Distorsiones de carga asociadas</p>
              <span className="text-[11px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel3 }}>({linkedDistorsiones.length})</span>
            </div>
            {linkedDistorsiones.length === 0 ? (
              <div className="px-5 py-6 flex items-center justify-center">
                <p className="text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Sin distorsiones registradas</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {linkedDistorsiones.map((d, i) => (
                  <button key={d.id}
                    className="flex items-start justify-between gap-3 px-4 py-3 text-left w-full hover:bg-[#F4F7FB] transition-colors"
                    style={{ borderBottom: i < linkedDistorsiones.length - 1 ? `1px solid ${C.border}` : "none", fontFamily: "IBM Plex Sans, sans-serif", background: "none", cursor: "pointer" }}
                    onClick={() => onNavigate({ screen: "distorsion-detail", id: d.id })}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-semibold tracking-wide" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel3 }}>{d.id}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: C.canvas, color: C.textMuted }}>{d.tipoCarga}</span>
                      </div>
                      <p className="text-[13px] font-medium leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{d.nombre}</p>
                      <p className="text-[11px] mt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{d.subdimension}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[12px] font-semibold whitespace-nowrap" style={{ fontFamily: "Space Grotesk, sans-serif", color: d.irr === 4 ? C.critico : C.textMuted }}>
                        {d.irr} · {IRR_LABELS[d.irr]}
                      </span>
                      <ArrowRight size={13} color={C.textMuted} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 6b — Distorsión de Carga Detail ───────────────────────────────────
function DistorsionDetail({ id, onNavigate }: { id: string; onNavigate: (v: View) => void }) {
  const d = ALL_DISTORSIONES.find(x => x.id === id);
  if (!d) return null;

  const tramite = ALL_TRAMITES.find(t => t.id === d.tramiteId);
  const textParts = d.textNormativo.split(d.pasajeResaltado);

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <button className="flex items-center gap-1 text-[12px] mb-4 min-h-[44px]" style={{ color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
        onClick={() => tramite ? onNavigate({ screen: "tramite-detail", id: tramite.id }) : onNavigate({ screen: "tramites" })}>
        ← Volver al trámite
      </button>
      <div className="flex items-center justify-between mb-1 gap-2">
        <p className="text-[10px] md:text-[11px] uppercase tracking-widest" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
          Regulaciones › Trámites › {tramite?.nombre ?? "Detalle"} › Distorsión
        </p>
        <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-[12px] font-medium flex-shrink-0"
          style={{ backgroundColor: C.text, color: "#FAFBFC", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
          onClick={() => onNavigate({ screen: "reporte-pdf", context: d.tipoCarga })}>
          <Download size={13} /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Main column */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase"
                style={{ backgroundColor: d.irr === 4 ? C.critico + "18" : C.steel2 + "22", color: d.irr === 4 ? C.critico : C.steel3, fontFamily: "Space Grotesk, sans-serif", border: `1px solid ${d.irr === 4 ? C.critico + "44" : C.steel2 + "44"}` }}>
                {d.irr} · {IRR_LABELS[d.irr]}
              </span>
              <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{d.tipoCarga} · {d.subdimension}</span>
            </div>
            <p className="text-[11px] uppercase tracking-widest mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel3 }}>{d.id}</p>
            <h1 className="text-[24px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{d.nombre}</h1>
          </div>

          {/* Legal text block */}
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}>
              <div>
                <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Texto normativo de origen</p>
                <p className="text-[12px] font-semibold mt-0.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{d.instrumento}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{d.articulo}</p>
                <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Bolivia · 2022</p>
              </div>
            </div>
            <div className="flex">
              <div className="w-1 flex-shrink-0" style={{ backgroundColor: C.steel2 }} />
              <div className="p-5">
                <p className="text-[12px] italic mb-1 text-right" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>texto de muestra</p>
                <p className="text-[13px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>
                  {textParts[0]}
                  <mark style={{ backgroundColor: "#C7545025", borderBottom: `2px solid ${C.critico}`, padding: "1px 2px" }}>
                    {d.pasajeResaltado}
                  </mark>
                  {textParts[1] ?? ""}
                </p>
              </div>
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[11px] uppercase tracking-widest font-medium mb-2" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Diagnóstico económico</p>
            <p className="text-[13px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{d.diagnostico}</p>
          </div>

          {/* Justificación */}
          <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[11px] uppercase tracking-widest font-medium mb-2" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Justificación del hallazgo</p>
            <p className="text-[13px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{d.justificacion}</p>
          </div>
        </div>

        {/* Sidebar — Ficha */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[11px] uppercase tracking-widest font-medium mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Ficha</p>
            {([
              ["Código",                  d.id],
              ["Tipo de carga",           d.tipoCarga],
              ["Subdimensión",            d.subdimension],
              ["Etapa del ciclo de vida", d.etapaCicloVida],
              ["IDR",                     `${d.irr} · ${IRR_LABELS[d.irr]}`],
              ["Trámite",                 tramite?.nombre ?? d.tramiteNombre],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: C.border }}>
                <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{k}</span>
                <span className="text-[12px] font-medium text-right" style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: k === "IDR" && d.irr === 4 ? C.critico : C.text,
                  maxWidth: "60%",
                }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Link back to tramite */}
          {tramite && (
            <button className="rounded-lg p-4 text-left w-full hover:shadow-sm transition-shadow"
              style={{ backgroundColor: C.card, border: `1px solid ${C.steel2}44`, fontFamily: "IBM Plex Sans, sans-serif", cursor: "pointer" }}
              onClick={() => onNavigate({ screen: "tramite-detail", id: tramite.id })}>
              <p className="text-[10px] uppercase tracking-widest mb-1 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel3 }}>Trámite al que pertenece</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-medium leading-tight" style={{ color: C.text }}>{tramite.nombre}</p>
                <ArrowRight size={13} color={C.steel3} />
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>{tramite.entidad}</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Auth shared components ───────────────────────────────────────────────────

function AuthBrandPanel() {
  return (
    <div
      className="hidden md:flex w-1/2 h-full flex-shrink-0 items-center justify-center relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 90% 80% at 38% 52%, #1E3A5F 0%, #0A1628 70%)",
      }}
    >
      {/* Radial glow displaced to center-left */}
      <div style={{
        position: "absolute", left: "8%", top: "28%",
        width: "58%", height: "52%",
        background: "radial-gradient(ellipse, rgba(62,110,158,0.38) 0%, transparent 68%)",
        pointerEvents: "none",
      }} />
      {/* Glass card */}
      <div style={{
        width: "68%", height: "62%",
        borderRadius: 24,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: 48,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 1,
      }}>
        <div>
          <span style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 500,
            fontSize: 40,
            letterSpacing: "0.20em",
            color: "white",
            display: "block",
          }}>ALEPH</span>
        </div>
        <div>
          <p style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 500,
            fontSize: 46,
            lineHeight: 1.15,
            color: "white",
            margin: 0,
          }}>
            Sistema de<br />inteligencia<br />regulatoria
          </p>
        </div>
      </div>
    </div>
  );
}

function ClockXSvg() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8A94A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="9" />
      <path d="M11 7v4l2.5 2.5" />
      <line x1="17" y1="17" x2="22" y2="22" />
      <line x1="22" y1="17" x2="17" y2="22" />
    </svg>
  );
}

interface AuthInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  showToggle?: boolean;
  showPassword?: boolean;
  onToggle?: () => void;
  autoComplete?: string;
}

function AuthInput({ label, type = "text", value, onChange, onBlur, error, showToggle, showPassword, onToggle, autoComplete }: AuthInputProps) {
  const inputType = showToggle ? (showPassword ? "text" : "password") : type;
  const borderStyle = error
    ? "1px solid var(--form-error, #C75450)"
    : "1px solid transparent";

  return (
    <div>
      <label style={{
        display: "block",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.10em",
        marginBottom: 6,
        fontFamily: "Space Grotesk, sans-serif",
        color: "#6B7A8D",
        fontWeight: 500,
      }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          style={{
            width: "100%",
            padding: "11px 16px",
            paddingRight: showToggle ? 44 : 16,
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "IBM Plex Sans, sans-serif",
            color: "#14161A",
            backgroundColor: "#ffffff",
            border: borderStyle,
            outline: "none",
            boxSizing: "border-box",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            transition: "border-color 0.15s",
          }}
          onFocus={e => {
            if (!error) e.currentTarget.style.border = `1px solid ${C.steel3}`;
          }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            tabIndex={-1}
            style={{
              position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none", padding: 2,
              cursor: "pointer", color: "#8A94A0", display: "flex",
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
          <AlertCircle size={14} color="var(--form-error, #C75450)" />
          <span style={{ fontSize: 12, color: "var(--form-error, #C75450)", fontFamily: "IBM Plex Sans, sans-serif" }}>{error}</span>
        </div>
      )}
    </div>
  );
}

function PassReqs({ password }: { password: string }) {
  const reqs = [
    { label: "Mínimo 12 caracteres", met: password.length >= 12 },
    { label: "Una mayúscula y una minúscula", met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: "Un número", met: /\d/.test(password) },
    { label: "Un carácter especial", met: /[^A-Za-z0-9]/.test(password) },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
      {reqs.map(r => (
        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {r.met
            ? <CircleCheck size={14} color="#5E8FC2" />
            : <Circle size={14} color="#C5CDD6" />
          }
          <span style={{ fontSize: 12, color: r.met ? "#14161A" : "#6B7785", fontFamily: "IBM Plex Sans, sans-serif" }}>
            {r.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Shared layout for auth screens
function AuthLayout({ children, demoLink }: { children: React.ReactNode; demoLink?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <AuthBrandPanel />
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EDF1F5",
        position: "relative",
        overflowY: "auto",
        padding: "32px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {children}
        </div>
        {demoLink && (
          <div style={{
            position: "absolute", bottom: 16, right: 20,
            fontSize: 10, color: "#C5CDD6",
            fontFamily: "IBM Plex Sans, sans-serif",
          }}>
            {demoLink}
          </div>
        )}
      </div>
    </div>
  );
}

// Auth heading helpers
const AuthTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 style={{
    fontFamily: "Space Grotesk, sans-serif",
    fontWeight: 600,
    fontSize: 28,
    color: "#14161A",
    lineHeight: 1.25,
    margin: 0,
  }}>{children}</h1>
);

const AuthSupport = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontFamily: "IBM Plex Sans, sans-serif",
    fontSize: 14,
    color: "#6B7A8D",
    lineHeight: 1.55,
    margin: 0,
  }}>{children}</p>
);

const AuthLink = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      background: "none", border: "none", padding: 0,
      fontSize: 13, color: C.steel3,
      fontFamily: "IBM Plex Sans, sans-serif",
      cursor: "pointer",
      textAlign: "left",
    }}
  >{children}</button>
);

const AuthPrimaryBtn = ({ children, onClick, disabled, type = "submit" }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: "submit" | "button";
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    style={{
      width: "100%",
      padding: "13px 16px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      fontFamily: "Space Grotesk, sans-serif",
      backgroundColor: disabled ? "#C0C9D4" : C.steel4,
      color: disabled ? "#8A94A0" : "white",
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background-color 0.15s, opacity 0.15s",
    }}
  >{children}</button>
);

const AuthSecondaryBtn = ({ children, onClick, disabled }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      width: "100%",
      padding: "13px 16px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      fontFamily: "Space Grotesk, sans-serif",
      backgroundColor: "transparent",
      color: disabled ? "#C0C9D4" : C.steel4,
      border: `1.5px solid ${disabled ? "#DCE3EB" : C.steel3}`,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "border-color 0.15s, color 0.15s",
    }}
  >{children}</button>
);

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onNavigate }: { onLogin: (role: UserRole) => void; onNavigate: (v: AuthView) => void }) {
  const [email, setEmail] = useState("ana.mejia@iadb.org");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("administrador");
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailError = emailTouched && !email.includes("@") ? "Ingresa un correo electrónico válido." : undefined;
  const passwordError = passwordTouched && password.length === 0 ? "Este campo es obligatorio." : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(role); }, 900);
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <AuthTitle>Iniciar sesión</AuthTitle>
        <div style={{ marginBottom: 40 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <AuthInput
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={() => setEmailTouched(true)}
            error={emailError}
            autoComplete="email"
          />
          <AuthInput
            label="Contraseña"
            value={password}
            onChange={setPassword}
            onBlur={() => setPasswordTouched(true)}
            error={passwordError}
            showToggle
            showPassword={showPassword}
            onToggle={() => setShowPassword(v => !v)}
            autoComplete="current-password"
          />

          {/* Role selector */}
          <div>
            <label style={{
              display: "block", fontSize: 11, textTransform: "uppercase",
              letterSpacing: "0.10em", marginBottom: 8,
              fontFamily: "Space Grotesk, sans-serif", color: "#6B7A8D", fontWeight: 500,
            }}>Perfil de acceso</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {([
                { value: "administrador" as UserRole, label: "Administrador", sub: "Regulaciones + Administración" },
                { value: "usuario-bid" as UserRole, label: "Usuario BID", sub: "Solo Regulaciones" },
                { value: "asesor" as UserRole, label: "Asesor (ESZ)", sub: "Etapa 1 · Revisión" },
                { value: "analista" as UserRole, label: "Analista jurídico-económico", sub: "Etapa 3 · Revisión" },
                { value: "validador" as UserRole, label: "Validador BID", sub: "Etapas 2 y 4 · Revisión" },
              ]).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  style={{
                    flex: "1 1 150px",
                    padding: "10px 12px",
                    borderRadius: 10,
                    textAlign: "left",
                    backgroundColor: role === opt.value ? C.steel4 : "#ffffff",
                    border: `1.5px solid ${role === opt.value ? C.steel4 : "#DCE3EB"}`,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 600, fontFamily: "Space Grotesk, sans-serif", color: role === opt.value ? "white" : "#14161A", margin: 0 }}>{opt.label}</p>
                  <p style={{ fontSize: 10, marginTop: 2, fontFamily: "IBM Plex Sans, sans-serif", color: role === opt.value ? "rgba(255,255,255,0.65)" : "#6B7A8D", margin: "2px 0 0 0" }}>{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <AuthPrimaryBtn disabled={loading}>{loading ? "Verificando..." : "Iniciar sesión"}</AuthPrimaryBtn>
        </div>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <AuthLink onClick={() => onNavigate("recover")}>¿Olvidaste tu contraseña?</AuthLink>
        </div>
      </form>
    </AuthLayout>
  );
}

// ─── Recuperar contraseña ─────────────────────────────────────────────────────
function RecoverScreen({ email, setEmail, onNavigate }: {
  email: string; setEmail: (v: string) => void; onNavigate: (v: AuthView) => void;
}) {
  const [touched, setTouched] = useState(false);
  const emailError = touched && !email.includes("@") ? "Ingresa un correo electrónico válido." : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!email.includes("@")) return;
    onNavigate("recover-sent");
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <AuthTitle>Recuperar contraseña</AuthTitle>
        <div style={{ marginBottom: 12 }} />
        <AuthSupport>Ingresa el correo asociado a tu cuenta. Te enviaremos un enlace para restablecer tu contraseña.</AuthSupport>
        <div style={{ marginBottom: 32 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <AuthInput
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={() => setTouched(true)}
            error={emailError}
            autoComplete="email"
          />
        </div>

        <div style={{ marginTop: 28 }}>
          <AuthPrimaryBtn>Enviar enlace</AuthPrimaryBtn>
        </div>
        <div style={{ marginTop: 16 }}>
          <AuthLink onClick={() => onNavigate("login")}>← Volver a iniciar sesión</AuthLink>
        </div>
      </form>
    </AuthLayout>
  );
}

// ─── Enlace enviado ───────────────────────────────────────────────────────────
function RecoverSentScreen({ email, onNavigate }: { email: string; onNavigate: (v: AuthView) => void }) {
  const [countdown, setCountdown] = useState(60);
  const canResend = countdown === 0;

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <AuthLayout
      demoLink={
        <button
          type="button"
          onClick={() => onNavigate("recover-new")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#C5CDD6", fontSize: 10, fontFamily: "IBM Plex Sans, sans-serif" }}
        >
          Demo: ir a Nueva contraseña →
        </button>
      }
    >
      <AuthTitle>Revisa tu correo</AuthTitle>
      <div style={{ marginBottom: 12 }} />
      <AuthSupport>
        Si existe una cuenta asociada a <strong style={{ color: "#14161A", fontWeight: 600 }}>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
      </AuthSupport>
      <p style={{
        fontSize: 12, color: "#8A94A0",
        fontFamily: "IBM Plex Sans, sans-serif",
        marginTop: 10,
      }}>El enlace expira en 30 minutos.</p>
      <div style={{ marginBottom: 32 }} />

      <AuthSecondaryBtn
        disabled={!canResend}
        onClick={() => { if (canResend) setCountdown(60); }}
      >
        {canResend ? "Reenviar enlace" : `Reenviar enlace (${countdown}s)`}
      </AuthSecondaryBtn>

      <div style={{ marginTop: 16 }}>
        <AuthLink onClick={() => onNavigate("login")}>← Volver a iniciar sesión</AuthLink>
      </div>
    </AuthLayout>
  );
}

// ─── Nueva contraseña ─────────────────────────────────────────────────────────
function NewPasswordScreen({ email, onNavigate }: { email: string; onNavigate: (v: AuthView) => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const reqs = {
    length: password.length >= 12,
    casing: /[A-Z]/.test(password) && /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const allMet = Object.values(reqs).every(Boolean);
  const confirmError = confirmTouched && confirm.length > 0 && password !== confirm
    ? "Las contraseñas no coinciden." : undefined;
  const canSubmit = allMet && password === confirm && password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onNavigate("recover-confirmed");
  };

  return (
    <AuthLayout
      demoLink={
        <button
          type="button"
          onClick={() => onNavigate("recover-expired")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#C5CDD6", fontSize: 10, fontFamily: "IBM Plex Sans, sans-serif" }}
        >
          Demo: ir a Enlace expirado →
        </button>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthTitle>Definir nueva contraseña</AuthTitle>
        <div style={{ marginBottom: 12 }} />
        <AuthSupport>Elige una contraseña nueva para <strong style={{ color: "#14161A", fontWeight: 600 }}>{email}</strong></AuthSupport>
        <div style={{ marginBottom: 32 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <AuthInput
              label="Nueva contraseña"
              value={password}
              onChange={setPassword}
              showToggle
              showPassword={showPass}
              onToggle={() => setShowPass(v => !v)}
              autoComplete="new-password"
            />
            <PassReqs password={password} />
          </div>
          <AuthInput
            label="Confirmar contraseña"
            value={confirm}
            onChange={setConfirm}
            onBlur={() => setConfirmTouched(true)}
            error={confirmError}
            showToggle
            showPassword={showConfirm}
            onToggle={() => setShowConfirm(v => !v)}
            autoComplete="new-password"
          />
        </div>

        <div style={{ marginTop: 28 }}>
          <AuthPrimaryBtn disabled={!canSubmit}>Actualizar contraseña</AuthPrimaryBtn>
        </div>
      </form>
    </AuthLayout>
  );
}

// ─── Contraseña actualizada ───────────────────────────────────────────────────
function PasswordConfirmedScreen({ onNavigate }: { onNavigate: (v: AuthView) => void }) {
  return (
    <AuthLayout>
      <div>
        <CircleCheck size={40} color="#5E8FC2" style={{ marginBottom: 20, display: "block" }} />
        <AuthTitle>Contraseña actualizada</AuthTitle>
        <div style={{ marginBottom: 12 }} />
        <AuthSupport>Ya puedes iniciar sesión con tu nueva contraseña.</AuthSupport>
        <div style={{ marginBottom: 40 }} />
        <AuthPrimaryBtn type="button" onClick={() => onNavigate("login")}>Ir a iniciar sesión</AuthPrimaryBtn>
      </div>
    </AuthLayout>
  );
}

// ─── Enlace expirado ──────────────────────────────────────────────────────────
function LinkExpiredScreen({ onNavigate }: { onNavigate: (v: AuthView) => void }) {
  return (
    <AuthLayout>
      <div>
        <div style={{ marginBottom: 20 }}>
          <ClockXSvg />
        </div>
        <AuthTitle>El enlace expiró</AuthTitle>
        <div style={{ marginBottom: 12 }} />
        <AuthSupport>Este enlace de recuperación ya no es válido. Solicita uno nuevo para continuar.</AuthSupport>
        <div style={{ marginBottom: 40 }} />
        <AuthPrimaryBtn type="button" onClick={() => onNavigate("recover")}>Solicitar nuevo enlace</AuthPrimaryBtn>
        <div style={{ marginTop: 16 }}>
          <AuthLink onClick={() => onNavigate("login")}>← Volver a iniciar sesión</AuthLink>
        </div>
      </div>
    </AuthLayout>
  );
}

// ─── Admin ────────────────────────────────────────────────────────────────────
const SAMPLE_USERS = [
  { nombre: "Ana Mejía", correo: "ana.mejia@iadb.org", rol: "Administrador", activo: true, acceso: "Hoy, 09:14" },
  { nombre: "Carlos Vega", correo: "c.vega@iadb.org", rol: "Analista BID", activo: true, acceso: "Hoy, 08:02" },
  { nombre: "Lucía Flores", correo: "l.flores@mef.gob.bo", rol: "Usuario Gobierno", activo: true, acceso: "Ayer, 16:45" },
  { nombre: "Diego Paredes", correo: "d.paredes@iadb.org", rol: "Analista BID", activo: false, acceso: "15 jun 2025" },
  { nombre: "Sofía Ríos", correo: "s.rios@mec.gob.ar", rol: "Usuario Gobierno", activo: true, acceso: "Hoy, 07:30" },
  { nombre: "Marco Salinas", correo: "m.salinas@iadb.org", rol: "Solo lectura", activo: true, acceso: "Ayer, 11:20" },
  // Usuario Gobierno de los 3 países que faltaban (antes solo Bolivia/Argentina) -- dato de muestra.
  { nombre: "Javiera Contreras", correo: "j.contreras@minec.gob.cl", rol: "Usuario Gobierno", activo: true, acceso: "Hoy, 10:05" },
  { nombre: "Andrés Villacís", correo: "a.villacis@produccion.gob.ec", rol: "Usuario Gobierno", activo: true, acceso: "Ayer, 09:40" },
  { nombre: "Rosa Quispe", correo: "r.quispe@mef.gob.pe", rol: "Usuario Gobierno", activo: true, acceso: "Hoy, 08:55" },
];

const CATALOGOS = {
  paises: ["Argentina", "Bolivia", "Chile", "Ecuador", "Perú"],
  sectores: ["Agropecuario", "Agroindustria", "Manufactura", "Servicios Financieros", "Construcción", "Textil y Confección", "Energías Renovables", "Servicios Digitales"],
  tiposBarrera: ["Entrada", "Operación"],
  tiposTramite: ["Apertura", "Operación", "Inspección", "Cierre", "Certificación"],
  // Entidades emisoras -- dato de muestra, tomado de nombres ya usados en
  // ALL_BARRERAS/ALL_TRAMITES/FUENTES_TRAZABILIDAD_MUESTRA de los 5 países
  // (deduplicado). Lista inicial, no exhaustiva. `pais` es el país real que
  // cada entidad ya tenía en esas fuentes (verificado registro por
  // registro, no asignado a ciegas).
  entidades: [
    { nombre: "AFIP", pais: "Argentina" },
    { nombre: "Banco Central de la República Argentina", pais: "Argentina" },
    { nombre: "Congreso de la Nación", pais: "Argentina" },
    { nombre: "INPI", pais: "Argentina" },
    { nombre: "Municipalidad de Buenos Aires", pais: "Argentina" },
    { nombre: "ARSA — Agencia de Regulación Sanitaria", pais: "Bolivia" },
    { nombre: "SENAVEX", pais: "Bolivia" },
    { nombre: "SENAPI", pais: "Bolivia" },
    { nombre: "Aduana Nacional de Bolivia", pais: "Bolivia" },
    { nombre: "FUNDEMPRESA", pais: "Bolivia" },
    { nombre: "Asamblea Legislativa Plurinacional", pais: "Bolivia" },
    { nombre: "Min. de Economía y Finanzas Públicas", pais: "Bolivia" },
    { nombre: "Servicio de Impuestos Internos (SII)", pais: "Chile" },
    { nombre: "Superintendencia del Medio Ambiente", pais: "Chile" },
    { nombre: "Dirección Nacional de Aduanas", pais: "Chile" },
    { nombre: "Congreso Nacional", pais: "Chile" },
    { nombre: "SENAE", pais: "Ecuador" },
    { nombre: "Agrocalidad", pais: "Ecuador" },
    { nombre: "ARCSA", pais: "Ecuador" },
    { nombre: "Servicio de Rentas Internas (SRI)", pais: "Ecuador" },
    { nombre: "Asamblea Nacional", pais: "Ecuador" },
    { nombre: "SUNAT", pais: "Perú" },
    { nombre: "Municipalidad de Lima", pais: "Perú" },
    { nombre: "Ministerio de Economía y Finanzas", pais: "Perú" },
    { nombre: "Congreso de la República", pais: "Perú" },
  ] as { nombre: string; pais: Country }[],
  // Escala de severidad de hallazgos (barreras) -- ver punto 6: todavía no es
  // la fuente única, SEVERIDADES/SevBadge/etc. en el resto de la plataforma
  // siguen con su propia lista hardcodeada en paralelo.
  // TODO: conectar este catálogo como fuente única de las opciones que hoy
  // están hardcodeadas en cada pantalla (badges de severidad, selects, etc.).
  severidad: ["Crítico", "Alto", "Mediano", "Bajo"],
  canales: ["Costo administrativo", "Capital/liquidez", "Tiempo/incertidumbre", "Capacidad técnica", "Modelo de negocio", "Incumbentes/competencia"],
  // Unión sin duplicar de las categorías de barreras (Eliminar/Simplificar/
  // Sustituir/Clarificar/Proporcionalizar) y trámites (Simplificar/
  // Digitalizar/Interoperar/Clarificar/Proporcionalizar).
  // TODO: confirmar con Franco/Juanjo si barreras y trámites deben seguir
  // usando cada uno su propio subconjunto fijo, o si ahora cualquiera de las
  // 7 categorías aplica a ambos tipos de hallazgo.
  accionesMejora: ["Eliminar", "Simplificar", "Sustituir", "Clarificar", "Proporcionalizar", "Digitalizar", "Interoperar"],
  estadosHitl: ["Publicado", "Por decidir", "Etapa 3"],
};

const CATALOGO_ROLES_DATA = [
  { nombre: "Administrador", descripcion: "Acceso total al sistema y gestión de usuarios", activo: true },
  { nombre: "Analista BID", descripcion: "Análisis regulatorio y exportación de informes", activo: true },
  { nombre: "Usuario Gobierno", descripcion: "Acceso de lectura al país asignado", activo: true },
  { nombre: "Solo lectura", descripcion: "Visualización sin capacidad de exportación", activo: true },
];

const PERMISOS_ROLES = CATALOGO_ROLES_DATA.map(r => r.nombre);
const PERMISOS_ACCIONES = [
  "Ver dashboards",
  "Exportar informes",
  "Editar catálogos",
  "Gestionar usuarios",
  "Ver barreras",
  "Ver trámites",
  "Ver comparativa",
  "Acceder a repositorio",
];
const PERMISOS_MATRIX: Record<string, Record<string, boolean>> = {
  "Administrador":    { "Ver dashboards": true,  "Exportar informes": true,  "Editar catálogos": true,  "Gestionar usuarios": true,  "Ver barreras": true,  "Ver trámites": true,  "Ver comparativa": true,  "Acceder a repositorio": true  },
  "Analista BID":     { "Ver dashboards": true,  "Exportar informes": true,  "Editar catálogos": false, "Gestionar usuarios": false, "Ver barreras": true,  "Ver trámites": true,  "Ver comparativa": true,  "Acceder a repositorio": true  },
  "Usuario Gobierno": { "Ver dashboards": true,  "Exportar informes": false, "Editar catálogos": false, "Gestionar usuarios": false, "Ver barreras": true,  "Ver trámites": true,  "Ver comparativa": false, "Acceder a repositorio": false },
  "Solo lectura":     { "Ver dashboards": true,  "Exportar informes": false, "Editar catálogos": false, "Gestionar usuarios": false, "Ver barreras": true,  "Ver trámites": false, "Ver comparativa": false, "Acceder a repositorio": false },
};

function AdminUsuariosScreen() {
  const [users, setUsers] = useState(SAMPLE_USERS);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof SAMPLE_USERS[0] | null>(null);
  const [newUser, setNewUser] = useState({ nombre: "", correo: "", rol: "Analista BID" });

  const openCreate = () => { setEditingUser(null); setNewUser({ nombre: "", correo: "", rol: "Analista BID" }); setShowModal(true); };
  const openEdit = (u: typeof SAMPLE_USERS[0]) => { setEditingUser(u); setNewUser({ nombre: u.nombre, correo: u.correo, rol: u.rol }); setShowModal(true); };
  const saveUser = () => {
    if (editingUser) setUsers(users.map(u => u.correo === editingUser.correo ? { ...u, ...newUser } : u));
    else setUsers([...users, { ...newUser, activo: true, acceso: "Ahora" }]);
    setShowModal(false);
  };
  const toggleActive = (correo: string) => setUsers(users.map(u => u.correo === correo ? { ...u, activo: !u.activo } : u));

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb="Administración — Usuarios" title="Usuarios" subtitle="Gestión del sistema · Rol: Administrador" />
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{users.length} usuarios registrados</p>
        <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-[13px] font-medium min-h-[44px]"
          style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
          onClick={openCreate}>+ Crear usuario</button>
      </div>
      <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <table className="w-full min-w-[640px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Nombre", "Correo", "Rol", "Estado", "Último acceso", "Acciones"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td className="px-5 py-3 text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{u.nombre}</td>
                <td className="px-5 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{u.correo}</td>
                <td className="px-5 py-3"><span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: C.steel3 + "22", color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif" }}>{u.rol}</span></td>
                <td className="px-5 py-3"><span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: u.activo ? "#E6F4EA" : "#F5E6E6", color: u.activo ? "#2D7A3A" : C.critico, fontFamily: "IBM Plex Sans, sans-serif" }}>{u.activo ? "Activo" : "Inactivo"}</span></td>
                <td className="px-5 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{u.acceso}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <button className="text-[12px]" style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }} onClick={() => openEdit(u)}>Editar</button>
                    <button className="text-[12px]" style={{ color: u.activo ? C.critico : "#2D7A3A", fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }} onClick={() => toggleActive(u.correo)}>
                      {u.activo ? "Deshabilitar" : "Habilitar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(20,22,26,0.5)" }}>
          <div className="rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: C.card }}>
            <h3 className="text-[18px] font-semibold mb-6" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{editingUser ? "Editar usuario" : "Crear usuario"}</h3>
            <div className="flex flex-col gap-4">
              {(["nombre", "correo"] as const).map(field => (
                <div key={field}>
                  <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{field === "nombre" ? "Nombre completo" : "Correo electrónico"}</label>
                  <input value={newUser[field]} onChange={e => setNewUser({ ...newUser, [field]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg text-[13px] outline-none"
                    style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}` }} />
                </div>
              ))}
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Rol</label>
                <select value={newUser.rol} onChange={e => setNewUser({ ...newUser, rol: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg text-[13px] outline-none"
                  style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}` }}>
                  {PERMISOS_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 py-2.5 rounded-lg text-[13px] font-medium" style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }} onClick={saveUser}>Guardar</button>
              <button className="flex-1 py-2.5 rounded-lg text-[13px] font-medium" style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "Space Grotesk, sans-serif", border: "none" }} onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminCatalogosScreen() {
  type CatView = "list" | "items" | "roles" | "role-perms";

  const CATALOG_LIST = [
    { key: "paises",      label: "País",              desc: "Países activos en el sistema" },
    { key: "sectores",    label: "Sector económico",  desc: "Sectores económicos analizados" },
    { key: "tiposBarrera",label: "Tipo de barrera",   desc: "Clasificación de barreras regulatorias" },
    { key: "tiposTramite",label: "Tipo de trámite",   desc: "Clasificación de trámites" },
    { key: "roles",       label: "Roles",             desc: "Roles de usuario y sus permisos" },
    { key: "entidades",   label: "Entidad",           desc: "Entidades emisoras activas en el sistema" },
    { key: "severidad",   label: "Severidad",         desc: "Escala de severidad de hallazgos" },
    { key: "canales",     label: "Canal de transmisión económica", desc: "Canales usados en barreras y trámites" },
    { key: "accionesMejora", label: "Acción de mejora", desc: "Categorías de acción de mejora regulatoria" },
    { key: "estadosHitl", label: "Estado HITL",       desc: "Estados del pipeline de validación" },
  ] as const;

  // "entidades" quedó afuera de GenericCatKey: es el único catálogo con
  // forma { nombre, pais } en vez de string plano, así que addItem() (que
  // asume string[]) no aplica ahí -- ver addEntidad/saveEntidadEdit más abajo.
  type GenericCatKey = Exclude<keyof typeof CATALOGOS, "entidades">;

  const [view, setView] = useState<CatView>("list");
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [catData, setCatData] = useState<typeof CATALOGOS>(CATALOGOS);
  const [itemActive, setItemActive] = useState<Record<string, Set<string>>>({});
  const [roles, setRoles] = useState(CATALOGO_ROLES_DATA);
  const [perms, setPerms] = useState(PERMISOS_MATRIX);
  const [addingItem, setAddingItem] = useState("");
  const [addingItemPais, setAddingItemPais] = useState<Country>("Argentina");
  const [showAddItem, setShowAddItem] = useState(false);
  const [addingRole, setAddingRole] = useState(false);
  const [newRole, setNewRole] = useState({ nombre: "", descripcion: "" });
  const [editingRole, setEditingRole] = useState<{ index: number; nombre: string; descripcion: string } | null>(null);
  // `pais` solo se usa para editar una entidad -- undefined para el resto de
  // catálogos. `periodoDesde`/`periodoHasta` solo se usan para editar un
  // país (caso especial igual que "entidades" con su campo país) --
  // undefined para el resto.
  const [editingItem, setEditingItem] = useState<{ index: number; value: string; pais?: Country; periodoDesde?: string; periodoHasta?: string } | null>(null);
  // Filtro de país para la tabla de Entidades -- default el primer país.
  const [filtroPaisEntidades, setFiltroPaisEntidades] = useState<Country>("Argentina");

  // Periodo de análisis -- por país, compartido vía Context
  // (usePeriodoAnalisis) con el resto de la plataforma. Ya NO tiene panel
  // propio acá: el catálogo "País" lo edita como caso especial (mismo
  // criterio que "Entidades" con su campo país), ver más abajo en la vista
  // "items" -- editingItem.periodoDesde/periodoHasta.
  // Ya conectado a: BandaCobertura de Panel País/Regional, Barreras
  // (Regional y País), Trámites (Regional y País), Impacto Económico e
  // Índice/IDR.
  // TODO: ReportesScreen (CORPUS_MIN/CORPUS_MAX/CORPUS_LABEL, usados para
  // acotar el filtro "Rango personalizado") y el fallback de periodo en
  // ReportePDFScreen quedaron deliberadamente fuera de este alcance -- no
  // estaban en la lista de pantallas de esta tarea, y conectarlos requiere
  // decidir qué país aplica cuando el reporte es "Todos los países".
  const { periodosAnalisis, setPeriodoAnalisisPais } = usePeriodoAnalisis();

  const isActive = (cat: string, item: string) => !(itemActive[cat]?.has(item));
  const toggleActive = (cat: string, item: string) => {
    setItemActive(prev => {
      const next = { ...prev };
      const s = new Set(next[cat] ?? []);
      if (s.has(item)) s.delete(item); else s.add(item);
      next[cat] = s;
      return next;
    });
  };
  const addItem = (catKey: GenericCatKey) => {
    if (!addingItem.trim()) return;
    setCatData(d => ({ ...d, [catKey]: [...d[catKey], addingItem.trim()] }));
    setAddingItem("");
  };

  // ── Entidades: mismo espíritu que isActive/toggleActive/addItem/editar de
  // arriba, pero por registro { nombre, pais } en vez de por string plano
  // (dos entidades de países distintos podrían compartir nombre algún día,
  // por eso la clave de activo/inactivo es "pais::nombre", no solo nombre).
  const entidadKey = (e: { nombre: string; pais: Country }) => `${e.pais}::${e.nombre}`;
  const isEntidadActive = (e: { nombre: string; pais: Country }) => !(itemActive["entidades"]?.has(entidadKey(e)));
  const toggleEntidadActive = (e: { nombre: string; pais: Country }) => {
    const key = entidadKey(e);
    setItemActive(prev => {
      const next = { ...prev };
      const s = new Set(next["entidades"] ?? []);
      if (s.has(key)) s.delete(key); else s.add(key);
      next["entidades"] = s;
      return next;
    });
  };
  const addEntidad = (nombre: string, pais: Country) => {
    if (!nombre.trim()) return;
    setCatData(d => ({ ...d, entidades: [...d.entidades, { nombre: nombre.trim(), pais }] }));
    setAddingItem("");
  };
  const saveEntidadEdit = (index: number, nombre: string, pais: Country) => {
    if (!nombre.trim()) return;
    setCatData(d => {
      const arr = [...d.entidades];
      arr[index] = { nombre: nombre.trim(), pais };
      return { ...d, entidades: arr };
    });
  };
  const togglePerm = (rol: string, accion: string) =>
    setPerms(p => {
      const current = p[rol] ?? {};
      return { ...p, [rol]: { ...current, [accion]: !(current[accion] ?? false) } };
    });

  const catLabel = CATALOG_LIST.find(c => c.key === selectedCat)?.label ?? "";
  const selectedCatKey = selectedCat as keyof typeof CATALOGOS;
  const isEntidadesCat = selectedCat === "entidades";
  const isPaisesCat = selectedCat === "paises";

  // ── List view ──────────────────────────────────────────────────────────────
  if (view === "list") return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb="Administración — Catálogos" title="Catálogos" subtitle="Gestión del sistema · Rol: Administrador" />

      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        {CATALOG_LIST.map((cat, i) => (
          <div key={cat.key} className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: i < CATALOG_LIST.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div>
              <p className="text-[14px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{cat.label}</p>
              <p className="text-[12px] mt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{cat.desc}</p>
            </div>
            <button className="px-4 py-2 rounded-lg text-[13px] font-medium"
              style={{ backgroundColor: C.canvas, color: C.steel4, fontFamily: "Space Grotesk, sans-serif", border: `1px solid ${C.border}` }}
              onClick={() => { setSelectedCat(cat.key); setView(cat.key === "roles" ? "roles" : "items"); }}>
              Ver
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Generic items view (con rama especial para "entidades") ────────────────
  if (view === "items") {
    const entidadesFiltradas = catData.entidades.filter(e => e.pais === filtroPaisEntidades);
    const itemsGenericos = isEntidadesCat ? [] : (catData[selectedCatKey as GenericCatKey] ?? []);
    const totalRegistros = isEntidadesCat ? entidadesFiltradas.length : itemsGenericos.length;
    const paisSelStyle: React.CSSProperties = { fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none" };

    return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb={`Administración — Catálogos — ${catLabel}`} title={catLabel} subtitle="Gestión del sistema · Rol: Administrador" />
      <div className="flex items-center gap-3 mb-4">
        <button className="text-[13px]" style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
          onClick={() => setView("list")}>← Volver a Catálogos</button>
      </div>
      {isEntidadesCat && (
        <div className="mb-4">
          <label className="block text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>País</label>
          <select value={filtroPaisEntidades} onChange={e => setFiltroPaisEntidades(e.target.value as Country)} style={paisSelStyle}>
            {CATALOGOS.paises.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-4 md:px-5 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderColor: C.border }}>
          <p className="text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{totalRegistros} registros</p>
          <button className="px-3 md:px-4 py-2 rounded-lg text-[12px] font-medium min-h-[40px]"
            style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
            onClick={() => { setAddingItem(""); setAddingItemPais(filtroPaisEntidades); setShowAddItem(true); }}>
            + Agregar registro
          </button>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[400px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Nombre", ...(isEntidadesCat ? ["País"] : []), "Estado", "Acciones"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isEntidadesCat
              ? entidadesFiltradas.map((e) => {
                  const realIndex = catData.entidades.indexOf(e);
                  const active = isEntidadActive(e);
                  return (
                    <tr key={realIndex} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: active ? C.text : C.textMuted, textDecoration: active ? "none" : "line-through" }}>{e.nombre}</td>
                      <td className="px-5 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{e.pais}</td>
                      <td className="px-5 py-3">
                        <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                          style={{ backgroundColor: active ? "#E6F4EA" : "#F5E6E6", color: active ? "#2D7A3A" : C.critico, fontFamily: "IBM Plex Sans, sans-serif" }}>
                          {active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <button className="text-[12px]" style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
                            onClick={() => setEditingItem({ index: realIndex, value: e.nombre, pais: e.pais })}>Editar</button>
                          <button className="text-[12px]" style={{ color: active ? C.critico : "#2D7A3A", fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
                            onClick={() => toggleEntidadActive(e)}>
                            {active ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              : itemsGenericos.map((item, i) => {
                  const active = isActive(selectedCat, item);
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: active ? C.text : C.textMuted, textDecoration: active ? "none" : "line-through" }}>{item}</td>
                      <td className="px-5 py-3">
                        <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                          style={{ backgroundColor: active ? "#E6F4EA" : "#F5E6E6", color: active ? "#2D7A3A" : C.critico, fontFamily: "IBM Plex Sans, sans-serif" }}>
                          {active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <button className="text-[12px]" style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
                            onClick={() => setEditingItem(isPaisesCat
                              ? { index: i, value: item, periodoDesde: periodosAnalisis[item as Exclude<Country, "Todos">]?.desde ?? "", periodoHasta: periodosAnalisis[item as Exclude<Country, "Todos">]?.hasta ?? "" }
                              : { index: i, value: item })}>Editar</button>
                          <button className="text-[12px]" style={{ color: active ? C.critico : "#2D7A3A", fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
                            onClick={() => toggleActive(selectedCat, item)}>
                            {active ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table></div>
      </div>
      {showAddItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(20,22,26,0.5)" }}>
          <div className="rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: C.card }}>
            <h3 className="text-[18px] font-semibold mb-6" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>Agregar {catLabel}</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Nombre</label>
                <input value={addingItem} onChange={e => setAddingItem(e.target.value)}
                  onKeyDown={e => {
                    if (e.key !== "Enter" || !addingItem.trim()) return;
                    if (isEntidadesCat) addEntidad(addingItem, addingItemPais);
                    else addItem(selectedCatKey as GenericCatKey);
                    setShowAddItem(false);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg text-[13px] outline-none"
                  style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}` }} />
              </div>
              {isEntidadesCat && (
                <div>
                  <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>País</label>
                  <select value={addingItemPais} onChange={e => setAddingItemPais(e.target.value as Country)} className="w-full" style={paisSelStyle}>
                    {CATALOGOS.paises.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-8 justify-end">
              <button className="px-5 py-2 rounded-lg text-[13px]"
                style={{ backgroundColor: C.canvas, color: C.textMuted, fontFamily: "Space Grotesk, sans-serif", border: `1px solid ${C.border}` }}
                onClick={() => setShowAddItem(false)}>Cancelar</button>
              <button className="px-5 py-2 rounded-lg text-[13px] font-medium"
                style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
                onClick={() => {
                  if (!addingItem.trim()) return;
                  if (isEntidadesCat) addEntidad(addingItem, addingItemPais);
                  else addItem(selectedCatKey as GenericCatKey);
                  setShowAddItem(false);
                }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
      {editingItem !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(20,22,26,0.5)" }}>
          <div className="rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: C.card }}>
            <h3 className="text-[18px] font-semibold mb-6" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>Editar registro</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Nombre</label>
                <input value={editingItem.value} onChange={e => setEditingItem(ei => ei ? { ...ei, value: e.target.value } : ei)}
                  className="w-full px-4 py-2.5 rounded-lg text-[13px] outline-none"
                  style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}` }} />
              </div>
              {editingItem.pais !== undefined && (
                <div>
                  <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>País</label>
                  <select value={editingItem.pais} onChange={e => setEditingItem(ei => ei ? { ...ei, pais: e.target.value as Country } : ei)} className="w-full" style={paisSelStyle}>
                    {CATALOGOS.paises.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}
              {editingItem.periodoDesde !== undefined && (
                <>
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Periodo de análisis — Desde</label>
                    <input type="month" value={editingItem.periodoDesde} onChange={e => setEditingItem(ei => ei ? { ...ei, periodoDesde: e.target.value } : ei)}
                      className="w-full px-4 py-2.5 rounded-lg text-[13px] outline-none"
                      style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}` }} />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Periodo de análisis — Hasta</label>
                    <input type="month" value={editingItem.periodoHasta} onChange={e => setEditingItem(ei => ei ? { ...ei, periodoHasta: e.target.value } : ei)}
                      className="w-full px-4 py-2.5 rounded-lg text-[13px] outline-none"
                      style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}` }} />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-8 justify-end">
              <button className="px-5 py-2 rounded-lg text-[13px]"
                style={{ backgroundColor: C.canvas, color: C.textMuted, fontFamily: "Space Grotesk, sans-serif", border: `1px solid ${C.border}` }}
                onClick={() => setEditingItem(null)}>Cancelar</button>
              <button className="px-5 py-2 rounded-lg text-[13px] font-medium"
                style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
                onClick={() => {
                  if (!editingItem.value.trim()) return;
                  if (editingItem.pais !== undefined) {
                    saveEntidadEdit(editingItem.index, editingItem.value, editingItem.pais);
                  } else {
                    // País editado como el string original ANTES de un posible
                    // renombre -- periodosAnalisis está indexado por el país
                    // real (catData.paises[index]), no por lo que se haya
                    // tipeado en "Nombre".
                    if (editingItem.periodoDesde !== undefined && editingItem.periodoHasta !== undefined) {
                      const paisOriginal = catData.paises[editingItem.index] as Exclude<Country, "Todos">;
                      setPeriodoAnalisisPais(paisOriginal, { desde: editingItem.periodoDesde, hasta: editingItem.periodoHasta });
                    }
                    setCatData(d => {
                      const arr = [...(d[selectedCatKey as GenericCatKey] ?? [])];
                      arr[editingItem.index] = editingItem.value.trim();
                      return { ...d, [selectedCatKey]: arr };
                    });
                  }
                  setEditingItem(null);
                }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  }

  // ── Roles list view ────────────────────────────────────────────────────────
  if (view === "roles") return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb="Administración — Catálogos — Roles" title="Roles" subtitle="Gestión del sistema · Rol: Administrador" />
      <div className="flex items-center justify-between mb-4">
        <button className="text-[13px]" style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
          onClick={() => setView("list")}>← Volver a Catálogos</button>
        <button className="px-4 py-2 rounded-lg text-[13px] font-medium"
          style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
          onClick={() => setAddingRole(true)}>+ Agregar rol</button>
      </div>
      <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <table className="w-full min-w-[560px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Rol", "Descripción", "Estado", "Acciones"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((rol, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td className="px-5 py-3 text-[13px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{rol.nombre}</td>
                <td className="px-5 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{rol.descripcion}</td>
                <td className="px-5 py-3">
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                    style={{ backgroundColor: rol.activo ? "#E6F4EA" : "#F5E6E6", color: rol.activo ? "#2D7A3A" : C.critico, fontFamily: "IBM Plex Sans, sans-serif" }}>
                    {rol.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <button className="text-[12px]" style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
                      onClick={() => setEditingRole({ index: i, nombre: rol.nombre, descripcion: rol.descripcion })}>Editar</button>
                    <button className="text-[12px]" style={{ color: rol.activo ? C.critico : "#2D7A3A", fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
                      onClick={() => setRoles(rs => rs.map((r, j) => j === i ? { ...r, activo: !r.activo } : r))}>
                      {rol.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button className="text-[12px] font-medium" style={{ color: C.steel4, fontFamily: "Space Grotesk, sans-serif", background: "none", border: "none" }}
                      onClick={() => { setSelectedRole(rol.nombre); setView("role-perms"); }}>
                      Gestionar permisos
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {addingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(20,22,26,0.5)" }}>
          <div className="rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: C.card }}>
            <h3 className="text-[18px] font-semibold mb-6" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>Agregar rol</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Nombre del rol</label>
                <input value={newRole.nombre} onChange={e => setNewRole(r => ({ ...r, nombre: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-[13px] outline-none"
                  style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}` }} />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Descripción</label>
                <input value={newRole.descripcion} onChange={e => setNewRole(r => ({ ...r, descripcion: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-[13px] outline-none"
                  style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}` }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 py-2.5 rounded-lg text-[13px] font-medium"
                style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
                onClick={() => { if (newRole.nombre.trim()) { setRoles(rs => [...rs, { ...newRole, activo: true }]); setNewRole({ nombre: "", descripcion: "" }); } setAddingRole(false); }}>
                Guardar
              </button>
              <button className="flex-1 py-2.5 rounded-lg text-[13px] font-medium"
                style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "Space Grotesk, sans-serif", border: "none" }}
                onClick={() => setAddingRole(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {editingRole !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(20,22,26,0.5)" }}>
          <div className="rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: C.card }}>
            <h3 className="text-[18px] font-semibold mb-6" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>Editar rol</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Nombre del rol</label>
                <input value={editingRole.nombre} onChange={e => setEditingRole(er => er ? { ...er, nombre: e.target.value } : er)}
                  className="w-full px-4 py-2.5 rounded-lg text-[13px] outline-none"
                  style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}` }} />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Descripción</label>
                <input value={editingRole.descripcion} onChange={e => setEditingRole(er => er ? { ...er, descripcion: e.target.value } : er)}
                  className="w-full px-4 py-2.5 rounded-lg text-[13px] outline-none"
                  style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}` }} />
              </div>
            </div>
            <div className="flex gap-3 mt-8 justify-end">
              <button className="px-5 py-2 rounded-lg text-[13px]"
                style={{ backgroundColor: C.canvas, color: C.textMuted, fontFamily: "Space Grotesk, sans-serif", border: `1px solid ${C.border}` }}
                onClick={() => setEditingRole(null)}>Cancelar</button>
              <button className="px-5 py-2 rounded-lg text-[13px] font-medium"
                style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
                onClick={() => {
                  if (!editingRole.nombre.trim()) return;
                  setRoles(rs => rs.map((r, j) => j === editingRole.index ? { ...r, nombre: editingRole.nombre.trim(), descripcion: editingRole.descripcion.trim() } : r));
                  setEditingRole(null);
                }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Role permissions view ──────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb={`Administración — Catálogos — Roles — ${selectedRole}`} title={selectedRole} subtitle="Gestión del sistema · Rol: Administrador" />
      <div className="flex items-center mb-5">
        <button className="text-[13px]" style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
          onClick={() => setView("roles")}>← Volver a Roles</button>
      </div>
      <p className="text-[13px] mb-4" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
        Define qué módulos y acciones puede realizar el rol <strong style={{ color: C.text }}>{selectedRole}</strong>.
      </p>
      <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <table className="w-full min-w-[320px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Módulo / Acción</th>
              <th className="px-5 py-3 text-center text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Habilitado</th>
            </tr>
          </thead>
          <tbody>
            {PERMISOS_ACCIONES.map((accion, i) => {
              const enabled = perms[selectedRole]?.[accion] ?? false;
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{accion}</td>
                  <td className="px-5 py-3 text-center">
                    <button className="w-5 h-5 rounded flex items-center justify-center mx-auto transition-colors"
                      style={{ backgroundColor: enabled ? C.steel3 : "transparent", border: `2px solid ${enabled ? C.steel3 : C.border}` }}
                      onClick={() => togglePerm(selectedRole, accion)}>
                      {enabled && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Fuentes oficiales ──────────────────────────────────────────────────────
// Basado en FUENTES_TRAZABILIDAD_MUESTRA (fuente/estado/errores ya existen
// ahí) + los campos nuevos de este módulo (fuenteScrapeada, frecuencia,
// responsable) -- dato de muestra, sin metodología real todavía.
type FuenteAdminRow = {
  pais: Exclude<Country, "Todos">;
  fuenteObjetivo: string;
  fuenteScrapeada: string;
  frecuenciaActualizacion: "Diaria" | "Semanal" | "Mensual";
  estado: "Completo" | "Parcial" | "Pendiente";
  errores: number | null;
  responsable: string;
  activo: boolean;
};

const ESTADO_FUENTE_META: Record<"Completo" | "Parcial" | "Pendiente", { bg: string; color: string }> = {
  Completo: { bg: "#E7F1DC", color: "#3B6D11" },
  Parcial: { bg: "#F6EBD6", color: "#8A5A12" },
  Pendiente: { bg: "#DCE3EB", color: "#6B7A8D" },
};

const FRECUENCIA_POR_INDICE: ("Diaria" | "Semanal" | "Mensual")[] = ["Diaria", "Semanal", "Semanal", "Mensual"];
const RESPONSABLES_FUENTES_MUESTRA = ["Equipo Scraping LATAM", "Ana Torres", "Equipo Legal BID", "Luis Medina"];

function slugFuenteScrapeada(pais: string, fuente: string): string {
  const slug = fuente.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const cc: Record<string, string> = { Argentina: "ar", Bolivia: "bo", Chile: "cl", Ecuador: "ec", "Perú": "pe" };
  return `scraping.reglac.io/${cc[pais] ?? "xx"}/${slug}`;
}

const SAMPLE_FUENTES_ADMIN: FuenteAdminRow[] = COUNTRIES.flatMap((pais, pi) =>
  FUENTES_TRAZABILIDAD_MUESTRA[pais].map((f, i) => ({
    pais,
    fuenteObjetivo: f.fuente,
    fuenteScrapeada: slugFuenteScrapeada(pais, f.fuente),
    frecuenciaActualizacion: FRECUENCIA_POR_INDICE[i % FRECUENCIA_POR_INDICE.length],
    estado: f.estado,
    errores: f.errores,
    responsable: RESPONSABLES_FUENTES_MUESTRA[(pi * 4 + i) % RESPONSABLES_FUENTES_MUESTRA.length],
    activo: true,
  }))
);

function AdminFuentesScreen() {
  const [fuentes, setFuentes] = useState<FuenteAdminRow[]>(SAMPLE_FUENTES_ADMIN);
  const [filtroPais, setFiltroPais] = useState<string>("Todos");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<{ index: number } | null>(null);
  const [form, setForm] = useState({
    pais: "Bolivia", fuenteObjetivo: "", fuenteScrapeada: "",
    frecuenciaActualizacion: "Semanal" as "Diaria" | "Semanal" | "Mensual",
    estado: "Pendiente" as "Completo" | "Parcial" | "Pendiente",
    errores: "", responsable: "",
  });

  const filtradas = fuentes.filter(f => filtroPais === "Todos" || f.pais === filtroPais);

  const openCreate = () => {
    setEditing(null);
    setForm({ pais: "Bolivia", fuenteObjetivo: "", fuenteScrapeada: "", frecuenciaActualizacion: "Semanal", estado: "Pendiente", errores: "", responsable: "" });
    setShowModal(true);
  };
  const openEdit = (f: FuenteAdminRow) => {
    setEditing({ index: fuentes.indexOf(f) });
    setForm({ pais: f.pais, fuenteObjetivo: f.fuenteObjetivo, fuenteScrapeada: f.fuenteScrapeada, frecuenciaActualizacion: f.frecuenciaActualizacion, estado: f.estado, errores: f.errores === null ? "" : String(f.errores), responsable: f.responsable });
    setShowModal(true);
  };
  const save = () => {
    const errores = form.errores.trim() === "" ? null : Number(form.errores);
    const pais = form.pais as Exclude<Country, "Todos">;
    if (editing) {
      setFuentes(fs => fs.map((f, i) => i === editing.index
        ? { ...f, pais, fuenteObjetivo: form.fuenteObjetivo, fuenteScrapeada: form.fuenteScrapeada, frecuenciaActualizacion: form.frecuenciaActualizacion, estado: form.estado, errores, responsable: form.responsable }
        : f));
    } else {
      setFuentes(fs => [...fs, { pais, fuenteObjetivo: form.fuenteObjetivo, fuenteScrapeada: form.fuenteScrapeada, frecuenciaActualizacion: form.frecuenciaActualizacion, estado: form.estado, errores, responsable: form.responsable, activo: true }]);
    }
    setShowModal(false);
  };
  const toggleActivo = (f: FuenteAdminRow) => setFuentes(fs => fs.map(x => x === f ? { ...x, activo: !x.activo } : x));

  const selStyle: React.CSSProperties = { fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none" };
  const labelStyle: React.CSSProperties = { fontFamily: "Space Grotesk, sans-serif", color: C.textMuted };

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb="Administración — Fuentes" title="Fuentes oficiales" subtitle="Gestión del sistema · Rol: Administrador" />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <select value={filtroPais} onChange={e => setFiltroPais(e.target.value)} className="min-h-[40px]" style={selStyle}>
          <option value="Todos">Todos los países</option>
          {COUNTRIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-[13px] font-medium min-h-[44px]"
          style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
          onClick={openCreate}>+ Agregar fuente</button>
      </div>
      <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <table className="w-full min-w-[760px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["País", "Fuente objetivo", "Frecuencia", "Estado", "Errores", "Responsable", "Acciones"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.map((f, i) => {
              const meta = ESTADO_FUENTE_META[f.estado];
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, opacity: f.activo ? 1 : 0.5 }}>
                  <td className="px-5 py-3 text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{f.pais}</td>
                  <td className="px-5 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{f.fuenteObjetivo}</td>
                  <td className="px-5 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{f.frecuenciaActualizacion}</td>
                  <td className="px-5 py-3"><span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: meta.bg, color: meta.color, fontFamily: "IBM Plex Sans, sans-serif" }}>{f.estado}</span></td>
                  <td className="px-5 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: f.errores ? C.critico : C.textMuted }}>{f.errores ?? "—"}</td>
                  <td className="px-5 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{f.responsable}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <button className="text-[12px]" style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }} onClick={() => openEdit(f)}>Editar</button>
                      <button className="text-[12px]" style={{ color: f.activo ? C.critico : "#2D7A3A", fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }} onClick={() => toggleActivo(f)}>
                        {f.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(20,22,26,0.5)" }}>
          <div className="rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: C.card }}>
            <h3 className="text-[18px] font-semibold mb-6" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{editing ? "Editar fuente" : "Agregar fuente"}</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={labelStyle}>País</label>
                <select value={form.pais} onChange={e => setForm({ ...form, pais: e.target.value })} className="w-full" style={selStyle}>
                  {COUNTRIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={labelStyle}>Fuente objetivo</label>
                <input value={form.fuenteObjetivo} onChange={e => setForm({ ...form, fuenteObjetivo: e.target.value })} className="w-full" style={selStyle} />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={labelStyle}>Fuente scrapeada (URL / identificador)</label>
                <input value={form.fuenteScrapeada} onChange={e => setForm({ ...form, fuenteScrapeada: e.target.value })} className="w-full" style={selStyle} />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={labelStyle}>Frecuencia de actualización</label>
                <select value={form.frecuenciaActualizacion} onChange={e => setForm({ ...form, frecuenciaActualizacion: e.target.value as typeof form.frecuenciaActualizacion })} className="w-full" style={selStyle}>
                  {(["Diaria", "Semanal", "Mensual"] as const).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={labelStyle}>Estado</label>
                <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value as typeof form.estado })} className="w-full" style={selStyle}>
                  {(["Completo", "Parcial", "Pendiente"] as const).map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={labelStyle}>Errores</label>
                <input type="number" min={0} value={form.errores} onChange={e => setForm({ ...form, errores: e.target.value })} placeholder="Sin errores" className="w-full" style={selStyle} />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5" style={labelStyle}>Responsable</label>
                <input value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} className="w-full" style={selStyle} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 py-2.5 rounded-lg text-[13px] font-medium" style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }} onClick={save}>Guardar</button>
              <button className="flex-1 py-2.5 rounded-lg text-[13px] font-medium" style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "Space Grotesk, sans-serif", border: "none" }} onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bitácora ───────────────────────────────────────────────────────────────
// Enteramente dato de muestra -- no hay conexión real todavía.
// TODO: conectar cada tipo de evento a su fuente real (cambios de catálogo
// desde esta misma pantalla de Administración, validaciones desde el store
// de Revisión/HITL, exportaciones desde las acciones de "Descargar" ya
// implementadas en Reportes).
type BitacoraTipo = "Cambio de catálogo" | "Validación" | "Exportación" | "Error" | "Actualización";
const BITACORA_TIPOS: BitacoraTipo[] = ["Cambio de catálogo", "Validación", "Exportación", "Error", "Actualización"];
const BITACORA_COLOR: Record<BitacoraTipo, string> = {
  "Cambio de catálogo": C.steel3,
  "Validación": "#2D7A3A",
  "Exportación": C.steel4,
  "Error": C.critico,
  // C.alto === C.steel4 en theme.ts (mismo hex) -- se usa C.ambar1 para que
  // "Actualización" no comparta color de badge con "Exportación".
  "Actualización": C.ambar1,
};
const BITACORA_DETALLE_POR_TIPO: Record<BitacoraTipo, string[]> = {
  "Cambio de catálogo": [
    `Activó el sector "Servicios Digitales" en el catálogo de Sectores`,
    `Agregó el registro "INAPI" al catálogo de Entidades`,
    `Desactivó el tipo de trámite "Cierre" en el catálogo de Trámites`,
    `Editó la descripción del rol "Usuario Gobierno"`,
  ],
  "Validación": [
    `Validó la barrera BOL-BAR-0842 como Crítico confirmado`,
    `Marcó el hallazgo ARG-BAR-0801 como "Por decidir"`,
    `Aprobó la acción de mejora sugerida para "Restricción a Operadores Sin Planta"`,
    `Devolvió a Analista un hallazgo de Chile para revisión adicional`,
  ],
  "Exportación": [
    `Descargó el reporte operativo en PDF (Bolivia, Distorsión)`,
    `Descargó datos filtrados en Excel (Todos los países, Carga)`,
    `Exportó el reporte estratégico de Ecuador`,
    `Descargó el Excel de trámites filtrados por Estado HITL: Publicado`,
  ],
  "Error": [
    `Error de scraping en fuente "Gaceta Oficial de Chile" — timeout de conexión`,
    `Fallo al sincronizar "SENAPI" — formato de documento no reconocido`,
    `Error al generar el reporte PDF para Perú`,
    `Captura incompleta en "Congreso de la Nación" — documentos pendientes`,
  ],
  "Actualización": [
    `Actualizó la fuente "SENAPI" — frecuencia cambiada a Mensual`,
    `Actualizó el periodo de análisis de Bolivia a enero 2015 – marzo 2026`,
    `Actualizó el responsable de la fuente "INAPI" a Equipo Scraping LATAM`,
    `Actualizó el estado de "Registro Oficial de Ecuador" a Completo`,
  ],
};

const MESES_ABBR_BITACORA = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function formatFechaBitacora(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${dd} ${MESES_ABBR_BITACORA[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

// 20 filas deterministas (sin Math.random, para que no cambien entre
// renders), cubriendo los 5 tipos de evento con usuarios de SAMPLE_USERS y
// fechas de los últimos 30 días.
const SAMPLE_BITACORA: { fecha: string; fechaSort: number; usuario: string; tipo: BitacoraTipo; detalle: string }[] = (() => {
  const HOY = new Date("2026-09-09T12:00:00");
  const rows: { fecha: string; fechaSort: number; usuario: string; tipo: BitacoraTipo; detalle: string }[] = [];
  for (let i = 0; i < 20; i++) {
    const tipo = BITACORA_TIPOS[i % BITACORA_TIPOS.length];
    const detalles = BITACORA_DETALLE_POR_TIPO[tipo];
    const detalle = detalles[Math.floor(i / BITACORA_TIPOS.length) % detalles.length];
    const usuario = SAMPLE_USERS[i % SAMPLE_USERS.length].nombre;
    const diasAtras = Math.min(29, Math.round(i * 1.45));
    const horas = 8 + (i * 3) % 11;
    const minutos = (i * 17) % 60;
    const fecha = new Date(HOY);
    fecha.setDate(fecha.getDate() - diasAtras);
    fecha.setHours(horas, minutos, 0, 0);
    rows.push({ fecha: formatFechaBitacora(fecha), fechaSort: fecha.getTime(), usuario, tipo, detalle });
  }
  return rows.sort((a, b) => b.fechaSort - a.fechaSort);
})();

function AdminBitacoraScreen() {
  const [filtroTipo, setFiltroTipo] = useState<string>("Todos");
  const [filtroUsuario, setFiltroUsuario] = useState<string>("Todos");
  const usuariosUnicos = Array.from(new Set(SAMPLE_BITACORA.map(r => r.usuario)));

  const filtradas = SAMPLE_BITACORA.filter(r =>
    (filtroTipo === "Todos" || r.tipo === filtroTipo) &&
    (filtroUsuario === "Todos" || r.usuario === filtroUsuario)
  );

  const selStyle: React.CSSProperties = { fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none" };

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb="Administración — Bitácora" title="Bitácora" subtitle="Gestión del sistema · Rol: Administrador" />
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="min-h-[40px]" style={selStyle}>
          <option value="Todos">Todos los tipos de evento</option>
          {BITACORA_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)} className="min-h-[40px]" style={selStyle}>
          <option value="Todos">Todos los usuarios</option>
          {usuariosUnicos.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <p className="text-[12px] ml-auto" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{filtradas.length} eventos</p>
      </div>
      <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <table className="w-full min-w-[720px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Fecha/Hora", "Usuario", "Tipo de evento", "Detalle"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td className="px-5 py-3 text-[12px] whitespace-nowrap" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{r.fecha}</td>
                <td className="px-5 py-3 text-[13px] font-medium whitespace-nowrap" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{r.usuario}</td>
                <td className="px-5 py-3">
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap" style={{ backgroundColor: BITACORA_COLOR[r.tipo] + "18", color: BITACORA_COLOR[r.tipo], fontFamily: "IBM Plex Sans, sans-serif" }}>
                    {r.tipo}
                  </span>
                </td>
                <td className="px-5 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{r.detalle}</td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Sin eventos con los filtros seleccionados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPermisosScreen() {
  const [perms, setPerms] = useState(PERMISOS_MATRIX);
  const togglePerm = (rol: string, accion: string) =>
    setPerms(p => {
      const current = p[rol] ?? {};
      return { ...p, [rol]: { ...current, [accion]: !(current[accion] ?? false) } };
    });

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb="Administración — Permisos" title="Permisos" subtitle="Gestión del sistema · Rol: Administrador" />
      <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <table className="w-full min-w-[560px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted, width: 200 }}>Permiso</th>
              {PERMISOS_ROLES.map(rol => (
                <th key={rol} className="px-4 py-3 text-center text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{rol}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISOS_ACCIONES.map((accion, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{accion}</td>
                {PERMISOS_ROLES.map(rol => (
                  <td key={rol} className="px-4 py-3 text-center">
                    <button className="w-5 h-5 rounded flex items-center justify-center mx-auto transition-colors"
                      style={{ backgroundColor: perms[rol]?.[accion] ? C.steel3 : "transparent", border: `2px solid ${perms[rol]?.[accion] ? C.steel3 : C.border}` }}
                      onClick={() => togglePerm(rol, accion)}>
                      {perms[rol]?.[accion] && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Reportes ─────────────────────────────────────────────────────────────────
function ReportesScreen({ prefill, onNavigate }: { prefill?: ReportesPrefill; onNavigate: (v: View) => void }) {
  const COUNTRIES: Country[] = ["Todos", "Argentina", "Bolivia", "Chile", "Ecuador", "Perú"];
  const CORPUS_MIN = "2015-01";
  const CORPUS_MAX = "2026-03";
  const CORPUS_LABEL = "enero 2015 – marzo 2026";

  const TIPOS_ENTIDAD = ["Ministerio", "Superintendencia", "Agencia reguladora", "Gobierno subnacional", "Municipio"] as const;
  const ENTIDADES_BY_TIPO: Record<string, string[]> = {
    "Ministerio": ["Min. de Economía y Finanzas Públicas", "Min. de Trabajo, Empleo y Prev. Social", "Min. de Medio Ambiente y Agua", "Min. de Producción y Desarrollo Productivo", "Min. de Relaciones Exteriores", "Min. de Desarrollo Productivo y Economía Plural"],
    "Superintendencia": ["Autoridad de Supervisión del Sistema Financiero (ASFI)", "Autoridad de Fiscalización y Control de Pensiones y Seguros (APS)", "Autoridad de Regulación y Fiscalización de Telecomunicaciones (ATT)"],
    "Agencia reguladora": ["SENAVEX", "SENASAG", "ARSA — Agencia de Regulación Sanitaria", "Aduana Nacional de Bolivia", "FUNDEMPRESA", "SENAPI", "ANH", "YPFB", "Servicio de Impuestos Nacionales (SIN)"],
    "Gobierno subnacional": ["Gobernación de Santa Cruz", "Gobernación de La Paz", "Gobernación de Cochabamba", "Gobernación de Potosí"],
    "Municipio": ["Alcaldía Municipal de La Paz", "Alcaldía Municipal de Santa Cruz de la Sierra", "Alcaldía Municipal de Cochabamba", "Alcaldía Municipal de El Alto"],
  };

  const PERIODO_OPTS = [
    { value: "todo",          label: "Todo el periodo auditado",  rango: CORPUS_LABEL },
    { value: "1ano",          label: "Último año",                rango: "abril 2025 – marzo 2026" },
    { value: "3anos",         label: "Últimos 3 años",            rango: "abril 2023 – marzo 2026" },
    { value: "5anos",         label: "Últimos 5 años",            rango: "abril 2021 – marzo 2026" },
    { value: "personalizado", label: "Rango personalizado",       rango: "" },
  ] as const;

  // Distorsión catalogs
  const SUBDIMS_BY_EJE: Record<string, string[]> = {
    "Entrada":   ["Comercio", "Competencia", "Inversión"],
    "Operación": ["Competencia", "Inversión", "Innovación"],
  };
  const TIPOS_RESTRICCION = ["Licencia", "Cupo", "Exclusividad", "Autorización previa", "Capital mínimo", "Restricción de canal", "Precio", "Publicidad", "Nacionalidad", "Presencia local", "Discrecionalidad", "Desproporcionalidad"];
  const ACCIONES_AMR = ["Eliminar", "Simplificar", "Digitalizar", "Interoperar", "Clarificar", "Proporcionalizar", "Sustituir", "Armonizar", "Neutralidad competitiva", "Mantener con justificación"];
  const SEVERIDADES = ["Crítico", "Alto", "Mediano", "Bajo"];
  const ESTADOS_HITL = ["Publicado", "Por decidir", "Etapa 3"];
  const COBERTURA_OPTS = [
    { value: 0,  label: "Cualquiera" },
    { value: 70, label: "70% o más" },
    { value: 80, label: "80% o más" },
    { value: 90, label: "90% o más" },
  ];
  const IDR_MIN_OPTS = [
    { value: 0,  label: "Cualquiera" },
    { value: 50, label: "50 o más" },
    { value: 60, label: "60 o más" },
    { value: 70, label: "70 o más" },
  ];

  // ── State (initialised from prefill when navigating from Barreras / Trámites) ──
  const [tipoHallazgo, setTipoHallazgo] = useState<"distorsion" | "carga">(prefill?.tipoHallazgo ?? "distorsion");

  // Siempre visibles
  const [pais, setPais] = useState<Country>(prefill?.pais ?? "Todos");
  const [selectedSectors, setSelectedSectors] = useState<string[]>(prefill?.sectores ?? []);
  const [selectedFuentes, setSelectedFuentes] = useState<string[]>([]);
  const [coberturaMin, setCoberturaMin] = useState<number>(0);
  const [selectedEstadoHitl, setSelectedEstadoHitl] = useState<string[]>([]);
  const [idrMin, setIdrMin] = useState<number>(0);
  const [periodoTipo, setPeriodoTipo] = useState<"todo" | "1ano" | "3anos" | "5anos" | "personalizado">("todo");
  const [periodoDesde, setPeriodoDesde] = useState("2015-01");
  const [periodoHasta, setPeriodoHasta] = useState("2026-03");
  const [tipoEntidad, setTipoEntidad] = useState("");
  const [entidad, setEntidad] = useState(prefill?.entidad ?? "");
  const [formato, setFormato] = useState<"pdf" | "excel">("pdf");

  // Distorsión-specific
  const [eje, setEje] = useState(prefill?.eje ?? "");
  const [subdimDistorsion, setSubdimDistorsion] = useState(prefill?.subdimDistorsion ?? "");
  const [selectedTiposRestriccion, setSelectedTiposRestriccion] = useState<string[]>([]);
  const [selectedSeveridades, setSelectedSeveridades] = useState<string[]>(prefill?.severidades ?? []);
  const [selectedAccionesDistorsion, setSelectedAccionesDistorsion] = useState<string[]>([]);

  // Carga-specific
  const [tipoCarga, setTipoCarga] = useState(prefill?.tipoCarga ?? "");
  const [subdimCarga, setSubdimCarga] = useState(prefill?.subdimCarga ?? "");
  const [tipoTramite, setTipoTramite] = useState(prefill?.tipoTramite ?? "");
  const [selectedAccionesCarga, setSelectedAccionesCarga] = useState<string[]>([]);

  // ── Derived ────────────────────────────────────────────────────────────────────
  const availableSectors = pais === "Todos"
    ? CATALOGOS.sectores
    : (COUNTRY_SECTORS[pais] ?? []).filter(s => s.analizado).map(s => s.sector);

  const entidadOpts = tipoEntidad ? (ENTIDADES_BY_TIPO[tipoEntidad] ?? []) : Object.values(ENTIDADES_BY_TIPO).flat();
  const subdimDistorsionOpts = eje ? (SUBDIMS_BY_EJE[eje] ?? []) : [];
  const subdimCargaOpts = tipoCarga ? (SUBDIMS_BY_TIPO_CARGA[tipoCarga] ?? []) : [];

  // Fuentes disponibles para el país seleccionado (FUENTES_TRAZABILIDAD_MUESTRA).
  // Si "Todos", se unen las fuentes de los 5 países sin duplicar nombres
  // repetidos (p. ej. "Ministerio de Economía" aparece en más de un país).
  const availableFuentes = pais === "Todos"
    ? Array.from(new Set(
        COUNTRIES.filter((c): c is Exclude<Country, "Todos"> => c !== "Todos")
          .flatMap(c => FUENTES_TRAZABILIDAD_MUESTRA[c].map(f => f.fuente))
      ))
    : FUENTES_TRAZABILIDAD_MUESTRA[pais as Exclude<Country, "Todos">].map(f => f.fuente);

  // Advertencia (no exclusión) cuando hay un país específico seleccionado y
  // no alcanza el mínimo de cobertura/IDR — la exclusión por país sólo
  // aplica con pais === "Todos" y vive dentro de filtrarBarreras/filtrarTramites.
  const coberturaPaisOk = pais === "Todos" || COBERTURA_MUESTRA[pais as Exclude<Country, "Todos">] >= coberturaMin;
  const idrPaisOk = pais === "Todos" || IRR_GENERAL_MUESTRA[pais as Exclude<Country, "Todos">] >= idrMin;

  const periodoOpt = PERIODO_OPTS.find(p => p.value === periodoTipo)!;
  const periodoLabel = periodoTipo === "personalizado"
    ? (periodoDesde && periodoHasta ? `${periodoDesde} – ${periodoHasta}` : "Rango personalizado")
    : periodoOpt.rango;
  const customDesdeOk = !periodoDesde || (periodoDesde >= CORPUS_MIN && periodoDesde <= CORPUS_MAX);
  const customHastaOk = !periodoHasta || (periodoHasta >= CORPUS_MIN && periodoHasta <= CORPUS_MAX);
  const customRangeOk = customDesdeOk && customHastaOk && (!periodoDesde || !periodoHasta || periodoDesde <= periodoHasta);

  const paisLabel = pais === "Todos" ? "Todos los países" : pais;
  const sectoresLabel = selectedSectors.length === 0 ? "Todos los sectores" : selectedSectors.join(", ");
  const entidadLabel = entidad ? entidad : tipoEntidad ? `${tipoEntidad}s` : "Todas las entidades";

  const scopeParts: string[] = [
    "Reporte Operativo",
    tipoHallazgo === "distorsion" ? "Distorsión" : "Carga",
    paisLabel,
    ...(tipoHallazgo === "distorsion"
      ? [eje || null, subdimDistorsion || null]
      : [tipoCarga || null, subdimCarga || null]
    ).filter(Boolean) as string[],
    periodoTipo === "todo" ? "Todos los periodos" : periodoLabel,
    ...([
      selectedFuentes.length > 0 ? `${selectedFuentes.length} fuente${selectedFuentes.length > 1 ? "s" : ""}` : null,
      coberturaMin > 0 ? `Cobertura ≥ ${coberturaMin}%` : null,
      selectedEstadoHitl.length > 0 ? `Estado HITL: ${selectedEstadoHitl.join(", ")}` : null,
      idrMin > 0 ? `IDR ≥ ${idrMin}` : null,
    ].filter(Boolean) as string[]),
  ];
  const scopeSummary = scopeParts.join(" · ");

  // Único punto de armado de filtros -- lo mismo que se manda por `context`
  // a ReportePDFScreen (ver botón "Generar reporte" más abajo), para que la
  // vista previa de acá y la ficha final nunca puedan desalinearse.
  const filtrosActivos: FiltrosHallazgos = {
    pais, sectores: selectedSectors, severidades: selectedSeveridades,
    estadoHitl: selectedEstadoHitl, fuentes: selectedFuentes, tipoTramite, coberturaMin, idrMin,
  };
  const previewBarreras = filtrarBarreras(filtrosActivos);
  const previewTramites = filtrarTramites(filtrosActivos);
  const previewItems = tipoHallazgo === "distorsion" ? previewBarreras : previewTramites;

  // ── Helpers ────────────────────────────────────────────────────────────────────
  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const ChipToggle = ({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) => (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors"
      style={{ backgroundColor: active ? (color ?? C.steel4) : C.canvas, color: active ? "white" : C.textMuted, border: `1.5px solid ${active ? (color ?? C.steel4) : C.border}`, fontFamily: "Space Grotesk, sans-serif" }}>
      {active && <Check size={10} />}
      {label}
    </button>
  );

  const SectionCard = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      <p className="text-[10px] uppercase tracking-widest font-medium mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{title}</p>
      {children}
    </div>
  );

  const selStyle: React.CSSProperties = {
    fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas,
    border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13,
    outline: "none", cursor: "pointer", width: "100%",
  };

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb="Reportes" title="Generador de reportes" subtitle="Configura los filtros y descarga el informe estructurado" />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-5">
        {/* Left — Controls */}
        <div className="flex flex-col gap-4">

          {/* 1. Tipo de hallazgo — root selector, first control */}
          <SectionCard title="Tipo de hallazgo">
            <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              {(["distorsion", "carga"] as const).map(t => (
                <button key={t}
                  onClick={() => { setTipoHallazgo(t); setEje(""); setSubdimDistorsion(""); setTipoCarga(""); setSubdimCarga(""); setSelectedAccionesDistorsion([]); setSelectedAccionesCarga([]); }}
                  className="flex-1 py-2.5 text-[13px] font-medium transition-colors"
                  style={{ backgroundColor: tipoHallazgo === t ? C.steel4 : C.card, color: tipoHallazgo === t ? "white" : C.textMuted, fontFamily: "Space Grotesk, sans-serif", border: "none" }}>
                  {t === "distorsion" ? "Distorsión (barreras)" : "Carga (trámites)"}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* 2. País — always visible */}
          <SectionCard title="País">
            <select style={selStyle} value={pais} onChange={e => { setPais(e.target.value as Country); setSelectedSectors([]); setSelectedFuentes([]); }}>
              {COUNTRIES.map(c => <option key={c} value={c}>{c === "Todos" ? "Todos los países" : c}</option>)}
            </select>
          </SectionCard>

          {/* 3. Sectores — always visible */}
          <SectionCard title={`Sectores ${selectedSectors.length > 0 ? `(${selectedSectors.length} seleccionados)` : "(todos)"}`}>
            <div className="flex flex-wrap gap-2">
              <ChipToggle label="Todos los sectores" active={selectedSectors.length === 0} onClick={() => setSelectedSectors([])} />
              {availableSectors.map(s => (
                <ChipToggle key={s} label={s} active={selectedSectors.includes(s)} onClick={() => toggle(selectedSectors, setSelectedSectors, s)} />
              ))}
            </div>
          </SectionCard>

          {/* 3b. Fuentes — siempre visible */}
          <SectionCard title={`Fuentes ${selectedFuentes.length > 0 ? `(${selectedFuentes.length} seleccionadas)` : "(todas)"}`}>
            <div className="flex flex-wrap gap-2">
              <ChipToggle label="Todas las fuentes" active={selectedFuentes.length === 0} onClick={() => setSelectedFuentes([])} />
              {availableFuentes.map(f => (
                <ChipToggle key={f} label={f} active={selectedFuentes.includes(f)} onClick={() => toggle(selectedFuentes, setSelectedFuentes, f)} />
              ))}
            </div>
          </SectionCard>

          {/* 3c. Cobertura mínima — siempre visible */}
          <SectionCard title="Cobertura mínima">
            <select style={selStyle} value={coberturaMin} onChange={e => setCoberturaMin(Number(e.target.value))}>
              {COBERTURA_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {!coberturaPaisOk && (
              <p className="text-[11px] mt-2" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.critico }}>
                {pais} tiene una cobertura de {COBERTURA_MUESTRA[pais as Exclude<Country, "Todos">]}%, por debajo del mínimo seleccionado — la vista previa no excluye países cuando hay uno específico seleccionado.
              </p>
            )}
          </SectionCard>

          {/* 3d. Estado HITL — siempre visible */}
          <SectionCard title="Estado HITL">
            <div className="flex flex-wrap gap-2">
              {ESTADOS_HITL.map(e => (
                <ChipToggle key={e} label={e} active={selectedEstadoHitl.includes(e)} onClick={() => toggle(selectedEstadoHitl, setSelectedEstadoHitl, e)} />
              ))}
            </div>
          </SectionCard>

          {/* 3e. IDR general mínimo — siempre visible */}
          <SectionCard title="IDR general mínimo">
            <select style={selStyle} value={idrMin} onChange={e => setIdrMin(Number(e.target.value))}>
              {IDR_MIN_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {!idrPaisOk && (
              <p className="text-[11px] mt-2" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.critico }}>
                {pais} tiene un IDR general de {IRR_GENERAL_MUESTRA[pais as Exclude<Country, "Todos">]}, por debajo del mínimo seleccionado — la vista previa no excluye países cuando hay uno específico seleccionado.
              </p>
            )}
          </SectionCard>

          {/* 4. Filtros condicionales por tipo de hallazgo */}
          {tipoHallazgo === "distorsion" ? (
            <>
              <SectionCard title="Eje">
                <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                  {(["", "Entrada", "Operación"] as const).map(e => (
                    <button key={e || "todos"} onClick={() => { setEje(e); setSubdimDistorsion(""); }}
                      className="flex-1 py-2.5 text-[12px] font-medium transition-colors"
                      style={{ backgroundColor: eje === e ? C.steel4 : C.card, color: eje === e ? "white" : C.textMuted, fontFamily: "Space Grotesk, sans-serif", border: "none" }}>
                      {e || "Todos"}
                    </button>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Subdimensión">
                <select style={{ ...selStyle, opacity: !eje ? 0.55 : 1, cursor: !eje ? "not-allowed" : "pointer" }}
                  value={subdimDistorsion} disabled={!eje}
                  onChange={e => setSubdimDistorsion(e.target.value)}>
                  <option value="">{eje ? "Todas las subdimensiones" : "Selecciona un eje primero"}</option>
                  {subdimDistorsionOpts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </SectionCard>

              <SectionCard title="Tipo de restricción o carga">
                <div className="flex flex-wrap gap-2">
                  {TIPOS_RESTRICCION.map(t => (
                    <ChipToggle key={t} label={t} active={selectedTiposRestriccion.includes(t)} onClick={() => toggle(selectedTiposRestriccion, setSelectedTiposRestriccion, t)} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Severidad">
                <div className="flex flex-wrap gap-2">
                  {SEVERIDADES.map(s => (
                    <ChipToggle key={s} label={s} active={selectedSeveridades.includes(s)} onClick={() => toggle(selectedSeveridades, setSelectedSeveridades, s)}
                      color={s === "Crítico" ? C.critico : s === "Alto" ? C.steel4 : s === "Mediano" ? C.steel3 : C.steel2} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Tipo de acción AMR">
                <div className="flex flex-wrap gap-2">
                  {ACCIONES_AMR.map(a => (
                    <ChipToggle key={a} label={a} active={selectedAccionesDistorsion.includes(a)} onClick={() => toggle(selectedAccionesDistorsion, setSelectedAccionesDistorsion, a)} />
                  ))}
                </div>
              </SectionCard>
            </>
          ) : (
            <>
              <SectionCard title="Tipo de carga">
                <div className="flex flex-wrap gap-2">
                  <ChipToggle label="Todos" active={tipoCarga === ""} onClick={() => { setTipoCarga(""); setSubdimCarga(""); }} />
                  {["Accesibilidad", "Certidumbre", "Cumplimiento", "Proporcionalidad"].map(t => (
                    <ChipToggle key={t} label={t} active={tipoCarga === t} onClick={() => { setTipoCarga(tipoCarga === t ? "" : t); setSubdimCarga(""); }} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Subdimensión">
                <select style={{ ...selStyle, opacity: !tipoCarga ? 0.55 : 1, cursor: !tipoCarga ? "not-allowed" : "pointer" }}
                  value={subdimCarga} disabled={!tipoCarga}
                  onChange={e => setSubdimCarga(e.target.value)}>
                  <option value="">{tipoCarga ? "Todas las subdimensiones" : "Selecciona un tipo de carga primero"}</option>
                  {subdimCargaOpts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </SectionCard>

              <SectionCard title="Tipo de trámite">
                <div className="flex flex-wrap gap-2">
                  <ChipToggle label="Todos" active={tipoTramite === ""} onClick={() => setTipoTramite("")} />
                  {["Empresarial", "Ciudadano", "Mixto"].map(t => (
                    <ChipToggle key={t} label={t} active={tipoTramite === t} onClick={() => setTipoTramite(tipoTramite === t ? "" : t)} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Tipo de acción AMR">
                <div className="flex flex-wrap gap-2">
                  {ACCIONES_AMR.map(a => (
                    <ChipToggle key={a} label={a} active={selectedAccionesCarga.includes(a)} onClick={() => toggle(selectedAccionesCarga, setSelectedAccionesCarga, a)} />
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {/* 5. Periodo de tiempo — always visible */}
          <SectionCard title="Periodo de tiempo">
            <select value={periodoTipo} onChange={e => setPeriodoTipo(e.target.value as typeof periodoTipo)} style={{ ...selStyle, marginBottom: 4 }}>
              {PERIODO_OPTS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {periodoTipo === "personalizado" && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wide mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Desde</p>
                  <input type="month" value={periodoDesde} min={CORPUS_MIN} max={CORPUS_MAX}
                    onChange={e => setPeriodoDesde(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                    style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${customDesdeOk ? C.border : C.critico}` }} />
                </div>
                <span className="text-[13px] mt-4 flex-shrink-0" style={{ color: C.textMuted }}>—</span>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wide mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Hasta</p>
                  <input type="month" value={periodoHasta} min={CORPUS_MIN} max={CORPUS_MAX}
                    onChange={e => setPeriodoHasta(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                    style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${customHastaOk ? C.border : C.critico}` }} />
                </div>
              </div>
            )}
            {periodoTipo === "personalizado" && !customRangeOk && (
              <p className="text-[11px] mt-2" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.critico }}>
                El rango debe estar dentro del corpus auditado y la fecha inicial debe ser anterior a la final.
              </p>
            )}
            <p className="text-[11px] mt-2" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Corpus auditado: {CORPUS_LABEL}</p>
          </SectionCard>

          {/* 6. Entidad — always visible (tipo de entidad + entidad dependiente) */}
          <SectionCard title="Entidad emisora">
            <div className="flex flex-col gap-2">
              <select style={selStyle} value={tipoEntidad} onChange={e => { setTipoEntidad(e.target.value); setEntidad(""); }}>
                <option value="">Todos los tipos de entidad</option>
                {TIPOS_ENTIDAD.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select style={{ ...selStyle, opacity: !tipoEntidad ? 0.55 : 1 }} value={entidad} onChange={e => setEntidad(e.target.value)}>
                <option value="">Todas{tipoEntidad ? ` (${tipoEntidad}s)` : " las entidades"}</option>
                {entidadOpts.map(e => <option key={e} value={e}>{e.length > 48 ? e.slice(0, 48) + "…" : e}</option>)}
              </select>
            </div>
          </SectionCard>

          {/* 7. Formato de salida */}
          <SectionCard title="Formato de salida">
            <div className="flex gap-3">
              {(["pdf", "excel"] as const).map(f => (
                <button key={f} onClick={() => setFormato(f)}
                  className="flex-1 py-2.5 rounded-lg text-[13px] font-medium uppercase tracking-wide transition-colors"
                  style={{ backgroundColor: formato === f ? C.steel4 : C.canvas, color: formato === f ? "white" : C.textMuted, fontFamily: "Space Grotesk, sans-serif", border: `1.5px solid ${formato === f ? C.steel4 : C.border}` }}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right — Preview */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg p-5 sticky top-0" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[10px] uppercase tracking-widest font-medium mb-4" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Vista previa del reporte</p>

            {/* Summary chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: C.steel4 + "15", color: C.steel4, fontFamily: "IBM Plex Sans, sans-serif", border: `1px solid ${C.steel4}30` }}>
                {tipoHallazgo === "distorsion" ? "Distorsión" : "Carga"}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: C.steel3 + "15", color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", border: `1px solid ${C.steel3}30` }}>
                {paisLabel}
              </span>
              {selectedSectors.length > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
                  {selectedSectors.length} sector{selectedSectors.length > 1 ? "es" : ""}
                </span>
              )}
              {tipoHallazgo === "distorsion" && eje && (
                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>{eje}</span>
              )}
              {tipoHallazgo === "carga" && tipoCarga && (
                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>{tipoCarga}</span>
              )}
              {selectedFuentes.length > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
                  {selectedFuentes.length} fuente{selectedFuentes.length > 1 ? "s" : ""}
                </span>
              )}
              {coberturaMin > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
                  Cobertura ≥ {coberturaMin}%
                </span>
              )}
              {selectedEstadoHitl.length > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
                  HITL: {selectedEstadoHitl.join(", ")}
                </span>
              )}
              {idrMin > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
                  IDR ≥ {idrMin}
                </span>
              )}
            </div>

            {/* Count */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-[36px] font-semibold leading-none" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{previewItems.length}</span>
              <span className="text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
                {tipoHallazgo === "distorsion" ? "barreras" : "trámites"} en el reporte
              </span>
            </div>

            {/* Severity mini-bars — distorsión only */}
            {tipoHallazgo === "distorsion" && (
              <div className="flex flex-col gap-2 mb-4">
                {SEVERIDADES.map(sev => {
                  const count = previewBarreras.filter(b => b.severidad === sev).length;
                  const max = previewBarreras.length || 1;
                  const color = sev === "Crítico" ? C.critico : sev === "Alto" ? C.steel4 : sev === "Mediano" ? C.steel3 : C.steel2;
                  return (
                    <div key={sev} className="flex items-center gap-2">
                      <span className="text-[11px] w-[60px] flex-shrink-0" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{sev}</span>
                      <div className="flex-1 rounded-full overflow-hidden h-[7px]" style={{ backgroundColor: "#E6ECF3" }}>
                        <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, backgroundColor: color }} />
                      </div>
                      <span className="text-[11px] font-semibold w-[20px] text-right flex-shrink-0" style={{ fontFamily: "Space Grotesk, sans-serif", color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Item list preview */}
            {previewItems.length > 0 && (
              <div className="flex flex-col gap-2 mb-5">
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Muestra (primeros {Math.min(3, previewItems.length)})</p>
                {previewItems.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="px-3 py-2 rounded-lg" style={{ backgroundColor: C.canvas, border: `1px solid ${C.border}` }}>
                    <p className="text-[12px] font-medium leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{item.titulo ?? item.nombre}</p>
                    {item.severidad && (
                      <span className="text-[10px]" style={{ color: item.severidad === "Crítico" ? C.critico : C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>{item.severidad} · {item.sector}</span>
                    )}
                    {item.tipo && !item.severidad && (
                      <span className="text-[10px]" style={{ color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>{item.tipo} · {item.sector}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {previewItems.length === 0 && (
              <p className="text-[13px] text-center py-4" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Sin registros con los filtros aplicados</p>
            )}

            {/* Scope summary */}
            <div className="rounded-lg px-4 py-3 mb-3" style={{ backgroundColor: C.canvas, border: `1px solid ${C.border}` }}>
              <p className="text-[10px] uppercase tracking-widest mb-1 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Alcance del reporte</p>
              <p className="text-[12px] leading-snug" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{scopeSummary}</p>
            </div>

            {/* Descargar -- Excel (.xlsx) con los mismos previewBarreras/
               previewTramites ya filtrados de arriba. No incluye PDF acá: el
               PDF paginado requiere las fichas ya renderizadas de
               ReportePDFScreen, no la vista previa de esta pantalla. */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-full py-2.5 mb-2 rounded-lg text-[12px] font-medium tracking-wide uppercase flex items-center justify-center gap-2"
                  style={{ backgroundColor: C.canvas, color: previewItems.length > 0 ? C.text : C.textMuted, border: `1.5px solid ${C.border}`, fontFamily: "Space Grotesk, sans-serif", cursor: previewItems.length > 0 ? "pointer" : "not-allowed", opacity: previewItems.length > 0 ? 1 : 0.55 }}
                  disabled={previewItems.length === 0}>
                  <Download size={14} /> Descargar <ChevronDown size={12} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-[190px]">
                <DropdownMenuItem
                  className="flex items-center gap-2 text-[12px] cursor-pointer"
                  onSelect={() => exportarHallazgosExcel(tipoHallazgo, previewItems, paisLabel)}>
                  <FileSpreadsheet size={14} /> Excel (.xlsx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              className="w-full py-3 rounded-lg text-[13px] font-semibold tracking-wide uppercase transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: (previewItems.length > 0 && (periodoTipo !== "personalizado" || customRangeOk)) ? C.steel4 : C.border, color: (previewItems.length > 0 && (periodoTipo !== "personalizado" || customRangeOk)) ? "white" : C.textMuted, fontFamily: "Space Grotesk, sans-serif", border: "none" }}
              disabled={previewItems.length === 0 || (periodoTipo === "personalizado" && !customRangeOk)}
              onClick={() => {
                const ctx = JSON.stringify({
                  tipo: tipoHallazgo,
                  // Objeto de filtros REAL, exactamente el mismo que ya calculó
                  // previewBarreras/previewTramites acá arriba -- ReportePDFScreen
                  // lo vuelve a pasar por filtrarBarreras/filtrarTramites tal cual,
                  // sin reconstruir la lógica de filtrado por su lado.
                  filtrosActivos,
                  // Campos solo de presentación (portada / chips), no se usan para filtrar.
                  paisLabel, sectoresLabel, entidad: entidadLabel, periodo: periodoLabel,
                  filtros: scopeParts.slice(1),
                  fecha: new Date().toLocaleString("es-BO"),
                });
                onNavigate({ screen: "reporte-pdf", context: ctx });
              }}>
              <Download size={15} />
              Generar reporte
            </button>
            <p className="text-[10px] text-center mt-2" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Formato: {formato.toUpperCase()} · Datos simulados</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reporte Estratégico ──────────────────────────────────────────────────────
function ReporteEstrategicoScreen({ pais: rawPais, onNavigate }: {
  pais?: string; onNavigate: (v: View) => void;
}) {
  const VALID: Country[] = ["Argentina", "Bolivia", "Chile", "Ecuador", "Perú"];
  const pais: Country = VALID.includes(rawPais as Country) ? rawPais as Country : "Bolivia";
  const isRegional = !VALID.includes(rawPais as Country);
  const paisLabel = isRegional ? "Regional (5 países)" : pais;
  const paisCode  = isRegional ? "REG" : pais.slice(0, 3).toUpperCase();
  const codigo    = `RegLAC-${paisCode}-EST-2026-001`;

  const cd      = COUNTRY_BARRERAS_DATA[pais] ?? COUNTRY_BARRERAS_DATA["Bolivia"];
  const cargaCd = COUNTRY_CARGA[pais] ?? { total: 397, criticas: 52 };
  const f       = cd.total / 397;   // scaling factor vs. Bolivia canonical

  // Instruments per country (from JERARQUIA_NORMATIVA_DATA sums)
  const instrPorPais: Record<string, number> = {
    Todos: 1842, Argentina: 421, Perú: 415, Chile: 358, Ecuador: 336, Bolivia: 312,
  };
  const instrTotal = instrPorPais[isRegional ? "Todos" : pais] ?? 312;

  // Entidades estimated per country
  const entidadesPorPais: Record<string, number> = {
    Todos: 148, Argentina: 42, Bolivia: 24, Chile: 29, Ecuador: 35, Perú: 31,
  };
  const entidadesTotal = entidadesPorPais[isRegional ? "Todos" : pais] ?? 24;

  // Severity breakdown (Bolivia base: criticas=91, altas=168, mediano=96, bajo=42)
  const sevCritico = cd.criticas;
  const sevAlto    = Math.round(168 * f);
  const sevMediano = Math.round(96  * f);
  const sevBajo    = Math.round(42  * f);

  // Scale BarrasComposicion data
  const scaleBC = (data: BarrasComposicionCategoria[]): BarrasComposicionCategoria[] =>
    data.map(cat => ({
      nombre: cat.nombre,
      total: Math.round(cat.total * f),
      componentes: cat.componentes.map(c => ({ nombre: c.nombre, valor: Math.round(c.valor * f) })),
    }));
  const distorsionesData = scaleBC(CLASIFICACION_BARRERAS_DATA);
  const cargaBarrasData  = scaleBC(CARGA_TIPO_BOL_DATA);
  const cargaTotal       = cargaBarrasData.reduce((s, c) => s + c.total, 0);

  // ── Hallazgos pool (distorsión) ─────────────────────────────────────────────
  const DIST_POOL: { pais: Country; entidad: string; titulo: string; cita: string; severidad: string; accion: string; costo: number }[] = [
    { pais: "Bolivia",   entidad: "ARSA",                    titulo: "Bloqueo por Renovación de Registros",          cita: "…sin tolerancia de variación por merma natural ni pérdida durante el almacenamiento previo al despacho.", severidad: "Crítico", accion: "Simplificar",     costo: 4.2 },
    { pais: "Bolivia",   entidad: "SENAVEX",                 titulo: "Restricción de Operadores de Maquila",          cita: "Solo podrán operar las empresas registradas con un mínimo de cinco años de operación continua ininterrumpida.", severidad: "Crítico", accion: "Eliminar",        costo: 4.1 },
    { pais: "Argentina", entidad: "BCRA",                    titulo: "Registros Superpuestos entre Entidades",        cita: "El empleador deberá presentar ante cada entidad supervisora su propio expediente sin reconocimiento mutuo.", severidad: "Crítico", accion: "Armonizar",       costo: 3.9 },
    { pais: "Ecuador",   entidad: "SENASA",                  titulo: "Obligación de Reporte Físico",                  cita: "Los reportes de cumplimiento deben presentarse en papel con certificación notarial de forma bimensual.", severidad: "Crítico", accion: "Digitalizar",     costo: 3.7 },
    { pais: "Bolivia",   entidad: "ASFI",                    titulo: "Capital Mínimo Desproporcionado",               cita: "El capital mínimo exigido supera en cuatro veces el promedio regional para actividades equivalentes.", severidad: "Crítico", accion: "Proporcionalizar", costo: 3.5 },
    { pais: "Bolivia",   entidad: "SENAVEX",                 titulo: "Restricción de Venta Local en ZOLI",            cita: "Las empresas en zona libre no podrán destinar al mercado local más del 5% de su producción total.", severidad: "Crítico", accion: "Eliminar",        costo: 3.4 },
    { pais: "Ecuador",   entidad: "IICA",                    titulo: "Registro Duplicado Inter-agencias",             cita: "La empresa deberá obtener certificación independiente de cada entidad sin reconocimiento entre organismos.", severidad: "Crítico", accion: "Armonizar",       costo: 3.2 },
    { pais: "Argentina", entidad: "Min. Economía",           titulo: "Monopolio de Distribución Estatal",             cita: "La distribución de fibras sintéticas solo podrá realizarse a través de la empresa estatal designada.", severidad: "Crítico", accion: "Eliminar",        costo: 3.1 },
    { pais: "Bolivia",   entidad: "Min. Economía y Finanzas",titulo: "Tasa de Habilitación Excesiva",                 cita: "La tasa de habilitación equivale al 12% del capital declarado sin límite máximo ni escala proporcional.", severidad: "Alto",    accion: "Proporcionalizar", costo: 2.9 },
    { pais: "Ecuador",   entidad: "Código de Comercio",      titulo: "Reserva Obligatoria de Actividad",              cita: "Ciertas actividades quedan reservadas exclusivamente para operadores públicos autorizados por decreto.", severidad: "Alto",    accion: "Eliminar",        costo: 2.8 },
    { pais: "Perú",      entidad: "Aduana Nacional",         titulo: "Canal Rojo Aduanero Obligatorio",               cita: "Todos los envíos del sector deberán ingresar por canal rojo de inspección física sin excepción posible.", severidad: "Alto",    accion: "Simplificar",     costo: 2.7 },
    { pais: "Chile",     entidad: "Subtel",                  titulo: "Monopolio de Espectro Radioeléctrico",          cita: "La asignación de espectro adicional requiere autorización ministerial discrecional sin plazo definido.", severidad: "Crítico", accion: "Clarificar",      costo: 2.6 },
  ];

  // ── Hallazgos pool (carga) ──────────────────────────────────────────────────
  const CARGA_POOL: { pais: Country; entidad: string; tramite: string; cita: string; tipo: string; accion: string; costo: string }[] = [
    { pais: "Argentina", entidad: "Direc. Nac. Habilitaciones", tramite: "Permiso de Construcción",    cita: "El proceso requiere 14 pasos secuenciales ante 5 entidades distintas sin ventanilla única disponible.", tipo: "Empresarial", accion: "Simplificar",  costo: "$4.2M" },
    { pais: "Ecuador",   entidad: "ARCSA",                      tramite: "Registro Sanitario",          cita: "La renovación obliga a repetir el proceso completo cada dos años sin reconocimiento de antecedentes.", tipo: "Empresarial", accion: "Digitalizar",  costo: "$4.2M" },
    { pais: "Bolivia",   entidad: "SENAVEX",                    tramite: "Licencia de Operación",       cita: "La licencia requiere presencia física en hasta tres dependencias con documentos originales cada vez.", tipo: "Empresarial", accion: "Digitalizar",  costo: "$4.2M" },
    { pais: "Argentina", entidad: "AFIP",                       tramite: "Apertura de Empresa",         cita: "La formalización empresarial promedio toma 21 días hábiles ante organismos no integrados entre sí.", tipo: "Empresarial", accion: "Simplificar",  costo: "$3.9M" },
    { pais: "Bolivia",   entidad: "SENAVEX",                    tramite: "Certificado de Exportación",  cita: "El visado físico de exportación requiere presencia y documentos originales en cada operación individual.", tipo: "Empresarial", accion: "Digitalizar",  costo: "$3.7M" },
    { pais: "Ecuador",   entidad: "SENAE",                      tramite: "Habilitación Sanitaria",      cita: "Exige inspección física sin opción de autogestión aun cuando la empresa tiene historial de cumplimiento.", tipo: "Empresarial", accion: "Proporcionalizar", costo: "$3.5M" },
    { pais: "Perú",      entidad: "SUNAT",                      tramite: "Inscripción Tributaria",      cita: "Requiere documentación física redundante con información ya disponible en bases de datos estatales.", tipo: "Ciudadano",   accion: "Interoperar",  costo: "$3.2M" },
    { pais: "Chile",     entidad: "Aduana",                     tramite: "Declaración Aduanera",        cita: "Múltiples sistemas no integrados obligan a reingresar la misma información en plataformas distintas.", tipo: "Empresarial", accion: "Interoperar",  costo: "$3.1M" },
  ];

  const distHallazgos = (() => {
    const filtered = DIST_POOL.filter(h => isRegional || h.pais === pais).sort((a, b) => b.costo - a.costo).slice(0, 2);
    return filtered.length >= 2 ? filtered : [...DIST_POOL].sort((a, b) => b.costo - a.costo).slice(0, 2);
  })();
  const cargaHallazgos = (() => {
    const filtered = CARGA_POOL.filter(h => isRegional || h.pais === pais).slice(0, 2);
    return filtered.length >= 2 ? filtered : CARGA_POOL.slice(0, 2);
  })();

  // ── Mensajes principales ────────────────────────────────────────────────────
  const mensajes = [
    `Se identificaron ${cd.total.toLocaleString()} barreras regulatorias con potencial de ajuste en ${paisLabel}. De estas, ${cd.criticas} presentan impacto crítico (IDR 4) con efecto directo sobre la competitividad del sector privado.`,
    `Las barreras de entrada concentran ${distorsionesData[0]?.total ?? 0} hallazgos, con la subdimensión de Comercio como la más restrictiva. El 40% de los instrumentos identificados requieren acción normativa en el corto plazo.`,
    `La carga regulatoria acumulada genera costos de cumplimiento estimados en USD ${(cargaCd.total * 4.2 / 397).toFixed(1)}M anuales para el sector empresarial. Los trámites de mayor fricción concentran el 68% del costo total identificado.`,
    `Digitalización e interoperabilidad son las principales palancas de reforma. ${cargaBarrasData[1]?.total ?? 0} hallazgos de accesibilidad señalan oportunidades concretas de simplificación sin modificación legislativa.`,
    `El análisis AMR identifica ${Math.round(cd.total * 0.22)} normas susceptibles de eliminación o simplificación directa en el corto plazo, con impacto económico positivo estimado en los primeros 12 meses de implementación.`,
  ];

  // ── Acciones AMR ────────────────────────────────────────────────────────────
  const accionesAMR = [
    { verbo: "Eliminar",         desc: `${Math.round(cd.total * 0.08)} instrumentos normativos duplicados o sin justificación de política, concentrados en sectores de entrada al mercado.` },
    { verbo: "Simplificar",      desc: `Reducción de pasos en ${Math.round(cargaCd.total * 0.3)} trámites de alta carga mediante aprobación automática y silencio administrativo positivo.` },
    { verbo: "Digitalizar",      desc: `Migración de ${Math.round(cargaCd.total * 0.25)} requisitos físicos obligatorios a plataformas de ventanilla única con interoperabilidad estatal.` },
    { verbo: "Proporcionalizar", desc: `Revisión de ${Math.round(cd.total * 0.12)} normas con sanciones o capitales mínimos sin sustento técnico ni alineación con el riesgo regulatorio.` },
    { verbo: "Armonizar",        desc: `Alineación de marcos normativos con estándares regionales comparables en ${cd.sectores} sectores para reducir cargas de cumplimiento diferencial.` },
  ];

  // ── Sub-components ──────────────────────────────────────────────────────────
  const SecLabel = ({ num, title }: { num: string; title: string }) => (
    <div className="mb-5">
      <p className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Sección {num}</p>
      <h2 className="text-[20px] font-semibold leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{title}</h2>
    </div>
  );
  const Div = () => <div className="my-8" style={{ borderTop: `1px solid ${C.border}` }} />;

  const AMRBadge = ({ label }: { label: string }) => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide flex-shrink-0"
      style={{ backgroundColor: C.steel4 + "12", color: C.steel4, border: `1px solid ${C.steel4}25`, fontFamily: "Space Grotesk, sans-serif" }}>
      {label}
    </span>
  );

  const SevBadge = ({ nivel }: { nivel: string }) => {
    const col = nivel === "Crítico" ? C.critico : nivel === "Alto" ? C.alto : nivel === "Mediano" ? C.mediano : C.bajo;
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide flex-shrink-0"
        style={{ backgroundColor: col + "18", color: col, border: `1px solid ${col}30`, fontFamily: "Space Grotesk, sans-serif" }}>
        {nivel}
      </span>
    );
  };

  return (
    <div className="overflow-y-auto h-full" style={{ backgroundColor: C.canvas }}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 py-3"
        style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}>
        <button className="flex items-center gap-1.5 text-[13px]"
          style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => onNavigate({ screen: "country-dashboard", country: isRegional ? "Bolivia" : pais })}>
          ← Volver a Panorama
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] hidden sm:inline" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
            Reporte Estratégico · Datos simulados
          </span>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold"
            style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none", cursor: "pointer" }}>
            <Download size={13} /> Descargar PDF
          </button>
        </div>
      </div>

      {/* Paper */}
      <div className="max-w-[820px] mx-auto my-4 md:my-8 shadow-xl rounded-xl overflow-hidden" style={{ marginLeft: "auto", marginRight: "auto" }}>

        {/* ── PORTADA ── */}
        <div className="px-10 md:px-16 py-14 md:py-16 flex flex-col" style={{ backgroundColor: C.steel4, minHeight: 520 }}>
          <div className="flex items-center gap-4 mb-auto">
            <span className="text-[22px] tracking-[4px]" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, color: "white" }}>RegLAC</span>
          </div>

          <div className="mt-16">
            <p className="text-[10px] uppercase tracking-[3px] mb-4" style={{ fontFamily: "Space Grotesk, sans-serif", color: "rgba(255,255,255,0.42)" }}>
              Informe de Inteligencia Regulatoria
            </p>
            <h1 className="text-[36px] font-semibold leading-tight mb-8" style={{ fontFamily: "Space Grotesk, sans-serif", color: "white" }}>
              Panorama Regulatorio<br />y Agenda de Reforma
            </h1>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10">
              {[
                { label: "País / Alcance",    val: paisLabel },
                { label: "Fecha de corte",    val: "Marzo 2026" },
                { label: "Sector",            val: `Todos los sectores (${cd.sectores})` },
                { label: "Código de informe", val: codigo },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: "rgba(255,255,255,0.36)" }}>{label}</p>
                  <p className="text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: "white" }}>{val}</p>
                </div>
              ))}
            </div>
            <div className="pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: "rgba(255,255,255,0.3)" }}>
                Banco Interamericano de Desarrollo · Plataforma RegLAC · © 2026
              </p>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="px-8 md:px-14 py-10" style={{ backgroundColor: "white" }}>

          {/* S1 — Mensajes principales */}
          <SecLabel num="1" title="Mensajes principales" />
          <div className="flex flex-col gap-3">
            {mensajes.map((txt, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: C.canvas, border: `1px solid ${C.border}` }}>
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                  style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif" }}>
                  {i + 1}
                </div>
                <p className="text-[12px] leading-relaxed pt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{txt}</p>
              </div>
            ))}
          </div>

          <Div />

          {/* S2 — Cobertura */}
          <SecLabel num="2" title="Cobertura del análisis" />
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Instrumentos normativos analizados", val: instrTotal.toLocaleString(), sub: "analizados" },
              { label: "Sectores económicos cubiertos",      val: cd.sectores.toString(),       sub: "cubiertos" },
              { label: "Período de análisis",               val: "2015–2026",                  sub: "horizonte temporal" },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-xl p-5 flex flex-col gap-1" style={{ backgroundColor: C.canvas, border: `1px solid ${C.border}` }}>
                <p className="text-[10px] uppercase tracking-widest leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{kpi.label}</p>
                <p className="text-[30px] font-semibold leading-none mt-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>{kpi.val}</p>
                <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          <Div />

          {/* S3 — Panorama general */}
          <SecLabel num="3" title="Panorama general" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Normas encontradas",              val: cd.total.toLocaleString(),      color: C.text },
              { label: "Trámites con potencial de mejora",val: cargaCd.total.toString(),       color: C.steel3 },
              { label: "Entidades involucradas",          val: entidadesTotal.toString(),      color: C.steel4 },
              { label: "Sectores principales afectados",  val: cd.sectores.toString(),         color: C.alto },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-xl p-4" style={{ backgroundColor: C.canvas, border: `1px solid ${C.border}` }}>
                <p className="text-[10px] uppercase tracking-widest mb-2 leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{kpi.label}</p>
                <p className="text-[26px] font-semibold leading-none" style={{ fontFamily: "Space Grotesk, sans-serif", color: kpi.color }}>{kpi.val}</p>
              </div>
            ))}
          </div>
          {/* Severity bar */}
          <p className="text-[11px] font-medium mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
            Distribución por severidad · Total {cd.total.toLocaleString()} barreras
          </p>
          <div>
            {(() => {
              const segs = [
                { label: "Crítico", val: sevCritico, color: C.critico },
                { label: "Alto",    val: sevAlto,    color: C.alto },
                { label: "Mediano", val: sevMediano, color: C.mediano },
                { label: "Bajo",    val: sevBajo,    color: C.bajo },
              ];
              const tot = segs.reduce((s, x) => s + x.val, 0);
              return (
                <>
                  <div className="flex h-5 rounded-lg overflow-hidden mb-3">
                    {segs.map(s => (
                      <div key={s.label} style={{ width: `${(s.val / tot) * 100}%`, backgroundColor: s.color }} title={`${s.label}: ${s.val}`} />
                    ))}
                  </div>
                  <div className="flex gap-5 flex-wrap">
                    {segs.map(s => (
                      <div key={s.label} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
                          {s.label} <strong style={{ color: C.text }}>{s.val}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>

          <Div />

          {/* S4 — Distorsiones */}
          <SecLabel num="4" title="Principales distorsiones regulatorias" />
          <p className="text-[12px] mb-5 leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
            Distribución de hallazgos de distorsión por eje y subdimensión.
          </p>
          <BarrasComposicion
            label="Barreras por eje regulatorio"
            total={distorsionesData.reduce((s, c) => s + c.total, 0)}
            categorias={distorsionesData}
          />

          <Div />

          {/* S5 — Carga */}
          <SecLabel num="5" title="Carga regulatoria" />
          <p className="text-[12px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
            Trámites que requieren ajuste, por tipo de carga.
          </p>
          <p className="text-[12px] font-semibold mb-5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>
            {cargaTotal.toLocaleString()} en total.
          </p>
          <BarrasComposicion
            label="Hallazgos de carga por tipo"
            total={cargaTotal}
            categorias={cargaBarrasData}
          />

          <Div />

          {/* S6 — Acciones AMR */}
          <SecLabel num="6" title="Principales acciones de mejora regulatoria" />
          <div className="flex flex-col gap-3">
            {accionesAMR.map((a, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: C.canvas, border: `1px solid ${C.border}` }}>
                <span className="flex-shrink-0 px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide mt-0.5"
                  style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", whiteSpace: "nowrap" }}>
                  {a.verbo}
                </span>
                <p className="text-[12px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{a.desc}</p>
              </div>
            ))}
          </div>

          <Div />

          {/* S7 — Hallazgos destacados */}
          <SecLabel num="7" title="Ejemplos de hallazgos" />
          <p className="text-[12px] mb-6 leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
            Los hallazgos con mayor impacto económico estimado del universo analizado. La ficha completa está disponible en el Reporte Operativo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Distorsión cards */}
            {distHallazgos.map((h, i) => (
              <div key={i} className="rounded-xl overflow-hidden flex flex-col" style={{ border: `1px solid ${C.border}` }}>
                <div className="px-4 py-3 flex items-center justify-between gap-2" style={{ backgroundColor: C.steel4 }}>
                  <span className="text-[11px] font-medium truncate" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Space Grotesk, sans-serif" }}>
                    Distorsión · {h.entidad}
                  </span>
                  <SevBadge nivel={h.severidad} />
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1" style={{ backgroundColor: "white" }}>
                  <p className="text-[13px] font-semibold leading-snug" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{h.titulo}</p>
                  <p className="text-[11px] italic leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
                    "{h.cita}"
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                    <AMRBadge label={h.accion} />
                    <span className="text-[14px] font-semibold flex-shrink-0" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>
                      USD {h.costo}M
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {/* Carga cards */}
            {cargaHallazgos.map((h, i) => (
              <div key={i} className="rounded-xl overflow-hidden flex flex-col" style={{ border: `1px solid ${C.border}` }}>
                <div className="px-4 py-3 flex items-center justify-between gap-2" style={{ backgroundColor: C.steel3 }}>
                  <span className="text-[11px] font-medium truncate" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Space Grotesk, sans-serif" }}>
                    Carga · {h.entidad}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase flex-shrink-0"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", fontFamily: "Space Grotesk, sans-serif" }}>
                    {h.tipo}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1" style={{ backgroundColor: "white" }}>
                  <p className="text-[13px] font-semibold leading-snug" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{h.tramite}</p>
                  <p className="text-[11px] italic leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
                    "{h.cita}"
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                    <AMRBadge label={h.accion} />
                    <span className="text-[14px] font-semibold flex-shrink-0" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>
                      {h.costo}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
            <p className="text-[10px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
              Banco Interamericano de Desarrollo · Plataforma RegLAC · Datos simulados · © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reporte PDF ───────────────────────────────────────────────────────────────
function ReportePDFScreen({ context, onNavigate }: { context?: string; onNavigate: (v: View) => void }) {
  // ── Notas manuales del revisor (Comentarios / Uso permitido) ────────────────
  // Declarado ANTES del early return de abajo (regla de los Hooks: mismo
  // orden de llamada en todos los renders, incluso si este screen alterna
  // entre "estrategico" y un reporte operativo sin desmontarse). Estado local
  // del componente -- no persiste al cerrar el reporte (punto 3, no
  // obligatorio para esta tarea; ver aviso pendiente).
  const [notas, setNotas] = useState<Record<string, { comentario: string; usoPermitido: string }>>({});
  const getNota = (id: string) => notas[id] ?? { comentario: "", usoPermitido: "" };
  const setNotaCampo = (id: string, campo: "comentario" | "usoPermitido", valor: string) =>
    setNotas(prev => ({ ...prev, [id]: { ...getNota(id), [campo]: valor } }));

  // Ref al contenedor "Paper" (portada + fichas) para exportarReportePdf(), y
  // estado de "descargando" para feedback en el botón mientras html2canvas/
  // jsPDF procesan (misma razón que notas: antes del early return).
  const paperRef = useRef<HTMLDivElement>(null);
  const [descargando, setDescargando] = useState<"pdf" | "excel" | null>(null);

  // Detect strategic report type from JSON context (Panorama → Exportar PDF)
  const ctx = (() => { try { return JSON.parse(context ?? "{}"); } catch { return {}; } })();
  if (ctx.tipo === "estrategico") {
    return <ReporteEstrategicoScreen pais={ctx.pais} onNavigate={onNavigate} />;
  }

  // ── Context parsing ──────────────────────────────────────────────────────────
  // filtrosActivos viene de ReportesScreen() tal cual -- ver su botón
  // "Generar reporte" -- y se vuelve a pasar por filtrarBarreras/filtrarTramites
  // (el mismo filtro compartido, no una copia). Entradas legacy que no mandan
  // JSON (context: tramite.sector / d.tipoCarga / exportCtx desde otras
  // pantallas) caen al fallback: país Bolivia, sin más filtros -- mismo
  // comportamiento que tenían antes de esta tarea.
  const tipoHallazgo: "distorsion" | "carga" = ctx.tipo === "carga" ? "carga" : "distorsion";
  const filtrosActivos: FiltrosHallazgos = (ctx.filtrosActivos && typeof ctx.filtrosActivos === "object")
    ? { ...FILTROS_HALLAZGOS_DEFAULT, ...ctx.filtrosActivos }
    : { ...FILTROS_HALLAZGOS_DEFAULT, pais: (["Argentina", "Bolivia", "Chile", "Ecuador", "Perú"].includes(ctx.pais) ? ctx.pais : "Bolivia") as Country };
  const pais: Country = filtrosActivos.pais;
  const paisLabel: string = ctx.paisLabel ?? (pais === "Todos" ? "Todos los países" : pais);
  const sectorActivo: string = ctx.sectoresLabel ?? ctx.sector ?? "Todos los sectores";
  const filtrosChips: string[] = Array.isArray(ctx.filtros) ? ctx.filtros.filter((f: string) => !!f) : [];
  const periodo: string = ctx.periodo ?? "enero 2015 – marzo 2026";
  const fechaCtx: string = typeof ctx.fecha === "string" ? ctx.fecha.split(",")[0] : "Marzo 2026";
  const paisCode = pais === "Todos" ? "REG" : pais.slice(0, 3).toUpperCase();
  const codigo = `RegLAC-${paisCode}-OP-2026-001`;

  // ── Hallazgos reales, filtrados con la MISMA función que usa la vista
  // previa de ReportesScreen (filtrarBarreras/filtrarTramites) ────────────────
  const hallazgosBarreras = filtrarBarreras(filtrosActivos);
  const hallazgosTramites = filtrarTramites(filtrosActivos);
  const hallazgos = tipoHallazgo === "carga" ? hallazgosTramites : hallazgosBarreras;
  // Vocabulario de severidad distinto por tipo: barreras usa "Crítico"
  // (masc., escala de 4 niveles), trámites usa "Crítica" (fem., escala de 2
  // niveles) -- mismo criterio ya establecido en TramiteSeveridadBadge/
  // TRAMITE_SEVERIDAD_COLOR más arriba, no una inconsistencia nueva.
  const criticos = hallazgos.filter(h => h.severidad === (tipoHallazgo === "carga" ? "Crítica" : "Crítico")).length;
  const hallazgosLabel = ctx.registros ?? `${hallazgos.length} hallazgo${hallazgos.length !== 1 ? "s" : ""} · ${criticos} crítico${criticos !== 1 ? "s" : ""}`;

  // Agrupación por instrumento regulatorio (punto 4) -- solo aplica a
  // distorsión: ALL_TRAMITES no tiene un campo `instrumento` equivalente, así
  // que las fichas de carga se listan siempre planas, sin agrupar.
  const gruposInstrumento: [string, typeof hallazgosBarreras][] | null = tipoHallazgo === "distorsion"
    ? Array.from(hallazgosBarreras.reduce((map, b) => {
        if (!map.has(b.instrumento)) map.set(b.instrumento, []);
        map.get(b.instrumento)!.push(b);
        return map;
      }, new Map<string, typeof hallazgosBarreras>()))
    : null;

  // ── Sub-components ───────────────────────────────────────────────────────────
  const SevBadge = ({ nivel }: { nivel: string }) => {
    const col = nivel === "Crítico" ? C.critico : nivel === "Alto" ? C.alto : nivel === "Mediano" ? C.mediano : C.bajo;
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
        style={{ backgroundColor: col + "22", color: col, border: `1px solid ${col}38`, fontFamily: "Space Grotesk, sans-serif" }}>
        {nivel}
      </span>
    );
  };

  const AMRBadge = ({ label }: { label: string }) => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: C.steel4 + "14", color: C.steel4, border: `1px solid ${C.steel4}28`, fontFamily: "Space Grotesk, sans-serif" }}>
      {label}
    </span>
  );

  const Field2Col = ({ fields }: { fields: { label: string; val: React.ReactNode }[] }) => (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {fields.map(({ label, val }) => (
        <div key={label}>
          <p className="text-[10px] uppercase tracking-widest mb-0.5 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{label}</p>
          <p className="text-[12px] leading-snug" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{val}</p>
        </div>
      ))}
    </div>
  );

  const CiteBox = ({ text, pasaje, fuente }: { text: string; pasaje: string; fuente: string }) => {
    const parts = text.split(pasaje);
    return (
      <div className="rounded-lg p-4 italic text-[12px] leading-relaxed"
        style={{ backgroundColor: "#F4F7FA", border: `1px solid ${C.border}`, fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>
        <div className="flex gap-3">
          <div className="w-1 flex-shrink-0 rounded-full self-stretch" style={{ backgroundColor: C.steel3 }} />
          <p>
            {parts[0]}
            <mark style={{ backgroundColor: C.steel3 + "28", color: C.steel4, padding: "0 2px", borderRadius: 2, fontStyle: "normal", fontWeight: 600 }}>{pasaje}</mark>
            {parts.slice(1).join(pasaje)}
          </p>
        </div>
        <p className="text-[10px] mt-2 not-italic" style={{ color: C.textMuted }}>texto de muestra · {fuente}</p>
      </div>
    );
  };

  // Impacto económico estimado -- solo barreras (impactoEstimado, ver
  // attachImpactoEstimado más arriba en el archivo); los trámites ya tienen
  // su propio costo real por trámite (h.costo) mostrado aparte en FichaCarga.
  const ImpactBox = ({ monto, canal }: { monto: string; canal: string }) => (
    <div className="rounded-lg p-4" style={{ backgroundColor: C.critico + "07", border: `1px solid ${C.critico}22` }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.critico }}>Impacto económico estimado</p>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
          style={{ backgroundColor: C.critico + "15", color: C.critico, border: `1px solid ${C.critico}25`, fontFamily: "Space Grotesk, sans-serif" }}>
          {canal}
        </span>
      </div>
      <p className="text-[22px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>{monto}</p>
      <p className="text-[10px] mt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>simulado · reparto proporcional del costo agregado del país</p>
    </div>
  );

  const AMRBox = ({ accion, desc }: { accion: string; desc: string }) => (
    <div className="rounded-lg p-4" style={{ backgroundColor: C.steel3 + "07", border: `1px solid ${C.steel3}22` }}>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel3 }}>Acción de mejora regulatoria</p>
        <AMRBadge label={accion} />
      </div>
      <p className="text-[12px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{desc}</p>
    </div>
  );

  // Comentarios / Uso permitido -- nota manual del revisor, no datos (punto 3).
  const NotasBox = ({ id }: { id: string }) => {
    const nota = getNota(id);
    return (
      <div className="rounded-lg p-4" style={{ backgroundColor: C.canvas, border: `1px dashed ${C.border}` }}>
        <p className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Notas del revisor</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Comentarios</p>
            <textarea value={nota.comentario} onChange={e => setNotaCampo(id, "comentario", e.target.value)}
              placeholder="Agregar comentario…" rows={3}
              className="w-full rounded-lg px-3 py-2 text-[12px] outline-none resize-none"
              style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: "white", border: `1px solid ${C.border}` }} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Uso permitido</p>
            <textarea value={nota.usoPermitido} onChange={e => setNotaCampo(id, "usoPermitido", e.target.value)}
              placeholder="Especificar uso permitido…" rows={3}
              className="w-full rounded-lg px-3 py-2 text-[12px] outline-none resize-none"
              style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: "white", border: `1px solid ${C.border}` }} />
          </div>
        </div>
      </div>
    );
  };

  const FichaDistorsion = ({ h, num }: { h: typeof ALL_BARRERAS[number]; num: number }) => (
    <div className="pdf-block mb-10" style={{ pageBreakInside: "avoid" }}>
      <p className="text-[10px] font-bold uppercase tracking-[2px] mb-0.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Ficha {num} · Distorsión</p>
      <h3 className="text-[16px] font-semibold leading-tight mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{h.titulo}</h3>
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
        {/* Top stripe */}
        <div className="px-5 py-3 flex items-center justify-between gap-3" style={{ backgroundColor: C.steel4 }}>
          <span className="text-[11px] font-medium text-white flex-shrink-0" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Distorsión regulatoria</span>
          <SevBadge nivel={h.severidad} />
          <span className="text-[11px] flex-shrink-0 text-right" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: "rgba(255,255,255,0.65)" }}>{h.entidad}</span>
        </div>
        <div className="p-5 md:p-6 flex flex-col gap-5" style={{ backgroundColor: "white" }}>
          <Field2Col fields={[
            { label: "ID hallazgo",            val: h.idHallazgo },
            { label: "Fuente",                 val: h.fuente },
            { label: "País",                   val: h.pais },
            { label: "Norma",                  val: h.instrumento },
            { label: "Sector",                 val: h.sector },
            { label: "Clasificación",          val: `${h.clasificacion} · ${h.subdimension}` },
            { label: "Entidad que emite",      val: h.entidad },
            { label: "Canal de transmisión",   val: h.canalTransmision },
            { label: "Afectación MIPYME",      val: h.afectacionMipyme },
            { label: "Proporcionalidad",       val: h.accionSugerida.objetivoLegitimo },
            { label: "Estado HITL",            val: h.validacion.estadoHitl },
          ]} />
          <CiteBox text={h.textNormativo} pasaje={h.pasajeResaltado} fuente={h.instrumento} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Tipo de restricción",      val: <>{h.tipoRestriccion}</> },
              { label: "Descripción del hallazgo", val: <>{h.descripcion}</> },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-widest mb-1 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{label}</p>
                <p className="text-[12px] leading-snug" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{val}</p>
              </div>
            ))}
          </div>
          <ImpactBox monto={h.impactoEstimado} canal={h.canalTransmision} />
          <AMRBox accion={h.accionCategoria} desc={h.accionSugerida.accion} />
          <NotasBox id={h.id} />
        </div>
      </div>
    </div>
  );

  const FichaCarga = ({ h, num }: { h: typeof ALL_TRAMITES[number]; num: number }) => (
    <div className="pdf-block mb-10" style={{ pageBreakInside: "avoid" }}>
      <p className="text-[10px] font-bold uppercase tracking-[2px] mb-0.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Ficha {num} · Carga</p>
      <h3 className="text-[16px] font-semibold leading-tight mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{h.nombre}</h3>
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
        {/* Top stripe */}
        <div className="px-5 py-3 flex items-center justify-between gap-3" style={{ backgroundColor: C.steel3 }}>
          <span className="text-[11px] font-medium text-white flex-shrink-0" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Carga regulatoria</span>
          <TramiteSeveridadBadge level={h.severidad} />
          <span className="text-[11px] flex-shrink-0 text-right" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: "rgba(255,255,255,0.65)" }}>{h.entidad}</span>
        </div>
        <div className="p-5 md:p-6 flex flex-col gap-5" style={{ backgroundColor: "white" }}>
          <Field2Col fields={[
            { label: "ID hallazgo",              val: h.id },
            { label: "Fuente",                   val: h.fuente },
            { label: "País",                     val: h.pais },
            { label: "Etapa",                    val: h.etapa },
            { label: "Sector",                   val: h.sector },
            { label: "Usuario afectado",         val: h.tipo },
            { label: "Entidad que gestiona",     val: h.entidad },
            { label: "Clasificación",            val: `${h.tipoCarga} · ${h.subdimension}` },
            { label: "Canal de transmisión",     val: h.canalTransmision },
            { label: "Afectación MIPYME",        val: h.afectacionMipyme },
            { label: "Cita",                     val: "—" },
            { label: "Proporcionalidad",         val: "—" },
            { label: "Estado HITL",              val: h.estadoHitl },
          ]} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-2 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Pasos del trámite</p>
              <ul className="flex flex-col gap-1.5">
                {h.pasos.map((p) => (
                  <li key={p.id} className="flex items-start gap-2 text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: p.friccion ? C.critico : C.text }}>
                    <span className="flex-shrink-0 w-1 h-1 rounded-full mt-1.5" style={{ backgroundColor: p.friccion ? C.critico : C.steel3, marginTop: 7 }} />
                    <span>{p.nombre} <span style={{ color: C.textMuted }}>· {p.tiempo} · {p.costo}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Descripción del hallazgo</p>
              <p className="text-[12px] leading-snug" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{h.diagnostico}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Costo monetario estimado (SCM)</p>
              <p className="text-[20px] font-semibold leading-none mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>{h.costo.monetario}</p>
              <p className="text-[10px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{h.costo.cargaTotal} · simulado · modelo SCM</p>
            </div>
          </div>
          <AMRBox accion={h.accionCategoria} desc={h.accionSugerida} />
          <NotasBox id={h.id} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="overflow-y-auto h-full" style={{ backgroundColor: C.canvas }}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 py-3"
        style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}>
        <button className="flex items-center gap-1.5 text-[13px]"
          style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => onNavigate({ screen: "reportes" })}>
          ← Volver a Reportes
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] hidden sm:inline" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Reporte Operativo · Datos simulados</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold"
                disabled={hallazgos.length === 0 || descargando !== null}
                style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none", cursor: (hallazgos.length === 0 || descargando !== null) ? "not-allowed" : "pointer", opacity: (hallazgos.length === 0 || descargando !== null) ? 0.6 : 1 }}>
                <Download size={13} /> {descargando ? "Generando…" : "Descargar"} <ChevronDown size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[190px]">
              <DropdownMenuItem
                className="flex items-center gap-2 text-[12px] cursor-pointer"
                onSelect={async () => {
                  if (!paperRef.current) return;
                  setDescargando("pdf");
                  try {
                    await exportarReportePdf(paperRef.current, `RegLAC_reporte_operativo_${slugArchivo(paisLabel)}_${fechaSlugHoy()}`);
                  } finally {
                    setDescargando(null);
                  }
                }}>
                <FileText size={14} /> PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-[12px] cursor-pointer"
                onSelect={async () => {
                  setDescargando("excel");
                  try {
                    await exportarHallazgosExcel(tipoHallazgo, hallazgos, paisLabel);
                  } finally {
                    setDescargando(null);
                  }
                }}>
                <FileSpreadsheet size={14} /> Excel (.xlsx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Paper */}
      <div ref={paperRef} className="max-w-[820px] mx-auto my-4 md:my-8 shadow-xl rounded-xl overflow-hidden">

        {/* ── PORTADA ── */}
        <div className="pdf-block px-10 md:px-16 py-14 md:py-16 flex flex-col" style={{ backgroundColor: C.steel4, minHeight: 460, pageBreakInside: "avoid" }}>
          <div className="flex items-center gap-4 mb-auto">
            <span className="text-[22px] tracking-[4px]" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, color: "white" }}>RegLAC</span>
          </div>

          <div className="mt-14">
            <p className="text-[10px] uppercase tracking-[3px] mb-4" style={{ fontFamily: "Space Grotesk, sans-serif", color: "rgba(255,255,255,0.42)" }}>
              Reporte Operativo de Inteligencia Regulatoria
            </p>
            <h1 className="text-[30px] font-semibold leading-tight mb-8" style={{ fontFamily: "Space Grotesk, sans-serif", color: "white" }}>
              Ficha de Hallazgos —<br />
              <span style={{ color: "rgba(255,255,255,0.75)" }}>
                {sectorActivo && sectorActivo !== "Todos los sectores" ? sectorActivo : "Todos los sectores"}
              </span>
            </h1>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
              {[
                { label: "Período",             val: periodo },
                { label: "Fecha de corte",      val: fechaCtx },
                { label: "Hallazgos incluidos", val: hallazgosLabel },
                { label: "Código de informe",   val: codigo },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: "rgba(255,255,255,0.36)" }}>{label}</p>
                  <p className="text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: "white" }}>{val}</p>
                </div>
              ))}
            </div>

            {filtrosChips.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-wider mb-2" style={{ fontFamily: "Space Grotesk, sans-serif", color: "rgba(255,255,255,0.36)" }}>Filtros aplicados</p>
                <div className="flex flex-wrap gap-2">
                  {filtrosChips.map((f, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium"
                      style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "IBM Plex Sans, sans-serif", border: "1px solid rgba(255,255,255,0.2)" }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: "rgba(255,255,255,0.3)" }}>
                Banco Interamericano de Desarrollo · Plataforma RegLAC · © 2026
              </p>
            </div>
          </div>
        </div>

        {/* ── FICHAS ── */}
        <div className="px-8 md:px-12 py-10" style={{ backgroundColor: "white" }}>
          {hallazgos.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[14px] font-medium mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>
                No hay hallazgos que coincidan con los filtros seleccionados
              </p>
              <p className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
                Ajusta los filtros en la pantalla de Reportes y vuelve a generar el informe.
              </p>
            </div>
          ) : tipoHallazgo === "distorsion" ? (
            (() => {
              let num = 0;
              return gruposInstrumento!.map(([instrumento, items]) => (
                <div key={instrumento} className="mb-4">
                  {items.length > 1 && (
                    <div className="pdf-block mb-4 pb-2" style={{ borderBottom: `2px solid ${C.steel4}`, pageBreakInside: "avoid" }}>
                      <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>
                        Instrumento: {instrumento}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
                        {items[0].jerarquia} · {items[0].entidad} · {items.length} hallazgos
                      </p>
                    </div>
                  )}
                  <div className={items.length > 1 ? "pl-4" : ""} style={items.length > 1 ? { borderLeft: `2px solid ${C.border}` } : undefined}>
                    {items.map(h => { num++; return <FichaDistorsion key={h.id} h={h} num={num} />; })}
                  </div>
                </div>
              ));
            })()
          ) : (
            hallazgosTramites.map((h, i) => <FichaCarga key={h.id} h={h} num={i + 1} />)
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Documentación del Sistema ───────────────────────────────────────────────
const DOC_MODULES = [
  {
    id: 1,
    nombre: "Regulaciones › Panorama",
    filas: [
      { id: "DASH-01", func: "Dashboard regional", desc: "Vista consolidada de barreras, trámites y costos regulatorios de todos los países analizados.", actores: "Administrador, Usuario BID" },
      { id: "DASH-02", func: "Dashboard por país", desc: "Estadísticas, KPIs y desglose sectorial filtrados por un país específico.", actores: "Administrador, Usuario BID" },
      { id: "DASH-03", func: "Selector de país", desc: "Cambia el contexto activo del sistema, filtrando dashboards y análisis por país.", actores: "Administrador, Usuario BID" },
      { id: "DASH-04", func: "Desglose por sectores", desc: "Tabla de sectores económicos con conteo de barreras críticas y trámites por sector.", actores: "Administrador, Usuario BID" },
      { id: "DASH-05", func: "Ver todos los sectores", desc: "Expande la vista de sectores para mostrar la lista completa de sectores analizados en el país.", actores: "Administrador, Usuario BID" },
      { id: "DASH-06", func: "Exportar PDF", desc: "Genera un PDF del estado del dashboard activo con KPIs y distribución por severidad.", actores: "Administrador, Usuario BID" },
    ],
  },
  {
    id: 2,
    nombre: "Regulaciones › Barreras",
    filas: [
      { id: "BAR-01", func: "Listado de barreras", desc: "Tabla de barreras regulatorias con filtros por sector, tipo y severidad.", actores: "Administrador, Usuario BID" },
      { id: "BAR-02", func: "Detalle de barrera", desc: "Ficha completa con descripción, KPIs de impacto (costo, tiempo, sectores) y trámites relacionados.", actores: "Administrador, Usuario BID" },
      { id: "BAR-03", func: "Distribución por severidad", desc: "Gráfico de dona con el porcentaje de barreras críticas, altas, medianas y bajas.", actores: "Administrador, Usuario BID" },
      { id: "BAR-04", func: "Exportar PDF de barrera", desc: "Exporta la ficha de detalle de una barrera individual como documento PDF.", actores: "Administrador, Usuario BID" },
    ],
  },
  {
    id: 3,
    nombre: "Regulaciones › Trámites",
    filas: [
      { id: "TRA-01", func: "Listado de trámites", desc: "Tabla de trámites con filtros por sector, tipo, país y etiquetas.", actores: "Administrador, Usuario BID" },
      { id: "TRA-02", func: "Detalle de trámite", desc: "Ficha completa con descripción, etiqueta de prioridad y KPIs: costo total, tiempo total, plazo de resolución y costo por tiempo.", actores: "Administrador, Usuario BID" },
      { id: "TRA-03", func: "Flujo del proceso", desc: "Diagrama de 8 pasos generales del proceso regulatorio, cada uno con tiempo estimado y costo asociado.", actores: "Administrador, Usuario BID" },
      { id: "TRA-04", func: "Exportar PDF de trámite", desc: "Exporta la ficha de detalle de un trámite individual como documento PDF.", actores: "Administrador, Usuario BID" },
    ],
  },
  {
    id: 4,
    nombre: "Reportes",
    filas: [
      { id: "REP-01", func: "Generador de reportes", desc: "Configura un reporte con filtros de país, sector, tipo de análisis y formato de salida.", actores: "Administrador, Usuario BID" },
      { id: "REP-02", func: "Vista previa del reporte", desc: "Panel lateral que simula el reporte generado en tiempo real según los filtros aplicados.", actores: "Administrador, Usuario BID" },
      { id: "REP-03", func: "Reporte PDF estructurado", desc: "Documento con portada, resumen ejecutivo con KPIs globales y fichas detalladas por barrera.", actores: "Administrador, Usuario BID" },
      { id: "REP-04", func: "Exportar reporte", desc: "Genera y descarga el reporte configurado como PDF estructurado.", actores: "Administrador, Usuario BID" },
    ],
  },
  {
    id: 5,
    nombre: "Administración › Usuarios",
    filas: [
      { id: "USR-01", func: "Listado de usuarios", desc: "Tabla de usuarios del sistema con nombre, correo, rol asignado y estado activo.", actores: "Administrador" },
      { id: "USR-02", func: "Crear usuario", desc: "Modal para registrar un nuevo usuario con nombre, correo, contraseña, país y rol.", actores: "Administrador" },
      { id: "USR-03", func: "Editar usuario", desc: "Modal pre-llenado para modificar los datos de un usuario existente.", actores: "Administrador" },
      { id: "USR-04", func: "Activar / Desactivar usuario", desc: "Cambia el estado activo de un usuario sin eliminarlo del sistema.", actores: "Administrador" },
    ],
  },
  {
    id: 6,
    nombre: "Administración › Catálogos",
    filas: [
      { id: "CAT-01", func: "Listado de catálogos", desc: "Vista de los catálogos disponibles: Países, Sectores, Tipos de barrera, Tipos de trámite, Roles y Sectores geográficos.", actores: "Administrador" },
      { id: "CAT-02", func: "Ítems de catálogo", desc: "Tabla de registros de un catálogo genérico con su estado activo o inactivo.", actores: "Administrador" },
      { id: "CAT-03", func: "Agregar ítem", desc: "Campo de texto para añadir un nuevo registro a un catálogo genérico.", actores: "Administrador" },
      { id: "CAT-04", func: "Editar ítem", desc: "Modal para modificar el nombre de un registro existente en un catálogo genérico.", actores: "Administrador" },
      { id: "CAT-05", func: "Activar / Desactivar ítem", desc: "Cambia el estado activo de un registro de catálogo sin eliminarlo.", actores: "Administrador" },
      { id: "CAT-06", func: "Gestión de roles", desc: "Tabla de roles con nombre, descripción y estado, accesible desde el catálogo Roles.", actores: "Administrador" },
      { id: "CAT-07", func: "Agregar rol", desc: "Modal para crear un nuevo rol con nombre y descripción.", actores: "Administrador" },
      { id: "CAT-08", func: "Editar rol", desc: "Modal para modificar el nombre y la descripción de un rol existente.", actores: "Administrador" },
      { id: "CAT-09", func: "Gestionar permisos de rol", desc: "Matriz de permisos por acción para un rol seleccionado, con toggles para activar o desactivar cada permiso.", actores: "Administrador" },
    ],
  },
];

function DocumentacionScreen() {
  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header
        breadcrumb="Documentación del Sistema"
        title="Documentación del Sistema"
        subtitle="Catálogo de casos de uso y funcionalidades por módulo"
      />
      <div className="flex flex-col gap-10 mt-2">
        {DOC_MODULES.map(mod => (
          <section key={mod.id}>
            {/* Module heading */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: C.alto + "1A", color: C.alto, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.04em" }}>
                {mod.id < 10 ? `0${mod.id}` : mod.id}
              </span>
              <h2 className="text-[17px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>
                {mod.nombre}
              </h2>
            </div>
            <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.canvas }}>
                    {["ID", "Funcionalidad", "Descripción detallada", "Actores"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-widest"
                        style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mod.filas.map((fila, i) => (
                    <tr key={fila.id} style={{ borderBottom: i < mod.filas.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded"
                          style={{ backgroundColor: C.steel3 + "18", color: C.steel3, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.04em" }}>
                          {fila.id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold whitespace-nowrap"
                        style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>
                        {fila.func}
                      </td>
                      <td className="px-5 py-3.5 text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 480 }}>
                        {fila.desc}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] whitespace-nowrap" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>
                        {fila.actores}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────
function PlaceholderScreen({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Globe size={48} color={C.textMuted} />
      <h2 className="text-[22px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{label}</h2>
      <p className="text-[15px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>En construcción</p>
    </div>
  );
}

function RevisionLoadingFallback() {
  return (
    <div className="p-8" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: C.textMuted }}>
      Cargando…
    </div>
  );
}

// ─── Revisión: identidad "demo" por rol ────────────────────────────────────────
// No hay sistema de usuarios real todavía: cada UserRole de sesión se mapea a un
// id fijo para poder probar la matriz de visibilidad de src/app/revision/store.tsx
// (Asesor ve solo lo suyo, Analista ve su Etapa 3 + lectura de lo suyo, etc.)
const REVISION_DEMO_USER_ID: Record<UserRole, string> = {
  administrador: "demo-admin",
  "usuario-bid": "demo-bid",
  asesor: "demo-asesor",
  analista: "demo-analista",
  validador: "demo-validador",
};

// ─── Root ─────────────────────────────────────────────────────────────────────
// PeriodoAnalisisProvider envuelve toda la app (login incluido, aunque no lo
// necesite, mismo criterio simple que RevisionProvider) desde AFUERA de
// App(), porque a diferencia de RevisionProvider no depende de ningún
// estado de App() (userRole, etc.) para inicializarse.
export default function App() {
  return (
    <PeriodoAnalisisProvider>
      <AppInner />
    </PeriodoAnalisisProvider>
  );
}

function AppInner() {
  const isMobile = useIsMobile();
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("administrador");
  // TODO: shared country state is temporary — replace when the advisor-per-country flow is built
  const [activeCountry, setActiveCountry] = useState<Country>("Todos");
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [view, setView] = useState<View>({ screen: "panel-regional" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [recoveryEmail, setRecoveryEmail] = useState("ana.mejia@iadb.org");

  // No hay `return` temprano aquí a propósito: <RevisionProvider> (más abajo)
  // tiene que envolver TANTO la pantalla de login COMO la app logueada, en la
  // MISMA posición del árbol, para que "Salir" sea un simple cambio de estado
  // de sesión (como en un backend real) y no un desmonte/remonte del store
  // -- eso es justo el bug que se pidió arreglar: antes `loggedIn=false`
  // devolvía un JSX totalmente por fuera del Provider, así que un logout real
  // habría reseteado hallazgos/log_errores/notificaciones al volver a entrar.
  let authScreen: React.ReactNode = null;
  if (!loggedIn) {
    switch (authView) {
      case "login":
        authScreen = <LoginScreen onLogin={(role) => { setUserRole(role); setLoggedIn(true); }} onNavigate={setAuthView} />;
        break;
      case "recover":
        authScreen = <RecoverScreen email={recoveryEmail} setEmail={setRecoveryEmail} onNavigate={setAuthView} />;
        break;
      case "recover-sent":
        authScreen = <RecoverSentScreen email={recoveryEmail} onNavigate={setAuthView} />;
        break;
      case "recover-new":
        authScreen = <NewPasswordScreen email={recoveryEmail} onNavigate={setAuthView} />;
        break;
      case "recover-confirmed":
        authScreen = <PasswordConfirmedScreen onNavigate={setAuthView} />;
        break;
      case "recover-expired":
        authScreen = <LinkExpiredScreen onNavigate={setAuthView} />;
        break;
    }
  }

  // "Salir": cierra la sesión y vuelve al login -- limpia la navegación para
  // que el próximo login (con cualquiera de los 5 roles) arranque en el
  // dashboard, no en la pantalla de Revisión donde se haya quedado la sesión
  // anterior. Deliberadamente NO toca el estado de src/app/revision/store.tsx:
  // cerrar sesión no borra datos, igual que en un backend real.
  const handleLogout = () => {
    setLoggedIn(false);
    setAuthView("login");
    setView({ screen: "country-dashboard", country: "Bolivia" });
    setActiveSection("dashboard");
  };

  const navigate = (v: View) => {
    setView(v);
    setDrawerOpen(false);
    if (v.screen === "panel-regional") setActiveSection("dashboard");
    if (v.screen === "impacto-economico") setActiveSection("impacto-economico");
    if (v.screen === "country-dashboard") { setActiveSection("dashboard"); setActiveCountry(v.country as Country); }
    if (v.screen === "barreras" || v.screen === "barrera-detail") setActiveSection("barreras");
    if (v.screen === "tramites" || v.screen === "tramite-detail") setActiveSection("tramites");
    if (v.screen === "administracion") setActiveSection("administracion");
    if (v.screen === "reportes" || v.screen === "reporte-pdf") setActiveSection("reportes");
    if (v.screen === "documentacion") setActiveSection("documentacion");
    if (v.screen.startsWith("revision")) setActiveSection("revision");
    if (v.screen === "placeholder") {
      const label = (v as { screen: "placeholder"; label: string }).label;
      setActiveSection(label === "Comparativa" ? "comparativa" : label === "Impacto económico" ? "impacto-economico" : "repositorio");
    }
  };

  // Puente entre los screens de src/app/revision/* (que no conocen el tipo `View`
  // completo de este archivo) y `navigate`. Los screens todavía no construidos
  // (ej. revision-decision-final, Lote 5) caen al default y solo hacen console.log
  // -- así ningún botón ya wireado puede llevar a un case inexistente del switch
  // de renderView() y mostrar pantalla en blanco.
  const revisionNavigate = (screen: string, id?: string) => {
    switch (screen) {
      case "revision-repositorio":
        navigate({ screen: "revision-repositorio" });
        return;
      case "revision-asesor-detalle":
        navigate({ screen: "revision-asesor-detalle", id: id ?? "demo" });
        return;
      case "revision-analista-checklist":
        navigate({ screen: "revision-analista-checklist", id: id ?? "demo" });
        return;
      case "revision-decision-final":
        navigate({ screen: "revision-decision-final", id: id ?? "demo" });
        return;
      case "revision-ajuste":
        navigate({ screen: "revision-ajuste", id: id ?? "demo" });
        return;
      case "revision-devolver-analista":
        navigate({ screen: "revision-devolver-analista", id: id ?? "demo" });
        return;
      case "revision-ver-hallazgo":
        navigate({ screen: "revision-ver-hallazgo", id: id ?? "demo" });
        return;
      case "revision-log-errores":
        navigate({ screen: "revision-log-errores" });
        return;
      case "revision-notificaciones":
        navigate({ screen: "revision-notificaciones" });
        return;
      default:
        console.log("[revision] navegación aún no implementada:", screen, id);
    }
  };

  const renderView = () => {
    switch (view.screen) {
      case "panel-regional": return <PanelRegional onNavigate={navigate} />;
      case "impacto-economico": return <ImpactoEconomico country={activeCountry} onCountryChange={c => setActiveCountry(c)} onNavigate={navigate} />;
      case "country-dashboard": return <CountryDashboard country={view.country} onCountryChange={c => { setActiveCountry(c); navigate({ screen: "country-dashboard", country: c === "Todos" ? "Bolivia" : c }); }} onNavigate={navigate} />;
      case "barreras": return <BarrerasScreen initialSector={view.sector} country={activeCountry} onCountryChange={c => setActiveCountry(c)} onNavigate={navigate} />;
      case "barrera-detail": return <BarreraDetail id={view.id} onNavigate={navigate} />;
      case "tramites": return <TramitesScreen country={activeCountry} onCountryChange={c => setActiveCountry(c)} onNavigate={navigate} />;
      case "tramite-detail": return <TramiteDetail id={view.id} onNavigate={navigate} />;
      case "distorsion-detail": return <DistorsionDetail id={view.id} onNavigate={navigate} />;
      case "indice": return <IndiceIDR country={activeCountry} onCountryChange={c => setActiveCountry(c)} onNavigate={navigate} />;
      case "hallazgos-filtrados": {
        // Label legible por cada key de filtro soportada -- "jerarquia" y
        // "estadoProcesamiento" llegan de un clic en gráfica de PanelRegional.tsx;
        // "sector"/"entidad"/"anioDesde"/"anioHasta" se agregan desde la barra de
        // filtros de esta misma pantalla (ver HallazgosFiltrados.tsx) -- misma
        // fuente (filtros/chips y los <select> de la barra son dos vistas del
        // mismo view.filtros). "estructura" y "anioDesde"/"anioHasta" llegan
        // también de un clic en gráfica de Panel País (CountryDashboard).
        const FILTRO_LABELS: Record<string, string> = {
          jerarquia: "Jerarquía",
          estadoProcesamiento: "Estado de procesamiento",
          sector: "Sector",
          entidad: "Entidad emisora",
          anioDesde: "Año desde",
          anioHasta: "Año hasta",
          estructura: "Estructura",
        };
        const filtrosObj = view.filtros;
        const filtrosArr = Object.entries(filtrosObj).map(([key, value]) => ({ key, value, label: FILTRO_LABELS[key] ?? key }));
        // anioDesde/anioHasta son rango (sobre el campo `año`), no igualdad
        // exacta como el resto de las keys de filtro.
        const resultados = INSTRUMENTOS_MUESTRA.filter(instr => {
          const rec = instr as unknown as Record<string, string | number>;
          return Object.entries(filtrosObj).every(([key, value]) => {
            if (key === "anioDesde") return instr.año >= Number(value);
            if (key === "anioHasta") return instr.año <= Number(value);
            return String(rec[key]) === value;
          });
        });
        // Setea/reemplaza una key de filtro (vacío = quitarla) -- usado tanto
        // por la X de un chip como por un <select> de la barra de filtros, así
        // que ambos leen y escriben el mismo view.filtros (una sola fuente).
        const setFiltro = (key: string, value: string) => {
          if (!value) {
            const next = { ...filtrosObj };
            delete next[key];
            navigate({ screen: "hallazgos-filtrados", filtros: next });
            return;
          }
          navigate({ screen: "hallazgos-filtrados", filtros: { ...filtrosObj, [key]: value } });
        };
        return (
          <HallazgosFiltrados
            filtros={filtrosArr}
            resultados={resultados}
            onSetFiltro={setFiltro}
            onQuitarFiltro={(key) => setFiltro(key, "")}
            onLimpiarTodos={() => navigate({ screen: "hallazgos-filtrados", filtros: {} })}
            onNavigate={navigate}
          />
        );
      }
      case "hallazgos-filtrados-barreras": {
        // Label legible por cada key de filtro soportada -- llegan de un clic
        // en gráfica de Barreras (BarrerasPorPaisCard/MatrizRegional/
        // BarrerasPorJerarquiaCard/"Canales de transmisión económica"/
        // "Barreras con afectación MIPYME", Regional y por país -- estas 2
        // últimas solo existen en la vista por país hoy, no en Regional) o de
        // la barra de filtros de esta pantalla (ver HallazgosFiltradosBarreras.tsx).
        // TODO: ALL_BARRERAS es un catálogo de 17 registros de muestra, muy
        // chico frente a los totales agregados que muestran esas gráficas
        // (COUNTRY_BARRERAS_DATA) -- el filtro resultante puede traer muchos
        // menos resultados de los que el número en la gráfica sugiere, mismo
        // criterio ya aceptado para Instrumentos (INSTRUMENTOS_MUESTRA vs.
        // los totales por país de Panel País).
        const FILTRO_LABELS: Record<string, string> = {
          pais: "País",
          sector: "Sector",
          entidad: "Entidad emisora",
          clasificacion: "Clasificación",
          subdimension: "Subdimensión",
          jerarquia: "Jerarquía",
          severidad: "Severidad",
          canalTransmision: "Canal de transmisión",
          afectacionMipyme: "Afectación MIPYME",
          accionCategoria: "Categoría de acción sugerida",
        };
        const filtrosObj = view.filtros;
        const filtrosArr = Object.entries(filtrosObj).map(([key, value]) => ({ key, value, label: FILTRO_LABELS[key] ?? key }));
        const resultados = ALL_BARRERAS.filter(b => {
          const rec = b as unknown as Record<string, string>;
          return Object.entries(filtrosObj).every(([key, value]) => String(rec[key]) === value);
        });
        const setFiltro = (key: string, value: string) => {
          if (!value) {
            const next = { ...filtrosObj };
            delete next[key];
            navigate({ screen: "hallazgos-filtrados-barreras", filtros: next });
            return;
          }
          navigate({ screen: "hallazgos-filtrados-barreras", filtros: { ...filtrosObj, [key]: value } });
        };
        return (
          <HallazgosFiltradosBarreras
            filtros={filtrosArr}
            resultados={resultados}
            onSetFiltro={setFiltro}
            onQuitarFiltro={(key) => setFiltro(key, "")}
            onLimpiarTodos={() => navigate({ screen: "hallazgos-filtrados-barreras", filtros: {} })}
            onNavigate={navigate}
          />
        );
      }
      case "hallazgos-filtrados-tramites": {
        // Label legible por cada key de filtro soportada -- "entidad",
        // "tipoUsuario", "etapaCiclo", "canalTransmision", "afectacionMipyme",
        // "tipoAfectacion", "tipoCarga", "subdimension" y "accionCategoria"
        // llegan de un clic en gráfica de Trámites (Regional y por país),
        // Índice/IDR o Impacto Económico; "pais"/"sector"/"severidad" desde
        // la barra de filtros de esta pantalla (ver
        // HallazgosFiltradosTramites.tsx). "accionCategoria" es la categoría
        // corta (Simplificar/Digitalizar/...) -- distinta de
        // tramite.accionSugerida, la descripción larga que ya usan las tablas.
        const FILTRO_LABELS: Record<string, string> = {
          pais: "País",
          sector: "Sector",
          entidad: "Entidad",
          severidad: "Severidad",
          tipoUsuario: "Tipo de usuario",
          etapaCiclo: "Etapa del ciclo",
          canalTransmision: "Canal de transmisión",
          afectacionMipyme: "Afectación MIPYME",
          tipoAfectacion: "Tipo de afectación",
          tipoCarga: "Tipo de carga",
          subdimension: "Subdimensión",
          accionCategoria: "Categoría de acción sugerida",
        };
        const filtrosObj = view.filtros;
        const filtrosArr = Object.entries(filtrosObj).map(([key, value]) => ({ key, value, label: FILTRO_LABELS[key] ?? key }));
        // "tipoUsuario" filtra sobre el campo `tipo` y "etapaCiclo" sobre
        // `etapa` de ALL_TRAMITES -- mismos campos, nombre de filtro distinto.
        const CAMPO_POR_FILTRO_TRAMITES: Record<string, string> = { tipoUsuario: "tipo", etapaCiclo: "etapa" };
        const resultados = ALL_TRAMITES.filter(t => {
          const rec = t as unknown as Record<string, string>;
          return Object.entries(filtrosObj).every(([key, value]) => {
            const campo = CAMPO_POR_FILTRO_TRAMITES[key] ?? key;
            return String(rec[campo]) === value;
          });
        });
        const setFiltro = (key: string, value: string) => {
          if (!value) {
            const next = { ...filtrosObj };
            delete next[key];
            navigate({ screen: "hallazgos-filtrados-tramites", filtros: next });
            return;
          }
          navigate({ screen: "hallazgos-filtrados-tramites", filtros: { ...filtrosObj, [key]: value } });
        };
        return (
          <HallazgosFiltradosTramites
            filtros={filtrosArr}
            resultados={resultados}
            onSetFiltro={setFiltro}
            onQuitarFiltro={(key) => setFiltro(key, "")}
            onLimpiarTodos={() => navigate({ screen: "hallazgos-filtrados-tramites", filtros: {} })}
            onNavigate={navigate}
          />
        );
      }
      case "administracion": {
        const adminTab = (view as { screen: "administracion"; tab?: string }).tab ?? "usuarios";
        if (adminTab === "catalogos") return <AdminCatalogosScreen />;
        if (adminTab === "fuentes") return <AdminFuentesScreen />;
        if (adminTab === "bitacora") return <AdminBitacoraScreen />;
        return <AdminUsuariosScreen />;
      }
      case "reportes": return <ReportesScreen prefill={(view as { screen: "reportes"; prefill?: ReportesPrefill }).prefill} onNavigate={navigate} />;
      case "reporte-pdf": return <ReportePDFScreen context={(view as { screen: "reporte-pdf"; context?: string }).context} onNavigate={navigate} />;
      case "documentacion": return <DocumentacionScreen />;
      case "revision-repositorio":
        return (
          <Suspense fallback={<RevisionLoadingFallback />}>
            <RevisionRepositorio
              userRole={userRole}
              userId={REVISION_DEMO_USER_ID[userRole]}
              onNavigate={revisionNavigate}
            />
          </Suspense>
        );
      case "revision-triage-modales":
        return <Suspense fallback={<RevisionLoadingFallback />}><RevisionTriageModalesDemo /></Suspense>;
      case "revision-asesor-detalle":
        return (
          <Suspense fallback={<RevisionLoadingFallback />}>
            <RevisionAsesorDetalle
              id={view.id}
              onBack={() => navigate({ screen: "revision-repositorio" })}
              onReject={() => navigate({ screen: "revision-repositorio" })}
              onAccept={() => navigate({ screen: "revision-repositorio" })}
            />
          </Suspense>
        );
      case "revision-analista-checklist":
        return (
          <Suspense fallback={<RevisionLoadingFallback />}>
            <RevisionAnalistaChecklist
              id={view.id}
              onBack={() => navigate({ screen: "revision-repositorio" })}
              onSave={() => console.log("guardar avance")}
              onSend={() => navigate({ screen: "revision-repositorio" })}
            />
          </Suspense>
        );
      case "revision-decision-final":
        return (
          <Suspense fallback={<RevisionLoadingFallback />}>
            <RevisionDecisionFinal
              id={view.id}
              onBack={() => navigate({ screen: "revision-repositorio" })}
              onResuelto={() => navigate({ screen: "revision-repositorio" })}
              onAjustar={() => navigate({ screen: "revision-ajuste", id: view.id })}
              onDevolver={() => navigate({ screen: "revision-devolver-analista", id: view.id })}
            />
          </Suspense>
        );
      case "revision-ajuste":
        return (
          <Suspense fallback={<RevisionLoadingFallback />}>
            <RevisionAjuste
              id={view.id}
              onCancel={() => navigate({ screen: "revision-decision-final", id: view.id })}
              onSave={() => navigate({ screen: "revision-decision-final", id: view.id })}
            />
          </Suspense>
        );
      case "revision-devolver-analista":
        return (
          <Suspense fallback={<RevisionLoadingFallback />}>
            <RevisionDevolverAnalista
              id={view.id}
              onCancel={() => navigate({ screen: "revision-decision-final", id: view.id })}
              onDevuelto={() => navigate({ screen: "revision-repositorio" })}
            />
          </Suspense>
        );
      case "revision-ver-hallazgo":
        return (
          <Suspense fallback={<RevisionLoadingFallback />}>
            <RevisionVerHallazgo
              id={view.id}
              userId={REVISION_DEMO_USER_ID[userRole]}
              canDecide={userRole === "validador" || userRole === "administrador"}
              onNavigate={revisionNavigate}
            />
          </Suspense>
        );
      case "revision-log-errores":
        return <Suspense fallback={<RevisionLoadingFallback />}><RevisionLogErrores /></Suspense>;
      case "revision-notificaciones":
        return (
          <Suspense fallback={<RevisionLoadingFallback />}>
            <RevisionNotificaciones onBack={() => navigate({ screen: "revision-repositorio" })} />
          </Suspense>
        );
      case "placeholder": return <PlaceholderScreen label={view.label} />;
    }
  };

  const sidebarProps = {
    activeCountry,
    activeSection, setActiveSection,
    activeView: view, userRole, setUserRole, onNavigate: navigate,
    onLogout: handleLogout,
  };

  return (
    <RevisionProvider currentUserId={REVISION_DEMO_USER_ID[userRole]} onNavigate={revisionNavigate}>
    {!loggedIn ? authScreen : (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: C.canvas, fontFamily: "IBM Plex Sans, sans-serif" }}>
      {/* Mobile sticky header */}
      {isMobile && (
        <header className="flex items-center justify-between px-4 h-14 flex-shrink-0 z-30" style={{ backgroundColor: C.sidebar }}>
          <div className="flex items-center gap-2">
            <span className="text-white text-[18px] tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, letterSpacing: 3 }}>RegLAC</span>
          </div>
          <button onClick={() => setDrawerOpen(!drawerOpen)} style={{ background: "none", border: "none", color: "#8FA3BA", padding: 8 }}>
            {drawerOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        {!isMobile && (
          <Sidebar {...sidebarProps} />
        )}
        {/* Mobile drawer */}
        {isMobile && (
          <Sidebar {...sidebarProps} isDrawerOpen={drawerOpen} onDrawerClose={() => setDrawerOpen(false)} />
        )}
        <div className="flex-1 overflow-hidden">
          {renderView()}
        </div>
      </div>
    </div>
    )}
    </RevisionProvider>
  );
}
