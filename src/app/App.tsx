import { useState, useEffect } from "react";
import { PanelTipoSubdimension } from "./components/ui/PanelTipoSubdimension";
import type { TipoDato } from "./components/ui/PanelTipoSubdimension";
import { BarrasComposicion } from "./components/ui/BarrasComposicion";
import type { BarrasComposicionCategoria } from "./components/ui/BarrasComposicion";
import {
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Bell,
  Download,
  FileText,
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
type Country = "Todos" | "Argentina" | "Bolivia" | "Chile" | "Ecuador" | "Perú";
type Section = "dashboard" | "barreras" | "tramites" | "comparativa" | "repositorio" | "administracion" | "reportes" | "documentacion" | "revision";
type UserRole = "administrador" | "usuario-bid" | "asesor" | "analista" | "validador";
type View =
  | { screen: "regional-dashboard" }
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
  | { screen: "revision-asesor-detalle"; id: string }
  | { screen: "revision-analista-checklist"; id: string }
  | { screen: "revision-decision-final"; id: string }
  | { screen: "revision-ajuste"; id: string }
  | { screen: "revision-devolver-analista"; id: string }
  | { screen: "revision-candados"; id: string }
  | { screen: "revision-log-errores" }
  | { screen: "revision-log-errores-detalle"; id: string };
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
export const C = {
  canvas: "#EDF1F5",
  card: "#FAFBFC",
  sidebar: "#14161A",
  critico: "#C75450",
  alto: "#26456B",
  mediano: "#3E6E9E",
  bajo: "#7FA8D4",
  steel1: "#7FA8D4",
  steel2: "#5E8FC2",
  steel3: "#3E6E9E",
  steel4: "#26456B",
  border: "#DCE3EB",
  text: "#14161A",
  textMuted: "#6B7A8D",
  ambar1: "#D9A441",
  ambar2: "#F6EBD6",
  ambarTexto: "#8A5A12",
  verde1: "#3B6D11",
  verde2: "#E7F1DC",
  rojoClaro: "#F7E4E3",
};

const SEVERITY_COLOR: Record<string, string> = {
  Crítico: C.critico,
  Alto: C.alto,
  Mediano: C.mediano,
  Bajo: C.bajo,
};

// Rampa categórica — rankings y series sin semántica de severidad
const CAT = ["#26456B", "#3E6E9E", "#5E8FC2", "#7FA8D4", "#A0C1E0"];

// ─── Data ─────────────────────────────────────────────────────────────────────
const COUNTRY_DATA: Record<string, { barreras: number; criticas: number; tramites: number; costo: string; sectores: number }> = {
  Argentina: { barreras: 698, criticas: 94, tramites: 312, costo: "USD 13.1 M", sectores: 6 },
  Bolivia:   { barreras: 632, criticas: 87, tramites: 428, costo: "USD 11.2 M", sectores: 6 },
  Chile:     { barreras: 445, criticas: 48, tramites: 195, costo: "USD 7.1 M",  sectores: 4 },
  Ecuador:   { barreras: 581, criticas: 68, tramites: 221, costo: "USD 11.7 M", sectores: 6 },
  Perú:      { barreras: 534, criticas: 56, tramites: 280, costo: "USD 9.4 M",  sectores: 5 },
};

const COUNTRY_COLORS: Record<string, string> = {
  Argentina: C.critico,
  Bolivia:   C.alto,
  Ecuador:   C.mediano,
  Perú:      C.steel2,
  Chile:     C.bajo,
};

const DONUT_CRITICAS = [
  { name: "Argentina", value: 94, color: CAT[0] },
  { name: "Bolivia",   value: 91, color: CAT[1] },
  { name: "Ecuador",   value: 62, color: CAT[2] },
  { name: "Perú",      value: 50, color: CAT[3] },
  { name: "Chile",     value: 44, color: CAT[4] },
];

const DONUT_COSTO = [
  { name: "Argentina", value: 13.1, color: CAT[0] },
  { name: "Ecuador",   value: 11.7, color: CAT[1] },
  { name: "Bolivia",   value: 11.2, color: CAT[2] },
  { name: "Perú",      value: 9.4,  color: CAT[3] },
  { name: "Chile",     value: 7.1,  color: CAT[4] },
];

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

const HN_SEVERITY = [
  { name: "Crítico", value: 91, color: C.critico },
  { name: "Alto", value: 229, color: C.alto },
  { name: "Mediano", value: 59, color: C.mediano },
  { name: "Bajo", value: 18, color: C.bajo },
];

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
const BARRERAS_CAFE = [
  {
    id: "bloqueo-renovacion",
    titulo: "Bloqueo por Renovación de Registros",
    severidad: "Crítico",
    sector: "Agroindustria Cafetalera",
    instrumento: "Reglamento General de Registros Sanitarios",
    tramitesAfectados: ["cert-exportacion", "registro-sanitario"],
    clasificacion: "Operación",
    jerarquia: "Reglamentario",
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
    jerarquia: "Legal",
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
    jerarquia: "Reglamentario",
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

const ALL_TRAMITES = [...TRAMITES_CAFE, ...TRAMITES_TEXTIL];
const ALL_BARRERAS = [...BARRERAS_CAFE, ...BARRERAS_TEXTIL];

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

const DONUT_SECTOR = [
  { name: "Construcción", value: 92, color: CAT[0] },
  { name: "Financiero",   value: 78, color: CAT[1] },
  { name: "Autopartes",   value: 71, color: CAT[2] },
  { name: "Café",         value: 64, color: CAT[3] },
  { name: "Textil",       value: 56, color: CAT[4] },
  { name: "Fibras",       value: 36, color: "#BDD0DD" },
];

// Sorted desc by value — used for horizontal ranking bars
const RANKING_CRITICAS = [...DONUT_CRITICAS].sort((a, b) => b.value - a.value);
const RANKING_SECTOR    = [...DONUT_SECTOR].sort((a, b) => b.value - a.value);

const JERARQUIA_NORMATIVA_DATA: BarrasComposicionCategoria[] = [
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

const COUNTRY_BARRERAS_DATA: Record<Country, {
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

const BARRERAS_CRITICAS_LIST = [
  { instrumento: "Reglamento Gral. Registros Sanitarios", tipo: "Restricción de mercado local",         pais: "Bolivia",    costo: 4.2 },
  { instrumento: "Decreto PCM-027-2022",                  tipo: "Autorización ex-ante por lote",        pais: "Bolivia",    costo: 4.1 },
  { instrumento: "Ley del Sistema Financiero",            tipo: "Registros superpuestos",               pais: "Argentina",  costo: 3.9 },
  { instrumento: "Reglamento SENASA",                     tipo: "Obligación de reporte físico",         pais: "Ecuador",    costo: 3.7 },
  { instrumento: "Decreto 1188-A",                        tipo: "Requisito de planta propia",           pais: "Bolivia",    costo: 3.5 },
  { instrumento: "Ley ZOLI Art. 12",                      tipo: "Restricción de venta local",           pais: "Bolivia",    costo: 3.4 },
  { instrumento: "Res. IICA 2021-88",                     tipo: "Registro duplicado inter-agencias",    pais: "Ecuador",    costo: 3.2 },
  { instrumento: "Decreto Ejecutivo 447",                 tipo: "Monopolio de distribución",            pais: "Argentina",  costo: 3.1 },
  { instrumento: "Ley 843 Art. 92",                       tipo: "Tasa de habilitación excesiva",        pais: "Bolivia",    costo: 2.9 },
  { instrumento: "Código de Comercio Art. 88",            tipo: "Reserva de actividad",                 pais: "Ecuador",    costo: 2.8 },
  { instrumento: "Regl. Aduanero CAC",                    tipo: "Canal rojo obligatorio",               pais: "Perú",       costo: 2.7 },
  { instrumento: "Ley de Telecomunicaciones",             tipo: "Monopolio de espectro",                pais: "Chile",      costo: 2.6 },
  { instrumento: "Decreto 2891 Arg.",                     tipo: "Aprobación ministerial previa",        pais: "Argentina",  costo: 2.4 },
  { instrumento: "Res. MEM-0012",                         tipo: "Contrato mínimo de 5 años",            pais: "Perú",       costo: 2.3 },
  { instrumento: "NOM-SFP-2022",                          tipo: "Certificación redundante",             pais: "Ecuador",    costo: 2.1 },
  { instrumento: "Ley Inversión Extranjera Art. 5",       tipo: "Tope de capital mínimo",               pais: "Argentina",  costo: 2.0 },
  { instrumento: "Reglamento SENAVEX",                    tipo: "Visado físico obligatorio",            pais: "Bolivia",    costo: 1.9 },
  { instrumento: "Decreto MEFP-044",                      tipo: "Declaración presencial requerida",     pais: "Bolivia",    costo: 1.8 },
];

const TRAMITES_PRIORITARIOS_LIST = [
  { tramite: "Permiso de Construcción",         pais: "Argentina", tipo: "Empresarial", costo: "$4.2M" },
  { tramite: "Registro Sanitario",              pais: "Ecuador",   tipo: "Empresarial", costo: "$4.2M" },
  { tramite: "Licencia de Operación",           pais: "Bolivia",   tipo: "Empresarial", costo: "$4.2M" },
  { tramite: "Apertura de Empresa",             pais: "Argentina", tipo: "Empresarial", costo: "$3.9M" },
  { tramite: "Certificado de Exportación",      pais: "Bolivia",   tipo: "Empresarial", costo: "$3.7M" },
  { tramite: "Habilitación Sanitaria",          pais: "Ecuador",   tipo: "Empresarial", costo: "$3.5M" },
  { tramite: "Inscripción Tributaria",          pais: "Perú",      tipo: "Ciudadano",   costo: "$3.2M" },
  { tramite: "Declaración Aduanera",            pais: "Chile",     tipo: "Empresarial", costo: "$3.1M" },
  { tramite: "Permiso Ambiental",               pais: "Argentina", tipo: "Empresarial", costo: "$2.9M" },
  { tramite: "Registro de Marca",               pais: "Bolivia",   tipo: "Empresarial", costo: "$2.7M" },
  { tramite: "Carnet de Salud",                 pais: "Perú",      tipo: "Ciudadano",   costo: "$2.5M" },
  { tramite: "Declaración ISV Mensual",         pais: "Bolivia",   tipo: "Empresarial", costo: "$2.3M" },
  { tramite: "Solicitud de Crédito PYME",       pais: "Ecuador",   tipo: "Empresarial", costo: "$2.1M" },
  { tramite: "Registro de Propiedad",           pais: "Argentina", tipo: "Ciudadano",   costo: "$1.9M" },
  { tramite: "Permiso de Trabajo",              pais: "Chile",     tipo: "Ciudadano",   costo: "$1.7M" },
  { tramite: "Licencia de Conducir Comercial",  pais: "Perú",      tipo: "Ciudadano",   costo: "$1.5M" },
  { tramite: "Certificado Fitosanitario",       pais: "Ecuador",   tipo: "Empresarial", costo: "$1.4M" },
  { tramite: "Habilitación de Vehículo Carga",  pais: "Argentina", tipo: "Empresarial", costo: "$1.2M" },
];

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

// ─── Utilities ────────────────────────────────────────────────────────────────
function SeverityBadge({ level }: { level: string }) {
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

function BandaCobertura({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-lg"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 14, fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, lineHeight: 1.4 }}>
        {text}
      </span>
    </div>
  );
}

function KpiCard({ label, value, valueSuffix, sub, valueColor, tooltip }: {
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

function DonutChart({ data, total, label }: { data: { name: string; value: number; color: string }[]; total: string; label: string }) {
  return (
    <div className="flex gap-6 items-center">
      <div className="relative" style={{ width: 120, height: 120 }}>
        <PieChart width={120} height={120}>
          <Pie data={data} cx={55} cy={55} innerRadius={36} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[18px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{total}</span>
          <span className="text-[9px] uppercase tracking-wide" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{label}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span style={{ color: C.text }}>{d.name}</span>
            </div>
            <span className="font-medium" style={{ color: C.text }}>{d.value}</span>
          </div>
        ))}
      </div>
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
  isDrawerOpen?: boolean;
  onDrawerClose?: () => void;
}) {
  const isMobile = useIsMobile();
  const [adminOpen, setAdminOpen] = useState(activeView.screen === "administracion");
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
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke={C.steel2} strokeWidth="1.5" />
            <circle cx="14" cy="14" r="8" stroke={C.steel3} strokeWidth="1" />
            <circle cx="14" cy="14" r="3" fill={C.steel2} />
          </svg>
          <span className="text-white text-[22px] tracking-wider" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, letterSpacing: 3 }}>ALEPH</span>
        </div>
        {isMobile && (
          <button onClick={onDrawerClose} style={{ background: "none", border: "none", color: "#8FA3BA" }}>
            <X size={22} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItem("Panorama", "dashboard", <BarChart2 size={18} />, () => nav(() => {
          if (activeCountry === "Todos") onNavigate({ screen: "regional-dashboard" });
          else onNavigate({ screen: "country-dashboard", country: activeCountry });
        }))}
        {navItem("Barreras", "barreras", <AlertTriangle size={18} />, () => nav(() => onNavigate({ screen: "barreras" })))}
        {navItem("Trámites", "tramites", <FileText size={18} />, () => nav(() => onNavigate({ screen: "tramites" })))}
        {navItem("Reportes", "reportes", <ClipboardList size={18} />, () => nav(() => onNavigate({ screen: "reportes" })))}
        {navItem("Documentación", "documentacion", <BookOpen size={18} />, () => nav(() => onNavigate({ screen: "documentacion" })))}
        {/* Revisión — visible para asesor, analista, validador y administrador */}
        {(userRole === "asesor" || userRole === "analista" || userRole === "validador" || userRole === "administrador") &&
          navItem("Revisión", "revision", <ClipboardCheck size={18} />, () => nav(() => onNavigate({ screen: "revision-repositorio" })))
        }
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
            <p className="text-[11px]" style={{ color: "#5A6A7A", fontFamily: "IBM Plex Sans, sans-serif" }}>{userRole === "administrador" ? "Administrador" : "Usuario BID"}</p>
          </div>
        </div>
        <button className="flex items-center gap-3 text-[#8FA3BA] hover:text-white transition-colors" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 15, background: "none", border: "none" }}>
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
// Shared button style helpers for header actions — used by each screen's actions prop
export const HDR_BTN_PRIMARY: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  backgroundColor: C.text, color: "#FAFBFC",
  fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600,
  border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", whiteSpace: "nowrap",
};
export const HDR_BTN_SECONDARY: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  backgroundColor: "transparent", color: C.text,
  fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 500,
  border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer", whiteSpace: "nowrap",
};

export function Header({ breadcrumb, title, subtitle, actions }: { breadcrumb: string; title: string; subtitle?: string; actions?: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <div className="mb-5 md:mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] md:text-[11px] uppercase tracking-widest mb-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{breadcrumb}</p>
          <h1 className="text-[22px] md:text-[28px] font-semibold leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{title}</h1>
          {subtitle && <p className="text-[12px] md:text-[13px] mt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          {actions}
          {!isMobile && (
            <>
              <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: C.steel2 }}>
                <Bell size={16} color="white" />
              </button>
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

// ─── Helpers for RegionalDashboard ────────────────────────────────────────────
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

function HorizontalRankingCard({ label, bars }: { label: string; bars: { name: string; value: number; color: string }[] }) {
  const maxVal = Math.max(...bars.map(b => b.value));
  return (
    <div className="rounded-lg p-6 h-full flex flex-col" style={{ backgroundColor: C.card }}>
      <p className="text-[11px] uppercase tracking-widest mb-5 font-medium leading-snug" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{label}</p>
      <div className="flex flex-col gap-3 flex-1 justify-center">
        {bars.map((b) => (
          <div key={b.name} className="flex items-center gap-3">
            <span className="flex-shrink-0 text-right text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, width: 76, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={b.name}>{b.name}</span>
            <div className="flex-1 rounded-full overflow-hidden" style={{ height: 12, backgroundColor: "#E6ECF3" }}>
              <div className="h-full rounded-full" style={{ width: `${(b.value / maxVal) * 100}%`, backgroundColor: b.color }} />
            </div>
            <span className="flex-shrink-0 text-right text-[12px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted, width: 28 }}>{b.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Screen 1 — Regional Dashboard ────────────────────────────────────────────
function RegionalDashboard({ country = "Todos", onCountryChange, onNavigate }: { country?: Country; onCountryChange?: (c: Country) => void; onNavigate: (v: View) => void }) {
  const PAGE_SIZE = 10;
  const [barrerasPage, setBarrerasPage] = useState(0);
  const [tramitesPage, setTramitesPage] = useState(0);
  const barrerasPageCount = Math.ceil(BARRERAS_CRITICAS_LIST.length / PAGE_SIZE);
  const tramitesPageCount = Math.ceil(TRAMITES_PRIORITARIOS_LIST.length / PAGE_SIZE);
  const barrerasRows = BARRERAS_CRITICAS_LIST.slice(barrerasPage * PAGE_SIZE, (barrerasPage + 1) * PAGE_SIZE);
  const tramitesRows = TRAMITES_PRIORITARIOS_LIST.slice(tramitesPage * PAGE_SIZE, (tramitesPage + 1) * PAGE_SIZE);

  function Pagination({ page, count, onPage }: { page: number; count: number; onPage: (p: number) => void }) {
    if (count <= 1) return null;
    return (
      <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: C.border }}>
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
          {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)} de 91
        </span>
        <div className="flex gap-1.5">
          {[...Array(count)].map((_, i) => (
            <button key={i} onClick={() => onPage(i)}
              style={{
                width: 26, height: 26, borderRadius: 6, border: "none",
                backgroundColor: i === page ? C.steel4 : C.border,
                color: i === page ? "white" : C.textMuted,
                fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb="Regulaciones › Panorama" title="Panel Regional"
        actions={
          <button style={HDR_BTN_SECONDARY} onClick={() => onNavigate({ screen: "reporte-pdf", context: JSON.stringify({ tipo: "estrategico", pais: country, fecha: new Date().toLocaleString("es-BO") }) })}>
            <Download size={13} /><span className="hidden sm:inline">Exportar PDF</span><span className="sm:hidden">PDF</span>
          </button>
        }
      />

      {/* Country selector — first control in filter bar */}
      {onCountryChange && (
        <div className="flex flex-wrap gap-2 mb-5">
          <select
            className="grow"
            style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, outline: "none", cursor: "pointer", minHeight: 36 }}
            value={country}
            onChange={e => onCountryChange(e.target.value as Country)}
          >
            <option value="Todos">Todos los países</option>
            <option value="Argentina">Argentina</option>
            <option value="Bolivia">Bolivia</option>
            <option value="Chile">Chile</option>
            <option value="Ecuador">Ecuador</option>
            <option value="Perú">Perú</option>
          </select>
        </div>
      )}

      <BandaCobertura text="1,842 instrumentos auditados · Periodo cubierto: enero 2015 – marzo 2026 · Última actualización: 12 de marzo de 2026" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Instrumentos auditados" value="1,842" sub="leyes, decretos, reglamentos" />
        <KpiCard label="Barreras identificadas" value="2,914" sub="en 5 países" />
        <KpiCard label="Trámites identificados" value="1,205" sub="ciudadanos y empresariales" />
        <KpiCard label="Barreras críticas" value="341" sub="atención inmediata" valueColor={C.critico} />
        <KpiCard
          label="Costo estimado de trámites"
          value="USD 48.6 M"
          sub="simulado · anual"
          valueColor={C.steel4}
          tooltip="Esta metodología mide el tiempo que le toma al solicitante todo el proceso de identificar los requerimientos de trámite, presentarlo ante una autoridad y esperar una resolución final; no contempla costos financieros, como pagos de derechos o costo de insumos para preparar el trámite."
        />
      </div>

      {/* Charts row — 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-stretch">
        <HorizontalRankingCard
          label="Ranking — Barreras críticas por país"
          bars={RANKING_CRITICAS}
        />
        <BarrasComposicion
          label="Instrumentos por jerarquía normativa"
          total={1842}
          categorias={JERARQUIA_NORMATIVA_DATA}
        />
        <HorizontalRankingCard
          label="Barreras por sector"
          bars={RANKING_SECTOR}
        />
      </div>

      {/* ── BARRERAS REGULATORIAS ── */}
      <SectionDivider label="Barreras Regulatorias" />

      <BarrasComposicion
        label="Barreras por clasificación"
        total={397}
        categorias={CLASIFICACION_BARRERAS_DATA}
        className="mb-4"
      />

      <div className="rounded-lg overflow-hidden mb-6" style={{ backgroundColor: C.card }}>
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: C.border }}>
          <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
            Barreras prioritarias <span style={{ color: C.critico }}>(91)</span>
          </p>
          <button className="text-[11px] px-3 py-1 rounded-full font-medium" style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
            onClick={() => onNavigate({ screen: "barreras" })}>Ver todas</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Instrumento", "Tipo", "País", "Costo sim."].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {barrerasRows.map((row, i) => (
                <tr key={i} className="hover:bg-[#F4F7FB] transition-colors cursor-pointer" style={{ borderBottom: `1px solid ${C.border}` }}
                  onClick={() => onNavigate({ screen: "barreras" })}>
                  <td className="px-4 py-2.5 text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, maxWidth: 200 }}>{row.instrumento}</td>
                  <td className="px-4 py-2.5 text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 160 }}>{row.tipo}</td>
                  <td className="px-4 py-2.5 text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{row.pais}</td>
                  <td className="px-4 py-2.5 text-[12px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>${row.costo}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={barrerasPage} count={barrerasPageCount} onPage={setBarrerasPage} />
      </div>

      {/* ── TRÁMITES ── */}
      <SectionDivider label="Trámites" />

      <BarrasComposicion
        label="Carga por tipo"
        total={612}
        categorias={CARGA_TIPO_BOL_DATA}
        className="mb-4"
      />

      <div className="rounded-lg overflow-hidden mb-6" style={{ backgroundColor: C.card }}>
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: C.border }}>
          <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
            Trámites prioritarios <span style={{ color: C.steel3 }}>({TRAMITES_PRIORITARIOS_LIST.length})</span>
          </p>
          <button className="text-[11px] px-3 py-1 rounded-full font-medium" style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
            onClick={() => onNavigate({ screen: "tramites" })}>Ver todas</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Trámite", "País", "Tipo", "Costo"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tramitesRows.map((row, i) => (
                <tr key={i} className="hover:bg-[#F4F7FB] transition-colors cursor-pointer" style={{ borderBottom: `1px solid ${C.border}` }}
                  onClick={() => onNavigate({ screen: "tramites" })}>
                  <td className="px-4 py-2.5 text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, maxWidth: 200 }}>{row.tramite}</td>
                  <td className="px-4 py-2.5 text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{row.pais}</td>
                  <td className="px-4 py-2.5 text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{row.tipo}</td>
                  <td className="px-4 py-2.5 text-[12px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>{row.costo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={tramitesPage} count={tramitesPageCount} onPage={setTramitesPage} />
      </div>

      {/* Country cards */}
      <p className="text-[11px] uppercase tracking-widest mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Países activos</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(COUNTRY_DATA).map(([country, d]) => {
          const carga = COUNTRY_CARGA[country] ?? { total: 0, criticas: 0 };
          return (
            <div key={country} className="rounded-lg p-5 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
              onClick={() => onNavigate({ screen: "country-dashboard", country })}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{country}</span>
                <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: "#DCE6F2", color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif" }}>Vigente</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
                <div>
                  <p className="text-[20px] font-semibold leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{d.barreras}</p>
                  <p className="text-[10px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Barreras</p>
                </div>
                <div>
                  <p className="text-[20px] font-semibold leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.critico }}>{d.criticas}</p>
                  <p className="text-[10px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Críticas</p>
                </div>
                <div>
                  <p className="text-[20px] font-semibold leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{d.tramites}</p>
                  <p className="text-[10px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Trámites</p>
                </div>
                <div>
                  <p className="text-[13px] font-semibold leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>{d.costo}</p>
                  <p className="text-[10px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Costo sim.</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-t" style={{ borderColor: C.border }}>
                <span className="text-[10px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Carga (total / críticas)</span>
                <span className="text-[12px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>
                  {carga.total} / <span style={{ color: C.critico }}>{carga.criticas}</span>
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: C.border }}>
                <span className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{d.sectores} Sectores</span>
                <button className="text-[11px] px-4 py-1 rounded-full" style={{ backgroundColor: C.alto, color: "white", fontFamily: "IBM Plex Sans, sans-serif", border: "none" }}>Ver</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Screen 2 — Country Dashboard ─────────────────────────────────────────────
function CountryDashboard({ country, onCountryChange, onNavigate }: { country: string; onCountryChange?: (c: Country) => void; onNavigate: (v: View) => void }) {
  const d = COUNTRY_DATA[country];
  const [showSectors, setShowSectors] = useState(false);
  if (!d) return null;

  const countrySectors = COUNTRY_SECTORS[country] ?? HN_SECTORES.map(s => ({ ...s, analizado: true }));
  const analyzedSectors = countrySectors.filter(s => s.analizado);
  const PREVIEW_COUNT = 4;

  // ── Full sectors view ──────────────────────────────────────────────────────
  if (showSectors) return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <button className="flex items-center gap-1 text-[12px] mb-4" style={{ color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
        onClick={() => setShowSectors(false)}>← Volver a {country}</button>
      <p className="text-[11px] uppercase tracking-widest mb-1" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Regulaciones › Panorama › {country} › Sectores</p>
      <h1 className="text-[28px] font-semibold mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>Sectores — {country}</h1>
      <p className="text-[13px] mb-6" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{analyzedSectors.length} de {countrySectors.length} sectores con análisis activo</p>
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Sector", "Barreras", "Altas", "Críticas", "Trámites", "Estado", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {countrySectors.map((s, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, opacity: s.analizado ? 1 : 0.65 }}>
                <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{s.sector}</td>
                <td className="px-5 py-3 text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: s.analizado ? C.text : C.textMuted }}>{s.analizado ? s.barreras : "—"}</td>
                <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "Space Grotesk, sans-serif", color: s.analizado ? C.alto : C.textMuted }}>{s.analizado ? s.altas : "—"}</td>
                <td className="px-5 py-3 text-[13px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: s.analizado ? C.critico : C.textMuted }}>{s.analizado ? s.criticas : "—"}</td>
                <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "Space Grotesk, sans-serif", color: s.analizado ? C.text : C.textMuted }}>{s.analizado ? s.tramites : "—"}</td>
                <td className="px-5 py-3">
                  {s.analizado ? (
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#E6F4EA", color: "#2D7A3A", fontFamily: "IBM Plex Sans, sans-serif" }}>Analizado</span>
                  ) : (
                    <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: C.border, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>Sin análisis</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {s.analizado && (
                    <button className="text-[11px] flex items-center gap-1" style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
                      onClick={() => onNavigate({ screen: "barreras", sector: s.sector })}>
                      Ver barreras <ChevronRight size={12} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );


  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb={`Regulaciones › Panorama › ${country}`} title={country} subtitle="Análisis activo · Actualizado marzo 2026"
        actions={
          <button style={HDR_BTN_SECONDARY} onClick={() => onNavigate({ screen: "reporte-pdf", context: JSON.stringify({ tipo: "estrategico", pais: country, fecha: new Date().toLocaleString("es-BO") }) })}>
            <Download size={13} /><span className="hidden sm:inline">Exportar PDF</span><span className="sm:hidden">PDF</span>
          </button>
        }
      />

      {/* Country selector — first control in filter bar */}
      {onCountryChange && (
        <div className="flex flex-wrap gap-2 mb-5">
          <select
            className="grow"
            style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, outline: "none", cursor: "pointer", minHeight: 36 }}
            value={country}
            onChange={e => onCountryChange(e.target.value as Country)}
          >
            <option value="Todos">Todos los países</option>
            <option value="Argentina">Argentina</option>
            <option value="Bolivia">Bolivia</option>
            <option value="Chile">Chile</option>
            <option value="Ecuador">Ecuador</option>
            <option value="Perú">Perú</option>
          </select>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total regulaciones" value="512" sub="instrumentos auditados" />
        <KpiCard label="Total barreras / Críticas" value={`397 / 91`} sub="barreras regulatorias" valueColor={C.text} />
        <KpiCard label="Total trámites / Costo" value="360" sub="USD 12.4 M sim. / año" />
        <KpiCard label="Índice Regulatorio" value="54/100" sub="Riesgo medio-alto" valueColor={C.steel4} />
      </div>

      {/* Split panel: Barreras | Costos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Barreras */}
        <div className="rounded-lg p-6" style={{ backgroundColor: C.card }}>
          <h3 className="text-[13px] uppercase tracking-widest font-medium mb-4" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Barreras</h3>
          <div className="flex gap-6 mb-4">
            <DonutChart data={HN_SEVERITY} total="397" label="barreras" />
          </div>
          <p className="text-[12px] mb-3 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Por sector</p>
          <div className="flex flex-col gap-2.5">
            {HN_SECTORES.map((s) => {
              const max = 90;
              return (
                <div key={s.sector} className="flex items-center gap-3">
                  <span className="text-[11px] flex-shrink-0 leading-tight" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, width: 110 }}>{s.sector.split(" ").slice(0, 2).join(" ")}</span>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 rounded-full overflow-hidden h-[8px]" style={{ backgroundColor: "#E6ECF3" }}>
                        <div className="h-full rounded-full" style={{ width: `${(s.barreras / max) * 100}%`, backgroundColor: C.steel3 }} />
                      </div>
                      <span className="text-[11px] font-semibold w-[24px] text-right flex-shrink-0" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{s.barreras}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 rounded-full overflow-hidden h-[8px]" style={{ backgroundColor: "#E6ECF3" }}>
                        <div className="h-full rounded-full" style={{ width: `${(s.criticas / max) * 100}%`, backgroundColor: C.critico }} />
                      </div>
                      <span className="text-[11px] font-semibold w-[24px] text-right flex-shrink-0" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.critico }}>{s.criticas}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: C.steel3 }} /><span className="text-[10px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Barreras</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: C.critico }} /><span className="text-[10px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Críticas</span></div>
            </div>
          </div>
          <button className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: C.steel3, fontFamily: "Space Grotesk, sans-serif", background: "none", border: "none" }}
            onClick={() => onNavigate({ screen: "barreras" })}>
            Ver todas las barreras <ArrowRight size={14} />
          </button>
        </div>

        {/* Costos */}
        <div className="rounded-lg p-6" style={{ backgroundColor: C.card }}>
          <h3 className="text-[13px] uppercase tracking-widest font-medium mb-4" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Costos de trámites <span className="normal-case text-[10px]">(simulado)</span></h3>
          <p className="text-[12px] mb-3 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Costo por sector</p>
          <div className="flex flex-col gap-2.5">
            {HN_SECTORES.map((s) => (
              <div key={s.sector} className="flex items-center gap-3">
                <span className="text-[11px] flex-shrink-0 leading-tight" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, width: 110 }}>{s.sector.split(" ").slice(0, 2).join(" ")}</span>
                <div className="flex-1 rounded-full overflow-hidden h-[10px]" style={{ backgroundColor: "#E6ECF3" }}>
                  <div className="h-full rounded-full" style={{ width: `${(s.tramites / 71) * 100}%`, backgroundColor: C.steel2 }} />
                </div>
                <span className="text-[11px] font-semibold w-[24px] text-right flex-shrink-0" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{s.tramites}</span>
              </div>
            ))}
          </div>
          <p className="text-[12px] mt-4 mb-2 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Por tipo</p>
          <div className="flex gap-4">
            <DonutChart
              data={[{ name: "Empresarial", value: 218, color: C.steel3 }, { name: "Ciudadano", value: 142, color: C.bajo }]}
              total="360" label="trámites"
            />
          </div>
          <button className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: C.steel3, fontFamily: "Space Grotesk, sans-serif", background: "none", border: "none" }}
            onClick={() => onNavigate({ screen: "tramites" })}>
            Ver todos los trámites <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Sector table */}
      <div className="rounded-lg" style={{ backgroundColor: C.card }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
          <h3 className="text-[13px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Sectores auditados</h3>
          <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{analyzedSectors.length} de {countrySectors.length} sectores</span>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Sector", "Barreras", "Altas", "Críticas", "Trámites", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analyzedSectors.slice(0, PREVIEW_COUNT).map((s, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{s.sector}</td>
                <td className="px-5 py-3 text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{s.barreras}</td>
                <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.alto }}>{s.altas}</td>
                <td className="px-5 py-3 text-[13px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.critico }}>{s.criticas}</td>
                <td className="px-5 py-3 text-[13px]" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{s.tramites}</td>
                <td className="px-5 py-3">
                  <button className="text-[11px] flex items-center gap-1" style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
                    onClick={() => onNavigate({ screen: "barreras", sector: s.sector })}>
                    Ver barreras <ChevronRight size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {countrySectors.length > PREVIEW_COUNT && (
          <div className="px-5 py-3 border-t" style={{ borderColor: C.border }}>
            <button className="flex items-center gap-1.5 text-[13px] font-medium"
              style={{ color: C.steel3, fontFamily: "Space Grotesk, sans-serif", background: "none", border: "none" }}
              onClick={() => setShowSectors(true)}>
              Ver todos los sectores ({countrySectors.length}) <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BarraFiltrosBarreras ──────────────────────────────────────────────────────
function BarraFiltrosBarreras({ country, setCountry, sector, setSector, entidad, setEntidad, clasificacion, setClasificacion, subdimension, setSubdimension, jerarquia, setJerarquia, severidad, setSeveridad, sectors, entidades }: {
  country: Country; setCountry: (c: Country) => void;
  sector: string; setSector: (v: string) => void;
  entidad: string; setEntidad: (v: string) => void;
  clasificacion: string; setClasificacion: (v: string) => void;
  subdimension: string; setSubdimension: (v: string) => void;
  jerarquia: string; setJerarquia: (v: string) => void;
  severidad: string; setSeveridad: (v: string) => void;
  sectors: string[];
  entidades: string[];
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

  return (
    <div className="flex flex-wrap gap-2 mb-5 p-0 rounded-lg">
      {/* País */}
      <select className="grow" style={sel()} value={country} onChange={e => setCountry(e.target.value as Country)}>
        <option value="Todos">Todos los países</option>
        <option value="Argentina">Argentina</option>
        <option value="Bolivia">Bolivia</option>
        <option value="Chile">Chile</option>
        <option value="Ecuador">Ecuador</option>
        <option value="Perú">Perú</option>
      </select>
      {/* Sector */}
      <select className="grow" style={sel()} value={sector} onChange={e => setSector(e.target.value)}>
        <option value="">Todos los sectores</option>
        {sectors.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      {/* Entidad emisora */}
      <select className="grow" style={sel()} value={entidad} onChange={e => setEntidad(e.target.value)}>
        <option value="">Entidad emisora</option>
        {entidades.map(e => <option key={e} value={e}>{e}</option>)}
      </select>
      {/* Clasificación */}
      <select className="grow" style={sel()} value={clasificacion} onChange={e => { setClasificacion(e.target.value); setSubdimension(""); }}>
        <option value="">Clasificación</option>
        <option value="Entrada">Entrada</option>
        <option value="Operación">Operación</option>
      </select>
      {/* Subdimensión */}
      <select className="grow" style={sel(!clasificacion)} value={subdimension} disabled={!clasificacion}
        onChange={e => setSubdimension(e.target.value)}>
        <option value="">Subdimensión</option>
        {subdimOpts.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      {/* Jerarquía normativa */}
      <select className="grow" style={sel()} value={jerarquia} onChange={e => setJerarquia(e.target.value)}>
        <option value="">Jerarquía normativa</option>
        <option value="Constitucional">Constitucional</option>
        <option value="Legal">Legal</option>
        <option value="Reglamentario">Reglamentario</option>
        <option value="Administrativo">Administrativo</option>
        <option value="Técnico o local">Técnico o local</option>
      </select>
      {/* Severidad */}
      <select className="grow" style={sel()} value={severidad} onChange={e => setSeveridad(e.target.value)}>
        <option value="">Severidad</option>
        <option value="Crítico">4 · Crítico</option>
        <option value="Alto">3 · Alto</option>
        <option value="Mediano">2 · Mediano</option>
        <option value="Bajo">1 · Bajo</option>
      </select>
    </div>
  );
}

// ─── Screen 3 — Barreras ──────────────────────────────────────────────────────
function BarrerasScreen({ initialSector, country = "Bolivia", onCountryChange, onNavigate }: { initialSector?: string; country?: Country; onCountryChange?: (c: Country) => void; onNavigate: (v: View) => void }) {
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
        const exportCtx = JSON.stringify({ tipo: "distorsion", pais: countryLabel, sector: sector || "Todos los sectores", filtros: activeFilters, registros: `${filtered.length} de ${BARRERAS_NIVEL4_LIST.length} barreras`, fecha: new Date().toLocaleString("es-BO"), periodo: "enero 2015 – marzo 2026" });
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

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <KpiCard label="Total barreras" value={cd.total.toLocaleString("es-BO")} sub={countryLabel} />
              <KpiCard label="Barreras críticas" value={String(cd.criticas)} sub="nivel 4 · atención prioritaria" valueColor={C.critico} />
              <KpiCard label="IRR promedio" value={cd.irrPromedio} valueSuffix="/4" sub="Escala 1 a 4" />
              <KpiCard label="Sectores afectados" value={String(cd.sectores)} sub="con barreras registradas" />
            </div>
          </>
        );
      })()}

      {/* Charts row — IRR por clasificación · Barreras por jerarquía */}
      {(() => {
        const cd = COUNTRY_BARRERAS_DATA[country] ?? COUNTRY_BARRERAS_DATA["Bolivia"];
        const JERARQUIA_BARS = cd.jerarquia;
        const maxTotal = Math.max(...JERARQUIA_BARS.map(b => b.total), 1);
        const SEV_COLORS = ["#C75450", "#26456B", "#3E6E9E", "#7FA8D4"] as const;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" style={{ alignItems: "stretch" }}>
            <PanelTipoSubdimension
              label="IRR por clasificación"
              tipos={["Entrada", "Operación"]}
              datos={cd.clasificacion}
              className="h-full"
            />

            {/* Barreras por jerarquía normativa */}
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
                    const active = !jerarquia || jerarquia === bar.nombre;
                    const pct = (bar.total / maxTotal) * 100;
                    const segs = [
                      { v: bar.n4, color: SEV_COLORS[0] },
                      { v: bar.n3, color: SEV_COLORS[1] },
                      { v: bar.n2, color: SEV_COLORS[2] },
                      { v: bar.n1, color: SEV_COLORS[3] },
                    ].filter(s => s.v > 0);
                    return (
                      <div key={bar.nombre} className="flex items-center gap-3" style={{ opacity: active ? 1 : 0.28, transition: "opacity 0.2s" }}>
                        <span className="flex-shrink-0" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, width: 116, lineHeight: 1.3 }}>{bar.nombre}</span>
                        <div className="flex-1 rounded-full overflow-hidden" style={{ height: 14, backgroundColor: "#E6ECF3" }}>
                          <div className="h-full flex rounded-full overflow-hidden" style={{ width: `${pct}%` }}>
                            {segs.map((s, si) => (
                              <div key={si} style={{ flex: s.v, backgroundColor: s.color, minWidth: s.v > 0 ? 2 : 0 }} />
                            ))}
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-right" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, color: C.textMuted, width: 28 }}>{bar.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Barreras prioritarias table */}
      <div className="rounded-lg" style={{ backgroundColor: C.card }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
          <h3 className="text-[13px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
            Barreras prioritarias{" "}
            <span style={{ color: C.critico }}>({filtered.length < BARRERAS_NIVEL4_LIST.length ? filtered.length : 91})</span>
          </h3>
          <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
            {filtered.length} registros filtrados
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Barrera", "IRR", "Clasificación", "Subdimensión", "Jerarquía", "Sector", "Instrumento"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-widest whitespace-nowrap"
                    style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((b, i) => (
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
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{b.clasificacion}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 180 }}>{b.subdimension}</td>
                  <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{b.jerarquia}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{b.sector}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 180 }}>{b.instrumento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
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
    </div>
  );
}

// ─── Screen 4 — Barrera Detail ────────────────────────────────────────────────
function BarreraDetail({ id, onNavigate }: { id: string; onNavigate: (v: View) => void }) {
  const barrera = ALL_BARRERAS.find(b => b.id === id);
  if (!barrera) return null;

  const affectedTramites = ALL_TRAMITES.filter(t => barrera.tramitesAfectados.includes(t.id));

  const textParts = barrera.textNormativo.split(barrera.pasajeResaltado);

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <button className="flex items-center gap-1 text-[12px] mb-4 min-h-[44px]" style={{ color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
        onClick={() => onNavigate({ screen: "barreras", sector: barrera.sector })}>
        ← Volver a Barreras
      </button>
      <div className="flex items-center justify-between mb-1 gap-2">
        <p className="text-[10px] md:text-[11px] uppercase tracking-widest" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Regulaciones › Barreras › Detalle</p>
        <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-[12px] font-medium flex-shrink-0"
          style={{ backgroundColor: C.text, color: "#FAFBFC", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
          onClick={() => onNavigate({ screen: "reporte-pdf", context: barrera.sector })}>
          <Download size={13} /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Main column */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <SeverityBadge level={barrera.severidad} />
              <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{barrera.sector}</span>
            </div>
            <h1 className="text-[24px] font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{barrera.titulo}</h1>
          </div>

          {/* Legal text */}
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}>
              <div>
                <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Texto normativo de origen</p>
                <p className="text-[12px] font-semibold mt-0.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{barrera.instrumento}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Jerarquía: Decreto Ejecutivo</p>
                <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>Bolivia · 2022</p>
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

          {/* Reform */}
          <div className="rounded-lg overflow-hidden hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Propuesta de reforma</p>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wide" style={{ backgroundColor: C.steel3 + "22", color: C.steel3, fontFamily: "Space Grotesk, sans-serif" }}>
                {barrera.reforma.palanca}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-5 border-r" style={{ borderColor: C.border }}>
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.critico }}>Dice</p>
                <p className="text-[13px] italic leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>"{barrera.reforma.dice}"</p>
              </div>
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel3 }}>Debe Decir</p>
                <p className="text-[13px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>"{barrera.reforma.debeDedir}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[11px] uppercase tracking-widest font-medium mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Ficha</p>
            {([
              ["Clasificación",          (barrera as any).clasificacion || "—"],
              ["Subdimensión",           BARRERA_META[barrera.id]?.subdimension || "—"],
              ["Etapa del ciclo de vida", BARRERA_META[barrera.id]?.etapaCicloVida || "—"],
              ["Sector",                 barrera.sector],
              ["Severidad",              barrera.severidad],
              ["Instrumento",            barrera.instrumento.split(",")[0]],
              ["Año",                    "2022"],
              ["Jerarquía",              "Decreto Ejecutivo"],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: C.border }}>
                <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{k}</span>
                <span className="text-[12px] font-medium text-right" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text, maxWidth: "60%" }}>{v}</span>
              </div>
            ))}
          </div>

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
        const exportCtx = JSON.stringify({ tipo: "carga", pais: countryLabel, sector: sector || "Todos los sectores", filtros: activeFilters, registros: `${filtered.length} de ${TRAMITES_EXT.length} trámites`, fecha: new Date().toLocaleString("es-BO"), periodo: "enero 2015 – marzo 2026" });
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

      {/* Filter bar — wraps to multiple rows; order: País · Sector · Entidad · Tipo usuario · Tipo carga · Subdim · Etapa · Tamaño · Año */}
      <div className="flex flex-wrap gap-2 mb-5">
        <select className="grow" style={selStyle} value={country} onChange={e => { onCountryChange?.(e.target.value as Country); }}>
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

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Total trámites" value="428" sub="Bolivia" />
        <KpiCard
          label="Costo estimado de trámites"
          value="USD 12.4 M"
          sub="simulado · anual"
          valueColor={C.steel4}
          tooltip={scmTooltip}
        />
        <KpiCard label="Empresariales" value="218" sub="51% del total" />
        <KpiCard label="Ciudadanos" value="142" sub="33% del total" />
        <KpiCard label="Cargas críticas" value="123" sub="nivel 4" valueColor={C.critico} />
      </div>

      {/* Row: Carga por tipo | Top 10 entidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <PanelTipoSubdimension
          label="CARGA POR TIPO"
          tipos={["Accesibilidad", "Certidumbre", "Cumplimiento", "Proporcionalidad"]}
          datos={PANEL_CARGA_TIPO_DATA}
        />
        <div className="rounded-lg p-6" style={{ backgroundColor: C.card }}>
          <p className="text-[11px] uppercase tracking-widest mb-4 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Top 10 entidades por número de trámites</p>
          <div className="flex flex-col gap-2.5">
            {TOP_ENTIDADES_BOLIVIA.map(item => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-[11px] flex-shrink-0 leading-tight" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, width: 188 }}>{item.name}</span>
                <div className="flex-1 rounded-full overflow-hidden h-[8px]" style={{ backgroundColor: "#E6ECF3" }}>
                  <div className="h-full rounded-full" style={{ width: `${(item.value / 68) * 100}%`, backgroundColor: C.steel2 }} />
                </div>
                <span className="text-[12px] font-semibold flex-shrink-0" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted, width: 24, textAlign: "right" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trámites table — columns: Trámite · Tipo de usuario · Entidad · Sector · Pasos · Requisitos · Costo estimado */}
      <div className="rounded-lg" style={{ backgroundColor: C.card }}>
        <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: C.border }}>
          <h3 className="text-[13px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Trámites prioritarios</h3>
          <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.steel3 }}>({filtered.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Trámite", "Tipo de usuario", "Entidad", "Sector", "Pasos", "Requisitos", "Costo estimado", ""].map(h => (
                  <th key={h} className={`px-4 py-3 text-[11px] uppercase tracking-widest ${h === "Pasos" || h === "Requisitos" || h === "Costo estimado" ? "text-right" : "text-left"}`}
                    style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map(t => (
                <tr key={t.id} className="cursor-pointer hover:bg-[#F4F7FB] transition-colors" style={{ borderBottom: `1px solid ${C.border}` }}
                  onClick={() => { if (ALL_TRAMITES.find(x => x.id === t.id)) onNavigate({ screen: "tramite-detail", id: t.id }); }}>
                  <td className="px-4 py-3 text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text, maxWidth: 200 }}>{t.nombre}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{t.tipo}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 150 }}>{t.entidad.split("—")[0].split("/")[0].trim()}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 140 }}>{t.sector}</td>
                  <td className="px-4 py-3 text-[12px] text-right font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{t.pasos.length || "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-right font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{t.requisitos}</td>
                  <td className="px-4 py-3 text-[12px] text-right font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4, whiteSpace: "nowrap" }}>{t.costo.monetario}</td>
                  <td className="px-4 py-3"><ChevronRight size={14} color={C.textMuted} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
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
              ["IRR",                     `${d.irr} · ${IRR_LABELS[d.irr]}`],
              ["Trámite",                 tramite?.nombre ?? d.tramiteNombre],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: C.border }}>
                <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{k}</span>
                <span className="text-[12px] font-medium text-right" style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: k === "IRR" && d.irr === 4 ? C.critico : C.text,
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
            <div style={{ display: "flex", gap: 8 }}>
              {([
                { value: "administrador" as UserRole, label: "Administrador", sub: "Regulaciones + Administración" },
                { value: "usuario-bid" as UserRole, label: "Usuario BID", sub: "Solo Regulaciones" },
              ]).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  style={{
                    flex: 1,
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
];

const CATALOGOS = {
  paises: ["Argentina", "Bolivia", "Chile", "Ecuador", "Perú"],
  sectores: ["Agropecuario", "Agroindustria", "Manufactura", "Servicios Financieros", "Construcción", "Textil y Confección", "Energías Renovables", "Servicios Digitales"],
  tiposBarrera: ["Entrada", "Operación"],
  tiposTramite: ["Apertura", "Operación", "Inspección", "Cierre", "Certificación"],
  sectoresGeo: ["Andino", "Cono Sur", "Centroamérica", "Caribe", "Mesoamérica", "Atlántico Sur"],
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
    { key: "sectoresGeo", label: "Sectores",          desc: "Sectores geográficos de operación" },
  ] as const;

  type GenericCatKey = keyof typeof CATALOGOS;

  const [view, setView] = useState<CatView>("list");
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [catData, setCatData] = useState<typeof CATALOGOS>(CATALOGOS);
  const [itemActive, setItemActive] = useState<Record<string, Set<string>>>({});
  const [roles, setRoles] = useState(CATALOGO_ROLES_DATA);
  const [perms, setPerms] = useState(PERMISOS_MATRIX);
  const [addingItem, setAddingItem] = useState("");
  const [addingRole, setAddingRole] = useState(false);
  const [newRole, setNewRole] = useState({ nombre: "", descripcion: "" });
  const [editingRole, setEditingRole] = useState<{ index: number; nombre: string; descripcion: string } | null>(null);
  const [editingItem, setEditingItem] = useState<{ index: number; value: string } | null>(null);

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
  const togglePerm = (rol: string, accion: string) =>
    setPerms(p => {
      const current = p[rol] ?? {};
      return { ...p, [rol]: { ...current, [accion]: !(current[accion] ?? false) } };
    });

  const catLabel = CATALOG_LIST.find(c => c.key === selectedCat)?.label ?? "";
  const selectedCatKey = selectedCat as GenericCatKey;

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

  // ── Generic items view ─────────────────────────────────────────────────────
  if (view === "items") return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb={`Administración — Catálogos — ${catLabel}`} title={catLabel} subtitle="Gestión del sistema · Rol: Administrador" />
      <div className="flex items-center gap-3 mb-4">
        <button className="text-[13px]" style={{ color: C.steel3, fontFamily: "IBM Plex Sans, sans-serif", background: "none", border: "none" }}
          onClick={() => setView("list")}>← Volver a Catálogos</button>
      </div>
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-4 md:px-5 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderColor: C.border }}>
          <p className="text-[13px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{(catData[selectedCatKey] ?? []).length} registros</p>
          <div className="flex gap-2 w-full sm:w-auto">
            <input value={addingItem} onChange={e => setAddingItem(e.target.value)} placeholder="Nuevo registro..."
              className="flex-1 sm:flex-none px-3 py-2 rounded-lg text-[12px] outline-none min-h-[40px]"
              style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}`, width: undefined }}
              onKeyDown={e => e.key === "Enter" && addItem(selectedCatKey)} />
            <button className="px-3 md:px-4 py-2 rounded-lg text-[12px] font-medium min-h-[40px]"
              style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
              onClick={() => addItem(selectedCatKey)}>+ Agregar</button>
          </div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[400px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Nombre", "Estado", "Acciones"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(catData[selectedCatKey] ?? []).map((item, i) => {
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
                        onClick={() => setEditingItem({ index: i, value: item })}>Editar</button>
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
            </div>
            <div className="flex gap-3 mt-8 justify-end">
              <button className="px-5 py-2 rounded-lg text-[13px]"
                style={{ backgroundColor: C.canvas, color: C.textMuted, fontFamily: "Space Grotesk, sans-serif", border: `1px solid ${C.border}` }}
                onClick={() => setEditingItem(null)}>Cancelar</button>
              <button className="px-5 py-2 rounded-lg text-[13px] font-medium"
                style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none" }}
                onClick={() => {
                  if (!editingItem.value.trim()) return;
                  setCatData(d => {
                    const arr = [...(d[selectedCatKey] ?? [])];
                    arr[editingItem.index] = editingItem.value.trim();
                    return { ...d, [selectedCatKey]: arr };
                  });
                  setEditingItem(null);
                }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

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

  // ── State (initialised from prefill when navigating from Barreras / Trámites) ──
  const [tipoHallazgo, setTipoHallazgo] = useState<"distorsion" | "carga">(prefill?.tipoHallazgo ?? "distorsion");

  // Siempre visibles
  const [pais, setPais] = useState<Country>(prefill?.pais ?? "Todos");
  const [selectedSectors, setSelectedSectors] = useState<string[]>(prefill?.sectores ?? []);
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
  ];
  const scopeSummary = scopeParts.join(" · ");

  const previewBarreras = ALL_BARRERAS.filter(b => {
    if (selectedSectors.length > 0 && !selectedSectors.includes(b.sector)) return false;
    if (selectedSeveridades.length > 0 && !selectedSeveridades.includes(b.severidad)) return false;
    return true;
  });
  const previewTramites = ALL_TRAMITES.filter(t => {
    if (selectedSectors.length > 0 && !selectedSectors.includes(t.sector)) return false;
    if (tipoTramite && t.tipo !== tipoTramite) return false;
    return true;
  });
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
            <select style={selStyle} value={pais} onChange={e => { setPais(e.target.value as Country); setSelectedSectors([]); }}>
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

            <button
              className="w-full py-3 rounded-lg text-[13px] font-semibold tracking-wide uppercase transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: (previewItems.length > 0 && (periodoTipo !== "personalizado" || customRangeOk)) ? C.steel4 : C.border, color: (previewItems.length > 0 && (periodoTipo !== "personalizado" || customRangeOk)) ? "white" : C.textMuted, fontFamily: "Space Grotesk, sans-serif", border: "none" }}
              disabled={previewItems.length === 0 || (periodoTipo === "personalizado" && !customRangeOk)}
              onClick={() => {
                const ctx = JSON.stringify({ pais: paisLabel, sectores: sectoresLabel, entidad: entidadLabel, periodo: periodoLabel, tipo: tipoHallazgo, fecha: new Date().toLocaleString("es-BO") });
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
  const codigo    = `ALEPH-${paisCode}-EST-2026-001`;

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
    `Se identificaron ${cd.total.toLocaleString()} barreras regulatorias con potencial de ajuste en ${paisLabel}. De estas, ${cd.criticas} presentan impacto crítico (IRR 4) con efecto directo sobre la competitividad del sector privado.`,
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
          onClick={() => isRegional ? onNavigate({ screen: "regional-dashboard" }) : onNavigate({ screen: "country-dashboard", country: pais })}>
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
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke={C.steel1} strokeWidth="2"/>
              <circle cx="24" cy="24" r="14" stroke={C.steel2} strokeWidth="1.5"/>
              <circle cx="24" cy="24" r="6"  stroke="#FAFBFC"  strokeWidth="1"/>
              <circle cx="24" cy="24" r="3"  fill={C.steel1}/>
            </svg>
            <span className="text-[22px] tracking-[4px]" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, color: "white" }}>ALEPH</span>
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
                Banco Interamericano de Desarrollo · Plataforma ALEPH · © 2026
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
              Banco Interamericano de Desarrollo · Plataforma ALEPH · Datos simulados · © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reporte PDF ───────────────────────────────────────────────────────────────
function ReportePDFScreen({ context, onNavigate }: { context?: string; onNavigate: (v: View) => void }) {
  // Detect strategic report type from JSON context (Panorama → Exportar PDF)
  const ctx = (() => { try { return JSON.parse(context ?? "{}"); } catch { return {}; } })();
  if (ctx.tipo === "estrategico") {
    return <ReporteEstrategicoScreen pais={ctx.pais} onNavigate={onNavigate} />;
  }

  // ── Context parsing ──────────────────────────────────────────────────────────
  const tipoHallazgo: "distorsion" | "carga" = ctx.tipo === "carga" ? "carga" : "distorsion";
  const paisRaw: string = ctx.pais ?? "Bolivia";
  const pais: Country = (["Argentina","Bolivia","Chile","Ecuador","Perú"].includes(paisRaw)) ? paisRaw as Country : "Bolivia";
  const sectorActivo: string = ctx.sectores ?? ctx.sector ?? (tipoHallazgo === "carga" ? "Todos los sectores" : "Agroindustria Cafetalera");
  const filtros: string[] = Array.isArray(ctx.filtros) ? ctx.filtros.filter((f: string) => !!f) : [];
  const periodo: string = ctx.periodo ?? "enero 2015 – marzo 2026";
  const fechaCtx: string = typeof ctx.fecha === "string" ? ctx.fecha.split(",")[0] : "Marzo 2026";
  const paisCode = pais.slice(0, 3).toUpperCase();
  const codigo = `ALEPH-${paisCode}-OP-2026-001`;

  // ── Hallazgos de muestra ─────────────────────────────────────────────────────
  // Valid eje→subdim: Entrada→Comercio|Competencia|Inversión; Operación→Competencia|Innovación|Inversión
  // Valid tipoCarga→subdim per SUBDIMS_BY_TIPO_CARGA catalog
  const DIST = [
    {
      id: "BARRE-2026-001", titulo: "Restricción de Operadores de Maquila",
      sector: "Agroindustria Cafetalera", eje: "Entrada", subdimension: "Comercio",
      entidad: "SENAVEX", instrumento: "Decreto PCM-027-2022, Art. 8",
      textoNormativo: "Solo podrán operar como operadores de maquila en exportación cafetalera las empresas debidamente registradas con un mínimo de cinco años de operación continua y capital suscrito no inferior al monto establecido por resolución ministerial vigente.",
      pasaje: "un mínimo de cinco años de operación continua",
      tipoRestriccion: "Licencia", sujetos: "Empresas exportadoras · Cooperativas cafetaleras",
      descripcion: "La norma restringe el acceso al mercado de maquila a operadores con antigüedad mínima de cinco años, excluyendo efectivamente a nuevas empresas y cooperativas. Dicha exigencia carece de sustento técnico demostrable y no tiene equivalente en marcos regulatorios regionales comparables.",
      impacto: "USD 4.1M/año", canal: "Barrera de entrada a PYMEs",
      accion: "Eliminar", descripcionAccion: "Suprimir el requisito de antigüedad mínima de cinco años y reemplazarlo por un sistema de habilitación basado en capacidad técnica verificable y cumplimiento de estándares fitosanitarios vigentes.",
      severidad: "Crítico",
    },
    {
      id: "BARRE-2026-002", titulo: "Capital Mínimo Desproporcionado para Intermediación Financiera",
      sector: "Servicios Financieros y de Seguros", eje: "Entrada", subdimension: "Inversión",
      entidad: "ASFI", instrumento: "Ley del Sistema Financiero, Art. 12",
      textoNormativo: "Las entidades de intermediación financiera no bancaria deberán acreditar un capital mínimo integrado no inferior a cuatro millones de bolivianos antes de iniciar operaciones, debidamente certificado por auditor externo inscrito en el registro de la ASFI.",
      pasaje: "cuatro millones de bolivianos antes de iniciar operaciones",
      tipoRestriccion: "Capital mínimo", sujetos: "Cooperativas financieras · Entidades microfinancistas · Nuevos entrantes fintech",
      descripcion: "El umbral de capital mínimo cuadruplica el promedio regional para entidades de intermediación no bancaria equivalentes, favoreciendo a operadores establecidos en detrimento de nuevos modelos de negocio y cooperativas de menor escala.",
      impacto: "USD 3.5M/año", canal: "Capital productivo paralizado",
      accion: "Proporcionalizar", descripcionAccion: "Establecer una escala de capital mínimo diferenciada por tipo y volumen de operación, alineada con el promedio regional, con revisión bienal por parte de ASFI.",
      severidad: "Crítico",
    },
    {
      id: "BARRE-2026-003", titulo: "Registros Superpuestos entre Entidades Supervisoras",
      sector: "Servicios Financieros y de Seguros", eje: "Operación", subdimension: "Competencia",
      entidad: "ASFI", instrumento: "Res. IICA 2021-88, Art. 4",
      textoNormativo: "Toda entidad financiada con recursos externos cuyo monto supere el equivalente de cincuenta mil dólares deberá obtener registro independiente ante cada entidad fiscalizadora competente, sin que el registro en una de ellas exonere de la obligación ante las demás.",
      pasaje: "sin que el registro en una de ellas exonere de la obligación ante las demás",
      tipoRestriccion: "Autorización previa", sujetos: "Entidades financieras · Cooperativas con fondos externos",
      descripcion: "La ausencia de reconocimiento mutuo entre organismos supervisores obliga a mantener expedientes paralelos ante cada fiscalizador, duplicando costos administrativos y generando inconsistencias que elevan el riesgo regulatorio percibido.",
      impacto: "USD 3.2M/año", canal: "Costo de oportunidad",
      accion: "Armonizar", descripcionAccion: "Establecer un protocolo de intercambio de información entre ASFI, BCB y entidades supervisoras para reconocimiento mutuo automático de registros, sin reducir el alcance de la supervisión.",
      severidad: "Crítico",
    },
  ] as const;

  const CARGA = [
    {
      id: "CARGA-2026-001", titulo: "Licencia de Operación con Requisitos Físicos Duplicados",
      sector: "Agroindustria Cafetalera", tipoCarga: "Accesibilidad", subdimension: "Digitalización y accesibilidad",
      entidad: "SENAVEX", fuente: "Res. Min. Comercio 2022-14", tipoTramite: "Licencia", usuarioAfectado: "Empresarial",
      requisitos: ["Formulario físico en original y copia", "Certificado de registro mercantil vigente", "Declaración jurada notariada", "Visita de inspección presencial", "Pago de tasa municipal en efectivo"],
      descripcion: "El trámite exige presencia física en tres dependencias distintas con documentos originales en cada visita. No existe interoperabilidad entre los sistemas de SENAVEX, la alcaldía y el registro mercantil, obligando al operador a presentar los mismos documentos de forma independiente ante cada entidad.",
      costoEstimado: "USD 4.2M/año",
      accion: "Digitalizar", descripcionAccion: "Implementar ventanilla única digital que integre los sistemas de SENAVEX, alcaldía y registro mercantil con validación cruzada automática, eliminando la obligatoriedad de presencia física en cada dependencia.",
      severidad: "Crítico",
    },
    {
      id: "CARGA-2026-002", titulo: "Declaración Semanal con Información Redundante",
      sector: "Textil y Confección", tipoCarga: "Certidumbre", subdimension: "Discrecionalidad administrativa",
      entidad: "Min. de Desarrollo Productivo", fuente: "Res. MEM-0012-2021, Art. 5", tipoTramite: "Declaración", usuarioAfectado: "Empresarial",
      requisitos: ["Declaración jurada semanal en formulario físico", "Firma notarial de representante legal", "Comprobante de pago de aportes del período", "Copia de contratos de trabajo vigentes"],
      descripcion: "La norma exige una declaración semanal cuyo contenido replica en un 90% la información ya reportada mensualmente mediante facturación electrónica. La decisión sobre equivalencia de documentos queda a discreción del inspector sin criterios objetivos publicados.",
      costoEstimado: "USD 2.1M/año",
      accion: "Simplificar", descripcionAccion: "Sustituir la declaración semanal por una referencia automática al sistema de facturación electrónica, con criterios objetivos de cumplimiento auditables que eliminen la discrecionalidad del inspector.",
      severidad: "Alto",
    },
  ] as const;

  const hallazgos = tipoHallazgo === "carga" ? CARGA : DIST;
  const criticos = hallazgos.filter(h => h.severidad === "Crítico").length;
  const hallazgosLabel = ctx.registros ?? `${hallazgos.length} hallazgos · ${criticos} crítico${criticos !== 1 ? "s" : ""} del sector`;

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
      <p className="text-[10px] mt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>simulado · modelo SCM</p>
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

  const FichaDistorsion = ({ h, num }: { h: typeof DIST[number]; num: number }) => (
    <div className="mb-10">
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
            { label: "ID hallazgo",          val: h.id },
            { label: "Norma",                val: h.instrumento },
            { label: "País",                 val: pais },
            { label: "Tipo de hallazgo",     val: "Distorsión regulatoria" },
            { label: "Sector",               val: h.sector },
            { label: "Eje",                  val: h.eje },
            { label: "Entidad que emite",    val: h.entidad },
            { label: "Subdimensión",         val: h.subdimension },
          ]} />
          <CiteBox text={h.textoNormativo} pasaje={h.pasaje} fuente={h.instrumento} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Tipo de restricción",      val: <>{h.tipoRestriccion}</> },
              { label: "Sujeto(s) afectado(s)",    val: <>{h.sujetos}</> },
              { label: "Descripción del hallazgo", val: <>{h.descripcion}</> },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-widest mb-1 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{label}</p>
                <p className="text-[12px] leading-snug" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{val}</p>
              </div>
            ))}
          </div>
          <ImpactBox monto={h.impacto} canal={h.canal} />
          <AMRBox accion={h.accion} desc={h.descripcionAccion} />
        </div>
      </div>
    </div>
  );

  const FichaCarga = ({ h, num }: { h: typeof CARGA[number]; num: number }) => (
    <div className="mb-10">
      <p className="text-[10px] font-bold uppercase tracking-[2px] mb-0.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Ficha {num} · Carga</p>
      <h3 className="text-[16px] font-semibold leading-tight mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{h.titulo}</h3>
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
        {/* Top stripe */}
        <div className="px-5 py-3 flex items-center justify-between gap-3" style={{ backgroundColor: C.steel3 }}>
          <span className="text-[11px] font-medium text-white flex-shrink-0" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Carga regulatoria</span>
          <SevBadge nivel={h.severidad} />
          <span className="text-[11px] flex-shrink-0 text-right" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: "rgba(255,255,255,0.65)" }}>{h.entidad}</span>
        </div>
        <div className="p-5 md:p-6 flex flex-col gap-5" style={{ backgroundColor: "white" }}>
          <Field2Col fields={[
            { label: "ID hallazgo",                val: h.id },
            { label: "Fuente oficial",             val: <span style={{ color: C.steel3, textDecoration: "underline", cursor: "pointer" }}>Ver trámite ↗</span> },
            { label: "País",                       val: pais },
            { label: "Tipo de trámite",            val: h.tipoTramite },
            { label: "Sector",                     val: h.sector },
            { label: "Usuario afectado",           val: h.usuarioAfectado },
            { label: "Entidad que gestiona",       val: h.entidad },
            { label: "Clasificación del hallazgo", val: `${h.tipoCarga} · ${h.subdimension}` },
          ]} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-2 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Requisitos principales</p>
              <ul className="flex flex-col gap-1.5">
                {h.requisitos.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>
                    <span className="flex-shrink-0 w-1 h-1 rounded-full mt-1.5" style={{ backgroundColor: C.steel3, marginTop: 7 }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Descripción del hallazgo</p>
              <p className="text-[12px] leading-snug" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>{h.descripcion}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Costo monetario estimado (SCM)</p>
              <p className="text-[20px] font-semibold leading-none mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>{h.costoEstimado}</p>
              <p className="text-[10px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>simulado · modelo SCM</p>
            </div>
          </div>
          <AMRBox accion={h.accion} desc={h.descripcionAccion} />
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
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold"
            style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", border: "none", cursor: "pointer" }}>
            <Download size={13} /> Descargar PDF
          </button>
        </div>
      </div>

      {/* Paper */}
      <div className="max-w-[820px] mx-auto my-4 md:my-8 shadow-xl rounded-xl overflow-hidden">

        {/* ── PORTADA ── */}
        <div className="px-10 md:px-16 py-14 md:py-16 flex flex-col" style={{ backgroundColor: C.steel4, minHeight: 460 }}>
          <div className="flex items-center gap-4 mb-auto">
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke={C.steel1} strokeWidth="2"/>
              <circle cx="24" cy="24" r="14" stroke={C.steel2} strokeWidth="1.5"/>
              <circle cx="24" cy="24" r="6"  stroke="#FAFBFC"  strokeWidth="1"/>
              <circle cx="24" cy="24" r="3"  fill={C.steel1}/>
            </svg>
            <span className="text-[22px] tracking-[4px]" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, color: "white" }}>ALEPH</span>
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

            {filtros.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-wider mb-2" style={{ fontFamily: "Space Grotesk, sans-serif", color: "rgba(255,255,255,0.36)" }}>Filtros aplicados</p>
                <div className="flex flex-wrap gap-2">
                  {filtros.map((f, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-[11px] font-medium"
                      style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "IBM Plex Sans, sans-serif", border: "1px solid rgba(255,255,255,0.2)" }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: "rgba(255,255,255,0.3)" }}>
                Banco Interamericano de Desarrollo · Plataforma ALEPH · © 2026
              </p>
            </div>
          </div>
        </div>

        {/* ── FICHAS ── */}
        <div className="px-8 md:px-12 py-10" style={{ backgroundColor: "white" }}>
          {tipoHallazgo === "distorsion"
            ? DIST.map((h, i) => <FichaDistorsion key={h.id} h={h} num={i + 1} />)
            : CARGA.map((h, i) => <FichaCarga key={h.id} h={h} num={i + 1} />)
          }
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

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const isMobile = useIsMobile();
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("administrador");
  // TODO: shared country state is temporary — replace when the advisor-per-country flow is built
  const [activeCountry, setActiveCountry] = useState<Country>("Todos");
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [view, setView] = useState<View>({ screen: "regional-dashboard" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [recoveryEmail, setRecoveryEmail] = useState("ana.mejia@iadb.org");

  if (!loggedIn) {
    switch (authView) {
      case "login":
        return <LoginScreen onLogin={(role) => { setUserRole(role); setLoggedIn(true); }} onNavigate={setAuthView} />;
      case "recover":
        return <RecoverScreen email={recoveryEmail} setEmail={setRecoveryEmail} onNavigate={setAuthView} />;
      case "recover-sent":
        return <RecoverSentScreen email={recoveryEmail} onNavigate={setAuthView} />;
      case "recover-new":
        return <NewPasswordScreen email={recoveryEmail} onNavigate={setAuthView} />;
      case "recover-confirmed":
        return <PasswordConfirmedScreen onNavigate={setAuthView} />;
      case "recover-expired":
        return <LinkExpiredScreen onNavigate={setAuthView} />;
    }
  }

  const navigate = (v: View) => {
    setView(v);
    setDrawerOpen(false);
    if (v.screen === "regional-dashboard") { setActiveSection("dashboard"); }
    if (v.screen === "country-dashboard") { setActiveSection("dashboard"); setActiveCountry(v.country as Country); }
    if (v.screen === "barreras" || v.screen === "barrera-detail") setActiveSection("barreras");
    if (v.screen === "tramites" || v.screen === "tramite-detail") setActiveSection("tramites");
    if (v.screen === "administracion") setActiveSection("administracion");
    if (v.screen === "reportes" || v.screen === "reporte-pdf") setActiveSection("reportes");
    if (v.screen === "documentacion") setActiveSection("documentacion");
    if (v.screen === "placeholder") {
      const s = (v as { screen: "placeholder"; label: string }).label.toLowerCase() as Section;
      setActiveSection(s === "comparativa" ? "comparativa" : "repositorio");
    }
  };

  const renderView = () => {
    switch (view.screen) {
      case "regional-dashboard": return <RegionalDashboard country={activeCountry} onCountryChange={c => { setActiveCountry(c); if (c === "Todos") navigate({ screen: "regional-dashboard" }); else navigate({ screen: "country-dashboard", country: c }); }} onNavigate={navigate} />;
      case "country-dashboard": return <CountryDashboard country={view.country} onCountryChange={c => { setActiveCountry(c); if (c === "Todos") navigate({ screen: "regional-dashboard" }); else navigate({ screen: "country-dashboard", country: c }); }} onNavigate={navigate} />;
      case "barreras": return <BarrerasScreen initialSector={view.sector} country={activeCountry} onCountryChange={c => setActiveCountry(c)} onNavigate={navigate} />;
      case "barrera-detail": return <BarreraDetail id={view.id} onNavigate={navigate} />;
      case "tramites": return <TramitesScreen country={activeCountry} onCountryChange={c => setActiveCountry(c)} onNavigate={navigate} />;
      case "tramite-detail": return <TramiteDetail id={view.id} onNavigate={navigate} />;
      case "distorsion-detail": return <DistorsionDetail id={view.id} onNavigate={navigate} />;
      case "administracion": {
        const adminTab = (view as { screen: "administracion"; tab?: string }).tab ?? "usuarios";
        if (adminTab === "catalogos") return <AdminCatalogosScreen />;
        return <AdminUsuariosScreen />;
      }
      case "reportes": return <ReportesScreen prefill={(view as { screen: "reportes"; prefill?: ReportesPrefill }).prefill} onNavigate={navigate} />;
      case "reporte-pdf": return <ReportePDFScreen context={(view as { screen: "reporte-pdf"; context?: string }).context} onNavigate={navigate} />;
      case "documentacion": return <DocumentacionScreen />;
      case "placeholder": return <PlaceholderScreen label={view.label} />;
    }
  };

  const sidebarProps = {
    activeCountry,
    activeSection, setActiveSection,
    activeView: view, userRole, setUserRole, onNavigate: navigate,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: C.canvas, fontFamily: "IBM Plex Sans, sans-serif" }}>
      {/* Mobile sticky header */}
      {isMobile && (
        <header className="flex items-center justify-between px-4 h-14 flex-shrink-0 z-30" style={{ backgroundColor: C.sidebar }}>
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke={C.steel2} strokeWidth="1.5" />
              <circle cx="14" cy="14" r="8" stroke={C.steel3} strokeWidth="1" />
              <circle cx="14" cy="14" r="3" fill={C.steel2} />
            </svg>
            <span className="text-white text-[18px] tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, letterSpacing: 3 }}>ALEPH</span>
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
  );
}
