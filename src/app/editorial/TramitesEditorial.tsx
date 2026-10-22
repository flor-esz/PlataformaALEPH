import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import {
  AX_TOP,
  AX_XH0,
  axT,
  axisProps,
  endChip,
  otrosNote,
  star,
  valAxis,
  yW,
  OTROS,
  NARROW,
} from "./charts";
import { CardHead } from "./cardhead";
import { DEFS } from "./defs";
import { fmt1, fmtInt, pct } from "./format";
import { I, Icon } from "./icons";
import { InfoBtn } from "./info";
import {
  Dd,
  DdState,
  DonutList,
  Flag,
  Fseg,
  Mejora,
  Pips,
  SevPanel,
  SevPill,
} from "./ui";
import { PageShell } from "./PageShell";
import { PAISES_FIXTURE, tramitesFixture } from "./fixtures";
import { IMP_ADM } from "./costeo-data";
import { RAMPS, SEVS, TR_G, T, colorPais } from "./theme";
import type {
  DesgloseTramite,
  TramiteFila,
  TramitesData,
  ScreenProps,
} from "./types";

const SEV_CLAVE = { Alta: "alta", Media: "media", Baja: "baja" } as const;
const totalSev = (r: DesgloseTramite) => r.alta + r.media + r.baja;
const TR_ORD = [
  ["tot", "Mayor número de trámites"],
  ["alta", "Mayor proporción de severidad alta"],
  ["az", "País (A–Z)"],
];
const TOP_OPTS = (all) => [
  ["5", "Top 5"],
  ["10", "Top 10"],
  ["all", all],
];

