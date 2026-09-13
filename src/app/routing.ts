// ─── Mapeo View ↔ URL ───────────────────────────────────────────────────────
//
// Dos funciones puras (sin efectos, sin leer window.*) que traducen el estado
// de navegación `View` (App.tsx) hacia/desde un pathname + query string
// "relativos a la app" -- es decir, SIN el prefijo de deploy de GitHub Pages
// (`/PlataformaALEPH`, ver `base` en vite.config.ts). Anteponer/quitar ese
// prefijo es responsabilidad de quien llama (App.tsx, en los 3 puntos de
// integración: montaje, navigate(), listener de popstate) usando
// `import.meta.env.BASE_URL` -- así estas dos funciones se pueden probar o
// reusar sin depender de dónde queda deployada la app.
//
// `viewToUrl` es total (cubre las 29 variantes reales del tipo `View` de
// App.tsx, ninguna lista aparte). `urlToView` es parcial a propósito: devuelve
// `null` ante cualquier ruta que no reconoce, para que quien llama caiga al
// View por default (ver AppInner en App.tsx) en vez de reventar.
//
// ─── Tabla de referencia (mantener sincronizada con los `case` de abajo) ───
//
//   panel-regional                                → /panorama
//   country-dashboard {country}                   → /panorama/pais/:country
//   impacto-economico                             → /impacto-economico
//   barreras {sector?}                             → /barreras[/pais/:country][?sector=]
//   barrera-detail {id}                            → /barreras/detalle/:id
//   tramites {sector?}                             → /tramites[/pais/:country][?sector=]
//   tramite-detail {id}                            → /tramites/detalle/:id
//   distorsion-detail {id}                         → /distorsiones/detalle/:id
//   placeholder {label}                            → /placeholder?label=
//   administracion {tab?}                          → /administracion/:tab (default "usuarios")
//   reportes {prefill?}                            → /reportes[?prefill=<JSON codificado>]
//   reporte-pdf {context?}                         → /reportes/pdf[?context=]
//   documentacion                                  → /documentacion
//   revision-repositorio                           → /validacion-hitl/hallazgos
//   revision-triage-modales                        → /validacion-hitl/triage-modales
//   revision-asesor-detalle {id}                   → /validacion-hitl/asesor/:id
//   revision-analista-checklist {id}                → /validacion-hitl/analista/:id
//   revision-decision-final {id}                    → /validacion-hitl/decision-final/:id
//   revision-ajuste {id}                            → /validacion-hitl/ajuste/:id
//   revision-devolver-analista {id}                 → /validacion-hitl/devolver-analista/:id
//   revision-ver-hallazgo {id}                      → /validacion-hitl/ver/:id
//   revision-log-errores                            → /validacion-hitl/log-errores
//   revision-log-errores-detalle {id}               → /validacion-hitl/log-errores/:id
//   revision-indicadores                            → /validacion-hitl/indicadores
//   revision-notificaciones                         → /validacion-hitl/notificaciones
//   indice                                          → /indice-idr
//   hallazgos-filtrados {filtros}                   → /hallazgos-filtrados?<filtros como query>
//   hallazgos-filtrados-barreras {filtros}          → /hallazgos-filtrados/barreras?<filtros>
//   hallazgos-filtrados-tramites {filtros}          → /hallazgos-filtrados/tramites?<filtros>
//
// `activeCountry` (Barreras/Trámites) NO es parte del tipo `View` -- vive
// aparte, como estado de AppInner. Por eso viewToUrl() recibe un segundo
// argumento opcional `activeCountry` (solo usado por los casos "barreras" y
// "tramites"; el resto lo ignora) en vez de duplicar ese estado acá, y
// urlToView() devuelve `{ view, country? }` en vez de solo `View` -- `country`
// viaja aparte porque no es parte de ningún `View` posible, así que no hay
// forma de "meterlo" en el View devuelto sin inventarle un campo que no
// existe. Quien llama (App.tsx) usa `country` para inicializar/actualizar
// `activeCountry` en el mismo momento en que usa `view` para `setView`.
//
// Ajustes respecto de las convenciones sugeridas en la tarea (documentados
// acá porque la tarea pidió avisar cualquier desvío):
//   - `revision-log-errores-detalle` está en el tipo `View` y en la tabla de
//     abajo por completitud, pero HOY no lo dispara ningún `navigate()` ni
//     tiene `case` en el switch de `renderView()` de App.tsx (RevisionLogErrores
//     maneja el detalle con estado local, no con un View propio) -- es decir,
//     la ruta existe pero está inalcanzable desde la UI actual. No se tocó
//     ese comportamiento preexistente, solo se documenta.
//   - `/validacion-hitl` a secas (sin sub-segmento) también resuelve a
//     revision-repositorio en `urlToView` (alias de conveniencia, mismo
//     criterio que el botón "Validación HITL" del sidebar), aunque
//     `viewToUrl` siempre emite la forma canónica `/validacion-hitl/hallazgos`.

