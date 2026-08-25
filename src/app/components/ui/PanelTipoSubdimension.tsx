import { useState } from "react";
import type React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Card } from "./card";

// ─── Severity scale (from Guidelines — non-negotiable) ────────────────────────
const SEV = [
  { level: 4, label: "Crítico", color: "#C75450" },
  { level: 3, label: "Alto",    color: "#26456B" },
  { level: 2, label: "Mediano", color: "#3E6E9E" },
  { level: 1, label: "Bajo",    color: "#7FA8D4" },
] as const;

type SevLevel = 1 | 2 | 3 | 4;

// ─── Public types ─────────────────────────────────────────────────────────────
export type NivelData = { n1: number; n2: number; n3: number; n4: number };

export type SubdimensionDato = {
  nombre: string;
  niveles: NivelData;
};

export type TipoDato = {
  niveles: NivelData;
  subdimensiones: SubdimensionDato[];
};

export type PanelTipoSubdimensionProps = {
  label: string;
  tipos: string[];
  datos: Record<string, TipoDato>;
  className?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function totalNiveles(d: NivelData): number {
  return d.n1 + d.n2 + d.n3 + d.n4;
}

const TXT_MAIN: React.CSSProperties = {
  fontFamily: "Space Grotesk, sans-serif",
  color: "#14161A",
};
const TXT_MUTED: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: "#6B7A8D",
};

// ─── Stacked bar row ──────────────────────────────────────────────────────────
function StackedBarRow({
  nombre,
  niveles,
  maxTotal,
}: {
  nombre: string;
  niveles: NivelData;
  maxTotal: number;
}) {
  const subTotal = totalNiveles(niveles);
  const pct = maxTotal > 0 ? (subTotal / maxTotal) * 100 : 0;

  const segments: { level: SevLevel; value: number; color: string }[] = [
    { level: 4, value: niveles.n4, color: "#C75450" },
    { level: 3, value: niveles.n3, color: "#26456B" },
    { level: 2, value: niveles.n2, color: "#3E6E9E" },
    { level: 1, value: niveles.n1, color: "#7FA8D4" },
  ].filter((s) => s.value > 0);

  return (
    <div className="flex items-center gap-3">
      <span
        className="flex-shrink-0 leading-tight overflow-hidden"
        style={{
          ...TXT_MUTED,
          fontSize: 11,
          width: 156,
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
        title={nombre}
      >
        {nombre}
      </span>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 12, backgroundColor: "#E6ECF3" }}
      >
        <div
          className="h-full flex rounded-full overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          {segments.map((seg) => (
            <div
              key={seg.level}
              style={{
                flex: seg.value,
                backgroundColor: seg.color,
                minWidth: seg.value > 0 ? 2 : 0,
              }}
            />
          ))}
        </div>
      </div>
      <span
        className="flex-shrink-0 text-right"
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 12,
          fontWeight: 600,
          color: "#6B7A8D",
          width: 28,
        }}
      >
        {subTotal}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PanelTipoSubdimension({
  label,
  tipos,
  datos,
  className,
}: PanelTipoSubdimensionProps) {
  const [tipo, setTipo] = useState(tipos[0] ?? "");
  const dato = datos[tipo];
  if (!dato) return null;

  const total = totalNiveles(dato.niveles);
  const subs = [...dato.subdimensiones].sort(
    (a, b) => totalNiveles(b.niveles) - totalNiveles(a.niveles)
  );
  const maxSubTotal =
    subs.length > 0 ? Math.max(...subs.map((s) => totalNiveles(s.niveles))) : 0;

  return (
    <Card
      className={["gap-0 overflow-hidden", className ?? ""].join(" ").trim()}
    >
      {/* ── Header: label + selector ── */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid #DCE3EB" }}
      >
        <p
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            color: "#6B7A8D",
            textTransform: "uppercase",
            letterSpacing: "0.09em",
            lineHeight: 1,
          }}
        >
          {label}
        </p>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger
            size="sm"
            className="w-auto min-w-[148px] h-[30px] text-[11px] rounded-lg border-[#DCE3EB] bg-[#EDF1F5] text-[#14161A] font-normal"
            style={{ fontFamily: "IBM Plex Sans, sans-serif" }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tipos.map((t) => (
              <SelectItem
                key={t}
                value={t}
                className="text-[12px]"
                style={{ fontFamily: "IBM Plex Sans, sans-serif" }}
              >
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Total figure ── */}
      <div className="px-5 pt-5 pb-1 flex items-baseline gap-2">
        <span
          style={{
            ...TXT_MAIN,
            fontSize: 36,
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          {total}
        </span>
        <span
          style={{
            ...TXT_MUTED,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          total
        </span>
      </div>

      {/* ── Stacked bars ── */}
      <div className="px-5 pt-4 pb-5 flex flex-col gap-3">
        {subs.map((sub) => (
          <StackedBarRow
            key={sub.nombre}
            nombre={sub.nombre}
            niveles={sub.niveles}
            maxTotal={maxSubTotal}
          />
        ))}
      </div>

      {/* ── Footer severity legend ── */}
      <div
        className="px-5 py-3 flex items-center gap-5 flex-wrap"
        style={{ borderTop: "1px solid #DCE3EB" }}
      >
        {SEV.map((s) => (
          <div key={s.level} className="flex items-center gap-1.5">
            <span
              className="rounded-full flex-shrink-0"
              style={{
                width: 8,
                height: 8,
                backgroundColor: s.color,
                display: "inline-block",
              }}
            />
            <span
              style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: "#6B7A8D" }}
            >
              <span style={{ color: "#14161A", fontWeight: 500 }}>{s.level}</span>
              {" · "}
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
