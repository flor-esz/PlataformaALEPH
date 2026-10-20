// Marco común de las pantallas rediseñadas: barra superior, encabezado con
// degradado (título, nivel de visualización, filtros, cifras) y pie de página.
import React, { useState } from "react";
import { I, Icon } from "./icons";
import { InfoBtn } from "./info";
import { Dd, Fseg } from "./ui";
import type { HeroFilter, HeroStat, PaisRef } from "./types";
import "../../styles/editorial-screens.css";

export interface PageShellProps {
  eyebrow: string;
  /** Título en dos pesos: `t1` (ligero) + `t2` (grueso). */
  t1: string;
  t2: string;
  intro: string;
  infoKey: string;
  stats: HeroStat[];
  /** Pantallas con nivel regional / por país (Panorama, Barreras, Trámites). Las demás no lo pasan. */
  country?: string;
  paises?: PaisRef[];
  onCountryChange?: (c: string) => void;
  filtros?: HeroFilter[];
  /** Pantallas sin nivel regional / por país (Costeo, IDR, Reportes): sin «Vista …» ni país en la ruta. */
  sinNivel?: boolean;
  /** Controles propios del encabezado (reemplazan «Nivel de visualización» y país). `null` = sin controles. */
  controls?: React.ReactNode | null;
  /** Ruta antes del título (por defecto «Tableros»). Un elemento con `onClick` es un enlace
   *  (pantallas internas: «Barreras regulatorias › Listado de barreras › Detalle…»). */
  rastro?: (string | { label: string; onClick: () => void })[];
  /** Encabezado propio (pantallas internas: ficha y listado). Reemplaza al encabezado estándar
   *  (el pie se define con `pie`). */
  hero?: React.ReactNode;
  /** Contenido del pie (por defecto: última actualización y años incluidos). */
  pie?: React.ReactNode;
  /** Filtros de sector del encabezado cuando no se pasa `filtros` (el prototipo los muestra
   *  en Barreras regional y en Barreras/Trámites por país). Sin datos todavía: solo "Todos". */
  sectorFiltro?: "sector" | "sector+subsector";
  userInitials?: string;
  ultimaActualizacion?: string;
  anios?: string;
  children: React.ReactNode;
}

export function PageShell(props: PageShellProps) {
  const p = {
    ...props,
    country: props.country ?? "Todos",
    paises: props.paises ?? [],
    onCountryChange: props.onCountryChange ?? (() => {}),
  };
  const regional = p.country === "Todos";
  const [ultimoPais, setUltimoPais] = useState(
    regional ? p.paises[0]?.name : p.country,
  );
  const pickPais = (c: string) => {
    setUltimoPais(c);
    p.onCountryChange(c);
  };
  const conNivel = !p.sinNivel;

  const filtrosHero: HeroFilter[] =
    p.filtros ??
    (p.sectorFiltro
      ? [
          "Sector",
          ...(p.sectorFiltro === "sector+subsector" ? ["Subsector"] : []),
        ].map((label) => ({
          label,
          value: "Todos",
          options: [["Todos", "Todos"]] as [string, string][],
          onChange: () => {},
        }))
      : []);

  return (
    <div className="ed ed-root">
      <div className="main">
        <header className="top">
          <nav className="crumbs" aria-label="Ruta">
            {(p.rastro ?? ["Tableros"]).map((r) => (
              <React.Fragment key={typeof r === "string" ? r : r.label}>
                {typeof r === "string" ? (
                  <span>{r}</span>
                ) : (
                  <button type="button" className="crumb-l" onClick={r.onClick}>
                    {r.label}
                  </button>
                )}
                <span>/</span>
              </React.Fragment>
            ))}
            <b>{p.eyebrow}</b>
            {conNivel && !regional && (
              <>
                <span>/</span>
                <b>{p.country}</b>
              </>
            )}
          </nav>
          <div className="sp" />
          <div className="region">
            <Icon d={I.globe} cls="info" />
            América Latina y el Caribe
          </div>
          <button className="iconbtn" aria-label="Buscar" type="button">
            <Icon d={I.search} />
          </button>
          <button className="iconbtn" aria-label="Notificaciones" type="button">
            <Icon d={I.bell} />
          </button>
          <div className="avatar" aria-label="Usuario">
            {p.userInitials ?? "AM"}
          </div>
        </header>

        <main className="page zoned">
          {p.hero ?? (
            <div className="phead v-b">
              <div className="phead-row">
                <div
                  style={{
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                  }}
                >
                  <div>
                    <div className="eyebrow">
                      {p.eyebrow}
                      {conNivel &&
                        ` · Vista ${regional ? "regional" : "por país"}`}
                    </div>
                    <h1>
                      <span className="lite">{p.t1} </span>
                      {p.t2}
                      <InfoBtn k={p.infoKey} tone="dark" size="lg" />
                    </h1>
                    <p className="intro">{p.intro}</p>
                  </div>
                  {p.controls === null ? null : p.controls !== undefined ? (
                    <div className="controls">{p.controls}</div>
                  ) : (
                    <div className="controls">
                      <div
                        className="ctlrow on-dark"
                        role="group"
                        aria-label="Filtros de la vista"
                      >
                        <div className="cg">
                          <span className="clbl">Nivel de visualización</span>
                          <Fseg
                            tone="dark"
                            v={regional ? "Regional" : "Por país"}
                            items={["Regional", "Por país"]}
                            label="Nivel de visualización"
                            set={(k) =>
                              k === "Regional"
                                ? p.onCountryChange("Todos")
                                : pickPais(ultimoPais ?? p.paises[0]?.name)
                            }
                          />
                        </div>
                        {!regional && (
                          <div className="cg">
                            <span className="clbl">País</span>
                            <Dd
                              tone="dark"
                              value={p.country}
                              onChange={pickPais}
                              options={p.paises.map((c) => [c.name, c.name])}
                              label="Selecciona un país"
                            />
                          </div>
                        )}
                        {filtrosHero.map((f) => (
                          <div className="cg" key={f.label}>
                            <span className="clbl">{f.label}</span>
                            <Dd
                              tone="dark"
                              value={f.value}
                              onChange={f.onChange}
                              options={f.options}
                              label={f.label}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <dl className="klist">
                  {p.stats.map((s) => (
                    <div key={s[1]}>
                      <dt>
                        {s[1]}
                        {s[2] ? <InfoBtn k={s[2]} tone="dark" /> : null}
                      </dt>
                      <dd>{s[0]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {p.children}

          <div className="zone z-base z-foot">
            <div className="zi">
              <div className="foot-note">
                <Icon d={I.cal} />
                {p.pie !== undefined ? (
                  p.pie
                ) : (
                  <>
                    {p.ultimaActualizacion && (
                      <span>Última actualización: {p.ultimaActualizacion}</span>
                    )}
                    {p.ultimaActualizacion && p.anios && (
                      <span className="sep" />
                    )}
                    {p.anios && (
                      <span>Años incluidos en el análisis: {p.anios}</span>
                    )}
                  </>
                )}
                <a href="#notas">Notas metodológicas →</a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
