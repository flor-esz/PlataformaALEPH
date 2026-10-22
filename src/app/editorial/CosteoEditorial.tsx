// Costeo de trámites (antes «Impacto económico»): cuánto cuestan los trámites a quienes deben
// cumplirlos, dónde se concentra el costo y cómo se compara entre países. Sin nivel regional / por
// país: país, sector administrativo, entidad y tipo de usuario son filtros del encabezado.
// Pantalla presentacional: calcula con `getData(filtros)` (por defecto, datos de ejemplo).
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  NARROW,
  axT,
  axisProps,
  endChip,
  otrosNote,
  star,
  valAxis,
  yW,
} from "./charts";
import { CardHead } from "./cardhead";
import {
  IMP_ADMS,
  IMP_ALL,
  IMP_ENTS,
  IMP_SUB,
  IMP_USUS,
  impData,
} from "./costeo-data";
import { DEFS } from "./defs";
import { PAISES_BASE } from "./fixtures";
import { fmt1, fmtInt } from "./format";
import { I, Icon } from "./icons";
import { InfoBtn } from "./info";
import { Dd, Fseg, Mejora, SevPill } from "./ui";
import { PageShell } from "./PageShell";
import { RAMPS, T, TR_G } from "./theme";
import type { CosteoData, CosteoFiltros } from "./types";

const TOP_OPTS = (all: string): [string, string][] => [
  ["5", "Top 5"],
  ["10", "Top 10"],
  ["all", all],
];

