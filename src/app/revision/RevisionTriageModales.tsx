import React, { useState } from "react";
import { Check, FilterX, Users } from "lucide-react";
import { C } from "../App";

// ─── Shared primitives ────────────────────────────────────────────────────────

const OVERLAY: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 16px",
  backgroundColor: "rgba(20,22,26,0.5)",
};

const PANEL: React.CSSProperties = {
  backgroundColor: C.card,
  borderRadius: 12,
  padding: "28px 32px",
  width: "100%",
  maxWidth: 448,
  boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  maxHeight: "90vh",
  overflowY: "auto",
};

const LABEL: React.CSSProperties = {
  display: "block",
  fontFamily: "Space Grotesk, sans-serif",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: C.textMuted,
  marginBottom: 6,
};

const TEXTAREA: React.CSSProperties = {
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
  minHeight: 80,
  boxSizing: "border-box",
};

const BTN_BASE: React.CSSProperties = {
  flex: 1,
  padding: "10px 0",
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "Space Grotesk, sans-serif",
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
};

function ModalIconBadge({
  icon: Icon,
  bg,
  color,
}: {
  icon: React.ElementType;
  bg: string;
  color: string;
}) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        flexShrink: 0,
      }}
    >
      <Icon size={20} color={color} strokeWidth={2} />
    </div>
  );
}

function ModalTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: 18,
        fontWeight: 600,
        color: C.text,
        marginBottom: 8,
      }}
    >
      {children}
    </h3>
  );
}

function ModalBody({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: 13,
        color: C.textMuted,
        lineHeight: 1.6,
        marginBottom: 20,
      }}
    >
      {children}
    </p>
  );
}

// ─── 1. ModalPublicarDirecto ──────────────────────────────────────────────────

export interface ModalPublicarDirectoProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ModalPublicarDirecto({ onConfirm, onCancel }: ModalPublicarDirectoProps) {
  const [nota, setNota] = useState("");

