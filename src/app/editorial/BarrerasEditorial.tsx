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
import {
  AX_TOP,
  AX_XH0,
  OTROS,
  axT,
  axisProps,
  otrosNote,
  star,
  valAxis,
  yW,
} from "./charts";
import { CardHead } from "./cardhead";
import { DEFS } from "./defs";
import { fmt1, fmtInt, pct } from "./format";
import { I, Icon } from "./icons";
import { InfoBtn } from "./info";
import {
  Ctl,
  CtlSev,
  DdState,
  DonutList,
  Dd,
  Flag,
  Mejora,
  Pips,
  SEV_DEFS,
  SevPanel,
  SevPill,
} from "./ui";
import { PageShell } from "./PageShell";
import { PAISES_FIXTURE, barrerasFixture } from "./fixtures";
import { COLORES_SERIE, RAMPS, T, colorPais } from "./theme";
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
  const [d2, setD2] = useState("total"),
    [d3, setD3] = useState("total"),
    [d4, setD4] = useState("total"); // B5: por defecto sin desagregación
  const [xAcc, setXAcc] = useState<string | null>(null),
    [xTipo, setXTipo] = useState("Todas"),
    [xSec, setXSec] = useState("Todos"); // X1: acción elegida y filtros del panel
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
  const byTot = (a, b) =>
    (OTROS[a.k] ? 1 : 0) - (OTROS[b.k] ? 1 : 0) || b.total - a.total; // rankings: mayor a menor; «Otro/Otras…» siempre al final
  const AMB_C = ["#196e8c", "#4b894a", "#8dba38", "#009ade"]; // categorías nominales: el color sigue al ámbito, no al ranking
  /* B6: ámbito sin desagregación (una sola leyenda de color: la del ámbito) y con espacio para la definición de cada uno */
  const ambDon = BB.ambito
    .map((a, i) => {
      const o = mk("total", a.k, a, f1);
      return { name: a.k, value: o.total, color: AMB_C[i] };
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
  const entAll = BB.entidad.map((e) => mk(d4, e.k, e, f4)).sort(byTot);
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
  const secTip = ({ active, payload, label }) =>
    active && payload && payload.length ? (
      <div className="tt">
        <div className="t">{label}</div>
        <div className="r">
          <i style={{ background: "transparent" }}></i>
          <span>{inst ? "Barreras por instrumento" : "Total de barreras"}</span>
          <b>{fv(payload[0].payload.total)}</b>
        </div>
        {payload.length > 1
          ? payload.map((x) => (
              <div className="r" key={x.dataKey}>
                <i style={{ background: x.color }}></i>
                <span>{x.name}</span>
                <b>{fv(x.value)}</b>
              </div>
            ))
          : null}
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
  const bars = (
    dis: any,
    stackId: any,
    maxBar: any,
    horizontal?: any,
    inside?: any,
    cells?: any,
    fmtL?: any,
  ) => {
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
  const Leg = (dis) =>
    dis === "total" ? null : (
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

  const MIPB = [RAMPS.azul.steps[3], RAMPS.azul.steps[1], RAMPS.azul.steps[0]];
  const pE = pct(BB.entrada, BB.total),
    pO = 100 - pE;
  const ACC_C = ["#266736", "#8dba38", "#4b894a", "#83b38f", "#557022"];
  const accDon = (BB.acciones ?? [])
    .map(([k, v]: any, i: number) => ({
      name: k,
      value: v,
      color: ACC_C[i % ACC_C.length],
    }))
    .sort((a: any, b: any) => b.value - a.value);
  /* X1 · Desagregación de la acción sugerida: matriz tipo de norma × sector para la acción elegida.
     Con datos reales llega en `BB.accionMatriz[acción][tipo][sector]`; sin ella se reparte un ejemplo. */
  const acc = accDon.find((a) => a.name === xAcc) ||
    accDon[0] || { name: "", value: 0, color: T.entrada }; // vista regional: sin acciones
  const hsh = (str: string) => {
    let h = 2166136261;
    for (const c of str) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 1000) / 1000;
  };
  const tot2 = (r: { entrada: number; operacion: number }) =>
    r.entrada + r.operacion;
  const xTypes = BB.jerarquia.map((j) => j.k),
    xSecs = BB.sector.map((x) => x.k);
  const xDemo = () => {
    const xW = BB.jerarquia.flatMap((j) =>
      BB.sector.map(
        (sc) =>
          tot2(j) *
          (0.5 + hsh(acc.name + j.k)) *
          tot2(sc) *
          (0.5 + hsh(acc.name + sc.k)) *
          (0.6 + 0.8 * hsh(acc.name + j.k + sc.k)),
      ),
    );
    const xWs = xW.reduce((a, b) => a + b, 0);
    return xW.map((w) => Math.round((acc.value * w) / xWs));
  };
  const xMat = BB.accionMatriz?.[acc.name];
  const xM: number[] = xMat
    ? xTypes.flatMap((t) => xSecs.map((sc) => xMat[t]?.[sc] ?? 0))
    : xDemo(); // xM[ti*nS+si]
  const nS = xSecs.length;
  const xByTipo = xTypes
    .map((t, ti) => ({
      k: t,
      total: xSecs.reduce(
        (a, _, si) =>
          a + (xSec === "Todos" || xSec === xSecs[si] ? xM[ti * nS + si] : 0),
        0,
      ),
      ci: ti, // mismo orden de tipos que Panorama → mismo color
    }))
    .sort(
      (a, b) =>
        (OTROS[a.k] ? 1 : 0) - (OTROS[b.k] ? 1 : 0) || b.total - a.total,
    );
  const xSecAll = xSecs
    .map((sc, si) => ({
      k: sc,
      total: xTypes.reduce(
        (a, t, ti) =>
          a + (xTipo === "Todas" || xTipo === t ? xM[ti * nS + si] : 0),
        0,
      ),
    }))
    .sort((a, b) => b.total - a.total);
  const xBySec = xSecAll; // el BID pide quitar «Otros» en los gráficos por sector: se muestran todos
  const xTotT = xByTipo.reduce((a, r) => a + r.total, 0),
    xTotS = xBySec.reduce((a, r) => a + r.total, 0);
  const xTip = ({ active, payload, label }: any) =>
    active && payload && payload.length ? (
      <div className="tt">
        <div className="t">{label}</div>
        <div className="r">
          <i
            style={{
              background:
                payload[0].payload.ci != null
                  ? COLORES_SERIE[payload[0].payload.ci % COLORES_SERIE.length]
                  : acc.color,
            }}
          ></i>
          <span>Barreras</span>
          <b>{fmtInt(payload[0].value)}</b>
        </div>
      </div>
    ) : null;
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
          "corresponde al canal de transmisión " +
            ambTot[0][0] +
            ", el de mayor impacto",
        ],
        [
          pct(jerTot[0][1], BB.total) + " %",
          "es de tipo " + jerTot[0][0],
        ],
        BB.diagnostico ?? ["18 %", "Diagnóstico"], // pendiente: el BID define el hallazgo «Diagnóstico»
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
              <div className="kdef">
                <div className="kd-t">Definición</div>
                <p>{DEFS.tot.d}</p>
              </div>
            </div>
            <div className="op" aria-hidden="true">
              =
            </div>
            <div className="kpi has-share">
              <span className="band" style={{ background: T.entrada }}></span>
              <div className="k ktint" style={{ color: T.entradaTxt }}>
                Barreras de entrada y acceso al mercado
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
                  Licencias, cupos, requisitos financieros o societarios,
                  restricciones territoriales, derechos exclusivos y otras
                  condiciones que pueden limitar el ingreso de nuevos
                  participantes a mercados competitivos.
                </p>
              </div>
            </div>
            <div className="op" aria-hidden="true">
              +
            </div>
            <div className="kpi has-share">
              <span className="band" style={{ background: T.operacion }}></span>
              <div className="k ktint" style={{ color: T.operacion }}>
                Barreras de operación y modelos de negocio
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
                  Límites a precios, capacidad, horarios, integración,
                  tecnología, modelos digitales y otras condiciones que pueden
                  restringir la forma de operar, competir, crecer o innovar.
                </p>
              </div>
            </div>
          </div>

          <SevPanel
            T={T}
            title="Barreras por nivel de severidad"
            data={sevData}
            totalLabel="Total de barreras"
            aria="Barreras por nivel de severidad"
            def={DEFS.sev}
            defs={SEV_DEFS}
          />
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
                Distribución según canal de transmisión, tipo de regulación,
                sector económico y entidad emisora
              </p>
            </div>
          </div>

          <div className="grid2">
            <section className="card">
              <CardHead title="Barreras por canal de transmisión" />
              <CtlSev f={f1} setF={setF1} />
              <DonutList
                data={ambDon}
                totalLabel="Total de barreras"
                size={208}
                heads={["Canal de transmisión"]}
                aria="Barreras por canal de transmisión"
                marker="dot"
              />
            </section>

            <section className="card">
              <CardHead title="Barreras por tipo de regulación" />
              <Ctl f={f2} setF={setF2} d={d2} setD={setD2} />
              <div
                className="chart"
                style={{ height: jer.length * 40 + 12 + AX_TOP + AX_XH0 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={jer}
                    layout="vertical"
                    margin={{ top: AX_TOP, right: 44, left: 0, bottom: 0 }}
                    barCategoryGap="32%"
                  >
                    {valAxis("Número de barreras")}
                    <YAxis
                      type="category"
                      dataKey="k"
                      {...axisProps(T)}
                      width={yW(110, "Tipo")}
                      tick={{
                        fill: T.axis,
                        fontSize: 12,
                        fontFamily: "Inter, system-ui, sans-serif",
                      }}
                      tickFormatter={star}
                      label={axT("Tipo", "yr")}
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
                        <Cell
                          key={d.ci}
                          fill={COLORES_SERIE[d.ci % COLORES_SERIE.length]}
                        />
                      )),
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {Leg(d2)}
              <p className="csub" style={{ margin: 0 }}>
                <b style={{ color: "var(--ink)" }}>Hallazgo:</b> 2 de cada 3
                barreras de severidad alta están en decretos y resoluciones.
              </p>
              {otrosNote(jer.map((r) => r.k))}
            </section>

            <section className="card">
              <CardHead title="Barreras por sector económico" />
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
              <div
                className="chart"
                style={{ height: sec.length * 30 + 12 + AX_TOP + AX_XH0 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sec}
                    layout="vertical"
                    margin={{ top: AX_TOP, right: 40, left: 0, bottom: 0 }}
                    barCategoryGap="26%"
                  >
                    {valAxis(
                      inst
                        ? "Barreras por instrumento normativo"
                        : "Número de barreras",
                    )}
                    <YAxis
                      type="category"
                      dataKey="k"
                      {...axisProps(T)}
                      width={yW(136, "Sector económico")}
                      tick={{
                        fill: T.axis,
                        fontSize: 12,
                        fontFamily: "Inter, system-ui, sans-serif",
                      }}
                      label={axT("Sector económico", "yr")}
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
              <CardHead title="Barreras por entidad emisora" />
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
              <div
                className="chart"
                style={{ height: ent.length * 30 + 12 + AX_TOP + AX_XH0 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ent}
                    layout="vertical"
                    margin={{ top: AX_TOP, right: 44, left: 0, bottom: 0 }}
                    barCategoryGap="30%"
                  >
                    {valAxis("Número de barreras")}
                    <YAxis
                      type="category"
                      dataKey="k"
                      {...axisProps(T)}
                      width={yW(190, "Entidad emisora")}
                      tick={{
                        fill: T.axis,
                        fontSize: 12,
                        fontFamily: "Inter, system-ui, sans-serif",
                      }}
                      tickFormatter={star}
                      label={axT("Entidad emisora", "yr")}
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
              {otrosNote(
                ent.map((r) => r.k),
                "barreras",
              )}
            </section>

            <section className="card g-wide">
              <CardHead title="Afectación a las MIPYMEs" def={DEFS.bmip} />
              <div className="mip">
                <div
                  className="split"
                  style={{ height: 12 }}
                  role="img"
                  aria-label={
                    "Afectación alta " +
                    pct(BB.mip[0][1], BB.total) +
                    " %, media " +
                    pct(BB.mip[1][1], BB.total) +
                    " %, baja " +
                    pct(BB.mip[2][1], BB.total) +
                    " %"
                  }
                >
                  {BB.mip.map(([k, v], i) => (
                    <i key={k} style={{ flex: v, background: MIPB[i] }}></i>
                  ))}
                </div>
                <ul className="miplist">
                  {BB.mip.map(([k, v], i) => (
                    <li key={k}>
                      <span className="ml">
                        <Pips n={3 - i} color={MIPB[i]} />
                        {k}
                      </span>
                      <b>{fmtInt(v)}</b>
                      <span className="mp">
                        <span className="pchip">{pct(v, BB.total)} %</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </section>
      {nat ? (
        <>
          <section className="zone z-base" aria-labelledby="secH">
            <div className="zi">
              <div className="sechead">
                <span className="num">2</span>
                <div>
                  <h2 id="secH">
                    Hallazgos clave
                    <InfoBtn k="thall" />
                  </h2>
                  <p>Lectura rápida de los datos de {country}</p>
                </div>
              </div>
              <section className="card">
                <ul className="finds tri">
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
          <section className="zone z-alt" aria-labelledby="sec2">
            <div className="zi">
              <div className="sechead">
                <span className="num">3</span>
                <div>
                  <h2 id="sec2">
                    ¿Dónde actuar para reducir las barreras?
                    <InfoBtn k="bact" />
                  </h2>
                  <p>
                    Acciones sugeridas para reducir o eliminar las barreras de{" "}
                    {country}
                  </p>
                </div>
              </div>
              <div className="actgrid">
                <section className="card dcard">
                  <CardHead title="Barreras por acción sugerida" />
                  <DonutList
                    data={accDon}
                    totalLabel="Total de barreras"
                    size={208}
                    heads={["Acción"]}
                    aria="Barreras por acción sugerida"
                    marker="dot"
                    sel={acc.name}
                    onSel={setXAcc}
                  />
                  <p className="dxhint">
                    Selecciona una acción para ver su desagregación.
                  </p>
                </section>
                <section
                  className="card dxp"
                  aria-label="Desagregación de la acción sugerida"
                >
                  <CardHead title="Desagregación de la acción sugerida" />
                  <div
                    className="ctlrow"
                    role="group"
                    aria-label="Filtros de la desagregación"
                  >
                    <div className="cg">
                      <span className="clbl clbl-t">Acción</span>
                      <Dd
                        value={acc.name}
                        onChange={setXAcc}
                        options={accDon.map((a) => [a.name, a.name])}
                        label="Acción sugerida"
                        pre="Acción"
                      />
                    </div>
                    <div className="cg">
                      <span className="clbl clbl-t">Tipo de regulación</span>
                      <Dd
                        value={xTipo}
                        onChange={setXTipo}
                        options={[
                          ["Todas", "Todas"],
                          ...xTypes.map((t) => [t, t]),
                        ]}
                        label="Tipo de regulación"
                        pre="Tipo"
                      />
                    </div>
                    <div className="cg">
                      <span className="clbl clbl-t">Sector económico</span>
                      <Dd
                        value={xSec}
                        onChange={setXSec}
                        options={[
                          ["Todos", "Todos"],
                          ...xSecs.map((t) => [t, t]),
                        ]}
                        label="Sector económico"
                        pre="Sector"
                      />
                    </div>
                  </div>
                  <div className="dxcharts">
                    <div className="dxc">
                      <h4>Por tipo de regulación</h4>
                      <div
                        className="chart"
                        style={{
                          height: xByTipo.length * 30 + 12 + AX_TOP + AX_XH0,
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={xByTipo}
                            layout="vertical"
                            margin={{
                              top: AX_TOP,
                              right: 34,
                              left: 0,
                              bottom: 0,
                            }}
                            barCategoryGap="28%"
                          >
                            {valAxis("Número de barreras")}
                            <YAxis
                              type="category"
                              dataKey="k"
                              {...axisProps(T)}
                              width={yW(92, "Tipo de regulación")}
                              tick={{
                                fill: T.axis,
                                fontSize: 12,
                                fontFamily: "Inter, system-ui, sans-serif",
                              }}
                              tickFormatter={star}
                              label={axT("Tipo de regulación", "yr")}
                            />
                            <Tooltip
                              cursor={{ fill: T.grid, opacity: 0.5 }}
                              content={xTip}
                            />
                            <Bar
                              dataKey="total"
                              name="Barreras"
                              maxBarSize={18}
                              radius={[0, 4, 4, 0]}
                              isAnimationActive={false}
                            >
                              {xByTipo.map((d) => (
                                <Cell
                                  key={d.k}
                                  fill={
                                    COLORES_SERIE[d.ci % COLORES_SERIE.length]
                                  }
                                  fillOpacity={
                                    xTipo === "Todas" || xTipo === d.k ? 1 : 0.3
                                  }
                                />
                              ))}
                              <LabelList
                                dataKey="total"
                                position="right"
                                style={lblStyle}
                                formatter={fmtInt}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="dxc">
                      <h4>Por sector económico</h4>
                      <div
                        className="chart"
                        style={{
                          height: xBySec.length * 30 + 12 + AX_TOP + AX_XH0,
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={xBySec}
                            layout="vertical"
                            margin={{
                              top: AX_TOP,
                              right: 34,
                              left: 0,
                              bottom: 0,
                            }}
                            barCategoryGap="28%"
                          >
                            {valAxis("Número de barreras")}
                            <YAxis
                              type="category"
                              dataKey="k"
                              {...axisProps(T)}
                              width={yW(140, "Sector económico")}
                              tick={{
                                fill: T.axis,
                                fontSize: 12,
                                fontFamily: "Inter, system-ui, sans-serif",
                              }}
                              tickFormatter={star}
                              label={axT("Sector económico", "yr")}
                            />
                            <Tooltip
                              cursor={{ fill: T.grid, opacity: 0.5 }}
                              content={xTip}
                            />
                            <Bar
                              dataKey="total"
                              name="Barreras"
                              fill={acc.color}
                              maxBarSize={18}
                              radius={[0, 4, 4, 0]}
                              isAnimationActive={false}
                            >
                              {xBySec.map((d) => (
                                <Cell
                                  key={d.k}
                                  fill={acc.color}
                                  fillOpacity={
                                    xSec === "Todos" || xSec === d.k ? 1 : 0.3
                                  }
                                />
                              ))}
                              <LabelList
                                dataKey="total"
                                position="right"
                                style={lblStyle}
                                formatter={fmtInt}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  <div className="dxnotes">
                    {otrosNote(xByTipo.map((r) => r.k))}
                    {otrosNote(xBySec.map((r) => r.k))}
                  </div>
                </section>
              </div>
            </div>
          </section>
          <section className="zone z-base" aria-labelledby="sec3">
            <div className="zi">
              <div className="sechead">
                <span className="num">4</span>
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
                      {(BB.tabla ?? []).map((r: any, i: number) => (
                        <tr
                          key={r.id ?? i}
                          className={onOpenBarrera && r.id ? "rowlink" : undefined}
                          tabIndex={onOpenBarrera && r.id ? 0 : undefined}
                          title={
                            onOpenBarrera && r.id
                              ? "Ver la ficha de la barrera"
                              : undefined
                          }
                          onKeyDown={
                            onOpenBarrera && r.id
                              ? (e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onOpenBarrera(r.id);
                                  }
                                }
                              : undefined
                          }
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
                          <td className="go" aria-hidden="true">
                            {onOpenBarrera && r.id ? <Icon d={I.arrow} /> : null}
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
                        <Flag id={id} name={name} />
                        <span
                          className="cname"
                          style={{ "--cc": colorPais(name, i) }}
                        >
                          {name}
                        </span>
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
                        {e} <span className="pchip">{pct(e, e + o)} %</span>
                      </b>
                      <span>
                        <i style={{ background: T.operacion }}></i>Operación
                      </span>
                      <b>
                        {o} <span className="pchip">{pct(o, e + o)} %</span>
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
      intro="Explora la cantidad, composición y características de las barreras regulatorias identificadas."
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