function CosteoBody({
  D,
  sel,
  showAct,
  onOpenTramite,
  onVerTodos,
}: {
  D: CosteoData;
  sel: CosteoFiltros;
  showAct: boolean;
  onOpenTramite?: (nombre: string, sel: CosteoFiltros) => void;
  onVerTodos?: (sel: CosteoFiltros, total: number) => void;
}) {
  /* La fila abre la ficha del trámite (real si está en el catálogo, de ejemplo si no: lo decide quien recibe el aviso). */
  const rowLink = (nombre: string) => {
    return onOpenTramite
      ? {
          className: "rowlink",
          tabIndex: 0,
          title: "Ver la ficha del trámite",
          onClick: () => onOpenTramite!(nombre, sel),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenTramite!(nombre, sel);
            }
          },
        }
      : ({} as { className?: string });
  };
  const [view, setView] = useState("Sector administrativo");
  const [n, setN] = useState("10");
  const [uMode, setUMode] = useState("Total");
  const lblStyle = {
    fill: "var(--ink)",
    fontSize: 12.5,
    fontWeight: 700,
    fontFamily: "Inter, system-ui, sans-serif",
  };
  const usd = (v) => "USD " + fmt1(v) + " M";
  const nar = NARROW();
  const CA_C = RAMPS.azul.steps[3],
    COP_C = RAMPS.azul.steps[0];
  const endLbl = (o) =>
    endChip(o, lblStyle, nar && String(o.value).includes(" · "));
  const oneTip =
    (unit) =>
    ({ active, payload, label }) =>
      active && payload && payload.length ? (
        <div className="tt">
          <div className="t">{payload[0].payload.k || label}</div>
          {payload[0].payload.stack ? (
            <>
              <div className="r">
                <i style={{ background: CA_C }}></i>
                <span>CA</span>
                <b>{payload[0].payload.labCA}</b>
              </div>
              <div className="r">
                <i style={{ background: COP_C }}></i>
                <span>COP</span>
                <b>{payload[0].payload.labCOP}</b>
              </div>
              <div className="r">
                <span>CET</span>
                <b>{payload[0].payload.lab}</b>
              </div>
            </>
          ) : (
            <div className="r">
              <i style={{ background: payload[0].payload.c || IMP_C }}></i>
              <span>{unit}</span>
              <b>{payload[0].payload.lab}</b>
            </div>
          )}
        </div>
      ) : null;
  const IMP_C = RAMPS.azul.steps[2];
  /* Etiquetas largas: se recortan y el texto completo aparece al pasar el cursor (title) */
  const truncTick =
    (w) =>
    ({ x, y, payload }) => {
      const t = star(payload.value),
        max = Math.max(10, Math.floor((w - 14) / 6.4)),
        cut = t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
      return (
        <g transform={"translate(" + x + "," + y + ")"}>
          <title>{t}</title>
          <text
            x={-8}
            y={0}
            dy="4"
            textAnchor="end"
            fill={T.axis}
            style={{ fontSize: 12, fontFamily: "Inter, system-ui, sans-serif" }}
          >
            {cut}
          </text>
        </g>
      );
    };
  /* Etiquetas en dos líneas (tres en celular): se parte por palabras y el texto completo queda en el title */
  const wrapTick =
    (w, maxL) =>
    ({ x, y, payload }) => {
      const t = star(payload.value),
        max = Math.max(10, Math.floor((w - 12) / 6.1)),
        lines = [];
      let cur = "";
      t.split(" ").forEach((wd) => {
        if (cur && (cur + " " + wd).length > max) {
          lines.push(cur);
          cur = wd;
        } else cur = cur ? cur + " " + wd : wd;
      });
      if (cur) lines.push(cur);
      const sh = lines.slice(0, maxL);
      if (lines.length > maxL)
        sh[maxL - 1] =
          sh[maxL - 1].slice(0, Math.max(1, max - 1)).trimEnd() + "…";
      return (
        <g transform={"translate(" + x + "," + y + ")"}>
          <title>{t}</title>
          <text
            x={-8}
            y={0}
            dy={4 - (sh.length - 1) * 7}
            textAnchor="end"
            fill={T.axis}
            style={{ fontSize: 12, fontFamily: "Inter, system-ui, sans-serif" }}
          >
            {sh.map((l, i) => (
              <tspan key={i} x={-8} dy={i ? 14 : 0}>
                {l}
              </tspan>
            ))}
          </text>
        </g>
      );
    };
  const bars = (rows, yw, catT, valT, color, rh, tick, stack) => {
    const w = yW(nar ? Math.min(yw, 134) : yw, catT);
    return (
      <div
        className="chart"
        style={{
          height: rows.length * (rh || 34) + 14 + AX_TOP + AX_XH0,
          flex: "none",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: AX_TOP, right: nar ? 84 : 128, left: 0, bottom: 0 }}
            barCategoryGap="30%"
          >
            {valAxis(valT)}
            <YAxis
              type="category"
              dataKey="k"
              {...{ ...axisProps(T), width: w, tick: tick || truncTick(w) }}
              label={axT(catT, "yr")}
            />
            <Tooltip
              cursor={{ fill: T.grid, opacity: 0.5 }}
              content={oneTip("Costo estimado")}
            />
            {stack ? (
              <>
                <Bar
                  dataKey="ca"
                  stackId="s"
                  maxBarSize={16}
                  isAnimationActive={false}
                  fill={CA_C}
                />
                <Bar
                  dataKey="cop"
                  stackId="s"
                  maxBarSize={16}
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                  fill={COP_C}
                >
                  <LabelList dataKey="lab" content={endLbl} />
                </Bar>
              </>
            ) : (
              <Bar
                dataKey="v"
                maxBarSize={16}
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              >
                {rows.map((r, i) => (
                  <Cell key={i} fill={r.c || color} />
                ))}
                <LabelList dataKey="lab" content={endLbl} />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  const Leg = (
    <div
      className="leg-row"
      role="list"
      aria-label="Componentes del CET"
      style={{
        display: "flex",
        gap: 18,
        flexWrap: "wrap",
        fontSize: 12.5,
        color: "var(--ink-2)",
        margin: "0 0 4px",
      }}
    >
      <span
        role="listitem"
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <i
          style={{ width: 10, height: 10, borderRadius: 3, background: CA_C }}
        ></i>
        CA · tiempo activo
      </span>
      <span
        role="listitem"
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <i
          style={{ width: 10, height: 10, borderRadius: 3, background: COP_C }}
        ></i>
        COP · espera de la administración
      </span>
    </div>
  );
  const st = (r, f) => ({
    ...r,
    stack: 1,
    lab: f(r.v),
    labCA: f(r.ca),
    labCOP: f(r.cop),
  });
  /* Bloque 1: Top N por sector administrativo, entidad o trámite (ranking de mayor a menor; «Otras entidades» siempre al final) */
  const top = (rows, pin) => {
    const r = rows
      .slice()
      .sort((a, b) =>
        pin && a.k === pin ? 1 : pin && b.k === pin ? -1 : b.v - a.v,
      );
    return n === "all" ? r : r.slice(0, +n);
  };
  const conc =
    view === "Sector administrativo"
      ? {
          rows: top(D.sector, "Otros sectores administrativos"),
          yw: 210,
          cat: "Sector administrativo",
        }
      : view === "Entidad"
        ? {
            rows: top(D.entidad, "Otras entidades"),
            yw: 220,
            cat: "Entidad responsable",
          }
        : {
            rows: D.tram.slice(0, n === "all" ? 99 : +n),
            yw: 230,
            cat: "Trámite",
          };
  const concRows = conc.rows.map((r) => st(r, usd));
  /* usuarios: total o promedio por trámite */
  const uAvg = uMode !== "Total",
    usdU = (v) => "USD " + fmtInt(v);
  const usuRows = D.usuarios
    .map((r) => {
      const v2 = uAvg
          ? D.avg * ({ Empresarial: 1.25, Ciudadano: 0.55 }[r.k] || 1)
          : r.v,
        k = v2 / r.v;
      return st(
        { ...r, v: v2, ca: r.ca * k, cop: r.cop * k },
        uAvg ? usdU : usd,
      );
    })
    .sort((a, b) => b.v - a.v);
  const actRows = D.act
    .map((r) => ({
      k: r.k,
      v: r.v,
      lab: usd(r.v) + " · " + Math.round(r.p * 100) + " %",
      c: TR_G,
    }))
    .sort((a, b) => b.v - a.v);
  const paisRows = D.pais
    .slice()
    .sort((a, b) => b.v - a.v)
    .map((r) => st(r, usd));
  const paisTickV = ({ x, y, payload }) => {
    const r = paisRows.find((q) => q.k === payload.value);
    return (
      <g transform={"translate(" + x + "," + y + ")"}>
        <text
          x={0}
          y={16}
          textAnchor="middle"
          fill={T.axis}
          style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          {payload.value}
        </text>
        <text
          x={0}
          y={32}
          textAnchor="middle"
          fill={T.axis}
          style={{ fontSize: 11.5, fontFamily: "Inter, system-ui, sans-serif" }}
        >
          ({r ? fmtInt(r.n) : ""} trámites)
        </text>
      </g>
    );
  };
  const paisTop = ({ x, y, width, value }) => (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      style={lblStyle}
      fill="var(--ink)"
    >
      {nar ? String(value).replace("USD ", "").replace(" M", "") : value}
    </text>
  );
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
  const tot = (v) => "USD " + (v >= 10 ? fmtInt(v) : fmt1(v)) + " M";
  const blk = (sym, title, val, txt, cls) => (
    <div className={"cet-b" + (cls ? " " + cls : "")}>
      <div className="cet-h">
        <b>{sym}</b>
        <span>{title}</span>
      </div>
      <div className="cet-v">{val}</div>
      <p>{txt}</p>
    </div>
  );
  return (
    <React.Fragment>
      <div className="zone z-base">
        <div className="zi">
          <div className="sum s3" aria-label="Indicadores generales de costeo">
            {kpi(
              "var(--primary)",
              "Costo administrativo estimado",
              "USD " + (D.cost >= 10 ? fmtInt(D.cost) : fmt1(D.cost)),
              "millones",
              "carga estimada de los trámites",
              I.db,
              "kcost",
            )}
            {kpi(
              TR_G,
              "Trámites costeados",
              fmtInt(D.costeados),
              null,
              "con costo estimado",
              I.tramites,
              "itram",
            )}
            {kpi(
              "var(--primary)",
              "Costo promedio por trámite",
              "USD " + fmtInt(D.avg),
              null,
              "por cada vez que se realiza un trámite",
              I.impacto,
              "iavg",
            )}
          </div>
        </div>
      </div>

      <section className="zone z-alt" aria-labelledby="i0">
        <div className="zi">
          <div className="sechead">
            <span className="num">1</span>
            <div>
              <h2 id="i0">Estimación del costo del trámite</h2>
              <p>
                La metodología del Costo Económico Total (CET) se fundamenta en
                el Modelo de Costeo Estándar y se compone de:
              </p>
            </div>
          </div>
          <section className="card">
            <div className="cet">
              {blk(
                "CET",
                "Costo Económico Total",
                tot(D.cost),
                "Costo unitario estimado que enfrenta el usuario al completar un trámite, considerando tanto el esfuerzo activo requerido como el costo asociado al tiempo de espera de la administración.",
                "tot",
              )}
              <span className="cet-op" aria-hidden="true">
                =
              </span>
              {blk(
                "CA",
                "Tiempo activo",
                tot(D.ca),
                "Valor del tiempo activo que ciudadanos o empresas destinan a cumplir el trámite: comprender requisitos, preparar y reunir información, diligenciar formularios, realizar gestiones, contratar servicios externos, archivar documentos y efectuar traslados o esperas.",
              )}
              <span className="cet-op" aria-hidden="true">
                +
              </span>
              {blk(
                "COP",
                "Tiempo pasivo de espera",
                tot(D.cop),
                "Valor económico asociado al tiempo pasivo de espera mientras la autoridad procesa y resuelve el trámite, cuando ese plazo posterga una actividad económica o el acceso a un beneficio.",
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="zone z-base" aria-labelledby="i1">
        <div className="zi">
          <div className="sechead">
            <span className="num">2</span>
            <div>
              <h2 id="i1">Costo administrativo estimado</h2>
              <p>Dónde se concentra el costo y qué lo explica</p>
            </div>
          </div>
          <section className="card">
            <CardHead title="¿Dónde se concentra el costo?" def={DEFS.iconc} />
            <div
              className="ctlrow"
              role="group"
              aria-label="Filtros de la gráfica"
            >
              <div className="cg">
                <span className="clbl clbl-t">Ver por</span>
                <Fseg
                  v={view}
                  set={setView}
                  items={["Sector administrativo", "Entidad", "Trámite"]}
                  label="Ver el costo por"
                />
              </div>
              <div className="cg">
                <span className="clbl clbl-t">Mostrar</span>
                <Dd
                  value={n}
                  onChange={setN}
                  options={TOP_OPTS("Todos")}
                  label="Cantidad de elementos a mostrar"
                />
              </div>
            </div>
            {Leg}
            {concRows.length ? (
              bars(
                concRows,
                conc.yw,
                conc.cat,
                "Costo estimado (millones de USD)",
                IMP_C,
                34,
                null,
                true,
              )
            ) : (
              <p className="csub" style={{ margin: 0 }}>
                No hay trámites costeados con los filtros seleccionados.
              </p>
            )}
            {view === "Entidad"
              ? otrosNote(
                  concRows.map((r) => r.k),
                  "trámites",
                )
              : null}
          </section>
          <div
            className="grid2"
            style={{
              marginTop: 20,
              ...(showAct && !nar
                ? { gridTemplateColumns: "minmax(0,5fr) minmax(0,7fr)" }
                : {}),
            }}
          >
            <section className={"card" + (showAct ? "" : " g-wide")}>
              <CardHead
                title="Costos administrativos por usuario"
                def={DEFS.iusu}
              />
              <div
                className="ctlrow"
                role="group"
                aria-label="Filtros de la gráfica"
              >
                <div className="cg">
                  <span className="clbl clbl-t">Mostrar</span>
                  <Fseg
                    v={uMode}
                    set={setUMode}
                    items={["Total", "Promedio por trámite"]}
                    label="Mostrar el costo por usuario como"
                  />
                </div>
              </div>
              {Leg}
              {bars(
                usuRows,
                110,
                "Tipo de usuario",
                uAvg
                  ? "Costo promedio por trámite (USD)"
                  : "Costo estimado (millones de USD)",
                IMP_C,
                52,
                null,
                true,
              )}
            </section>
            {showAct ? (
              <section className="card">
                <CardHead
                  title="¿Qué actividades explican el costo?"
                  def={DEFS.iact}
                />
                <div
                  className="ctlrow"
                  aria-hidden="true"
                  style={{ visibility: "hidden" }}
                >
                  <div className="cg">
                    <span className="clbl clbl-t">Mostrar</span>
                  </div>
                </div>
                {bars(
                  actRows,
                  nar ? 150 : 236,
                  "Actividad estándar",
                  "Costo estimado (millones de USD)",
                  TR_G,
                  nar ? 64 : 44,
                  wrapTick(
                    yW(nar ? Math.min(150, 134) : 236, "Actividad estándar"),
                    nar ? 4 : 2,
                  ),
                )}
              </section>
            ) : null}
          </div>
        </div>
      </section>

      <section className="zone z-alt" aria-labelledby="i2">
        <div className="zi">
          <div className="sechead">
            <span className="num">3</span>
            <div>
              <h2 id="i2">Comparación entre países</h2>
              <p>
                Costo estimado de cada país y número de trámites con los que se
                calculó
              </p>
            </div>
          </div>
          <section className="card">
            <CardHead
              title="¿Cómo se compara el costeo entre países?"
              def={DEFS.ipais}
            />
            {Leg}
            <div style={{ overflowX: "auto" }}>
              <div
                className="chart"
                style={{
                  height: nar ? 400 : 420,
                  flex: "none",
                  minWidth: nar ? 560 : 0,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={paisRows}
                    margin={{ top: AX_TOP + 14, right: 12, left: 0, bottom: 4 }}
                    barCategoryGap="28%"
                  >
                    <CartesianGrid vertical={false} stroke={T.grid} />
                    <XAxis
                      dataKey="k"
                      interval={0}
                      tickLine={false}
                      axisLine={{ stroke: T.grid }}
                      height={50}
                      tick={paisTickV}
                    />
                    <YAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      width={40}
                      tick={{
                        fill: T.axis,
                        fontSize: 11.5,
                        fontFamily: "Inter, system-ui, sans-serif",
                      }}
                      tickFormatter={(v) => fmtInt(v)}
                      label={axT(
                        "Costo administrativo estimado (millones de USD)",
                        "y",
                      )}
                    />
                    <Tooltip
                      cursor={{ fill: T.grid, opacity: 0.5 }}
                      content={oneTip("Costo estimado")}
                    />
                    <Bar
                      dataKey="ca"
                      stackId="s"
                      maxBarSize={64}
                      isAnimationActive={false}
                      fill={CA_C}
                    />
                    <Bar
                      dataKey="cop"
                      stackId="s"
                      maxBarSize={64}
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                      fill={COP_C}
                    >
                      <LabelList dataKey="lab" content={paisTop} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="zone z-base" aria-labelledby="i3">
        <div className="zi">
          <div className="sechead">
            <span className="num">4</span>
            <div>
              <h2 id="i3">Trámites prioritarios</h2>
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
                    {onOpenTramite ? (
                      <th className="go">
                        <span className="sr">Ver ficha</span>
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {D.tram.length ? (
                    D.tram.slice(0, 5).map((r) => (
                      <tr key={r.k} {...rowLink(r.k)}>
                        <td className="main trunc" title={r.k}>
                          {r.k}
                        </td>
                        <td>
                          {r.sec} / {IMP_SUB[r.sec] || "General"}
                        </td>
                        <td>{r.ent}</td>
                        <td>{r.eta}</td>
                        <td>{r.usu}</td>
                        <td>
                          <SevPill s={r.sev} />
                        </td>
                        <td className="num">{fmtInt(r.cu * r.vol)}</td>
                        <td>
                          <Mejora t={r.acc} />
                        </td>
                        {onOpenTramite ? (
                          <td className="go" aria-hidden="true">
                            <Icon d={I.arrow} />
                          </td>
                        ) : null}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={onOpenTramite ? 9 : 8} className="main">
                        No hay trámites costeados con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn primary"
                onClick={() => onVerTodos?.(sel, D.costeados)}
                disabled={!onVerTodos}
              >
                Ver todos los trámites <Icon d={I.arrow} />
              </button>
            </div>
          </section>
        </div>
      </section>
    </React.Fragment>
  );
}

function ImpCtl({
  sel,
  setSel,
}: {
  sel: CosteoFiltros;
  setSel: React.Dispatch<React.SetStateAction<CosteoFiltros>>;
}) {
  const set = (k: keyof CosteoFiltros) => (v: string) =>
    setSel((s) => ({ ...s, [k]: v }));
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
          value={sel.pais}
          onChange={set("pais")}
          options={[
            ["Todos", "Todos"],
            ...PAISES_BASE.map((c) => [c.name, c.name]),
          ]}
          label="País"
        />
      </div>
      <div className="cg">
        <span className="clbl">Sector administrativo</span>
        <Dd
          tone="dark"
          value={sel.sec}
          onChange={set("sec")}
          options={[["Todos", "Todos"], ...IMP_ADMS.map((x) => [x, x])]}
          label="Sector administrativo"
        />
      </div>
      <div className="cg">
        <span className="clbl">Entidad</span>
        <Dd
          tone="dark"
          value={sel.ent}
          onChange={set("ent")}
          options={[["Todos", "Todas"], ...IMP_ENTS.map((x) => [x, x])]}
          label="Entidad"
        />
      </div>
      <div className="cg">
        <span className="clbl">Tipo de usuario</span>
        <Dd
          tone="dark"
          value={sel.usu}
          onChange={set("usu")}
          options={[["Todos", "Todos"], ...IMP_USUS.map((x) => [x, x])]}
          label="Tipo de usuario"
        />
      </div>
      <div className="cg">
        <InfoBtn tone="dark" def={DEFS.imest} label="Cómo se estima" />
      </div>
    </div>
  );
}

export interface CosteoEditorialProps {
  userInitials?: string;
  ultimaActualizacion?: string;
  /** Datos del costeo para los filtros elegidos. Por defecto, datos de ejemplo. */
  getData?: (f: CosteoFiltros) => CosteoData;
  /** Muestra u oculta «¿Qué actividades explican el costo?» (pendiente de decisión del BID). */
  mostrarActividades?: boolean;
  /** Filtros con los que arranca la pantalla (para conservarlos al volver de una ficha o del listado). */
  filtros?: CosteoFiltros;
  /** Aviso cuando cambian los filtros. */
  onFiltros?: (f: CosteoFiltros) => void;
  /** Clic en una fila de «Trámites prioritarios»: recibe el nombre y los filtros vigentes (abre la ficha del trámite). */
  onOpenTramite?: (nombre: string, sel: CosteoFiltros) => void;
  /** Botón «Ver todos los trámites»: recibe los filtros vigentes y el total de trámites costeados. */
  onVerTodos?: (sel: CosteoFiltros, total: number) => void;
}

/** Costeo de trámites: costo administrativo estimado (CET = CA + COP) y dónde se concentra. */
export function CosteoEditorial({
  userInitials,
  ultimaActualizacion = "15 de septiembre de 2026",
  getData = impData,
  mostrarActividades = true,
  filtros,
  onFiltros,
  onOpenTramite,
  onVerTodos,
}: CosteoEditorialProps) {
  const [sel, setSel] = useState<CosteoFiltros>(filtros ?? IMP_ALL);
  useEffect(() => {
    onFiltros?.(sel);
  }, [sel]);
  const D = getData(sel);
  return (
    <PageShell
      eyebrow="Costeo"
      t1="Costeo"
      t2="de trámites"
      infoKey="imp"
      intro="Estimación del costo de los trámites incluidos en los catálogos oficiales, tengan o no oportunidades de mejora."
      sinNivel
      rastro={["Tableros", "Trámites con potencial de mejora"]}
      controls={<ImpCtl sel={sel} setSel={setSel} />}
      stats={[
        [
          sel.pais === "Todos" ? String(PAISES_BASE.length) : sel.pais,
          sel.pais === "Todos" ? "países analizados" : "país seleccionado",
        ],
        [fmtInt(D.costeados), "trámites costeados", "itram"],
        [
          ultimaActualizacion
            .replace(/ de /g, " ")
            .replace("septiembre", "sep"),
          "última actualización",
        ],
      ]}
      userInitials={userInitials}
      ultimaActualizacion={ultimaActualizacion}
      anios="2015–2024"
    >
      <CosteoBody
        key={JSON.stringify(sel)}
        D={D}
        sel={sel}
        showAct={mostrarActividades}
        onOpenTramite={onOpenTramite}
        onVerTodos={onVerTodos}
      />
    </PageShell>
  );
}
