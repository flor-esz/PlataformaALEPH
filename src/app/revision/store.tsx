// Estado compartido en memoria para el pipeline de Revisión (Etapas 1-4).
//
// No hay backend real todavía: este módulo simula la fuente de verdad que los
// distintos screens (Repositorio, modales de Triage, Checklist del Analista,
// Decisión Final, log_errores) leen y mutan, mientras se completa el handoff
// documentado en docs/ALEPH_prompts_pipeline_hitl.md. Los "candados" de
// calidad de datos no tienen pantalla propia -- corren automáticos dentro de
// enviarAEtapa2 (ver evaluarCandadosAutomaticos más abajo).
//
// IMPORTANTE: este archivo NO importa nada de "../App" (ni siquiera tipos en
// runtime). Eso es deliberado: evita cualquier ciclo de imports con `C` — ver
// el comentario sobre React.lazy en App.tsx junto a los imports de revision/*.
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Stage = 1 | 2 | 3 | 4;
export type Assignment = "asignado" | "sin asignar" | null;
export type Prioridad = "Normal" | "Alta" | "Urgente";
/** "publicado" es terminal: publicarDirecto/aceptarYPublicar lo setean y el hallazgo
 *  deja de aparecer en el Repositorio activo, pero se conserva en el store (antes se
 *  descartaba del array por completo -- cerrado en el Lote 6). */
export type EstadoHallazgo = "en_proceso" | "publicado";

// ─── Checklist de Etapa 3 (Lote 4/5) ───────────────────────────────────────
// Antes vivían como estado local de muestra en RevisionAnalistaChecklist y
// como arrays fijos separados en RevisionDecisionFinal/RevisionAjuste -- tres
// copias de la misma información, ninguna real. Ahora es parte del Hallazgo:
// lo que edita el Analista en su checklist es lo mismo que ve el Validador en
// la tabla de diff de Decisión Final y lo que corrige en Ajustar.
export type CriterionResult = "cumple" | "no-cumple" | null;

export interface Criterion {
  id: string;
  label: string;
  result: CriterionResult;
}

export interface ChecklistField {
  id: string;
  label: string;
  /** Valor normativo vigente, antes de cualquier corrección de Etapa 3. Inmutable una vez seteado. */
  vigente: string;
  /** Valor actual (editable) -- igual a `vigente` si nadie lo ha corregido todavía. */
  actual: string;
  fuente: string;
}

// Qué campo del checklist "resuelve" qué criterio: relación fija del esquema
// (no varía por hallazgo), separada de los datos de cada campo -- ver Lote 4.
export const FIELD_RESUELVE_CRITERIO: Record<string, string | null> = {
  plazo: "proporcionalidad",
  costo: "causalidad",
  severidad_field: null,
  entidad: "cita",
};

const DEFAULT_CRITERIOS_JURIDICOS: Criterion[] = [
  { id: "existencia", label: "Existencia", result: "cumple" },
  { id: "vigencia", label: "Vigencia", result: "cumple" },
  { id: "cita", label: "Cita normativa", result: "no-cumple" },
  { id: "interpretacion", label: "Interpretación", result: null },
  { id: "aplicabilidad", label: "Aplicabilidad", result: "cumple" },
];

const DEFAULT_CRITERIOS_ECONOMICOS: Criterion[] = [
  { id: "friccion", label: "Tipo de fricción", result: "cumple" },
  { id: "causalidad", label: "Causalidad", result: "no-cumple" },
  { id: "legitimidad", label: "Legitimidad", result: "cumple" },
  { id: "proporcionalidad", label: "Proporcionalidad", result: "no-cumple" },
  { id: "severidad_crit", label: "Severidad", result: null },
];

const DEFAULT_CAMPOS_CHECKLIST: ChecklistField[] = [
  { id: "plazo", label: "Plazo legal", vigente: "Indefinido (sin plazo establecido)", actual: "180 días desde la solicitud", fuente: "Ley de Regulación de Exportaciones PCM-2019, Art. 12" },
  { id: "costo", label: "Costo estimado", vigente: "USD 4.1 M / año", actual: "USD 4.1 M / año", fuente: "Modelo SCM — Informe BID-LAB 2025, §3.2" },
  { id: "severidad_field", label: "Severidad", vigente: "Crítico", actual: "Crítico", fuente: "Matriz ALEPH v2 — criterio automático por costo > USD 1M" },
  { id: "entidad", label: "Entidad emisora", vigente: "Ministerio de Desarrollo Productivo y Economía Plural", actual: "Ministerio de Comercio Exterior", fuente: "Res. Min. Comercio 2022-14, Art. 3" },
];

/** Checklist "rico" de muestra -- usado por los hallazgos semilla que ya llegaron a Etapa 3/4,
 *  y como fallback cuando una pantalla recibe un id que no existe en el store (ej. accesos
 *  directos de demo) para no dejar esos formularios vacíos. También trae `estado: "en_proceso"`
 *  -- toda ruta de creación de un Hallazgo pasa por aquí o por blankChecklist(), así que es el
 *  lugar más chico para asegurar que ese campo nunca falte. */
export function richChecklist() {
  return {
    criteriosJuridicos: DEFAULT_CRITERIOS_JURIDICOS.map(c => ({ ...c })),
    criteriosEconomicos: DEFAULT_CRITERIOS_ECONOMICOS.map(c => ({ ...c })),
    camposChecklist: DEFAULT_CAMPOS_CHECKLIST.map(f => ({ ...f })),
    estado: "en_proceso" as EstadoHallazgo,
  };
}

