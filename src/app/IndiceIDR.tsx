import { Download, ChevronDown, Info } from "lucide-react";
import { C, HDR_BTN_PRIMARY, HDR_BTN_SECONDARY, HDR_BTN_PILL } from "./theme";
import {
  Header,
  KpiCard,
  COUNTRIES,
  COUNTRY_DATA,
  COUNTRY_BARRERAS_DATA,
  COUNTRY_TRAMITES_DATA,
  VALIDADO_HITL_MUESTRA,
  IRR_GENERAL_MUESTRA,
  IDR_USADAS_RATIO_MUESTRA,
  nivelFriccionLabel,
} from "./App";
import type { Country, View } from "./App";
import type { TipoDato } from "./components/ui/PanelTipoSubdimension";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function totalNiveles(n: { n4: number; n3: number; n2: number; n1: number }): number {
  return n.n4 + n.n3 + n.n2 + n.n1;
}

const selStyle: React.CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  color: C.text,
  backgroundColor: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "7px 10px",
  fontSize: 12,
  outline: "none",
  cursor: "pointer",
  minHeight: 36,
};
const selDisabled: React.CSSProperties = { ...selStyle, opacity: 0.55, cursor: "not-allowed" };

// Distorsiones regulatorias (clasificación "Entrada") y Carga administrativa
// (tipo "Accesibilidad") a nivel regional — dato de muestra, mismos números
// que ya circulan en Barreras/Trámites regionales, no un catálogo aparte.
// TODO: cuando exista el cruce real, reemplazar por un cálculo derivado de
// COUNTRY_BARRERAS_DATA["Todos"] / COUNTRY_TRAMITES_DATA["Todos"] en vez de
// estos literales (hoy no cuadran 1 a 1 con esas fuentes, ver TODO en el
// KPI "Puntaje general" más abajo sobre el mismo tipo de pendiente).
const DISTORSIONES_REGIONAL = {
  total: 1696,
  filas: [
    { nombre: "Competencia", valor: 558 },
    { nombre: "Comercio", valor: 653 },
    { nombre: "Inversión", valor: 485 },
  ],
};
const CARGA_REGIONAL = {
  // total = suma exacta de las filas (563) — el pedido original habla de
  // "≈564", queda la suma exacta para que cuadre con el desglose mostrado.
  total: 563,
  filas: [
    { nombre: "Duplicidad e interoperabilidad", valor: 315 },
    { nombre: "Digitalización y accesibilidad", valor: 248 },
  ],
};

