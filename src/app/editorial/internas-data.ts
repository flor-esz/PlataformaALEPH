// Pantallas internas (ficha y listado de trámites y de barreras): datos de ejemplo y su armado.
// Con datos reales, desarrollo entrega las filas (`TramRow` / `BarRow`) y, si los tiene, el detalle de la
// ficha (`detalle`); lo que falte lo completa este archivo con valores de ejemplo, que no son datos oficiales.
import { IMP_ADM, IMP_SUB, IMP_TRAM, caShare, impH } from "./costeo-data";
import { IMP_ACT, PAISES_BASE, TR_PAIS, TR_REG } from "./fixtures";

const COUNTRIES = PAISES_BASE;
const SEVS = ["Alta", "Media", "Baja"];

/** Fila de un trámite en la ficha y el listado. */
export interface TramRow {
  /** Nombre del trámite. */
  k: string;
  sec: string;
  sub: string;
  /** Entidad responsable. */
  ent: string;
  /** Tipo de usuario (Empresarial, Ciudadano, Mixto). */
  usu: string;
  /** Costo unitario (USD por vez). */
  cu: number;
  /** Veces que se realiza al año. */
  vol: number;
  /** Acción de mejora sugerida. */
  acc: string;
  /** Etapa del ciclo empresarial. */
  eta: string;
  sev: "Alta" | "Media" | "Baja";
  /** Costo estimado total (USD). */
  tot: number;
  /** Id del catálogo real, si el trámite viene de él (para la URL). */
  id?: string;
}
/** Fila de una barrera en la ficha y el listado. */
export interface BarRow {
  /** Nombre de la barrera. */
  k: string;
  sec: string;
  sub: string;
  /** Tipo: Entrada u Operación. */
  eje: "Entrada" | "Operación" | string;
  /** Canal de transmisión. */
  amb: string;
  /** Regulación (instrumento). */
  reg: string;
  ent: string;
  sev: "Alta" | "Media" | "Baja";
  acc: string;
  /** ID del hallazgo (el que se muestra en la ficha). */
  id: string;
  anio: number;
  pais: string;
  /** Id del catálogo real, si la barrera viene de él (para la URL). Las de ejemplo no lo tienen. */
  ref?: string;
}
export type TramFichaDatos = ReturnType<typeof fxBuild>;
export type BarFichaDatos = ReturnType<typeof bfBuild>;

/* Tablas de ejemplo en formato de matriz (las mismas que muestran Trámites y Barreras). */
export const TR_TABLA_ARR: string[][] = [
  [
    "Registro de importador",
    "Comercio / Exterior",
    "DIAN",
    "Apertura",
    "Empresarial",
    "Alta",
    "Requisitos y costos",
    "1.250.000",
    "Simplificar",
  ],
  [
    "Licencia ambiental",
    "Energía / Hidrocarburos",
    "Min. de Ambiente",
    "Operación",
    "Empresarial",
    "Alta",
    "Discrecionalidad",
    "980.000",
    "Mejorar información",
  ],
  [
    "Permiso de transporte de carga",
    "Transporte / Terrestre",
    "Min. de Transporte",
    "Operación",
    "Empresarial",
    "Media",
    "Interoperabilidad",
    "620.000",
    "Digitalizar e interoperar",
  ],
  [
    "Registro sanitario",
    "Salud / Medicamentos",
    "Invima",
    "Apertura",
    "Mixto",
    "Media",
    "Requisitos y costos",
    "510.000",
    "Simplificar",
  ],
  [
    "Autorización de construcción",
    "Construcción / Edificaciones",
    "Municipalidad",
    "Operación",
    "Empresarial",
    "Baja",
    "Proporcionalidad",
    "320.000",
    "Reducir costos y tiempos",
  ],
];

export const B_TABLA: string[][] = [
  [
    "Licencia previa para la prestación de servicios financieros",
    "Servicios financieros / Crédito",
    "Entrada",
    "Competencia",
    "Ley 1328 de 2009",
    "Superintendencia Financiera",
    "Alta",
    "Simplificar cargas",
  ],
  [
    "Restricción a la inversión extranjera en telecomunicaciones",
    "Telecomunicaciones / Infraestructura",
    "Operación",
    "Inversión",
    "Ley 1341 de 2009",
    "Ministerio de TIC",
    "Media",
    "Regular según riesgo",
  ],
  [
    "Cupos de importación en productos agropecuarios",
    "Agropecuario / Alimentos",
    "Entrada",
    "Comercio",
    "Decreto 1071 de 2015",
    "Ministerio de Agricultura",
    "Media",
    "Reducir discrecionalidad",
  ],
  [
    "Control de precios en medicamentos",
    "Salud / Farmacéutico",
    "Operación",
    "Innovación",
    "Resolución 2013 de 2020",
    "Ministerio de Salud",
    "Alta",
    "Corregir distorsiones de mercado",
  ],
  [
    "Requisitos adicionales para la apertura de establecimientos",
    "Comercio / Retail",
    "Entrada",
    "Competencia",
    "Decreto 1074 de 2015",
    "Ministerio de Comercio",
    "Baja",
    "Digitalizar e interoperar",
  ],
];