/** Checklist en blanco -- usado por hallazgos recién creados (Etapa 1 -> Etapa 2), que todavía no pasaron por un Analista. */
function blankChecklist() {
  return {
    criteriosJuridicos: DEFAULT_CRITERIOS_JURIDICOS.map(c => ({ ...c, result: null as CriterionResult })),
    criteriosEconomicos: DEFAULT_CRITERIOS_ECONOMICOS.map(c => ({ ...c, result: null as CriterionResult })),
    camposChecklist: DEFAULT_CAMPOS_CHECKLIST.map(f => ({ ...f, actual: f.vigente })),
    estado: "en_proceso" as EstadoHallazgo,
  };
}

// ─── Checklist de Etapa 1 (Asesor) ─────────────────────────────────────────
// Movido acá desde RevisionAsesorDetalle por el mismo motivo que el checklist
// de Etapa 3: antes era un único `INITIAL_FIELDS` local que se mostraba igual
// sin importar qué hallazgo se abriera -- ahora cada hallazgo de Etapa 1 tiene
// el suyo propio, con su propio contador "N de M campos revisados".
export type FieldOrigin = "ia" | "asesor";

export interface FieldState {
  value: string;
  origin: FieldOrigin;
  reviewed: boolean;
}

export type Etapa1FieldKey =
  | "titulo"
  | "textoNormativo"
  | "pasaje"
  | "diagnostico"
  | "severidad"
  | "clasificacion"
  | "instrumento";

export type Etapa1Campos = Record<Etapa1FieldKey, FieldState>;

function campo(value: string, origin: FieldOrigin, reviewed: boolean): FieldState {
  return { value, origin, reviewed };
}

/** Contenido de muestra original (café tostado, Bolivia) -- usado para H-101 y
 *  como fallback si una pantalla recibe un id de Etapa 1 que no existe en el store. */
export function defaultCamposEtapa1(): Etapa1Campos {
  return {
    titulo: campo("Restricción a Operadores Sin Planta Propia", "ia", false),
    textoNormativo: campo(
      `Artículo 12. — Requisitos para inscripción como exportador de café tostado.\n\nPara obtener la inscripción en el Registro de Exportadores de Café Tostado, el solicitante deberá acreditar la propiedad o arrendamiento a largo plazo (mínimo 5 años) de las instalaciones de tostado, incluyendo equipos industriales propios. No se admitirá la inscripción de personas naturales o jurídicas que operen mediante convenios de capacidad compartida, maquila o arrendamiento de capacidad instalada de terceros.\n\nEsta disposición busca garantizar la trazabilidad y calidad del café de exportación, vinculando la responsabilidad del exportador a instalaciones físicas verificables.`,
      "ia", false,
    ),
    pasaje: campo("No se admitirá la inscripción de personas naturales o jurídicas que operen mediante convenios de capacidad compartida, maquila o arrendamiento de capacidad instalada de terceros.", "ia", false),
    diagnostico: campo("El marco normativo desconoce los modelos de negocio modernos de tostadores que operan por maquila en plantas de terceros certificadas. Esta restricción impide el acceso al mercado internacional de exportadores artesanales y medianos que no pueden costear instalaciones propias, con un impacto estimado de USD 2.4 M en exportaciones no realizadas por ciclo.", "ia", false),
    severidad: campo("Crítico", "asesor", true),
    clasificacion: campo("Entrada", "ia", false),
    instrumento: campo("Ley de Regulación de Exportaciones de Café PCM-2019", "asesor", true),
  };
}

function camposEtapa1Tramite(): Etapa1Campos {
  return {
    titulo: campo("Exigencia de traducción jurada para certificados sanitarios de exportación", "ia", false),
    textoNormativo: campo(
      `Resolución SENASA N.° 045-2022, Art. 8. — Requisitos documentarios para la exportación de productos agroalimentarios.\n\nTodo certificado sanitario emitido en idioma distinto al español deberá presentarse acompañado de su traducción jurada, realizada por traductor público matriculado, aun cuando el país de destino acepte el documento en su idioma original. La traducción deberá adjuntarse en todos los casos, sin excepción, previo al despacho aduanero.\n\nEsta disposición busca uniformizar los expedientes de exportación ante la autoridad sanitaria nacional.`,
      "ia", false,
    ),
    pasaje: campo("La traducción deberá adjuntarse en todos los casos, sin excepción, previo al despacho aduanero.", "ia", false),
    diagnostico: campo("El requisito se aplica incluso cuando el país de destino acepta el certificado en su idioma original, generando un costo y demora evitables (traductor jurado + trámite notarial) para exportadores medianos y pequeños. Se estima un sobrecosto de USD 850 por embarque y 4-6 días hábiles adicionales.", "ia", false),
    severidad: campo("Alto", "ia", false),
    clasificacion: campo("Salida", "ia", false),
    instrumento: campo("Resolución SENASA N.° 045-2022", "ia", false),
  };
}

