// ─── Datos de EJEMPLO de las pantallas rediseñadas ───────────────────────────
// Reproducen los datos del prototipo del diseñador. Sirven para ver las pantallas
// funcionando antes de conectar el backend. Cada función devuelve datos con la
// forma de types.ts para un alcance ("Todos" = regional, o el nombre de un país).
//
// Al conectar el backend se pasa `data` a cada pantalla y este archivo deja de
// usarse (se puede borrar).
import type { BarrerasData, DesgloseBarrera, DesgloseTramite, PanoramaData, PaisRef, TramitesData } from "./types";
import { fmtInt } from "./format";

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
const PAISES_BASE = [
  { id: "AR", name: "Argentina", now: 6432 },
  { id: "BO", name: "Bolivia", now: 2981 },
  { id: "CL", name: "Chile", now: 4765 },
  { id: "CO", name: "Colombia", now: 8932 },
  { id: "PE", name: "Perú", now: 5104 },
  { id: "PA", name: "Panamá", now: 3287 },
];
export const PAISES_FIXTURE: PaisRef[] = PAISES_BASE.map(({ id, name }) => ({ id, name }));

function growth(final: number, startRatio: number, seed: number): number[] {
  const out: number[] = [];
  const s0 = final * startRatio;
  for (let i = 0; i < YEARS.length; i++) {
    const t = i / (YEARS.length - 1);
    const ease = t * (0.85 + 0.15 * t);
    const wob = Math.sin((i + 1) * seed) * 0.012 * final * (i > 0 && i < 9 ? 1 : 0);
    out.push(Math.round(s0 + (final - s0) * ease + wob));
  }
  out[out.length - 1] = final;
  return out;
}

// ── Panorama ────────────────────────────────────────────────────────────────
const seriePais = PAISES_BASE.map((c, i) => growth(c.now, [0.58, 0.66, 0.6, 0.52, 0.55, 0.63][i], 1.3 + i * 0.7));
const SECTORES: [string, number][] = [
  ["Comercio", 2210],
  ["Energía", 1340],
  ["Transporte", 1280],
  ["Medio ambiente", 980],
  ["Salud", 910],
  ["Serv. financieros", 860],
  ["Telecomunicaciones", 790],
  ["Agropecuario", 620],
  ["Industria", 590],
  ["Trabajo", 540],
];
const sectorSeries = SECTORES.map((s, i) =>
  growth(s[1], [0.42, 0.6, 0.55, 0.5, 0.62, 0.58, 0.48, 0.66, 0.64, 0.7][i], 2 + i * 0.5),
);
const TIPOS: [string, number][] = [
  ["Ley", 2210],
  ["Decreto", 1620],
  ["Resolución", 780],
  ["Circular", 420],
  ["Reglamento", 310],
  ["Otro", 260],
];
const tipoSeries = TIPOS.map((s, i) => growth(s[1], [0.5, 0.55, 0.45, 0.6, 0.65, 0.7][i], 1 + i * 0.9));
const INDICADORES = {
  count: {
    label: "Cantidad de regulaciones vigentes",
    unit: "regulaciones",
    decimals: 0,
    valores: PAISES_BASE.map((c) => c.now),
  },
  age: {
    label: "Edad promedio del acervo regulatorio",
    unit: "años",
    decimals: 1,
    valores: [18.4, 14.1, 16.9, 15.2, 12.8, 13.5],
  },
  words: {
    label: "Cantidad total de palabras",
    unit: "millones de palabras",
    decimals: 1,
    valores: [41.2, 17.8, 29.6, 57.3, 31.9, 19.4],
  },
  length: {
    label: "Longitud promedio de las regulaciones",
    unit: "palabras por regulación",
    decimals: 0,
    valores: [6405, 5971, 6212, 6415, 6250, 5902],
  },
  read: {
    label: "Complejidad de lectura estimada",
    unit: "índice 0–100 (mayor = más compleja)",
    decimals: 0,
    valores: [68, 61, 64, 71, 66, 59],
  },
};

