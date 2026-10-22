// Índice de Distorsiones Regulatorias (IDR): puntaje 0–100 y sus dos subíndices (Barreras y Trámites).
// Sin nivel regional / por país: el país es un filtro del encabezado. Pantalla presentacional: calcula
// con `getData(pais)` (por defecto, datos de ejemplo).
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AX_TOP,
  AX_XH0,
  MultiLine,
  NARROW,
  NowBox,
  axT,
  axisProps,
  endChip,
  yW,
} from "./charts";
import { CardHead } from "./cardhead";
import { DEFS, IDR_DEF_B, IDR_DEF_T, IDR_INTRO } from "./defs";
import { PAISES_BASE, TIPOS, YEARS } from "./fixtures";
import { I, Icon } from "./icons";
import { InfoBtn } from "./info";
import { idrData } from "./idr-data";
import { PageShell } from "./PageShell";
import { ALC, ALC_COLOR, COLORES_SERIE, T, TR_G, colorPais } from "./theme";
import { Dd, DdMulti, Fseg } from "./ui";
import type { IdrData } from "./types";

const Y_LAST = YEARS[YEARS.length - 1];
const NOW_T = `Valor actual (${Y_LAST})`;

function IdrScale({ v }: { v: number }) {
  const bands = ["Baja", "Media", "Alta"].map((s) => T.sev[s]);
  return (
    <div className="idr-sc" role="img" aria-label={"Puntaje " + v + " de 100"}>
      <div className="idr-track">
        <div className="idr-bands" aria-hidden="true">
          {bands.map((c, i) => (
            <i key={i} style={{ background: c + "55" }}></i>
          ))}
        </div>
        <span className="idr-mk" style={{ left: v + "%" }}></span>
      </div>
      <div className="idr-ticks" aria-hidden="true">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}
const IDR_SECCIONES = ["IDR", "Subíndice Barreras", "Subíndice Trámites"];

function IdrBody({ D }: { D: IdrData }) {
  /* secciones visibles; siempre en el orden de IDR_SECCIONES */
  const [secs, setSecs] = useState<string[]>(["IDR"]);
  const has = (k: string) => secs.includes(k);
  const setSecsOrd = (v: string[]) =>
    setSecs(IDR_SECCIONES.filter((x) => v.includes(x)));
  const addSec = (k: string) =>
    setSecs((a) => IDR_SECCIONES.filter((x) => a.includes(x) || x === k));
  /** Número de la sección entre las visibles. */
  const pos = (k: string) => IDR_SECCIONES.filter(has).indexOf(k) + 1;
  const zcls = (k: string) => (pos(k) % 2 ? "z-alt" : "z-base");
  const [entV, setEntV] = useState("Sector administrativo");
  const [hlE, setHlE] = useState<any>(null),
    [yE, setYE] = useState<any>(null);
  const colores = PAISES_BASE.map((c, i) => colorPais(c.name, i));
  const nar = NARROW();
  const lblStyle = {
    fill: "var(--ink)",
    fontSize: 12.5,
    fontWeight: 700,
    fontFamily: "Inter, system-ui, sans-serif",
  };
  const endLbl = (o) => endChip(o, lblStyle, false);
  const bars = (rows, yw, catT, rh) => (
    <div
      className="chart"
      style={{ height: rows.length * rh + 14 + AX_TOP + AX_XH0, flex: "none" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: AX_TOP, right: nar ? 40 : 64, left: 0, bottom: 0 }}
          barCategoryGap="30%"
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={false}
            tickLine={false}
            axisLine={false}
            height={AX_XH0}
            label={axT("Puntaje (0 a 100)", "x")}
          />
          <YAxis
            type="category"
            dataKey="k"
            {...{
              ...axisProps(T),
              width: yW(nar ? Math.min(yw, 134) : yw, catT),
              tick: {
                fill: T.axis,
                fontSize: 12,
                fontFamily: "Inter, system-ui, sans-serif",
              },
            }}
            label={axT(catT, "yr")}
          />
          <Tooltip
            cursor={{ fill: T.grid, opacity: 0.5 }}
            content={({ active, payload, label }) =>
              active && payload && payload.length ? (
                <div className="tt">
                  <div className="t">{label}</div>
                  <div className="r">
                    <i style={{ background: payload[0].payload.c }}></i>
                    <span>Puntaje</span>
                    <b>{payload[0].payload.v} de 100</b>
                  </div>
                </div>
              ) : null
            }
          />
          <Bar
            dataKey="v"
            maxBarSize={16}
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          >
            {rows.map((r, i) => (
              <Cell key={i} fill={r.c} fillOpacity={r.on === false ? 0.4 : 1} />
            ))}
            <LabelList dataKey="v" content={endLbl} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  const sorted = (a, c) =>
    a.map((r) => ({ ...r, c })).sort((x, y) => y.v - x.v);
  const card = (title, def, rows, yw, catT, rh, sub) => (
    <section className="card">
      <CardHead title={title} def={def} sub={sub} />
      {bars(rows, yw, catT, rh)}
    </section>
  );
  const paisRows = (key) =>
    D.paises
      .map((r) => ({ k: r.k, v: r[key], c: r.c, on: r.on }))
      .sort((a, b) => b.v - a.v);
  const tiposIdr = D.tipos
    .map((x) => ({ k: x.k, v: Math.round((x.v + D.t) / 2) }))
    .sort((a, b) => b.v - a.v)
    .map((r) => ({
      ...r,
      c: COLORES_SERIE[
        TIPOS.findIndex((q) => q[0] === r.k) % COLORES_SERIE.length
      ],
    }));
  const desag = [
    { k: "Subíndice Barreras", v: D.b, c: "var(--primary)" },
    { k: "Entrada", v: D.ent, c: T.entrada },
    { k: "Operación", v: D.ope, c: T.operacion },
    { k: "Subíndice Trámites", v: D.t, c: "var(--primary)" },
    ...D.cargas.map((x) => ({ ...x, c: TR_G })),
  ];
  const tile = (title, v, def, txt, k) => (
    <div className={"idr-tile" + (has(k) ? " on" : "")}>
      <div className="idr-tt">
        <h4>
          {title}
          <InfoBtn def={def} />
        </h4>
      </div>
      <div className="idr-head">
        <div className="idr-n">
          <b>{v}</b>
          <small>/ 100</small>
        </div>
        <IdrScale v={v} T={T} />
      </div>
      <p className="idr-def">{txt}</p>
      {!has(k) ? (
        <div>
          <button className="btn" onClick={() => addSec(k)}>
            Ver {title.toLowerCase()} <Icon d={I.arrow} />
          </button>
        </div>
      ) : null}
    </div>
  );
  const evoRows = ((r) => [
    ...PAISES_BASE.map((c, i) => ({
      name: c.name,
      value: r[c.name],
      color: hlE && hlE !== c.name ? T.muted : colores[i],
    })),
    { name: ALC, value: r[ALC], color: ALC_COLOR, ref: true },
  ])(D.evo.find((r) => r.year === yE) || D.evo[D.evo.length - 1]);
  const zone = (cls, id, inner) => (
    <section className={"zone " + cls} aria-labelledby={id}>
      <div className="zi">{inner}</div>
    </section>
  );
  const head = (n, id, t, p) => (
    <div className="sechead">
      <span className="num">{n}</span>
      <div>
        <h2 id={id}>{t}</h2>
        <p>{p}</p>
      </div>
    </div>
  );
  return (
    <React.Fragment>
      <div className="zone z-base">
        <div className="zi">
          <section
            className="card idr-panel"
            aria-label="Índice de Distorsiones Regulatorias y sus subíndices"
          >
            <CardHead
              title="Índice de Distorsiones Regulatorias (IDR)"
              def={DEFS.idr}
            />
            <p className="idr-def" style={{ marginTop: -6 }}>
              {IDR_INTRO}
            </p>
            <div
              className="ctlrow"
              role="group"
              aria-label="Secciones del índice"
            >
              <div className="cg">
                <span className="clbl clbl-t">Secciones</span>
                <DdMulti
                  values={secs}
                  onChange={setSecsOrd}
                  options={IDR_SECCIONES}
                  label="Secciones del índice que se muestran"
                />
              </div>
            </div>
            <div className="idr-comps">
              <div className="kd-t idr-lbl">
                Subíndices que hacen parte del IDR
              </div>
              <div className="idr-tiles">
                {tile(
                  "Subíndice Barreras",
                  D.b,
                  DEFS.sidb,
                  IDR_DEF_B,
                  "Subíndice Barreras",
                )}
                {tile(
                  "Subíndice Trámites",
                  D.t,
                  DEFS.sidt,
                  IDR_DEF_T,
                  "Subíndice Trámites",
                )}
              </div>
              <p className="fnote">
                Son componentes del IDR, no sumandos: sus puntajes no se suman
                ni dan un total.
              </p>
            </div>
          </section>
        </div>
      </div>

      {has("IDR")
        ? zone(
            zcls("IDR"),
            "d1",
            <>
              {head(
                pos("IDR"),
                "d1",
                "IDR",
                "Puntaje de los países y desagregación de los dos subíndices",
              )}
              <div className="grid2">
                {card(
                  "IDR por país",
                  DEFS.iporpais,
                  paisRows("idr"),
                  130,
                  "País",
                  40,
                  "Último año disponible (" + Y_LAST + ")",
                )}
                {card(
                  "IDR por tipo de regulación",
                  DEFS.itipo,
                  tiposIdr,
                  130,
                  "Tipo de regulación",
                  46,
                )}
              </div>
              <div style={{ marginTop: 20 }}>
                {card(
                  "Desagregación por barreras y trámites",
                  DEFS.idesag,
                  desag,
                  170,
                  "Componente",
                  34,
                  "Entrada y operación en Barreras; las seis cargas en Trámites",
                )}
              </div>
            </>,
          )
        : null}

      {has("Subíndice Barreras")
        ? zone(
            zcls("Subíndice Barreras"),
            "d2",
            <>
              {head(
                pos("Subíndice Barreras"),
                "d2",
                "Subíndice Barreras",
                "Evolución y dónde se concentran las distorsiones de las regulaciones",
              )}
              <section className="card">
                <CardHead title="Evolución del subíndice" def={DEFS.ievo} />
                <div className="cbody">
                  <div className="chart">
                    <MultiLine
                      T={T}
                      data={D.evo}
                      series={PAISES_BASE.map((c) => c.name)}
                      colors={colores}
                      hl={hlE}
                      yT="Puntaje (0 a 100)"
                      refKey={ALC}
                      setYear={setYE}
                      onPin={(n) => setHlE((p) => (p === n ? null : n))}
                    />
                  </div>
                  <NowBox
                    title={NOW_T}
                    ultimo={Y_LAST}
                    year={yE}
                    onBack={() => setYE(null)}
                    hl={hlE}
                    onPick={(n) => setHlE((p) => (p === n ? null : n))}
                    onClear={() => setHlE(null)}
                    rows={evoRows}
                    fmt={(v) => String(v)}
                  />
                </div>
              </section>
              <div className="grid2" style={{ marginTop: 20 }}>
                {card(
                  "Subíndice por país",
                  DEFS.iporpais,
                  paisRows("b"),
                  130,
                  "País",
                  40,
                  "Último año disponible (" + Y_LAST + ")",
                )}
                {card(
                  "Subíndice por tipo de regulación",
                  DEFS.itipo,
                  sorted(D.tipos, "var(--primary)").map((r) => ({
                    ...r,
                    c: COLORES_SERIE[
                      TIPOS.findIndex((q) => q[0] === r.k) %
                        COLORES_SERIE.length
                    ],
                  })),
                  130,
                  "Tipo de regulación",
                  46,
                )}
                {card(
                  "Subíndice por sector económico",
                  DEFS.isec,
                  sorted(D.secs, "var(--primary)"),
                  150,
                  "Sector económico",
                  32,
                )}
                {card(
                  "Subíndice por componente",
                  DEFS.ieo,
                  [
                    { k: "Entrada", v: D.ent, c: T.entrada },
                    { k: "Operación", v: D.ope, c: T.operacion },
                  ].sort((a, b) => b.v - a.v),
                  130,
                  "Tipo de barrera",
                  46,
                )}
              </div>
            </>,
          )
        : null}

      {has("Subíndice Trámites")
        ? zone(
            zcls("Subíndice Trámites"),
            "d3",
            <>
              {head(
                pos("Subíndice Trámites"),
                "d3",
                "Subíndice Trámites",
                "Dónde se concentran las cargas que los trámites generan",
              )}
              <div className="grid2">
                {card(
                  "Subíndice por país",
                  DEFS.iporpais,
                  paisRows("t"),
                  130,
                  "País",
                  40,
                  "Último año disponible (" + Y_LAST + ")",
                )}
                <section className="card">
                  <CardHead
                    title={
                      entV === "Sector administrativo"
                        ? "Subíndice por sector administrativo"
                        : "Subíndice por entidad emisora"
                    }
                    def={DEFS.ient}
                  />
                  <div className="ctlrow" role="group" aria-label="Ver por">
                    <div className="cg">
                      <span className="clbl clbl-t">Ver por</span>
                      <Fseg
                        v={entV}
                        set={setEntV}
                        items={["Sector administrativo", "Entidad emisora"]}
                        label="Ver el subíndice por"
                      />
                    </div>
                  </div>
                  {entV === "Sector administrativo"
                    ? bars(
                        sorted(D.adms, TR_G),
                        200,
                        "Sector administrativo",
                        32,
                      )
                    : bars(sorted(D.ents, TR_G), 190, "Entidad emisora", 32)}
                </section>
              </div>
              <div style={{ marginTop: 20 }}>
                {card(
                  "Desagregación por tipo de carga",
                  DEFS.icar,
                  sorted(D.cargas, TR_G),
                  170,
                  "Carga",
                  40,
                )}
              </div>
            </>,
          )
        : null}
    </React.Fragment>
  );
}
function IdrCtl({
  pais,
  setPais,
}: {
  pais: string;
  setPais: (p: string) => void;
}) {
  return (
    <div
      className="ctlrow on-dark"
      role="group"
      aria-label="Filtros de la vista"
    >
      <div className="cg">
        <span className="clbl">País</span>
        <Dd
          tone="dark"
          value={pais}
          onChange={(v) => setPais(v)}
          options={[
            ["Todos", "Todos"],
            ...PAISES_BASE.map((c) => [c.name, c.name]),
          ]}
          label="País"
        />
      </div>
      <div className="cg">
        <InfoBtn tone="dark" def={DEFS.idr} label="Qué es el IDR" />
      </div>
    </div>
  );
}

export interface IdrEditorialProps {
  userInitials?: string;
  /** Datos del IDR para el país elegido ("Todos" = los seis). Por defecto, datos de ejemplo. */
  getData?: (pais: string) => IdrData;
}

/** Índice de Distorsiones Regulatorias (IDR) y sus subíndices Barreras y Trámites. */
export function IdrEditorial({
  userInitials,
  getData = idrData,
}: IdrEditorialProps) {
  const [pais, setPais] = useState("Todos");
  const D = getData(pais);
  return (
    <PageShell
      eyebrow="Índice / IDR"
      t1="Índice de Distorsiones"
      t2="Regulatorias"
      infoKey="idr"
      intro="El IDR mide las distorsiones generadas por regulaciones y trámites a empresas y ciudadanos."
      sinNivel
      controls={<IdrCtl pais={pais} setPais={setPais} />}
      stats={[
        [
          pais === "Todos" ? String(PAISES_BASE.length) : pais,
          pais === "Todos" ? "países analizados" : "país seleccionado",
        ],
      ]}
      userInitials={userInitials}
      pie={
        <>
          <span>
            Cobertura de fuentes: {D.cob} % ({D.fp} de {D.ft})
          </span>
          <span className="sep" />
          <span>Hallazgos validados: {D.val} %</span>
          <span className="sep" />
          <span>Fecha de corte: 15 de septiembre de 2026</span>
        </>
      }
    >
      <IdrBody key={pais} D={D} />
    </PageShell>
  );
}
