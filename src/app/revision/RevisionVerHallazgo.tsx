import React, { useState } from "react";
import { ArrowLeft, Users, Pencil } from "lucide-react";
import { C, Header } from "../App";
import { StageChip } from "./shared/StageChip";
import { useRevision, type Criterion, type ChecklistField, type Etapa1FieldKey, FIELD_RESUELVE_CRITERIO } from "./store";
import { ModalAsignarAnalista } from "./RevisionTriageModales";

// Pantalla de CONSULTA para el ícono "Ver" del Repositorio -- a diferencia de
// RevisionAnalistaChecklist/RevisionDecisionFinal (pantallas de trabajo), acá
// nada es interactivo salvo los botones explícitos que pide cada etapa. No es
// un flag `readOnly` sobre esas pantallas: es un archivo separado, con sus
// propias versiones no-interactivas de los mismos componentes -- así ninguna
// pantalla de trabajo corre riesgo de que un cambio acá la rompa, y viceversa.

const PAISES = ["Argentina", "Brasil", "Chile", "Colombia", "Ecuador", "México", "Perú", "Uruguay"];
const TIPOS = ["Barrera regulatoria", "Trámite", "Regulación"];
const CLASIFICACIONES = ["Entrada", "Operación", "Salida"];

const CARD: React.CSSProperties = { backgroundColor: C.card, border: `1px solid ${C.border}` };
const CARD_HEAD: React.CSSProperties = { borderColor: C.border, backgroundColor: "#F0F4F8" };
const LABEL_UPPER: React.CSSProperties = {
  fontFamily: "Space Grotesk, sans-serif", fontSize: 10, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted,
};
const fieldStyle: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.canvas,
  border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
};
const BTN_PRIMARY: React.CSSProperties = {
  fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, padding: "9px 18px",
  borderRadius: 8, backgroundColor: C.steel4, color: "#ffffff", border: "none", cursor: "pointer",
};
const BTN_SECONDARY: React.CSSProperties = {
  fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 500, padding: "9px 18px",
  borderRadius: 8, backgroundColor: "transparent", color: C.text, border: `1px solid ${C.border}`, cursor: "pointer",
};

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b last:border-0" style={{ borderColor: C.border }}>
      <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted }}>{label}</span>
      <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 500, color: C.text, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

// ─── Etapa 3: checklist en modo consulta ────────────────────────────────────

function ReadOnlyCriterionRow({ criterion }: { criterion: Criterion }) {
  const color = criterion.result === "no-cumple" ? C.critico : criterion.result === "cumple" ? C.verde1 : C.textMuted;
  const bg = criterion.result === "no-cumple" ? C.rojoClaro : criterion.result === "cumple" ? C.verde2 : "transparent";
  const label = criterion.result === "no-cumple" ? "No Cumple" : criterion.result === "cumple" ? "Cumple" : "Sin evaluar";
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: C.border }}>
      <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: criterion.result === "no-cumple" ? C.critico : C.text }}>
        {criterion.label}
      </span>
      <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, backgroundColor: bg, color, border: `1px solid ${bg === "transparent" ? C.border : "transparent"}` }}>
        {label}
      </span>
    </div>
  );
}

function ReadOnlyFieldCard({ field, criterionLabel }: { field: ChecklistField; criterionLabel: string | null }) {
  return (
    <div className="rounded-lg overflow-hidden" style={CARD}>
      <div className="px-4 py-2.5 border-b flex items-center justify-between gap-2" style={CARD_HEAD}>
        <span style={LABEL_UPPER}>{field.label}</span>
        {criterionLabel && (
          <span style={{ display: "inline-flex", alignItems: "center", backgroundColor: C.ambar2, color: C.ambarTexto, borderRadius: 9999, padding: "2px 8px", fontSize: 10, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
            resuelve: {criterionLabel}
          </span>
        )}
      </div>
      <div className="px-4 py-3 flex flex-col gap-2.5">
        <div>
          <p style={{ ...LABEL_UPPER, marginBottom: 4 }}>Actual</p>
          <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.text }}>{field.actual}</p>
        </div>
        <div>
          <p style={{ ...LABEL_UPPER, marginBottom: 4 }}>Fuente citada</p>
          <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted }}>{field.fuente}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Etapa 1: checklist del Asesor en modo consulta ─────────────────────────
// Para cuando Validador/Administrador (que ven "todo" en isVisibleForRole)
// miran el trabajo de un Asesor que no es ellos mismos -- el propio dueño va
// directo a RevisionAsesorDetalle (edición real), nunca llega acá.
const ETAPA1_LABELS: Record<Etapa1FieldKey, string> = {
  titulo: "Título",
  textoNormativo: "Texto normativo de origen",
  pasaje: "Pasaje resaltado",
  diagnostico: "Diagnóstico económico",
  severidad: "Severidad",
  clasificacion: "Clasificación",
  instrumento: "Instrumento",
};
const ETAPA1_ORDER: Etapa1FieldKey[] = ["textoNormativo", "pasaje", "diagnostico", "severidad", "clasificacion", "instrumento"];

