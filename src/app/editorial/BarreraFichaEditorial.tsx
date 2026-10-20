import React, { useEffect, useState } from "react";
import { CardHead } from "./cardhead";
import { DEFS } from "./defs";
import { fmtInt } from "./format";
import { I, Icon } from "./icons";
import { InfoBtn } from "./info";
import { PageShell } from "./PageShell";
import { Mejora, SevPill } from "./ui";
import { bfBuild } from "./internas-data";
import type { PasoRuta } from "./TramitesListadoEditorial";
import { T } from "./theme";
import type { BarFichaDatos, BarRow } from "./internas-data";

export interface BarreraFichaProps {
  /** Barrera que se muestra. */
  row: BarRow;
  /** Datos reales de la ficha (texto normativo, diagnóstico, validación…). Lo que falte se completa con valores de ejemplo. */
  detalle?: Partial<BarFichaDatos>;
  /** Ruta superior después de «Tableros». */
  rastro: PasoRuta[];
  backLabel: string;
  onBack: () => void;
  /** «Enviar a backlog»: se avisa del cambio (queda marcada como enviada en la pantalla). */
  onBacklog?: (enviada: boolean) => void;
  /** Muestra «Datos de ejemplo» en el pie (por defecto, sí). Con datos reales, pasar `false`. */
  esEjemplo?: boolean;
  /** Botón «Descargar ficha». */
  onDescargar?: () => void;
  /** Botón «Ir a Reportes». */
  onIrReportes?: () => void;
  userInitials?: string;
}

export function BarreraFichaEditorial({
  row,
  detalle,
  rastro,
  backLabel,
  onBack,
  onBacklog,
  esEjemplo = true,
  onDescargar,
  onIrReportes,
  userInitials,
}: BarreraFichaProps) {
  const F = { ...bfBuild(row), ...detalle };
  const [sent, setSent] = useState(false);
  const dl = (rows: [string, React.ReactNode][], stk?: boolean) => (
    <dl className={"fx-dl bf-dl" + (stk ? " stk" : "")}>
      {rows.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
  const eje = row.eje === "Entrada" ? T.entrada : T.operacion;
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
              Barreras regulatorias › Detalle de la barrera
            </div>
            <h1>{row.k}</h1>
            <p className="intro">
              {row.sec}
              {row.sub ? " / " + row.sub : ""} · {row.pais}
            </p>
            <div className="fx-chips">
              <span className="on">Severidad {row.sev.toLowerCase()}</span>
              <span>{row.eje}</span>
              <span>{row.amb}</span>
              <span>{F.val}</span>
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
            <dt>ID del hallazgo</dt>
            <dd style={{ fontSize: 20 }}>{row.id}</dd>
          </div>
          <div>
            <dt>Año del instrumento</dt>
            <dd>{row.anio}</dd>
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
      eyebrow="Detalle de la barrera"
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
      <section className={"zone z-base"} aria-label="Ficha de la barrera">
        <div className="zi">
          <div className="fx-cols bf-cols">
            <div className="fx-side">
              <section className="card bf-norm">
                <div className="bf-nh">
                  <div>
                    <div className="bf-k">Texto normativo de origen</div>
                    <b>
                      {row.reg} · {row.ent}
                    </b>
                  </div>
                  <div className="bf-meta">
                    Jerarquía: {F.jerarquia}
                    <br />
                    {row.pais} · {row.anio}
                  </div>
                </div>
                <div className="bf-art">
                  {F.texto ? (
                    <p>
                      {F.texto.antes}
                      <mark>{F.texto.resaltado}</mark>
                      {F.texto.despues}
                    </p>
                  ) : (
                    <>
                      <span className="bf-ej">texto de muestra</span>
                      <p>
                        Artículo {F.art}. — Disposiciones aplicables a{" "}
                        {row.sec.toLowerCase()}.
                      </p>
                      <p>
                        <mark>{F.hl}</mark>
                        {F.rest}
                      </p>
                      <p>{F.fin}</p>
                    </>
                  )}
                </div>
              </section>
              <section className="card">
                <CardHead title="Diagnóstico económico" noInfo={true} />
                <p className="fx-p">{F.dx}</p>
              </section>
            </div>
            <div className="fx-side">
              <section className="card">
                <CardHead title="Identificación" noInfo={true} />
                {dl([
                  ["ID del hallazgo", row.id],
                  ["Instrumento", row.reg],
                  ["Enlace oficial", <span className="bf-link">{F.link}</span>],
                  ["Entidad", row.ent],
                  ["Jerarquía", F.jerarquia],
                ])}
              </section>
              <section className="card">
                <CardHead title="Clasificación" noInfo={true} />
                {dl([
                  [
                    "Clasificación",
                    <span
                      className="pill"
                      style={{ background: eje + "1f", color: "var(--ink)" }}
                    >
                      <i style={{ background: eje }}></i>
                      {row.eje}
                    </span>,
                  ],
                  ["Canal de transmisión", row.amb],
                  ["Tipo de restricción", F.restr],
                  ["Etapa del ciclo de vida", F.etapa],
                  ["Sector", row.sec],
                  ["Severidad", <SevPill s={row.sev} />],
                  ["Año", String(row.anio)],
                  ["Afectación MIPYME", F.mip],
                ])}
              </section>
              <section className="card">
                <CardHead title="Validación" noInfo={true} />
                {dl(
                  [
                    ["Severidad IA", F.sevIA],
                    ["Severidad validada", F.sevVal],
                    [
                      "Estado de validación",
                      <span
                        className={
                          "pill fx-val " +
                          (F.val === "Validado" || F.val === "Publicado"
                            ? "ok"
                            : "")
                        }
                      >
                        {F.val}
                      </span>,
                    ],
                    ["Comentario del BID", F.cBID],
                    ["Comentario del consultor", F.cCons],
                    ["Retroalimentación de gobierno", F.cGob],
                  ],
                  true,
                )}
              </section>
              <section className="card">
                <CardHead title="Acción de mejora" noInfo={true} />
                {dl(
                  [
                    ["Acción sugerida", <Mejora t={row.acc} />],
                    ["Tipo de cambio requerido", F.cambio],
                    ["Prioridad", F.prior],
                    ["Factibilidad", F.fact],
                  ],
                  true,
                )}
                <div>
                  <button
                    type="button"
                    className={"btn" + (sent ? "" : " primary")}
                    onClick={() => {
                      setSent(!sent);
                      onBacklog?.(!sent);
                    }}
                    aria-pressed={sent}
                  >
                    {sent ? "Enviada al backlog" : "Enviar a backlog"}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
