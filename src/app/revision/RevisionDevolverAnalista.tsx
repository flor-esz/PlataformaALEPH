import React, { useState } from "react";
import { Info } from "lucide-react";
import { C, Header } from "../App";
import { StageChip } from "./shared/StageChip";
import { useRevision } from "./store";

interface RevisionDevolverAnalistaProps {
  id: string;
  onCancel?: () => void;
  /** Tras confirmar "Devolver a Etapa 3". */
  onDevuelto?: () => void;
}

export default function RevisionDevolverAnalista({ id, onCancel, onDevuelto }: RevisionDevolverAnalistaProps) {
  const { hallazgos, devolverAAnalista } = useRevision();
  const hallazgo = hallazgos.find(h => h.id === id) ?? null;
  const [motivo, setMotivo] = useState("");
  const canConfirm = motivo.trim().length > 0;

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <StageChip stage={4} label="Decisión Final · Devolución" state="active" />
          <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted }}>
            {hallazgo ? `${hallazgo.nombre} · ${hallazgo.pais}` : "Hallazgo de muestra (id no encontrado en el repositorio)"}
          </span>
        </div>
        <Header breadcrumb="ALEPH · Revisión · Validador" title="Devolver al Analista" />
      </div>

      {/* Dictamen original del Analista, solo lectura -- viene del hallazgo real */}
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted }}>
            Dictamen original del analista{hallazgo?.analistaNombre ? ` · ${hallazgo.analistaNombre}` : ""}
          </p>
        </div>
        <div className="p-4">
          <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: hallazgo?.dictamen ? C.text : C.textMuted, lineHeight: 1.6, fontStyle: hallazgo?.dictamen ? "normal" : "italic" }}>
            {hallazgo?.dictamen || "Sin dictamen registrado para este hallazgo."}
          </p>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="rounded-lg px-4 py-3 flex items-start gap-3" style={{ backgroundColor: C.ambar2, border: `1px solid ${C.ambar1}55` }}>
        <Info size={16} color={C.ambarTexto} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.ambarTexto, lineHeight: 1.5 }}>
          El hallazgo vuelve a Etapa 3, asignado al mismo Analista. Tu motivo aparecerá arriba de su checklist para que sepa qué revisar de nuevo.
        </p>
      </div>

      {/* Motivo obligatorio */}
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted }}>
            ¿Qué necesita revisarse de nuevo? *
          </p>
        </div>
        <div className="p-4">
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Explica qué le falta o qué corregir antes de volver a evaluar…"
            style={{ width: "100%", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: C.text, backgroundColor: C.canvas, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", resize: "vertical", outline: "none", minHeight: 100, boxSizing: "border-box", lineHeight: 1.6 }}
          />
        </div>
      </div>

      <div className="rounded-lg px-4 py-3 flex items-center justify-end gap-3" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <button
          onClick={onCancel}
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 500, padding: "9px 18px", borderRadius: 8, backgroundColor: "transparent", color: C.text, border: `1px solid ${C.border}`, cursor: "pointer" }}
        >
          Cancelar
        </button>
        <button
          onClick={canConfirm ? () => { devolverAAnalista(id, motivo); onDevuelto?.(); } : undefined}
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 8, backgroundColor: canConfirm ? C.ambar1 : `${C.ambar1}55`, color: "#ffffff", border: "none", cursor: canConfirm ? "pointer" : "not-allowed" }}
        >
          Devolver a Etapa 3
        </button>
      </div>
    </div>
  );
}