function camposEtapa1Barrera(): Etapa1Campos {
  return {
    titulo: campo("Cuota mínima de insumos nacionales para certificación de origen", "ia", false),
    textoNormativo: campo(
      `Decreto Supremo N.° 118, Art. 5. — Certificación de origen para régimen de exportación preferencial.\n\nPara acceder al certificado de origen que habilita el régimen arancelario preferencial, el fabricante deberá acreditar que no menos del 60% del valor de los insumos utilizados en el proceso productivo corresponde a proveedores nacionales inscritos en el Registro Único de Proveedores Locales.\n\nQuedan excluidos de este beneficio los fabricantes que no puedan acreditar dicho porcentaje, independientemente del origen preferencial del producto final bajo los acuerdos comerciales vigentes.`,
      "ia", false,
    ),
    pasaje: campo("Quedan excluidos de este beneficio los fabricantes que no puedan acreditar dicho porcentaje, independientemente del origen preferencial del producto final bajo los acuerdos comerciales vigentes.", "ia", false),
    diagnostico: campo("El umbral de 60% de contenido local no tiene relación con las reglas de origen ya establecidas en los acuerdos comerciales vigentes, y excluye del beneficio arancelario a fabricantes regionales integrados que dependen de insumos de otros países del bloque. Afecta principalmente a manufactureras medianas sin cadena de proveedores 100% doméstica.", "ia", false),
    severidad: campo("Crítico", "ia", false),
    clasificacion: campo("Operación", "ia", false),
    instrumento: campo("Decreto Supremo N.° 118", "ia", false),
  };
}

export interface Hallazgo {
  id: string;
  nombre: string;
  pais: string;
  tipo: string;
  /** Entrada | Operación | Salida -- eje de clasificación de comercio, distinto de `tipo`. */
  clasificacion: string;
  /** Sector económico. */
  sector: string;
  rol: string;
  hace: string;
  stage: Stage;
  stageLabel: string;
  assignment: Assignment;
  /** id del Asesor dueño del hallazgo original (Etapa 1). */
  asesorId: string;
  asesorNombre: string;
  /** id del Analista asignado en Etapa 3, o null si no hay asignación. */
  analistaId: string | null;
  analistaNombre: string | null;
  prioridad: Prioridad | null;
  /** true si volvió a Etapa 3 por una devolución del Validador en Etapa 4 (Lote 5). */
  devueltoPorValidador: boolean;
  /** motivo que el Validador escribió al devolver (Lote 5); null si nunca fue devuelto. */
  motivoDevolucion: string | null;
  /** dictamen del Analista, adjuntado al enviar a Etapa 4 (Lote 4) y leído en Decisión Final (Lote 5). */
  dictamen: string | null;
  criteriosJuridicos: Criterion[];
  criteriosEconomicos: Criterion[];
  camposChecklist: ChecklistField[];
  estado: EstadoHallazgo;
  /** Checklist de Etapa 1 (ver arriba). `null` para hallazgos semilla que ya
   *  arrancan en Etapa 2+ y nunca tuvieron una revisión de Etapa 1 capturada;
   *  para los que sí pasaron por ahí de verdad, se conserva tal cual (no se
   *  limpia) una vez que el hallazgo avanza a Etapa 2. */
  camposEtapa1: Etapa1Campos | null;
}

export type LogOrigen = "Sistema" | "Asesor" | "Validador-triage" | "Analista" | "Validador-decision";

export interface LogErrorEntry {
  id: string;
  hallazgoId: string;
  hallazgoNombre: string;
  /** "—" para entradas que no vienen de un hallazgo con país propio (ej. candados de Sistema). */
  pais: string;
  /** "—" para entradas de candados que fallan antes de que el hallazgo tenga tipo asignado (no ocurre hoy, pero se deja el mismo criterio que `pais`). */
  tipo: string;
  origen: LogOrigen;
  motivo: string;
  fecha: string;
}

// ─── Candados (Lote 6, automatizados) ───────────────────────────────────────
// Chequeos de calidad de datos -- 100% automáticos, sin consulta humana (así
// se decidió tras el Lote 6: la versión anterior era una pantalla manual con
// botón "Descartar", pero nunca tuvo consumidor real). Corren dentro de
// enviarAEtapa2 sobre cada hallazgo nuevo: si algo falla, el hallazgo NUNCA
// llega al repositorio -- se registra directo en log_errores con origen
// "Sistema" y ahí termina. Nunca aparecen en el Repositorio (ver "Referencia
// rápida" del doc) ni en ninguna pantalla propia; el único rastro es esa
// entrada de log_errores.
export interface CandadosResult {
  ok: boolean;
  motivos: string[];
}

function evaluarCandadosAutomaticos(input: { nombre: string }, hallazgosExistentes: Hallazgo[]): CandadosResult {
  const motivos: string[] = [];
  const nombreNormalizado = input.nombre.trim().toLowerCase();

  if (nombreNormalizado.length < 12) {
    motivos.push("Título demasiado corto para ser un hallazgo verificable (mínimo 12 caracteres).");
  }
  if (hallazgosExistentes.some(h => h.nombre.trim().toLowerCase() === nombreNormalizado)) {
    motivos.push("Ya existe un hallazgo con el mismo título en el repositorio.");
  }

  return { ok: motivos.length === 0, motivos };
}

// ─── Notificaciones (Lote 7) ────────────────────────────────────────────────
// Un evento por destinatario real (asesorId/analistaId de un Hallazgo), no
// datos fijos: cada acción del store que afecta a otra persona (asignar,
// devolver, publicar, no usar, descartar en triage) empuja una entrada aquí.
// El ícono/color por `kind` vive en la UI (App.tsx para el dropdown,
// RevisionNotificaciones.tsx para "ver todas"), no en este archivo -- mismo
// motivo que siempre: este módulo no puede depender de `C`.
export type NotifKind = "asignacion" | "devolucion" | "publicado" | "no-usado" | "descartado-triage";

export interface Notificacion {
  id: string;
  /** id de la persona que debe verla -- uno de los REVISION_DEMO_USER_ID de App.tsx. */
  destinatarioId: string;
  kind: NotifKind;
  titulo: string;
  subtitulo: string;
  fecha: string;
  leida: boolean;
  accion: { label: string; screen: string; id?: string } | null;
}

