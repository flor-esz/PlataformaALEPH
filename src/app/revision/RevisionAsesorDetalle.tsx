import React, { useState } from "react";
import { Bot, UserCog, Check, ArrowLeft } from "lucide-react";
import { C, Header } from "../App";

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldOrigin = "ia" | "asesor";

interface FieldState {
  value: string;
  origin: FieldOrigin;
  reviewed: boolean;
}

type FieldKey =
  | "titulo"
  | "textoNormativo"
  | "pasaje"
  | "diagnostico"
  | "severidad"
  | "clasificacion"
  | "instrumento";

type Fields = Record<FieldKey, FieldState>;

// ─── Sample data ──────────────────────────────────────────────────────────────

const INITIAL_FIELDS: Fields = {
  titulo: {
    value: "Restricción a Operadores Sin Planta Propia",
    origin: "ia",
    reviewed: false,
  },
  textoNormativo: {
    value: `Artículo 12. — Requisitos para inscripción como exportador de café tostado.\n\nPara obtener la inscripción en el Registro de Exportadores de Café Tostado, el solicitante deberá acreditar la propiedad o arrendamiento a largo plazo (mínimo 5 años) de las instalaciones de tostado, incluyendo equipos industriales propios. No se admitirá la inscripción de personas naturales o jurídicas que operen mediante convenios de capacidad compartida, maquila o arrendamiento de capacidad instalada de terceros.\n\nEsta disposición busca garantizar la trazabilidad y calidad del café de exportación, vinculando la responsabilidad del exportador a instalaciones físicas verificables.`,
    origin: "ia",
    reviewed: false,
  },
  pasaje: {
    value:
      "No se admitirá la inscripción de personas naturales o jurídicas que operen mediante convenios de capacidad compartida, maquila o arrendamiento de capacidad instalada de terceros.",
    origin: "ia",
    reviewed: false,
  },
  diagnostico: {
    value:
      "El marco normativo desconoce los modelos de negocio modernos de tostadores que operan por maquila en plantas de terceros certificadas. Esta restricción impide el acceso al mercado internacional de exportadores artesanales y medianos que no pueden costear instalaciones propias, con un impacto estimado de USD 2.4 M en exportaciones no realizadas por ciclo.",
    origin: "ia",
    reviewed: false,
  },
  severidad: {
    value: "Crítico",
    origin: "asesor",
    reviewed: true,
  },
  clasificacion: {
    value: "Entrada",
    origin: "ia",
    reviewed: false,
  },
  instrumento: {
    value: "Ley de Regulación de Exportaciones de Café PCM-2019",
    origin: "asesor",
    reviewed: true,
  },
};

const SEVERIDADES = ["Crítico", "Alto", "Mediano", "Bajo"];
const CLASIFICACIONES = ["Entrada", "Operación", "Salida"];
const JERARQUIAS = ["Legal", "Reglamentario", "Administrativo", "Acuerdo Ministerial"];

const SEV_COLOR: Record<string, string> = {
  Crítico: C.critico,
  Alto: C.alto,
  Mediano: C.mediano,
  Bajo: C.bajo,
};

// ─── Primitive components ─────────────────────────────────────────────────────

function SeverityBadge({ level }: { level: string }) {
  const color = SEV_COLOR[level] ?? C.bajo;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 9999,
        fontSize: 11,
        fontFamily: "Space Grotesk, sans-serif",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {level}
    </span>
  );
}

function OriginChip({ origin }: { origin: FieldOrigin }) {
  const isAI = origin === "ia";
  const Icon = isAI ? Bot : UserCog;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        backgroundColor: isAI ? C.verde2 : `${C.steel1}33`,
        color: isAI ? C.verde1 : C.steel3,
        borderRadius: 9999,
        padding: "2px 8px",
        fontSize: 10,
        fontFamily: "Space Grotesk, sans-serif",
        fontWeight: 600,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <Icon size={10} strokeWidth={2} />
      {isAI ? "Validado por IA" : "Ajustado por Asesor"}
    </span>
  );
}

function CheckBtn({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={checked ? "Marcar sin revisar" : "Marcar como revisado"}
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: checked ? C.steel4 : C.border,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background-color 0.15s",
      }}
    >
      <Check size={12} color={checked ? "#ffffff" : C.textMuted} strokeWidth={2.5} />
    </button>
  );
}

