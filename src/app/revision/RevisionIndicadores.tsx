import type React from "react";
import { Download, Info } from "lucide-react";
import { C, Header, KpiCard, ComposicionSimplePanel, HDR_BTN_SECONDARY, exportarLogErroresExcel } from "../App";
import { useRevision, type LogOrigen, type TipoError } from "./store";

// ─── Constantes de las 4/5 taxonomías fijas usadas en este screen ──────────────
const TIPOS_ERROR: TipoError[] = ["Severidad", "Interpretación jurídica", "Contexto", "Clasificación"];
const ORIGENES: LogOrigen[] = ["Sistema", "Asesor", "Validador-triage", "Analista", "Validador-decision"];
const ORIGEN_LABEL: Record<LogOrigen, string> = {
  "Sistema": "Sistema",
  "Asesor": "Asesor",
  "Validador-triage": "Val. triage",
  "Analista": "Analista",
  "Validador-decision": "Val. decisión",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "Space Grotesk, sans-serif", fontSize: 15, fontWeight: 600, color: C.text,
};

// Umbral de "muestra chica" para el aviso arriba del grupo de KpiCard --
// solo visual, no oculta ni recalcula nada: con N < 10 un solo hallazgo
// mueve cualquier porcentaje 10+ puntos, así que se avisa en vez de dejar
// que el % (real) se lea como si ya fuera representativo.
const N_MINIMO_MUESTRA = 10;

