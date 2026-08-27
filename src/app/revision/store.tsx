// Estado compartido en memoria para el pipeline de Revisión (Etapas 1-4).
//
// No hay backend real todavía: este módulo simula la fuente de verdad que los
// distintos screens (Repositorio, modales de Triage, Checklist del Analista,
// Decisión Final, Candados/log_errores) leen y mutan, mientras se completa el
// handoff documentado en docs/ALEPH_prompts_pipeline_hitl.md.
//
// IMPORTANTE: este archivo NO importa nada de "../App" (ni siquiera tipos en
// runtime). Eso es deliberado: evita cualquier ciclo de imports con `C` — ver
// el comentario sobre React.lazy en App.tsx junto a los imports de revision/*.
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Stage = 1 | 2 | 3 | 4;
export type Assignment = "asignado" | "sin asignar" | null;
export type Prioridad = "Normal" | "Alta" | "Urgente";

export interface Hallazgo {
  id: string;
  nombre: string;
  pais: string;
  tipo: string;
  rol: string;
  hace: string;
  stage: Stage;
  stageLabel: string;
  assignment: Assignment;
  /** id del Asesor dueño del hallazgo original (Etapa 1). */
  asesorId: string;
  /** id del Analista asignado en Etapa 3, o null si no hay asignación. */
  analistaId: string | null;
  analistaNombre: string | null;
  prioridad: Prioridad | null;
  /** true si volvió a Etapa 3 por una devolución del Validador en Etapa 4 (Lote 5). */
  devueltoPorValidador: boolean;
}

export type LogOrigen = "Sistema" | "Asesor" | "Validador-triage" | "Analista" | "Validador-decision";

export interface LogErrorEntry {
  id: string;
  hallazgoId: string;
  hallazgoNombre: string;
  origen: LogOrigen;
  motivo: string;
  fecha: string;
}

const STAGE_LABEL: Record<Stage, string> = {
  1: "Validación del Asesor",
  2: "Triage",
  3: "Revisión del Analista",
  4: "Decisión Final",
};

// IDs de personas "demo" — ver REVISION_DEMO_USER_ID en App.tsx, que mapea cada
// UserRole de sesión a uno de estos ids para poder probar la matriz de
// visibilidad sin un sistema de usuarios real.
const SEED_HALLAZGOS: Hallazgo[] = [
  { id: "H-001", nombre: "Requisito de capital mínimo discriminatorio", pais: "Colombia", tipo: "Barrera regulatoria", rol: "Analista BID", hace: "hace 2 horas", stage: 2, stageLabel: STAGE_LABEL[2], assignment: null, asesorId: "demo-asesor", analistaId: null, analistaNombre: null, prioridad: null, devueltoPorValidador: false },
  { id: "H-002", nombre: "Licencia obligatoria de importación de insumos médicos", pais: "Perú", tipo: "Trámite", rol: "Analista BID", hace: "hace 5 horas", stage: 2, stageLabel: STAGE_LABEL[2], assignment: null, asesorId: "demo-asesor", analistaId: null, analistaNombre: null, prioridad: null, devueltoPorValidador: false },
  { id: "H-003", nombre: "Tasa arancelaria preferencial no publicada", pais: "México", tipo: "Barrera regulatoria", rol: "Especialista externo", hace: "hace 1 día", stage: 3, stageLabel: STAGE_LABEL[3], assignment: "asignado", asesorId: "demo-asesor-2", analistaId: "demo-analista", analistaNombre: "Ana Rodríguez", prioridad: "Alta", devueltoPorValidador: false },
  { id: "H-004", nombre: "Registro sanitario con plazos indefinidos", pais: "Argentina", tipo: "Trámite", rol: "Analista BID", hace: "hace 1 día", stage: 3, stageLabel: STAGE_LABEL[3], assignment: "asignado", asesorId: "demo-asesor", analistaId: "otro-analista", analistaNombre: "Carlos Mendoza", prioridad: "Normal", devueltoPorValidador: false },
  { id: "H-005", nombre: "Restricción de participación extranjera en telecomunicaciones", pais: "Brasil", tipo: "Barrera regulatoria", rol: "—", hace: "hace 2 días", stage: 3, stageLabel: STAGE_LABEL[3], assignment: "sin asignar", asesorId: "demo-asesor", analistaId: null, analistaNombre: null, prioridad: null, devueltoPorValidador: false },
  { id: "H-006", nombre: "Cuota de contenido local sin fundamento técnico", pais: "Chile", tipo: "Regulación", rol: "—", hace: "hace 3 días", stage: 3, stageLabel: STAGE_LABEL[3], assignment: "sin asignar", asesorId: "demo-asesor-2", analistaId: null, analistaNombre: null, prioridad: null, devueltoPorValidador: false },
  { id: "H-007", nombre: "Doble tributación sobre servicios digitales transfronterizos", pais: "Ecuador", tipo: "Barrera regulatoria", rol: "Especialista externo", hace: "hace 4 días", stage: 4, stageLabel: STAGE_LABEL[4], assignment: null, asesorId: "demo-asesor", analistaId: "demo-analista", analistaNombre: "Ana Rodríguez", prioridad: null, devueltoPorValidador: false },
  { id: "H-008", nombre: "Norma técnica que impide interoperabilidad de pagos", pais: "Uruguay", tipo: "Regulación", rol: "Analista BID", hace: "hace 5 días", stage: 4, stageLabel: STAGE_LABEL[4], assignment: null, asesorId: "demo-asesor-2", analistaId: "otro-analista", analistaNombre: "Carlos Mendoza", prioridad: null, devueltoPorValidador: false },
];