// 2 por categoría, con al menos un Trámite y una Barrera regulatoria entre
// ellos -- antes `logErrores` arrancaba en `[]` y las 5 categorías se veían
// vacías hasta generar algo en vivo durante una sesión.
const SEED_LOG_ERRORES: LogErrorEntry[] = [
  { id: "LOG-S01", hallazgoId: "seed-sistema-1", hallazgoNombre: "Permiso de operación duplicado en el sistema de registro", pais: "Colombia", tipo: "Barrera regulatoria", origen: "Sistema", motivo: "Ya existe un hallazgo con el mismo título en el repositorio.", fecha: "hace 6 horas" },
  { id: "LOG-S02", hallazgoId: "seed-sistema-2", hallazgoNombre: "Renovación", pais: "México", tipo: "Trámite", origen: "Sistema", motivo: "Título demasiado corto para ser un hallazgo verificable (mínimo 12 caracteres).", fecha: "hace 1 día" },
  { id: "LOG-A01", hallazgoId: "seed-asesor-1", hallazgoNombre: "Retraso en la emisión de licencias de importación temporal", pais: "Argentina", tipo: "Trámite", origen: "Asesor", motivo: "El texto normativo citado no corresponde al pasaje resaltado -- inconsistencia detectada antes de enviar.", fecha: "hace 2 días" },
  { id: "LOG-A02", hallazgoId: "seed-asesor-2", hallazgoNombre: "Prohibición de publicidad comparativa en el sector financiero", pais: "Chile", tipo: "Barrera regulatoria", origen: "Asesor", motivo: "Diagnóstico económico insuficiente para sustentar la severidad asignada.", fecha: "hace 4 días" },
  { id: "LOG-VT01", hallazgoId: "seed-triage-1", hallazgoNombre: "Formulario de registro sanitario en papel membretado", pais: "Perú", tipo: "Trámite", origen: "Validador-triage", motivo: "No constituye una barrera -- es un requisito administrativo estándar sin impacto comercial significativo.", fecha: "hace 3 días" },
  { id: "LOG-VT02", hallazgoId: "seed-triage-2", hallazgoNombre: "Restricción de horario comercial nocturno", pais: "Brasil", tipo: "Barrera regulatoria", origen: "Validador-triage", motivo: "Aplica por igual a empresas nacionales y extranjeras -- no es discriminatoria.", fecha: "hace 5 días" },
  { id: "LOG-AN01", hallazgoId: "seed-analista-1", hallazgoNombre: "Doble certificación fitosanitaria para el mismo embarque", pais: "Uruguay", tipo: "Regulación", origen: "Analista", motivo: "No cumple los criterios mínimos de admisibilidad jurídica -- la norma citada fue derogada en 2021.", fecha: "hace 1 semana" },
  { id: "LOG-AN02", hallazgoId: "seed-analista-2", hallazgoNombre: "Plazo indefinido para habilitación de depósito aduanero", pais: "Ecuador", tipo: "Trámite", origen: "Analista", motivo: "El diagnóstico económico no acredita causalidad directa entre la norma y el costo estimado.", fecha: "hace 1 semana" },
  { id: "LOG-VD01", hallazgoId: "seed-decision-1", hallazgoNombre: "Arancel diferenciado para insumos de un solo país de origen", pais: "Colombia", tipo: "Barrera regulatoria", origen: "Validador-decision", motivo: "Evidencia insuficiente para publicar -- falta sustento documental del costo estimado.", fecha: "hace 2 semanas" },
  { id: "LOG-VD02", hallazgoId: "seed-decision-2", hallazgoNombre: "Certificación redundante para maquinaria ya homologada", pais: "México", tipo: "Regulación", origen: "Validador-decision", motivo: "El dictamen del Analista no distingue esta norma de una ya publicada anteriormente.", fecha: "hace 2 semanas" },
];

const SEED_NOTIFICACIONES: Notificacion[] = [
  { id: "NOTIF-S1", destinatarioId: "demo-analista", kind: "publicado", titulo: "Tu dictamen fue publicado", subtitulo: "Registro de alimentos procesados · el repositorio se actualizó · ayer", fecha: "ayer", leida: true, accion: { label: "Ver publicado", screen: "revision-repositorio" } },
  { id: "NOTIF-S2", destinatarioId: "demo-analista", kind: "no-usado", titulo: "El Validador no usó tu dictamen", subtitulo: "Autorización de importación de insumos médicos · hace 2 días", fecha: "hace 2 días", leida: true, accion: null },
  { id: "NOTIF-S3", destinatarioId: "demo-asesor", kind: "descartado-triage", titulo: "Tu hallazgo fue descartado en triage", subtitulo: "Exigencias de domicilio local para operar · «No es barrera» · hace 3 días", fecha: "hace 3 días", leida: true, accion: { label: "Ver motivo", screen: "revision-log-errores" } },
];

const STAGE_LABEL: Record<Stage, string> = {
  1: "Validación del Asesor",
  2: "Triage",
  3: "Revisión del Analista",
  4: "Decisión Final",
};