export default function RevisionIndicadores() {
  const { hallazgos, logErrores } = useRevision();

  // ─── Bloque "Indicadores de calidad" (punto 3) ───────────────────────────────
  // N = hallazgos con una decisión final tomada. "No usar" ya NO vive en
  // `hallazgos` (noUsar() lo retira del store al loguearlo -- ver store.tsx),
  // así que se cuenta desde logErrores por su origen único ("Validador-decision"
  // solo lo genera noUsar()). "Con al menos un ajuste registrado" usa
  // devueltoPorValidador -- es la única marca que queda en el Hallazgo de haber
  // pasado por "Ajustar → Devolver al Analista"; se limpia de nuevo al
  // reenviarse a Etapa 4 (enviarAValidador), así que un hallazgo ya publicado
  // que fue ajustado en el camino solo se cuenta una vez, vía "publicados"
  // (ver `tieneLogError` más abajo para cómo se distingue "con o sin ajuste").
  const publicados = hallazgos.filter(h => h.estado === "publicado");
  const conAjustePendiente = hallazgos.filter(h => h.estado !== "publicado" && h.devueltoPorValidador);
  const noUsarCount = logErrores.filter(e => e.origen === "Validador-decision").length;
  const N = publicados.length + conAjustePendiente.length + noUsarCount;

  const tieneLogError = (id: string) => logErrores.some(e => e.hallazgoId === id);
  const publicadosSinError = publicados.filter(h => !tieneLogError(h.id));
  const publicadosConError = publicados.filter(h => tieneLogError(h.id));

  // Pool sobre el que se miden las 4 categorías de tipoError (metrics 5-8):
  // los "No usar" no tienen objeto Hallazgo vivo para revisar su historial de
  // logErrores por tipo, así que -- a propósito -- NO se cuentan como "sin
  // error de tipo X" (serían falsos positivos de "correcto"); siguen sumando
  // a N pero quedan fuera del numerador de esas 4 métricas.
  const conDecisionViva = [...publicados, ...conAjustePendiente];
  const sinErrorDeTipo = (tipo: TipoError) => conDecisionViva.filter(h => !logErrores.some(e => e.hallazgoId === h.id && e.tipoError === tipo)).length;

  const pct = (num: number): number | null => (N === 0 ? null : (num / N) * 100);
  const fmt = (num: number): string => {
    const p = pct(num);
    return p === null ? "—" : String(Math.round(p));
  };
  const sub = (num: number) => `${num}/${N}`;

  const accionableCount = publicados.filter(h => (h.dictamen ?? "").trim() !== "").length;

  const metricas: { label: string; num: number; tooltip: string }[] = [
    { label: "Precisión general", num: publicados.length, tooltip: "Qué % de N terminó siendo útil, con o sin ajuste (publicados con o sin logError asociado)." },
    { label: "Precisión estricta", num: publicadosSinError.length, tooltip: "Qué % fue correcto desde el primer intento del agente (publicado, sin ningún logError asociado)." },
    { label: "Precisión recuperable", num: publicadosConError.length, tooltip: "Se corrigió al menos una vez (tiene logError asociado) y de todos modos se pudo publicar." },
    { label: "Falsos positivos", num: noUsarCount, tooltip: "El agente lo generó pero no era un hallazgo válido (terminó en «No usar»)." },
    { label: "Cita correcta", num: sinErrorDeTipo("Interpretación jurídica"), tooltip: "Aproximación: los errores de cita/norma caen mayormente en tipoError «Interpretación jurídica» -- no hay campo específico de «cita» todavía." },
    { label: "Vigencia", num: sinErrorDeTipo("Contexto"), tooltip: "Misma lógica aproximada que «Cita correcta», usando tipoError «Contexto»." },
    { label: "Clasificación", num: sinErrorDeTipo("Clasificación"), tooltip: "Hallazgos sin ningún logError de tipoError «Clasificación» asociado." },
    { label: "Severidad", num: sinErrorDeTipo("Severidad"), tooltip: "Hallazgos sin ningún logError de tipoError «Severidad» asociado." },
    { label: "Recomendación accionable", num: accionableCount, tooltip: "Publicados que además tienen un dictamen no vacío -- proxy de «acción de mejora asignada»: el Hallazgo de Revisión no tiene un campo accionCategoria propio (ese vive en ALL_BARRERAS/ALL_TRAMITES, un catálogo sin vínculo con este store)." },
  ];

  // ─── Bloque "Retroalimentación al sistema" (punto 2) ─────────────────────────
  const filasPorTipoError = TIPOS_ERROR.map(t => ({ nombre: t, valor: logErrores.filter(e => e.tipoError === t).length }));

  // TODO: esto es la base para que el BID identifique patrones de error y
  // ajuste agentes/prompts/taxonomías -- la conexión real a ese ciclo de
  // mejora (qué se hace con esta información) queda fuera del alcance de esta
  // tarea, es solo el reporte interno.
  const handleExportar = () => { void exportarLogErroresExcel(logErrores); };

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header breadcrumb="Validación HITL › Indicadores" title="Indicadores" />

      {/* ── Indicadores de calidad ──────────────────────────────────────────── */}
      <section className="mb-8">
        <p style={{ ...sectionTitle, marginBottom: 12 }}>Indicadores de calidad</p>
        {N < N_MINIMO_MUESTRA && (
          <div className="rounded-lg px-4 py-3 flex items-start gap-3 mb-3" style={{ backgroundColor: C.ambar2, border: `1px solid ${C.ambar1}55` }}>
            <Info size={16} color={C.ambarTexto} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.ambarTexto, lineHeight: 1.5 }}>
              Muestra insuficiente para interpretar estos porcentajes (N={N} hallazgos con decisión) — los valores se normalizan a medida que crece el histórico de decisiones.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {metricas.map(m => (
            <KpiCard key={m.label} label={m.label} value={fmt(m.num)} valueSuffix={pct(m.num) === null ? undefined : "%"} sub={sub(m.num)} tooltip={m.tooltip} />
          ))}
        </div>
        <p className="mt-3" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, fontStyle: "italic" }}>
          Las 9 fórmulas son de muestra, aproximadas con los datos disponibles — metodología de muestra, pendiente de validación con el BID.
        </p>
      </section>

      {/* ── Retroalimentación al sistema ────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p style={sectionTitle}>Retroalimentación al sistema</p>
          <button style={HDR_BTN_SECONDARY} onClick={handleExportar}>
            <Download size={13} /> Exportar
          </button>
        </div>

        <ComposicionSimplePanel label="log_errores por tipo de error" filas={filasPorTipoError} />

        {/* Vista cruzada tipoError × origen -- para ver en qué etapa del
            pipeline aparece cada tipo, no solo dónde se concentran. */}
        <div className="mt-5 rounded-lg overflow-hidden overflow-x-auto" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <table className="w-full min-w-[560px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "#F0F4F8" }}>
                <th className="px-4 py-2.5 text-left text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
                  Tipo de error
                </th>
                {ORIGENES.map(o => (
                  <th key={o} className="px-4 py-2.5 text-right text-[11px] uppercase tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>
                    {ORIGEN_LABEL[o]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIPOS_ERROR.map((t, i) => (
                <tr key={t} style={{ borderBottom: i < TIPOS_ERROR.length - 1 ? `1px solid ${C.border}` : undefined }}>
                  <td className="px-4 py-3" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, color: C.text }}>{t}</td>
                  {ORIGENES.map(o => {
                    const count = logErrores.filter(e => e.tipoError === t && e.origen === o).length;
                    return (
                      <td key={o} className="px-4 py-3 text-right" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: count > 0 ? C.text : C.textMuted }}>
                        {count}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