export function panoramaFixture(country: string): PanoramaData {
  const one = country !== "Todos";
  const ci = Math.max(
    0,
    PAISES_BASE.findIndex((c) => c.name === country),
  );
  const share = one ? PAISES_BASE[ci].now / PAISES_BASE.reduce((a, c) => a + c.now, 0) : 1;
  const stats: PanoramaData["stats"] = one
    ? [
        [fmtInt(PAISES_BASE[ci].now), "regulaciones vigentes en " + country],
        ["2015–2024", "años analizados"],
        ["15 sep 2026", "última actualización"],
      ]
    : [
        [String(PAISES_BASE.length), "países analizados"],
        [fmtInt(PAISES_BASE.reduce((a, c) => a + c.now, 0)), "regulaciones vigentes"],
        ["2015–2024", "años analizados"],
      ];
  const serieIndicador = one
    ? Object.fromEntries(
        Object.entries(INDICADORES).map(([k, o]) => [
          k,
          YEARS.map(
            (_, yi) =>
              +(o.valores[ci] * (0.72 + (0.28 * yi) / 9) + Math.sin(yi * 1.7) * o.valores[ci] * 0.015).toFixed(o.decimals),
          ),
        ]),
      )
    : undefined;
  return {
    stats,
    years: YEARS,
    paises: PAISES_BASE,
    seriePais,
    sectores: SECTORES.map(
      ([n], si) =>
        [
          n,
          YEARS.map((_, yi) => Math.round(sectorSeries[si][yi] * share * (one ? 1 + (((si * 7 + ci * 3) % 5) - 2) * 0.08 : 1))),
        ] as [string, number[]],
    ),
    tipos: TIPOS.map(([n], si) => [n, YEARS.map((_, yi) => Math.round(tipoSeries[si][yi] * share))] as [string, number[]]),
    indicadores: INDICADORES,
    serieIndicador,
  };
}

// Reparte `tot` según pesos (suma exacta).
const alloc = (tot: number, ws: number[]) => {
  const r = ws.map((w) => Math.round(tot * w));
  r[r.length - 1] += tot - r.reduce((x, y) => x + y, 0);
  return r;
};

// ── Barreras ────────────────────────────────────────────────────────────────
const B = {
  total: 1250,
  entrada: 720,
  operacion: 530,
  sev: [
    ["Alta", 420],
    ["Media", 520],
    ["Baja", 310],
  ] as [string, number][],
  ambito: [
    ["Competencia", 190, 150],
    ["Comercio", 150, 100],
    ["Inversión", 230, 170],
    ["Innovación", 150, 110],
  ] as [string, number, number][],
  jerarquia: [
    ["Legislativo", 150],
    ["Reglamentario", 330],
    ["Resolutivo / Agencias", 420],
    ["Técnico-operativo", 240],
    ["Procedimental / Trámites", 110],
  ] as [string, number][],
  sector: [
    ["Servicios financieros", 110, 70],
    ["Energía", 90, 60],
    ["Comercio", 80, 50],
    ["Transporte", 70, 50],
    ["Telecomunicaciones", 65, 45],
    ["Minería", 55, 40],
    ["Industria", 50, 35],
    ["Salud", 45, 35],
    ["Agropecuario", 40, 30],
    ["Construcción", 35, 25],
    ["Educación", 30, 25],
    ["Turismo", 25, 20],
    ["Medio ambiente", 20, 20],
    ["Pesca y acuicultura", 15, 15],
  ] as [string, number, number][],
  instr: [140, 120, 150, 110, 95, 70, 130, 100, 90, 85, 60, 55, 65, 30],
  entidad: [
    ["Min. de Hacienda", 230],
    ["Min. de Comercio", 200],
    ["Agencia Nacional de Regulación", 170],
    ["Superintendencia Financiera", 140],
    ["Min. de Transporte", 120],
    ["Min. de Salud", 100],
    ["Dirección General de Aduanas", 85],
    ["Min. de Energía", 75],
    ["Municipalidades", 60],
    ["Min. de Ambiente", 45],
    ["Min. de las TIC", 15],
    ["Otras entidades", 10],
  ] as [string, number][],
  paises: [
    ["AR", "Argentina", 135, 110],
    ["BO", "Bolivia", 105, 75],
    ["CL", "Chile", 120, 90],
    ["CO", "Colombia", 150, 125],
    ["PE", "Perú", 115, 75],
    ["PA", "Panamá", 95, 55],
  ] as [string, string, number, number][],
};
const BARRERAS_TABLA: BarrerasData["tabla"] = [
  {
    barrera: "Licencia previa para la prestación de servicios financieros",
    sector: "Servicios financieros / Crédito",
    tipo: "Entrada",
    ambito: "Competencia",
    regulacion: "Ley 1328 de 2009",
    entidad: "Superintendencia Financiera",
    severidad: "Alta",
    accion: "Simplificar",
  },
  {
    barrera: "Restricción a la inversión extranjera en telecomunicaciones",
    sector: "Telecomunicaciones / Infraestructura",
    tipo: "Operación",
    ambito: "Inversión",
    regulacion: "Ley 1341 de 2009",
    entidad: "Ministerio de TIC",
    severidad: "Media",
    accion: "Eliminar",
  },
  {
    barrera: "Cupos de importación en productos agropecuarios",
    sector: "Agropecuario / Alimentos",
    tipo: "Entrada",
    ambito: "Comercio",
    regulacion: "Decreto 1071 de 2015",
    entidad: "Ministerio de Agricultura",
    severidad: "Media",
    accion: "Simplificar",
  },
  {
    barrera: "Control de precios en medicamentos",
    sector: "Salud / Farmacéutico",
    tipo: "Operación",
    ambito: "Innovación",
    regulacion: "Resolución 2013 de 2020",
    entidad: "Ministerio de Salud",
    severidad: "Alta",
    accion: "Clarificar",
  },
  {
    barrera: "Requisitos adicionales para la apertura de establecimientos",
    sector: "Comercio / Retail",
    tipo: "Entrada",
    ambito: "Competencia",
    regulacion: "Decreto 1074 de 2015",
    entidad: "Ministerio de Comercio",
    severidad: "Baja",
    accion: "Proporcionalizar",
  },
];
const ACC_B: [string, number][] = [
  ["Simplificar", 0.34],
  ["Eliminar", 0.26],
  ["Clarificar", 0.22],
  ["Proporcionalizar", 0.18],
];

