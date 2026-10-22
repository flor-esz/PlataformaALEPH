// Definiciones del icono ⓘ (texto editorial; las edita contenido, no código)
export interface Def {
  t: string;
  d: string;
  how?: string;
  /** Lista «Nombre: descripción» dentro del popover (tipos de regulación, canales…). */
  items?: [string, string][];
}
/* ===== Icono de definición (ⓘ): definiciones y popover ===== */
/* ===== Icono de definición (ⓘ): definiciones y popover ===== */
export const TIPO_ITEMS = [
  [
    "Ley",
    "Incluye leyes ordinarias, orgánicas, códigos y, cuando corresponda, decretos con fuerza de ley.",
  ],
  [
    "Decreto",
    "Incluye decretos presidenciales, supremos o ejecutivos y otros instrumentos equivalentes para desarrollar, reglamentar o ejecutar las leyes por su función.",
  ],
  [
    "Resolución",
    "Normas técnicas o sectoriales emitidas por ministerios, superintendencias, comisiones y agencias reguladoras, que desarrollan y aplican reglas específicas de cumplimiento obligatorio.",
  ],
  [
    "Reglamento",
    "Disposiciones que detallan procedimientos, criterios técnicos o instrucciones para aplicar normas superiores. Incluyen reglamentos operativos, directivas, instrucciones y circulares.",
  ],
];
export const DEFS: Record<string, Def> = {
  pan: {
    t: "Panorama regulatorio",
    d: "Vista general del acervo normativo vigente en los países analizados: cuántas regulaciones hay, cómo han evolucionado desde 2015 y cómo se distribuyen por país, sector y tipo de regulación.",
    how: "Cambia entre la vista regional y la vista por país con «Nivel de visualización».",
  },
  bar: {
    t: "Barreras regulatorias",
    d: "Disposiciones normativas vigentes que dificultan la entrada de nuevos actores al mercado o que encarecen y limitan su operación. Se identifican dentro de las regulaciones y se clasifican por tipo, severidad, canal de transmisión, país, sector y entidad emisora.",
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
  },
  amb: {
    t: "Canal de transmisión",
    d: "Principal mecanismo a través del cual la barrera regulatoria genera sus efectos. Si bien una barrera puede operar a través de múltiples canales, la metodología identifica y clasifica aquel en el que se espera su mayor incidencia.",
    items: [
      [
        "Inversión",
        "Restricciones que afectan la capacidad de adquirir activos, participar en empresas o expandir operaciones.",
      ],
      [
        "Competencia",
        "Restricciones que reducen la rivalidad entre empresas, favorecen a ciertos operadores o limitan el ingreso y participación en el mercado.",
      ],
      [
        "Innovación",
        "Restricciones que limitan la adopción de nuevas tecnologías, procesos, canales o modelos de negocio.",
      ],
      [
        "Comercio",
        "Restricciones que dificultan importar, exportar o comercializar bienes y servicios.",
      ],
    ],
    how: "Cada porción es un canal; el centro muestra el total. Se ordenan de mayor a menor.",
  },
  jer: {
    t: "Tipo de regulación",
    d: "Tipo de regulación donde se identifica la barrera.",
    items: TIPO_ITEMS,
    how: "Se ordenan de mayor a menor número de barreras; cada tipo conserva su color en toda la plataforma.",
  },
  sec: {
    t: "Sector económico",
    d: "Sector o sectores económicos afectados por la barrera. Una misma barrera puede impactar uno o varios sectores al mismo tiempo.",
    how: "Se muestran los sectores con más barreras.",
  },
  eni: {
    t: "Entidad emisora",
    d: "Organismo que emitió la regulación en la que se encuentra la barrera.",
    how: "Ordenadas de mayor a menor número de barreras.",
  },
  sec1: {
    t: "Dónde se concentran las barreras",
    d: "Compara cómo se reparten las barreras según canal de transmisión, tipo de regulación y sector económico.",
    how: "Cada gráfica tiene sus propios filtros.",
  },
  sec2: {
    t: "Barreras por país",
    d: "Resumen de las barreras de cada país, divididas entre entrada y operación. Selecciona un país para explorar su detalle.",
  },
  sec3: {
    t: "Principales barreras de un país",
    d: "Muestra de las barreras identificadas en un país, con su tipo, canal de transmisión, regulación de origen, entidad emisora, severidad y la acción sugerida.",
  },
  tipo: {
    t: "Tipo de barrera",
    d: "Entrada, si limita el acceso al mercado; Operación, si afecta cómo se opera o se desarrolla un modelo de negocio.",
  },
  accion: {
    t: "Acción sugerida",
    d: "Recomendación de mejora para reducir o eliminar la barrera.",
  },
  vig: {
    t: "Regulaciones vigentes",
    d: "Número de regulaciones que están en vigor cada año. Es un acervo acumulado: suma las nuevas y descuenta las derogadas.",
    how: "Pasa el cursor por la gráfica o por «Valor actual» para comparar.",
  },
  vigsec: {
    t: "Regulaciones por sector",
    d: "Evolución de las regulaciones vigentes en cada sector económico.",
    how: "Cada línea es un sector; haz clic en una para resaltarla. Cambia el Top con «Mostrar».",
  },
  vigtipo: {
    t: "Tipo de regulación",
    d: "Tipo de regulación de las normas vigentes.",
    items: TIPO_ITEMS,
    how: "Cada línea es un tipo de regulación y muestra cuántas regulaciones vigentes hay de ese tipo cada año.",
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
    d: "Recomendación de mejora para cada barrera: simplificar cargas, digitalizar e interoperar, reducir discrecionalidad, regular según riesgo o corregir distorsiones de mercado.",
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
  kent: {
    t: "Entidades responsables",
    d: "Entidades públicas que gestionan los trámites identificados.",
  },
  kcost: {
    t: "Costo administrativo estimado",
    d: "Estimación del costo, en millones de dólares, que los trámites identificados generan a quienes deben cumplirlos.",
    how: "Valor estimado a partir de actividades estándar.",
  },
  tsev: {
    t: "Nivel de severidad",
    d: "Qué tan pesado es el trámite para quien debe cumplirlo. Se clasifica en Alta, Media y Baja.",
  },
  tsect: {
    t: "Trámites por sector económico",
    d: "Sector o sectores económicos afectados por la carga que genera el trámite. Un trámite puede afectar a varios sectores económicos de manera transversal.",
    how: "Ordenados de mayor a menor. Elige cuántos mostrar con «Mostrar».",
  },
  tsecA: {
    t: "Trámites por sector administrativo",
    d: "Sector administrativo del Estado al que pertenece la entidad que gestiona el trámite. Agrupa las entidades responsables.",
    how: "Ordenados de mayor a menor. Elige cuántos mostrar con «Mostrar».",
  },
  tent: {
    t: "Trámites por entidad responsable",
    d: "Entidad pública que gestiona el trámite.",
    how: "Ordenadas de mayor a menor. Elige cuántas mostrar con «Mostrar».",
  },
  teta: {
    t: "Etapa del ciclo empresarial",
    d: "Momento de la vida de la empresa en que se realiza el trámite: apertura, operación o cierre.",
    how: "Se respeta el orden del ciclo, no el de tamaño.",
  },
  tusu: {
    t: "Tipo de usuario",
    d: "Quién realiza el trámite: una empresa, un ciudadano o ambos (mixto).",
    how: "Ordenados de mayor a menor número de trámites.",
  },
  tacc: {
    t: "Acción de mejora sugerida",
    d: "Recomendación para reducir la carga del trámite: simplificar, digitalizar e interoperar, reducir costos y tiempos, mejorar acceso y canales o mejorar información.",
    how: "Un trámite puede tener más de una acción sugerida.",
  },
  tcact: {
    t: "Costo por actividad estándar",
    d: "Estima cuánto cuesta completar un trámite según el tiempo requerido para entender requisitos, preparar documentos, llenar formularios, realizar gestiones, pagos y desplazamientos.",
  },
  tcusu: {
    t: "Costos administrativos por usuario",
    d: "Estima cuánto cuesta completar un trámite según el tiempo requerido para entender requisitos, preparar documentos, llenar formularios, realizar gestiones, pagos y desplazamientos.",
  },
  tafe: {
    t: "Tipo de carga que genera",
    d: "Principales problemas que los trámites generan a los usuarios, como costos, demoras o duplicidad.",
    how: "Un trámite puede generar más de un tipo de carga.",
  },
  bmip: {
    t: "Afectación a las MIPYMEs",
    d: "Mide la proporción de barreras que tienen una afectación desproporcionada sobre las Mipymes.",
    how: "Más barras llenas en el marcador, mayor afectación.",
  },
  tmip: {
    t: "Afectación a las MIPYMEs",
    d: "Mide la proporción de trámites que tienen una afectación desproporcionada sobre las Mipymes.",
    how: "Más barras llenas en el marcador, mayor afectación.",
  },
  thall: {
    t: "Hallazgos clave",
    d: "Lectura rápida de los datos más relevantes de la vista.",
  },
  tsec1: {
    t: "Dónde se concentran los trámites",
    d: "Compara cómo se reparten los trámites según sector, entidad (en la vista por país), etapa del ciclo empresarial y tipo de usuario.",
    how: "Cada gráfica tiene sus propios filtros.",
  },
  tcar: {
    t: "Cargas para los usuarios",
    d: "Estimación de costos y principales tipos de carga que generan los trámites.",
  },
  tact: {
    t: "Dónde actuar para simplificar",
    d: "Acciones sugeridas para reducir la carga de los trámites.",
  },
  tpais: {
    t: "Trámites por país",
    d: "Resumen de los trámites de cada país según su nivel de severidad. Selecciona un país para explorar su detalle.",
  },
  ttab: {
    t: "Principales trámites",
    d: "Muestra de los trámites identificados en un país, con su sector, entidad, etapa, usuario, severidad, costo y acción sugerida.",
  },
  tdacc: {
    t: "Desagregación de la acción sugerida",
    d: "El filtro permite ver qué entidades emisoras se relacionan con cada acción sugerida.",
    how: "Elige una acción en el filtro «Acción».",
  },
  dacc: {
    t: "Desagregación de la acción sugerida",
    d: "El filtro permite ver qué instrumentos regulatorios y sectores económicos se relacionan con las acciones sugeridas.",
    how: "Selecciona una acción en la gráfica de la izquierda o en el filtro «Acción».",
  },
  demo: {
    t: "Ejemplo de definición",
    d: "Texto breve que explica qué es el elemento, en lenguaje sencillo y sin jerga. Máximo unas 40 palabras.",
    how: "Una pista opcional de cómo leer el dato.",
  },
};

export const DEF_RULES: [RegExp, string][] = [
  [/^Barreras por tipo de regulación/i, "jer"],
  [/^Barreras por acción sugerida/i, "bacc"],
  [/^Desagregación de la acción/i, "dacc"],
  [/^Trámites por nivel de severidad/i, "tsev"],
  [/^Trámites por sector administrativo/i, "tsecA"],
  [/^Trámites por sector/i, "tsect"],
  [/^Trámites por entidad/i, "tent"],
  [/^Trámites por etapa/i, "teta"],
  [/^Trámites por tipo de usuario/i, "tusu"],
  [/^Trámites por acción/i, "tacc"],
  [/^Costo estimado por actividad/i, "tcact"],
  [/^Costos administrativos por usuario/i, "tcusu"],
  [/^Tipo de carga que genera/i, "tafe"],
  [/^Afectación a las MIPYMEs/i, "tmip"],
  [/^Hallazgos/i, "thall"],
  [/canal de transmisión|ámbito de impacto/i, "amb"],
  [/sector económico/i, "sec"],
  [/entidad emisora/i, "eni"],
  [/nivel de severidad/i, "sev"],
  [/por año y sector/i, "vigsec"],
  [/tipo de regulación|por año y tipo$/i, "vigtipo"],
  [/por año/i, "vig"],
  [/Características del acervo/i, "car"],
];

export const defFor = (title?: string) => {
  const r = DEF_RULES.find((x) => x[0].test(title || ""));
  return r ? DEFS[r[1]] : null;
};

/* Entrega 3: Costeo, Índice / IDR y Reportes */
export const IDR_INTRO =
  "El IDR mide las distorsiones generadas por regulaciones y trámites a empresas y ciudadanos.";
export const IDR_DEF_B =
  "Mide las distorsiones generadas por el contenido de las regulaciones que pueden dificultar la entrada al mercado o limitar cómo operan las empresas.";
export const IDR_DEF_T =
  "Mide las cargas administrativas que aumentan el tiempo, costo, esfuerzo o incertidumbre para completar un trámite.";
DEFS.idr = {
  t: "Índice de Distorsiones Regulatorias (IDR)",
  d:
    IDR_INTRO +
    " Se compone de dos subíndices: Barreras y Trámites. A mayor puntaje, mayores distorsiones.",
};
DEFS.sidb = { t: "Subíndice Barreras", d: IDR_DEF_B };
DEFS.sidt = { t: "Subíndice Trámites", d: IDR_DEF_T };
DEFS.iporpais = {
  t: "IDR por país",
  d: "Puntaje del IDR del último año disponible en cada país, ordenado de mayor a menor.",
};
DEFS.itipo = {
  t: "Tipo de regulación",
  d: "Puntaje por tipo de regulación donde se identifican las distorsiones.",
  items: TIPO_ITEMS,
};
DEFS.idesag = {
  t: "Desagregación del IDR",
  d: "Muestra los dos subíndices y sus componentes: en Barreras, la entrada y la operación; en Trámites, las seis cargas (documental, procedimental, temporal, monetaria, de acceso e incertidumbre).",
};
DEFS.ievo = {
  t: "Evolución del subíndice",
  d: "Puntaje del subíndice de Barreras de cada país a lo largo de los años.",
};
DEFS.isec = {
  t: "Sector económico",
  d: "Puntaje del subíndice de Barreras según el sector económico afectado.",
};
DEFS.ient = {
  t: "Sector administrativo y entidad emisora",
  d: "Puntaje del subíndice de Trámites según el sector administrativo (no económico) o la entidad que emite o administra el trámite. El sector administrativo agrupa las entidades.",
};
DEFS.icar = {
  t: "Cargas de los trámites",
  d: "Desagregación del subíndice de Trámites en seis cargas: documental, procedimental, temporal, monetaria, de acceso e incertidumbre.",
};
DEFS.ieo = {
  t: "Subíndice por componente",
  d: "Desagregación del subíndice de Barreras entre las que afectan la entrada y el acceso al mercado y las que afectan la operación y los modelos de negocio.",
};

DEFS.imp = {
  t: "Costeo de trámites",
  d: "Costo que los trámites generan a quienes deben cumplirlos. Se estima con el Costeo Estándar y se expresa como el Costo Económico Total (CET) del trámite. Incluye todos los trámites costeados, con o sin potencial de mejora.",
};
DEFS.imest = {
  t: "Estimación del costo del trámite",
  d: "La metodología del Costo Económico Total (CET) se fundamenta en el Modelo de Costeo Estándar y se compone de: CET = CA + COP.",
  items: [
    [
      "CET",
      "Costo unitario estimado que enfrenta el usuario al completar un trámite, considerando tanto el esfuerzo activo requerido como el costo asociado al tiempo de espera de la administración.",
    ],
    [
      "CA",
      "Valor del tiempo activo que ciudadanos o empresas destinan a cumplir el trámite: comprender requisitos, preparar y reunir información, diligenciar formularios, realizar gestiones, contratar servicios externos, archivar documentos y efectuar traslados o esperas.",
    ],
    [
      "COP",
      "Valor económico asociado al tiempo pasivo de espera mientras la autoridad procesa y resuelve el trámite, cuando ese plazo posterga una actividad económica o el acceso a un beneficio.",
    ],
  ],
};
DEFS.itram = {
  t: "Trámites costeados",
  d: "Corresponde al total de trámites incluidos en el portal o catálogo oficial de trámites que se incorporaron al ejercicio de costeo, independientemente de si presentan o no potencial de mejora según la rúbrica del IDR.",
};
DEFS.iavg = {
  t: "Costo promedio por trámite",
  d: "Costo estimado de realizar un trámite una vez, en promedio, con los filtros seleccionados.",
};
DEFS.iconc = {
  t: "¿Dónde se concentra el costo?",
  d: "Muestra dónde se concentra el costo administrativo estimado, dividido entre tiempo activo (CA) y espera de la administración (COP), y ayuda a priorizar.",
};
DEFS.iusu = {
  t: "Costos administrativos por usuario",
  d: "Costo estimado según el tipo de usuario, dividido entre CA y COP. Puede verse como costo total o como promedio por trámite.",
};
DEFS.iact = {
  t: "¿Qué actividades explican el costo?",
  d: "Descompone el costo activo (CA) según las ocho actividades estándar del Costeo Estándar y explica por qué cuesta.",
};
DEFS.ipais = {
  t: "¿Cómo se compara el costeo entre países?",
  d: "Costo administrativo estimado de cada país, dividido entre CA y COP, y número de trámites con los que se calculó el dato.",
};
DEFS.itab = {
  t: "Trámites prioritarios",
  d: "Trámites con mayor costo estimado, con su sector, entidad, etapa, tipo de usuario, severidad y acción sugerida.",
};
DEFS.idr = {
  t: "Índice de Distorsiones Regulatorias (IDR)",
  d:
    IDR_INTRO +
    " Se compone de dos subíndices: Barreras y Trámites. A mayor puntaje, mayores distorsiones.",
};
DEFS.sidb = { t: "Subíndice Barreras", d: IDR_DEF_B };
DEFS.sidt = { t: "Subíndice Trámites", d: IDR_DEF_T };
DEFS.iporpais = {
  t: "IDR por país",
  d: "Puntaje del IDR del último año disponible en cada país, ordenado de mayor a menor.",
};
DEFS.itipo = {
  t: "Tipo de regulación",
  d: "Puntaje por tipo de regulación donde se identifican las distorsiones.",
  items: TIPO_ITEMS,
};
DEFS.idesag = {
  t: "Desagregación del IDR",
  d: "Muestra los dos subíndices y sus componentes: en Barreras, la entrada y la operación; en Trámites, las seis cargas (documental, procedimental, temporal, monetaria, de acceso e incertidumbre).",
};
DEFS.ievo = {
  t: "Evolución del subíndice",
  d: "Puntaje del subíndice de Barreras de cada país a lo largo de los años.",
};
DEFS.isec = {
  t: "Sector económico",
  d: "Puntaje del subíndice de Barreras según el sector económico afectado.",
};
DEFS.ient = {
  t: "Sector administrativo y entidad emisora",
  d: "Puntaje del subíndice de Trámites según el sector administrativo (no económico) o la entidad que emite o administra el trámite. El sector administrativo agrupa las entidades.",
};
DEFS.icar = {
  t: "Cargas de los trámites",
  d: "Desagregación del subíndice de Trámites en seis cargas: documental, procedimental, temporal, monetaria, de acceso e incertidumbre.",
};
DEFS.ieo = {
  t: "Subíndice por componente",
  d: "Desagregación del subíndice de Barreras entre las que afectan la entrada y el acceso al mercado y las que afectan la operación y los modelos de negocio.",
};
DEFS.rep = {
  t: "Reportes",
  d: "Genera reportes estratégicos y operativos y bases en Excel con los filtros que elijas.",
  how: "Elige el tipo de salida, define el alcance y el formato, revisa el resumen y genera el archivo.",
};

/* Ficha del trámite (entrega 4) */
DEFS.fxt = {
  t: "Tiempo promedio",
  d: "Tiempo activo que el usuario dedica a completar el trámite una vez: es la suma del tiempo de las ocho actividades estándar.",
};
DEFS.fxp = {
  t: "Plazo de resolución",
  d: "Días hábiles que la autoridad tarda en resolver el trámite una vez presentado. Es el tiempo pasivo de espera (COP).",
};
DEFS.fxf = {
  t: "Frecuencia anual",
  d: "Número de veces al año que el usuario debe realizar el trámite.",
};
DEFS.fxc = {
  t: "Carga total",
  d: "Costo anual que el trámite genera a un usuario: costo de realizarlo una vez por su frecuencia anual. Valor simulado con el Costeo Estándar.",
};
DEFS.fxm = {
  t: "Costo monetario",
  d: "Costo estimado de realizar el trámite una vez (CET = CA + COP). Valor simulado con el Costeo Estándar.",
};
DEFS.fxact = {
  t: "Actividades estándar",
  d: "Las ocho actividades del Costeo Estándar en las que se descompone el tiempo activo (CA) del trámite, con su tiempo y costo estimados. Las marcadas con fricción son donde se identificó una oportunidad de simplificación.",
};
DEFS.fxcar = {
  t: "Distorsiones de carga asociadas",
  d: "Cargas que el trámite genera al usuario, organizadas en cuatro ejes. El número indica qué tan fuerte es la distorsión (de 2 a 4).",
  items: [
    ["Cumplimiento", "¿Cuál es el costo directo de cumplir?"],
    ["Accesibilidad", "¿Se repite información o canal?"],
    ["Certidumbre", "¿Hay incertidumbre o discrecionalidad?"],
    ["Proporcionalidad", "¿El control está calibrado al riesgo?"],
  ],
};