// IDs de personas "demo" — ver REVISION_DEMO_USER_ID en App.tsx, que mapea cada
// UserRole de sesión a uno de estos ids para poder probar la matriz de
// visibilidad sin un sistema de usuarios real. "demo-asesor"/"demo-analista"
// son quien está logueado en la sesión (siempre "Ana Mejía", igual que el
// resto de la app); los demás ids son "otras personas" de muestra.
const SEED_HALLAZGOS: Hallazgo[] = [
  // Etapa 1 -- pendientes de validar del Asesor. H-101/H-102 pertenecen a
  // "demo-asesor" (quien está logueado al elegir el rol Asesor); H-103 a
  // "demo-asesor-2" (otra persona), para poder probar que un Asesor NO ve el
  // borrador de otro Asesor en su propia lista.
  { id: "H-101", nombre: "Restricción a Operadores Sin Planta Propia", pais: "Bolivia", tipo: "Barrera regulatoria", clasificacion: "Entrada", sector: "Agroindustria Cafetalera", rol: "—", hace: "hace 1 día", stage: 1, stageLabel: STAGE_LABEL[1], assignment: null, asesorId: "demo-asesor", asesorNombre: "Ana Mejía", analistaId: null, analistaNombre: null, prioridad: null, devueltoPorValidador: false, motivoDevolucion: null, dictamen: null, ...blankChecklist(), camposEtapa1: defaultCamposEtapa1() },
  { id: "H-102", nombre: "Exigencia de traducción jurada para certificados sanitarios de exportación", pais: "Perú", tipo: "Trámite", clasificacion: "Salida", sector: "Agroindustria", rol: "—", hace: "hace 6 horas", stage: 1, stageLabel: STAGE_LABEL[1], assignment: null, asesorId: "demo-asesor", asesorNombre: "Ana Mejía", analistaId: null, analistaNombre: null, prioridad: null, devueltoPorValidador: false, motivoDevolucion: null, dictamen: null, ...blankChecklist(), camposEtapa1: camposEtapa1Tramite() },
  { id: "H-103", nombre: "Cuota mínima de insumos nacionales para certificación de origen", pais: "Chile", tipo: "Barrera regulatoria", clasificacion: "Operación", sector: "Manufactura", rol: "—", hace: "hace 2 días", stage: 1, stageLabel: STAGE_LABEL[1], assignment: null, asesorId: "demo-asesor-2", asesorNombre: "Roberto Silva", analistaId: null, analistaNombre: null, prioridad: null, devueltoPorValidador: false, motivoDevolucion: null, dictamen: null, ...blankChecklist(), camposEtapa1: camposEtapa1Barrera() },
  { id: "H-001", nombre: "Requisito de capital mínimo discriminatorio", pais: "Colombia", tipo: "Barrera regulatoria", clasificacion: "Entrada", sector: "Servicios Financieros", rol: "Analista BID", hace: "hace 2 horas", stage: 2, stageLabel: STAGE_LABEL[2], assignment: null, asesorId: "demo-asesor", asesorNombre: "Ana Mejía", analistaId: null, analistaNombre: null, prioridad: null, devueltoPorValidador: false, motivoDevolucion: null, dictamen: null, ...blankChecklist(), camposEtapa1: null },
  { id: "H-002", nombre: "Licencia obligatoria de importación de insumos médicos", pais: "Perú", tipo: "Trámite", clasificacion: "Entrada", sector: "Salud", rol: "Analista BID", hace: "hace 5 horas", stage: 2, stageLabel: STAGE_LABEL[2], assignment: null, asesorId: "demo-asesor", asesorNombre: "Ana Mejía", analistaId: null, analistaNombre: null, prioridad: null, devueltoPorValidador: false, motivoDevolucion: null, dictamen: null, ...blankChecklist(), camposEtapa1: null },
  { id: "H-003", nombre: "Tasa arancelaria preferencial no publicada", pais: "México", tipo: "Barrera regulatoria", clasificacion: "Entrada", sector: "Comercio Exterior", rol: "Especialista externo", hace: "hace 1 día", stage: 3, stageLabel: STAGE_LABEL[3], assignment: "asignado", asesorId: "demo-asesor-2", asesorNombre: "Roberto Silva", analistaId: "demo-analista", analistaNombre: "Ana Rodríguez", prioridad: "Alta", devueltoPorValidador: false, motivoDevolucion: null, dictamen: null, ...richChecklist(), camposEtapa1: null },
  { id: "H-004", nombre: "Registro sanitario con plazos indefinidos", pais: "Argentina", tipo: "Trámite", clasificacion: "Operación", sector: "Salud", rol: "Analista BID", hace: "hace 1 día", stage: 3, stageLabel: STAGE_LABEL[3], assignment: "asignado", asesorId: "demo-asesor", asesorNombre: "Ana Mejía", analistaId: "otro-analista", analistaNombre: "Carlos Mendoza", prioridad: "Normal", devueltoPorValidador: false, motivoDevolucion: null, dictamen: null, ...richChecklist(), camposEtapa1: null },
  { id: "H-005", nombre: "Restricción de participación extranjera en telecomunicaciones", pais: "Brasil", tipo: "Barrera regulatoria", clasificacion: "Operación", sector: "Telecomunicaciones", rol: "—", hace: "hace 2 días", stage: 3, stageLabel: STAGE_LABEL[3], assignment: "sin asignar", asesorId: "demo-asesor", asesorNombre: "Ana Mejía", analistaId: null, analistaNombre: null, prioridad: null, devueltoPorValidador: false, motivoDevolucion: null, dictamen: null, ...richChecklist(), camposEtapa1: null },
  { id: "H-006", nombre: "Cuota de contenido local sin fundamento técnico", pais: "Chile", tipo: "Regulación", clasificacion: "Operación", sector: "Manufactura", rol: "—", hace: "hace 3 días", stage: 3, stageLabel: STAGE_LABEL[3], assignment: "sin asignar", asesorId: "demo-asesor-2", asesorNombre: "Roberto Silva", analistaId: null, analistaNombre: null, prioridad: null, devueltoPorValidador: false, motivoDevolucion: null, dictamen: null, ...richChecklist(), camposEtapa1: null },
  { id: "H-007", nombre: "Doble tributación sobre servicios digitales transfronterizos", pais: "Ecuador", tipo: "Barrera regulatoria", clasificacion: "Salida", sector: "Servicios Digitales", rol: "Especialista externo", hace: "hace 4 días", stage: 4, stageLabel: STAGE_LABEL[4], assignment: null, asesorId: "demo-asesor", asesorNombre: "Ana Mejía", analistaId: "demo-analista", analistaNombre: "Ana Rodríguez", prioridad: null, devueltoPorValidador: false, motivoDevolucion: null, dictamen: "Se verificaron los 10 criterios; persiste incumplimiento en Cita normativa y Proporcionalidad, corregidos en los campos adjuntos.", ...richChecklist(), camposEtapa1: null },
  { id: "H-008", nombre: "Norma técnica que impide interoperabilidad de pagos", pais: "Uruguay", tipo: "Regulación", clasificacion: "Operación", sector: "Servicios Financieros", rol: "Analista BID", hace: "hace 5 días", stage: 4, stageLabel: STAGE_LABEL[4], assignment: null, asesorId: "demo-asesor-2", asesorNombre: "Roberto Silva", analistaId: "otro-analista", analistaNombre: "Carlos Mendoza", prioridad: null, devueltoPorValidador: false, motivoDevolucion: null, dictamen: "Evaluación técnica completa; se ajustó el plazo legal y la entidad emisora citada.", ...richChecklist(), camposEtapa1: null },
];

