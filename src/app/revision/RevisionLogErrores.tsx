import React, { useState } from "react";
import { Lock, UserCog, FilterX, AlertTriangle, XCircle, ArrowLeft, Check } from "lucide-react";
import { C, Header } from "../App";
import { useRevision, type LogErrorEntry, type LogOrigen } from "./store";

// ─── Metadatos por origen (icono + color) -- mismo patrón de ícono+color por
// tipo ya usado en la tabla de Administración → Usuarios. "Validador-triage"
// va en ámbar, no rojo: "Descartado en triage" NO es un error de calidad. ────
const ORIGEN_META: Record<LogOrigen, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  "Sistema": { icon: Lock, color: C.steel4, bg: `${C.steel3}18`, label: "Sistema (candados)" },
  "Asesor": { icon: UserCog, color: C.critico, bg: C.rojoClaro, label: "Asesor" },
  "Validador-triage": { icon: FilterX, color: C.ambarTexto, bg: C.ambar2, label: "Descartado en triage" },
  "Analista": { icon: AlertTriangle, color: C.critico, bg: C.rojoClaro, label: "Analista" },
  "Validador-decision": { icon: XCircle, color: C.critico, bg: C.rojoClaro, label: "No usado" },
};

// Etapa más lejana alcanzada antes del descarte -- para el tracker horizontal
// del detalle. "Sistema" no pertenece al pipeline de 4 etapas (los candados
// corren sobre la ingesta, no sobre un hallazgo ya en Etapa 1-4).
const STAGE_REACHED: Partial<Record<LogOrigen, number>> = {
  "Asesor": 1,
  "Validador-triage": 2,
  "Analista": 3,
  "Validador-decision": 4,
};
const STAGE_LABELS = ["Etapa 1 · Asesor", "Etapa 2 · Triage", "Etapa 3 · Analista", "Etapa 4 · Decisión"];

const fieldStyle: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: C.text,
  backgroundColor: C.canvas,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "7px 12px",
  fontSize: 13,
  outline: "none",
};

function MetricCard({ label, value, bg, color }: { label: string; value: number; bg?: string; color?: string }) {
  return (
    <div className="rounded-lg p-4 flex flex-col justify-between h-[92px]" style={{ backgroundColor: bg ?? C.card, border: `1px solid ${C.border}` }}>
      <p className="text-[10px] tracking-widest uppercase font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: color ?? C.textMuted }}>
        {label}
      </p>
      <p className="font-semibold leading-none" style={{ fontFamily: "Space Grotesk, sans-serif", color: color ?? C.text, fontSize: 26 }}>
        {value}
      </p>
    </div>
  );
}

// ─── Detalle de una entrada ──────────────────────────────────────────────────

function DetalleLog({ entry, onBack }: { entry: LogErrorEntry; onBack: () => void }) {
  const meta = ORIGEN_META[entry.origen];
  const reached = STAGE_REACHED[entry.origen];

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1"
        style={{ alignSelf: "flex-start", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <ArrowLeft size={13} /> Volver al listado
      </button>

      {reached ? (
        <div className="flex items-center gap-2 flex-wrap">
          {STAGE_LABELS.map((label, i) => {
            const stageNum = i + 1;
            const isReached = stageNum <= reached;
            const isTerminal = stageNum === reached;
            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: isReached ? (isTerminal ? meta.bg : C.border) : "transparent", border: `1px solid ${isReached ? "transparent" : C.border}` }}>
                  <span
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: isTerminal ? meta.color : isReached ? C.textMuted : C.border }}
                  >
                    {isReached && !isTerminal && <Check size={9} color="#ffffff" strokeWidth={3} />}
                  </span>
                  <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 600, color: isTerminal ? meta.color : isReached ? C.text : C.textMuted }}>
                    {label}
                  </span>
                </div>
                {i < STAGE_LABELS.length - 1 && <div style={{ width: 20, height: 1, backgroundColor: C.border }} />}
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>
          No aplica -- los candados de Sistema corren sobre la ingesta, fuera de las 4 etapas del pipeline.
        </p>
      )}

      <div className="rounded-lg px-4 py-3 flex items-start gap-3" style={{ backgroundColor: meta.bg, border: `1px solid ${meta.color}55` }}>
        <meta.icon size={16} color={meta.color} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, color: meta.color, marginBottom: 2 }}>
            {meta.label}
          </p>
          <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: meta.color, opacity: 0.85 }}>
            Registro terminal -- no reingresa al pipeline. Solo nutre mejora de agentes/IA.
          </p>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted }}>
            Valores congelados
          </p>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {([
            ["Hallazgo", entry.hallazgoNombre],
            ["País", entry.pais],
            ["Tipo", entry.tipo],
            ["Origen", meta.label],
            ["Fecha", entry.fecha],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5 border-b last:border-0" style={{ borderColor: C.border }}>
              <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted }}>{k}</span>
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 500, color: C.text, textAlign: "right", maxWidth: "60%" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted }}>
            Nota de retroalimentación
          </p>
        </div>
        <div className="p-4">
          <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: C.text, lineHeight: 1.6 }}>{entry.motivo}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