interface RevisionContextValue {
  hallazgos: Hallazgo[];
  logErrores: LogErrorEntry[];
  /** Etapa 2 -> publicado directo (se retira del repositorio). */
  publicarDirecto: (id: string, nota: string) => void;
  /** Etapa 2 -> log_errores "Descartado en triage" (se retira del repositorio, terminal). */
  rechazarTriage: (id: string, motivo: string) => void;
  /** Etapa 2 -> Etapa 3, asignado a un Analista. */
  asignarAnalista: (id: string, analistaId: string, analistaNombre: string, prioridad: Prioridad, nota: string) => void;
}

const RevisionContext = createContext<RevisionContextValue | null>(null);

// Placeholder de fecha relativa hasta que haya un reloj/backend real.
function nowLabel(): string {
  return "justo ahora";
}

export function RevisionProvider({ children }: { children: React.ReactNode }) {
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>(SEED_HALLAZGOS);
  const [logErrores, setLogErrores] = useState<LogErrorEntry[]>([]);

  const publicarDirecto = useCallback((id: string, _nota: string) => {
    setHallazgos(prev => prev.filter(h => h.id !== id));
  }, []);

  const rechazarTriage = useCallback((id: string, motivo: string) => {
    setHallazgos(prev => {
      const found = prev.find(h => h.id === id);
      if (found) {
        const entry: LogErrorEntry = {
          id: `LOG-${prev.length}-${id}`,
          hallazgoId: id,
          hallazgoNombre: found.nombre,
          origen: "Validador-triage",
          motivo,
          fecha: nowLabel(),
        };
        setLogErrores(logs => [entry, ...logs]);
      }
      return prev.filter(h => h.id !== id);
    });
  }, []);

  const asignarAnalista = useCallback((id: string, analistaId: string, analistaNombre: string, prioridad: Prioridad, _nota: string) => {
    setHallazgos(prev => prev.map(h => (
      h.id === id
        ? { ...h, stage: 3 as Stage, stageLabel: STAGE_LABEL[3], assignment: "asignado" as Assignment, analistaId, analistaNombre, prioridad }
        : h
    )));
  }, []);

  const value = useMemo<RevisionContextValue>(() => ({
    hallazgos,
    logErrores,
    publicarDirecto,
    rechazarTriage,
    asignarAnalista,
  }), [hallazgos, logErrores, publicarDirecto, rechazarTriage, asignarAnalista]);

  return <RevisionContext.Provider value={value}>{children}</RevisionContext.Provider>;
}

export function useRevision(): RevisionContextValue {
  const ctx = useContext(RevisionContext);
  if (!ctx) throw new Error("useRevision() debe usarse dentro de <RevisionProvider>.");
  return ctx;
}