  return (
    <div style={OVERLAY} onClick={onCancel}>
      <div style={PANEL} onClick={e => e.stopPropagation()}>
        <ModalIconBadge icon={Check} bg={C.verde2} color={C.verde1} />
        <ModalTitle>Publicar directo — es barrera</ModalTitle>
        <ModalBody>
          Este hallazgo se publicará directamente en el repositorio público omitiendo
          la etapa de validación del Analista. Úsalo solo cuando la evidencia sea
          suficiente y el caso sea inequívoco.
        </ModalBody>

        <div style={{ marginBottom: 20 }}>
          <label style={LABEL}>Nota de triage (opcional)</label>
          <textarea
            style={TEXTAREA}
            placeholder="Añade contexto sobre la decisión de publicar directamente…"
            value={nota}
            onChange={e => setNota(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{ ...BTN_BASE, backgroundColor: C.verde1, color: "#ffffff" }}
            onClick={onConfirm}
          >
            Confirmar publicación
          </button>
          <button
            style={{ ...BTN_BASE, backgroundColor: C.border, color: C.textMuted }}
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 2. ModalRechazarTriage ───────────────────────────────────────────────────

export interface ModalRechazarTriageProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ModalRechazarTriage({ onConfirm, onCancel }: ModalRechazarTriageProps) {
  const [motivo, setMotivo] = useState("");
  const canConfirm = motivo.trim().length > 0;

  return (
    <div style={OVERLAY} onClick={onCancel}>
      <div style={PANEL} onClick={e => e.stopPropagation()}>
        <ModalIconBadge icon={FilterX} bg={C.rojoClaro} color={C.critico} />
        <ModalTitle>Marcar como "no es barrera"</ModalTitle>
        <ModalBody>
          El hallazgo se moverá a <strong style={{ color: C.text }}>log_errores</strong> con
          el estado "Descartado en triage". Esta acción{" "}
          <strong style={{ color: C.critico }}>no es reversible</strong>: el hallazgo
          quedará excluido de todos los flujos de revisión.
        </ModalBody>

        <div style={{ marginBottom: 20 }}>
          <label style={LABEL}>
            Motivo{" "}
            <span style={{ color: C.critico, fontWeight: 700 }}>*</span>
          </label>
          <textarea
            style={{
              ...TEXTAREA,
              borderColor: !canConfirm && motivo.length === 0 ? C.border : canConfirm ? C.border : C.critico,
            }}
            placeholder="Describe por qué este hallazgo no constituye una barrera regulatoria…"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{
              ...BTN_BASE,
              backgroundColor: canConfirm ? C.critico : `${C.critico}55`,
              color: "#ffffff",
              cursor: canConfirm ? "pointer" : "not-allowed",
            }}
            onClick={canConfirm ? onConfirm : undefined}
          >
            Confirmar descarte
          </button>
          <button
            style={{ ...BTN_BASE, backgroundColor: C.border, color: C.textMuted }}
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 3. ModalAsignarAnalista ──────────────────────────────────────────────────

type Prioridad = "Normal" | "Alta" | "Urgente";

const ANALISTAS = [
  { id: "A1", nombre: "Carlos Mendoza", iniciales: "CM", carga: 4, max: 8, color: C.steel3 },
  { id: "A2", nombre: "Lucía Ferreira",  iniciales: "LF", carga: 7, max: 8, color: C.ambar1 },
  { id: "A3", nombre: "Tomás Quiroga", iniciales: "TQ", carga: 2, max: 8, color: C.verde1 },
] as const;

function WorkloadBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div
      style={{
        height: 4,
        borderRadius: 2,
        backgroundColor: C.border,
        overflow: "hidden",
        flex: 1,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: 2,
          transition: "width 0.3s",
        }}
      />
    </div>
  );
}

const PRIORIDADES: Prioridad[] = ["Normal", "Alta", "Urgente"];

const PRIORIDAD_STYLE: Record<Prioridad, { active: React.CSSProperties; idle: React.CSSProperties }> = {
  Normal: {
    active: { backgroundColor: `${C.steel3}22`, color: C.steel3, borderColor: C.steel3 },
    idle:   { backgroundColor: "transparent",     color: C.textMuted, borderColor: C.border },
  },
  Alta: {
    active: { backgroundColor: `${C.ambar1}22`, color: C.ambarTexto, borderColor: C.ambar1 },
    idle:   { backgroundColor: "transparent",  color: C.textMuted, borderColor: C.border },
  },
  Urgente: {
    active: { backgroundColor: `${C.critico}18`, color: C.critico, borderColor: C.critico },
    idle:   { backgroundColor: "transparent",     color: C.textMuted, borderColor: C.border },
  },
};

export interface ModalAsignarAnalistaProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ModalAsignarAnalista({ onConfirm, onCancel }: ModalAsignarAnalistaProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [prioridad, setPrioridad] = useState<Prioridad>("Normal");
  const [nota, setNota] = useState("");
  const canConfirm = selected !== null;

  return (
    <div style={OVERLAY} onClick={onCancel}>
      <div style={PANEL} onClick={e => e.stopPropagation()}>
        <ModalIconBadge icon={Users} bg={`${C.steel3}18`} color={C.steel4} />
        <ModalTitle>Asignar a Analista</ModalTitle>

        {/* Analyst list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {ANALISTAS.map(a => {
            const isSelected = selected === a.id;
            return (
              <label
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1px solid ${isSelected ? C.steel3 : C.border}`,
                  backgroundColor: isSelected ? `${C.steel3}0d` : C.canvas,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {/* Radio */}
                <input
                  type="radio"
                  name="analista"
                  value={a.id}
                  checked={isSelected}
                  onChange={() => setSelected(a.id)}
                  style={{ accentColor: C.steel3, flexShrink: 0 }}
                />

                {/* Avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: C.steel4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "#ffffff",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {a.iniciales}
                </div>

                {/* Name + workload */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: C.text,
                      marginBottom: 4,
                    }}
                  >
                    {a.nombre}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <WorkloadBar value={a.carga} max={a.max} color={a.color} />
                    <span
                      style={{
                        fontFamily: "IBM Plex Sans, sans-serif",
                        fontSize: 11,
                        color: C.textMuted,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {a.carga}/{a.max} casos
                    </span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Priority chips */}
        <div style={{ marginBottom: 20 }}>
          <label style={LABEL}>Prioridad</label>
          <div style={{ display: "flex", gap: 8 }}>
            {PRIORIDADES.map(p => {
              const s = PRIORIDAD_STYLE[p];
              const active = prioridad === p;
              return (
                <button
                  key={p}
                  onClick={() => setPrioridad(p)}
                  style={{
                    ...(active ? s.active : s.idle),
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    border: `1px solid`,
                    borderRadius: 9999,
                    padding: "4px 12px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nota */}
        <div style={{ marginBottom: 24 }}>
          <label style={LABEL}>Nota (opcional)</label>
          <textarea
            style={TEXTAREA}
            placeholder="Contexto adicional para el analista…"
            value={nota}
            onChange={e => setNota(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{
              ...BTN_BASE,
              backgroundColor: canConfirm ? C.steel4 : `${C.steel4}55`,
              color: "#ffffff",
              cursor: canConfirm ? "pointer" : "not-allowed",
            }}
            onClick={canConfirm ? onConfirm : undefined}
          >
            Asignar
          </button>
          <button
            style={{ ...BTN_BASE, backgroundColor: C.border, color: C.textMuted }}
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Demo harness (for isolated testing in App.tsx) ───────────────────────────

export default function RevisionTriageModalesDemo() {
  const [open, setOpen] = useState<"publicar" | "rechazar" | "asignar" | null>(null);

  const btnStyle: React.CSSProperties = {
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: 13,
    fontWeight: 500,
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        padding: 32,
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      <button
        style={{ ...btnStyle, backgroundColor: C.verde1, color: "#fff" }}
        onClick={() => setOpen("publicar")}
      >
        Publicar directo
      </button>
      <button
        style={{ ...btnStyle, backgroundColor: C.critico, color: "#fff" }}
        onClick={() => setOpen("rechazar")}
      >
        Rechazar triage
      </button>
      <button
        style={{ ...btnStyle, backgroundColor: C.steel4, color: "#fff" }}
        onClick={() => setOpen("asignar")}
      >
        Asignar analista
      </button>

      {open === "publicar" && (
        <ModalPublicarDirecto
          onConfirm={() => { console.log("confirm publicar"); setOpen(null); }}
          onCancel={() => setOpen(null)}
        />
      )}
      {open === "rechazar" && (
        <ModalRechazarTriage
          onConfirm={() => { console.log("confirm rechazar"); setOpen(null); }}
          onCancel={() => setOpen(null)}
        />
      )}
      {open === "asignar" && (
        <ModalAsignarAnalista
          onConfirm={() => { console.log("confirm asignar"); setOpen(null); }}
          onCancel={() => setOpen(null)}
        />
      )}
    </div>
  );
}
