import React from "react";
import { Inbox, CornerUpLeft, Check, Ban, FilterX, ArrowRight, Edit3, Eye, FileText } from "lucide-react";
import { C, Header } from "../App";
import { useRevision, type Notificacion, type NotifKind } from "./store";

// ─── Metadatos por kind (ícono + color) -- reutiliza el mismo mapeo que el
// dropdown de App.tsx. Duplicado deliberadamente (2 archivos, ~5 entradas):
// este componente se carga vía React.lazy y por eso puede importar `C` sin
// riesgo de ciclo, pero el dropdown del Header vive en App.tsx mismo, así que
// no hay un módulo común "seguro" para compartir el mapeo sin reintroducir el
// problema de imports. Ver la nota grande en App.tsx junto a los imports de
// revision/* si esto se toca. ─────────────────────────────────────────────────
const KIND_META: Record<NotifKind, { icon: React.ElementType; color: string; bg: string }> = {
  asignacion: { icon: Inbox, color: C.steel4, bg: `${C.steel3}22` },
  devolucion: { icon: CornerUpLeft, color: C.ambarTexto, bg: C.ambar2 },
  publicado: { icon: Check, color: C.verde1, bg: C.verde2 },
  "no-usado": { icon: Ban, color: C.ambarTexto, bg: C.ambar2 },
  "descartado-triage": { icon: FilterX, color: C.ambarTexto, bg: C.ambar2 },
};

const ACCION_ICON: Record<string, React.ElementType> = {
  "Abrir checklist": ArrowRight,
  "Revisar y reenviar": Edit3,
  "Ver publicado": Eye,
  "Ver motivo": FileText,
};

interface RevisionNotificacionesProps {
  onBack?: () => void;
}

function Fila({ n, onAction }: { n: Notificacion; onAction: (n: Notificacion) => void }) {
  const meta = KIND_META[n.kind];
  const AccionIcon = n.accion ? ACCION_ICON[n.accion.label] ?? ArrowRight : null;
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b last:border-0" style={{ borderColor: C.border }}>
      <span className="flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: meta.bg }}>
        <meta.icon size={15} color={meta.color} strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600, color: C.text }}>{n.titulo}</p>
        <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, color: C.textMuted, marginTop: 1 }}>{n.subtitulo} · {n.fecha}</p>
      </div>
      {n.accion && (
        <button
          onClick={() => onAction(n)}
          className="flex items-center gap-1 flex-shrink-0"
          style={{ background: "none", border: "none", cursor: "pointer", color: C.steel4, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12, fontWeight: 500 }}
        >
          {AccionIcon && <AccionIcon size={12} strokeWidth={2} />}
          {n.accion.label}
        </button>
      )}
    </div>
  );
}

export default function RevisionNotificaciones({ onBack }: RevisionNotificacionesProps) {
  const { notificaciones, currentUserId, onNavigate, marcarLeida, marcarTodasLeidas } = useRevision();
  const mias = notificaciones.filter(n => n.destinatarioId === currentUserId);
  const nuevas = mias.filter(n => !n.leida);
  const anteriores = mias.filter(n => n.leida);

  const handleAction = (n: Notificacion) => {
    marcarLeida(n.id);
    if (n.accion) onNavigate(n.accion.screen, n.accion.id);
  };

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header
        breadcrumb="ALEPH · Revisión"
        title="Notificaciones"
        actions={
          mias.some(n => !n.leida) ? (
            <button
              onClick={marcarTodasLeidas}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12 }}
            >
              Marcar todas como leídas
            </button>
          ) : undefined
        }
      />

      {onBack && (
        <button
          onClick={onBack}
          className="mb-4"
          style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif", fontSize: 12 }}
        >
          ← Volver
        </button>
      )}

      {mias.length === 0 ? (
        <div className="rounded-lg flex items-center justify-center py-14" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 13, color: C.textMuted }}>Todavía no tienes notificaciones.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-2xl">
          {nuevas.length > 0 && (
            <div>
              <p className="mb-2 px-1" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted }}>
                Nuevas
              </p>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                {nuevas.map(n => <Fila key={n.id} n={n} onAction={handleAction} />)}
              </div>
            </div>
          )}
          {anteriores.length > 0 && (
            <div>
              <p className="mb-2 px-1" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted }}>
                Anteriores
              </p>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                {anteriores.map(n => <Fila key={n.id} n={n} onAction={handleAction} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
