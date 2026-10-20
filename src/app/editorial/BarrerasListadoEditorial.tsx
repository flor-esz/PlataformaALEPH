import React, { useEffect, useState } from "react";
import { CardHead } from "./cardhead";
import { DEFS } from "./defs";
import { fmtInt } from "./format";
import { I, Icon } from "./icons";
import { InfoBtn } from "./info";
import { PageShell } from "./PageShell";
import { Dd, Mejora, SevPill } from "./ui";
import type { PasoRuta } from "./TramitesListadoEditorial";
import { SEVS, T } from "./theme";
import type { BarRow } from "./internas-data";

/** Lo que el usuario dejó en el listado (se conserva al abrir una ficha y volver). */
export interface BarListadoEstado {
  q: string;
  f: { sec: string; eje: string; amb: string; ent: string; sev: string };
  ord: string;
  pg: number;
}

export interface BarrerasListadoProps {
  /** Filas del listado (con datos reales, las del catálogo; por defecto, de ejemplo). */
  rows: BarRow[];
  /** País del listado (se muestra en el encabezado). */
  country: string;
  /** Total real de barreras (para la nota «Datos de ejemplo…»). */
  totalReal: number;
  /** Ruta superior después de «Tableros». */
  rastro: PasoRuta[];
  backLabel: string;
  onBack: () => void;
  /** Clic en una fila. */
  onOpen: (r: BarRow) => void;
  /** Estado inicial y aviso de cambios, para conservar filtros y página al volver de una ficha. */
  estado?: BarListadoEstado;
  onEstado?: (e: BarListadoEstado) => void;
  /** Muestra «Datos de ejemplo» en el pie (por defecto, sí). Con datos reales, pasar `false`. */
  esEjemplo?: boolean;
  /** Botón «Descargar Excel de barreras». */
  onDescargar?: () => void;
  /** Botón «Ir a Reportes». */
  onIrReportes?: () => void;
  userInitials?: string;
}

const p2 = (a: string, b: string) => (
  <>
    <span className="lite">{a}</span>
    {b}
  </>
);

