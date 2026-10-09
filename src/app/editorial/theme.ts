// Tema de las pantallas rediseñadas: adapta los tokens `E` (../themeEditorial.ts)
// a la forma que usan las gráficas (`T`). Un solo origen de colores: si cambia un
// valor en themeEditorial.ts, cambia aquí también.
import { E } from "../themeEditorial";

/** Paleta de 26 países (orden fijo; los 6 primeros son los de hoy).
 *  Paleta fría: sin rojo, naranja ni amarillo, que quedan reservados a severidad. */
export const PALETA_PAISES: ReadonlyArray<
  readonly [id: string, nombre: string, color: string]
> = [
  ["AR", "Argentina", "#004E70"],
  ["CL", "Chile", "#2FB0E8"],
  ["CO", "Colombia", "#308144"],
  ["PE", "Perú", "#8DBA38"],
  ["PA", "Panamá", "#7D6BB0"],
  ["BO", "Bolivia", "#44A68C"],
  ["BR", "Brasil", "#0C623B"],
  ["MX", "México", "#4CC8BD"],
  ["EC", "Ecuador", "#584EA8"],
  ["UY", "Uruguay", "#719C35"],
  ["PY", "Paraguay", "#0D8D82"],
  ["VE", "Venezuela", "#6A86E1"],
  ["CR", "Costa Rica", "#57BC80"],
  ["GT", "Guatemala", "#319BB4"],
  ["DO", "Rep. Dominicana", "#875387"],
  ["HN", "Honduras", "#376E00"],
  ["SV", "El Salvador", "#40B1BA"],
  ["NI", "Nicaragua", "#49935D"],
  ["BZ", "Belice", "#1EC5E4"],
  ["HT", "Haití", "#007559"],
  ["JM", "Jamaica", "#648918"],
  ["TT", "Trinidad y Tobago", "#76398B"],
  ["BS", "Bahamas", "#6E5DBA"],
  ["BB", "Barbados", "#4DA868"],
  ["GY", "Guyana", "#7DC771"],
  ["SR", "Surinam", "#57B9A1"],
];

/** Color fijo de un país (el mismo en toda la plataforma). Si el país no está en
 *  la paleta, usa el siguiente espacio libre según su posición. */
export function colorPais(nombre: string, indice = 0): string {
  const hit = PALETA_PAISES.find(([, n]) => n === nombre);
  return hit ? hit[2] : PALETA_PAISES[indice % PALETA_PAISES.length][2];
}

/** Tema de gráficas ("Editorial luminosa"). */
export const T = {
  entrada: E.entrada,
  /** Mismo azul de Entrada, un tono más oscuro para texto (contraste 4,9:1). */
  entradaTxt: "#1676b5",
  operacion: E.operacion,
  opInk: "#FFFFFF",
  sev: E.sev as { Alta: string; Media: string; Baja: string },
  muted: E.muted,
  highlight: E.highlight,
  grid: "#F1EFEB",
  axis: E.axis,
  surface: E.surface,
  barRadius: [4, 4, 0, 0] as [number, number, number, number],
};

/** Rampas tonales (solo si el dato tiene orden). */
export const RAMPS = {
  azul: { steps: [...E.rampas.azul] },
  cian: { steps: [...E.rampas.cian] },
  verde: { steps: [...E.rampas.verde] },
  oliva: { steps: [...E.rampas.oliva] },
};
export const MEJORA = E.mejora;

/** Familia verde: identidad de la pantalla de Trámites. */
export const TR_G = "#4B894A";
export const SEVS = ["Alta", "Media", "Baja"] as const;
export type Sev = (typeof SEVS)[number];

/** Colores de series nominales de hasta 6 elementos (tipos de regulación, etc.).
 *  Son los 6 primeros espacios de la paleta de países. */
export const COLORES_SERIE = [
  "#004E70",
  "#44A68C",
  "#2FB0E8",
  "#308144",
  "#8DBA38",
  "#7D6BB0",
];

/** Promedio regional (ALC): se dibuja punteado y en gris oscuro en las gráficas. */
export const ALC = "Promedio ALC";
export const ALC_COLOR = "#3c3b3b";
export const ALC_DASH = "5 4";

/** Colores de sectores (orden fijo; el mismo en toda la plataforma). */
export const SECTOR_COLORS = [
  "#004e70",
  "#2fb0e8",
  "#308144",
  "#8dba38",
  "#7d6bb0",
  "#44a68c",
  "#6a86e1",
  "#875387",
  "#4cc8bd",
  "#376e00",
];
export const colorSector = (i: number) =>
  SECTOR_COLORS[i % SECTOR_COLORS.length];
