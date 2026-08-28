import React, { useState } from "react";
import { ArrowLeft, Pencil, CornerUpLeft, X } from "lucide-react";
import { C, Header } from "../App";
import { StageChip } from "./shared/StageChip";
import { useRevision, FIELD_RESUELVE_CRITERIO, type Criterion, type ChecklistField } from "./store";

// DESAJUSTE DE MODELO DE DATOS que sigue sin resolver a propósito (así se
// acordó): `Hallazgo` no tiene scores de desempeño/calidad todavía -- quedan
// fijos de muestra con este TODO hasta que se decida de dónde deberían salir.
const SAMPLE_SCORES = { desempeno: 82, calidad: 91 };

// La tabla de diff, el nombre del Asesor y el conteo de "criterios evaluados"
// SÍ salen del hallazgo real desde que `Hallazgo` guarda criteriosJuridicos/
// criteriosEconomicos/camposChecklist/asesorNombre (ver store.tsx) -- confirma
// lo que se sospechaba: resolver la persistencia del checklist (antes el
// desajuste #2) trajo esto casi gratis.
function computeDiff(hallazgo: { criteriosJuridicos: Criterion[]; criteriosEconomicos: Criterion[]; camposChecklist: ChecklistField[] } | null) {
  if (!hallazgo) return [];
  const allCriteria = [...hallazgo.criteriosJuridicos, ...hallazgo.criteriosEconomicos];
  const label = (critId: string) => allCriteria.find(c => c.id === critId)?.label ?? critId;
  return hallazgo.camposChecklist
    .filter(f => f.actual !== f.vigente)
    .map(f => {
      const critId = FIELD_RESUELVE_CRITERIO[f.id] ?? null;
      const motivo = critId ? `${label(critId)} — no cumple` : "Corrección del Analista";
      return { campo: f.label, vigente: f.vigente, propuesta: f.actual, motivo };
    });
}

// ─── Metric card (mismo patrón que KpiCard en los dashboards de App.tsx; no
// hay todavía una versión propia de Revisión/log_errores -- Lote 6 -- para
// imitar en su lugar) ───────────────────────────────────────────────────────
function MetricCard({ label, value, sub, valueColor }: { label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <div className="rounded-lg p-5 flex flex-col justify-between h-[120px]" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      <p className="text-[11px] tracking-widest uppercase font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
        {label}
      </p>
      <p className="font-semibold leading-none" style={{ fontFamily: "Space Grotesk, sans-serif", color: valueColor || C.text, fontSize: 30 }}>
        {value}
      </p>
      {sub && <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{sub}</p>}
    </div>
  );
}

function PersonaChip({ iniciales, nombre, rol }: { iniciales: string; nombre: string; rol: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: C.steel3, color: "#ffffff", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 600 }}
      >
        {iniciales}
      </div>
      <div>
        <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 500, color: C.text }}>{nombre}</p>
        <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted }}>{rol}</p>
      </div>
    </div>
  );
}

