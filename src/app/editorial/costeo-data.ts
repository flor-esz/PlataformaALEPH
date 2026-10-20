// Datos de ejemplo de Costeo (antes «Impacto económico»). Los filtros del encabezado (país, sector
// administrativo, entidad, tipo de usuario) afectan toda la pantalla; no hay vista regional / por país
// (indicación del BID). Todas las cifras son de ejemplo y se generan a partir del registro de
// trámites de `fixtures.ts`. Para conectar datos reales basta pasar `getData` a <CosteoEditorial />.
import { OTROS } from "./charts";
import { IMP_ACT, PAISES_BASE, TR_PAIS, TR_REG } from "./fixtures";
import { colorPais } from "./theme";
import type { CosteoData, CosteoFiltros } from "./types";

const COUNTRIES = PAISES_BASE;
export { IMP_ACT };

/* Datos de ejemplo. Los filtros del encabezado (país, sector, entidad, tipo de usuario) afectan toda la pantalla.
   Regional y por país no se separan aquí (indicación del BID): el país es un filtro más. */
export const IMP_TRAM = [
  // [trámite, sector, entidad, usuario, costo unitario (USD), volumen anual, fuente de costo (0-2), acción sugerida]
  [
    "Permiso sanitario",
    "Salud",
    "Min. de Salud",
    "Empresarial",
    145,
    48000,
    0,
    "Simplificar",
  ],
  [
    "Registro de proveedores",
    "Comercio",
    "Min. de Hacienda",
    "Empresarial",
    72,
    81000,
    1,
    "Digitalizar e interoperar",
  ],
  [
    "Licencia de operación",
    "Industria",
    "Municipalidades",
    "Empresarial",
    210,
    20000,
    0,
    "Reducir costos y tiempos",
  ],
  [
    "Registro de importador",
    "Comercio",
    "Dirección General de Aduanas",
    "Empresarial",
    118,
    36000,
    0,
    "Simplificar",
  ],
  [
    "Licencia ambiental",
    "Energía",
    "Min. de Ambiente",
    "Empresarial",
    980,
    3800,
    2,
    "Mejorar información",
  ],
  [
    "Permiso de transporte de carga",
    "Transporte",
    "Min. de Transporte",
    "Empresarial",
    62,
    58000,
    1,
    "Digitalizar e interoperar",
  ],
  [
    "Apertura de cuenta empresarial",
    "Servicios financieros",
    "Superintendencia Financiera",
    "Empresarial",
    44,
    74000,
    1,
    "Digitalizar e interoperar",
  ],
  [
    "Registro de medicamentos",
    "Salud",
    "Min. de Salud",
    "Mixto",
    520,
    5200,
    0,
    "Simplificar",
  ],
  [
    "Licencia de construcción",
    "Construcción",
    "Municipalidades",
    "Empresarial",
    320,
    7800,
    2,
    "Reducir costos y tiempos",
  ],
  [
    "Certificado de origen",
    "Comercio",
    "Min. de Comercio",
    "Empresarial",
    28,
    82000,
    1,
    "Digitalizar e interoperar",
  ],
  [
    "Concesión de espectro",
    "Telecomunicaciones",
    "Min. de las TIC",
    "Empresarial",
    760,
    2600,
    0,
    "Mejorar acceso y canales",
  ],
  [
    "Permiso de pesca comercial",
    "Pesca y acuicultura",
    "Min. de Agricultura",
    "Empresarial",
    95,
    18000,
    2,
    "Simplificar",
  ],
  [
    "Registro de predios rurales",
    "Agropecuario",
    "Min. de Agricultura",
    "Mixto",
    55,
    29000,
    1,
    "Mejorar acceso y canales",
  ],
  [
    "Licencia de minería",
    "Minería",
    "Min. de Energía",
    "Empresarial",
    840,
    1700,
    0,
    "Mejorar información",
  ],
  [
    "Homologación de títulos",
    "Educación",
    "Min. de Educación",
    "Ciudadano",
    36,
    40000,
    1,
    "Digitalizar e interoperar",
  ],
  [
    "Autorización turística",
    "Turismo",
    "Min. de Comercio",
    "Mixto",
    88,
    12000,
    2,
    "Simplificar",
  ],
  [
    "Evaluación de impacto ambiental",
    "Medio ambiente",
    "Min. de Ambiente",
    "Empresarial",
    1500,
    600,
    0,
    "Mejorar información",
  ],
];

