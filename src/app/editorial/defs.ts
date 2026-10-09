// Definiciones del icono ⓘ (texto editorial; las edita contenido, no código)
export interface Def {
  t: string;
  d: string;
  how?: string;
}
/* ===== Icono de definición (ⓘ): definiciones y popover ===== */
export const DEFS: Record<string, Def> = {
  pan: {
    t: "Panorama regulatorio",
    d: "Vista general del acervo normativo vigente en los países analizados: cuántas regulaciones hay, cómo han evolucionado desde 2015 y cómo se distribuyen por país, sector y tipo de regulación.",
    how: "Cambia entre la vista regional y la vista por país con «Nivel de visualización».",
  },
  bar: {
    t: "Barreras regulatorias",
    d: "Disposiciones normativas vigentes que dificultan la entrada de nuevos actores al mercado o que encarecen y limitan su operación. Se identifican dentro de las regulaciones y se clasifican por tipo, severidad, ámbito de impacto, país, sector y entidad emisora.",
    how: "Una regulación puede contener más de una barrera.",
  },
  tot: {
    t: "Barreras regulatorias totales",
    d: "Número total de barreras identificadas en los países analizados. Es la suma de las barreras de entrada y acceso al mercado y las de operación y modelos de negocio.",
    how: "Entrada + Operación = Total (100 %).",
  },
  ent: {
    t: "Barreras de entrada y acceso al mercado",
    d: "Restricciones que afectan la entrada, la participación o el acceso de actores al mercado.",
    how: "El porcentaje indica qué parte del total representan.",
  },
  ope: {
    t: "Barreras de operación y modelos de negocio",
    d: "Restricciones que afectan cómo las empresas operan o desarrollan sus modelos de negocio una vez están en el mercado.",
    how: "El porcentaje indica qué parte del total representan.",
  },
  sev: {
    t: "Nivel de severidad",
    d: "Qué tan fuerte es el efecto de la barrera para quien debe cumplirla. Se clasifica en Alta, Media y Baja.",
    how: "Más barras llenas en el marcador, mayor severidad.",
  },
  amb: {
    t: "Ámbito de impacto",
    d: "Área de política pública sobre la que actúa la barrera: Competencia, Comercio, Inversión o Innovación.",
    how: "Cada porción es un ámbito; el centro muestra el total. Se ordenan de mayor a menor.",
  },
  jer: {
    t: "Jerarquía normativa",
    d: "Rango de la norma donde está la barrera, desde el nivel legislativo hasta el procedimental o de trámites.",
    how: "Se ordenan de mayor a menor número de barreras; el tono de azul identifica cada nivel.",
  },
  sec: {
    t: "Sector económico",
    d: "Sector de la economía al que afecta la barrera.",
    how: "Se muestran los sectores con más barreras.",
  },
  eni: {
    t: "Entidad emisora",
    d: "Organismo que emitió la regulación en la que se encuentra la barrera.",
    how: "Ordenadas de mayor a menor número de barreras.",
  },
  sec1: {
    t: "Dónde se concentran las barreras",
    d: "Compara cómo se reparten las barreras según ámbito de impacto, jerarquía normativa, sector económico y entidad emisora.",
    how: "Cada gráfica tiene sus propios filtros.",
  },
  sec2: {
    t: "Barreras por país",
    d: "Resumen de las barreras de cada país, divididas entre entrada y operación. Selecciona un país para explorar su detalle.",
  },
  sec3: {
    t: "Principales barreras de un país",
    d: "Muestra de las barreras identificadas en un país, con su tipo, ámbito, regulación de origen, entidad emisora, severidad y la acción sugerida.",
  },
  tipo: {
    t: "Tipo de barrera",
    d: "Entrada, si limita el acceso al mercado; Operación, si afecta cómo se opera o se desarrolla un modelo de negocio.",
  },
  accion: { t: "Acción sugerida", d: "Recomendación de mejora para reducir o eliminar la barrera." },
  vig: {
    t: "Regulaciones vigentes",
    d: "Número de regulaciones que están en vigor cada año. Es un acervo acumulado: suma las nuevas y descuenta las derogadas.",
    how: "Pasa el cursor por la gráfica o por «Valor actual» para comparar.",
  },
  vigsec: {
    t: "Regulaciones por sector",
    d: "Evolución de las regulaciones vigentes en cada sector económico.",
    how: "Un sector resaltado, los demás en gris. Cambia el Top con «Mostrar».",
  },
  vigtipo: {
    t: "Tipo de regulación",
    d: "Clase de norma: ley, decreto, resolución, circular, reglamento y otras.",
    how: "Evolución de las regulaciones vigentes por clase.",
  },
  car: {
    t: "Características del acervo",
    d: "Indicadores que describen cómo es el conjunto de regulaciones vigentes de cada país, por ejemplo su cantidad o su extensión.",
    how: "Cambia el indicador con el selector «Indicador».",
  },
  bact: {
    t: "Dónde actuar para reducir las barreras",
    d: "Acciones sugeridas para reducir o eliminar las barreras identificadas y lectura rápida de los datos del país.",
  },
  bacc: {
    t: "Barreras por acción sugerida",
    d: "Recomendación de mejora para cada barrera: simplificar, eliminar, clarificar o proporcionalizar.",
    how: "Cada porción es una acción; se ordenan de mayor a menor.",
  },
  tra: {
    t: "Trámites con potencial de mejora",
    d: "Procedimientos, requisitos y gestiones que deben cumplir empresas y ciudadanos ante las entidades públicas y que presentan oportunidades de simplificación, digitalización o reducción de cargas.",
    how: "Cambia entre la vista regional y la vista por país con «Nivel de visualización».",
  },
  ktr: {
    t: "Trámites identificados",
    d: "Número de trámites con potencial de mejora identificados en los países analizados.",
    how: "Un trámite se cuenta una sola vez.",
  },
  kent: { t: "Entidades responsables", d: "Entidades públicas que gestionan los trámites identificados." },
  ksec: { t: "Sectores cubiertos", d: "Sectores económicos a los que pertenecen los trámites identificados." },
  kcost: {
    t: "Costo administrativo estimado",
    d: "Estimación del costo, en millones de dólares, que los trámites identificados generan a quienes deben cumplirlos.",
    how: "Valor estimado a partir de actividades estándar.",
  },
  tsev: {
    t: "Nivel de severidad",
    d: "Qué tan pesado es el trámite para quien debe cumplirlo. Se clasifica en Alta, Media y Baja.",
    how: "Más barras llenas en el marcador, mayor severidad.",
  },
  tsect: {
    t: "Trámites por sector económico",
    d: "Sector de la economía al que pertenece el trámite.",
    how: "Ordenados de mayor a menor. Elige cuántos mostrar con «Mostrar».",
  },
  tent: {
    t: "Trámites por entidad responsable",
    d: "Entidad pública que gestiona el trámite.",
    how: "Ordenadas de mayor a menor. Elige cuántas mostrar con «Mostrar».",
  },
  teta: {
    t: "Etapa del ciclo empresarial",
    d: "Momento de la vida de la empresa en que se realiza el trámite: apertura, operación, expansión o cierre.",
    how: "Se respeta el orden del ciclo, no el de tamaño.",
  },
  tusu: {
    t: "Tipo de usuario",
    d: "Quién realiza el trámite: una empresa, un ciudadano o ambos (mixto).",
    how: "Ordenados de mayor a menor número de trámites.",
  },
  topo: {
    t: "Oportunidad de mejora",
    d: "Tipo de mejora que podría aplicarse al trámite. Un mismo trámite puede presentar más de una.",
    how: "Los porcentajes no suman 100 % porque un trámite puede tener varias oportunidades.",
  },
  tacc: {
    t: "Acción de mejora sugerida",
    d: "Recomendación para reducir la carga del trámite: simplificar, digitalizar, interoperar, clarificar o proporcionalizar.",
    how: "Un trámite puede tener más de una acción sugerida.",
  },
  tcact: {
    t: "Costo por actividad estándar",
    d: "Costo estimado de las actividades estándar que componen los trámites.",
    how: "Cambia entre costo y número de trámites con «Indicador».",
  },
  tcusu: {
    t: "Costos administrativos por usuario",
    d: "Costo estimado que los trámites generan según el tipo de usuario que los realiza.",
  },
  tafe: {
    t: "Afectaciones",
    d: "Principales problemas que los trámites generan a los usuarios, como costos, demoras o duplicidad.",
    how: "Un trámite puede presentar más de una afectación.",
  },
  tmip: {
    t: "Afectación a la MIPYME",
    d: "Qué tanto afectan los trámites a las micro, pequeñas y medianas empresas. Se clasifica en Alta, Media y Baja.",
    how: "Más barras llenas en el marcador, mayor afectación.",
  },
  thall: { t: "Hallazgos clave", d: "Lectura rápida de los datos más relevantes de la vista." },
  tsec1: {
    t: "Dónde se concentran los trámites",
    d: "Compara cómo se reparten los trámites según sector, entidad, etapa del ciclo empresarial y tipo de usuario.",
    how: "Cada gráfica tiene sus propios filtros.",
  },
  tcar: { t: "Cargas para los usuarios", d: "Estimación de costos y principales afectaciones que generan los trámites." },
  tact: {
    t: "Dónde actuar para simplificar",
    d: "Oportunidades de mejora y acciones sugeridas para reducir la carga de los trámites.",
  },
  tpais: {
    t: "Trámites por país",
    d: "Resumen de los trámites de cada país según su nivel de severidad. Selecciona un país para explorar su detalle.",
  },
  ttab: {
    t: "Principales trámites",
    d: "Muestra de los trámites identificados en un país, con su sector, entidad, etapa, usuario, severidad, oportunidad de mejora, costo y acción sugerida.",
  },
  demo: {
    t: "Ejemplo de definición",
    d: "Texto breve que explica qué es el elemento, en lenguaje sencillo y sin jerga. Máximo unas 40 palabras.",
    how: "Una pista opcional de cómo leer el dato.",
  },
};
export const DEF_RULES: [RegExp, string][] = [
  [/^Barreras por acción sugerida/i, "bacc"],
  [/^Trámites por nivel de severidad/i, "tsev"],
  [/^Trámites por sector/i, "tsect"],
  [/^Trámites por entidad/i, "tent"],
  [/^Trámites por etapa/i, "teta"],
  [/^Trámites por tipo de usuario/i, "tusu"],
  [/^Trámites por oportunidad/i, "topo"],
  [/^Trámites por acción/i, "tacc"],
  [/^Costo estimado por actividad/i, "tcact"],
  [/^Costos administrativos por usuario/i, "tcusu"],
  [/^Afectaciones/i, "tafe"],
  [/^Afectación a la MIPYME/i, "tmip"],
  [/^Hallazgos/i, "thall"],
  [/ámbito de impacto/i, "amb"],
  [/jerarquía normativa/i, "jer"],
  [/sector económico/i, "sec"],
  [/entidad emisora/i, "eni"],
  [/nivel de severidad/i, "sev"],
  [/por año y sector/i, "vigsec"],
  [/tipo de regulación/i, "vigtipo"],
  [/por año/i, "vig"],
  [/Características del acervo/i, "car"],
];
export const defFor = (title?: string) => {
  const r = DEF_RULES.find((x) => x[0].test(title || ""));
  return r ? DEFS[r[1]] : null;
};