/* ================= Trámites ================= */
export const TL_EXTRA: any[][] = [
  // mismo formato que IMP_TRAM; costo total siempre por debajo de 0,85 M USD
  [
    "Registro sanitario",
    "Salud",
    "Min. de Salud",
    "Mixto",
    410,
    1800,
    0,
    "Simplificar",
  ],
  [
    "Autorización de construcción",
    "Construcción",
    "Municipalidades",
    "Empresarial",
    250,
    3000,
    1,
    "Reducir costos y tiempos",
  ],
  [
    "Declaración mensual de impuestos",
    "Comercio",
    "Min. de Hacienda",
    "Empresarial",
    180,
    4000,
    0,
    "Digitalizar e interoperar",
  ],
  [
    "Habilitación municipal de negocio",
    "Comercio",
    "Municipalidades",
    "Empresarial",
    64,
    12000,
    1,
    "Simplificar",
  ],
  [
    "Certificado de exportación",
    "Comercio",
    "Dirección General de Aduanas",
    "Empresarial",
    46,
    15000,
    1,
    "Digitalizar e interoperar",
  ],
  [
    "Registro de marca comercial",
    "Industria",
    "Min. de Comercio",
    "Empresarial",
    120,
    6000,
    0,
    "Mejorar acceso y canales",
  ],
  [
    "Permiso de vertimientos",
    "Medio ambiente",
    "Min. de Ambiente",
    "Empresarial",
    540,
    1500,
    2,
    "Mejorar información",
  ],
  [
    "Registro de vehículos de carga",
    "Transporte",
    "Min. de Transporte",
    "Empresarial",
    38,
    20000,
    1,
    "Digitalizar e interoperar",
  ],
  [
    "Licencia de funcionamiento de farmacias",
    "Salud",
    "Min. de Salud",
    "Empresarial",
    210,
    3500,
    0,
    "Simplificar",
  ],
  [
    "Autorización de importación de medicamentos",
    "Salud",
    "Min. de Salud",
    "Empresarial",
    330,
    2200,
    0,
    "Reducir costos y tiempos",
  ],
  [
    "Registro mercantil",
    "Comercio",
    "Min. de Comercio",
    "Empresarial",
    52,
    14000,
    1,
    "Digitalizar e interoperar",
  ],
  [
    "Licencia de conducción",
    "Transporte",
    "Min. de Transporte",
    "Ciudadano",
    42,
    18000,
    1,
    "Mejorar acceso y canales",
  ],
  [
    "Registro de propiedad rural",
    "Agropecuario",
    "Min. de Agricultura",
    "Ciudadano",
    60,
    11000,
    1,
    "Mejorar información",
  ],
  [
    "Certificado de residencia fiscal",
    "Servicios financieros",
    "Min. de Hacienda",
    "Ciudadano",
    25,
    30000,
    1,
    "Digitalizar e interoperar",
  ],
  [
    "Solicitud de beca de estudio",
    "Educación",
    "Min. de Educación",
    "Ciudadano",
    18,
    40000,
    1,
    "Simplificar",
  ],
  [
    "Registro de operador de telecomunicaciones",
    "Telecomunicaciones",
    "Min. de las TIC",
    "Empresarial",
    280,
    2800,
    0,
    "Simplificar",
  ],
  [
    "Licencia de obra para telecomunicaciones",
    "Telecomunicaciones",
    "Min. de las TIC",
    "Empresarial",
    210,
    3600,
    2,
    "Reducir costos y tiempos",
  ],
  [
    "Certificado de producción orgánica",
    "Agropecuario",
    "Min. de Agricultura",
    "Empresarial",
    140,
    5200,
    0,
    "Mejorar acceso y canales",
  ],
  [
    "Registro fitosanitario",
    "Agropecuario",
    "Min. de Agricultura",
    "Empresarial",
    160,
    4800,
    0,
    "Simplificar",
  ],
  [
    "Permiso de pesca artesanal",
    "Pesca y acuicultura",
    "Min. de Agricultura",
    "Ciudadano",
    22,
    30000,
    1,
    "Simplificar",
  ],
  [
    "Registro nacional de turismo",
    "Turismo",
    "Min. de Comercio",
    "Empresarial",
    70,
    10000,
    1,
    "Digitalizar e interoperar",
  ],
  [
    "Licencia de exploración minera",
    "Minería",
    "Min. de Energía",
    "Empresarial",
    600,
    1300,
    0,
    "Mejorar información",
  ],
  [
    "Autorización de generación eléctrica",
    "Energía",
    "Min. de Energía",
    "Empresarial",
    700,
    1100,
    0,
    "Reducir costos y tiempos",
  ],
  [
    "Registro de operadores logísticos",
    "Transporte",
    "Min. de Transporte",
    "Empresarial",
    90,
    8400,
    1,
    "Digitalizar e interoperar",
  ],
  [
    "Apertura de sucursal financiera",
    "Servicios financieros",
    "Superintendencia Financiera",
    "Empresarial",
    380,
    2000,
    0,
    "Simplificar",
  ],
  [
    "Registro de emisores de valores",
    "Servicios financieros",
    "Superintendencia Financiera",
    "Empresarial",
    520,
    1500,
    0,
    "Reducir costos y tiempos",
  ],
  [
    "Registro de productos de consumo",
    "Industria",
    "Superintendencia de Industria",
    "Empresarial",
    85,
    9000,
    1,
    "Digitalizar e interoperar",
  ],
  [
    "Certificación de calidad de producto",
    "Industria",
    "Agencia Nacional de Regulación",
    "Empresarial",
    260,
    3000,
    0,
    "Mejorar información",
  ],
  [
    "Autorización de tarifas reguladas",
    "Energía",
    "Agencia Nacional de Regulación",
    "Empresarial",
    430,
    1800,
    2,
    "Mejorar acceso y canales",
  ],
  [
    "Inscripción en el registro de contribuyentes",
    "Comercio",
    "Min. de Hacienda",
    "Mixto",
    20,
    35000,
    1,
    "Digitalizar e interoperar",
  ],
];
export const TL_BASE: any[][] = (IMP_TRAM as any[][]).concat(TL_EXTRA);
const tlHash = (n: string) => impH("tr" + n);
/* Fila unificada. ctxTr: vista de Trámites (los cinco trámites de la tabla conservan sus valores; el resto se escala para quedar por debajo). */
export function tlRow(b: any[], sc: number, ctxTr?: boolean): TramRow {
  const h = tlHash(b[0]),
    o = ctxTr && TR_TABLA_ARR.find((t) => t[0] === b[0]);
  const r: TramRow = {
    k: b[0],
    sec: b[1],
    sub: IMP_SUB[b[1]] || "General",
    ent: b[2],
    usu: b[3],
    cu: b[4],
    vol: Math.round(b[5] * sc),
    acc: b[7],
    eta: h < 0.25 ? "Apertura" : h < 0.85 ? "Operación" : "Cierre",
    sev: h < 0.4 ? "Alta" : h < 0.8 ? "Media" : "Baja",
    tot: 0,
  };
  r.tot = r.cu * r.vol;
  if (o) {
    const [s1, s2] = o[1].split(" / ");
    const tot = +o[7].replace(/\./g, "");
    return {
      ...r,
      sec: s1,
      sub: s2 || r.sub,
      ent: o[2],
      eta: o[3],
      usu: o[4],
      sev: o[5] as TramRow["sev"],
      acc: o[8],
      tot,
      vol: Math.round(tot / r.cu),
    };
  }
  if (ctxTr) {
    r.tot = Math.round((r.tot * 0.045) / 1000) * 1000;
    r.vol = Math.max(1, Math.round(r.tot / r.cu));
  }
  return r;
}
export const tlFind = (name: string, sc: number, ctxTr?: boolean) =>
  tlRow(
    TL_BASE.find((b) => b[0] === name),
    sc,
    ctxTr,
  );