export const IMP_SECS = TR_REG.sector.map((r) => r[0]); // sectores económicos: los usa Reportes

/* Sector administrativo: agrupa las entidades; sustituye al sector económico en el costeo */
export const IMP_ADM = {
  "Min. de Hacienda": "Hacienda y finanzas",
  "Superintendencia Financiera": "Hacienda y finanzas",
  "Agencia Nacional de Regulación": "Regulación y supervisión",
  "Superintendencia de Industria": "Regulación y supervisión",
  "Min. de Comercio": "Comercio e industria",
  "Dirección General de Aduanas": "Aduanas y comercio exterior",
  "Min. de Transporte": "Transporte e infraestructura",
  "Min. de Salud": "Salud",
  "Min. de Ambiente": "Ambiente y energía",
  "Min. de Energía": "Ambiente y energía",
  Municipalidades: "Gobiernos locales",
  "Min. de Agricultura": "Agricultura y desarrollo rural",
  "Min. de Educación": "Educación",
  "Min. de las TIC": "Tecnologías de la información",
  "Otras entidades": "Otros sectores administrativos",
};

export const IMP_ADMS = [...new Set(Object.values(IMP_ADM))];

export const IMP_ENTS = TR_REG.entidad
  .filter((r) => !OTROS[r[0]])
  .map((r) => r[0]);

export const IMP_USUS = TR_REG.usuario.map((r) => r[0]);

export const IMP_ALL = {
  pais: "Todos",
  sec: "Todos",
  ent: "Todos",
  usu: "Todos",
};

export const IMP_SUB = {
  Salud: "Medicamentos y sanitario",
  Comercio: "Exterior",
  Industria: "Manufactura",
  Energía: "Hidrocarburos",
  Transporte: "Terrestre",
  "Servicios financieros": "Banca",
  Construcción: "Edificaciones",
  Telecomunicaciones: "Espectro",
  "Pesca y acuicultura": "Pesca comercial",
  Agropecuario: "Predios rurales",
  Minería: "Metálica",
  Educación: "Educación superior",
  Turismo: "Servicios turísticos",
  "Medio ambiente": "Licenciamiento",
};

export const impH = (str) => {
  let h = 2166136261;
  for (const c of str) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
};

export const impShare = (rows, k) => {
  const r = rows.find((x) => x[0] === k);
  return r ? r[1] / TR_REG.tot : 1;
};

export const impSecShare = (sec) =>
  TR_REG.entidad

    .filter((r) => IMP_ADM[r[0]] === sec)
    .reduce((a, r) => a + r[1], 0) / TR_REG.tot;
export const caShare = (k) => 0.58 + 0.26 * impH("ca" + k); // parte del costo que es tiempo activo (CA); el resto es espera (COP)

