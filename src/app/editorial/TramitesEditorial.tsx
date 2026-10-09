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
import { axisProps } from "./charts";
import { CardHead } from "./cardhead";
import { DEFS } from "./defs";
import { fmt1, fmtInt, pct } from "./format";
import { I, Icon } from "./icons";
import { InfoBtn } from "./info";
import { Dd, DdState, DonutList, Fseg, Mejora, Pips, SevPill } from "./ui";
import { PageShell } from "./PageShell";
import { PAISES_FIXTURE, tramitesFixture } from "./fixtures";
import { RAMPS, SEVS, TR_G, T, colorPais } from "./theme";
import type { DesgloseTramite, TramitesData, ScreenProps } from "./types";

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
}: {
  D: TramitesData;
  country: string;
  onSelectPais: (n: string) => void;
  onOpenTramite?: (id?: string) => void;
  onVerTodos?: () => void;
}) {
  const nat = country !== "Todos";
  const [fs, setFs] = useState({
    sec: "Todos",
    ent: "Todos",
    eta: "Todos",
    usu: "Todos",
  });
  const [ns, setNs] = useState({ sec: "10", ent: "10" });
  const [ind, setInd] = useState("usd");
  const [ord, setOrd] = useState("tot");
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
        {payload.map((x) => (
          <div className="r" key={x.dataKey}>
            <i style={{ background: x.color }}></i>
            <span>{x.name}</span>
            <b>{fmtInt(x.value)}</b>
          </div>
        ))}
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
  const hbarsStack = (data, yw, id) => (
    <div className="chart" style={{ height: data.length * 28 + 14 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          barCategoryGap="26%"
        >
          <XAxis type="number" hide={true} />
          <YAxis type="category" dataKey="k" {...tickP(yw)} />
          <Tooltip cursor={{ fill: T.grid, opacity: 0.5 }} content={stackTip} />
          {SEVS.map((s, i) => (
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
                <LabelList dataKey="total" position="right" style={lblStyle} />
              ) : null}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  const hbarsOne = (rows, yw, unit, color, rw) => (
    <div
      className="chart"
      style={{ height: rows.length * (yw > 200 ? 40 : 30) + 14 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 0, right: rw || 48, left: 0, bottom: 0 }}
          barCategoryGap="30%"
        >
          <XAxis type="number" hide={true} />
          <YAxis type="category" dataKey="k" {...tickP(yw)} />
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
            <LabelList dataKey="lab" position="right" style={lblStyle} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
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
  const ctl = (key, topKey, allLabel) => (
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
      {topKey ? (
        <div className="cg cg-view">
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
  );
  const subSev = (key, base) =>
    base +
    (fs[key] === "Todos"
      ? " · Por nivel de severidad"
      : " · Severidad " + fs[key].toLowerCase());
  const pcTot = (n) => Math.round((n / D.tot) * 100) + " %";
  const withLab = (rows, fn, c) =>
    rows.map(([k, v]) => ({ k, v, lab: fn(v), c }));

  const sector = rank(D.sector, fs.sec, ns.sec),
    entidad = rank(D.entidad, fs.ent, ns.ent, "Otras entidades");
  const etapa = natural(D.etapa, fs.eta),
    usuario = rank(D.usuario, fs.usu);
  const opo = withLab(D.opo, (v) => fmtInt(v) + " · " + pcTot(v)),
    acc = withLab(D.acc, (v) => fmtInt(v) + " · " + pcTot(v));
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
  const cAct = nat
    ? D.cAct.map(([k, s, c]) => ({
        k,
        v: ind === "usd" ? D.cost * s : Math.round(D.tot * c),
      }))
    : [];
  const cActRows = cAct.map((r) => ({
    ...r,
    lab: ind === "usd" ? "USD " + fmt1(r.v) + " M" : fmtInt(r.v),
  }));
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
        [
          pcTot(D.opo[0][1]),
          "de los trámites presenta oportunidades de mejora en trámites, requisitos y costos de cumplimiento",
        ],
        [
          Math.round(((top2[0][1] + top2[1][1]) / D.tot) * 100) + " %",
          "de los trámites se concentra en " +
            top2[0][0].toLowerCase() +
            " y " +
            top2[1][0].toLowerCase(),
        ],
        [
          Math.round((totalSev(D.etapa[1]) / D.tot) * 100) + " %",
          "de los trámites con potencial de mejora corresponde a la etapa de operación",
        ],
        [
          Math.round((D.mip[0][1] / mipTot) * 100) + " %",
          "de los trámites tiene una afectación alta a la MIPYME",
        ],
        [
          Math.round(D.cAct[0][1] * 100) + " %",
          "del costo administrativo estimado corresponde a la Actividad estándar 1",
        ],
        [
          pcTot(D.acc[0][1]),
          "de los trámites tiene como acción sugerida simplificar; " +
            pcTot(D.acc[1][1]) +
            ", digitalizar",
        ],
      ]
    : [];

  return (
    <React.Fragment>
      <div className="zone z-base">
        <div className="zi">
          <div
            className="sum s4"
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
              "var(--primary)",
              "Sectores cubiertos",
              fmtInt(D.sec),
              null,
              "sectores económicos",
              I.layers,
              "ksec",
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

          <div className="sevrow">
            <section className="card sevcard">
              <CardHead
                title="Trámites por nivel de severidad"
                sub="Participación de cada nivel en el total de trámites"
              />
              <DonutList
                data={sevData}
                totalLabel="Total de trámites"
                unit="trámites"
                heads={["Nivel"]}
                aria="Trámites por nivel de severidad"
                marker="pips"
              />
            </section>
            <aside className="sevnote" aria-label="Definición de severidad">
              <div className="sn-in">
                <div className="sn-l">
                  <span className="eb">
                    <span className="ico" aria-hidden="true">
                      <Icon d={I.info} />
                    </span>
                    Cómo leer la severidad
                  </span>
                  <p className="lead">{DEFS.tsev.d}</p>
                </div>
                <div className="sn-r">
                  <p className="body">
                    Cada trámite se clasifica en un nivel: <b>Alta</b>,{" "}
                    <b>Media</b> o <b>Baja</b>.
                  </p>
                  <div className="sevkey" aria-label="Marcador de severidad">
                    {SEVS.map((s, i) => (
                      <span className="kc" key={s}>
                        <Pips n={3 - i} color={SEGC[s]} />
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="how">{DEFS.tsev.how}</p>
                </div>
              </div>
            </aside>
          </div>
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
                Distribución según sector económico, entidad responsable, etapa
                del ciclo empresarial y tipo de usuario
              </p>
            </div>
          </div>
          <div className="grid2">
            <section className="card">
              <CardHead
                title="Trámites por sector económico"
                sub={subSev(
                  "sec",
                  ns.sec === "all"
                    ? "Todos los sectores"
                    : "Top " + ns.sec + " sectores",
                )}
              />
              {ctl("sec", "sec", "Todos")}
              {hbarsStack(sector, 150, "s")}
              {Leg}
            </section>
            <section className="card">
              <CardHead
                title="Trámites por entidad responsable"
                sub={subSev(
                  "ent",
                  ns.ent === "all"
                    ? "Todas las entidades"
                    : "Top " + ns.ent + " entidades",
                )}
              />
              {ctl("ent", "ent", "Todas")}
              {hbarsStack(entidad, 190, "e")}
              {Leg}
            </section>
            <section className="card">
              <CardHead
                title="Trámites por etapa del ciclo empresarial"
                sub={subSev(
                  "eta",
                  "Orden del ciclo: apertura, operación, expansión y cierre",
                )}
              />
              {ctl("eta")}
              {hbarsStack(etapa, 110, "c")}
              {Leg}
            </section>
            <section className="card">
              <CardHead
                title="Trámites por tipo de usuario"
                sub={subSev("usu", "Número de trámites")}
              />
              {ctl("usu")}
              {hbarsStack(usuario, 110, "u")}
              {Leg}
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
                  Estimación de costos y principales afectaciones identificadas
                </p>
              </div>
            </div>
            <div className="grid2">
              <section className="card">
                <CardHead
                  title="Costo estimado por actividad estándar"
                  sub={
                    ind === "usd"
                      ? "Millones de dólares (USD)"
                      : "Número de trámites"
                  }
                />
                <div
                  className="ctlrow"
                  role="group"
                  aria-label="Filtros de la gráfica"
                >
                  <div className="cg">
                    <span className="clbl clbl-t">Indicador</span>
                    <Dd
                      value={ind}
                      onChange={setInd}
                      options={[
                        ["usd", "Costo estimado (USD)"],
                        ["n", "Número de trámites"],
                      ]}
                      label="Indicador"
                    />
                  </div>
                </div>
                {hbarsOne(
                  cActRows,
                  150,
                  ind === "usd" ? "Costo estimado" : "Trámites",
                  TR_G,
                  110,
                )}
              </section>
              <section className="card">
                <CardHead
                  title="Costos administrativos por usuario"
                  sub="Millones de dólares (USD), según tipo de usuario"
                />
                {hbarsOne(cUsu, 110, "Costo estimado", TR_G, 110)}
              </section>
              <section className="card">
                <CardHead
                  title="Afectaciones"
                  sub="Principales afectaciones identificadas · número de trámites"
                />
                {hbarsOne(afe, 180, "Trámites", RAMPS.azul.steps[2], 48)}
                <p className="csub" style={{ margin: 0 }}>
                  Un trámite puede presentar más de una afectación.
                </p>
              </section>
              <section className="card">
                <CardHead
                  title="Afectación a la MIPYME"
                  sub="Participación de cada nivel de afectación"
                />
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
                        <span className="mp">{pct(v, mipTot)} %</span>
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

      <section
        className={"zone " + (nat ? "z-alt" : "z-base")}
        aria-labelledby="t3"
      >
        <div className="zi">
          <div className="sechead">
            <span className="num">{nat ? 3 : 2}</span>
            <div>
              <h2 id="t3">
                ¿Dónde actuar para simplificar?
                <InfoBtn k="tact" />
              </h2>
              <p>
                Oportunidades de mejora identificadas y acciones sugeridas para
                los trámites
              </p>
            </div>
          </div>
          <div className={nat ? "grid2 g-act" : "grid2"}>
            <section className="card">
              <CardHead
                title="Trámites por oportunidad de mejora"
                sub="Número de trámites y % del total"
              />
              {hbarsOne(opo, 230, "Trámites", TR_G, 100)}
              <p className="csub" style={{ margin: 0 }}>
                Un trámite puede presentar potencial de mejora en más de una
                oportunidad.
              </p>
            </section>
            <section className="card">
              <CardHead
                title="Trámites por acción de mejora sugerida"
                sub="Número de trámites y % del total"
              />
              {hbarsOne(acc, 130, "Trámites", TR_G, 100)}
              <p className="csub" style={{ margin: 0 }}>
                Un trámite puede tener más de una acción sugerida.
              </p>
            </section>
            {nat ? (
              <section className="card finds-card g-wide">
                <CardHead
                  title="Hallazgos clave"
                  sub={"Lectura rápida de los datos de " + country}
                />
                <ul className="finds tri">
                  {finds.map((f, i) => (
                    <li key={i}>
                      <span className="fv">{f[0]}</span>
                      <span className="ft">{f[1]}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </section>

      {nat ? (
        <section className="zone z-base" aria-labelledby="t4">
          <div className="zi">
            <div className="sechead">
              <span className="num">4</span>
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
                      <th>Oportunidad de mejora</th>
                      <th className="num">Costo estimado (USD)</th>
                      <th>
                        Acción sugerida
                        <InfoBtn k="accion" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(D.tabla ?? []).map((r, i) => (
                      <tr
                        key={r.id ?? i}
                        onClick={
                          onOpenTramite && r.id
                            ? () => onOpenTramite(r.id)
                            : undefined
                        }
                        style={
                          onOpenTramite && r.id
                            ? { cursor: "pointer" }
                            : undefined
                        }
                      >
                        <td className="main">{r.tramite}</td>
                        <td>{r.sector}</td>
                        <td>{r.entidad}</td>
                        <td>{r.etapa}</td>
                        <td>{r.usuario}</td>
                        <td>
                          <SevPill s={r.severidad} />
                        </td>
                        <td>{r.oportunidad}</td>
                        <td className="num">{r.costo}</td>
                        <td>
                          <Mejora t={r.accion} />
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
              <span className="num">3</span>
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
                      <span
                        className="flag"
                        style={{ background: colorPais(r.name, r.i) }}
                      >
                        {r.id}
                      </span>
                      {r.name}
                    </div>
                  </div>
                  <div className="ctlrow">
                    <div className="cg">
                      <span className="clbl">Ámbito</span>
                      <DdState
                        label={"Ámbito de impacto, " + r.name}
                        options={[
                          ["todos", "Todos los ámbitos"],
                          ["Competencia", "Competencia"],
                          ["Comercio", "Comercio"],
                          ["Inversión", "Inversión"],
                          ["Innovación", "Innovación"],
                        ]}
                      />
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
                          {r.sev[i]} · {pct(r.sev[i], r.tot)} %
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
  onOpenTramite?: (id?: string) => void;
  /** Botón "Ver todos los trámites". */
  onVerTodos?: () => void;
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
}: TramitesEditorialProps) {
  const D = data ?? tramitesFixture(country);
  return (
    <PageShell
      eyebrow="Trámites con potencial de mejora"
      t1="Trámites con"
      t2="potencial de mejora"
      infoKey="tra"
      intro="Explora la cantidad, características y cargas asociadas a los trámites identificados, incluyendo dónde se concentran, qué tipo de usuarios afectan, qué cargas generan y cuáles presentan mayores oportunidades de simplificación."
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
      />
    </PageShell>
  );
}
