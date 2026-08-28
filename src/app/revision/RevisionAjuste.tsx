import React, { useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { C, Header } from "../App";
import { StageChip } from "./shared/StageChip";
import { useRevision, richChecklist, FIELD_RESUELVE_CRITERIO, type ChecklistField } from "./store";

// Reutiliza el mismo patrón Actual:/fuente/chip "resuelve:" de los Lotes 3/4.
// Los campos mostrados y el motivo de la franja roja salen del checklist real
// del hallazgo (criteriosJuridicos/económicos + camposChecklist en store.tsx),
// no de datos fijos -- ver handleFields/noCumpleCriterios más abajo.

const INPUT: React.CSSProperties = {
  width: "100%",
  fontFamily: "IBM Plex Sans, sans-serif",
  fontSize: 12,
  color: C.text,
  backgroundColor: C.canvas,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: "6px 10px",
  outline: "none",
  boxSizing: "border-box",
};

const LABEL_UPPER: React.CSSProperties = {
  fontFamily: "Space Grotesk, sans-serif",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: C.textMuted,
};

function EditableFieldCard({ field, criterionLabel, onChange }: { field: ChecklistField; criterionLabel: string; onChange: (patch: Partial<ChecklistField>) => void }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      <div className="px-4 py-2.5 border-b flex items-center justify-between gap-2" style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}>
        <span style={{ ...LABEL_UPPER }}>{field.label}</span>
        <span
          style={{ display: "inline-flex", alignItems: "center", backgroundColor: C.ambar2, color: C.ambarTexto, borderRadius: 9999, padding: "2px 8px", fontSize: 10, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          resuelve: {criterionLabel}
        </span>
      </div>
      <div className="px-4 py-3 flex flex-col gap-2.5">
        <div>
          <p style={{ ...LABEL_UPPER, marginBottom: 4 }}>Actual</p>
          <input value={field.actual} onChange={e => onChange({ actual: e.target.value })} style={INPUT} />
        </div>
        <div>
          <p style={{ ...LABEL_UPPER, marginBottom: 4 }}>Fuente citada</p>
          <div className="flex gap-1.5">
            <input value={field.fuente} onChange={e => onChange({ fuente: e.target.value })} style={{ ...INPUT, flex: 1 }} />
            <button
              title="Cambiar fuente"
              onClick={() => console.log("cambiar fuente", field.id)}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, backgroundColor: "transparent", border: `1px solid ${C.border}`, color: C.textMuted, fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              <RefreshCw size={11} strokeWidth={2} />
              Cambiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

interface RevisionAjusteProps {
  id: string;
  onCancel?: () => void;
  /** "Guardar y volver a decisión" -- vuelve a RevisionDecisionFinal, no publica por sí sola. */
  onSave?: () => void;
}

export default function RevisionAjuste({ id, onCancel, onSave }: RevisionAjusteProps) {
  const { hallazgos, actualizarChecklist } = useRevision();
  const hallazgo = hallazgos.find(h => h.id === id) ?? null;
  const fallback = richChecklist();
  const allCriteria = hallazgo
    ? [...hallazgo.criteriosJuridicos, ...hallazgo.criteriosEconomicos]
    : [...fallback.criteriosJuridicos, ...fallback.criteriosEconomicos];
  const noCumpleCriterios = allCriteria.filter(c => c.result === "no-cumple");
  const noCumpleIds = new Set(noCumpleCriterios.map(c => c.id));
  const criterionLabelForField = (fieldId: string): string | null => {
    const critId = FIELD_RESUELVE_CRITERIO[fieldId] ?? null;
    if (!critId || !noCumpleIds.has(critId)) return null;
    return allCriteria.find(c => c.id === critId)?.label ?? null;
  };

  const baseFields = hallazgo?.camposChecklist ?? fallback.camposChecklist;
  const affected = baseFields.filter(f => criterionLabelForField(f.id) !== null);
  // Si por alguna razón no hay campos afectados (ej. nada quedó en "No Cumple"),
  // mostrar los 4 de todas formas para no dejar la pantalla vacía.
  const [fields, setFields] = useState<ChecklistField[]>(affected.length > 0 ? affected : baseFields);

  const setField = (fid: string, patch: Partial<ChecklistField>) =>
    setFields(prev => prev.map(f => (f.id === fid ? { ...f, ...patch } : f)));

  const handleSave = () => {
    if (hallazgo) {
      const merged = hallazgo.camposChecklist.map(f => fields.find(ef => ef.id === f.id) ?? f);
      actualizarChecklist(id, { camposChecklist: merged });
    }
    onSave?.();
  };

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <StageChip stage={4} label="Decisión Final · Ajuste" state="active" />
          <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted }}>
            {hallazgo ? `${hallazgo.nombre} · ${hallazgo.pais}` : "Hallazgo de muestra (id no encontrado en el repositorio)"}
          </span>
        </div>
        <Header breadcrumb="ALEPH · Revisión · Validador" title="Ajustar hallazgo" />
      </div>

      {/* Franja heredada del motivo de "No Cumple" que originó estos campos */}
      <div className="rounded-lg px-4 py-3 flex items-start gap-3" style={{ backgroundColor: C.rojoClaro, border: `1px solid ${C.critico}55` }}>
        <AlertTriangle size={16} color={C.critico} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, color: C.critico, marginBottom: 2 }}>
            Corrigiendo campos que no cumplieron en la revisión del Analista
          </p>
          <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.critico, opacity: 0.85 }}>
            {noCumpleCriterios.length > 0 ? noCumpleCriterios.map(c => c.label).join(" · ") : "Sin criterios en \"No Cumple\" registrados."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(f => (
          <EditableFieldCard key={f.id} field={f} criterionLabel={criterionLabelForField(f.id) ?? "—"} onChange={patch => setField(f.id, patch)} />
        ))}
      </div>

      <div className="rounded-lg px-4 py-3 flex items-center justify-end gap-3" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <button
          onClick={onCancel}
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 500, padding: "9px 18px", borderRadius: 8, backgroundColor: "transparent", color: C.text, border: `1px solid ${C.border}`, cursor: "pointer" }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 8, backgroundColor: C.steel4, color: "#ffffff", border: "none", cursor: "pointer" }}
        >
          Guardar y volver a decisión
        </button>
      </div>
    </div>
  );
}
