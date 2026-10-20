import React, { useEffect, useState } from "react";
import { CardHead } from "./cardhead";
import { DEFS } from "./defs";
import { fmtInt } from "./format";
import { I, Icon } from "./icons";
import { InfoBtn } from "./info";
import { PageShell } from "./PageShell";
import { FX_SEVN, fxBuild, fxDur } from "./internas-data";
import type { PasoRuta } from "./TramitesListadoEditorial";
import { TR_G, T } from "./theme";
import type { TramFichaDatos, TramRow } from "./internas-data";

export interface TramiteFichaProps {
  /** Trámite que se muestra. */
  row: TramRow;
  /** Desde dónde se llegó: cambia el encabezado («Costeo» o «Trámites con potencial de mejora»). */
  ctx: "tramites" | "impacto";
  /** Datos reales de la ficha (actividades, cargas, norma…). Lo que falte se completa con valores de ejemplo. */
  detalle?: Partial<TramFichaDatos>;
  /** Ruta superior después de «Tableros» (cada paso con su enlace). */
  rastro: PasoRuta[];
  /** Texto del botón de volver y su acción. */
  backLabel: string;
  onBack: () => void;
  /** Muestra «Datos de ejemplo» en el pie (por defecto, sí). Con datos reales, pasar `false`. */
  esEjemplo?: boolean;
  /** Botón «Descargar ficha». */
  onDescargar?: () => void;
  /** Botón «Ir a Reportes». */
  onIrReportes?: () => void;
  userInitials?: string;
}