export const tlRowsTram = (): TramRow[] =>
  TL_BASE.map((b) => tlRow(b, 1, true)).sort((a, b) => b.tot - a.tot);
export function tlRowsCosteo(s: {
  pais: string;
  sec: string;
  ent: string;
  usu: string;
}): TramRow[] {
  const sc = s.pais === "Todos" ? 1 : TR_PAIS[s.pais][0] / TR_REG.tot;
  return TL_BASE.filter(
    (b) =>
      (s.sec === "Todos" || IMP_ADM[b[2]] === s.sec) &&
      (s.ent === "Todos" || b[2] === s.ent) &&
      (s.usu === "Todos" || b[3] === s.usu),
  )
    .map((b) => tlRow(b, sc, false))
    .sort((a, b) => b.tot - a.tot);
}

/* Contenido de la ficha. [descripción de la actividad, fricción, acción de simplificación] en el orden de las ocho actividades estándar */
const FX_ACT: string[][] = [
  [
    "Esfuerzo cognitivo para leer, interpretar y asimilar el marco legal, instructivos y fichas del trámite.",
    "Los requisitos están dispersos en varias normas y guías, y el solicitante debe interpretarlos por su cuenta.",
    "Publicar una guía única y actualizada con todos los requisitos del trámite.",
  ],
  [
    "Producción de documentos sustantivos desde cero (memorias, planes, diagramas) exigidos por la norma.",
    "Se exigen documentos nuevos y de alta complejidad, incluso para solicitudes de bajo riesgo.",
    "Diferenciar los documentos exigidos según el nivel de riesgo de la actividad.",
  ],
  [
    "Búsqueda, impresión, fotocopiado y cotejo de documentos ya existentes en el archivo del solicitante.",
    "Se piden documentos que el Estado ya posee en otros registros, y el solicitante debe reunirlos, imprimirlos y cotejarlos.",
    "Interoperar con los registros públicos para no volver a pedir documentos que ya existen.",
  ],
  [
    "Coordinación dentro de la organización para firmas de representación legal o validación del expediente.",
    "El expediente necesita varias firmas y validaciones de representación legal antes de presentarse.",
    "Aceptar firma electrónica y reducir las validaciones previas.",
  ],
  [
    "Captura de datos en formularios gubernamentales físicos o plataformas electrónicas oficiales.",
    "La misma información se repite en varios formularios físicos o plataformas distintas.",
    "Unificar los formularios y precargar los datos que la administración ya tiene.",
  ],
  [
    "Interacción logística para coordinar notarios, peritos o auditores exigidos por ley.",
    "Se exige la intervención de notarios, peritos o auditores externos para verificar información.",
    "Reemplazar la certificación externa por una declaración jurada con control posterior.",
  ],
  [
    "Resguardo y ordenamiento de expedientes físicos o digitales para futuras inspecciones de la autoridad.",
    "El solicitante debe conservar expedientes completos para posibles inspecciones.",
    "Conservar el expediente en una plataforma de la autoridad y no en la empresa.",
  ],
  [
    "Fricción física por el canal de atención presencial: transporte, filas y transacciones físicas.",
    "El trámite solo se atiende de forma presencial, con traslados, filas y pagos en ventanilla.",
    "Habilitar el canal en línea con pago electrónico.",
  ],
];
const FX_CARGAS: string[][] = [
  // [id, eje, título, subcategoría]
  [
    "DC-001",
    "Cumplimiento",
    "Documentación excesiva o redundante",
    "Requisitos y costos de cumplimiento",
  ],
  [
    "DC-002",
    "Cumplimiento",
    "Tasas, garantías y renovaciones recurrentes",
    "Costos y cargas recurrentes",
  ],
  [
    "DC-003",
    "Accesibilidad",
    "Atención solo presencial",
    "Canales de atención",
  ],
  [
    "DC-004",
    "Accesibilidad",
    "Solicitud repetida de información que el Estado ya posee",
    "Duplicidad e interoperabilidad",
  ],
  [
    "DC-005",
    "Certidumbre",
    "Plazos de resolución no definidos",
    "Plazos y criterios de decisión",
  ],
  [
    "DC-006",
    "Certidumbre",
    "Requisitos abiertos o discrecionales",
    "Discrecionalidad y debido proceso",
  ],
  [
    "DC-007",
    "Proporcionalidad",
    "Control no calibrado por riesgo",
    "Inspección y riesgo",
  ],
  [
    "DC-008",
    "Proporcionalidad",
    "Requisitos iguales para empresas de distinto tamaño",
    "Afectación a las MIPYMEs",
  ],
];
export const FX_SEVN: Record<number, string> = {
  4: "Crítico",
  3: "Alto",
  2: "Medio",
};
const FX_FREQ: [string, number][] = [
  ["Anual", 1],
  ["Semestral", 2],
  ["Trimestral", 4],
  ["Mensual", 12],
];
export const fxDur = (m: number) =>
  m < 60
    ? m + " min"
    : m % 60 === 0
      ? m / 60 + " h"
      : Math.floor(m / 60) + " h " + (m % 60) + " min";
export function fxBuild(r: TramRow) {
  const h = (s) => impH("fx" + r.k + s);
  const ca = r.cu * caShare(r.k),
    cop = r.cu - ca;
  const rate =
    ({ Empresarial: 24, Ciudadano: 7, Mixto: 14 }[r.usu] || 14) *
    (0.9 + 0.2 * h("r"));
  const w = IMP_ACT.map(([, v], i) => v * (0.6 + 0.8 * h("a" + i))),
    wt = w.reduce((a, x) => a + x, 0);
  const costs = w.map((x) => Math.round((ca * x) / wt));
  costs[costs.indexOf(Math.max(...costs))] +=
    Math.round(ca) - costs.reduce((a, x) => a + x, 0);
  const mins = costs.map((c) =>
    Math.max(5, Math.round(((c / rate) * 60) / 5) * 5),
  );
  const nF = r.sev === "Alta" ? 3 : r.sev === "Media" ? 2 : 1;
  const fr = IMP_ACT.map((_, i) => [i, h("f" + i)])
    .sort((a, b) => b[1] - a[1])
    .slice(0, nF)
    .map((x) => x[0]);
  const acts = IMP_ACT.map(([k], i) => ({
    n: i + 1,
    k,
    d: FX_ACT[i][0],
    usd: costs[i],
    min: mins[i],
    fr: fr.includes(i) ? { f: FX_ACT[i][1], a: FX_ACT[i][2] } : null,
  }));
  const caSum = costs.reduce((a, x) => a + x, 0) || 1,
    frAct = acts.filter((a) => a.fr).sort((a, b) => b.usd - a.usd);
  const frPct = Math.round(
    (100 * frAct.reduce((a, x) => a + x.usd, 0)) / caSum,
  );
  const fq = /mensual/i.test(r.k)
    ? FX_FREQ[3]
    : FX_FREQ[Math.floor(h("q") * 4)];
  const nC = r.sev === "Alta" ? 3 : 2;
  const cargas = FX_CARGAS.map((c) => ({
    id: c[0],
    eje: c[1],
    t: c[2],
    s: c[3],
    n: 2 + Math.floor(h("s" + c[0]) * 3),
  }))
    .sort((a, b) => h("c" + a.id) - h("c" + b.id))
    .slice(0, nC)
    .map((c, i) => ({ ...c, n: r.sev === "Alta" && i === 0 ? 4 : c.n }))
    .sort((a, b) => b.n - a.n);
  const tipo = ["Decreto", "Resolución", "Ley"][Math.floor(h("t") * 3)];
  return {
    acts,
    min: mins.reduce((a, x) => a + x, 0),
    cop,
    plazo: 2 + Math.round(38 * h("p")),
    fq,
    cargas,
    prior: r.sev === "Alta",
    diag:
      (frAct[0] ? frAct[0].fr.f + " " : "") +
      (frAct.length === 1
        ? "La actividad con fricción concentra"
        : "Las " + frAct.length + " actividades con fricción concentran") +
      " el " +
      frPct +
      " % del costo activo del trámite.",
    val: h("v") < 0.5 ? "Preliminar" : "Validado",
    norma:
      tipo +
      " " +
      Math.round(100 + h("n") * 900) +
      " de " +
      (2012 + Math.floor(h("y") * 12)),
    art: "Artículo " + (3 + Math.floor(h("ar") * 40)),
    fuente: "Portal oficial de trámites",
  };
}

