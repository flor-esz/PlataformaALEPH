import React, { useState } from "react";
import { Eye, Check, Users, X, Pencil, Scale, Inbox } from "lucide-react";
import { C, Header } from "../App";
import type { UserRole } from "../App";
import { StageChip } from "./shared/StageChip";
import { IconActionButton } from "./shared/IconActionButton";
import { useRevision, type Hallazgo } from "./store";
import { ModalPublicarDirecto, ModalRechazarTriage, ModalAsignarAnalista } from "./RevisionTriageModales";

// ─── Visibilidad por rol (ver "Matriz de visibilidad" en
// docs/ALEPH_prompts_pipeline_hitl.md) ──────────────────────────────────────────
function isVisibleForRole(h: Hallazgo, userRole: UserRole, userId: string): boolean {
  if (userRole === "administrador" || userRole === "validador") return true;
  if (userRole === "asesor") return h.stage === 1 && h.asesorId === userId;
  if (userRole === "analista") return (h.stage === 3 || h.stage === 4) && h.analistaId === userId;
  return false; // usuario-bid: la sección Revisión ni siquiera aparece en el sidebar para este rol.
}

const PAISES = ["Todos los países", "Argentina", "Brasil", "Chile", "Colombia", "Ecuador", "México", "Perú", "Uruguay"];
const TIPOS = ["Todos los tipos", "Barrera regulatoria", "Trámite", "Regulación"];

// ─── Input / Select style (matches Administración modal) ──────────────────────

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

// ─── Action matrix per row ────────────────────────────────────────────────────

function RowActions({
  row,
  canDecide,
  onVer,
  onEditar,
  onDecidir,
  onPublicarDirecto,
  onAsignar,
  onRechazar,
}: {
  row: Hallazgo;
  /** Etapa 4 es del Validador ("Decidir"/"Ajustar"); otros roles con acceso de lectura solo ven "Ver". */
  canDecide: boolean;
  onVer: (row: Hallazgo) => void;
  onEditar: (row: Hallazgo) => void;
  onDecidir: (row: Hallazgo) => void;
  onPublicarDirecto: (row: Hallazgo) => void;
  onAsignar: (row: Hallazgo) => void;
  onRechazar: (row: Hallazgo) => void;
}) {
  if (row.stage === 2) {
    return (
      <div className="flex items-center gap-1.5">
        <IconActionButton icon={Eye}   tooltip="Ver"             variant="default" onClick={() => onVer(row)} />
        <IconActionButton icon={Check} tooltip="Publicar directo" variant="green"   onClick={() => onPublicarDirecto(row)} />
        <IconActionButton icon={Users} tooltip="Asignar"          variant="default" onClick={() => onAsignar(row)} />
        <IconActionButton icon={X}     tooltip="Rechazar"         variant="red"     onClick={() => onRechazar(row)} />
      </div>
    );
  }

  if (row.stage === 3 && row.assignment === "asignado") {
    return (
      <div className="flex items-center gap-1.5">
        <IconActionButton icon={Eye}    tooltip="Ver"    variant="default"  onClick={() => onVer(row)} />
        <IconActionButton icon={Pencil} tooltip="Editar" variant="disabled" />
        <IconActionButton icon={Users}  tooltip="Asignar" variant="disabled" />
      </div>
    );
  }

  if (row.stage === 3 && row.assignment === "sin asignar") {
    return (
      <div className="flex items-center gap-1.5">
        <IconActionButton icon={Eye}    tooltip="Ver"    variant="default" onClick={() => onVer(row)} />
        <IconActionButton icon={Pencil} tooltip="Editar" variant="default" onClick={() => onEditar(row)} />
        <IconActionButton icon={Users}  tooltip="Asignar" variant="default" onClick={() => onAsignar(row)} />
      </div>
    );
  }

  // stage 4 -- lectura para roles sin visibilidad completa (ej. Analista: "lectura de lo suyo")
  if (!canDecide) {
    return (
      <div className="flex items-center gap-1.5">
        <IconActionButton icon={Eye}    tooltip="Ver"    variant="default" onClick={() => onVer(row)} />
        <IconActionButton icon={Pencil} tooltip="Editar" variant="disabled" />
        <IconActionButton icon={Scale}  tooltip="Decidir" variant="disabled" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <IconActionButton icon={Eye}    tooltip="Ver"    variant="default" onClick={() => onVer(row)} />
      <IconActionButton icon={Pencil} tooltip="Editar" variant="default" onClick={() => onEditar(row)} />
      <IconActionButton icon={Scale}  tooltip="Decidir" variant="green"  onClick={() => onDecidir(row)} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface RevisionRepositorioProps {
  userRole: UserRole;
  userId: string;
  /** Puente hacia App.tsx#revisionNavigate; screens aún no construidos solo hacen console.log ahí. */
  onNavigate: (screen: string, id?: string) => void;
}

type ModalState =
  | { kind: "publicar"; row: Hallazgo }
  | { kind: "rechazar"; row: Hallazgo }
  | { kind: "asignar"; row: Hallazgo }
  | null;

export default function RevisionRepositorio({ userRole, userId, onNavigate }: RevisionRepositorioProps) {
  const { hallazgos, publicarDirecto, rechazarTriage, asignarAnalista } = useRevision();
  const [pais, setPais] = useState("Todos los países");
  const [tipo, setTipo] = useState("Todos los tipos");
  const [buscar, setBuscar] = useState("");
  const [modal, setModal] = useState<ModalState>(null);

  // Asesor y Analista solo ven "lo suyo" -> filtrar por país no tiene sentido para ellos.
  const showPaisFilter = userRole === "administrador" || userRole === "validador";

  const visibles = hallazgos.filter(h => isVisibleForRole(h, userRole, userId));
  const filtradas = visibles.filter(h =>
    (!showPaisFilter || pais === "Todos los países" || h.pais === pais) &&
    (tipo === "Todos los tipos" || h.tipo === tipo) &&
    (buscar.trim() === "" || h.nombre.toLowerCase().includes(buscar.trim().toLowerCase()))
  );

  // "Ver"/"Editar" navegan a una pantalla real solo donde ya existe una construida.
  // Etapa 2 no tiene pantalla de detalle propia en el pipeline documentado (sus
  // acciones SON los 3 modales de Triage). Etapa 4 navegará a RevisionDecisionFinal
  // cuando se construya en el Lote 5 -- hasta entonces queda en console.log a
  // propósito, para no enlazar a un case que todavía no existe en el switch de
  // renderView() (eso fue exactamente el bug de pantalla en blanco ya arreglado).
  const handleVer = (row: Hallazgo) => {
    if (row.stage === 3) { onNavigate("revision-analista-checklist", row.id); return; }
    console.log("ver (sin pantalla de detalle todavía)", row.id, row.stage);
  };
  const handleEditar = (row: Hallazgo) => {
    if (row.stage === 3) { onNavigate("revision-analista-checklist", row.id); return; }
    console.log("editar (Lote 5: RevisionDecisionFinal)", row.id);
  };
  const handleDecidir = (row: Hallazgo) => {
    console.log("decidir (Lote 5: RevisionDecisionFinal)", row.id);
  };

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb="ALEPH · Revisión" title="Repositorio de hallazgos" />

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {showPaisFilter && (
          <select value={pais} onChange={e => setPais(e.target.value)} style={fieldStyle}>
            {PAISES.map(p => <option key={p}>{p}</option>)}
          </select>
        )}

        <select value={tipo} onChange={e => setTipo(e.target.value)} style={fieldStyle}>
          {TIPOS.map(t => <option key={t}>{t}</option>)}
        </select>

        <input
          type="text"
          placeholder="Buscar hallazgo..."
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          style={{ ...fieldStyle, minWidth: 220 }}
        />
      </div>

      {/* ── Table / empty state ───────────────────────────────────────── */}
      {filtradas.length === 0 ? (
        <div
          className="rounded-lg flex flex-col items-center justify-center gap-2 py-16"
          style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
        >
          <Inbox size={28} color={C.textMuted} strokeWidth={1.5} />
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 14, fontWeight: 600, color: C.text }}>
            No hay hallazgos para mostrar
          </p>
          <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted, maxWidth: 360, textAlign: "center" }}>
            {visibles.length === 0
              ? "No tienes hallazgos asignados en este momento."
              : "Ningún hallazgo coincide con los filtros actuales."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <table className="w-full min-w-[720px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Nombre", "Estado", "Acciones"].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] uppercase tracking-widest"
                    style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((row, i) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: i < filtradas.length - 1 ? `1px solid ${C.border}` : undefined }}
                  className="hover:bg-[#F4F7FB] transition-colors"
                >
                  {/* Nombre + meta */}
                  <td className="px-5 py-3" style={{ maxWidth: 420 }}>
                    <p
                      className="text-[13px] font-medium leading-snug mb-0.5"
                      style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}
                    >
                      {row.nombre}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}
                    >
                      {row.pais} · {row.tipo} · {row.analistaId === userId ? "Tú" : (row.analistaNombre ?? row.rol)} · {row.hace}
                    </p>
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    <StageChip
                      stage={row.stage}
                      label={row.stageLabel}
                      state={row.stage === 4 ? "active" : row.stage === 3 ? "active" : "pending"}
                    />
                    {row.assignment && (
                      <p
                        className="text-[11px] mt-1"
                        style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}
                      >
                        {row.assignment === "asignado" ? "Asignado" : "Sin asignar"}
                      </p>
                    )}
                    {row.devueltoPorValidador && (
                      <span
                        className="inline-block mt-1"
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontSize: 10,
                          fontWeight: 600,
                          backgroundColor: C.ambar2,
                          color: C.ambarTexto,
                          borderRadius: 9999,
                          padding: "2px 8px",
                        }}
                      >
                        Devuelto por Validador
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-3">
                    <RowActions
                      row={row}
                      canDecide={userRole === "validador" || userRole === "administrador"}
                      onVer={handleVer}
                      onEditar={handleEditar}
                      onDecidir={handleDecidir}
                      onPublicarDirecto={r => setModal({ kind: "publicar", row: r })}
                      onAsignar={r => setModal({ kind: "asignar", row: r })}
                      onRechazar={r => setModal({ kind: "rechazar", row: r })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modales de Triage (Lote 2) ────────────────────────────────── */}
      {modal?.kind === "publicar" && (
        <ModalPublicarDirecto
          onConfirm={(nota) => { publicarDirecto(modal.row.id, nota); setModal(null); }}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.kind === "rechazar" && (
        <ModalRechazarTriage
          onConfirm={(motivo) => { rechazarTriage(modal.row.id, motivo); setModal(null); }}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.kind === "asignar" && (
        <ModalAsignarAnalista
          onConfirm={(analistaId, analistaNombre, prioridad, nota) => {
            asignarAnalista(modal.row.id, analistaId, analistaNombre, prioridad, nota);
            setModal(null);
          }}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