// ─── Etapa 4: decisión en modo consulta ─────────────────────────────────────
// Mismos SAMPLE_SCORES fijos y misma lógica de diff que RevisionDecisionFinal
// (dictamen/criterios evaluados sí son reales) -- ver el desajuste de datos ya
// documentado ahí sobre los scores. Duplicado a propósito, no importado: evita
// acoplar esta pantalla de solo lectura a la de trabajo.
const SAMPLE_SCORES = { desempeno: 82, calidad: 91 };

function MetricCardRO({ label, value, sub, valueColor }: { label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <div className="rounded-lg p-5 flex flex-col justify-between h-[120px]" style={CARD}>
      <p className="text-[11px] tracking-widest uppercase font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{label}</p>
      <p className="font-semibold leading-none" style={{ fontFamily: "Space Grotesk, sans-serif", color: valueColor || C.text, fontSize: 30 }}>{value}</p>
      {sub && <p className="text-[11px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{sub}</p>}
    </div>
  );
}

function initialsRO(nombre: string): string {
  return nombre.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function PersonaChipRO({ nombre, rol }: { nombre: string; rol: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.steel3, color: "#ffffff", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 600 }}>
        {initialsRO(nombre)}
      </div>
      <div>
        <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 500, color: C.text }}>{nombre}</p>
        <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted }}>{rol}</p>
      </div>
    </div>
  );
}