/* ================= Barreras ================= */
export const BL_EXTRA: any[][] = [
  [
    "Autorización previa para la apertura de sucursales bancarias",
    "Servicios financieros",
    "Entrada",
    "Competencia",
    "Decreto 2555 de 2010",
    "Superintendencia Financiera",
    "Alta",
    "Simplificar cargas",
  ],
  [
    "Capital mínimo para operadores de servicios financieros",
    "Servicios financieros",
    "Entrada",
    "Inversión",
    "Decreto 2555 de 2010",
    "Superintendencia Financiera",
    "Media",
    "Regular según riesgo",
  ],
  [
    "Límites a la participación extranjera en el capital",
    "Servicios financieros",
    "Entrada",
    "Inversión",
    "Ley 1328 de 2009",
    "Superintendencia Financiera",
    "Alta",
    "Corregir distorsiones de mercado",
  ],
  [
    "Licencia de generación eléctrica con renovación periódica",
    "Energía",
    "Operación",
    "Inversión",
    "Ley 143 de 1994",
    "Ministerio de Energía",
    "Media",
    "Simplificar cargas",
  ],
  [
    "Exclusividad territorial en distribución de combustibles",
    "Energía",
    "Entrada",
    "Competencia",
    "Decreto 1073 de 2015",
    "Ministerio de Energía",
    "Alta",
    "Corregir distorsiones de mercado",
  ],
  [
    "Tarifas reguladas sin revisión periódica",
    "Energía",
    "Operación",
    "Innovación",
    "Resolución 119 de 2007",
    "Agencia Nacional de Regulación",
    "Media",
    "Reducir discrecionalidad",
  ],
  [
    "Licencia de importación para bienes de consumo",
    "Comercio",
    "Entrada",
    "Comercio",
    "Decreto 925 de 2013",
    "Ministerio de Comercio",
    "Alta",
    "Digitalizar e interoperar",
  ],
  [
    "Registro obligatorio de importadores cada año",
    "Comercio",
    "Operación",
    "Comercio",
    "Decreto 1165 de 2019",
    "Dirección General de Aduanas",
    "Media",
    "Simplificar cargas",
  ],
  [
    "Requisitos de contenido local en compras públicas",
    "Comercio",
    "Operación",
    "Competencia",
    "Ley 80 de 1993",
    "Ministerio de Comercio",
    "Media",
    "Reducir discrecionalidad",
  ],
  [
    "Restricción de horarios de operación en comercio minorista",
    "Comercio",
    "Operación",
    "Competencia",
    "Decreto 1074 de 2015",
    "Municipalidades",
    "Baja",
    "Regular según riesgo",
  ],
  [
    "Autorización de rutas con cupos limitados",
    "Transporte",
    "Entrada",
    "Competencia",
    "Decreto 1079 de 2015",
    "Ministerio de Transporte",
    "Alta",
    "Corregir distorsiones de mercado",
  ],
  [
    "Edad máxima de vehículos de carga",
    "Transporte",
    "Operación",
    "Inversión",
    "Resolución 7036 de 2012",
    "Ministerio de Transporte",
    "Media",
    "Regular según riesgo",
  ],
  [
    "Habilitación presencial anual de empresas de transporte",
    "Transporte",
    "Operación",
    "Comercio",
    "Decreto 1079 de 2015",
    "Ministerio de Transporte",
    "Baja",
    "Digitalizar e interoperar",
  ],
  [
    "Espectro asignado sin mecanismos de reasignación",
    "Telecomunicaciones",
    "Entrada",
    "Competencia",
    "Ley 1341 de 2009",
    "Ministerio de TIC",
    "Alta",
    "Corregir distorsiones de mercado",
  ],
  [
    "Permisos municipales múltiples para instalar infraestructura",
    "Telecomunicaciones",
    "Operación",
    "Inversión",
    "Ley 1978 de 2019",
    "Municipalidades",
    "Media",
    "Simplificar cargas",
  ],
  [
    "Licencia ambiental para proyectos mineros de pequeña escala",
    "Minería",
    "Entrada",
    "Inversión",
    "Decreto 1076 de 2015",
    "Ministerio de Ambiente",
    "Alta",
    "Regular según riesgo",
  ],
  [
    "Contratos de concesión sin posibilidad de cesión",
    "Minería",
    "Operación",
    "Inversión",
    "Ley 685 de 2001",
    "Ministerio de Energía",
    "Media",
    "Reducir discrecionalidad",
  ],
  [
    "Certificación de calidad obligatoria para todo producto",
    "Industria",
    "Entrada",
    "Comercio",
    "Decreto 1595 de 2015",
    "Superintendencia de Industria",
    "Media",
    "Regular según riesgo",
  ],
  [
    "Reglamentos técnicos distintos a estándares internacionales",
    "Industria",
    "Operación",
    "Comercio",
    "Decreto 1074 de 2015",
    "Ministerio de Comercio",
    "Media",
    "Reducir discrecionalidad",
  ],
  [
    "Registro sanitario previo para cada presentación de producto",
    "Salud",
    "Entrada",
    "Competencia",
    "Decreto 677 de 1995",
    "Ministerio de Salud",
    "Alta",
    "Simplificar cargas",
  ],
  [
    "Prohibición de publicidad de servicios de salud",
    "Salud",
    "Operación",
    "Innovación",
    "Ley 1751 de 2015",
    "Ministerio de Salud",
    "Baja",
    "Corregir distorsiones de mercado",
  ],
  [
    "Restricciones a la venta de medicamentos fuera de farmacias",
    "Salud",
    "Operación",
    "Competencia",
    "Decreto 780 de 2016",
    "Ministerio de Salud",
    "Media",
    "Regular según riesgo",
  ],
  [
    "Compra de predios rurales sujeta a autorización",
    "Agropecuario",
    "Entrada",
    "Inversión",
    "Ley 160 de 1994",
    "Ministerio de Agricultura",
    "Alta",
    "Reducir discrecionalidad",
  ],
  [
    "Certificado fitosanitario por cada despacho",
    "Agropecuario",
    "Operación",
    "Comercio",
    "Resolución 3168 de 2015",
    "Ministerio de Agricultura",
    "Media",
    "Digitalizar e interoperar",
  ],
  [
    "Licencia de construcción con silencio administrativo negativo",
    "Construcción",
    "Entrada",
    "Inversión",
    "Decreto 1077 de 2015",
    "Municipalidades",
    "Alta",
    "Simplificar cargas",
  ],
  [
    "Normas de uso del suelo sin zonificación actualizada",
    "Construcción",
    "Operación",
    "Inversión",
    "Ley 388 de 1997",
    "Municipalidades",
    "Media",
    "Reducir discrecionalidad",
  ],
  [
    "Reconocimiento de títulos extranjeros con trámite discrecional",
    "Educación",
    "Entrada",
    "Competencia",
    "Resolución 20797 de 2017",
    "Ministerio de Educación",
    "Media",
    "Reducir discrecionalidad",
  ],
  [
    "Licencia para operadores turísticos con aval gremial",
    "Turismo",
    "Entrada",
    "Competencia",
    "Ley 300 de 1996",
    "Ministerio de Comercio",
    "Media",
    "Corregir distorsiones de mercado",
  ],
  [
    "Cupos de pesca asignados sin criterios públicos",
    "Pesca y acuicultura",
    "Entrada",
    "Competencia",
    "Ley 13 de 1990",
    "Ministerio de Agricultura",
    "Alta",
    "Reducir discrecionalidad",
  ],
  [
    "Plan de manejo ambiental con renovación anual",
    "Medio ambiente",
    "Operación",
    "Inversión",
    "Decreto 1076 de 2015",
    "Ministerio de Ambiente",
    "Baja",
    "Simplificar cargas",
  ],
  [
    "Plazos de evaluación ambiental sin límite máximo",
    "Medio ambiente",
    "Entrada",
    "Innovación",
    "Decreto 1076 de 2015",
    "Ministerio de Ambiente",
    "Media",
    "Reducir discrecionalidad",
  ],
];
export const BL_BASE: any[][] = B_TABLA.concat(BL_EXTRA);
const BL_CAN: Record<string, string> = {
  Competencia: "Competencia",
  Comercio: "Comercio",
  Inversión: "Inversión",
  Innovación: "Innovación",
};
const BL_PRIOR: Record<string, string> = {
  Alta: "Alta",
  Media: "Media",
  Baja: "Baja",
};
export function blRow(b: any[], country: string): BarRow {
  const h = impH("bl" + b[0]),
    c = COUNTRIES.find((x) => x.name === country) || COUNTRIES[3];
  const [s1, s2] = b[1].split(" / ");
  return {
    k: b[0],
    sec: s1,
    sub: s2 || IMP_SUB[s1] || "General",
    eje: b[2],
    amb: b[3],
    reg: b[4],
    ent: b[5],
    sev: b[6],
    acc: b[7],
    id: c.id + "-BAR-" + String(Math.round(100 + h * 8899)).padStart(4, "0"),
    anio: 2012 + Math.floor(h * 13),
    pais: c.name,
  };
}
export const blFind = (name: string, country: string) =>
  blRow(
    BL_BASE.find((b) => b[0] === name),
    country,
  );