function initials(nombre: string): string {
  return nombre.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

// ─── Modal de bifurcación: "Ajustar" ───────────────────────────────────────
function ModalBifurcacion({ onCorregir, onDevolver, onCancel }: { onCorregir: () => void; onDevolver: () => void; onCancel: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", backgroundColor: "rgba(20,22,26,0.5)" }}
      onClick={onCancel}
    >
      <div
        style={{ backgroundColor: C.card, borderRadius: 12, padding: "28px 32px", width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 600, color: C.text }}>Ajustar hallazgo</h3>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: C.textMuted, lineHeight: 1.6, marginBottom: 20 }}>
          Elige cómo se corrigen los campos afectados antes de publicar.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onCorregir}
            className="flex items-center gap-3"
            style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${C.border}`, backgroundColor: "transparent", cursor: "pointer", textAlign: "left" }}
          >
            <span className="flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: C.steel4 }}>
              <Pencil size={15} color="#ffffff" strokeWidth={2} />
            </span>
            <span>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, color: C.text }}>Corregirlo yo mismo</p>
              <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted }}>Edito los campos directamente y vuelvo a esta pantalla.</p>
            </span>
          </button>

          <button
            onClick={onDevolver}
            className="flex items-center gap-3"
            style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${C.ambar1}55`, backgroundColor: C.ambar2, cursor: "pointer", textAlign: "left" }}
          >
            <span className="flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: C.ambar1 }}>
              <CornerUpLeft size={15} color="#ffffff" strokeWidth={2} />
            </span>
            <span>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, color: C.ambarTexto }}>Devolver al Analista</p>
              <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.ambarTexto, opacity: 0.85 }}>Vuelve a Etapa 3 con el motivo que escribas.</p>
            </span>
          </button>
        </div>

        <button
          onClick={onCancel}
          style={{ marginTop: 16, width: "100%", padding: "9px 0", borderRadius: 8, fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 500, backgroundColor: C.border, color: C.textMuted, border: "none", cursor: "pointer" }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Modal simple: motivo de "No usar" ─────────────────────────────────────
function ModalNoUsar({ onConfirm, onCancel }: { onConfirm: (motivo: string) => void; onCancel: () => void }) {
  const [motivo, setMotivo] = useState("");
  const canConfirm = motivo.trim().length > 0;
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", backgroundColor: "rgba(20,22,26,0.5)" }}
      onClick={onCancel}
    >
      <div
        style={{ backgroundColor: C.card, borderRadius: 12, padding: "28px 32px", width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>Marcar como "No usar"</h3>
        <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: C.textMuted, lineHeight: 1.6, marginBottom: 20 }}>
          El hallazgo se moverá a <strong style={{ color: C.text }}>log_errores</strong> como "No usado". Esta acción no es reversible.
        </p>
        <label style={{ display: "block", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted, marginBottom: 6 }}>
          Motivo *
        </label>
        <textarea
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          placeholder="Explica por qué este hallazgo no se usa…"
          style={{ width: "100%", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", resize: "vertical", outline: "none", minHeight: 80, boxSizing: "border-box", marginBottom: 20 }}
        />
        <div className="flex gap-2.5">
          <button
            onClick={canConfirm ? () => onConfirm(motivo) : undefined}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 500, backgroundColor: canConfirm ? C.critico : `${C.critico}55`, color: "#ffffff", border: "none", cursor: canConfirm ? "pointer" : "not-allowed" }}
          >
            Confirmar
          </button>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 500, backgroundColor: C.border, color: C.textMuted, border: "none", cursor: "pointer" }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

interface RevisionDecisionFinalProps {
  id: string;
  onBack?: () => void;
  /** Tras confirmar "No usar" / "Aceptar y publicar". */
  onResuelto?: () => void;
  /** Bifurcación -> "Corregirlo yo mismo". */
  onAjustar?: () => void;
  /** Bifurcación -> "Devolver al Analista". */
  onDevolver?: () => void;
}

export default function RevisionDecisionFinal({ id, onBack, onResuelto, onAjustar, onDevolver }: RevisionDecisionFinalProps) {
  const { hallazgos, noUsar, aceptarYPublicar } = useRevision();
  const hallazgo = hallazgos.find(h => h.id === id) ?? null;

  const [bifurcacionOpen, setBifurcacionOpen] = useState(false);
  const [noUsarOpen, setNoUsarOpen] = useState(false);

  const diff = computeDiff(hallazgo);
  const todosCriterios = hallazgo ? [...hallazgo.criteriosJuridicos, ...hallazgo.criteriosEconomicos] : [];
  const criteriosEvaluados = `${todosCriterios.filter(c => c.result !== null).length}/${todosCriterios.length || 10}`;
  const asesorNombre = hallazgo?.asesorNombre ?? "Sin dato";

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full flex flex-col gap-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1"
        style={{ alignSelf: "flex-start", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <ArrowLeft size={13} /> Volver al Repositorio
      </button>

      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <StageChip stage={4} label="Decisión Final" state="active" />
          <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted }}>
            {hallazgo ? `${hallazgo.nombre} · ${hallazgo.pais}` : "Hallazgo de muestra (id no encontrado en el repositorio)"}
          </span>
        </div>
        <Header breadcrumb="ALEPH · Revisión · Validador" title="Decisión final" />
      </div>

      {/* ── Metric cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Score de desempeño" value={`${SAMPLE_SCORES.desempeno}/100`} sub="Asesor + Analista" valueColor={C.steel4} />
        <MetricCard label="Score de calidad" value={`${SAMPLE_SCORES.calidad}/100`} sub="evidencia y fuentes citadas" valueColor={C.verde1} />
        <MetricCard label="Criterios evaluados" value={criteriosEvaluados} sub="jurídicos + económicos" />
      </div>

      {/* ── Cuatro ojos ─────────────────────────────────────────────────── */}
      <div className="rounded-lg p-4 flex items-center gap-8 flex-wrap" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <PersonaChip iniciales={initials(asesorNombre)} nombre={asesorNombre} rol="Asesor · Etapa 1" />
        <div style={{ width: 1, height: 32, backgroundColor: C.border }} />
        <PersonaChip
          iniciales={initials(hallazgo?.analistaNombre ?? "Sin asignar")}
          nombre={hallazgo?.analistaNombre ?? "Sin asignar"}
          rol="Analista · Etapa 3"
        />
      </div>

      {/* ── Diff table ──────────────────────────────────────────────────── */}
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted }}>
            Cambios propuestos por el Analista
          </p>
        </div>
        {diff.length === 0 ? (
          <p className="px-4 py-4" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>
            Sin cambios propuestos todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Campo", "Vigente", "Etapa 3 · Propuesta"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {diff.map((d, i) => (
                  <tr key={d.campo} style={{ borderBottom: i < diff.length - 1 ? `1px solid ${C.border}` : undefined }}>
                    <td className="px-4 py-3" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, color: C.text }}>{d.campo}</td>
                    <td className="px-4 py-3" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted, textDecoration: "line-through" }}>{d.vigente}</td>
                    <td className="px-4 py-3">
                      <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>{d.propuesta}</p>
                      <span
                        style={{ display: "inline-flex", backgroundColor: C.rojoClaro, color: C.critico, borderRadius: 9999, padding: "2px 8px", fontSize: 10, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}
                      >
                        {d.motivo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Dictamen del analista (real: viene de store.tsx tras el Lote 4) ── */}
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted }}>
            Dictamen del analista
          </p>
        </div>
        <div className="p-4">
          <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: hallazgo?.dictamen ? C.text : C.textMuted, lineHeight: 1.6, fontStyle: hallazgo?.dictamen ? "normal" : "italic" }}>
            {hallazgo?.dictamen || "Sin dictamen registrado para este hallazgo."}
          </p>
        </div>
      </div>

      {/* ── Action row ──────────────────────────────────────────────────── */}
      <div className="rounded-lg px-4 py-3 flex items-center justify-end gap-3 flex-wrap" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <button
          onClick={() => setNoUsarOpen(true)}
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 500, padding: "9px 18px", borderRadius: 8, backgroundColor: "transparent", color: C.critico, border: `1px solid ${C.critico}55`, cursor: "pointer" }}
        >
          No usar
        </button>
        <button
          onClick={() => setBifurcacionOpen(true)}
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 8, backgroundColor: C.ambar2, color: C.ambarTexto, border: "none", cursor: "pointer" }}
        >
          Ajustar
        </button>
        <button
          onClick={() => { aceptarYPublicar(id); onResuelto?.(); }}
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 8, backgroundColor: C.verde1, color: "#ffffff", border: "none", cursor: "pointer" }}
        >
          Aceptar y publicar
        </button>
      </div>

      {noUsarOpen && (
        <ModalNoUsar
          onConfirm={(motivo) => { noUsar(id, motivo); setNoUsarOpen(false); onResuelto?.(); }}
          onCancel={() => setNoUsarOpen(false)}
        />
      )}
      {bifurcacionOpen && (
        <ModalBifurcacion
          onCorregir={() => { setBifurcacionOpen(false); onAjustar?.(); }}
          onDevolver={() => { setBifurcacionOpen(false); onDevolver?.(); }}
          onCancel={() => setBifurcacionOpen(false)}
        />
      )}
    </div>
  );
}