// ─── Field row: label + chips (reused across card headers and sidebar) ─────────

function FieldMeta({
  label,
  field,
  onToggle,
  dim = false,
}: {
  label: string;
  field: FieldState;
  onToggle: () => void;
  dim?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      <span
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: dim ? C.textMuted : C.textMuted,
        }}
      >
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <OriginChip origin={field.origin} />
        <CheckBtn checked={field.reviewed} onClick={onToggle} />
      </div>
    </div>
  );
}

// ─── Shared input/textarea styles ─────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "IBM Plex Sans, sans-serif",
  fontSize: 13,
  color: C.text,
  backgroundColor: C.canvas,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "9px 12px",
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 100,
  lineHeight: 1.6,
};

// ─── Main component ───────────────────────────────────────────────────────────

interface RevisionAsesorDetalleProps {
  onBack?: () => void;
  onReject?: () => void;
  onAccept?: () => void;
}

export default function RevisionAsesorDetalle({
  onBack,
  onReject,
  onAccept,
}: RevisionAsesorDetalleProps) {
  const [fields, setFields] = useState<Fields>(INITIAL_FIELDS);
  const [nota, setNota] = useState("");
  const [jerarquia, setJerarquia] = useState("Legal");

  const updateField = (key: FieldKey, value: string) => {
    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], value, reviewed: true, origin: "asesor" },
    }));
  };

  const toggleReviewed = (key: FieldKey) => {
    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], reviewed: !prev[key].reviewed },
    }));
  };

  const ALL_KEYS: FieldKey[] = [
    "titulo",
    "textoNormativo",
    "pasaje",
    "diagnostico",
    "severidad",
    "clasificacion",
    "instrumento",
  ];
  const total = ALL_KEYS.length;
  const reviewedCount = ALL_KEYS.filter((k) => fields[k].reviewed).length;
  const allReviewed = reviewedCount === total;

  // Build highlighted preview of the pasaje within the full text
  const textFull = fields.textoNormativo.value;
  const pasajeTrim = fields.pasaje.value.trim();
  const pasajeIdx = pasajeTrim ? textFull.indexOf(pasajeTrim) : -1;

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full flex flex-col gap-0">
      {/* Back */}
      <button
        className="flex items-center gap-1 text-[12px] mb-4"
        style={{
          color: C.textMuted,
          fontFamily: "IBM Plex Sans, sans-serif",
          background: "none",
          border: "none",
          cursor: "pointer",
          alignSelf: "flex-start",
        }}
        onClick={onBack}
      >
        <ArrowLeft size={13} />
        Volver al Repositorio
      </button>

      <Header breadcrumb="ALEPH · Revisión · Asesor" title="Detalle de hallazgo" />

      {/* Severity + sector + title row */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <SeverityBadge level={fields.severidad.value} />
          <span
            style={{
              fontFamily: "IBM Plex Sans, sans-serif",
              fontSize: 12,
              color: C.textMuted,
            }}
          >
            Agroindustria Cafetalera · Bolivia · Hace 1 día
          </span>
        </div>

        {/* Editable title */}
        <FieldMeta
          label="Título del hallazgo"
          field={fields.titulo}
          onToggle={() => toggleReviewed("titulo")}
        />
        <input
          value={fields.titulo.value}
          onChange={(e) => updateField("titulo", e.target.value)}
          style={{
            ...inputStyle,
            fontSize: 20,
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 600,
            color: C.text,
            padding: "10px 14px",
          }}
        />
      </div>

      {/* 2-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Left column (2/3) ─────────────────────────────────────────── */}
        <div className="md:col-span-2 flex flex-col gap-5">

          {/* Legal text card */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
          >
            {/* Card header */}
            <div
              className="px-5 py-3 border-b"
              style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}
            >
              <FieldMeta
                label="Texto normativo de origen"
                field={fields.textoNormativo}
                onToggle={() => toggleReviewed("textoNormativo")}
              />
              <p
                style={{
                  fontFamily: "IBM Plex Sans, sans-serif",
                  fontSize: 11,
                  color: C.textMuted,
                }}
              >
                {fields.instrumento.value} · {jerarquia} · Bolivia · 2019
              </p>
            </div>

            {/* Full text textarea */}
            <div className="flex">
              <div
                className="w-1 flex-shrink-0"
                style={{ backgroundColor: C.steel2 }}
              />
              <div className="p-5 flex-1">
                <textarea
                  value={fields.textoNormativo.value}
                  onChange={(e) => updateField("textoNormativo", e.target.value)}
                  style={{ ...textareaStyle, minHeight: 140 }}
                />

                {/* Pasaje resaltado sub-field */}
                <div className="mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
                  <FieldMeta
                    label="Pasaje resaltado"
                    field={fields.pasaje}
                    onToggle={() => toggleReviewed("pasaje")}
                  />
                  <input
                    value={fields.pasaje.value}
                    onChange={(e) => updateField("pasaje", e.target.value)}
                    placeholder="Fragmento exacto que constituye la barrera…"
                    style={inputStyle}
                  />

                  {/* Live highlight preview */}
                  {pasajeTrim && (
                    <div
                      className="mt-3 rounded-lg p-3 italic text-[12px] leading-relaxed"
                      style={{
                        backgroundColor: "#F4F7FA",
                        border: `1px solid ${C.border}`,
                        fontFamily: "IBM Plex Sans, sans-serif",
                        color: C.text,
                      }}
                    >
                      <div className="flex gap-3">
                        <div
                          className="w-0.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: C.steel3 }}
                        />
                        <p>
                          {pasajeIdx >= 0 ? (
                            <>
                              {textFull.slice(0, pasajeIdx)}
                              <mark
                                style={{
                                  backgroundColor: `${C.steel3}28`,
                                  color: C.steel4,
                                  padding: "0 2px",
                                  borderRadius: 2,
                                  fontStyle: "normal",
                                  fontWeight: 600,
                                }}
                              >
                                {pasajeTrim}
                              </mark>
                              {textFull.slice(pasajeIdx + pasajeTrim.length)}
                            </>
                          ) : (
                            <>
                              {textFull}{" "}
                              <span
                                style={{
                                  fontStyle: "normal",
                                  fontSize: 10,
                                  color: C.critico,
                                }}
                              >
                                (pasaje no encontrado en el texto)
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic card */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
          >
            <div
              className="px-5 py-3 border-b"
              style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}
            >
              <FieldMeta
                label="Diagnóstico económico"
                field={fields.diagnostico}
                onToggle={() => toggleReviewed("diagnostico")}
              />
            </div>
            <div className="p-5">
              <textarea
                value={fields.diagnostico.value}
                onChange={(e) => updateField("diagnostico", e.target.value)}
                style={{ ...textareaStyle, minHeight: 110 }}
              />
            </div>
          </div>

          {/* Nota de consultoría (new field — no origin/check) */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
          >
            <div
              className="px-5 py-3 border-b"
              style={{ borderColor: C.border, backgroundColor: "#F0F4F8" }}
            >
              <p
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: C.textMuted,
                }}
              >
                Nota de consultoría
              </p>
              <p
                style={{
                  fontFamily: "IBM Plex Sans, sans-serif",
                  fontSize: 11,
                  color: C.textMuted,
                  marginTop: 2,
                }}
              >
                Observaciones del asesor · no se publica
              </p>
            </div>
            <div className="p-5">
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Añade contexto, advertencias o notas internas sobre este hallazgo para el equipo técnico…"
                style={{ ...textareaStyle, minHeight: 90 }}
              />
            </div>
          </div>

          {/* Action footer (below left column) */}
          <div
            className="rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              backgroundColor: C.card,
              border: `1px solid ${C.border}`,
            }}
          >
            {/* Counter */}
            <p
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: allReviewed ? C.verde1 : C.ambarTexto,
                flexShrink: 0,
              }}
            >
              {reviewedCount} de {total} campos revisados
              {allReviewed && (
                <span
                  style={{
                    marginLeft: 8,
                    fontWeight: 400,
                    fontSize: 11,
                    color: C.verde1,
                    fontFamily: "IBM Plex Sans, sans-serif",
                  }}
                >
                  · listo para enviar
                </span>
              )}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onReject}
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "9px 18px",
                  borderRadius: 8,
                  backgroundColor: "transparent",
                  color: C.critico,
                  border: `1px solid ${C.critico}55`,
                  cursor: "pointer",
                }}
              >
                Rechazar hallazgo
              </button>

              <button
                onClick={allReviewed ? onAccept : undefined}
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "9px 18px",
                  borderRadius: 8,
                  backgroundColor: allReviewed ? C.steel4 : `${C.steel4}44`,
                  color: "#ffffff",
                  border: "none",
                  cursor: allReviewed ? "pointer" : "not-allowed",
                  transition: "background-color 0.2s",
                }}
                title={
                  allReviewed
                    ? undefined
                    : `Revisa los ${total - reviewedCount} campos pendientes`
                }
              >
                Aceptar y enviar a Etapa 2
              </button>
            </div>
          </div>
        </div>

        {/* ── Sidebar (1/3) ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-lg p-5"
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
          >
            <p
              className="text-[11px] uppercase tracking-widest font-medium mb-4"
              style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}
            >
              Metadatos del hallazgo
            </p>

            <div className="flex flex-col gap-4">
              {/* Severidad */}
              <div>
                <FieldMeta
                  label="Severidad"
                  field={fields.severidad}
                  onToggle={() => toggleReviewed("severidad")}
                />
                <select
                  value={fields.severidad.value}
                  onChange={(e) => updateField("severidad", e.target.value)}
                  style={inputStyle}
                >
                  {SEVERIDADES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Clasificación */}
              <div>
                <FieldMeta
                  label="Clasificación"
                  field={fields.clasificacion}
                  onToggle={() => toggleReviewed("clasificacion")}
                />
                <select
                  value={fields.clasificacion.value}
                  onChange={(e) => updateField("clasificacion", e.target.value)}
                  style={inputStyle}
                >
                  {CLASIFICACIONES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Instrumento */}
              <div>
                <FieldMeta
                  label="Instrumento"
                  field={fields.instrumento}
                  onToggle={() => toggleReviewed("instrumento")}
                />
                <input
                  value={fields.instrumento.value}
                  onChange={(e) => updateField("instrumento", e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Divider */}
              <div style={{ height: 1, backgroundColor: C.border }} />

              {/* Read-only metadata */}
              {(
                [
                  ["Sector", "Agroindustria Cafetalera"],
                  ["País", "Bolivia"],
                  ["Año instrumento", "2019"],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between py-1.5 border-b last:border-0"
                  style={{ borderColor: C.border }}
                >
                  <span
                    style={{
                      fontFamily: "IBM Plex Sans, sans-serif",
                      fontSize: 12,
                      color: C.textMuted,
                    }}
                  >
                    {k}
                  </span>
                  <span
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: 12,
                      fontWeight: 500,
                      color: C.text,
                      textAlign: "right",
                      maxWidth: "60%",
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}

              {/* Jerarquía — editable but without review tracking */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: C.textMuted,
                    marginBottom: 6,
                  }}
                >
                  Jerarquía
                </label>
                <select
                  value={jerarquia}
                  onChange={(e) => setJerarquia(e.target.value)}
                  style={inputStyle}
                >
                  {JERARQUIAS.map((j) => (
                    <option key={j}>{j}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Progress summary card */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: allReviewed
                ? `${C.verde1}10`
                : `${C.ambarTexto}0d`,
              border: `1px solid ${allReviewed ? `${C.verde1}44` : `${C.ambarTexto}33`}`,
            }}
          >
            <p
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: allReviewed ? C.verde1 : C.ambarTexto,
                marginBottom: 10,
              }}
            >
              Progreso de revisión
            </p>

            {/* Progress bar */}
            <div
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: C.border,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: `${(reviewedCount / total) * 100}%`,
                  height: "100%",
                  backgroundColor: allReviewed ? C.verde1 : C.ambarTexto,
                  borderRadius: 3,
                  transition: "width 0.3s",
                }}
              />
            </div>

            {/* Field status list */}
            <div className="flex flex-col gap-1.5">
              {ALL_KEYS.map((key) => {
                const f = fields[key];
                const labels: Record<FieldKey, string> = {
                  titulo: "Título",
                  textoNormativo: "Texto normativo",
                  pasaje: "Pasaje resaltado",
                  diagnostico: "Diagnóstico",
                  severidad: "Severidad",
                  clasificacion: "Clasificación",
                  instrumento: "Instrumento",
                };
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span
                      style={{
                        fontFamily: "IBM Plex Sans, sans-serif",
                        fontSize: 11,
                        color: f.reviewed ? C.text : C.textMuted,
                      }}
                    >
                      {labels[key]}
                    </span>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: f.reviewed ? C.steel4 : C.border,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Check
                        size={9}
                        color={f.reviewed ? "#ffffff" : C.textMuted}
                        strokeWidth={2.5}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
