import { Download, ChevronDown } from "lucide-react";
import {
  C,
  Header,
  KpiCard,
  BandaCobertura,
  HDR_BTN_PRIMARY,
  HDR_BTN_SECONDARY,
  HDR_BTN_PILL,
  COUNTRIES,
  COUNTRY_DATA,
  COBERTURA_MUESTRA,
  JERARQUIA_NORMATIVA_DATA,
} from "./App";
import type { View, Country } from "./App";
import { BarrasComposicion } from "./components/ui/BarrasComposicion";
import type { BarrasComposicionCategoria } from "./components/ui/BarrasComposicion";
import { IrrGeneralCard } from "./components/ui/IrrGeneralCard";
import { EstadoProcesamientoPanel } from "./components/ui/EstadoProcesamientoPanel";

// ─── Panel Regional ─────────────────────────────────────────────────────────
// Vista agregada de los COUNTRIES.length países activos — punto de entrada de
// "Panorama Regulatorio" antes de anclar a un país específico (CountryDashboard).
function PanelRegional({ onNavigate }: { onNavigate: (v: View) => void }) {
  // Reutilizada por el <select> de país y por el botón "Ver panorama del
  // país →" de cada tarjeta — un solo lugar para la navegación a Panel País.
  const irAPanoramaDePais = (pais: Country) => onNavigate({ screen: "country-dashboard", country: pais });

  // ── KPIs fila 1 — calculados a partir de datos reales existentes ───────────
  const instrumentosAnalizados = JERARQUIA_NORMATIVA_DATA.reduce((sum, c) => sum + c.total, 0);
  const tramitesIdentificados = COUNTRIES.reduce((sum, pais) => sum + (COUNTRY_DATA[pais]?.tramites ?? 0), 0);

  // ── Instrumentos por jerarquía normativa — datos de MUESTRA, pendiente de
  // confirmar valores reales con Franco/Juanjo (solo cuadran en el total 1,842) ──
  // TODO: reemplazar por valores reales por nivel N2–N6 cuando estén disponibles.
  const jerarquiaCategorias: BarrasComposicionCategoria[] = [
    { nombre: "N2 Legislativo",            total: 210, componentes: [{ nombre: "N2 Legislativo",            valor: 210 }] },
    { nombre: "N3 Reglamentario",          total: 486, componentes: [{ nombre: "N3 Reglamentario",          valor: 486 }] },
    { nombre: "N4 Resolutivo / Agencias",  total: 512, componentes: [{ nombre: "N4 Resolutivo / Agencias",  valor: 512 }] },
    { nombre: "N5 Técnico-operativo",      total: 398, componentes: [{ nombre: "N5 Técnico-operativo",      valor: 398 }] },
    { nombre: "N6 Procedimental/Trámites", total: 236, componentes: [{ nombre: "N6 Procedimental/Trámites", valor: 236 }] },
  ];

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <Header
        breadcrumb="Panorama Regulatorio › Panel Regional"
        title="Panel Regional"
        actions={
          <>
            <button style={HDR_BTN_PILL} onClick={() => onNavigate({ screen: "tramites" })}>Ver trámites</button>
            <button style={HDR_BTN_PILL} onClick={() => onNavigate({ screen: "barreras" })}>Ver barreras</button>
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

      {/* Selector de país — lleva a Panel País, mismo destino que "Ver panorama
          del país →" en las tarjetas de abajo. "Todos los países" no navega. */}
      <div className="flex flex-wrap gap-2 mb-5">
        <select
          className="grow"
          style={{ fontFamily: "IBM Plex Sans, sans-serif", color: C.text, backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, outline: "none", cursor: "pointer", minHeight: 36 }}
          defaultValue="Todos los países"
          onChange={(e) => {
            const v = e.target.value;
            if (v !== "Todos los países") irAPanoramaDePais(v as Country);
          }}
        >
          <option value="Todos los países">Todos los países</option>
          {COUNTRIES.map(pais => <option key={pais} value={pais}>{pais}</option>)}
        </select>
      </div>

      <BandaCobertura text={`Cobertura regional: 86% de fuentes procesadas · Última actualización: 12 de marzo de 2026 · ${COUNTRIES.length} países activos`} />

      {/* KPIs fila 1 — datos reales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <KpiCard label="Países activos" value={String(COUNTRIES.length)} sub={COUNTRIES.join(", ")} />
        <KpiCard label="Instrumentos analizados" value={instrumentosAnalizados.toLocaleString("es")} sub="leyes, decretos, reglamentos" />
        <KpiCard label="Trámites identificados" value={tramitesIdentificados.toLocaleString("es")} sub="ciudadanos y empresariales" />
      </div>

      {/* KPIs fila 2 — dato de muestra, sin fuente real aún */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Fuentes oficiales identificadas" value="10" />
        <KpiCard label="Fuentes procesadas" value="7" />
        <KpiCard label="Entidades emisoras" value="20" />
        <KpiCard label="Sectores cubiertos" value="20" />
      </div>

      {/* IRR general + Estado de procesamiento — dato de muestra.
          TODO: 54.2 usa una escala 0–100 sin metodología definida todavía,
          mientras que el resto de la plataforma (KpiCard "IRR promedio" en
          BarrerasScreen, vía COUNTRY_BARRERAS_DATA[...].irrPromedio) usa una
          escala 1–4. Son dos escalas conviviendo — falta decidir cuál es la
          oficial para este dashboard antes de considerar el valor final. */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 items-stretch mb-6">
        <IrrGeneralCard valor={54.2} onVerDetalle={() => onNavigate({ screen: "indice" })} />
        <EstadoProcesamientoPanel
          etapas={[
            { nombre: "Analizados",    pct: 38, color: C.steel4 },
            { nombre: "Con metadatos", pct: 24, color: C.steel3 },
            { nombre: "Procesados",    pct: 20, color: C.steel2 },
            { nombre: "Scrapeados",    pct: 12, color: C.steel1 },
            { nombre: "Pendientes",    pct: 6,  color: C.border },
          ]}
        />
      </div>

      <BarrasComposicion
        label="Instrumentos por jerarquía normativa"
        total={1842}
        categorias={jerarquiaCategorias}
        className="mb-8"
      />

      {/* Países */}
      <p className="uppercase mb-3" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, color: C.textMuted }}>Países</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {COUNTRIES.map(pais => {
          const d = COUNTRY_DATA[pais];
          const instrumentos = JERARQUIA_NORMATIVA_DATA.find(c => c.nombre === pais)?.total ?? 0;
          const cobertura = COBERTURA_MUESTRA[pais as Exclude<Country, "Todos">];
          return (
            <div key={pais} className="rounded-lg" style={{ backgroundColor: C.card, padding: 18 }}>
              <p className="uppercase" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, color: C.text }}>{pais}</p>
              <p className="mb-3" style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 11, color: C.textMuted }}>
                {instrumentos.toLocaleString("es")} instrumentos · cobertura {cobertura}%
              </p>
              <div className="flex mb-4">
                <div className="flex-1">
                  <p className="font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, color: C.text }}>{d.barreras}</p>
                  <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10.5, color: C.textMuted }}>Barreras</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, color: C.text }}>{d.tramites}</p>
                  <p style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 10.5, color: C.textMuted }}>Trámites</p>
                </div>
              </div>
              <button
                className="w-full"
                style={{ backgroundColor: C.steel4, color: "white", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 600, borderRadius: 8, padding: 8, border: "none", cursor: "pointer" }}
                onClick={() => irAPanoramaDePais(pais)}
              >
                Ver panorama del país →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PanelRegional;