// Pesos de severidad de ejemplo (alta, media, baja) que varían por fila.
const sevW = (i: number) => {
  const a = 0.336 + 0.07 * Math.sin(i * 1.9 + 0.5),
    b = 0.416 - 0.03 * Math.sin(i * 1.3);
  return [a, b, 1 - a - b];
};
function filaBarrera(k: string, entrada: number, operacion: number, i: number): DesgloseBarrera {
  const [alta, media, baja] = alloc(entrada + operacion, sevW(i));
  return { k, entrada, operacion, alta, media, baja };
}
function filaBarreraTot(k: string, total: number, i: number, eShare: number): DesgloseBarrera {
  const [entrada, operacion] = alloc(total, [eShare, 1 - eShare]);
  return filaBarrera(k, entrada, operacion, i);
}

export function barrerasFixture(country: string): BarrerasData {
  const nat = country !== "Todos";
  const row = B.paises.find((r) => r[1] === country) || B.paises[3];
  const e = row[2],
    o = row[3],
    tot = e + o,
    f = tot / B.total,
    fe = e / B.entrada,
    fo = o / B.operacion;
  const sev = nat
    ? B.sev.map(([k, v]) => [k, Math.round(v * f)] as [string, number])
    : B.sev.map((x) => [...x] as [string, number]);
  if (nat) sev[0][1] += tot - sev.reduce((a, x) => a + x[1], 0);
  const total = nat ? tot : B.total;
  const acciones = ACC_B.map(([k, w]) => [k, Math.round(total * w)] as [string, number]);
  acciones[3][1] += total - acciones.reduce((a, x) => a + x[1], 0);
  return {
    stats: nat
      ? [
          [fmtInt(tot), "barreras identificadas en " + country],
          ["2015–2024", "años analizados"],
          ["15 sep 2026", "última actualización"],
        ]
      : [
          ["6", "países analizados"],
          ["1.250", "barreras identificadas"],
          ["2015–2024", "años analizados"],
        ],
    total,
    entrada: nat ? e : B.entrada,
    operacion: nat ? o : B.operacion,
    sev: sev as BarrerasData["sev"],
    ambito: B.ambito.map(([k, x, y], i) => filaBarrera(k, nat ? Math.round(x * fe) : x, nat ? Math.round(y * fo) : y, i)),
    jerarquia: B.jerarquia.map(([k, v], i) => filaBarreraTot(k, nat ? Math.round(v * f) : v, i, 0.55 + 0.12 * Math.sin(i * 2.1))),
    sector: B.sector.map(([k, x, y], i) => filaBarrera(k, nat ? Math.round(x * fe) : x, nat ? Math.round(y * fo) : y, i)),
    instrumentos: B.instr.map((n) => n * (nat ? total / B.total : 1)),
    entidad: B.entidad.map(([k, v], i) =>
      filaBarreraTot(k, nat ? Math.max(1, Math.round(v * f)) : v, i, 0.5 + 0.14 * Math.sin(i * 1.6 + 1)),
    ),
    paises: nat ? undefined : B.paises,
    acciones: nat ? acciones : undefined,
    tabla: nat ? BARRERAS_TABLA : undefined,
  };
}

// ── Trámites ────────────────────────────────────────────────────────────────
type S3 = [number, number, number];
const TR_PAIS: Record<string, [number, S3, number, number]> = {
  Argentina: [320, [110, 150, 60], 52, 13],
  Bolivia: [280, [90, 130, 60], 46, 12],
  Chile: [310, [115, 138, 57], 51, 13],
  Colombia: [275, [100, 125, 50], 45, 12],
  Perú: [350, [140, 160, 50], 57, 14],
  Panamá: [307, [125, 147, 35], 50, 13],
};
const TR_REG = {
  tot: 1842,
  ent: 320,
  sec: 14,
  cost: 285,
  sev: [680, 850, 312] as S3,
  sector: [
    ["Servicios financieros", 300],
    ["Comercio", 270],
    ["Industria", 235],
    ["Energía", 195],
    ["Telecomunicaciones", 160],
    ["Transporte", 150],
    ["Minería", 130],
    ["Agropecuario", 110],
    ["Salud", 95],
    ["Construcción", 80],
    ["Educación", 45],
    ["Turismo", 30],
    ["Pesca y acuicultura", 22],
    ["Medio ambiente", 20],
  ] as [string, number][],
  entidad: [
    ["Min. de Hacienda", 330],
    ["Agencia Nacional de Regulación", 270],
    ["Min. de Comercio", 225],
    ["Superintendencia Financiera", 180],
    ["Min. de Transporte", 165],
    ["Min. de Salud", 140],
    ["Dirección General de Aduanas", 120],
    ["Min. de Ambiente", 95],
    ["Municipalidades", 80],
    ["Min. de Energía", 70],
    ["Min. de Agricultura", 55],
    ["Superintendencia de Industria", 45],
    ["Min. de Educación", 30],
    ["Min. de las TIC", 17],
    ["Otras entidades", 20],
  ] as [string, number][],
  etapa: [
    ["Apertura", 520],
    ["Operación", 610],
    ["Expansión", 450],
    ["Cierre", 262],
  ] as [string, number][],
  usuario: [
    ["Empresarial", 980],
    ["Ciudadano", 620],
    ["Mixto", 242],
  ] as [string, number][],
  opo: [
    ["Trámites, requisitos y costos de cumplimiento", 1120],
    ["Duplicidad, interoperabilidad y accesibilidad", 780],
    ["Certidumbre, discrecionalidad y debido proceso", 580],
    ["Proporcionalidad, riesgo e inspección", 430],
  ] as [string, number][],
  acc: [
    ["Simplificar", 660],
    ["Digitalizar", 550],
    ["Interoperar", 420],
    ["Clarificar", 300],
    ["Proporcionalizar", 230],
  ] as [string, number][],
};
const TR_CO = {
  sector: [
    ["Servicios financieros", 48],
    ["Comercio", 40],
    ["Transporte", 32],
    ["Energía", 28],
    ["Industria", 26],
    ["Telecomunicaciones", 22],
    ["Agropecuario", 18],
    ["Salud", 15],
    ["Educación", 14],
    ["Construcción", 12],
    ["Minería", 10],
    ["Turismo", 10],
  ] as [string, number][],
  entidad: [
    ["Min. de Comercio", 32],
    ["DIAN", 28],
    ["Min. de Transporte", 24],
    ["Min. de Ambiente", 20],
    ["Min. de Salud", 18],
    ["Superintendencia Financiera", 16],
    ["ICA", 14],
    ["Invima", 12],
    ["Municipalidades", 10],
    ["Min. de Energía", 7],
    ["Min. de las TIC", 6],
    ["Min. de Educación", 5],
    ["Otras entidades", 8],
  ] as [string, number][],
  etapa: [
    ["Apertura", 85],
    ["Operación", 115],
    ["Expansión", 52],
    ["Cierre", 23],
  ] as [string, number][],
  usuario: [
    ["Empresarial", 190],
    ["Ciudadano", 60],
    ["Mixto", 25],
  ] as [string, number][],
  opo: [
    ["Trámites, requisitos y costos de cumplimiento", 180],
    ["Duplicidad, interoperabilidad y accesibilidad", 120],
    ["Certidumbre, discrecionalidad y debido proceso", 95],
    ["Proporcionalidad, riesgo e inspección", 70],
  ] as [string, number][],
  acc: [
    ["Simplificar", 100],
    ["Digitalizar", 82],
    ["Interoperar", 63],
    ["Clarificar", 45],
    ["Proporcionalizar", 34],
  ] as [string, number][],
  afe: [
    ["Costos administrativos", 120],
    ["Demoras", 95],
    ["Duplicidad", 70],
    ["Discrecionalidad", 52],
    ["Falta de interoperabilidad", 38],
  ] as [string, number][],
  mip: [
    ["Alta", 140],
    ["Media", 95],
    ["Baja", 40],
  ] as [string, number][],
};
const TR_TABLA: TramitesData["tabla"] = [
  {
    tramite: "Registro de importador",
    sector: "Comercio / Exterior",
    entidad: "DIAN",
    etapa: "Apertura",
    usuario: "Empresarial",
    severidad: "Alta",
    oportunidad: "Requisitos y costos",
    costo: "1.250.000",
    accion: "Simplificar",
  },
  {
    tramite: "Licencia ambiental",
    sector: "Energía / Hidrocarburos",
    entidad: "Min. de Ambiente",
    etapa: "Operación",
    usuario: "Empresarial",
    severidad: "Alta",
    oportunidad: "Discrecionalidad",
    costo: "980.000",
    accion: "Clarificar",
  },
  {
    tramite: "Permiso de transporte de carga",
    sector: "Transporte / Terrestre",
    entidad: "Min. de Transporte",
    etapa: "Operación",
    usuario: "Empresarial",
    severidad: "Media",
    oportunidad: "Interoperabilidad",
    costo: "620.000",
    accion: "Digitalizar",
  },
  {
    tramite: "Registro sanitario",
    sector: "Salud / Medicamentos",
    entidad: "Invima",
    etapa: "Apertura",
    usuario: "Mixto",
    severidad: "Media",
    oportunidad: "Requisitos y costos",
    costo: "510.000",
    accion: "Simplificar",
  },
  {
    tramite: "Autorización de construcción",
    sector: "Construcción / Edificaciones",
    entidad: "Municipalidad",
    etapa: "Expansión",
    usuario: "Empresarial",
    severidad: "Baja",
    oportunidad: "Proporcionalidad",
    costo: "320.000",
    accion: "Proporcionalizar",
  },
];