interface RevisionContextValue {
  hallazgos: Hallazgo[];
  logErrores: LogErrorEntry[];
  /** Etapa 2 -> estado "publicado" (deja de aparecer en el Repositorio activo, no se borra). */
  publicarDirecto: (id: string, nota: string) => void;
  /** Etapa 2 -> log_errores "Descartado en triage" (se retira del repositorio, terminal). */
  rechazarTriage: (id: string, motivo: string) => void;
  /** Etapa 2 -> Etapa 3, asignado a un Analista. */
  asignarAnalista: (id: string, analistaId: string, analistaNombre: string, prioridad: Prioridad, nota: string) => void;
  /** Etapa 1 -> Etapa 2: transforma el hallazgo de Etapa 1 (mismo id) con los
   *  campos que el Asesor haya editado. Antes corren los candados automáticos
   *  (ver evaluarCandadosAutomaticos); si alguno falla, el hallazgo se queda
   *  en Etapa 1 sin cambios y solo se registra el intento en log_errores
   *  "Sistema" -- por eso devuelve el resultado, para que la pantalla pueda
   *  avisarle al Asesor. */
  enviarAEtapa2: (id: string, overrides: { nombre: string; pais: string; tipo: string; clasificacion: string; sector: string }) => CandadosResult;
  /** Etapa 1 -> log_errores "Asesor" (terminal: retira el hallazgo, nunca llega a Etapa 2). */
  rechazarPorAsesor: (id: string, motivo: string) => void;
  /** Guarda avance del checklist sin cambiar de etapa ("Guardar avance"). */
  actualizarChecklist: (id: string, patch: Partial<Pick<Hallazgo, "criteriosJuridicos" | "criteriosEconomicos" | "camposChecklist">>) => void;
  /** Edición del Validador sobre los campos básicos de un hallazgo en Etapa 2 (RevisionVerHallazgo). */
  actualizarHallazgoBasico: (id: string, patch: Partial<Pick<Hallazgo, "nombre" | "pais" | "tipo" | "clasificacion" | "sector">>) => void;
  /** Etapa 3 -> Etapa 4 con el checklist + dictamen adjuntos. Limpia la marca de devolución si venía de una. */
  enviarAValidador: (id: string, input: { dictamen: string; criteriosJuridicos: Criterion[]; criteriosEconomicos: Criterion[]; camposChecklist: ChecklistField[] }) => void;
  /** Etapa 4 -> log_errores "Validador-decision" (terminal, se retira del repositorio). */
  noUsar: (id: string, motivo: string) => void;
  /** Etapa 4 -> estado "publicado" (deja de aparecer en el Repositorio activo, no se borra). */
  aceptarYPublicar: (id: string) => void;
  /** Etapa 4 -> Etapa 3, de vuelta al mismo Analista, con motivo visible en su checklist. */
  devolverAAnalista: (id: string, motivo: string) => void;
  notificaciones: Notificacion[];
  /** id de quien está viendo la sesión -- REVISION_DEMO_USER_ID[userRole] en App.tsx. */
  currentUserId: string;
  /** Puente hacia App.tsx#revisionNavigate, para que las acciones de una notificación naveguen de verdad. */
  onNavigate: (screen: string, id?: string) => void;
  marcarLeida: (id: string) => void;
  marcarTodasLeidas: () => void;
}

const RevisionContext = createContext<RevisionContextValue | null>(null);

// Placeholder de fecha relativa hasta que haya un reloj/backend real.
function nowLabel(): string {
  return "justo ahora";
}

interface RevisionProviderProps {
  children: React.ReactNode;
  currentUserId: string;
  onNavigate: (screen: string, id?: string) => void;
}

