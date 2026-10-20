// Datos de ejemplo del Índice de Distorsiones Regulatorias (IDR) y sus dos subíndices.
// Con datos reales, desarrollo sustituye `idrData` (misma forma de salida: `IdrData`).
import { OTROS } from "./charts";
import { IMP_ADM, IMP_ADMS, impH } from "./costeo-data";
import { PAISES_BASE, SECTORES, TIPOS, TR_REG, YEARS } from "./fixtures";
import { ALC, colorPais } from "./theme";
import type { IdrData } from "./types";

/* ================= Índice / IDR (entrega 3) ================= */
export const IDR_PAISES = {
  Argentina: [62, 51],
  Bolivia: [53, 54],
  Chile: [49, 41],
  Colombia: [57, 49],
  Perú: [58, 47],
  Panamá: [57, 46],
}; // [subíndice Barreras, subíndice Trámites] de ejemplo; promedios regionales 56 y 48
export const IDR_COV = {
  Argentina: [41, 48, 78],
  Bolivia: [22, 30, 61],
  Chile: [44, 48, 84],
  Colombia: [52, 56, 88],
  Perú: [38, 46, 72],
  Panamá: [25, 34, 58],
}; // [fuentes procesadas, fuentes previstas, % hallazgos validados]
export const IDR_CARGAS = [
  ["Carga documental", 52],
  ["Carga procedimental", 47],
  ["Carga temporal", 55],
  ["Carga monetaria", 44],
  ["Carga de acceso", 43],
  ["Incertidumbre", 47],
]; // promedio regional 48
export const IDR_TIPO_OFF = { Ley: 5, Decreto: -2, Resolución: 1, Reglamento: -4 };
export const IDR_SECS = ["Barreras", "Trámites"];
export function idrData(pais: string): IdrData {
  const names: string[] = PAISES_BASE.map((c) => c.name);
  const cl = (v) => Math.max(8, Math.min(94, Math.round(v)));
  const jit = (n, k, amp) => Math.round((impH("idr" + n + k) - 0.5) * 2 * amp);
  const one = (n) => {
    const [b, t] = IDR_PAISES[n];
    return {
      n,
      b,
      t,
      idr: Math.round((b + t) / 2),
      ent: cl(b + 4),
      ope: cl(b - 4),
      cargas: IDR_CARGAS.map(([k, v]) => ({
        k,
        v: cl(v + (t - 48) + jit(n, k, 3)),
      })),
      tipos: TIPOS.map((x) => ({
        k: x[0],
        v: cl(b + IDR_TIPO_OFF[x[0]] + jit(n, x[0], 2)),
      })),
      secs: SECTORES.map((x) => ({ k: x[0], v: cl(b + jit(n, "s" + x[0], 9)) })),
      ents: TR_REG.entidad
        .filter((e) => e[0] !== "Otras entidades")
        .slice(0, 10)
        .map((e) => ({ k: e[0], v: cl(t + jit(n, "e" + e[0], 9)) })),
      /* sector administrativo (no económico): promedio de las entidades que agrupa */
      adms: IMP_ADMS.filter((a) => a !== "Otros sectores administrativos").map(
        (a) => {
          const es = TR_REG.entidad.filter(
            (e) => IMP_ADM[e[0]] === a && !OTROS[e[0]],
          );
          return {
            k: a,
            v: es.length
              ? cl(
                  es.reduce((x, e) => x + t + jit(n, "e" + e[0], 9), 0) /
                    es.length,
                )
              : cl(t),
          };
        },
      ),
    };
  };
  const all = names.map(one);
  const use = pais === "Todos" ? all : all.filter((r) => r.n === pais);
  const avg = (f) => Math.round(use.reduce((a, r) => a + f(r), 0) / use.length);
  const lst = (g) =>
    g(use[0]).map((x, i) => ({ k: x.k, v: avg((r) => g(r)[i].v) }));
  const fp = use.reduce((a, r) => a + IDR_COV[r.n][0], 0),
    ft = use.reduce((a, r) => a + IDR_COV[r.n][1], 0);
  const b = avg((r) => r.b),
    t = avg((r) => r.t);
  const evo = YEARS.map((y, yi) => {
    const o = { year: y };
    all.forEach((r) => {
      o[r.n] = cl(
        r.b + (9 - yi) * 0.9 + (Math.sin(yi * 1.3 + r.b) * 1.2 * (9 - yi)) / 9,
      );
    });
    o[ALC] = Math.round(names.reduce((a, n) => a + o[n], 0) / names.length);
    return o;
  });
  return {
    b,
    t,
    ent: avg((r) => r.ent),
    ope: avg((r) => r.ope),
    cargas: lst((r) => r.cargas),
    tipos: lst((r) => r.tipos),
    secs: lst((r) => r.secs),
    ents: lst((r) => r.ents),
    adms: lst((r) => r.adms),
    evo,
    paises: all.map((r, i) => ({
      k: r.n,
      b: r.b,
      t: r.t,
      idr: r.idr,
      c: colorPais(r.n, i),
      on: pais === "Todos" || r.n === pais,
    })),
    fp,
    ft,
    cob: Math.round((100 * fp) / ft),
    val: avg((r) => IDR_COV[r.n][2]),
  };
}
