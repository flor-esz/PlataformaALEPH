import React, { useState } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft, CornerUpLeft } from "lucide-react";
import { C, Header } from "../App";
import { StageChip } from "./shared/StageChip";
import { useRevision, richChecklist, FIELD_RESUELVE_CRITERIO, type Criterion, type CriterionResult, type ChecklistField } from "./store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── CriterionRow ─────────────────────────────────────────────────────────────

function CriterionRow({
  criterion,
  onChange,
}: {
  criterion: Criterion;
  onChange: (result: CriterionResult) => void;
}) {
  const toggle = (val: "cumple" | "no-cumple") =>
    onChange(criterion.result === val ? null : val);

  const pill = (
    val: "cumple" | "no-cumple",
    label: string,
    activeBg: string,
    activeColor: string
  ) => {
    const active = criterion.result === val;
    return (
      <button
        onClick={() => toggle(val)}
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 11,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 9999,
          border: `1px solid ${active ? activeColor + "66" : C.border}`,
          backgroundColor: active ? activeBg : "transparent",
          color: active ? activeColor : C.textMuted,
          cursor: "pointer",
          transition: "all 0.14s",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className="flex items-center justify-between py-2.5 border-b last:border-0"
      style={{ borderColor: C.border }}
    >
      <span
        style={{
          fontFamily: "IBM Plex Sans, sans-serif",
          fontSize: 13,
          color:
            criterion.result === "no-cumple"
              ? C.critico
              : criterion.result === "cumple"
              ? C.text
              : C.textMuted,
        }}
      >
        {criterion.label}
      </span>
      <div className="flex items-center gap-1.5">
        {pill("cumple", "Cumple", C.verde2, C.verde1)}
        {pill("no-cumple", "No Cumple", C.rojoClaro, C.critico)}
      </div>
    </div>
  );
}

// ─── EditableFieldCard ────────────────────────────────────────────────────────

function EditableFieldCard({
  field,
  criterionLabel,
  onChange,
}: {
  field: ChecklistField;
  criterionLabel: string | null;
  onChange: (next: Partial<ChecklistField>) => void;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
    >
      {/* Card header */}
      <div
        className="px-4 py-2.5 border-b flex items-center justify-between gap-2"
        style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}
      >
        <span
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: C.textMuted,
          }}
        >
          {field.label}
        </span>
        {criterionLabel && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: C.ambar2,
              color: C.ambarTexto,
              borderRadius: 9999,
              padding: "2px 8px",
              fontSize: 10,
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 600,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            resuelve: {criterionLabel}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex flex-col gap-2.5">
        {/* Actual value */}
        <div>
          <p style={{ ...LABEL_UPPER, marginBottom: 4 }}>Actual</p>
          <input
            value={field.actual}
            onChange={(e) => onChange({ actual: e.target.value })}
            style={INPUT}
          />
        </div>

        {/* Fuente */}
        <div>
          <p style={{ ...LABEL_UPPER, marginBottom: 4 }}>Fuente citada</p>
          <div className="flex gap-1.5">
            <input
              value={field.fuente}
              onChange={(e) => onChange({ fuente: e.target.value })}
              style={{ ...INPUT, flex: 1 }}
            />
            <button
              title="Cambiar fuente"
              onClick={() => console.log("cambiar fuente", field.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 6,
                backgroundColor: "transparent",
                border: `1px solid ${C.border}`,
                color: C.textMuted,
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
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

// ─── Main component ───────────────────────────────────────────────────────────

interface RevisionAnalistaChecklistProps {
  /** id del hallazgo real en src/app/revision/store.tsx. Si no existe ahí (ej. el
   *  acceso directo de demo usa id="demo"), la pantalla sigue funcionando con los
   *  datos de muestra de abajo -- "Enviar al Validador" simplemente no tendrá una
   *  fila real que mover. */
  id: string;
  onBack?: () => void;
  onSave?: () => void;
  onSend?: () => void;
}

export default function RevisionAnalistaChecklist({
  id,
  onBack,
  onSave,
  onSend,
}: RevisionAnalistaChecklistProps) {
  const { hallazgos, actualizarChecklist, enviarAValidador } = useRevision();
  const hallazgo = hallazgos.find(h => h.id === id) ?? null;

  // Estado local para edición responsiva; se inicializa una sola vez (al montar,
  // por eso el inicializador perezoso) desde el checklist real del hallazgo --
  // ver src/app/revision/store.tsx. "Guardar avance" y "Enviar al Validador" son
  // los puntos explícitos donde esto se escribe de vuelta al store (no hay
  // autosave continuo). Si el id no existe en el store (ej. acceso directo de
  // demo), cae a richChecklist() para que el formulario no quede vacío.
  const [juridicos, setJuridicos] = useState<Criterion[]>(() => hallazgo?.criteriosJuridicos ?? richChecklist().criteriosJuridicos);
  const [economicos, setEconomicos] = useState<Criterion[]>(() => hallazgo?.criteriosEconomicos ?? richChecklist().criteriosEconomicos);
  const [fields, setFields] = useState<ChecklistField[]>(() => hallazgo?.camposChecklist ?? richChecklist().camposChecklist);
  const [dictamen, setDictamen] = useState(() => hallazgo?.dictamen ?? "");

  const allCriteria = [...juridicos, ...economicos];
  const noCumpleList = allCriteria.filter((c) => c.result === "no-cumple");
  const noCumpleIds = new Set(noCumpleList.map((c) => c.id));

  const setJuridico = (id: string, result: CriterionResult) =>
    setJuridicos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, result } : c))
    );
  const setEconomico = (id: string, result: CriterionResult) =>
    setEconomicos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, result } : c))
    );
  const setField = (id: string, patch: Partial<EditableField>) =>
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  // Find label for a criterion id
  const getCriterionLabel = (id: string | null): string | null => {
    if (!id) return null;
    const found = allCriteria.find((c) => c.id === id);
    return found?.label ?? null;
  };

  // A field's "resuelve" chip solo se muestra cuando el criterio que ese campo
  // resuelve (según FIELD_RESUELVE_CRITERIO) está actualmente en "no-cumple".
  const resolveChip = (field: EditableField): string | null => {
    const criterionId = FIELD_RESUELVE_CRITERIO[field.id] ?? null;
    if (!criterionId) return null;
    return noCumpleIds.has(criterionId) ? getCriterionLabel(criterionId) : null;
  };

  const sectionCard = (
    title: string,
    criteria: Criterion[],
    onChangeFn: (id: string, r: CriterionResult) => void
  ) => (
    <div
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
    >
      <div
        className="px-4 py-2.5 border-b"
        style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}
      >
        <p
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: C.textMuted,
          }}
        >
          {title}
        </p>
      </div>
      <div className="px-4">
        {criteria.map((c) => (
          <CriterionRow
            key={c.id}
            criterion={c}
            onChange={(r) => onChangeFn(c.id, r)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full flex flex-col gap-5">

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          alignSelf: "flex-start",
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontFamily: "IBM Plex Sans, sans-serif",
          fontSize: 12,
          color: C.textMuted,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <ArrowLeft size={13} /> Volver al Repositorio
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <StageChip stage={3} label="Revisión del Analista" state="active" />
          <span
            style={{
              fontFamily: "IBM Plex Sans, sans-serif",
              fontSize: 11,
              color: C.textMuted,
            }}
          >
            {hallazgo ? `${hallazgo.nombre} · ${hallazgo.pais}` : "Hallazgo BARRE-2026-001 · Bolivia (muestra)"}
          </span>
        </div>
        <Header
          breadcrumb="ALEPH · Revisión · Analista"
          title="Checklist de revisión"
        />
      </div>

      {/* Context franja */}
      <div
        className="rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap"
        style={{
          backgroundColor: `${C.steel3}0d`,
          border: `1px solid ${C.steel3}28`,
        }}
      >
        <span
          style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: 12,
            color: C.steel4,
          }}
        >
          Asignado por el Validador
        </span>
        <span style={{ color: C.border, fontSize: 14 }}>·</span>
        <span
          style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: 12,
            color: C.textMuted,
          }}
        >
          Aprobado en Etapa 1 por Asesor{" "}
          <strong style={{ color: C.text }}>{hallazgo?.asesorNombre ?? "Carlos Mendoza"}</strong>
        </span>
        <span style={{ color: C.border, fontSize: 14 }}>·</span>
        <span
          style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: 12,
            color: C.textMuted,
          }}
        >
          {hallazgo?.hace ?? "Asignado hace 2 días"} · Prioridad{" "}
          <strong style={{ color: C.ambarTexto }}>{hallazgo?.prioridad ?? "Alta"}</strong>
        </span>
      </div>

      {/* ── Motivo de devolución del Validador (Lote 5: RevisionDecisionFinal /
          RevisionDevolverAnalista escriben devueltoPorValidador+motivoDevolucion) ── */}
      {hallazgo?.devueltoPorValidador && hallazgo.motivoDevolucion && (
        <div
          className="rounded-lg px-4 py-3 flex items-start gap-3"
          style={{ backgroundColor: C.ambar2, border: `1px solid ${C.ambar1}55` }}
        >
          <CornerUpLeft size={16} color={C.ambarTexto} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, color: C.ambarTexto, marginBottom: 2 }}>
              Devuelto por el Validador
            </p>
            <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.ambarTexto, opacity: 0.9 }}>
              {hallazgo.motivoDevolucion}
            </p>
          </div>
        </div>
      )}

      {/* ── Criteria columns ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionCard("Criterios jurídicos", juridicos, setJuridico)}
        {sectionCard("Criterios económicos", economicos, setEconomico)}
      </div>

      {/* ── No-Cumple alert banner ─────────────────────────────────────────────── */}
      {noCumpleList.length > 0 && (
        <div
          className="rounded-lg px-4 py-3 flex items-start gap-3"
          style={{
            backgroundColor: C.rojoClaro,
            border: `1px solid ${C.critico}55`,
          }}
        >
          <AlertTriangle
            size={16}
            color={C.critico}
            strokeWidth={2}
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <div>
            <p
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: C.critico,
                marginBottom: 2,
              }}
            >
              {noCumpleList.length} criterio{noCumpleList.length !== 1 ? "s" : ""} no{" "}
              {noCumpleList.length !== 1 ? "cumplen" : "cumple"} — corrige los campos
              afectados antes de continuar
            </p>
            <p
              style={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: 12,
                color: C.critico,
                opacity: 0.85,
              }}
            >
              {noCumpleList.map((c) => c.label).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* ── 4 Editable fields ─────────────────────────────────────────────────── */}
      <div>
        <p
          style={{
            ...LABEL_UPPER,
            fontSize: 11,
            marginBottom: 12,
          }}
        >
          Campos del hallazgo
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <EditableFieldCard
              key={f.id}
              field={f}
              criterionLabel={resolveChip(f)}
              onChange={(patch) => setField(f.id, patch)}
            />
          ))}
        </div>
      </div>

      {/* ── Dictamen textarea ──────────────────────────────────────────────────── */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
      >
        <div
          className="px-4 py-2.5 border-b"
          style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}
        >
          <p
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: C.textMuted,
            }}
          >
            Dictamen del analista
          </p>
          <p
            style={{
              fontFamily: "IBM Plex Sans, sans-serif",
              fontSize: 11,
              color: C.textMuted,
              marginTop: 2,
            }}
          >
            Evaluación técnica · se adjunta al hallazgo y es visible para el Validador
          </p>
        </div>
        <div className="p-4">
          <textarea
            value={dictamen}
            onChange={(e) => setDictamen(e.target.value)}
            placeholder="Redacta el dictamen técnico justificando la evaluación de cada criterio y las correcciones realizadas en los campos del hallazgo…"
            style={{
              width: "100%",
              fontFamily: "IBM Plex Sans, sans-serif",
              fontSize: 13,
              color: C.text,
              backgroundColor: C.canvas,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "10px 12px",
              resize: "vertical",
              outline: "none",
              minHeight: 120,
              boxSizing: "border-box",
              lineHeight: 1.6,
            }}
          />
        </div>
      </div>

      {/* ── Action row ────────────────────────────────────────────────────────── */}
      <div
        className="rounded-lg px-4 py-3 flex items-center justify-between gap-4 flex-wrap"
        style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
      >
        {/* Status hint */}
        <p
          style={{
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: 12,
            color:
              noCumpleList.length > 0
                ? C.critico
                : allCriteria.every((c) => c.result !== null)
                ? C.verde1
                : C.textMuted,
          }}
        >
          {noCumpleList.length > 0
            ? `${noCumpleList.length} criterio${noCumpleList.length !== 1 ? "s" : ""} pendiente${noCumpleList.length !== 1 ? "s" : ""} de corrección`
            : allCriteria.every((c) => c.result !== null)
            ? "Todos los criterios evaluados · listo para enviar"
            : `${allCriteria.filter((c) => c.result === null).length} criterio${allCriteria.filter((c) => c.result === null).length !== 1 ? "s" : ""} sin evaluar`}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { actualizarChecklist(id, { criteriosJuridicos: juridicos, criteriosEconomicos: economicos, camposChecklist: fields }); onSave?.(); }}
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 13,
              fontWeight: 500,
              padding: "9px 18px",
              borderRadius: 8,
              backgroundColor: "transparent",
              color: C.text,
              border: `1px solid ${C.border}`,
              cursor: "pointer",
            }}
          >
            Guardar avance
          </button>

          <button
            onClick={() => { enviarAValidador(id, { dictamen, criteriosJuridicos: juridicos, criteriosEconomicos: economicos, camposChecklist: fields }); onSend?.(); }}
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              padding: "9px 18px",
              borderRadius: 8,
              backgroundColor: C.steel4,
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Enviar al Validador
          </button>
        </div>
      </div>
    </div>
  );
}