export function TramiteFichaEditorial({
  row,
  ctx,
  detalle,
  rastro,
  backLabel,
  onBack,
  esEjemplo = true,
  onDescargar,
  onIrReportes,
  userInitials,
}: TramiteFichaProps) {
  const F = { ...fxBuild(row), ...detalle },
    usd = (v) => "USD " + fmtInt(v);
  const kpi = (
    label: string,
    val: React.ReactNode,
    sm: string | null,
    desc: string,
    band: string,
    k: string,
  ) => (
    <div className="kpi">
      <span className="band" style={{ background: band }}></span>
      <div className="k">
        {label}
        <InfoBtn k={k} />
      </div>
      <div className="v fx-v">
        {val}
        {sm ? <small>{sm}</small> : null}
      </div>
      <div className="d">{desc}</div>
    </div>
  );
  const sevC = { 4: T.sev.Alta, 3: T.sev.Media, 2: "var(--ink-3)" };
  const hero = (
    <div className={"phead v-b"}>
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
            <button type="button" className="fx-back" onClick={onBack}>
              <Icon d={I.left} />
              {backLabel}
            </button>
            <div className="eyebrow">
              {ctx === "impacto"
                ? "Costeo"
                : "Trámites con potencial de mejora"}{" "}
              › Detalle del trámite
            </div>
            <h1>{row.k}</h1>
            <p className="intro">
              {row.ent} · {row.sec}
              {row.sub ? " / " + row.sub : ""}
            </p>
            <div className="fx-chips">
              <span className={F.prior ? "on" : ""}>
                {F.prior ? "Prioritario" : "No prioritario"}
              </span>
              <span>{row.eta}</span>
              <span>{row.usu}</span>
              <span>Severidad {row.sev.toLowerCase()}</span>
            </div>
          </div>
          <div className="fx-btns">
            <button
              type="button"
              className="btn on-dark solid"
              onClick={onDescargar}
            >
              <Icon d={I.down} />
              Descargar ficha
            </button>
            <button
              type="button"
              className="btn on-dark"
              onClick={onIrReportes}
            >
              Ir a Reportes <Icon d={I.arrow} />
            </button>
          </div>
        </div>
        <dl className="klist">
          <div>
            <dt>Costo estimado total</dt>
            <dd>{usd(row.tot)}</dd>
          </div>
          <div>
            <dt>Veces que se realiza al año</dt>
            <dd>{fmtInt(row.vol)}</dd>
          </div>
          <div>
            <dt>Última actualización</dt>
            <dd>15 sep 2026</dd>
          </div>
        </dl>
      </div>
    </div>
  );
  return (
    <PageShell
      eyebrow="Detalle del trámite"
      t1=""
      t2=""
      intro=""
      infoKey=""
      stats={[]}
      sinNivel
      controls={null}
      rastro={["Tableros", ...rastro]}
      userInitials={userInitials}
      hero={hero}
      pie={
        <>
          <span>Última actualización: 15 de septiembre de 2026</span>
          {esEjemplo ? (
            <>
              <span className="sep" />
              <span>Datos de ejemplo</span>
            </>
          ) : null}
        </>
      }
    >
      <section className={"zone z-base"} aria-label="Ficha del trámite">
        <div className="zi">
          <div className="fx-kpis">
            {kpi(
              "Tiempo promedio",
              fxDur(F.min),
              null,
              "tiempo activo del usuario",
              "var(--primary)",
              "fxt",
            )}
            {kpi(
              "Plazo de resolución",
              String(F.plazo),
              "días hábiles",
              "espera de la administración · " + usd(F.cop),
              "var(--primary)",
              "fxp",
            )}
            {kpi(
              "Frecuencia anual",
              F.fq[0],
              "(" + F.fq[1] + "/año)",
              "veces que se realiza al año",
              TR_G,
              "fxf",
            )}
            {kpi(
              "Carga total",
              usd(row.cu * F.fq[1]),
              "/año",
              "por usuario · simulado",
              TR_G,
              "fxc",
            )}
            {kpi(
              "Costo monetario",
              usd(row.cu),
              "/ vez",
              "por cada vez que se realiza · simulado",
              "var(--primary)",
              "fxm",
            )}
          </div>
          <div className="fx-cols">
            <section className="card">
              <CardHead title="Actividades estándar" def={DEFS.fxact} />
              <ol className="fx-steps" style={{ "--fc": T.sev.Alta }}>
                {F.acts.map((a) => (
                  <li key={a.n} className={"fx-step" + (a.fr ? " fr" : "")}>
                    <span className="fx-n" aria-hidden="true">
                      {a.n}
                    </span>
                    <div className="fx-sb">
                      <div className="fx-st">
                        <b>
                          {a.fr ? (
                            <span
                              className="fx-w"
                              role="img"
                              aria-label="Con fricción"
                            >
                              <Icon d={I.alert} />
                            </span>
                          ) : null}
                          {a.k}
                        </b>
                        <span className="fx-chs">
                          <span className="fx-ch">{fxDur(a.min)}</span>
                          <span className="fx-ch u">{usd(a.usd)}</span>
                        </span>
                      </div>
                      <p>{a.d}</p>
                      {a.fr ? (
                        <div className="fx-fr">
                          <div className="fx-fl">Fricción identificada</div>
                          <p>{a.fr.f}</p>
                          <div className="fx-fl a">
                            Acción de simplificación
                          </div>
                          <p>{a.fr.a}</p>
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
              <p className="fnote">
                Datos de ejemplo. Tiempos y costos simulados con el Costeo
                Estándar; la suma de las actividades corresponde al tiempo
                activo (CA) del trámite.
              </p>
            </section>
            <div className="fx-side">
              <section className="card">
                <CardHead title="Diagnóstico global" noInfo={true} />
                <p className="fx-p">{F.diag}</p>
              </section>
              <section className="card">
                <CardHead
                  title={"Distorsiones de carga (" + F.cargas.length + ")"}
                  def={DEFS.fxcar}
                />
                {F.cargas.length ? (
                  <ul className="fx-cl">
                    {F.cargas.map((c) => (
                      <li key={c.id}>
                        <div className="fx-ct">
                          <span className="fx-id">{c.id}</span>
                          <span className="tag">{c.eje}</span>
                          <span className="fx-sv" style={{ color: sevC[c.n] }}>
                            {c.n} · {FX_SEVN[c.n]}
                          </span>
                        </div>
                        <b>{c.t}</b>
                        <span className="csub" style={{ margin: 0 }}>
                          {c.s}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="fx-p">
                    Sin distorsiones de carga asociadas a este trámite.
                  </p>
                )}
              </section>
              <section className="card">
                <CardHead title="Respaldo normativo" noInfo={true} />
                <dl className="fx-dl">
                  <dt>Instrumento</dt>
                  <dd>{F.norma}</dd>
                  <dt>Artículo</dt>
                  <dd>{F.art}</dd>
                  <dt>Entidad</dt>
                  <dd>{row.ent}</dd>
                  <dt>Fuente</dt>
                  <dd>{F.fuente}</dd>
                </dl>
              </section>
              <section className="card">
                <CardHead title="Validación" noInfo={true} />
                <dl className="fx-dl stk">
                  <dt>Estado</dt>
                  <dd>
                    <span
                      className={
                        "pill fx-val " +
                        (F.val === "Validado" || F.val === "Publicado"
                          ? "ok"
                          : "")
                      }
                    >
                      {F.val}
                    </span>
                  </dd>
                  <dt>Retroalimentación de gobierno</dt>
                  <dd className="fx-none">Sin retroalimentación de gobierno</dd>
                </dl>
              </section>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
