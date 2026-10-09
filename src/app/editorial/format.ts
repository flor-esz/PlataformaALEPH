// Formato de cifras es-CO: 1.250 · 0,42
export const fmtInt = (n: number) => Math.round(n).toLocaleString("es-CO");
export const fmt1 = (v: number) =>
  v.toLocaleString("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
export const pct = (a: number, b: number) => Math.round((a / b) * 100);
export const mean = (a: number[]) =>
  a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
