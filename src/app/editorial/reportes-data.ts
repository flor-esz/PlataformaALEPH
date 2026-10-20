// Datos de ejemplo de Reportes: catálogo de salidas, filtros por defecto y conteo estimado de registros.
// Con datos reales, desarrollo sustituye `rpData` (misma forma de salida: `ReporteConteo`).
import { impShare } from "./costeo-data";
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
  per: "2015–2024",
  sev: "Todas",
  eje: "Todos",
  usu: "Todos",
};
export const RP_EJES: Record<string, string[]> = {
  Todos: [
    "Entrada",
    "Operación",
    "Cumplimiento",
    "Accesibilidad",
    "Certidumbre",
    "Proporcionalidad",
  ],
  Distorsión: ["Entrada", "Operación"],
  Carga: ["Cumplimiento", "Accesibilidad", "Certidumbre", "Proporcionalidad"],
  "Calidad regulatoria": [],
};
export const RP_FMT: ReporteFormato[] = ["PDF", "PPT editable", "Excel"];
export function rpData(f: ReporteFiltros): ReporteConteo {
  const sc = f.pais === "Todos" ? 1 : (TR_PAIS as any)[f.pais][0] / TR_REG.tot;
  const sh = (rows: [string, number][], k: string) => (k === "Todos" ? 1 : impShare(rows, k));
  const base =
    sc *
    sh(TR_REG.sector, f.sec) *
    sh(TR_REG.entidad, f.ent) *
    ({ Todos: 1, Validado: 0.74, Preliminar: 0.18, Simulado: 0.08 } as Record<string, number>)[f.hitl] *
    ({ "2015–2024": 1, "2020–2024": 0.72, "2024": 0.21 } as Record<string, number>)[f.per];
  let bf = (
      { Todos: 1, Distorsión: 1, Carga: 0, "Calidad regulatoria": 0.06 } as Record<string, number>
    )[f.tipo],
    tf = (
      { Todos: 1, Distorsión: 0, Carga: 1, "Calidad regulatoria": 0.04 } as Record<string, number>
    )[f.tipo];
  const sv =
    f.sev === "Todas"
      ? 1
      : TR_REG.sev[["Alta", "Media", "Baja"].indexOf(f.sev)] / TR_REG.tot;
  if (f.eje !== "Todos") {
    if (["Entrada", "Operación"].includes(f.eje)) {
      bf *= 0.5;
      tf = 0;
    } else {
      tf *= 0.25;
      bf = 0;
    }
  }
  if (f.usu !== "Todos") ((bf = 0), (tf *= sh(TR_REG.usuario, f.usu)));
  return {
    nb: Math.round(1250 * base * bf * sv),
    nt: Math.round(1842 * base * tf * sv),
    cob: idrData(f.pais).cob,
  };
}

