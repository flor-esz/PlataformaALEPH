// ─── Tokens de diseño compartidos ──────────────────────────────────────────
// Vive en su propio módulo, SIN importar nada de App.tsx, a propósito: C y los
// HDR_BTN_* se necesitan tanto desde App.tsx como desde archivos que App.tsx
// importa de forma estática (PanelRegional.tsx, ImpactoEconomico.tsx). Si
// esos archivos importaran C desde "./App", se arma un ciclo (App.tsx →
// PanelRegional/ImpactoEconomico → App.tsx) y, como C es una const, cualquier
// referencia a C a nivel de módulo (fuera del cuerpo de un componente) revienta
// en tiempo de ejecución con "Cannot access 'C' before initialization" —
// justo el bug que este archivo evita de raíz.
//
// ═══ HOMOLOGACIÓN AL REDISEÑO "EDITORIAL LUMINOSA" (oct 2026) ═══════════════
// Regla de este archivo: NO se renombra ninguna llave de `C`. Solo cambian los
// VALORES (mismos nombres → App.tsx y el resto de pantallas no se tocan) y se
// AGREGAN llaves nuevas al final del objeto (sección "Llaves nuevas").
// Los valores salen de la hoja de estilo del diseñador (RegLAC_Hoja-de-estilo
// v1.0, 6 oct 2026). Todos son hex de 6 dígitos a propósito: hay ~70 lugares
// que concatenan transparencia (`C.steel3 + "22"`, `${C.x}33`) y eso solo
// funciona con hex, no con var(--…).
import type React from "react";

export const C = {
  // ── Superficies y estructura ──────────────────────────────────────────────
  canvas: "#F5F4F1",        // fondo de contenido (antes #EDF1F5)
  card: "#FFFFFF",          // tarjetas y paneles (antes #FAFBFC)
  sidebar: "#004E70",       // menú lateral — color sólido de respaldo; el degradado está en `sidebarGradient`
  border: "#E7E4DE",        // bordes y divisores (antes #DCE3EB)
  text: "#1E1E1E",          // texto principal (antes #14161A)
  textMuted: "#6F6C66",     // texto secundario (antes #6B7A8D). Diseñador: #86837D; se oscurece para contraste AA en texto de 11–12 px

  // ── Severidad ─────────────────────────────────────────────────────────────
  // El diseñador define 3 niveles: Alta (vino), Media (ámbar), Baja (gris).
  // Este archivo SOLO cambia color. Las etiquetas y los datos (Crítico / Alto /
  // Mediano / Bajo) no se tocan. Mientras el backend siga mandando 4 niveles,
  // Crítico y Alto comparten el color de "Alta"; se distinguen por su etiqueta
  // ("4 · Crítico", "3 · Alto"). Cuando los datos pasen a 3 niveles, no hay que
  // cambiar nada aquí.
  critico: "#9C1F45",       // Alta (vino)
  alto: "#9C1F45",          // Alta (vino)
  mediano: "#E0892A",       // Media (ámbar)
  bajo: "#A9B6BF",          // Baja (gris)

  // ── Rampa azul de marca (estructura, interacción, enlaces, charts) ────────
  // Mismo orden que antes: steel1 = más claro … steel4 = más oscuro.
  steel1: "#94B4C4",
  steel2: "#5E90A8",
  steel3: "#196E8C",
  steel4: "#004E70",        // azul primario BID

  // ── Ámbar / verde / rojo claro (avisos, mejora, fondos tenues) ────────────
  ambar1: "#E0892A",
  ambar2: "#FBEBD7",
  ambarTexto: "#8A5A12",
  verde1: "#266736",        // "mejora / oportunidad" (verde oscuro de marca)
  verde2: "#E8F1D7",
  rojoClaro: "#F6E3E9",     // fondo tenue del vino de severidad

  // ── Llaves nuevas (no existían; no rompen nada existente) ─────────────────
  surface2: "#F7F6F3",      // fondo de cajas internas, filas hover, KPI secundarios
  accent: "#009ADE",        // cian de marca: indicador de menú activo, foco, enlaces destacados
  accentSoft: "#E6EFF3",    // fondo de controles y chips en azul tenue
  exito: "#266736",         // estados "Activo", "Completo" (antes #2D7A3A suelto en App.tsx)
  exitoBg: "#E8F1D7",       // fondo del chip de éxito (antes #E6F4EA)
  error: "#9C1F45",         // errores y acciones destructivas que NO son severidad (Inactivo, Deshabilitar…)
  errorBg: "#F6E3E9",       // fondo del chip de error (antes #F5E6E6)
  sidebarGradient: "linear-gradient(180deg, #0A5A80 0%, #004E70 38%, #003A55 100%)",
  heroGradient: "linear-gradient(118deg, #00374E 0%, #004E70 42%, #0B78A8 78%, #308144 118%)",
  radiusCard: 16,           // px — tarjetas y paneles
  radiusCtl: 999,           // px — controles tipo píldora
  shadowCard: "0 1px 2px rgba(30,30,30,.04), 0 6px 20px -8px rgba(30,30,30,.08)",
};

// Shared button style helpers for header actions — used by each screen's actions prop
// (el nombre de fuente se conserva: "Space Grotesk" resuelve a Inter por el alias de fonts.css)
export const HDR_BTN_PRIMARY: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  backgroundColor: C.steel4, color: "#FFFFFF",
  fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600,
  border: "none", borderRadius: 999, padding: "8px 16px", cursor: "pointer", whiteSpace: "nowrap",
};
export const HDR_BTN_SECONDARY: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  backgroundColor: "transparent", color: C.text,
  fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 500,
  border: `1px solid ${C.border}`, borderRadius: 999, padding: "8px 16px", cursor: "pointer", whiteSpace: "nowrap",
};
// Variante píldora de HDR_BTN_SECONDARY — acciones secundarias de header
// ("Ver trámites" / "Ver barreras").
export const HDR_BTN_PILL: React.CSSProperties = {
  ...HDR_BTN_SECONDARY,
  borderRadius: 999,
};