export function impData(s: CosteoFiltros): CosteoData {
  const none =
    s.pais === "Todos" &&
    s.sec === "Todos" &&
    s.ent === "Todos" &&
    s.usu === "Todos";
  const key = [s.pais, s.sec, s.ent, s.usu].join("|");
  const sc = s.pais === "Todos" ? 1 : TR_PAIS[s.pais][0] / TR_REG.tot;
  const f = Math.max(
    0.004,
    sc *
      (s.sec === "Todos" ? 1 : impSecShare(s.sec)) *
      (s.ent === "Todos" ? 1 : impShare(TR_REG.entidad, s.ent)) *
      (s.usu === "Todos" ? 1 : impShare(TR_REG.usuario, s.usu)),
  );
  const cost = none ? 285 : 285 * f,
    costeados = none ? 1240 : Math.max(1, Math.round(1240 * f));
  const avg = none ? 38 : Math.round(38 * (0.8 + 0.5 * impH(key)));
  /* reparto normalizado a un total */
  const split = (rows, total, seed) => {
    const w = rows.map(([k, v]) => [k, v * (0.8 + 0.5 * impH(seed + k))]);
    const t = w.reduce((a, r) => a + r[1], 0);
    return w.map(([k, v]) => ({ k, v: (total * v) / t }));
  };
  /* CA + COP por fila, reescalados para que sumen el total de CA */
  const entRows =
    s.ent !== "Todos"
      ? [[s.ent, 1]]
      : TR_REG.entidad.filter(
          (r) => s.sec === "Todos" || IMP_ADM[r[0]] === s.sec,
        );
  const entidad0 = split(entRows, cost, key + "e");
  const caRaw = entidad0.map((r) => r.v * caShare(r.k)),
    caTot = caRaw.reduce((a, x) => a + x, 0);
  const entidad = entidad0.map((r, i) => ({
    ...r,
    ca: Math.min(r.v, caRaw[i]),
    cop: Math.max(0, r.v - Math.min(r.v, caRaw[i])),
  }));
  const sector = [];
  entidad.forEach((r) => {
    const g = IMP_ADM[r.k] || "Otros sectores administrativos";
    let o = sector.find((x) => x.k === g);
    if (!o) {
      o = { k: g, v: 0, ca: 0, cop: 0 };
      sector.push(o);
    }
    o.v += r.v;
    o.ca += r.ca;
    o.cop += r.cop;
  });
  const ca = entidad.reduce((a, r) => a + r.ca, 0),
    cop = cost - ca;
  const rescale = (rows) => {
    const raw = rows.map((r) => r.v * caShare(r.k)),
      sv = rows.reduce((a, x) => a + x.v, 0) || 1,
      k = ca / cost / (raw.reduce((a, x) => a + x, 0) / sv || 1);
    return rows.map((r, i) => {
      const c = Math.min(r.v, raw[i] * k);
      return { ...r, ca: c, cop: r.v - c };
    });
  };
  /* usuarios (con número de trámites para el promedio) */
  const usuRows = rescale(
    split(
      TR_REG.usuario.filter((r) => s.usu === "Todos" || r[0] === s.usu),
      cost,
      key + "u",
    ),
  ).map((r) => ({
    ...r,
    n: Math.max(
      1,
      Math.round(
        (costeados * impShare(TR_REG.usuario, r.k)) /
          (s.usu === "Todos" ? 1 : impShare(TR_REG.usuario, s.usu)),
      ),
    ),
  }));
  /* trámites: se filtran por sector administrativo, entidad y usuario; el país reduce el volumen */
  const tram = IMP_TRAM.filter(
    (r) =>
      (s.sec === "Todos" || IMP_ADM[r[2]] === s.sec) &&
      (s.ent === "Todos" || r[2] === s.ent) &&
      (s.usu === "Todos" || r[3] === s.usu),
  )
    .map((r) => ({
      k: r[0],
      sec: r[1],
      ent: r[2],
      usu: r[3],
      cu: r[4],
      vol: Math.round(r[5] * sc),
      acc: r[7],
    }))
    .map((r) => {
      const v = (r.cu * r.vol) / 1e6,
        c = Math.min(v, v * caShare(r.k));
      const h = impH("tr" + r.k);
      return {
        ...r,
        v,
        ca: c,
        cop: v - c,
        eta: h < 0.25 ? "Apertura" : h < 0.85 ? "Operación" : "Cierre",
        sev: h < 0.4 ? "Alta" : h < 0.8 ? "Media" : "Baja",
      };
    })
    .sort((a, b) => b.v - a.v);
  /* actividades: mezcla propia por filtros */
  const aw = IMP_ACT.map(([k, v]) => [
      k,
      none ? v : v * (0.85 + 0.3 * impH(key + k)),
    ]),
    at = aw.reduce((a, r) => a + r[1], 0);
  const act = aw.map(([k, v]) => ({ k, v: (ca * v) / at, p: v / at }));
  /* países: número de trámites con los que se calculó cada dato */
  const cw = Object.entries(TR_PAIS)
    .filter(([n]) => s.pais === "Todos" || n === s.pais)
    .map(([n, r]) => [n, r[0] * (none ? 1 : 0.75 + 0.5 * impH(key + n))]);
  const ct = cw.reduce((a, r) => a + r[1], 0),
    tt = Object.entries(TR_PAIS)
      .filter(([n]) => s.pais === "Todos" || n === s.pais)
      .reduce((a, [, r]) => a + r[0], 0);
  let used = 0;
  const pais = cw.map(([n, w], i) => {
    const nn =
      i === cw.length - 1
        ? Math.max(1, costeados - used)
        : Math.max(1, Math.round((costeados * TR_PAIS[n][0]) / tt));
    used += nn;
    const v = (cost * w) / ct,
      c = v * caShare(n);
    return {
      k: n,
      v,
      ca: c,
      cop: v - c,
      n: nn,
      c: colorPais(
        n,
        COUNTRIES.findIndex((c) => c.name === n),
      ),
    };
  });
  return {
    cost,
    ca,
    cop,
    costeados,
    avg,
    sector,
    entidad,
    usuarios: usuRows,
    tram,
    act,
    pais,
  };
}