const PAISES_TODOS = "Todos los países";
const TIPOS_TODOS = "Todos los tipos";

export default function RevisionLogErrores() {
  const { logErrores } = useRevision();
  const [origen, setOrigen] = useState<LogOrigen | "Todos">("Todos");
  const [pais, setPais] = useState(PAISES_TODOS);
  const [tipo, setTipo] = useState(TIPOS_TODOS);
  const [buscar, setBuscar] = useState("");
  const [selected, setSelected] = useState<LogErrorEntry | null>(null);

  const paises = Array.from(new Set(logErrores.map(e => e.pais))).filter(p => p !== "—");
  // Derivado de logErrores (no hardcodeado): los datos de muestra incluyen
  // "Trámite" y "Barrera regulatoria", más "Regulación" en un par de entradas --
  // se listan las tres para no dejar registros reales fuera del filtro.
  const tipos = Array.from(new Set(logErrores.map(e => e.tipo))).filter(t => t !== "—");

  const filtradas = logErrores.filter(e =>
    (origen === "Todos" || e.origen === origen) &&
    (pais === PAISES_TODOS || e.pais === pais) &&
    (tipo === TIPOS_TODOS || e.tipo === tipo) &&
    (buscar.trim() === "" || e.hallazgoNombre.toLowerCase().includes(buscar.trim().toLowerCase()))
  );

  const counts = (Object.keys(ORIGEN_META) as LogOrigen[]).reduce((acc, o) => {
    acc[o] = logErrores.filter(e => e.origen === o).length;
    return acc;
  }, {} as Record<LogOrigen, number>);

  if (selected) {
    return (
      <div className="p-4 md:p-8 overflow-y-auto h-full">
        <Header breadcrumb="ALEPH · Revisión" title="Detalle de log_errores" />
        <DetalleLog entry={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb="ALEPH · Revisión" title="Log de errores" />

      {/* ── Metric cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {(Object.keys(ORIGEN_META) as LogOrigen[]).map(o => (
          <MetricCard
            key={o}
            label={ORIGEN_META[o].label}
            value={counts[o]}
            bg={o === "Validador-triage" ? ORIGEN_META[o].bg : undefined}
            color={o === "Validador-triage" ? ORIGEN_META[o].color : undefined}
          />
        ))}
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <select value={origen} onChange={e => setOrigen(e.target.value as LogOrigen | "Todos")} style={fieldStyle}>
          <option value="Todos">Todos los orígenes</option>
          {(Object.keys(ORIGEN_META) as LogOrigen[]).map(o => (
            <option key={o} value={o}>{ORIGEN_META[o].label}</option>
          ))}
        </select>
        <select value={pais} onChange={e => setPais(e.target.value)} style={fieldStyle}>
          <option value={PAISES_TODOS}>{PAISES_TODOS}</option>
          {paises.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={tipo} onChange={e => setTipo(e.target.value)} style={fieldStyle}>
          <option value={TIPOS_TODOS}>{TIPOS_TODOS}</option>
          {tipos.map(t => <option key={t}>{t}</option>)}
        </select>
        <input
          type="text"
          placeholder="Buscar hallazgo..."
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          style={{ ...fieldStyle, minWidth: 220 }}
        />
      </div>

      {/* ── List ─────────────────────────────────────────────────────────── */}
      {filtradas.length === 0 ? (
        <div className="rounded-lg flex items-center justify-center py-14" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: C.textMuted }}>
            {logErrores.length === 0 ? "Todavía no hay entradas en log_errores." : "Ningún registro coincide con los filtros actuales."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          {filtradas.map((e, i) => {
            const meta = ORIGEN_META[e.origen];
            return (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#F4F7FB] transition-colors"
                style={{
                  borderWidth: 0,
                  borderBottomWidth: i < filtradas.length - 1 ? 1 : 0,
                  borderStyle: "solid",
                  borderColor: C.border,
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <span className="flex items-center justify-center flex-shrink-0" style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: meta.bg }}>
                  <meta.icon size={14} color={meta.color} strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 500, color: C.text }}>{e.hallazgoNombre}</p>
                  <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted }}>{e.pais} · {e.tipo} · {e.fecha}</p>
                </div>
                <span
                  style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10, fontWeight: 600, backgroundColor: meta.bg, color: meta.color, borderRadius: 9999, padding: "3px 10px", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-4" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>
        "Descartado en triage" no es un error de calidad -- es el Validador confirmando en Etapa 2 que un hallazgo no
        constituye una barrera. Los demás orígenes sí reflejan una falla de calidad en alguna etapa del pipeline.
      </p>
    </div>
  );
}
