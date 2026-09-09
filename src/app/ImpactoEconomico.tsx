import { useState } from "react";
import { Download, ChevronDown, Info } from "lucide-react";
import { C, HDR_BTN_PRIMARY, HDR_BTN_SECONDARY, HDR_BTN_PILL } from "./theme";
import {
  Header,
  KpiCard,
  ComposicionSimplePanel,
  COUNTRIES,
  COUNTRY_TRAMITES_DATA,
  MIPYME_MUESTRA,
  CANALES_TRANSMISION_MUESTRA,
  CANALES_TRANSMISION_TRAMITES_MUESTRA,
  TRAMITES_PRIORITARIOS_MUESTRA,
  ALL_TRAMITES,
} from "./App";
import type { Country, View } from "./App";

// ─── Formato de moneda compacto/expandido ──────────────────────────────────
function formatUSDCompacto(v: number): string {
  return `US$ ${(v / 1_000_000).toFixed(1)}M`;
}
function formatUSD(v: number): string {
  return `US$ ${Math.round(v).toLocaleString("es")}`;
}

// Color por fila de MIPYME_MUESTRA -- sus filas son ahora niveles de
// afectación (Alta/Media/Baja, el mismo dominio que barrera.afectacionMipyme
// y tramite.afectacionMipyme) en vez de tamaño de empresa, así que ya no
// hace falta desglosarlas por severidad (ver comentario junto a
// MIPYME_MUESTRA en App.tsx). Rampa steel (composición, NO severidad): "Alta"
// de afectación MIPYME no es lo mismo que "Crítico" de severidad -- C.critico
// está reservado exclusivamente para severidad nivel 4 en hallazgos
// individuales de barreras/trámites, nunca para otra clasificación
// categórica aunque el nombre se parezca.
const MIPYME_NIVEL_COLOR: Record<string, string> = { Alta: C.steel4, Media: C.steel3, Baja: C.steel1 };

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

const PAGE_SIZE = 10;