export const blRows = (country: string): BarRow[] =>
  BL_BASE.map((b) => blRow(b, country));
const BF_TEMA: Record<string, string> = {
  Competencia:
    "Esta barrera limita la entrada de nuevos competidores o reduce la rivalidad entre los existentes, lo que puede traducirse en menos opciones y precios más altos para empresas y consumidores.",
  Comercio:
    "Esta barrera encarece o demora el intercambio de bienes y servicios, y reduce la capacidad de las empresas de integrarse a cadenas de valor y de acceder a nuevos mercados.",
  Inversión:
    "Esta barrera aumenta el costo o la incertidumbre de invertir, y puede llevar a posponer o cancelar proyectos, y a reducir la expansión de las empresas ya establecidas.",
  Innovación:
    "Esta barrera limita la posibilidad de introducir nuevos productos, procesos o modelos de negocio, y puede frenar la adopción de tecnologías y la mejora de la productividad.",
};
const BF_SEV: Record<string, string> = {
  Alta: "El efecto es severo: puede bloquear, excluir o desalentar fuertemente la actividad.",
  Media:
    "El efecto es significativo: exige recursos, tiempo o ajustes no triviales.",
  Baja: "El efecto es menor y acotado: implica un costo o una incertidumbre marginal.",
};
const BF_RESTR: string[] = [
  "Autorización previa obligatoria",
  "Certificación previa obligatoria",
  "Cupo o límite cuantitativo",
  "Requisito de capital o patrimonio",
  "Restricción de precios o tarifas",
  "Requisito de presencia local",
];
const BF_CAMB: string[] = [
  "Normativo (ley)",
  "Reglamentario (decreto o resolución)",
  "Administrativo (procedimiento)",
];
const BF_CANAL: Record<string, string> = {
  Competencia: "Incumbentes y competencia",
  Comercio: "Costo administrativo",
  Inversión: "Capital y liquidez",
  Innovación: "Modelo de negocio",
};
export const BF_ETAPA: Record<string, string> = {
  Entrada: "Apertura",
  Operación: "Operación",
};
export function bfBuild(r: BarRow) {
  const h = (s) => impH("bf" + r.k + s),
    art = 3 + Math.floor(h("a") * 60),
    esEnt = r.eje === "Entrada";
  const hl = esEnt
    ? "Ninguna persona o empresa podrá iniciar actividades en " +
      r.sec.toLowerCase() +
      " sin contar previamente con la autorización expresa de la autoridad competente"
    : "Quien desarrolle actividades en " +
      r.sec.toLowerCase() +
      " deberá mantener vigente el permiso o registro exigido y renovarlo ante la autoridad competente en los plazos que ésta fije";
  const rest = esEnt
    ? " a la fecha de presentación de la solicitud. La autoridad podrá negar o suspender la solicitud cuando considere que no se cumplen las condiciones, sin perjuicio del historial de cumplimiento del solicitante."
    : ", sin perjuicio del historial de cumplimiento del titular. La autoridad podrá suspender la actividad mientras se resuelve la renovación.";
  const fin =
    "El incumplimiento de esta disposición acarreará la suspensión de las actividades hasta su regularización, sin perjuicio de las sanciones administrativas correspondientes.";
  const val = h("v") < 0.5 ? "Preliminar" : "Validado";
  return {
    art,
    hl,
    rest,
    fin,
    val,
    restr: BF_RESTR[Math.floor(h("r") * BF_RESTR.length)],
    canal: BF_CANAL[r.amb] || "Costo administrativo",
    mip: ["Alta", "Media", "Baja"][Math.floor(h("m") * 3)],
    cambio: BF_CAMB[Math.floor(h("c") * 3)],
    fact: ["Alta", "Media", "Baja"][Math.floor(h("f") * 3)],
    dx: BF_TEMA[r.amb] + " " + BF_SEV[r.sev],
    link: "gaceta.gob/normas/" + r.id.toLowerCase(),
    /* Campos que normalmente salen del dato real; por defecto se derivan de la fila. */
    jerarquia: r.reg.split(" ")[0],
    etapa: BF_ETAPA[r.eje] ?? "Operación",
    sevIA: r.sev as string,
    sevVal: (val === "Validado" ? r.sev : "Pendiente") as string,
    cBID:
      val === "Validado"
        ? "Confirmado como barrera; se recomienda priorizar su revisión."
        : "Sin comentarios",
    cCons:
      val === "Validado"
        ? "Se sugiere reemplazar el requisito por una declaración con verificación posterior."
        : "Sin comentarios",
    cGob: "Sin retroalimentación de gobierno",
    prior: r.sev as string,
    /** Texto normativo real: antes / pasaje resaltado / después. Si falta, se muestra un texto de muestra. */
    texto: null as null | { antes: string; resaltado: string; despues: string },
  };
}
