// ─── Tokens del rediseño "Editorial luminosa" ──────────────────────────────
// Para las PANTALLAS REDISEÑADAS que entregue el diseñador (Panorama, Barreras,
// Trámites y las que sigan). Fuente: hoja de estilo RegLAC v1.0 (6 oct 2026) y
// prototipo reglac-prototipo (THEMES["2"], RAMPS, MEJORA, COUNTRY26).
//
// Convive con `C` de theme.ts sin chocar: otro nombre (`E`), otro archivo. Las
// pantallas viejas siguen leyendo `C`; las nuevas leen `E`. Cuando ya no quede
// ninguna pantalla vieja, `C` se elimina.
//
// Igual que theme.ts, todos los colores son hex de 6 dígitos (se les concatena
// transparencia en varios lugares).
//
// No importa nada de App.tsx (evita el ciclo explicado en theme.ts).
import type React from "react";

export const E = {
  // ── Superficies y texto ───────────────────────────────────────────────────
  bg: "#F5F4F1",
  surface: "#FFFFFF",
  surface2: "#F7F6F3",
  zoneAlt: "#EBE8E2",          // fondo de zonas de sección alternadas (z-alt)
  border: "#E7E4DE",
  borderStrong: "#D3D2D1",
  ink: "#1E1E1E",
  ink2: "#55534E",
  ink3: "#86837D",             // texto muy tenue (≥ 14 px; en texto chico usar ink2)
  ink4: "#AEADAB",
  grid: "#EFEDE8",             // líneas de cuadrícula de gráficas
  axis: "#86837D",

  // ── Marca BID ─────────────────────────────────────────────────────────────
  primary: "#004E70",          // azul (el de mayor proporción)
  accent: "#004E70",
  signature: "#009ADE",        // cian: indicador activo, foco
  accentSoft: "#E6EFF3",
  gris: "#3C3B3B",
  amarillo: "#FFDA00",
  verdeOscuro: "#308144",
  verdeClaro: "#8DBA38",
  grisClaro: "#A6A6A8",

  // ── Entrada / Operación (tipo de barrera) ─────────────────────────────────
  entrada: "#1A8FD6",
  operacion: "#5B3E9A",

  // ── Severidad (3 niveles). Nunca solo color: siempre con marcador y etiqueta
  sev: { Alta: "#9C1F45", Media: "#E0892A", Baja: "#A9B6BF" },

  // ── Mejora / oportunidad (Trámites, "Acción sugerida") ────────────────────
  mejora: { bg: "#E8F1D7", fg: "#266736", dot: "#308144" },
  verde: ["#266736", "#4B894A", "#83B38F", "#8DBA38"],

  // ── Países: un color fijo por país, igual en toda la plataforma ───────────
  paises: {
    Argentina: "#004E70",
    Bolivia: "#44A68C",
    Chile: "#2FB0E8",
    Colombia: "#308144",
    "Perú": "#8DBA38",
    "Panamá": "#7D6BB0",
  } as Record<string, string>,

  // ── Rampas tonales (solo si el dato tiene orden: magnitud, jerarquía…) ────
  rampas: {
    azul: ["#94B4C4", "#5E90A8", "#196E8C", "#004E70", "#002F43"],
    cian: ["#6FB8E5", "#009ADE", "#35749B", "#26536F"],
    verde: ["#83B38F", "#4B894A", "#266736", "#194122"],
    oliva: ["#8DBA38", "#71952D", "#557022", "#475D1C"],
  },
  muted: "#DCD9D2",            // series de fondo / no resaltadas
  highlight: "#1E1E1E",

  // ── Menú lateral ──────────────────────────────────────────────────────────
  side: {
    gradient: "linear-gradient(180deg, #0A5A80 0%, #004E70 38%, #003A55 100%)",
    fg: "#C9DDE8",
    fgStrong: "#FFFFFF",
    mute: "#93B9CD",
    active: "rgba(255,255,255,.12)",
    rule: "rgba(255,255,255,.14)",
  },

  // ── Encabezado de página (hero) ───────────────────────────────────────────
  hero: {
    gradient: "linear-gradient(118deg, #00374E 0%, #004E70 42%, #0B78A8 78%, #308144 118%)",
    fg: "#FFFFFF",
    fg2: "#CFE3EE",
    eyebrow: "#9FD3EC",
    glow: "rgba(0,154,222,.30)",
  },

  // ── Forma y sombra ────────────────────────────────────────────────────────
  radius: { card: 16, hero: 22, ctl: 999, pill: 999, inner: 12 },
  shadowCard: "0 1px 2px rgba(30,30,30,.04), 0 6px 20px -8px rgba(30,30,30,.08)",

  // ── Tipografía (Inter) ────────────────────────────────────────────────────
  font: `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`,
  type: {
    pageTitle: 40,   // con mezcla de pesos: 300 + 750
    section: 22,
    kpi: 34,
    kpiTotal: 52,
    statValue: 48,
    chartTitle: 15.5,
    body: 14,
    label: 12,
  },
} as const;

// Formato de cifras es-CO (1.250 · 0,42) con numeración tabular
export const fmtInt = (n: number) => Math.round(n).toLocaleString("es-CO");
export const fmtDec = (n: number, d = 1) => n.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });
export const TABULAR: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };
