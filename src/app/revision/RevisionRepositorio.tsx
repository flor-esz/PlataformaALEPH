import React, { useState } from "react";
import { Eye, Check, Users, X, Pencil, Scale } from "lucide-react";
import { C, Header } from "../App";
import { StageChip } from "./shared/StageChip";
import { IconActionButton } from "./shared/IconActionButton";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = 2 | 3 | 4;
type Assignment = "asignado" | "sin asignar" | null;

interface Hallazgo {
  id: string;
  nombre: string;
  pais: string;
  tipo: string;
  rol: string;
  hace: string;
  stage: Stage;
  stageLabel: string;
  assignment: Assignment;
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const SAMPLE: Hallazgo[] = [
  {
    id: "H-001",
    nombre: "Requisito de capital mínimo discriminatorio",
    pais: "Colombia",
    tipo: "Barrera regulatoria",
    rol: "Analista BID",
    hace: "hace 2 horas",
    stage: 2,
    stageLabel: "Triage",
    assignment: null,
  },
  {
    id: "H-002",
    nombre: "Licencia obligatoria de importación de insumos médicos",
    pais: "Perú",
    tipo: "Trámite",
    rol: "Analista BID",
    hace: "hace 5 horas",
    stage: 2,
    stageLabel: "Triage",
    assignment: null,
  },
  {
    id: "H-003",
    nombre: "Tasa arancelaria preferencial no publicada",
    pais: "México",
    tipo: "Barrera regulatoria",
    rol: "Especialista externo",
    hace: "hace 1 día",
    stage: 3,
    stageLabel: "Validación del Asesor",
    assignment: "asignado",
  },
  {
    id: "H-004",
    nombre: "Registro sanitario con plazos indefinidos",
    pais: "Argentina",
    tipo: "Trámite",
    rol: "Analista BID",
    hace: "hace 1 día",
    stage: 3,
    stageLabel: "Validación del Asesor",
    assignment: "asignado",
  },
  {
    id: "H-005",
    nombre: "Restricción de participación extranjera en telecomunicaciones",
    pais: "Brasil",
    tipo: "Barrera regulatoria",
    rol: "—",
    hace: "hace 2 días",
    stage: 3,
    stageLabel: "Validación del Asesor",
    assignment: "sin asignar",
  },
  {
    id: "H-006",
    nombre: "Cuota de contenido local sin fundamento técnico",
    pais: "Chile",
    tipo: "Regulación",
    rol: "—",
    hace: "hace 3 días",
    stage: 3,
    stageLabel: "Validación del Asesor",
    assignment: "sin asignar",
  },
  {
    id: "H-007",
    nombre: "Doble tributación sobre servicios digitales transfronterizos",
    pais: "Ecuador",
    tipo: "Barrera regulatoria",
    rol: "Especialista externo",
    hace: "hace 4 días",
    stage: 4,
    stageLabel: "Decisión Final",
    assignment: null,
  },
  {
    id: "H-008",
    nombre: "Norma técnica que impide interoperabilidad de pagos",
    pais: "Uruguay",
    tipo: "Regulación",
    rol: "Analista BID",
    hace: "hace 5 días",
    stage: 4,
    stageLabel: "Decisión Final",
    assignment: null,
  },
];

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

function RowActions({ row }: { row: Hallazgo }) {
  const log = (action: string) => console.log(action, row.id);

  if (row.stage === 2) {
    return (
      <div className="flex items-center gap-1.5">
        <IconActionButton icon={Eye}   tooltip="Ver"             variant="default" onClick={() => log("ver")} />
        <IconActionButton icon={Check} tooltip="Publicar directo" variant="green"   onClick={() => log("publicar")} />
        <IconActionButton icon={Users} tooltip="Asignar"          variant="default" onClick={() => log("asignar")} />
        <IconActionButton icon={X}     tooltip="Rechazar"         variant="red"     onClick={() => log("rechazar")} />
      </div>
    );
  }

  if (row.stage === 3 && row.assignment === "asignado") {
    return (
      <div className="flex items-center gap-1.5">
        <IconActionButton icon={Eye}    tooltip="Ver"    variant="default"  onClick={() => log("ver")} />
        <IconActionButton icon={Pencil} tooltip="Editar" variant="disabled" />
        <IconActionButton icon={Users}  tooltip="Asignar" variant="disabled" />
      </div>
    );
  }

  if (row.stage === 3 && row.assignment === "sin asignar") {
    return (
      <div className="flex items-center gap-1.5">
        <IconActionButton icon={Eye}    tooltip="Ver"    variant="default" onClick={() => log("ver")} />
        <IconActionButton icon={Pencil} tooltip="Editar" variant="default" onClick={() => log("editar")} />
        <IconActionButton icon={Users}  tooltip="Asignar" variant="default" onClick={() => log("asignar")} />
      </div>
    );
  }

  // stage 4
  return (
    <div className="flex items-center gap-1.5">
      <IconActionButton icon={Eye}    tooltip="Ver"    variant="default" onClick={() => log("ver")} />
      <IconActionButton icon={Pencil} tooltip="Editar" variant="default" onClick={() => log("editar")} />
      <IconActionButton icon={Scale}  tooltip="Decidir" variant="green"  onClick={() => log("decidir")} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RevisionRepositorio() {
  const [pais, setPais] = useState("Todos los países");
  const [tipo, setTipo] = useState("Todos los tipos");
  const [buscar, setBuscar] = useState("");

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb="ALEPH · Revisión" title="Repositorio de hallazgos" />

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <select
          value={pais}
          onChange={e => setPais(e.target.value)}
          style={fieldStyle}
        >
          {PAISES.map(p => <option key={p}>{p}</option>)}
        </select>

        <select
          value={tipo}
          onChange={e => setTipo(e.target.value)}
          style={fieldStyle}
        >
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

      {/* ── Table ──────────────────────────────────────────────────────── */}
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
            {SAMPLE.map((row, i) => (
              <tr
                key={row.id}
                style={{ borderBottom: i < SAMPLE.length - 1 ? `1px solid ${C.border}` : undefined }}
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
                    {row.pais} · {row.tipo} · {row.rol} · {row.hace}
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
                </td>

                {/* Acciones */}
                <td className="px-5 py-3">
                  <RowActions row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
