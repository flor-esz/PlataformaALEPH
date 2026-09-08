// ─── Tokens de diseño compartidos ──────────────────────────────────────────
// Vive en su propio módulo, SIN importar nada de App.tsx, a propósito: C y los
// HDR_BTN_* se necesitan tanto desde App.tsx como desde archivos que App.tsx
// importa de forma estática (PanelRegional.tsx, ImpactoEconomico.tsx). Si
// esos archivos importaran C desde "./App", se arma un ciclo (App.tsx →
// PanelRegional/ImpactoEconomico → App.tsx) y, como C es una const, cualquier
// referencia a C a nivel de módulo (fuera del cuerpo de un componente) revienta
// en tiempo de ejecución con "Cannot access 'C' before initialization" —
// justo el bug que este archivo evita de raíz.
import type React from "react";

export const C = {
  canvas: "#EDF1F5",
  card: "#FAFBFC",
  sidebar: "#14161A",
  critico: "#C75450",
  alto: "#26456B",
  mediano: "#3E6E9E",
  bajo: "#7FA8D4",
  steel1: "#7FA8D4",
  steel2: "#5E8FC2",
  steel3: "#3E6E9E",
  steel4: "#26456B",
  border: "#DCE3EB",
  text: "#14161A",
  textMuted: "#6B7A8D",
  ambar1: "#D9A441",
  ambar2: "#F6EBD6",
  ambarTexto: "#8A5A12",
  verde1: "#3B6D11",
  verde2: "#E7F1DC",
  rojoClaro: "#F7E4E3",
};

// Shared button style helpers for header actions — used by each screen's actions prop
export const HDR_BTN_PRIMARY: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  backgroundColor: C.text, color: "#FAFBFC",
  fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600,
  border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", whiteSpace: "nowrap",
};
export const HDR_BTN_SECONDARY: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  backgroundColor: "transparent", color: C.text,
  fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 500,
  border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer", whiteSpace: "nowrap",
};
// Variante píldora de HDR_BTN_SECONDARY — acciones secundarias de header
// ("Ver trámites" / "Ver barreras").
export const HDR_BTN_PILL: React.CSSProperties = {
  ...HDR_BTN_SECONDARY,
  borderRadius: 999,
};