export function BarrerasListadoEditorial({
  rows,
  country,
  totalReal,
  rastro,
  backLabel,
  onBack,
  onOpen,
  estado,
  onEstado,
  esEjemplo = true,
  onDescargar,
  onIrReportes,
  userInitials,
}: BarrerasListadoProps) {
  const PS = 10;
  const [q, setQ] = useState(estado?.q ?? ""),
    [f, setF] = useState(
      estado?.f ?? {
        sec: "Todos",
        eje: "Todos",
        amb: "Todos",
        ent: "Todos",
        sev: "Todos",
      },
    ),
    [ord, setOrd] = useState(estado?.ord ?? "sev"),
    [pg, setPg] = useState(estado?.pg ?? 0);
  /* Avisa el estado (búsqueda, filtros, orden, página) para conservarlo al volver desde una ficha. */
  useEffect(() => {
    onEstado?.({ q, f, ord, pg });
  }, [q, f, ord, pg]);
  const setFk = (k) => (v) => {
    setF((x) => ({ ...x, [k]: v }));
    setPg(0);
  };
  const uq = (k, all) => [
    ["Todos", all],
    ...[...new Set(rows.map((r) => r[k]))]
      .sort((a, b) => a.localeCompare(b, "es"))
      .map((v) => [v, v]),
  ];
  const ql = q.trim().toLowerCase();
  const flt = rows.filter(
    (r) =>
      (!ql || r.k.toLowerCase().includes(ql)) &&
      (f.sec === "Todos" || r.sec === f.sec) &&
      (f.eje === "Todos" || r.eje === f.eje) &&
      (f.amb === "Todos" || r.amb === f.amb) &&
      (f.ent === "Todos" || r.ent === f.ent) &&
      (f.sev === "Todos" || r.sev === f.sev),
  );
  const srt = flt
    .slice()
    .sort(
      ord === "az"
        ? (a, b) => a.k.localeCompare(b.k, "es")
        : (a, b) =>
            SEVS.indexOf(a.sev) - SEVS.indexOf(b.sev) ||
            a.k.localeCompare(b.k, "es"),
    );
  const pages = Math.max(1, Math.ceil(srt.length / PS)),
    cur = Math.min(pg, pages - 1),
    vis = srt.slice(cur * PS, cur * PS + PS);
  const key = (r) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(r);
    }
  };
  const clear = () => {
    setQ("");
    setF({
      sec: "Todos",
      eje: "Todos",
      amb: "Todos",
      ent: "Todos",
      sev: "Todos",
    });
    setPg(0);
  };
  const dirty = ql || Object.values(f).some((v) => v !== "Todos");
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
              Barreras regulatorias › Listado completo
            </div>
            <h1>{p2("Todas las ", "barreras")}</h1>
            <p className="intro">
              Todas las barreras identificadas, con su tipo, canal de
              transmisión, severidad y acción sugerida. Selecciona una barrera
              para ver su ficha completa.
            </p>
            <div className="fx-chips">
              <span>País: {country}</span>
            </div>
          </div>
          <div className="fx-btns">
            <button
              type="button"
              className="btn on-dark solid"
              onClick={onDescargar}
            >
              <Icon d={I.down} />
              Descargar Excel de barreras
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
            <dt>Barreras en el listado</dt>
            <dd>{fmtInt(rows.length)}</dd>
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
      eyebrow="Listado de barreras"
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
      <section className={"zone z-base"} aria-label="Listado de barreras">
        <div className="zi">
          <section className="card">
            <div
              className="ctlrow fx-f"
              role="group"
              aria-label="Filtros del listado"
            >
              <div className="cg">
                <span className="clbl clbl-t">Buscar</span>
                <input
                  type="search"
                  className="fx-search"
                  placeholder="Nombre de la barrera"
                  aria-label="Buscar barrera por nombre"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPg(0);
                  }}
                />
              </div>
              <div className="cg">
                <span className="clbl clbl-t">Sector</span>
                <Dd
                  value={f.sec}
                  onChange={setFk("sec")}
                  options={uq("sec", "Todos")}
                  label="Sector económico"
                />
              </div>
              <div className="cg">
                <span className="clbl clbl-t">Tipo</span>
                <Dd
                  value={f.eje}
                  onChange={setFk("eje")}
                  options={uq("eje", "Todos")}
                  label="Tipo de barrera"
                />
              </div>
              <div className="cg">
                <span className="clbl clbl-t">Canal</span>
                <Dd
                  value={f.amb}
                  onChange={setFk("amb")}
                  options={uq("amb", "Todos")}
                  label="Canal de transmisión"
                />
              </div>
              <div className="cg">
                <span className="clbl clbl-t">Entidad</span>
                <Dd
                  value={f.ent}
                  onChange={setFk("ent")}
                  options={uq("ent", "Todas")}
                  label="Entidad"
                />
              </div>
              <div className="cg">
                <span className="clbl clbl-t">Severidad</span>
                <Dd
                  value={f.sev}
                  onChange={setFk("sev")}
                  options={[["Todos", "Todas"], ...SEVS.map((s) => [s, s])]}
                  label="Severidad"
                />
              </div>
              <div className="cg">
                <span className="clbl clbl-t">Ordenar por</span>
                <Dd
                  value={ord}
                  onChange={(v) => {
                    setOrd(v);
                    setPg(0);
                  }}
                  options={[
                    ["sev", "Mayor severidad"],
                    ["az", "Nombre (A–Z)"],
                  ]}
                  label="Ordenar barreras por"
                />
              </div>
            </div>
            <div className="fx-count" aria-live="polite">
              <b>{fmtInt(flt.length)}</b>{" "}
              {flt.length === 1 ? "barrera" : "barreras"}
              {dirty ? (
                <>
                  {" "}
                  ·{" "}
                  <button type="button" className="btn ghost" onClick={clear}>
                    Limpiar filtros
                  </button>
                </>
              ) : null}
            </div>
            <div className="tablewrap">
              <table className="tight">
                <thead>
                  <tr>
                    <th>Barrera</th>
                    <th>Sector / Subsector</th>
                    <th>
                      Tipo
                      <InfoBtn k="tipo" />
                    </th>
                    <th>
                      Canal de transmisión
                      <InfoBtn k="amb" />
                    </th>
                    <th>Regulación</th>
                    <th>Entidad</th>
                    <th>
                      Severidad
                      <InfoBtn k="sev" />
                    </th>
                    <th>
                      Acción sugerida
                      <InfoBtn k="accion" />
                    </th>
                    <th className="go">
                      <span className="sr">Ver ficha</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vis.length ? (
                    vis.map((r) => (
                      <tr
                        key={r.k}
                        className="rowlink"
                        tabIndex={0}
                        title="Ver la ficha de la barrera"
                        onClick={() => onOpen(r)}
                        onKeyDown={key(r)}
                      >
                        <td className="main">{r.k}</td>
                        <td>
                          {r.sec}
                          {r.sub ? " / " + r.sub : ""}
                        </td>
                        <td>
                          <span
                            className="pill"
                            style={{
                              background:
                                (r.eje === "Entrada"
                                  ? T.entrada
                                  : T.operacion) + "1f",
                              color: "var(--ink)",
                            }}
                          >
                            <i
                              style={{
                                background:
                                  r.eje === "Entrada" ? T.entrada : T.operacion,
                              }}
                            ></i>
                            {r.eje}
                          </span>
                        </td>
                        <td>{r.amb}</td>
                        <td>{r.reg}</td>
                        <td>{r.ent}</td>
                        <td>
                          <SevPill s={r.sev} />
                        </td>
                        <td>
                          <Mejora t={r.acc} />
                        </td>
                        <td className="go" aria-hidden="true">
                          <Icon d={I.arrow} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="main">
                        No hay barreras con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="fx-pager">
              <span className="csub" style={{ margin: 0 }}>
                {flt.length
                  ? "Mostrando " +
                    (cur * PS + 1) +
                    "–" +
                    Math.min(flt.length, cur * PS + PS) +
                    " de " +
                    fmtInt(flt.length)
                  : ""}
              </span>
              <div className="fx-pg">
                <button
                  type="button"
                  className="btn"
                  disabled={cur === 0}
                  onClick={() => setPg(cur - 1)}
                >
                  Anterior
                </button>
                <span>
                  Página {cur + 1} de {pages}
                </span>
                <button
                  type="button"
                  className="btn"
                  disabled={cur >= pages - 1}
                  onClick={() => setPg(cur + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
            <p className="fnote">
              {esEjemplo ? "Datos de ejemplo: se" : "Se"} muestran{" "}
              {fmtInt(rows.length)} barreras; el listado definitivo incluirá las{" "}
              {fmtInt(totalReal)} barreras identificadas.
            </p>
          </section>
        </div>
      </section>
    </PageShell>
  );
}
