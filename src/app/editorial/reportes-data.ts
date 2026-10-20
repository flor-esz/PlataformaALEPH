// Datos de ejemplo de Reportes: catálogo de salidas, filtros por defecto y conteo estimado de registros.
// Con datos reales, desarrollo sustituye `rpData` (misma forma de salida: `ReporteConteo`).
import { impH, impShare } from "./costeo-data";
import { TR_PAIS, TR_REG } from "./fixtures";
import { I } from "./icons";
import { idrData } from "./idr-data";
import type {
  ReporteConteo,
  ReporteFiltros,
  ReporteFormato,
  ReporteTipo,
} from "./types";

export interface RpTipo {
  g: "Reportes" | "Bases en Excel";
  t: string;
  aud: string;
  ico: string;
  fm: ReporteFormato[];
  d: string;
  inc: string[];
}

export const RP_TYPES: Record<ReporteTipo, RpTipo> = {
  estrategico: {
    g: "Reportes",
    t: "Reporte estratégico",
    aud: "Gobiernos, jefes de equipo, BID",
    ico: I.globe,
    fm: ["PDF", "PPT editable"],
    d: "Insumo para reuniones de alto nivel: panorama, patrones, prioridades y agenda de mejora.",
    inc: [
      "País, sector y entidad",
      "Alcance, fuentes y cobertura",
      "Estado HITL",
      "Mensajes clave y patrones",
      "Sectores y entidades prioritarias",
      "IDR general",
      "Acciones de mejora sugeridas",
      "Limitaciones y próximos pasos",
    ],
  },
  operativo: {
    g: "Reportes",
    t: "Reporte operativo",
    aud: "Equipos técnicos, consultores, BID",
    ico: I.layers,
    fm: ["PDF", "Excel"],
    d: "Ficha técnica para revisar hallazgos y convertirlos en acciones de mejora. Permite agregar por instrumento regulatorio.",
    inc: [
      "ID del hallazgo y fuente",
      "Cita o evidencia",
      "Clasificación y severidad",
      "Canal de transmisión",
      "Afectación a las MIPYMEs y proporcionalidad",
      "Acción de mejora",
      "Estado HITL, comentarios y uso permitido",
    ],
  },
  xbar: {
    g: "Bases en Excel",
    t: "Excel de barreras",
    aud: "Equipo BID, consultores, analistas sectoriales",
    ico: I.barreras,
    fm: ["Excel"],
    d: "Base completa o filtrada de barreras.",
    inc: [
      "ID, país, sector, entidad e instrumento",
      "Cita",
      "Eje, subcategoría y canal",
      "Severidad y estado HITL",
      "Acción de mejora y uso permitido",
    ],
  },
  xtra: {
    g: "Bases en Excel",
    t: "Excel de trámites",
    aud: "Equipo BID, consultores, analistas sectoriales",
    ico: I.tramites,
    fm: ["Excel"],
    d: "Base completa o filtrada de trámites.",
    inc: [
      "Entidad, usuario y requisitos",
      "Pasos, costos, tiempo y frecuencia",
      "Eje de carga y costeo estándar (SCM)",
      "Estado HITL y acción de mejora",
    ],
  },
};
export const RP_ALL: ReporteFiltros = {
  pais: "Todos",
  sec: "Todos",
  ent: "Todos",
  tipo: "Todos",
  hitl: "Todos",
  desde: "2015",
  hasta: "2024",
  sev: "Todas",
  usu: "Todos",
};
export const RP_YEARS = [
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
];
/** Peso de ejemplo por año (suma 1). */
export const RP_YW: Record<string, number> = {
  2015: 0.04,
  2016: 0.05,
  2017: 0.05,
  2018: 0.06,
  2019: 0.08,
  2020: 0.07,
  2021: 0.11,
  2022: 0.15,
  2023: 0.18,
  2024: 0.21,
};
export const RP_TIPOS = ["Barreras", "Trámites"];
/** Entidades de ejemplo por país: cada país tiene las suyas (con datos reales, salen del catálogo). */
export const RP_ENTS: Record<string, string[]> = {
  Argentina: [
    "Ministerio de Economía",
    "Secretaría de Industria y Comercio",
    "ARCA (recaudación y aduanas)",
    "Banco Central (BCRA)",
    "Ministerio de Salud",
    "ENACOM",
  ],
  Bolivia: [
    "Min. de Economía y Finanzas Públicas",
    "Min. de Desarrollo Productivo",
    "Servicio de Impuestos Nacionales",
    "Aduana Nacional",
    "ASFI",
    "Min. de Salud y Deportes",
  ],
  Chile: [
    "Ministerio de Hacienda",
    "Ministerio de Economía",
    "Servicio de Impuestos Internos",
    "Servicio Nacional de Aduanas",
    "CMF",
    "Ministerio de Salud",
  ],
  Colombia: [
    "Min. de Hacienda",
    "Min. de Comercio",
    "DIAN",
    "Superintendencia Financiera",
    "Superintendencia de Industria",
    "Min. de Salud",
  ],
  Perú: [
    "MEF",
    "Ministerio de la Producción",
    "SUNAT",
    "SBS",
    "MINSA",
    "INDECOPI",
  ],
  Panamá: [
    "Min. de Economía y Finanzas",
    "Min. de Comercio e Industrias",
    "Autoridad Nacional de Aduanas",
    "Superintendencia de Bancos",
    "Ministerio de Salud",
    "AMPYME",
  ],
};
export const rpYears = (f: { desde: string; hasta: string }) =>
  RP_YEARS.filter((y) => y >= f.desde && y <= f.hasta);
export const rpPer = (f: { desde: string; hasta: string }) =>
  f.desde === f.hasta ? f.desde : f.desde + "–" + f.hasta;
export const RP_FMT: ReporteFormato[] = ["PDF", "PPT editable", "Excel"];
export function rpData(f: ReporteFiltros): ReporteConteo {
  const sc = f.pais === "Todos" ? 1 : (TR_PAIS as any)[f.pais][0] / TR_REG.tot;
  const sh = (rows: [string, number][], k: string) =>
    k === "Todos" ? 1 : impShare(rows, k);
  const base =
    sc *
    sh(TR_REG.sector, f.sec) *
    (f.ent === "Todos" ? 1 : 0.08 + 0.14 * impH(f.pais + f.ent)) *
    (
      { Todos: 1, Validado: 0.74, Preliminar: 0.18, Simulado: 0.08 } as Record<
        string,
        number
      >
    )[f.hitl] *
    rpYears(f).reduce((a, y) => a + RP_YW[y], 0);
  let bf = f.tipo === "Trámites" ? 0 : 1,
    tf = f.tipo === "Barreras" ? 0 : 1;
  const sv =
    f.sev === "Todas"
      ? 1
      : TR_REG.sev[["Alta", "Media", "Baja"].indexOf(f.sev)] / TR_REG.tot;
  if (f.usu !== "Todos") ((bf = 0), (tf *= sh(TR_REG.usuario, f.usu)));
  return {
    nb: Math.round(1250 * base * bf * sv),
    nt: Math.round(1842 * base * tf * sv),
    cob: idrData(f.pais).cob,
  };
}
