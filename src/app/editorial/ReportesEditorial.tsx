// Reportes: configura y genera reportes estratégicos y operativos y bases en Excel. Es la única
// pantalla con los botones «Generar» y «Descargar» (decisión del BID). Sin nivel regional / por país:
// el país es un filtro más del alcance. Pantalla presentacional: `getData` da el conteo de registros
// (por defecto, datos de ejemplo) y `onGenerar` hace el trabajo real (descargar, abrir el PDF…);
// si devuelve un texto, se muestra como confirmación.
import React, { useState } from "react";
import { CardHead } from "./cardhead";
import { IMP_SECS } from "./costeo-data";
import { DEFS } from "./defs";
import { PAISES_BASE, YEARS } from "./fixtures";
import { fmtInt } from "./format";
import { Icon } from "./icons";
import { PageShell } from "./PageShell";
import {
  RP_ALL,
  RP_ENTS,
  RP_FMT,
  RP_TIPOS,
  RP_TYPES,
  RP_YEARS,
  rpData,
  rpPer,
} from "./reportes-data";
import { Dd, Fseg } from "./ui";
import type {
  ReporteConteo,
  ReporteFiltros,
  ReporteFormato,
  ReporteSeleccion,
  ReporteTipo,
} from "./types";

function ReportesBody({
  inicial,
  getConteo,
  onGenerar,
}: {
  inicial?: ReportesInicial;
  getConteo: (f: ReporteFiltros) => ReporteConteo;
  onGenerar?: (sel: ReporteSeleccion) => string | void;
}) {
  const t0: ReporteTipo = inicial?.tipo ?? "estrategico";
  const [grp, setGrp] = useState<string>(RP_TYPES[t0].g);
  const [type, setType] = useState<ReporteTipo>(t0);
  const [f, setF] = useState<ReporteFiltros>({
    ...RP_ALL,
    ...inicial?.filtros,
  });
  const [fmts, setFmts] = useState<ReporteFormato[]>([RP_TYPES[t0].fm[0]]);
  const [done, setDone] = useState<{ sig: string; msg: string } | null>(null);
  const R = RP_TYPES[type],
    D = getConteo(f);
  const set = (k: keyof ReporteFiltros) => (v: string) => {
    setF((s) => {
      const n = { ...s, [k]: v };
      if (k === "pais") n.ent = "Todos";
      if (n.desde > n.hasta) {
        if (k === "desde") n.hasta = n.desde;
        else n.desde = n.hasta;
      }
      return n;
    });
    setDone(null);
  };
  const pickType = (k: ReporteTipo) => {
    setType(k);
    setFmts([RP_TYPES[k].fm[0]]);
    setDone(null);
  };
  const pickGrp = (g: string) => {
    setGrp(g);
    pickType(
      (Object.keys(RP_TYPES) as ReporteTipo[]).find(
        (k) => RP_TYPES[k].g === g,
      )!,
    );
  };
  const toggleFmt = (x: ReporteFormato) => {
    if (!R.fm.includes(x)) return;
    setFmts((a) =>
      a.includes(x) ? (a.length > 1 ? a.filter((y) => y !== x) : a) : [...a, x],
    );
    setDone(null);
  };
  const isX = R.g === "Bases en Excel";
  const alc = [
    f.pais === "Todos" ? "6 países" : f.pais,
    f.sec === "Todos" ? "todos los sectores" : f.sec,
    f.ent === "Todos" ? "todas las entidades" : f.ent,
  ].join(" · ");
  const records =
    type === "xbar"
      ? fmtInt(D.nb) + " barreras"
      : type === "xtra"
        ? fmtInt(D.nt) + " trámites"
        : fmtInt(D.nb) + " barreras · " + fmtInt(D.nt) + " trámites";
  const sig = [type, fmts.join(), Object.values(f).join()].join("|");
  const genLbl =
    fmts.length === 1 && fmts[0] === "Excel"
      ? "Descargar Excel"
      : "Generar " + fmts.join(" + ");
  const gen = () => {
    const sel: ReporteSeleccion = {
      tipo: type,
      formatos: fmts,
      filtros: f,
      barreras: D.nb,
      tramites: D.nt,
    };
    const msg = onGenerar?.(sel);
    setDone({
      sig,
      msg:
        msg ||
        "Listo (simulación): se generaría «" +
          R.t +
          "» en " +
          fmts.join(" + ") +
          " con " +
          records.toLowerCase() +
          ".",
    });
  };
  const clear = () => {
    setF(RP_ALL);
    setFmts([R.fm[0]]);
    setDone(null);
  };
  const types = (Object.keys(RP_TYPES) as ReporteTipo[]).filter(
    (k) => RP_TYPES[k].g === grp,
  );
  const opt = (k: ReporteTipo) => {
    const o = RP_TYPES[k],
      on = type === k;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={on}
        key={k}
        className="rp-opt"
        onClick={() => pickType(k)}
      >
        <span className="rp-ck" aria-hidden="true">
          {on ? ck : null}
        </span>
        <span className="rp-ic" aria-hidden="true">
          <Icon d={o.ico} />
        </span>
        <b>{o.t}</b>
        <span className="rp-aud">{o.aud}</span>
        <span className="rp-d">{o.d}</span>
        <span className="rp-fm">{o.fm.join(" · ")}</span>
      </button>
    );
  };
  const dd = (
    k: keyof ReporteFiltros,
    label: string,
    options: [string, string][],
  ) => (
    <div className="cg">
      <span className="clbl clbl-t">{label}</span>
      <Dd value={f[k]} onChange={set(k)} options={options} label={label} />
    </div>
  );
  const todos = (arr: string[], t?: string): [string, string][] => [
    ["Todos", t || "Todos"],
    ...arr.map((x): [string, string] => [x, x]),
  ];
  const row = (a: string, b: React.ReactNode) => (
    <React.Fragment key={a}>
      <dt>{a}</dt>
      <dd>{b}</dd>
    </React.Fragment>
  );
  const ck = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
  return (
    <React.Fragment>
      <section className="zone z-base" aria-labelledby="r1">
        <div className="zi">
          <div className="sechead">
            <span className="num">1</span>
            <div>
              <h2 id="r1">Tipo de salida</h2>
              <p>Elige qué quieres generar</p>
            </div>
          </div>
          <div className="ctlrow" role="group" aria-label="Grupo de salidas">
            <div className="cg">
              <span className="clbl clbl-t">Salida</span>
              <Fseg
                v={grp}
                set={pickGrp}
                items={["Reportes", "Bases en Excel"]}
                label="Grupo de salidas"
              />
            </div>
          </div>
          <div
            className="rp-grid"
            role="radiogroup"
            aria-label="Tipo de salida"
          >
            {types.map(opt)}
          </div>
        </div>
      </section>

      <section className="zone z-alt" aria-labelledby="r2">
        <div className="zi">
          <div className="sechead">
            <span className="num">2</span>
            <div>
              <h2 id="r2">Alcance</h2>
              <p>
                País, sector económico, entidad, tipo de hallazgo, periodo,
                severidad
              </p>
            </div>
          </div>
          <section className="card">
            <div
              className="ctlrow rp-filters"
              role="group"
              aria-label="Filtros del alcance"
            >
              {dd("pais", "País", todos(PAISES_BASE.map((c) => c.name)))}
              {dd("sec", "Sector económico", todos(IMP_SECS))}
              {dd(
                "ent",
                "Entidad",
                todos(
                  f.pais === "Todos" ? [] : (RP_ENTS[f.pais] ?? []),
                  "Todas",
                ),
              )}
              {dd("tipo", "Tipo de hallazgo", todos(RP_TIPOS))}
              {dd(
                "desde",
                "Desde",
                RP_YEARS.map((y) => [y, y]),
              )}
              {dd(
                "hasta",
                "Hasta",
                RP_YEARS.map((y) => [y, y]),
              )}
              {dd(
                "sev",
                "Severidad",
                todos(["Alta", "Media", "Baja"], "Todas"),
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="zone z-base" aria-labelledby="r3">
        <div className="zi">
          <div className="sechead">
            <span className="num">3</span>
            <div>
              <h2 id="r3">Formato</h2>
              <p>El PDF es el formato por defecto para discusión externa</p>
            </div>
          </div>
          <section className="card">
            <div
              className="ctlrow rp-filters"
              role="group"
              aria-label="Formato"
            >
              <div className="cg">
                <span className="clbl clbl-t">Formato</span>
                <div
                  className="rp-chips"
                  role="group"
                  aria-label="Formatos de salida"
                >
                  {RP_FMT.map((x) => (
                    <button
                      type="button"
                      key={x}
                      className="rp-chip"
                      aria-pressed={fmts.includes(x)}
                      aria-disabled={!R.fm.includes(x)}
                      disabled={!R.fm.includes(x)}
                      title={
                        R.fm.includes(x)
                          ? undefined
                          : "No disponible para esta salida"
                      }
                      onClick={() => toggleFmt(x)}
                    >
                      {fmts.includes(x) ? ck : null}
                      {x}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="zone z-alt" aria-labelledby="r4">
        <div className="zi">
          <div className="sechead">
            <span className="num">4</span>
            <div>
              <h2 id="r4">Revisa y genera</h2>
              <p>Resumen de lo que incluirá el archivo antes de descargarlo</p>
            </div>
          </div>
          <div className="grid2">
            <section className="card">
              <CardHead title="Resumen del archivo" def={DEFS.rep} />
              <dl className="idr-dl">
                {row("Salida", R.t + " · " + fmts.join(" + "))}
                {row("Alcance", alc)}
                {row(
                  "Filtros",
                  [
                    f.tipo === "Todos" ? "todos los tipos de hallazgo" : f.tipo,
                    "periodo " + rpPer(f),
                    f.sev === "Todas"
                      ? null
                      : "severidad " + f.sev.toLowerCase(),
                  ]
                    .filter(Boolean)
                    .join(" · "),
                )}
                {row("Registros incluidos", <b>{records}</b>)}
                {row("Fecha de corte", "15 sep 2026")}
                {row("Cobertura de fuentes", D.cob + " %")}
              </dl>
            </section>
            <section className="card">
              <CardHead title="Qué incluirá" noInfo={true} />
              <ul className="rp-list">
                {R.inc.map((t) => (
                  <li key={t}>
                    {ck}
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="fnote" style={{ margin: "4px 0 0" }}>
                <b>En todos los archivos:</b> fecha de corte, cobertura, estado
                HITL, nivel de validación y advertencias metodológicas.
                Trazabilidad: fuente de datos, versión de agente, versión
                metodológica y fecha de generación.
              </p>
            </section>
          </div>
          <div className="rp-act">
            <button className="btn primary" onClick={gen}>
              {genLbl}
            </button>
            <button className="btn" onClick={clear}>
              Limpiar filtros
            </button>
          </div>
          {done && done.sig === sig ? (
            <p className="rp-ok" role="status">
              {done.msg}
            </p>
          ) : null}
        </div>
      </section>
    </React.Fragment>
  );
}

export interface ReportesInicial {
  /** Salida preseleccionada (por defecto, el reporte estratégico). */
  tipo?: ReporteTipo;
  /** Filtros de partida (p. ej. al venir de Barreras o Trámites). */
  filtros?: Partial<ReporteFiltros>;
}

export interface ReportesEditorialProps {
  userInitials?: string;
  ultimaActualizacion?: string;
  inicial?: ReportesInicial;
  /** Conteo de registros para los filtros elegidos. Por defecto, datos de ejemplo. */
  getData?: (f: ReporteFiltros) => ReporteConteo;
  /** Genera/descarga el archivo. Devuelve el texto de confirmación (opcional). */
  onGenerar?: (sel: ReporteSeleccion) => string | void;
}

export function ReportesEditorial({
  userInitials,
  ultimaActualizacion = "15 de septiembre de 2026",
  inicial,
  getData = rpData,
  onGenerar,
}: ReportesEditorialProps) {
  return (
    <PageShell
      eyebrow="Reportes"
      t1="Reportes"
      t2="y descargas"
      infoKey="rep"
      intro="Genera reportes estratégicos y operativos y bases en Excel con los filtros que necesites."
      sinNivel
      controls={null}
      stats={[
        [String(PAISES_BASE.length), "países disponibles"],
        [YEARS[0] + "–" + YEARS[YEARS.length - 1], "periodo de análisis"],
        ["15 sep 2026", "fecha de corte"],
      ]}
      userInitials={userInitials}
      ultimaActualizacion={ultimaActualizacion}
      anios={YEARS[0] + "–" + YEARS[YEARS.length - 1]}
    >
      <ReportesBody
        inicial={inicial}
        getConteo={getData}
        onGenerar={onGenerar}
      />
    </PageShell>
  );
}