// ─── Impacto Económico ──────────────────────────────────────────────────────
function ImpactoEconomico({ country = "Todos", onCountryChange, onNavigate }: {
  country?: Country;
  onCountryChange?: (c: Country) => void;
  onNavigate: (v: View) => void;
}) {
  const [page, setPage] = useState(0);

  const td = COUNTRY_TRAMITES_DATA["Todos"];
  const costoPromedioPorTramite = Math.round(td.costoEstimadoUSD / td.total);

  const costoPorPaisFilas = COUNTRIES
    .map(pais => ({ nombre: pais, valor: COUNTRY_TRAMITES_DATA[pais].costoEstimadoUSD }))
    .sort((a, b) => b.valor - a.valor);

  const canalesTramites = CANALES_TRANSMISION_TRAMITES_MUESTRA[country] ?? CANALES_TRANSMISION_TRAMITES_MUESTRA["Todos"];
  const canalesBarreras = CANALES_TRANSMISION_MUESTRA[country] ?? CANALES_TRANSMISION_MUESTRA["Todos"];

  const mipymeFilas = MIPYME_MUESTRA[country] ?? MIPYME_MUESTRA["Todos"];

  // "Costo por trámite" — aplanado (todos los países) en modo "Todos",
  // filtrado por país en modo por país (mismo patrón ya usado en las tablas
  // de Barreras/Trámites). Cada fila trae tiempo/pasos/costo desde el
  // registro completo en ALL_TRAMITES (ya con backing real tras el fix
  // anterior — TRAMITES_PRIORITARIOS_MUESTRA solo trae un costo resumido en
  // texto, no tiempo ni pasos).
  const filasPrioritarias = country === "Todos"
    ? COUNTRIES.flatMap(pais => TRAMITES_PRIORITARIOS_MUESTRA[pais])
    : (TRAMITES_PRIORITARIOS_MUESTRA[country as Exclude<Country, "Todos">] ?? []);
  const costoPorTramiteFilas = filasPrioritarias.map(fila => {
    const completo = ALL_TRAMITES.find(t => t.id === fila.id);
    return {
      ...fila,
      tiempo: completo?.costo.tiempo ?? "—",
      pasos: completo?.pasos.length ?? 0,
      costoEstimado: completo?.costo.monetario ?? completo?.costo.cargaTotal ?? fila.costo,
    };
  });
  const pageCount = Math.ceil(costoPorTramiteFilas.length / PAGE_SIZE);
  const pageItems = costoPorTramiteFilas.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header
        breadcrumb="Impacto Económico"
        title="Impacto Económico"
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

      {/* Banda informativa — mismo estilo que BandaCobertura, con ícono de info */}
      <div className="flex items-center justify-between gap-2 mb-5 px-4 py-2.5 rounded-lg"
        style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 14, fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, lineHeight: 1.4 }}>
          Standard Cost Model aplicado a trámites · barreras aún sin costeo · última actualización 12 mar 2026
        </span>
        <Info size={16} color={C.textMuted} style={{ flexShrink: 0 }} />
      </div>

      {/* Filtros — 2 filas de 5+5, mismo set de campos que ya tiene Trámites.
          TODO: solo el filtro de País está cableado; el resto es visual,
          sin lógica de filtrado todavía (mismo criterio pedido: maquetar
          igual, sin nueva lógica). */}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Costo estimado total" value={formatUSDCompacto(td.costoEstimadoUSD)} sub="simulado · anual · 5 países" valueColor={C.steel4} />
        <KpiCard label="Costo promedio por trámite" value={formatUSD(costoPromedioPorTramite)} sub="simulado" valueColor={C.steel4} />
        {/* TODO: Tiempo promedio y Pasos promedio deberían calcularse del
            catálogo real de trámites cuando exista para los 5 países */}
        <KpiCard label="Tiempo promedio" value="18 días" sub="dato de muestra" />
        <KpiCard label="Pasos promedio" value="6.4" sub="dato de muestra" />
      </div>

      {/* Supuestos y metodología */}
      <div className="rounded-lg p-5 mb-6" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Supuestos y metodología</p>
            <p className="text-[13px] mt-0.5" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>Standard Cost Model de trámites</p>
          </div>
          <button style={HDR_BTN_PILL}>Ver metodología</button>
        </div>

        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Fórmula</p>
        <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: C.canvas }}>
          <p className="text-[13px] leading-relaxed" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>
            Costo = (Tiempo × Costo/hora del usuario) + Costos directos + (Frecuencia anual × Costo por repetición)
          </p>
        </div>

        <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Variables</p>
        <div className="flex flex-col gap-2 mb-4">
          {[
            ["Tiempo", "tiempo total que le toma al usuario completar el trámite."],
            ["Costo/hora", "costo de oportunidad del tiempo del usuario según su segmento."],
            ["Costos directos", "pagos, tasas y aranceles exigidos por el trámite."],
            ["Frecuencia", "número de veces al año que el usuario repite el trámite."],
          ].map(([label, desc]) => (
            <p key={label} className="text-[13px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text }}>
              <span style={{ fontWeight: 700 }}>{label}</span>: {desc}
            </p>
          ))}
        </div>

        <div className="flex items-start gap-2.5 rounded-lg p-4" style={{ backgroundColor: C.ambar2 }}>
          <Info size={15} color={C.ambarTexto} style={{ flexShrink: 0, marginTop: 1 }} />
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ambarTexto }}>Limitaciones</p>
            {[
              "No captura costos de oportunidad ni tiempos de espera por corrupción o discrecionalidad.",
              "No diferencia por tamaño de empresa dentro de cada nivel de Afectación MIPYME.",
              "El costo de canales digitales vs. presenciales se promedia, no se distingue.",
              "No aplica a barreras regulatorias, solo a trámites con procedimiento identificable.",
            ].map(l => (
              <p key={l} className="text-[12px] leading-relaxed" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.ambarTexto }}>{l}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Costo estimado por: [medida] */}
      <ComposicionSimplePanel
        label="Costo estimado por: País"
        filas={costoPorPaisFilas}
        formatValor={formatUSDCompacto}
        actionLabel="Ver tabla completa"
        onAction={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: {} })}
        headerExtra={
          // TODO: falta decidir si "Costo estimado por: [dimensión]" tendrá
          // más opciones además de "País" (ej. Sector, Entidad) — visual,
          // sin lógica de cambio de dimensión todavía.
          <select
            defaultValue="pais"
            style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, backgroundColor: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
          >
            <option value="pais">País</option>
          </select>
        }
      />

      {/* Canales de transmisión económica — Trámites vs. Barreras (series
          independientes, no deben coincidir) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6" style={{ alignItems: "stretch" }}>
        <ComposicionSimplePanel
          label="Trámites afectados por canal de transmisión económica"
          filas={canalesTramites}
          actionLabel="Ver tabla completa"
          onAction={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { ...(country !== "Todos" ? { pais: country } : {}) } })}
          onRowClick={(canalTransmision) => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { canalTransmision, ...(country !== "Todos" ? { pais: country } : {}) } })}
        />
        {/* CANALES_TRANSMISION_MUESTRA sí está por país (canalesBarreras ya usa
            `country` arriba) -- la nota anterior de que "no distingue país
            propio" era un error, corregido acá junto con el resto del barrido. */}
        <ComposicionSimplePanel
          label="Barreras afectados por canal de transmisión económica"
          filas={canalesBarreras}
          actionLabel="Ver tabla completa"
          onAction={() => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { ...(country !== "Todos" ? { pais: country } : {}) } })}
          onRowClick={(canalTransmision) => onNavigate({ screen: "hallazgos-filtrados-barreras", filtros: { canalTransmision, ...(country !== "Todos" ? { pais: country } : {}) } })}
        />
      </div>

      {/* Afectación MIPYME — filas por nivel de afectación (Alta/Media/Baja,
          mismo dominio que barrera.afectacionMipyme/tramite.afectacionMipyme;
          ver comentario junto a MIPYME_MUESTRA en App.tsx). */}
      <div className="rounded-xl mb-6" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-5 pt-4 pb-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
          <p className="text-[11px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Afectación MIPYME</p>
          <button style={{ backgroundColor: C.text, color: "white", border: "none", borderRadius: 999, padding: "6px 14px", fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            onClick={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { ...(country !== "Todos" ? { pais: country } : {}) } })}>
            Ver tabla completa
          </button>
        </div>
        <div className="px-5 pt-4 pb-3 flex flex-col gap-3">
          {mipymeFilas.map(f => (
            <div
              key={f.nombre}
              className="flex items-center gap-3"
              onClick={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { afectacionMipyme: f.nombre, ...(country !== "Todos" ? { pais: country } : {}) } })}
              style={{ cursor: "pointer" }}
            >
              <span className="flex-shrink-0" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted, width: 130 }}>{f.nombre}</span>
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 12, backgroundColor: "#E6ECF3" }}>
                <div style={{ width: "100%", height: "100%", backgroundColor: MIPYME_NIVEL_COLOR[f.nombre] ?? C.steel1 }} />
              </div>
              <span className="flex-shrink-0 text-right" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, color: C.textMuted, width: 32 }}>{f.valor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Costo por trámite */}
      <div className="rounded-lg" style={{ backgroundColor: C.card }}>
        <div className="p-5 border-b flex items-center justify-between gap-3" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <h3 className="text-[13px] uppercase tracking-widest font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>Costo por trámite</h3>
            <span className="text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.steel3 }}>({costoPorTramiteFilas.length})</span>
          </div>
          <button style={{ backgroundColor: C.text, color: "white", border: "none", borderRadius: 999, padding: "6px 14px", fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            onClick={() => onNavigate({ screen: "hallazgos-filtrados-tramites", filtros: { ...(country !== "Todos" ? { pais: country } : {}) } })}>
            Ver tabla completa
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Trámite", "Entidad", "Tipo de usuario", "Sector", "Tiempo", "Pasos", "Costo estimado"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-widest whitespace-nowrap"
                    style={{ fontFamily: "Space Grotesk, sans-serif", color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((t, i) => (
                <tr
                  key={i}
                  className="cursor-pointer hover:bg-[#F4F7FB] transition-colors"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                  onClick={() => onNavigate({ screen: "tramite-detail", id: t.id })}
                >
                  <td className="px-4 py-3 text-[13px] font-medium" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text, maxWidth: 200 }}>{t.tramite}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 180 }}>{t.entidad}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{t.tipoUsuario}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted, maxWidth: 160 }}>{t.sector}</td>
                  <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.textMuted }}>{t.tiempo}</td>
                  <td className="px-4 py-3 text-[12px] text-right" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.text }}>{t.pasos}</td>
                  <td className="px-4 py-3 text-[12px] font-semibold whitespace-nowrap" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.steel4 }}>{t.costoEstimado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: C.border }}>
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "IBM Plex Sans, sans-serif" }}>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, costoPorTramiteFilas.length)} de {costoPorTramiteFilas.length}
            </span>
            <div className="flex gap-2">
              {[...Array(pageCount)].map((_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: "none",
                    backgroundColor: i === page ? C.steel4 : C.border,
                    color: i === page ? "white" : C.textMuted,
                    fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImpactoEconomico;