function computeDiffRO(hallazgo: { criteriosJuridicos: Criterion[]; criteriosEconomicos: Criterion[]; camposChecklist: ChecklistField[] }) {
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

// ─── Main component ─────────────────────────────────────────────────────────

interface RevisionVerHallazgoProps {
  id: string;
  userId: string;
  /** Etapa 4 · "Decidir" es del Validador (misma regla que el ícono de la tabla). */
  canDecide: boolean;
  onNavigate: (screen: string, id?: string) => void;
}

export default function RevisionVerHallazgo({ id, userId, canDecide, onNavigate }: RevisionVerHallazgoProps) {
  const { hallazgos, asignarAnalista, actualizarHallazgoBasico } = useRevision();
  const hallazgo = hallazgos.find(h => h.id === id) ?? null;

  const [asignarOpen, setAsignarOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombre: hallazgo?.nombre ?? "",
    pais: hallazgo?.pais ?? PAISES[0],
    tipo: hallazgo?.tipo ?? TIPOS[0],
    clasificacion: hallazgo?.clasificacion ?? CLASIFICACIONES[0],
    sector: hallazgo?.sector ?? "",
  });

  const volver = () => onNavigate("revision-repositorio");

  if (!hallazgo) {
    return (
      <div className="p-4 md:p-8 h-full flex flex-col gap-4">
        <button onClick={volver} className="flex items-center gap-1" style={{ alignSelf: "flex-start", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <ArrowLeft size={13} /> Volver al Repositorio
        </button>
        <Header breadcrumb="ALEPH · Revisión" title="Hallazgo no encontrado" />
        <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: C.textMuted }}>
          Este hallazgo ya no está en el repositorio activo (puede haber sido publicado, descartado o no usado).
        </p>
      </div>
    );
  }

  const startEdit = () => {
    setForm({ nombre: hallazgo.nombre, pais: hallazgo.pais, tipo: hallazgo.tipo, clasificacion: hallazgo.clasificacion, sector: hallazgo.sector });
    setEditando(true);
  };
  const guardarEdicion = () => {
    actualizarHallazgoBasico(id, { ...form });
    setEditando(false);
  };

  // Etapa 3: "Editar" solo si no está asignado a OTRO Analista.
  const puedeEditarEtapa3 = hallazgo.assignment !== "asignado" || hallazgo.analistaId === userId;

  const allCriteria = [...hallazgo.criteriosJuridicos, ...hallazgo.criteriosEconomicos];
  const noCumpleIds = new Set(allCriteria.filter(c => c.result === "no-cumple").map(c => c.id));
  const resolveChip = (field: ChecklistField): string | null => {
    const critId = FIELD_RESUELVE_CRITERIO[field.id] ?? null;
    if (!critId || !noCumpleIds.has(critId)) return null;
    return allCriteria.find(c => c.id === critId)?.label ?? null;
  };

  const diff = computeDiffRO(hallazgo);
  const criteriosEvaluados = `${allCriteria.filter(c => c.result !== null).length}/${allCriteria.length}`;

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full flex flex-col gap-5">
      <button onClick={volver} className="flex items-center gap-1" style={{ alignSelf: "flex-start", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        <ArrowLeft size={13} /> Volver al Repositorio
      </button>

      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <StageChip stage={hallazgo.stage} label={hallazgo.stageLabel} state="readonly" />
          <span style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted }}>{hallazgo.pais} · {hallazgo.tipo}</span>
        </div>
        <Header breadcrumb="ALEPH · Revisión · Consulta" title={hallazgo.nombre} />
      </div>

      {/* ═══ Etapa 2 · Triage ═══════════════════════════════════════════════ */}
      {hallazgo.stage === 2 && !editando && (
        <>
          <div className="rounded-lg overflow-hidden" style={CARD}>
            <div className="px-4 py-2.5 border-b" style={CARD_HEAD}>
              <p style={LABEL_UPPER}>Datos del hallazgo</p>
            </div>
            <div className="p-4">
              <MetaRow label="Nombre" value={hallazgo.nombre} />
              <MetaRow label="País" value={hallazgo.pais} />
              <MetaRow label="Tipo" value={hallazgo.tipo} />
              <MetaRow label="Clasificación" value={hallazgo.clasificacion} />
              <MetaRow label="Sector" value={hallazgo.sector} />
              <MetaRow label="Asesor" value={hallazgo.asesorNombre} />
              <MetaRow label="Creado" value={hallazgo.hace} />
            </div>
          </div>
          <div className="rounded-lg px-4 py-3 flex items-center justify-end gap-3 flex-wrap" style={CARD}>
            <button onClick={volver} style={BTN_SECONDARY}>Cancelar</button>
            <button onClick={startEdit} style={BTN_SECONDARY}><Pencil size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Editar</button>
            <button onClick={() => setAsignarOpen(true)} style={BTN_PRIMARY}><Users size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Asignar a Analista</button>
          </div>
        </>
      )}

      {hallazgo.stage === 2 && editando && (
        <>
          <div className="rounded-lg overflow-hidden" style={CARD}>
            <div className="px-4 py-2.5 border-b" style={CARD_HEAD}>
              <p style={LABEL_UPPER}>Editar datos del hallazgo</p>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div>
                <p style={{ ...LABEL_UPPER, marginBottom: 4 }}>Nombre</p>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={fieldStyle} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p style={{ ...LABEL_UPPER, marginBottom: 4 }}>País</p>
                  <select value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))} style={fieldStyle}>
                    {PAISES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <p style={{ ...LABEL_UPPER, marginBottom: 4 }}>Tipo</p>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} style={fieldStyle}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <p style={{ ...LABEL_UPPER, marginBottom: 4 }}>Clasificación</p>
                  <select value={form.clasificacion} onChange={e => setForm(f => ({ ...f, clasificacion: e.target.value }))} style={fieldStyle}>
                    {CLASIFICACIONES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p style={{ ...LABEL_UPPER, marginBottom: 4 }}>Sector</p>
                  <input value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} style={fieldStyle} />
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg px-4 py-3 flex items-center justify-end gap-3" style={CARD}>
            <button onClick={() => setEditando(false)} style={BTN_SECONDARY}>Cancelar</button>
            <button onClick={guardarEdicion} style={BTN_PRIMARY}>Guardar cambios</button>
          </div>
        </>
      )}

      {/* ═══ Etapa 1 · Asesor (checklist en modo consulta) ═══════════════════ */}
      {hallazgo.stage === 1 && hallazgo.camposEtapa1 && (
        <>
          <div className="rounded-lg overflow-hidden" style={CARD}>
            <div className="px-4 py-2.5 border-b" style={CARD_HEAD}>
              <p style={LABEL_UPPER}>Asesor</p>
              <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.text, marginTop: 2 }}>{hallazgo.asesorNombre}</p>
            </div>
            <div className="p-4">
              <p style={{ ...LABEL_UPPER, marginBottom: 6 }}>Progreso de revisión del Asesor</p>
              <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted }}>
                {Object.values(hallazgo.camposEtapa1).filter(f => f.reviewed).length} de {Object.values(hallazgo.camposEtapa1).length} campos revisados
              </p>
            </div>
          </div>

          {ETAPA1_ORDER.map(key => {
            const f = hallazgo.camposEtapa1![key];
            return (
              <div key={key} className="rounded-lg overflow-hidden" style={CARD}>
                <div className="px-4 py-2.5 border-b flex items-center justify-between gap-2" style={CARD_HEAD}>
                  <span style={LABEL_UPPER}>{ETAPA1_LABELS[key]}</span>
                  <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10, fontWeight: 600, color: f.reviewed ? C.verde1 : C.textMuted }}>
                    {f.reviewed ? "Revisado" : "Sin revisar"}
                  </span>
                </div>
                <div className="p-4">
                  <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{f.value}</p>
                </div>
              </div>
            );
          })}

          <div className="rounded-lg px-4 py-3 flex items-center justify-end gap-3" style={CARD}>
            <button onClick={volver} style={BTN_SECONDARY}>Cancelar</button>
          </div>
        </>
      )}

      {/* ═══ Etapa 3 · Analista (checklist en modo consulta) ═══════════════ */}
      {hallazgo.stage === 3 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              ["Criterios jurídicos", hallazgo.criteriosJuridicos],
              ["Criterios económicos", hallazgo.criteriosEconomicos],
            ] as [string, Criterion[]][]).map(([title, criteria]) => (
              <div key={title} className="rounded-lg overflow-hidden" style={CARD}>
                <div className="px-4 py-2.5 border-b" style={CARD_HEAD}><p style={LABEL_UPPER}>{title}</p></div>
                <div className="px-4">
                  {criteria.map(c => <ReadOnlyCriterionRow key={c.id} criterion={c} />)}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hallazgo.camposChecklist.map(f => (
              <ReadOnlyFieldCard key={f.id} field={f} criterionLabel={resolveChip(f)} />
            ))}
          </div>

          {hallazgo.dictamen && (
            <div className="rounded-lg overflow-hidden" style={CARD}>
              <div className="px-4 py-2.5 border-b" style={CARD_HEAD}><p style={LABEL_UPPER}>Dictamen del analista</p></div>
              <div className="p-4"><p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: C.text, lineHeight: 1.6 }}>{hallazgo.dictamen}</p></div>
            </div>
          )}

          <div className="rounded-lg px-4 py-3 flex items-center justify-end gap-3" style={CARD}>
            <button onClick={volver} style={BTN_SECONDARY}>Cancelar</button>
            {puedeEditarEtapa3 && (
              <button onClick={() => onNavigate("revision-analista-checklist", id)} style={BTN_PRIMARY}>
                <Pencil size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Editar
              </button>
            )}
          </div>
        </>
      )}

      {/* ═══ Etapa 4 · Decisión (en modo consulta) ═══════════════════════ */}
      {hallazgo.stage === 4 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCardRO label="Score de desempeño" value={`${SAMPLE_SCORES.desempeno}/100`} sub="Asesor + Analista" valueColor={C.steel4} />
            <MetricCardRO label="Score de calidad" value={`${SAMPLE_SCORES.calidad}/100`} sub="evidencia y fuentes citadas" valueColor={C.verde1} />
            <MetricCardRO label="Criterios evaluados" value={criteriosEvaluados} sub="jurídicos + económicos" />
          </div>

          <div className="rounded-lg p-4 flex items-center gap-8 flex-wrap" style={CARD}>
            <PersonaChipRO nombre={hallazgo.asesorNombre} rol="Asesor · Etapa 1" />
            <div style={{ width: 1, height: 32, backgroundColor: C.border }} />
            <PersonaChipRO nombre={hallazgo.analistaNombre ?? "Sin asignar"} rol="Analista · Etapa 3" />
          </div>

          <div className="rounded-lg overflow-hidden" style={CARD}>
            <div className="px-4 py-2.5 border-b" style={CARD_HEAD}><p style={LABEL_UPPER}>Cambios propuestos por el Analista</p></div>
            {diff.length === 0 ? (
              <p className="px-4 py-4" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>Sin cambios propuestos todavía.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["Campo", "Vigente", "Etapa 3 · Propuesta"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
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
                          <span style={{ display: "inline-flex", backgroundColor: C.rojoClaro, color: C.critico, borderRadius: 9999, padding: "2px 8px", fontSize: 10, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}>{d.motivo}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-lg overflow-hidden" style={CARD}>
            <div className="px-4 py-2.5 border-b" style={CARD_HEAD}><p style={LABEL_UPPER}>Dictamen del analista</p></div>
            <div className="p-4">
              <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: hallazgo.dictamen ? C.text : C.textMuted, lineHeight: 1.6, fontStyle: hallazgo.dictamen ? "normal" : "italic" }}>
                {hallazgo.dictamen || "Sin dictamen registrado para este hallazgo."}
              </p>
            </div>
          </div>

          <div className="rounded-lg px-4 py-3 flex items-center justify-end gap-3" style={CARD}>
            <button onClick={volver} style={BTN_SECONDARY}>Cancelar</button>
            {canDecide && (
              <button onClick={() => onNavigate("revision-decision-final", id)} style={{ ...BTN_PRIMARY, backgroundColor: C.verde1 }}>Decidir</button>
            )}
          </div>
        </>
      )}

      {asignarOpen && (
        <ModalAsignarAnalista
          onConfirm={(analistaId, analistaNombre, prioridad, nota) => {
            asignarAnalista(id, analistaId, analistaNombre, prioridad, nota);
            setAsignarOpen(false);
          }}
          onCancel={() => setAsignarOpen(false)}
        />
      )}
    </div>
  );
}