import type { View, ReportesPrefill } from "./App";

// País ↔ slug de URL -- lista fija (5 países reales), no un normalizador
// genérico de acentos: así `urlToView` puede devolver `null` con confianza
// ante cualquier valor que no sea uno de estos 5, en vez de adivinar.
const COUNTRY_TO_SLUG: Record<string, string> = {
  Argentina: "argentina",
  Bolivia: "bolivia",
  Chile: "chile",
  Ecuador: "ecuador",
  "Perú": "peru",
};
const SLUG_TO_COUNTRY: Record<string, string> = {
  argentina: "Argentina",
  bolivia: "Bolivia",
  chile: "Chile",
  ecuador: "Ecuador",
  peru: "Perú",
};

function withQuery(path: string, params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") usp.set(k, v);
  }
  const qs = usp.toString();
  return qs ? `${path}?${qs}` : path;
}

// `activeCountry` es opcional y SOLO se usa para "barreras"/"tramites" (el
// único lugar donde el país activo entra en la URL sin ser parte del View) --
// se ignora en cualquier otro `view.screen`. "Todos" (o no pasarlo) se
// traduce en la ruta corta sin segmento de país, igual que antes.
export function viewToUrl(view: View, activeCountry?: string): string {
  const paisSegment = activeCountry && activeCountry !== "Todos"
    ? `/pais/${COUNTRY_TO_SLUG[activeCountry] ?? encodeURIComponent(activeCountry.toLowerCase())}`
    : "";
  switch (view.screen) {
    case "panel-regional": return "/panorama";
    case "country-dashboard": return `/panorama/pais/${COUNTRY_TO_SLUG[view.country] ?? encodeURIComponent(view.country.toLowerCase())}`;
    case "impacto-economico": return "/impacto-economico";
    case "barreras": return withQuery(`/barreras${paisSegment}`, { sector: view.sector });
    case "barrera-detail": return `/barreras/detalle/${encodeURIComponent(view.id)}`;
    case "tramites": return withQuery(`/tramites${paisSegment}`, { sector: view.sector });
    case "tramite-detail": return `/tramites/detalle/${encodeURIComponent(view.id)}`;
    case "distorsion-detail": return `/distorsiones/detalle/${encodeURIComponent(view.id)}`;
    case "placeholder": return withQuery("/placeholder", { label: view.label });
    case "administracion": return `/administracion/${view.tab ?? "usuarios"}`;
    case "reportes": return withQuery("/reportes", { prefill: view.prefill ? JSON.stringify(view.prefill) : undefined });
    case "reporte-pdf": return withQuery("/reportes/pdf", { context: view.context });
    case "documentacion": return "/documentacion";
    case "revision-repositorio": return "/validacion-hitl/hallazgos";
    case "revision-triage-modales": return "/validacion-hitl/triage-modales";
    case "revision-asesor-detalle": return `/validacion-hitl/asesor/${encodeURIComponent(view.id)}`;
    case "revision-analista-checklist": return `/validacion-hitl/analista/${encodeURIComponent(view.id)}`;
    case "revision-decision-final": return `/validacion-hitl/decision-final/${encodeURIComponent(view.id)}`;
    case "revision-ajuste": return `/validacion-hitl/ajuste/${encodeURIComponent(view.id)}`;
    case "revision-devolver-analista": return `/validacion-hitl/devolver-analista/${encodeURIComponent(view.id)}`;
    case "revision-ver-hallazgo": return `/validacion-hitl/ver/${encodeURIComponent(view.id)}`;
    case "revision-log-errores": return "/validacion-hitl/log-errores";
    case "revision-log-errores-detalle": return `/validacion-hitl/log-errores/${encodeURIComponent(view.id)}`;
    case "revision-indicadores": return "/validacion-hitl/indicadores";
    case "revision-notificaciones": return "/validacion-hitl/notificaciones";
    case "indice": return "/indice-idr";
    // notaCalculo viaja como query param más -- mismo criterio que `sector`/
    // `context`: si no está, `withQuery` simplemente no la agrega.
    case "hallazgos-filtrados": return withQuery("/hallazgos-filtrados", { ...view.filtros, notaCalculo: view.notaCalculo });
    case "hallazgos-filtrados-barreras": return withQuery("/hallazgos-filtrados/barreras", { ...view.filtros, notaCalculo: view.notaCalculo });
    case "hallazgos-filtrados-tramites": return withQuery("/hallazgos-filtrados/tramites", { ...view.filtros, notaCalculo: view.notaCalculo });
  }
}

export type UrlToViewResult = { view: View; country?: string };

