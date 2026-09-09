import type { TipoDato } from "./PanelTipoSubdimension";

const TXT_MUTED = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: "#6B7A8D",
};

// ─── Public types ─────────────────────────────────────────────────────────────
export type MatrizRegionalProps = {
  clasificacion: Record<string, TipoDato>;
  // Si se pasa, cada celda con valor (no las "N/A") se vuelve clicable, con
  // la clasificación (fila) y la subdimensión (columna) de esa celda. Cuando
  // se omite, se comporta exactamente igual que hoy (no clicable).
  onCellClick?: (clasificacion: string, subdimension: string) => void;
};

const COLUMNAS = ["Competencia", "Comercio", "Inversión", "Innovación"];
const FILAS = ["Entrada", "Operación"];

// Fondo por fila — composición, NO severidad: Entrada = C.steel4, Operación = C.steel3.
const FILA_BG: Record<string, string> = {
  "Entrada": "#26456B",
  "Operación": "#3E6E9E",
};

function totalNiveles(n: { n1: number; n2: number; n3: number; n4: number }): number {
  return n.n1 + n.n2 + n.n3 + n.n4;
}

// ─── Main component ───────────────────────────────────────────────────────────
export function MatrizRegional({ clasificacion, onCellClick }: MatrizRegionalProps) {
  return (
    <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: "#FAFBFC", border: "1px solid #DCE3EB" }}>
      <table className="w-full min-w-[520px]">
        <thead>
          <tr style={{ borderBottom: "1px solid #DCE3EB" }}>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#6B7A8D" }} />
            {COLUMNAS.map(col => (
              <th key={col} className="px-4 py-3 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#6B7A8D" }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FILAS.map(fila => {
            const subdimensiones = clasificacion[fila]?.subdimensiones ?? [];
            return (
              <tr key={fila} style={{ borderBottom: "1px solid #DCE3EB" }}>
                <td className="px-4 py-3 text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#14161A" }}>{fila}</td>
                {COLUMNAS.map(col => {
                  const sub = subdimensiones.find(s => s.nombre === col);
                  if (!sub) {
                    return (
                      <td key={col} className="px-4 py-3">
                        <span className="inline-flex items-center justify-center rounded text-[12px]" style={{ ...TXT_MUTED, backgroundColor: "#DCE3EB", width: 44, height: 28 }}>N/A</span>
                      </td>
                    );
                  }
                  return (
                    <td key={col} className="px-4 py-3">
                      <span
                        className="inline-flex items-center justify-center rounded text-[12px] font-semibold"
                        onClick={onCellClick ? () => onCellClick(fila, col) : undefined}
                        style={{ backgroundColor: FILA_BG[fila], color: "white", fontFamily: "Space Grotesk, sans-serif", width: 44, height: 28, cursor: onCellClick ? "pointer" : undefined }}
                      >
                        {totalNiveles(sub.niveles)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
