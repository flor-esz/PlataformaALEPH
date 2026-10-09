import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  Cell,
} from "recharts";
import { axisProps } from "./charts";
import { CardHead } from "./cardhead";
import { DEFS } from "./defs";
import { fmt1, fmtInt, pct } from "./format";
import { I, Icon } from "./icons";
import { InfoBtn } from "./info";
import { Ctl, DdState, DonutList, Dd, Mejora, Pips, SevPill } from "./ui";
import { PageShell } from "./PageShell";
import { PAISES_FIXTURE, barrerasFixture } from "./fixtures";
import { RAMPS, T, colorPais } from "./theme";
import type { BarrerasData, DesgloseBarrera, ScreenProps } from "./types";

const SEV_CLAVE = { Alta: "alta", Media: "media", Baja: "baja" } as const;
const totalFila = (r: DesgloseBarrera) => r.entrada + r.operacion;

function BarrerasBody({
  D,
  country,
  onSelectPais,
  onOpenBarrera,
  onVerTodas,
}: {
  D: BarrerasData;
  country: string;
  onSelectPais: (n: string) => void;
  onOpenBarrera?: (id?: string) => void;
  onVerTodas?: () => void;
}) {
  const nat = country !== "Todos";
  const BB = D;
  const [n3, setN3] = useState("10"),
    [n4, setN4] = useState("10"),
    [ind3, setInd3] = useState("n");
  const [f1, setF1] = useState("Todos"),
    [f2, setF2] = useState("Todos"),
    [f3, setF3] = useState("Todos"),
    [f4, setF4] = useState("Todos");
  const [d1, setD1] = useState("tipo"),
    [d2, setD2] = useState("tipo"),
    [d3, setD3] = useState("tipo"),
    [d4, setD4] = useState("tipo");
  const barFill0 = T.entrada;
  const SEGS = {
    tipo: [
      { key: "Entrada", color: T.entrada, ink: "#fff" },
      { key: "Operación", color: T.operacion, ink: T.opInk },
    ],
    sev: [
      { key: "Alta", color: T.sev.Alta, ink: "#fff" },
      { key: "Media", color: T.sev.Media, ink: "#1b1b1b" },
      { key: "Baja", color: T.sev.Baja, ink: "#1b1b1b" },
    ],
    total: [{ key: "Barreras", color: barFill0, ink: "#fff" }],
  };
  // Una fila del gráfico según el desglose elegido (`dis`) y el filtro de severidad (`f`).
  // Los valores salen de la propia fila (entrada/operación/alta/media/baja); si hay filtro
  // de severidad y se desglosa por tipo, usa `row.cruce` y, si falta, reparte en proporción.
  const mk = (dis: string, label: string, row: DesgloseBarrera, f: string) => {
    const segs = SEGS[dis];
    const o: any = { k: label };
    const tot = totalFila(row);
    const sevN = f === "Todos" ? tot : row[SEV_CLAVE[f]];
    if (dis === "tipo") {
      const c =
        f === "Todos"
          ? { entrada: row.entrada, operacion: row.operacion }
          : (row.cruce?.[f] ??
            (() => {
              const e = tot ? Math.round((sevN * row.entrada) / tot) : 0;
              return { entrada: e, operacion: sevN - e };
            })());
      o.Entrada = c.entrada;
      o["Operación"] = c.operacion;
    } else if (dis === "sev") {
      o.Alta = f === "Todos" || f === "Alta" ? row.alta : 0;
      o.Media = f === "Todos" || f === "Media" ? row.media : 0;
      o.Baja = f === "Todos" || f === "Baja" ? row.baja : 0;
    } else {
      o.Barreras = sevN;
    }
    o.total = segs.reduce((x, sg) => x + o[sg.key], 0);
    return o;
  };
  const byTot = (a, b) => b.total - a.total; // rankings: mayor a menor
  const AMB_C = ["#196e8c", "#4b894a", "#8dba38", "#009ade"]; // categorías nominales: el color sigue al ámbito, no al ranking
  const ambDon = BB.ambito
    .map((a, i) => {
      const o = mk(d1, a.k, a, f1);
      return {
        name: a.k,
        value: o.total,
        color: AMB_C[i],
        parts:
          d1 === "total"
            ? null
            : SEGS[d1].map((sg) => ({
                k: sg.key,
                v: o[sg.key],
                color: sg.color,
              })),
      };
    })
    .sort((x, y) => y.value - x.value);
  const jer = BB.jerarquia
    .map((j, i) => ({ ...mk(d2, j.k, j, f2), ci: i }))
    .sort(byTot); // ci = nivel original: el color sigue al nivel normativo, no a su posición
  const inst = ind3 === "inst";
  const secAll = BB.sector
    .map((s2, i) => {
      const o = mk(d3, s2.k, s2, f3);
      if (inst) {
        const ni = BB.instrumentos[i];
        SEGS[d3].forEach((sg) => {
          o[sg.key] = +(o[sg.key] / ni).toFixed(2);
        });
        o.total = +SEGS[d3].reduce((x, sg) => x + o[sg.key], 0).toFixed(2);
      }
      return o;
    })
    .sort(byTot);
  const sec = n3 === "all" ? secAll : secAll.slice(0, +n3);
  const fv = inst ? fmt1 : fmtInt;
  const entAll = BB.entidad
    .map((e) => mk(d4, e.k, e, f4))
    .sort((a, b) =>
      a.k === "Otras entidades"
        ? 1
        : b.k === "Otras entidades"
          ? -1
          : b.total - a.total,
    );
  const ent = n4 === "all" ? entAll : entAll.slice(0, +n4);
  const pd = (n) =>
    (Math.round((n / BB.total) * 1000) / 10).toFixed(1).replace(".", ",");
  const sevData = BB.sev.map(([name, value], i) => ({
    name,
    value,
    color: T.sev[name],
    cap: "Severidad " + name,
  }));
  const barFill = T.entrada;

  const stackTip = ({ active, payload, label }) =>
    active && payload && payload.length ? (
      <div className="tt">
        <div className="t">{label}</div>
        <div className="r">
          <i style={{ background: "transparent" }}></i>
          <span>Total de barreras</span>
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
  const secTip = ({ active, payload, label }) =>
    active && payload && payload.length ? (
      <div className="tt">
        <div className="t">{label}</div>
        <div className="r">
          <i style={{ background: "transparent" }}></i>
          <span>{inst ? "Barreras por instrumento" : "Total de barreras"}</span>
          <b>{fv(payload[0].payload.total)}</b>
        </div>
        {payload.map((x) => (
          <div className="r" key={x.dataKey}>
            <i style={{ background: x.color }}></i>
            <span>{x.name}</span>
            <b>{fv(x.value)}</b>
          </div>
        ))}
      </div>
    ) : null;
  const oneTip =
    (lbl) =>
    ({ active, payload, label }) =>
      active && payload && payload.length ? (
        <div className="tt">
          <div className="t">{label}</div>
          <div className="r">
            <i style={{ background: barFill }}></i>
            <span>{lbl}</span>
            <b>{fmtInt(payload[0].value)}</b>
          </div>
        </div>
      ) : null;
  const insideLbl =
    (fill) =>
    ({ x, y, width, height, value }) =>
      width > 30 ? (
        <text
          x={x + width / 2}
          y={y + height / 2}
          fill={fill}
          fontSize="11.5"
          fontWeight="600"
          fontFamily="Inter, system-ui, sans-serif"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {value}
        </text>
      ) : null;
  const lblStyle = {
    fill: "var(--ink)",
    fontSize: 12.5,
    fontWeight: 700,
    fontFamily: "Inter, system-ui, sans-serif",
  };
  const bars = (dis, stackId, maxBar, horizontal, inside, cells, fmtL) => {
    const segs = SEGS[dis];
    return segs.map((sg, i) => (
      <Bar
        key={dis + sg.key}
        dataKey={sg.key}
        name={sg.key}
        stackId={stackId}
        fill={sg.color}
        maxBarSize={maxBar}
        radius={
          i === segs.length - 1 ? (horizontal ? [0, 4, 4, 0] : T.barRadius) : 0
        }
        isAnimationActive={false}
        stroke={T.surface}
        strokeWidth={1}
      >
        {cells && segs.length === 1 ? cells : null}
        {inside && segs.length > 1 ? (
          <LabelList dataKey={sg.key} content={insideLbl(sg.ink)} />
        ) : null}
        {i === segs.length - 1 ? (
          <LabelList
            dataKey="total"
            position={horizontal ? "right" : "top"}
            style={lblStyle}
            formatter={fmtL}
          />
        ) : null}
      </Bar>
    ));
  };
  const subOf = (dis, base) =>
    dis === "tipo"
      ? base + " · Entrada y Operación"
      : dis === "sev"
        ? base + " · Por nivel de severidad"
        : base;
  const Leg = (dis) => (
    <div className="dislegend" style={{ marginLeft: 0 }} aria-label="Leyenda">
      {SEGS[dis].map((sg, i) => (
        <span className="dl" key={sg.key}>
          {dis === "sev" ? (
            <Pips n={3 - i} color={sg.color} />
          ) : (
            <i
              style={{ background: dis === "total" ? barFill0 : sg.color }}
            ></i>
          )}
          {dis === "total" ? "Total de barreras" : sg.key}
        </span>
      ))}
    </div>
  );

  const pE = pct(BB.entrada, BB.total),
    pO = 100 - pE;
  const ACC_C = ["#266736", "#4b894a", "#83b38f", "#8dba38"];
  const accDon = (BB.acciones ?? [])
    .map(([k, v]: any, i: number) => ({
      name: k,
      value: v,
      color: ACC_C[i % ACC_C.length],
    }))
    .sort((a: any, b: any) => b.value - a.value);
  const ambTot = BB.ambito
    .map((a) => [a.k, totalFila(a)] as [string, number])
    .sort((a, b) => b[1] - a[1]);
  const secTot = BB.sector
    .map((x) => [x.k, totalFila(x)] as [string, number])
    .sort((a, b) => b[1] - a[1]);
  const jerTot = BB.jerarquia
    .map((x) => [x.k, totalFila(x)] as [string, number])
    .sort((a, b) => b[1] - a[1]);
  const finds: [string, string][] = !nat
    ? []
    : [
        [
          pE + " %",
          "de las barreras de " +
            country +
            " son de entrada y acceso al mercado",
        ],
        [
          pct(secTot[0][1] + secTot[1][1], BB.total) + " %",
          "se concentra en " + secTot[0][0] + " y " + secTot[1][0],
        ],
        [pct(BB.sev[0][1], BB.total) + " %", "tiene severidad alta"],
        [
          pct(ambTot[0][1], BB.total) + " %",
          "corresponde al ámbito " + ambTot[0][0] + ", el de mayor impacto",
        ],
        [
          pct(jerTot[0][1], BB.total) + " %",
          "está en la jerarquía normativa " + jerTot[0][0],
        ],
        [
          pct(accDon[0].value, BB.total) + " %",
          "tiene como acción sugerida " + accDon[0].name,
        ],
      ];
  return (
    <React.Fragment>
      <div className="zone z-base">
        <div className="zi">
          <div
            className="sum"
            aria-label="Barreras regulatorias totales = entrada + operación"
          >
            <div className="kpi kmain">
              <span
                className="band"
                style={{ background: "var(--primary)" }}
              ></span>
              <div className="k">
                Barreras regulatorias totales
                <InfoBtn k="tot" />
                <span className="ksub">Entrada + Operación</span>
              </div>
              <div className="v">
                {fmtInt(BB.total)}
                <small>
                  {nat
                    ? "en " + country
                    : "en " + (BB.paises?.length ?? 0) + " países"}
                </small>
              </div>
              <div className="tsplit">
                <div className="kd-t">Distribución</div>
                <div
                  className="splitrow"
                  role="img"
                  aria-label={"Entrada " + pE + " %, operación " + pO + " %"}
                >
                  <span className="pl">{pE} %</span>
                  <div className="split" aria-hidden="true">
                    <i style={{ width: pE + "%", background: T.entrada }}></i>
                    <i style={{ flex: 1, background: T.operacion }}></i>
                  </div>
                  <span className="pl">{pO} %</span>
                </div>
                <div className="tleg" aria-hidden="true">
                  <span>
                    <i style={{ background: T.entrada }}></i>Entrada
                  </span>
                  <span>
                    <i style={{ background: T.operacion }}></i>Operación
                  </span>
                </div>
              </div>
            </div>
            <div className="op" aria-hidden="true">
              =
            </div>
            <div className="kpi has-share">
              <span className="band" style={{ background: T.entrada }}></span>
              <div className="k">
                Barreras de entrada y acceso al mercado
                <InfoBtn k="ent" />
              </div>
              <div
                className="share"
                role="img"
                aria-label={pE + " % del total"}
                style={{ "--c": T.entrada, "--p": pE }}
              >
                <b>
                  {pE}
                  <small>%</small>
                </b>
              </div>
              <div className="v">{fmtInt(BB.entrada)}</div>
              <div className="d">
                Restricciones que afectan la entrada, participación o acceso de
                actores al mercado.
              </div>
              <div className="kdef">
                <div className="kd-t">Definición</div>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore.
                </p>
              </div>
            </div>
            <div className="op" aria-hidden="true">
              +
            </div>
            <div className="kpi has-share">
              <span className="band" style={{ background: T.operacion }}></span>
              <div className="k">
                Barreras de operación y modelos de negocio
                <InfoBtn k="ope" />
              </div>
              <div
                className="share"
                role="img"
                aria-label={pO + " % del total"}
                style={{ "--c": T.operacion, "--p": pO }}
              >
                <b>
                  {pO}
                  <small>%</small>
                </b>
              </div>
              <div className="v">{fmtInt(BB.operacion)}</div>
              <div className="d">
                Restricciones que afectan cómo las empresas operan o desarrollan
                sus modelos de negocio.
              </div>
              <div className="kdef">
                <div className="kd-t">Definición</div>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore.
                </p>
              </div>
            </div>
          </div>

          <div className="sevrow">
            <section className="card sevcard">
              <CardHead
                title="Barreras por nivel de severidad"
                sub="Participación de cada nivel en el total de barreras"
              />
              <DonutList
                data={sevData}
                totalLabel="Total de barreras"
                heads={["Nivel"]}
                aria="Barreras por nivel de severidad"
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
                  <p className="lead">{DEFS.sev.d.split(". ")[0]}.</p>
                </div>
                <div className="sn-r">
                  <p className="body">
                    Cada barrera se clasifica en un nivel: <b>Alta</b>,{" "}
                    <b>Media</b> o <b>Baja</b>.
                  </p>
                  <div className="sevkey" aria-label="Marcador de severidad">
                    {BB.sev.map(([s], i) => (
                      <span className="kc" key={s}>
                        <Pips n={3 - i} color={T.sev[s]} />
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="how">{DEFS.sev.how}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <section className="zone z-alt" aria-labelledby="sec1">
        <div className="zi">
          <div className="sechead">
            <span className="num">1</span>
            <div>
              <h2 id="sec1">
                ¿Dónde se concentran las barreras regulatorias?
                <InfoBtn k="sec1" />
              </h2>
              <p>
                Distribución según ámbito de impacto, jerarquía normativa,
                sector económico y entidad emisora
              </p>
            </div>
          </div>

          <div className="grid2">
            <section className="card">
              <CardHead
                title="Barreras por ámbito de impacto"
                sub={
                  subOf(d1, "Participación de cada ámbito en el total") +
                  (f1 === "Todos" ? "" : " · Severidad " + f1.toLowerCase())
                }
              />
              <Ctl f={f1} setF={setF1} d={d1} setD={setD1} />
              <DonutList
                data={ambDon}
                totalLabel="Total de barreras"
                size={208}
                heads={["Ámbito"]}
                aria="Barreras por ámbito de impacto"
                marker="dot"
                legend={d1 === "total" ? null : Leg(d1)}
              />
            </section>

            <section className="card">
              <CardHead
                title="Barreras por jerarquía normativa"
                sub={subOf(d2, "Por nivel normativo")}
              />
              <Ctl f={f2} setF={setF2} d={d2} setD={setD2} />
              <div className="chart tall">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={jer}
                    layout="vertical"
                    margin={{ top: 4, right: 44, left: 0, bottom: 0 }}
                    barCategoryGap="32%"
                  >
                    <XAxis type="number" hide={true} />
                    <YAxis
                      type="category"
                      dataKey="k"
                      {...axisProps(T)}
                      width={170}
                      tick={{
                        fill: T.axis,
                        fontSize: 12,
                        fontFamily: "Inter, system-ui, sans-serif",
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: T.grid, opacity: 0.5 }}
                      content={stackTip}
                    />
                    {bars(
                      d2,
                      "j",
                      22,
                      true,
                      false,
                      jer.map((d) => (
                        <Cell key={d.ci} fill={RAMPS.azul.steps[4 - d.ci]} />
                      )),
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {Leg(d2)}
              <p className="csub" style={{ margin: 0 }}>
                <b style={{ color: "var(--ink)" }}>Hallazgo:</b> 2 de cada 3
                barreras de severidad alta están en normas de nivel
                reglamentario o inferior.
              </p>
            </section>

            <section className="card">
              <CardHead
                title="Barreras por sector económico"
                sub={
                  (n3 === "all"
                    ? "Todos los sectores"
                    : "Top " + n3 + " sectores") +
                  (inst ? " · Barreras por instrumento normativo" : "") +
                  (d3 === "tipo"
                    ? " · Entrada y Operación"
                    : d3 === "sev"
                      ? " · Por nivel de severidad"
                      : "")
                }
              />
              <Ctl f={f3} setF={setF3} d={d3} setD={setD3} />
              <div
                className="ctlrow"
                role="group"
                aria-label="Opciones de la gráfica"
              >
                <div className="cg">
                  <span className="clbl clbl-t">Indicador</span>
                  <Dd
                    value={ind3}
                    onChange={setInd3}
                    options={[
                      ["n", "Número de barreras"],
                      [
                        "inst",
                        "Barreras por instrumento normativo",
                        "Barreras por instrumento normativo",
                        "Promedio de barreras por cada instrumento",
                      ],
                    ]}
                    label="Indicador"
                  />
                </div>
                <div className="cg">
                  <span className="clbl clbl-t">Mostrar</span>
                  <Dd
                    value={n3}
                    onChange={setN3}
                    options={[
                      ["5", "Top 5"],
                      ["10", "Top 10"],
                      ["all", "Todos"],
                    ]}
                    label="Cantidad de sectores a mostrar"
                  />
                </div>
              </div>
              <div className="chart" style={{ height: sec.length * 30 + 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sec}
                    layout="vertical"
                    margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                    barCategoryGap="26%"
                  >
                    <XAxis type="number" hide={true} />
                    <YAxis
                      type="category"
                      dataKey="k"
                      {...axisProps(T)}
                      width={136}
                      tick={{
                        fill: T.axis,
                        fontSize: 12,
                        fontFamily: "Inter, system-ui, sans-serif",
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: T.grid, opacity: 0.5 }}
                      content={secTip}
                    />
                    {bars(d3, "s", 16, true, false, undefined, fv)}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {Leg(d3)}
            </section>

            <section className="card">
              <CardHead
                title="Barreras por entidad emisora"
                sub={subOf(
                  d4,
                  n4 === "all"
                    ? "Todas las entidades"
                    : "Top " + n4 + " entidades",
                )}
              />
              <Ctl f={f4} setF={setF4} d={d4} setD={setD4} />
              <div
                className="ctlrow"
                role="group"
                aria-label="Opciones de la gráfica"
              >
                <div className="cg">
                  <span className="clbl clbl-t">Mostrar</span>
                  <Dd
                    value={n4}
                    onChange={setN4}
                    options={[
                      ["5", "Top 5"],
                      ["10", "Top 10"],
                      ["all", "Todas"],
                    ]}
                    label="Cantidad de entidades a mostrar"
                  />
                </div>
              </div>
              <div className="chart" style={{ height: ent.length * 30 + 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ent}
                    layout="vertical"
                    margin={{ top: 0, right: 44, left: 0, bottom: 0 }}
                    barCategoryGap="30%"
                  >
                    <XAxis type="number" hide={true} />
                    <YAxis
                      type="category"
                      dataKey="k"
                      {...axisProps(T)}
                      width={190}
                      tick={{
                        fill: T.axis,
                        fontSize: 12,
                        fontFamily: "Inter, system-ui, sans-serif",
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: T.grid, opacity: 0.5 }}
                      content={stackTip}
                    />
                    {bars(d4, "e", 16, true, false)}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {Leg(d4)}
            </section>
          </div>
        </div>
      </section>
      {nat ? (
        <>
          <section className="zone z-base" aria-labelledby="sec2">
            <div className="zi">
              <div className="sechead">
                <span className="num">2</span>
                <div>
                  <h2 id="sec2">
                    ¿Dónde actuar para reducir las barreras?
                    <InfoBtn k="bact" />
                  </h2>
                  <p>
                    Acciones sugeridas y lectura rápida de los datos de{" "}
                    {country}
                  </p>
                </div>
              </div>
              <div className="grid2">
                <section className="card">
                  <CardHead
                    title="Barreras por acción sugerida"
                    sub="Participación de cada acción en el total de barreras"
                  />
                  <DonutList
                    data={accDon}
                    totalLabel="Total de barreras"
                    size={208}
                    heads={["Acción"]}
                    aria="Barreras por acción sugerida"
                    marker="dot"
                  />
                </section>
                <section className="card">
                  <CardHead
                    title="Hallazgos clave"
                    sub={"Lectura rápida de los datos de " + country}
                  />
                  <ul className="finds one">
                    {finds.map((f, i) => (
                      <li key={i}>
                        <span className="fv">{f[0]}</span>
                        <span className="ft">{f[1]}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </section>
          <section className="zone z-base" aria-labelledby="sec3">
            <div className="zi">
              <div className="sechead">
                <span className="num">3</span>
                <div>
                  <h2 id="sec3">
                    Principales barreras identificadas en {country}
                    <InfoBtn k="sec3" />
                  </h2>
                  <p>
                    Detalle de las barreras identificadas. Selecciona una
                    barrera para ver su ficha completa.
                  </p>
                </div>
              </div>
              <section className="card">
                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Barrera</th>
                        <th>Sector / Subsector</th>
                        <th>
                          Tipo
                          <InfoBtn k="tipo" />
                        </th>
                        <th>
                          Ámbito
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
                      </tr>
                    </thead>
                    <tbody>
                      {(BB.tabla ?? []).map((r: any, i: number) => (
                        <tr
                          key={r.id ?? i}
                          onClick={
                            onOpenBarrera && r.id
                              ? () => onOpenBarrera(r.id)
                              : undefined
                          }
                          style={
                            onOpenBarrera && r.id
                              ? { cursor: "pointer" }
                              : undefined
                          }
                        >
                          <td className="main">{r.barrera}</td>
                          <td>{r.sector}</td>
                          <td>
                            <span
                              className="pill"
                              style={{
                                background:
                                  (r.tipo === "Entrada"
                                    ? T.entrada
                                    : T.operacion) + "1f",
                                color: "var(--ink)",
                              }}
                            >
                              <i
                                style={{
                                  background:
                                    r.tipo === "Entrada"
                                      ? T.entrada
                                      : T.operacion,
                                }}
                              ></i>
                              {r.tipo}
                            </span>
                          </td>
                          <td>{r.ambito}</td>
                          <td>{r.regulacion}</td>
                          <td>{r.entidad}</td>
                          <td>
                            <SevPill s={r.severidad} />
                          </td>
                          <td>
                            <Mejora t={r.accion} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn primary" onClick={onVerTodas}>
                    Ver todas las barreras <Icon d={I.arrow} />
                  </button>
                </div>
              </section>
            </div>
          </section>
        </>
      ) : (
        <section className="zone z-base" aria-labelledby="sec2">
          <div className="zi">
            <div className="sechead">
              <span className="num">2</span>
              <div>
                <h2 id="sec2">
                  Barreras regulatorias por país
                  <InfoBtn k="sec2" />
                </h2>
                <p>
                  Ordenados de mayor a menor número de barreras. Selecciona un
                  país para explorar su detalle
                </p>
              </div>
            </div>
            <div className="countries">
              {(BB.paises ?? [])
                .map((r: any, i: number) => [r, i])
                .sort((a, b) => b[0][2] + b[0][3] - (a[0][2] + a[0][3]))
                .map(([[id, name, e, o], i]) => (
                  <section className="card cc" key={id}>
                    <div className="top2">
                      <div className="name">
                        <span
                          className="flag"
                          style={{ background: colorPais(name, i) }}
                        >
                          {id}
                        </span>
                        {name}
                      </div>
                    </div>
                    <div className="ctlrow">
                      <div className="cg">
                        <span className="clbl">Ámbito</span>
                        <DdState
                          label={"Ámbito de impacto, " + name}
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
                      {e + o}
                      <small>barreras identificadas</small>
                    </div>
                    <div
                      className="split"
                      style={{ height: 10 }}
                      aria-hidden="true"
                    >
                      <i
                        style={{
                          width: pct(e, e + o) + "%",
                          background: T.entrada,
                        }}
                      ></i>
                      <i style={{ flex: 1, background: T.operacion }}></i>
                    </div>
                    <div className="legend">
                      <span>
                        <i style={{ background: T.entrada }}></i>Entrada
                      </span>
                      <b>
                        {e} · {pct(e, e + o)} %
                      </b>
                      <span>
                        <i style={{ background: T.operacion }}></i>Operación
                      </span>
                      <b>
                        {o} · {pct(o, e + o)} %
                      </b>
                    </div>
                    <button
                      className="btn"
                      style={{ marginTop: 4 }}
                      onClick={() => onSelectPais(name)}
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

export interface BarrerasEditorialProps extends ScreenProps<BarrerasData> {
  /** Clic en una fila de la tabla (abre el detalle de la barrera). */
  onOpenBarrera?: (id?: string) => void;
  /** Botón "Ver todas las barreras". */
  onVerTodas?: () => void;
}

/** Barreras regulatorias: composición por tipo, severidad, ámbito, sector y entidad. */
export function BarrerasEditorial({
  country,
  paises = PAISES_FIXTURE,
  data,
  onCountryChange,
  filtros,
  userInitials,
  ultimaActualizacion = "15 de septiembre de 2026",
  anios,
  onOpenBarrera,
  onVerTodas,
}: BarrerasEditorialProps) {
  const D = data ?? barrerasFixture(country);
  return (
    <PageShell
      eyebrow="Barreras regulatorias"
      t1="Barreras"
      t2="regulatorias"
      infoKey="bar"
      intro="Explora la cantidad, composición y características de las barreras regulatorias identificadas, según su tipo, nivel de severidad, ámbito de impacto, país, sector, marco normativo y entidad emisora."
      stats={D.stats}
      country={country}
      paises={paises}
      onCountryChange={onCountryChange}
      filtros={filtros}
      sectorFiltro={country === "Todos" ? "sector" : "sector+subsector"}
      userInitials={userInitials}
      ultimaActualizacion={ultimaActualizacion}
      anios={anios ?? "2015–2024"}
    >
      <BarrerasBody
        key={country}
        D={D}
        country={country}
        onSelectPais={onCountryChange}
        onOpenBarrera={onOpenBarrera}
        onVerTodas={onVerTodas}
      />
    </PageShell>
  );
}