// ─── Panel "Distorsiones regulatorias" / "Carga administrativa" ───────────────
// Variante de ComposicionSimplePanel (App.tsx) con el peso del índice y el
// total como header — específico de esta pantalla, por eso no vive en
// ComposicionSimplePanel (evita tocar sus muchos otros usos en Barreras/
// Impacto Económico por un layout que solo necesita IndiceIDR).
function PesoIndicePanel({ label, peso, total, selectValue, filas, actionLabel, onAction, onRowClick }: {
  label: string;
  peso: number;
  total: number;
  selectValue: string;
  filas: { nombre: string; valor: number }[];
  actionLabel: string;
  onAction: () => void;
  // Si se pasa, cada fila se vuelve clicable, con su `nombre`.
  onRowClick?: (nombre: string) => void;
}) {
  const maxValor = Math.max(...filas.map(f => f.valor), 1);
  const gradient = [C.steel4, C.steel3, C.steel2, C.steel1];
  return (
    <div className="rounded-xl flex flex-col h-full" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      <div className="px-5 pt-4 pb-4 flex items-start justify-between gap-3" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{label}</p>
            <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.steel3 }}>({total.toLocaleString("es")})</span>
          </div>
          <p className="text-[11px] mt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>peso {peso}% del índice</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* TODO: select visual -- falta diseño del estado alterno
              (Operación / Certidumbre, Cumplimiento, Proporcionalidad) antes
              de cablearlo a un cambio real de clasificación/tipo. */}
          <select
            defaultValue={selectValue}
            style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, backgroundColor: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
          >
            <option value={selectValue}>{selectValue}</option>
          </select>
          <button style={HDR_BTN_PILL} onClick={onAction}>{actionLabel}</button>
        </div>
      </div>
      <div className="px-5 pt-4 pb-5 flex flex-col gap-3 flex-1 justify-center">
        {filas.map((f, i) => {
          const pct = (f.valor / maxValor) * 100;
          return (
            <div
              key={f.nombre}
              className="flex items-center gap-3"
              onClick={onRowClick ? () => onRowClick(f.nombre) : undefined}
              style={{ cursor: onRowClick ? "pointer" : undefined }}
            >
              <span className="flex-shrink-0" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, width: 190, lineHeight: 1.3 }}>{f.nombre}</span>
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 12, backgroundColor: "#E6ECF3" }}>
                <div style={{ width: `${pct}%`, height: "100%", backgroundColor: gradient[i % gradient.length] }} />
              </div>
              <span className="flex-shrink-0 text-right" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, color: C.textMuted, width: 40 }}>{f.valor.toLocaleString("es")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Índice / IDR ───────────────────────────────────────────────────────────
function IndiceIDR({ country = "Todos", onCountryChange, onNavigate }: {
  country?: Country;
  onCountryChange?: (c: Country) => void;
  onNavigate: (v: View) => void;
}) {
  // "Puntaje general" — 54.2 es el mismo valor de muestra ya usado por
  // IrrGeneralCard en Panel Regional (escala 0–100, IRR_GENERAL_MUESTRA).
  // TODO: confirmar con Franco/Juanjo si el IDR general regional (54.2)
  // debería derivarse matemáticamente del promedio de los 5 países o si es
  // una medición independiente — hoy no cuadran exactamente (el promedio
  // simple de los 5 valores de IRR_GENERAL_MUESTRA da ≈61.0, no 54.2), puede
  // ser normal si la ponderación no es un promedio simple, pero vale la pena
  // confirmarlo.
  const puntajeGeneral = country === "Todos" ? 54.2 : IRR_GENERAL_MUESTRA[country];
  const nivelFriccion = nivelFriccionLabel(puntajeGeneral);

  const distorsiones = country === "Todos"
    ? DISTORSIONES_REGIONAL
    : (() => {
        const dato: TipoDato = COUNTRY_BARRERAS_DATA[country].clasificacion["Entrada"];
        return {
          total: totalNiveles(dato.niveles),
          filas: dato.subdimensiones.map(s => ({ nombre: s.nombre, valor: totalNiveles(s.niveles) })),
        };
      })();

  const carga = country === "Todos"
    ? CARGA_REGIONAL
    : (() => {
        const dato: TipoDato = COUNTRY_TRAMITES_DATA[country].cargaPorTipo["Accesibilidad"];
        return {
          total: totalNiveles(dato.niveles),
          filas: dato.subdimensiones.map(s => ({ nombre: s.nombre, valor: totalNiveles(s.niveles) })),
        };
      })();

  const paisCard = (pais: Country) => {
    const detectadas = COUNTRY_DATA[pais].barreras;
    const usadas = Math.round(detectadas * IDR_USADAS_RATIO_MUESTRA);
    const pct = VALIDADO_HITL_MUESTRA[pais];
    return (
      <div key={pais} className="rounded-lg" style={{ backgroundColor: C.card, padding: 18 }}>
        <div className="flex items-center justify-between mb-3 gap-2">
          <p className="uppercase" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, color: C.text }}>{pais}</p>
          <button style={HDR_BTN_PILL} onClick={() => onCountryChange?.(pais)}>Ver detalle por país</button>
        </div>
        <p className="font-semibold leading-none mb-4" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 32, color: C.text }}>{IRR_GENERAL_MUESTRA[pais]}</p>
        <p className="uppercase mb-2" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10.5, color: C.textMuted }}>Hallazgos / Barreras</p>
        <div className="flex mb-2">
          <div className="flex-1">
            <p className="font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, color: C.text }}>{detectadas.toLocaleString("es")}</p>
            <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10.5, color: C.textMuted }}>detectadas</p>
          </div>
          <div className="flex-1">
            <p className="font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, color: C.text }}>{usadas.toLocaleString("es")}</p>
            <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10.5, color: C.textMuted }}>usadas</p>
          </div>
        </div>
        <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted }}>{pct}% validados</p>
      </div>
    );
  };
  const paisesRow1 = COUNTRIES.slice(0, 3);
  const paisesRow2 = COUNTRIES.slice(3);

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header
        breadcrumb="Índice / IDR"
        title="Índice / IDR"
        actions={
          <>
            <button style={HDR_BTN_PRIMARY} onClick={() => onNavigate({ screen: "reportes" })}>
              <Download size={13} /><span className="hidden sm:inline">Generar reporte</span><span className="sm:hidden">Reporte</span>
            </button>
            {/* TODO: dropdown de opciones de descarga */}
            <button style={HDR_BTN_SECONDARY}>
              Descargar <ChevronDown size={13} />
            </button>
          </>
        }
      />

      {/* Banda informativa — mismo estilo que Impacto Económico, con ícono de info */}
      <div className="flex items-center justify-between gap-2 mb-5 px-4 py-2.5 rounded-lg"
        style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 14, fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, lineHeight: 1.4 }}>
          Fecha de corte 12 mar 2026 · cobertura 91% · 68% de hallazgos usados están validados HITL
        </span>
        <Info size={16} color={C.textMuted} style={{ flexShrink: 0 }} />
      </div>

      {/* Filtros — mismo set de 2 filas de 5+5 que Impacto Económico.
          TODO: solo el filtro de País está cableado; el resto es visual, sin
          lógica de filtrado todavía (mismo criterio que Impacto Económico). */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <select className="grow" style={selStyle} value={country} onChange={e => onCountryChange?.(e.target.value as Country)}>
            <option value="Todos">Todos los países</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="grow" style={selStyle} defaultValue="">
            <option value="">Costo</option>
            <option value="bajo">Bajo (&lt; USD 200)</option>
            <option value="medio">Medio (USD 200–500)</option>
            <option value="alto">Alto (&gt; USD 500)</option>
          </select>
          <select className="grow" style={selStyle} defaultValue="">
            <option value="">Todos los sectores</option>
          </select>
          <select className="grow" style={selStyle} defaultValue="">
            <option value="">Entidad emisora</option>
          </select>
          <select className="grow" style={selStyle} defaultValue="">
            <option value="">Tipo de usuario</option>
            <option value="Empresarial">Empresarial</option>
            <option value="Ciudadano">Ciudadano</option>
          </select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <select className="grow" style={selStyle} defaultValue="">
            <option value="">Estado HITL</option>
            <option value="Publicado">Publicado</option>
            <option value="Por decidir">Por decidir</option>
            <option value="Etapa 3">Etapa 3</option>
          </select>
          <select className="grow" style={selStyle} defaultValue="">
            <option value="">Severidad</option>
            <option value="Crítica">Crítica</option>
            <option value="Alta">Alta</option>
          </select>
          <select className="grow" style={selStyle} defaultValue="">
            <option value="">Tipo de carga</option>
            <option value="Accesibilidad">Accesibilidad</option>
            <option value="Certidumbre">Certidumbre</option>
            <option value="Cumplimiento">Cumplimiento</option>
            <option value="Proporcionalidad">Proporcionalidad</option>
          </select>
          <select className="grow" style={selDisabled} disabled defaultValue="">
            <option value="">Subdimensión</option>
          </select>
          <select className="grow" style={selStyle} defaultValue="">
            <option value="">Fecha</option>
            {[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026].map(y => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <KpiCard label="Puntaje general" value={String(puntajeGeneral)} sub="dato de muestra · escala 0–100" />
        <KpiCard label="Nivel de fricciones" value={nivelFriccion} />
        <KpiCard label="Escala" value="0–100" />
      </div>

      {/* Banner de advertencia — comparabilidad entre países */}
      <div className="flex items-start gap-2.5 rounded-lg p-4 mb-6" style={{ backgroundColor: C.ambar2 }}>
        <Info size={15} color={C.ambarTexto} style={{ flexShrink: 0, marginTop: 1 }} />
        <p className="text-[12px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.ambarTexto }}>
          Los puntajes entre países no son directamente comparables si difiere su cobertura de fuentes procesadas o su porcentaje de validación HITL. Consulta la ficha de cobertura de cada país antes de comparar.
        </p>
      </div>

      {/* IDR por país */}
      <p className="uppercase mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, color: C.textMuted }}>IDR por país</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
        {paisesRow1.map(paisCard)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
        {paisesRow2.map(paisCard)}
      </div>

      {/* Distorsiones regulatorias · Carga administrativa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" style={{ alignItems: "stretch" }}>
        <PesoIndicePanel
          label="Distorsiones regulatorias"
          peso={55}
          total={distorsiones.total}
          selectValue="Entrada"
          filas={distorsiones.filas}
          actionLabel="Ver barreras →"
          onAction={() => onNavigate({ screen: "barreras" })}
          onRowClick={(subdimension) => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { clasificacion: "Entrada", subdimension, ...(country !== "Todos" ? { pais: country } : {}) } })}
        />
        <PesoIndicePanel
          label="Carga administrativa"
          peso={45}
          total={carga.total}
          selectValue="Accesibilidad"
          filas={carga.filas}
          actionLabel="Ver trámites →"
          onAction={() => onNavigate({ screen: "tramites" })}
          onRowClick={(subdimension) => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { tipoCarga: "Accesibilidad", subdimension, ...(country !== "Todos" ? { pais: country } : {}) } })}
        />
      </div>

      {/* Metodología */}
      <div className="rounded-lg p-5 mb-6" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <p className="text-[11px] uppercase tracking-widest font-medium mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Metodología</p>
        <div className="rounded-lg p-4" style={{ backgroundColor: C.canvas }}>
          <p className="text-[13px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>
            Escala 0–100 · ponderación 55/45 entre distorsiones y carga · normalizado por cobertura de fuentes procesadas · reglas de exclusión: hallazgos sin fuente trazable o en log_errores no se incluyen en el cálculo.
          </p>
        </div>
      </div>
    </div>
  );
}

export default IndiceIDR;