// Filas de trámites con su severidad (alta, media, baja) repartida según la severidad del alcance.
function filasSev(rows: [string, number][], sev: S3, tot: number): DesgloseTramite[] {
  const share = sev.map((x) => x / tot);
  return rows.map(([k, v], i) => {
    const a = share[0] + 0.06 * Math.sin(i * 1.9 + 0.5),
      m = share[1] - 0.03 * Math.sin(i * 1.3);
    const [alta, media, baja] = alloc(v, [a, m, 1 - a - m]);
    return { k, alta, media, baja };
  });
}

export function tramitesFixture(country: string): TramitesData {
  if (country === "Todos") {
    return {
      stats: [
        ["6", "países analizados"],
        ["1.842", "trámites identificados"],
        ["2015–2024", "años analizados"],
      ],
      ...TR_REG,
      sector: filasSev(TR_REG.sector, TR_REG.sev, TR_REG.tot),
      entidad: filasSev(TR_REG.entidad, TR_REG.sev, TR_REG.tot),
      etapa: filasSev(TR_REG.etapa, TR_REG.sev, TR_REG.tot),
      usuario: filasSev(TR_REG.usuario, TR_REG.sev, TR_REG.tot),
      paises: Object.entries(TR_PAIS).map(([name, [tot, sev]], i) => ({ name, tot, sev, id: PAISES_BASE[i].id })),
    };
  }
  const [tot, sev, ent, sec] = TR_PAIS[country] || TR_PAIS.Colombia;
  const f = tot / 275;
  const sc = (a: [string, number][]) => a.map(([k, v]) => [k, Math.max(1, Math.round(v * f))] as [string, number]);
  return {
    stats: [
      [fmtInt(tot), "trámites identificados en " + country],
      ["2015–2024", "años analizados"],
      ["15 sep 2026", "última actualización"],
    ],
    tot,
    ent,
    sec,
    sev,
    cost: (285 * tot) / 1842,
    sector: filasSev(sc(TR_CO.sector), sev, tot),
    entidad: filasSev(sc(TR_CO.entidad), sev, tot),
    etapa: filasSev(sc(TR_CO.etapa), sev, tot),
    usuario: filasSev(sc(TR_CO.usuario), sev, tot),
    opo: sc(TR_CO.opo),
    acc: sc(TR_CO.acc),
    afe: sc(TR_CO.afe),
    mip: sc(TR_CO.mip),
    cAct: [
      ["Actividad estándar 1", 0.346, 0.4],
      ["Actividad estándar 2", 0.253, 0.3],
      ["Actividad estándar 3", 0.214, 0.18],
      ["Otras actividades", 0.187, 0.12],
    ],
    cUsu: [
      ["Empresarial", 0.5],
      ["Ciudadano", 0.323],
      ["Mixto", 0.177],
    ],
    tabla: TR_TABLA,
  };
}