export function RevisionProvider({ children, currentUserId, onNavigate }: RevisionProviderProps) {
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>(SEED_HALLAZGOS);
  const [logErrores, setLogErrores] = useState<LogErrorEntry[]>(SEED_LOG_ERRORES);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(SEED_NOTIFICACIONES);

  const notificar = useCallback((n: Omit<Notificacion, "id" | "fecha" | "leida">) => {
    setNotificaciones(prev => [{ ...n, id: `NOTIF-${Date.now()}-${prev.length}`, fecha: nowLabel(), leida: false }, ...prev]);
  }, []);

  const publicarDirecto = useCallback((id: string, _nota: string) => {
    setHallazgos(prev => {
      const found = prev.find(h => h.id === id);
      if (found) {
        notificar({
          destinatarioId: found.asesorId,
          kind: "publicado",
          titulo: "Tu hallazgo fue publicado",
          subtitulo: `${found.nombre} · publicado directo en triage`,
          accion: { label: "Ver publicado", screen: "revision-repositorio" },
        });
      }
      return prev.map(h => (h.id === id ? { ...h, estado: "publicado" as EstadoHallazgo } : h));
    });
  }, [notificar]);

  const rechazarTriage = useCallback((id: string, motivo: string) => {
    setHallazgos(prev => {
      const found = prev.find(h => h.id === id);
      if (found) {
        const entry: LogErrorEntry = {
          id: `LOG-${prev.length}-${id}`,
          hallazgoId: id,
          hallazgoNombre: found.nombre,
          pais: found.pais,
          tipo: found.tipo,
          origen: "Validador-triage",
          motivo,
          fecha: nowLabel(),
        };
        setLogErrores(logs => [entry, ...logs]);
        notificar({
          destinatarioId: found.asesorId,
          kind: "descartado-triage",
          titulo: "Tu hallazgo fue descartado en triage",
          subtitulo: `${found.nombre} · «${motivo}»`,
          accion: { label: "Ver motivo", screen: "revision-log-errores" },
        });
      }
      return prev.filter(h => h.id !== id);
    });
  }, [notificar]);

  const asignarAnalista = useCallback((id: string, analistaId: string, analistaNombre: string, prioridad: Prioridad, _nota: string) => {
    setHallazgos(prev => {
      const found = prev.find(h => h.id === id);
      if (found) {
        notificar({
          destinatarioId: analistaId,
          kind: "asignacion",
          titulo: "El Validador te asignó un hallazgo",
          subtitulo: `${found.nombre} · Etapa 3 · Prioridad ${prioridad}`,
          accion: { label: "Abrir checklist", screen: "revision-analista-checklist", id },
        });
      }
      return prev.map(h => (
        h.id === id
          ? { ...h, stage: 3 as Stage, stageLabel: STAGE_LABEL[3], assignment: "asignado" as Assignment, analistaId, analistaNombre, prioridad }
          : h
      ));
    });
  }, [notificar]);

  // A diferencia del resto de las funciones de este archivo (rechazarTriage,
  // noUsar, asignarAnalista, etc.), que leen el hallazgo desde el `prev` de un
  // `setHallazgos(prev => ...)`, esta lee `hallazgos` directamente del closure
  // del componente. Es a propósito: `enviarAEtapa2` necesita devolver el
  // resultado de los candados (CandadosResult) de forma SÍNCRONA, en el mismo
  // return de la función, para que RevisionAsesorDetalle pueda reaccionar en
  // el mismo click (mostrar el banner de bloqueo o navegar). Un updater
  // funcional de setState no garantiza haber corrido para cuando esta función
  // retorna, así que un `let resultado` asignado dentro de un `setHallazgos(prev
  // => {...})` y leído después NO sería confiable -- por eso el patrón distinto.
  //
  // Etapa 1 ahora tiene hallazgos reales en el store (antes no existían, así
  // que esto creaba un Hallazgo nuevo desde cero). Por eso ya no arma un
  // objeto nuevo: TRANSFORMA el hallazgo de Etapa 1 existente (mismo id) a
  // Etapa 2 con los campos que el Asesor haya editado. Si los candados
  // fallan, el hallazgo se queda tal cual en Etapa 1 (no se pierde el
  // borrador) y solo se registra el intento fallido en log_errores "Sistema".
  const enviarAEtapa2 = useCallback((id: string, overrides: { nombre: string; pais: string; tipo: string; clasificacion: string; sector: string }): CandadosResult => {
    const check = evaluarCandadosAutomaticos({ nombre: overrides.nombre }, hallazgos.filter(h => h.id !== id));
    if (!check.ok) {
      const entry: LogErrorEntry = {
        id: `LOG-${Date.now()}`,
        hallazgoId: id,
        hallazgoNombre: overrides.nombre,
        pais: overrides.pais,
        tipo: overrides.tipo,
        origen: "Sistema",
        motivo: check.motivos.join(" · "),
        fecha: nowLabel(),
      };
      setLogErrores(logs => [entry, ...logs]);
      return check;
    }
    setHallazgos(prev => prev.map(h => (
      h.id === id ? { ...h, ...overrides, stage: 2 as Stage, stageLabel: STAGE_LABEL[2] } : h
    )));
    return check;
  }, [hallazgos]);

  const actualizarHallazgoBasico = useCallback((id: string, patch: Partial<Pick<Hallazgo, "nombre" | "pais" | "tipo" | "clasificacion" | "sector">>) => {
    setHallazgos(prev => prev.map(h => (h.id === id ? { ...h, ...patch } : h)));
  }, []);

  // Igual que enviarAEtapa2: ahora el hallazgo de Etapa 1 ya existe de verdad
  // en el store, así que además de loguear el rechazo hay que retirarlo --
  // antes solo escribía en log_errores porque no había ningún objeto real que quitar.
  const rechazarPorAsesor = useCallback((id: string, motivo: string) => {
    setHallazgos(prev => {
      const found = prev.find(h => h.id === id);
      if (found) {
        const entry: LogErrorEntry = {
          id: `LOG-${Date.now()}`,
          hallazgoId: id,
          hallazgoNombre: found.nombre,
          pais: found.pais,
          tipo: found.tipo,
          origen: "Asesor",
          motivo,
          fecha: nowLabel(),
        };
        setLogErrores(logs => [entry, ...logs]);
      }
      return prev.filter(h => h.id !== id);
    });
  }, []);

  const actualizarChecklist = useCallback((id: string, patch: Partial<Pick<Hallazgo, "criteriosJuridicos" | "criteriosEconomicos" | "camposChecklist">>) => {
    setHallazgos(prev => prev.map(h => (h.id === id ? { ...h, ...patch } : h)));
  }, []);

  const enviarAValidador = useCallback((id: string, input: { dictamen: string; criteriosJuridicos: Criterion[]; criteriosEconomicos: Criterion[]; camposChecklist: ChecklistField[] }) => {
    setHallazgos(prev => prev.map(h => (
      h.id === id
        ? {
            ...h,
            stage: 4 as Stage,
            stageLabel: STAGE_LABEL[4],
            dictamen: input.dictamen,
            criteriosJuridicos: input.criteriosJuridicos,
            criteriosEconomicos: input.criteriosEconomicos,
            camposChecklist: input.camposChecklist,
            devueltoPorValidador: false,
            motivoDevolucion: null,
          }
        : h
    )));
  }, []);

  const noUsar = useCallback((id: string, motivo: string) => {
    setHallazgos(prev => {
      const found = prev.find(h => h.id === id);
      if (found) {
        const entry: LogErrorEntry = {
          id: `LOG-${Date.now()}`,
          hallazgoId: id,
          hallazgoNombre: found.nombre,
          pais: found.pais,
          tipo: found.tipo,
          origen: "Validador-decision",
          motivo,
          fecha: nowLabel(),
        };
        setLogErrores(logs => [entry, ...logs]);
        if (found.analistaId) {
          notificar({
            destinatarioId: found.analistaId,
            kind: "no-usado",
            titulo: "El Validador no usó tu dictamen",
            subtitulo: found.nombre,
            accion: null,
          });
        }
      }
      return prev.filter(h => h.id !== id);
    });
  }, [notificar]);

  const aceptarYPublicar = useCallback((id: string) => {
    setHallazgos(prev => {
      const found = prev.find(h => h.id === id);
      if (found) {
        if (found.analistaId) {
          notificar({
            destinatarioId: found.analistaId,
            kind: "publicado",
            titulo: "Tu dictamen fue publicado",
            subtitulo: `${found.nombre} · el repositorio se actualizó`,
            accion: { label: "Ver publicado", screen: "revision-repositorio" },
          });
        }
        notificar({
          destinatarioId: found.asesorId,
          kind: "publicado",
          titulo: "Tu hallazgo fue publicado",
          subtitulo: `${found.nombre} · el repositorio se actualizó`,
          accion: { label: "Ver publicado", screen: "revision-repositorio" },
        });
      }
      return prev.map(h => (h.id === id ? { ...h, estado: "publicado" as EstadoHallazgo } : h));
    });
  }, [notificar]);

  const devolverAAnalista = useCallback((id: string, motivo: string) => {
    setHallazgos(prev => {
      const found = prev.find(h => h.id === id);
      if (found && found.analistaId) {
        notificar({
          destinatarioId: found.analistaId,
          kind: "devolucion",
          titulo: "El validador devolvió tu dictamen",
          subtitulo: `${found.nombre} · «${motivo}»`,
          accion: { label: "Revisar y reenviar", screen: "revision-analista-checklist", id },
        });
      }
      return prev.map(h => (
        h.id === id
          ? { ...h, stage: 3 as Stage, stageLabel: STAGE_LABEL[3], devueltoPorValidador: true, motivoDevolucion: motivo }
          : h
      ));
    });
  }, [notificar]);

  const marcarLeida = useCallback((id: string) => {
    setNotificaciones(prev => prev.map(n => (n.id === id ? { ...n, leida: true } : n)));
  }, []);

  const marcarTodasLeidas = useCallback(() => {
    setNotificaciones(prev => prev.map(n => (n.destinatarioId === currentUserId ? { ...n, leida: true } : n)));
  }, [currentUserId]);

  const value = useMemo<RevisionContextValue>(() => ({
    hallazgos,
    logErrores,
    publicarDirecto,
    rechazarTriage,
    asignarAnalista,
    enviarAEtapa2,
    rechazarPorAsesor,
    actualizarChecklist,
    actualizarHallazgoBasico,
    enviarAValidador,
    noUsar,
    aceptarYPublicar,
    devolverAAnalista,
    notificaciones,
    currentUserId,
    onNavigate,
    marcarLeida,
    marcarTodasLeidas,
  }), [hallazgos, logErrores, publicarDirecto, rechazarTriage, asignarAnalista, enviarAEtapa2, rechazarPorAsesor, actualizarChecklist, actualizarHallazgoBasico, enviarAValidador, noUsar, aceptarYPublicar, devolverAAnalista, notificaciones, currentUserId, onNavigate, marcarLeida, marcarTodasLeidas]);

  return <RevisionContext.Provider value={value}>{children}</RevisionContext.Provider>;
}

export function useRevision(): RevisionContextValue {
  const ctx = useContext(RevisionContext);
  if (!ctx) throw new Error("useRevision() debe usarse dentro de <RevisionProvider>.");
  return ctx;
}