function TramitesBody({
  D,
  country,
  onSelectPais,
  onOpenTramite,
  onVerTodos,
  onCosteo,
}: {
  D: TramitesData;
  country: string;
  onSelectPais: (n: string) => void;
  onOpenTramite?: (fila: TramiteFila) => void;
  onVerTodos?: () => void;
  onCosteo?: () => void;
}) {
  const nat = country !== "Todos";
  const [fs, setFs] = useState({
    sec: "Todos",
    ent: "Todos",
    eta: "Todos",
    usu: "Todos",
  });
  const [ds, setDs] = useState({
    sec: "total",
    ent: "total",
    eta: "total",
    usu: "total",
  }); // B5: por defecto sin desagregación
  const setD = (k) => (v) => setDs((x) => ({ ...x, [k]: v }));
  const TR_DIS = [
    ["total", "Total", "Sin desagregar", "Total de trámites"],
    ["sev", "Severidad", "Nivel de severidad", "Alta, Media y Baja"],
  ];
  const [ns, setNs] = useState({ sec: "10", ent: "10" });
  const [ord, setOrd] = useState("tot");
  const [dAcc, setDAcc] = useState("Simplificar"); // desagregación de la acción por entidad emisora
  const [accSec, setAccSec] = useState("Todos"); // T6: filtro de sector en «Trámites por acción de mejora sugerida»
  const setF = (k) => (v) => setFs((s) => ({ ...s, [k]: v })),
    setN = (k) => (v) => setNs((s) => ({ ...s, [k]: v }));
  const SEGC = T.sev;
  // Una fila del gráfico según el filtro de severidad (`f`): los valores salen de la fila.
  const toRow = (r: DesgloseTramite, f: string) => {
    const o: any = { k: r.k };
    SEVS.forEach(
      (s) => (o[s] = f === "Todos" || f === s ? r[SEV_CLAVE[s]] : 0),
    );
    o.total = o.Alta + o.Media + o.Baja;
    return o;
  };
  const rank = (
    rows: DesgloseTramite[],
    f: string,
    n?: string,
    pin?: string,
  ) => {
    const r = rows
      .map((x) => toRow(x, f))
      .sort((a, b) =>
        pin && a.k === pin ? 1 : pin && b.k === pin ? -1 : b.total - a.total,
      );
    return n === "all" || n == null ? r : r.slice(0, +n);
  };
  const natural = (rows: DesgloseTramite[], f: string) =>
    rows.map((x) => toRow(x, f)); // orden lógico, no ranking
  const lblStyle = {
    fill: "var(--ink)",
    fontSize: 12.5,
    fontWeight: 700,
    fontFamily: "Inter, system-ui, sans-serif",
  };
  const tickP = (w) => ({
    ...axisProps(T),
    width: w,
    tickFormatter: star,
    tick: {
      fill: T.axis,
      fontSize: 12,
      fontFamily: "Inter, system-ui, sans-serif",
    },
  });
  const stackTip = ({ active, payload, label }) =>
    active && payload && payload.length ? (
      <div className="tt">
        <div className="t">{label}</div>
        <div className="r">
          <i style={{ background: "transparent" }}></i>
          <span>Total de trámites</span>
          <b>{fmtInt(payload[0].payload.total)}</b>
        </div>
        {payload.length > 1
          ? payload.map((x) => (
              <div className="r" key={x.dataKey}>
                <i style={{ background: x.color }}></i>
                <span>{x.name}</span>
                <b>{fmtInt(x.value)}</b>
              </div>
            ))
          : null}
      </div>
    ) : null;
  const oneTip =
    (unit) =>
    ({ active, payload, label }) =>
      active && payload && payload.length ? (
        <div className="tt">
          <div className="t">{label}</div>
          <div className="r">
            <i style={{ background: payload[0].payload.c || TR_G }}></i>
            <span>{unit}</span>
            <b>{payload[0].payload.lab}</b>
          </div>
        </div>
      ) : null;
  const hbarsStack = (
    data: any,
    yw: any,
    id: any,
    catT?: any,
    valT?: any,
    dis?: any,
  ) => (
    <div
      className="chart"
      style={{ height: data.length * 28 + 14 + AX_TOP + AX_XH0 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: AX_TOP, right: 40, left: 0, bottom: 0 }}
          barCategoryGap="26%"
        >
          {valAxis(valT || "Número de trámites")}
          <YAxis
            type="category"
            dataKey="k"
            {...tickP(yW(yw, catT))}
            label={axT(catT, "yr")}
          />
          <Tooltip cursor={{ fill: T.grid, opacity: 0.5 }} content={stackTip} />
          {dis === "sev" ? (
            SEVS.map((s, i) => (
              <Bar
                key={s}
                dataKey={s}
                name={s}
                stackId={id}
                fill={SEGC[s]}
                maxBarSize={16}
                radius={i === 2 ? [0, 4, 4, 0] : 0}
                isAnimationActive={false}
                stroke={T.surface}
                strokeWidth={1}
              >
                {i === 2 ? (
                  <LabelList
                    dataKey="total"
                    position="right"
                    style={lblStyle}
                    formatter={fmtInt}
                  />
                ) : null}
              </Bar>
            ))
          ) : (
            <Bar
              key="total"
              dataKey="total"
              name="Trámites"
              fill={TR_G}
              maxBarSize={16}
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="total"
                position="right"
                style={lblStyle}
                formatter={fmtInt}
              />
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  const hbarsOne = (
    rows: any,
    yw: any,
    unit: any,
    color: any,
    rw?: any,
    catT?: any,
    valT?: any,
  ) => (
    <div
      className="chart"
      style={{
        height: rows.length * (yw > 200 ? 40 : 30) + 14 + AX_TOP + AX_XH0,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: AX_TOP, right: rw || 48, left: 0, bottom: 0 }}
          barCategoryGap="30%"
        >
          {valAxis(valT || "Número de trámites")}
          <YAxis
            type="category"
            dataKey="k"
            {...tickP(yW(yw, catT))}
            label={axT(catT, "yr")}
          />
          <Tooltip
            cursor={{ fill: T.grid, opacity: 0.5 }}
            content={oneTip(unit)}
          />
          <Bar
            dataKey="v"
            fill={color || TR_G}
            maxBarSize={16}
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          >
            <LabelList dataKey="lab" content={endLbl} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  /* valor al final de la barra en una sola línea (sin partir «660 · 36 %») */
  const endLbl = (o: any) => endChip(o, lblStyle, false);
  const Leg = (
    <div
      className="dislegend"
      style={{ marginLeft: 0 }}
      aria-label="Leyenda de severidad"
    >
      {SEVS.map((s, i) => (
        <span className="dl" key={s}>
          <Pips n={3 - i} color={SEGC[s]} />
          {s}
        </span>
      ))}
    </div>
  );
  const ctl = (key: any, topKey?: any, allLabel?: any, one?: any) => (
    <>
      <div className="ctlrow" role="group" aria-label="Filtros de la gráfica">
        <div className="cg">
          <span className="clbl">
            <span className="clbl-t">Severidad</span>
            <span className="clbl-ico" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </span>
          </span>
          <Fseg
            v={fs[key]}
            set={setF(key)}
            items={["Todos", "Alta", "Media", "Baja"]}
            label="Nivel de severidad"
          />
        </div>
        <div className="cg cg-view">
          <span className="clbl clbl-t">Filtros</span>
          <Dd
            value={ds[key]}
            onChange={setD(key)}
            options={TR_DIS}
            label="Desagregar barras por"
            pre="Filtros:"
          />
        </div>
        {one && topKey ? (
          <div className="cg">
            <span className="clbl clbl-t">Mostrar</span>
            <Dd
              value={ns[topKey]}
              onChange={setN(topKey)}
              options={TOP_OPTS(allLabel)}
              label="Cantidad de elementos a mostrar"
            />
          </div>
        ) : null}
      </div>
      {topKey && !one ? (
        <div
          className="ctlrow"
          role="group"
          aria-label="Opciones de la gráfica"
        >
          <div className="cg">
            <span className="clbl clbl-t">Mostrar</span>
            <Dd
              value={ns[topKey]}
              onChange={setN(topKey)}
              options={TOP_OPTS(allLabel)}
              label="Cantidad de elementos a mostrar"
            />
          </div>
        </div>
      ) : null}
    </>
  );
  const pcTot = (n) => Math.round((n / D.tot) * 100) + " %";
  const withLab = (rows: any, fn: any, c?: any) =>
    rows.map(([k, v]) => ({ k, v, lab: fn(v), c }));

  /* Vista regional: el sector económico se sustituye por el sector administrativo (agrupa las entidades) */
  const secAdm = (() => {
    const g: Record<string, DesgloseTramite> = {};
    D.entidad.forEach((r) => {
      const a = IMP_ADM[r.k] || "Otros sectores administrativos";
      const o = (g[a] ??= { k: a, alta: 0, media: 0, baja: 0 });
      o.alta += r.alta;
      o.media += r.media;
      o.baja += r.baja;
    });
    return Object.values(g);
  })();
  const sector = rank(
      nat ? D.sector : secAdm,
      fs.sec,
      ns.sec,
      nat ? undefined : "Otros sectores administrativos",
    ),
    entidad = rank(D.entidad, fs.ent, ns.ent, "Otras entidades");
  const etapa = natural(D.etapa, fs.eta),
    usuario = rank(D.usuario, fs.usu);
  /* T6 (datos de ejemplo): cada sector tiene su propia mezcla de acciones; % sobre los trámites del sector elegido */
  const hsh = (str) => {
    let h = 2166136261;
    for (const c of str) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 1000) / 1000;
  };
  const secRow = D.sector.find((r) => r.k === accSec),
    accN = secRow ? totalSev(secRow) : D.tot;
  const accRows = secRow
    ? D.acc
        .map(([k, v]) => [
          k,
          Math.max(
            1,
            Math.round(((v * accN) / D.tot) * (0.55 + 0.9 * hsh(k + accSec))),
          ),
        ])
        .sort((a, b) => b[1] - a[1])
    : D.acc;
  const acc = withLab(
    accRows,
    (v) => fmtInt(v) + " · " + Math.round((v / accN) * 100) + " %",
  );
  /* Desagregación de la acción sugerida por entidad emisora (datos de ejemplo, misma lógica que en Barreras) */
  const dAccName = D.acc.some((a) => a[0] === dAcc) ? dAcc : D.acc[0][0],
    dAccTot = D.acc.find((a) => a[0] === dAccName)[1];
  const dEntBase = D.entidad
      .filter((r) => !OTROS[r.k])
      .map((r) => [r.k, totalSev(r)] as [string, number]),
    dW = dEntBase.map(([k, v]) => v * (0.5 + hsh(dAccName + k))),
    dWs = dW.reduce((a, b) => a + b, 0);
  const dReal = D.accionEntidad?.[dAccName]; // datos reales si vienen; si no, reparto de ejemplo
  const dEntAll = dEntBase
    .map(([k], i) => ({
      k,
      v: dReal
        ? (dReal[k] ?? 0)
        : Math.max(1, Math.round((dAccTot * dW[i]) / dWs)),
    }))
    .sort((a, b) => b.v - a.v);
  const dEnt = (
    dEntAll.length > 7
      ? [
          ...dEntAll.slice(0, 7),
          {
            k: "Otras entidades",
            v: dEntAll.slice(7).reduce((a, r) => a + r.v, 0),
          },
        ]
      : dEntAll
  ).map((r) => ({ ...r, lab: fmtInt(r.v) }));
  const sevData = SEVS.map((name, i) => ({
    name,
    value: D.sev[i],
    color: SEGC[name],
    cap: "Severidad " + name,
  }));

  /* KPIs */
  const kpi = (band, label, val, sm, desc, ico, k) => (
    <div className="kpi has-ib">
      <span className="band" style={{ background: band }}></span>
      <div className="k">
        {label}
        <InfoBtn k={k} />
      </div>
      <span className="ib" aria-hidden="true">
        <Icon d={ico} />
      </span>
      <div className="v">
        {val}
        {sm ? <small>{sm}</small> : null}
      </div>
      <div className="d">{desc}</div>
    </div>
  );
  const costTxt = nat ? fmt1(D.cost) : fmtInt(D.cost);

  /* Trámites por país (vista regional) */
  const rows = (D.paises ?? []).map((p, i) => ({
    name: p.name,
    tot: p.tot,
    sev: p.sev,
    id: p.id,
    i,
  }));
  const ordered = rows
    .slice()
    .sort((a, b) =>
      ord === "az"
        ? a.name.localeCompare(b.name, "es")
        : ord === "alta"
          ? b.sev[0] / b.tot - a.sev[0] / a.tot
          : b.tot - a.tot,
    );

  /* Vista por país: cargas */
  const cAct = nat ? D.cAct.map(([k, s, c]) => ({ k, v: D.cost * s })) : [];
  const cActRows = cAct
    .map((r) => ({ ...r, lab: "USD " + fmt1(r.v) + " M" }))
    .sort((a, b) => b.v - a.v);
  const cUsu = nat
    ? D.cUsu.map(([k, s]) => ({
        k,
        v: D.cost * s,
        lab: "USD " + fmt1(D.cost * s) + " M",
      }))
    : [];
  const afe = nat ? D.afe.map(([k, v]) => ({ k, v, lab: fmtInt(v) })) : [];
  const mipTot = nat ? D.mip.reduce((a, m) => a + m[1], 0) : 1;
  const MIPC = [RAMPS.azul.steps[3], RAMPS.azul.steps[1], RAMPS.azul.steps[0]];
  const top2 = D.sector
    .map((x) => [x.k, totalSev(x)] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  const finds = nat
    ? [
        ["62 %", "de los trámites tienen oportunidad de mejora"], // dato de ejemplo: aún no hay total del catálogo
        [
          Math.round((D.sev[0] / D.tot) * 100) + " %",
          "presentan severidad alta",
        ],
        (() => {
          const adm: Record<string, string> = {
              ...IMP_ADM,
              DIAN: "Hacienda y finanzas",
              ICA: "Agricultura y desarrollo rural",
              Invima: "Salud",
            },
            g: Record<string, number> = {},
            sum = D.entidad.reduce((t, r) => t + totalSev(r), 0) || 1;
          D.entidad.forEach((r) => {
            const a = adm[r.k] || "Otros sectores administrativos";
            g[a] = (g[a] || 0) + totalSev(r);
          });
          const m = Object.entries(g)
            .filter(([k]) => k !== "Otros sectores administrativos")
            .sort((x, y) => y[1] - x[1])[0] || ["—", 0];
          return [
            Math.round((m[1] / sum) * 100) + " %",
            "se concentran en " + String(m[0]).toLowerCase(),
          ];
        })(),
        [
          Math.round((D.mip[0][1] / mipTot) * 100) + " %",
          "presentan una afectación alta a las MIPYMES",
        ],
      ]
    : [];

  return (
    <React.Fragment>
      <div className="zone z-base">
        <div className="zi">
          <div
            className="sum s3"
            aria-label="Indicadores generales de trámites"
          >
            {kpi(
              TR_G,
              "Trámites identificados",
              fmtInt(D.tot),
              null,
              "con potencial de mejora",
              I.tramites,
              "ktr",
            )}
            {kpi(
              "var(--primary)",
              "Entidades responsables",
              fmtInt(D.ent),
              null,
              "que gestionan estos trámites",
              I.bank,
              "kent",
            )}
            {kpi(
              TR_G,
              "Costo administrativo estimado",
              "USD " + costTxt,
              "millones",
              "carga estimada para los usuarios",
              I.db,
              "kcost",
            )}
          </div>

          <SevPanel
            T={T}
            title="Trámites por nivel de severidad"
            data={sevData}
            totalLabel="Total de trámites"
            unit="trámites"
            aria="Trámites por nivel de severidad"
            def={DEFS.tsev}
          />
        </div>
      </div>

      <section className="zone z-alt" aria-labelledby="t1">
        <div className="zi">
          <div className="sechead">
            <span className="num">1</span>
            <div>
              <h2 id="t1">
                ¿Dónde se concentran los trámites con potencial de mejora?
                <InfoBtn k="tsec1" />
              </h2>
              <p>
                {nat
                  ? "Distribución según sector económico, entidad responsable, etapa del ciclo empresarial y tipo de usuario"
                  : "Distribución según sector administrativo, etapa del ciclo empresarial y tipo de usuario"}
              </p>
            </div>
          </div>
          <div className="grid2">
            <section className={"card" + (nat ? "" : " g-wide")}>
              <CardHead
                title={
                  nat
                    ? "Trámites por sector económico"
                    : "Trámites por sector administrativo"
                }
              />
              {ctl("sec", "sec", "Todos", !nat)}
              {hbarsStack(
                sector,
                nat ? 150 : 210,
                "s",
                nat ? "Sector económico" : "Sector administrativo",
                undefined,
                ds.sec,
              )}
              {ds.sec === "sev" ? Leg : null}
              {nat
                ? null
                : otrosNote(
                    sector.map((r) => r.k),
                    "trámites",
                  )}
            </section>
            {nat ? (
              <section className="card">
                <CardHead title="Trámites por entidad responsable" />
                {ctl("ent", "ent", "Todas")}
                {hbarsStack(
                  entidad,
                  190,
                  "e",
                  "Entidad responsable",
                  undefined,
                  ds.ent,
                )}
                {ds.ent === "sev" ? Leg : null}
                {otrosNote(
                  entidad.map((r) => r.k),
                  "trámites",
                )}
              </section>
            ) : null}
            <section className="card">
              <CardHead title="Trámites por etapa del ciclo empresarial" />
              {ctl("eta")}
              {hbarsStack(
                etapa,
                110,
                "c",
                "Etapa del ciclo empresarial",
                undefined,
                ds.eta,
              )}
              {ds.eta === "sev" ? Leg : null}
            </section>
            <section className="card">
              <CardHead title="Trámites por tipo de usuario" />
              {ctl("usu")}
              {hbarsStack(
                usuario,
                110,
                "u",
                "Tipo de usuario",
                undefined,
                ds.usu,
              )}
              {ds.usu === "sev" ? Leg : null}
            </section>
          </div>
        </div>
      </section>

      {nat ? (
        <section className="zone z-base" aria-labelledby="t2">
          <div className="zi">
            <div className="sechead">
              <span className="num">2</span>
              <div>
                <h2 id="t2">
                  ¿Qué cargas generan estos trámites para los usuarios?
                  <InfoBtn k="tcar" />
                </h2>
                <p>
                  Estimación de costos y principales tipos de carga
                  identificados
                </p>
              </div>
            </div>
            <div className="grid2">
              <section className="card">
                <CardHead title="Costo estimado por actividad estándar" />
                {hbarsOne(
                  cActRows,
                  190,
                  "Costo estimado",
                  TR_G,
                  110,
                  "Actividad estándar",
                  "Costo estimado (millones de USD)",
                )}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn"
                    onClick={onCosteo}
                    disabled={!onCosteo}
                  >
                    Ver más <Icon d={I.arrow} />
                  </button>
                </div>
              </section>
              <section className="card">
                <CardHead title="Costos administrativos por usuario" />
                {hbarsOne(
                  cUsu,
                  110,
                  "Costo estimado",
                  TR_G,
                  110,
                  "Tipo de usuario",
                  "Costo estimado (millones de USD)",
                )}
              </section>
              <section className="card">
                <CardHead title="Tipo de carga que genera" />
                {hbarsOne(
                  afe,
                  180,
                  "Trámites",
                  RAMPS.azul.steps[2],
                  48,
                  "Tipo de carga",
                )}
                <p className="csub" style={{ margin: 0 }}>
                  Un trámite puede generar más de un tipo de carga.
                </p>
              </section>
              <section className="card">
                <CardHead title="Afectación a las MIPYMEs" />
                <div className="mip">
                  <div
                    className="split"
                    style={{ height: 12 }}
                    role="img"
                    aria-label={
                      "Afectación alta " +
                      pct(D.mip[0][1], mipTot) +
                      " %, media " +
                      pct(D.mip[1][1], mipTot) +
                      " %, baja " +
                      pct(D.mip[2][1], mipTot) +
                      " %"
                    }
                  >
                    {D.mip.map(([k, v], i) => (
                      <i key={k} style={{ flex: v, background: MIPC[i] }}></i>
                    ))}
                  </div>
                  <ul className="miplist">
                    {D.mip.map(([k, v], i) => (
                      <li key={k}>
                        <span className="ml">
                          <Pips n={3 - i} color={MIPC[i]} />
                          {k}
                        </span>
                        <b>{fmtInt(v)}</b>
                        <span className="mp">
                          <span className="pchip">{pct(v, mipTot)} %</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <button className="btn">
                    Ver tabla completa <Icon d={I.arrow} />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </section>
      ) : null}

      {nat ? (
        <section className="zone z-alt" aria-labelledby="tH">
          <div className="zi">
            <div className="sechead">
              <span className="num">3</span>
              <div>
                <h2 id="tH">
                  Hallazgos clave
                  <InfoBtn k="thall" />
                </h2>
                <p>Lectura rápida de los datos de {country}</p>
              </div>
            </div>
            <section className="card">
              <ul className={"finds" + (finds.length === 4 ? "" : " tri")}>
                {finds.map((f, i) => (
                  <li key={i}>
                    <span className="fv">{f[0]}</span>
                    <span className="ft">{f[1]}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>
      ) : null}
      {nat ? (
        <section className="zone z-base" aria-labelledby="t3">
          <div className="zi">
            <div className="sechead">
              <span className="num">4</span>
              <div>
                <h2 id="t3">
                  ¿Dónde actuar para simplificar?
                  <InfoBtn k="tact" />
                </h2>
                <p>Acciones sugeridas para reducir la carga de los trámites</p>
              </div>
            </div>
            <div className="actgrid act-tr">
              <section className="card">
                <CardHead title="Trámites por acción de mejora sugerida" />
                <div
                  className="ctlrow"
                  role="group"
                  aria-label="Filtros de la gráfica"
                >
                  <div className="cg">
                    <span className="clbl clbl-t">Sector económico</span>
                    <Dd
                      value={accSec}
                      onChange={setAccSec}
                      options={[
                        ["Todos", "Todos"],
                        ...D.sector.map((r) => [r.k, r.k]),
                      ]}
                      label="Sector económico"
                      pre="Sector"
                    />
                  </div>
                </div>
                {hbarsOne(
                  acc,
                  NARROW() ? 130 : 165,
                  "Trámites",
                  TR_G,
                  100,
                  "Acción de mejora sugerida",
                )}
                <p className="csub" style={{ margin: 0 }}>
                  Un trámite puede tener más de una acción sugerida.
                </p>
              </section>
              <section
                className="card dxp"
                aria-label="Desagregación de la acción sugerida"
              >
                <CardHead
                  title="Desagregación de la acción sugerida"
                  def={DEFS.tdacc}
                />
                <div
                  className="ctlrow"
                  role="group"
                  aria-label="Filtros de la desagregación"
                >
                  <div className="cg">
                    <span className="clbl clbl-t">Acción</span>
                    <Dd
                      value={dAccName}
                      onChange={setDAcc}
                      options={D.acc.map((a) => [a[0], a[0]])}
                      label="Acción sugerida"
                      pre="Acción"
                    />
                  </div>
                </div>
                {hbarsOne(dEnt, 190, "Trámites", TR_G, 48, "Entidad emisora")}
                <div className="dxnotes">
                  {otrosNote(
                    dEnt.map((r) => r.k),
                    "trámites",
                  )}
                </div>
              </section>
            </div>
          </div>
        </section>
      ) : null}

      {nat ? (
        <section className="zone z-alt" aria-labelledby="t4">
          <div className="zi">
            <div className="sechead">
              <span className="num">5</span>
              <div>
                <h2 id="t4">
                  Principales trámites identificados en {country}
                  <InfoBtn k="ttab" />
                </h2>
                <p>
                  Detalle de los trámites con potencial de mejora. Selecciona un
                  trámite para ver su ficha completa.
                </p>
              </div>
            </div>
            <section className="card">
              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th>Trámite</th>
                      <th>Sector / Subsector</th>
                      <th>Entidad responsable</th>
                      <th>Etapa</th>
                      <th>Tipo de usuario</th>
                      <th>
                        Severidad
                        <InfoBtn k="sev" />
                      </th>
                      <th className="num">Costo estimado (USD)</th>
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
                    {(D.tabla ?? []).map((r, i) => (
                      <tr
                        key={r.id ?? i}
                        {...(onOpenTramite
                          ? {
                              className: "rowlink",
                              tabIndex: 0,
                              title: "Ver la ficha del trámite",
                              onClick: () => onOpenTramite(r),
                              onKeyDown: (e: React.KeyboardEvent) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  onOpenTramite(r);
                                }
                              },
                            }
                          : {})}
                      >
                        <td className="main">{r.tramite}</td>
                        <td>{r.sector}</td>
                        <td>{r.entidad}</td>
                        <td>{r.etapa}</td>
                        <td>{r.usuario}</td>
                        <td>
                          <SevPill s={r.severidad} />
                        </td>
                        <td className="num">{r.costo}</td>
                        <td>
                          <Mejora t={r.accion} />
                        </td>
                        <td className="go" aria-hidden="true">
                          <Icon d={I.arrow} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn primary" onClick={onVerTodos}>
                  Ver todos los trámites <Icon d={I.arrow} />
                </button>
              </div>
            </section>
          </div>
        </section>
      ) : (
        <section className="zone z-alt" aria-labelledby="t4">
          <div className="zi">
            <div className="sechead">
              <span className="num">2</span>
              <div>
                <h2 id="t4">
                  Trámites por país
                  <InfoBtn k="tpais" />
                </h2>
                <p>
                  Selecciona un país para explorar sus trámites con potencial de
                  mejora en detalle
                </p>
              </div>
              <div className="sh-ctl">
                <span className="clbl">Ordenar por</span>
                <Dd
                  value={ord}
                  onChange={setOrd}
                  options={TR_ORD}
                  label="Ordenar países por"
                />
              </div>
            </div>
            <div className="countries">
              {ordered.map((r) => (
                <section className="card cc" key={r.name}>
                  <div className="top2">
                    <div className="name">
                      <Flag id={r.id} name={r.name} />
                      <span
                        className="cname"
                        style={{ "--cc": colorPais(r.name, r.i) }}
                      >
                        {r.name}
                      </span>
                    </div>
                  </div>
                  <div className="big">
                    {fmtInt(r.tot)}
                    <small>trámites identificados</small>
                  </div>
                  <div
                    className="split"
                    style={{ height: 10 }}
                    role="img"
                    aria-label={
                      "Severidad: alta " +
                      r.sev[0] +
                      ", media " +
                      r.sev[1] +
                      ", baja " +
                      r.sev[2]
                    }
                  >
                    {r.sev.map((v, i) => (
                      <i
                        key={i}
                        style={{ flex: v, background: SEGC[SEVS[i]] }}
                      ></i>
                    ))}
                  </div>
                  <div className="legend">
                    {SEVS.map((s, i) => (
                      <React.Fragment key={s}>
                        <span>
                          <Pips n={3 - i} color={SEGC[s]} />
                          {s}
                        </span>
                        <b>
                          {r.sev[i]}{" "}
                          <span className="pchip">
                            {pct(r.sev[i], r.tot)} %
                          </span>
                        </b>
                      </React.Fragment>
                    ))}
                  </div>
                  <button
                    className="btn"
                    style={{ marginTop: 4 }}
                    onClick={() => onSelectPais(r.name)}
                  >
                    Ver detalle del país <Icon d={I.arrow} />
                  </button>
                </section>
              ))}
            </div>
          </div>
        </section>
      )}
    </React.Fragment>
  );
}

export interface TramitesEditorialProps extends ScreenProps<TramitesData> {
  /** Clic en una fila de la tabla (abre el detalle del trámite). */
  onOpenTramite?: (fila: TramiteFila) => void;
  /** Botón "Ver todos los trámites". */
  onVerTodos?: () => void;
  /** Botón "Ver más" de «Costo estimado por actividad estándar»: abre Costeo. */
  onCosteo?: () => void;
}

/** Trámites con potencial de mejora: dónde se concentran, qué cargas generan y dónde actuar. */
export function TramitesEditorial({
  country,
  paises = PAISES_FIXTURE,
  data,
  onCountryChange,
  filtros,
  userInitials,
  ultimaActualizacion = "15 de septiembre de 2026",
  anios,
  onOpenTramite,
  onVerTodos,
  onCosteo,
}: TramitesEditorialProps) {
  const D = data ?? tramitesFixture(country);
  return (
    <PageShell
      eyebrow="Trámites con potencial de mejora"
      t1="Trámites con"
      t2="potencial de mejora"
      infoKey="tra"
      intro="Evalúa los trámites publicados en el catálogo o portal de trámites del país, sus principales características y las cargas que enfrentan los usuarios para completarlos, identificando dónde se concentran las mayores oportunidades de mejora."
      stats={D.stats}
      country={country}
      paises={paises}
      onCountryChange={onCountryChange}
      filtros={filtros}
      sectorFiltro={country === "Todos" ? undefined : "sector+subsector"}
      userInitials={userInitials}
      ultimaActualizacion={ultimaActualizacion}
      anios={anios ?? "2015–2024"}
    >
      <TramitesBody
        key={country}
        D={D}
        country={country}
        onSelectPais={onCountryChange}
        onOpenTramite={onOpenTramite}
        onVerTodos={onVerTodos}
        onCosteo={onCosteo}
      />
    </PageShell>
  );
}