// `country` solo viene poblado cuando la ruta trae `/pais/:slug` -- HOY únicamente
// posible para "barreras"/"tramites" (ver viewToUrl arriba) y "country-dashboard"
// (que ya lo llevaba en su propio `view.country`, no como campo aparte de este
// resultado -- ese caso deja `country` sin definir a propósito, para no
// duplicar el mismo dato en dos lugares distintos del resultado).
export function urlToView(pathname: string, search: string): UrlToViewResult | null {
  const params = new URLSearchParams(search);
  const parts = pathname.split("/").filter(Boolean);
  const [seg0, seg1, seg2] = parts;
  if (!seg0) return null;
  const V = (view: View, country?: string): UrlToViewResult => ({ view, country });

  switch (seg0) {
    case "panorama":
      if (!seg1) return V({ screen: "panel-regional" });
      if (seg1 === "pais" && seg2) {
        const country = SLUG_TO_COUNTRY[seg2.toLowerCase()];
        return country ? V({ screen: "country-dashboard", country }) : null;
      }
      return null;

    case "impacto-economico":
      return V({ screen: "impacto-economico" });

    case "barreras": {
      const sector = params.get("sector") ?? undefined;
      if (!seg1) return V({ screen: "barreras", sector });
      if (seg1 === "detalle" && seg2) return V({ screen: "barrera-detail", id: decodeURIComponent(seg2) });
      if (seg1 === "pais" && seg2) {
        const country = SLUG_TO_COUNTRY[seg2.toLowerCase()];
        return country ? V({ screen: "barreras", sector }, country) : null;
      }
      return null;
    }

    case "tramites": {
      const sector = params.get("sector") ?? undefined;
      if (!seg1) return V({ screen: "tramites", sector });
      if (seg1 === "detalle" && seg2) return V({ screen: "tramite-detail", id: decodeURIComponent(seg2) });
      if (seg1 === "pais" && seg2) {
        const country = SLUG_TO_COUNTRY[seg2.toLowerCase()];
        return country ? V({ screen: "tramites", sector }, country) : null;
      }
      return null;
    }

    case "distorsiones":
      if (seg1 === "detalle" && seg2) return V({ screen: "distorsion-detail", id: decodeURIComponent(seg2) });
      return null;

    case "placeholder": {
      const label = params.get("label");
      return label ? V({ screen: "placeholder", label }) : null;
    }

    case "administracion":
      return V({ screen: "administracion", tab: seg1 ?? "usuarios" });

    case "reportes": {
      if (!seg1) {
        const raw = params.get("prefill");
        let prefill: ReportesPrefill | undefined;
        if (raw) {
          try { prefill = JSON.parse(raw) as ReportesPrefill; } catch { prefill = undefined; }
        }
        return V({ screen: "reportes", prefill });
      }
      if (seg1 === "pdf") return V({ screen: "reporte-pdf", context: params.get("context") ?? undefined });
      return null;
    }

    case "documentacion":
      return V({ screen: "documentacion" });

    case "validacion-hitl": {
      // Sin sub-segmento -- alias de conveniencia -> Hallazgos (ver nota arriba).
      if (!seg1 || seg1 === "hallazgos") return V({ screen: "revision-repositorio" });
      if (seg1 === "triage-modales") return V({ screen: "revision-triage-modales" });
      if (seg1 === "asesor" && seg2) return V({ screen: "revision-asesor-detalle", id: decodeURIComponent(seg2) });
      if (seg1 === "analista" && seg2) return V({ screen: "revision-analista-checklist", id: decodeURIComponent(seg2) });
      if (seg1 === "decision-final" && seg2) return V({ screen: "revision-decision-final", id: decodeURIComponent(seg2) });
      if (seg1 === "ajuste" && seg2) return V({ screen: "revision-ajuste", id: decodeURIComponent(seg2) });
      if (seg1 === "devolver-analista" && seg2) return V({ screen: "revision-devolver-analista", id: decodeURIComponent(seg2) });
      if (seg1 === "ver" && seg2) return V({ screen: "revision-ver-hallazgo", id: decodeURIComponent(seg2) });
      if (seg1 === "log-errores") return seg2 ? V({ screen: "revision-log-errores-detalle", id: decodeURIComponent(seg2) }) : V({ screen: "revision-log-errores" });
      if (seg1 === "indicadores") return V({ screen: "revision-indicadores" });
      if (seg1 === "notificaciones") return V({ screen: "revision-notificaciones" });
      return null;
    }

    case "indice-idr":
      return V({ screen: "indice" });

    case "hallazgos-filtrados": {
      // notaCalculo viaja en el mismo query string pero no es un filtro --
      // se separa antes de armar `filtros` para no agregar una columna/chip
      // fantasma con ese texto.
      const notaCalculo = params.get("notaCalculo") ?? undefined;
      const filtroParams = new URLSearchParams(params);
      filtroParams.delete("notaCalculo");
      const filtros = Object.fromEntries(filtroParams.entries());
      if (!seg1) return V({ screen: "hallazgos-filtrados", filtros, notaCalculo });
      if (seg1 === "barreras") return V({ screen: "hallazgos-filtrados-barreras", filtros, notaCalculo });
      if (seg1 === "tramites") return V({ screen: "hallazgos-filtrados-tramites", filtros, notaCalculo });
      return null;
    }

    default:
      return null;
  }
}
