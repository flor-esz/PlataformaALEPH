import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  LabelList,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { axisProps, MultiLine, NowBox, Tip } from "./charts";
import { CardHead } from "./cardhead";
import { fmtInt } from "./format";
import { Dd } from "./ui";
import { PageShell } from "./PageShell";
import { PAISES_FIXTURE, panoramaFixture } from "./fixtures";
import { COLORES_SERIE, colorPais, T } from "./theme";
import type { PanoramaData, ScreenProps } from "./types";

function StatBox({ series, color, fmtV, unit, label, vs }: any) {
  const n = series.length;
  const last = series[n - 1],
    prev = series[n - 2];
  const pct = ((last - prev) / prev) * 100,
    up = pct >= 0;
  const sg =
    (up ? "+" : "−") + Math.abs(pct).toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
  return (
    <div className="now sbox" style={{ "--sc": color } as React.CSSProperties}>
      <div className="st-l">{label}</div>
      <div className="st-main">
        <div className="v">{fmtV}</div>
        <div className="u">{unit}</div>
      </div>
      <div className="st-chip">
        <span className="chip">
          {up ? "▲" : "▼"} {sg}
        </span>
        <span className="vs">vs. {vs}</span>
      </div>
    </div>
  );
}
function PanoramaBody({ D, country }: { D: PanoramaData; country: string }) {
  const [hlC, setHlC] = useState<string | null>(null);
  const [pinS, setPinS] = useState("Comercio");
  const [hovS, setHovS] = useState<string | null>(null);
  const [topN, setTopN] = useState(10);
  const hlS = hovS || pinS;
  const [hlT, setHlT] = useState<string | null>(null);
  const [ind, setInd] = useState("count");
  const one = country !== "Todos";
  const ci = D.paises.findIndex((c) => c.name === country);
  const y0 = D.years[0],
    y1 = D.years[D.years.length - 1],
    yPrev = D.years[D.years.length - 2];
  const colores = D.paises.map((c, i) => colorPais(c.name, i));

  const panoramaCountry = D.years.map((y, yi) => {
    const o: any = { year: y };
    D.paises.forEach((c, i) => (o[c.name] = D.seriePais[i][yi]));
    return o;
  });
  const sectorData = useMemo(
    () =>
      D.years.map((y, yi) => {
        const o: any = { year: y };
        D.sectores.forEach(([n, serie]) => (o[n] = serie[yi]));
        return o;
      }),
    [D],
  );
  const typeData = useMemo(
    () =>
      D.years.map((y, yi) => {
        const o: any = { year: y };
        D.tipos.forEach(([n, serie]) => (o[n] = serie[yi]));
        return o;
      }),
    [D],
  );
  const sectorNow = D.sectores
    .map(([n, serie]) => ({ name: n, value: serie[serie.length - 1] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
  const shownS = sectorNow.map((x) => x.name);
  const neutral = T.muted;

  const raw = D.indicadores[ind];
  const indObj = {
    ...raw,
    vals: raw.valores,
    fmt: (v: number) => (raw.decimals ? v.toFixed(raw.decimals).replace(".", ",") : fmtInt(v)),
  };
  const barData = D.paises.map((c, i) => ({ name: c.name, v: indObj.vals[i], fill: colores[i] })).sort((a, b) => b.v - a.v); // ranking: mayor a menor; el color sigue al país, no a su posición

  const oneData = one ? D.years.map((y, yi) => ({ year: y, [country]: D.seriePais[ci][yi] })) : [];
  const indSeries = one ? D.years.map((y, yi) => ({ year: y, v: (D.serieIndicador?.[ind] ?? [])[yi] })) : [];
  const cCol = one ? colores[ci] : T.highlight;

  return (
    <div className="grid2">
      <section className="card">
        <CardHead
          tall={true}
          title={one ? "Regulaciones vigentes por año" : "Regulaciones vigentes por año y país"}
          sub={`Acervo acumulado, ${y0}–${y1}`}
        />
        <div className="cbody">
          <div className="chart">
            {one ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={oneData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ga-pan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={cCol} stopOpacity=".18" />
                      <stop offset="1" stopColor={cCol} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={T.grid} />
                  <XAxis dataKey="year" {...axisProps(T)} />
                  <YAxis {...axisProps(T)} width={48} tickFormatter={(v) => fmtInt(v)} />
                  <Tooltip content={<Tip title={(l: any) => "Año " + l} />} />
                  <Area
                    type="monotone"
                    dataKey={country}
                    name={country}
                    stroke={cCol}
                    strokeWidth={2}
                    fill="url(#ga-pan)"
                    isAnimationActive={false}
                    activeDot={{ r: 5, stroke: T.surface, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <MultiLine
                T={T}
                data={panoramaCountry}
                series={D.paises.map((c) => c.name)}
                colors={colores}
                hl={hlC}
                setHighlight={setHlC}
                demo={8}
              />
            )}
          </div>
          {one ? (
            <StatBox
              series={D.seriePais[ci]}
              color={cCol}
              label={`Valor actual (${y1})`}
              vs={yPrev}
              fmtV={fmtInt(D.paises[ci].now)}
              unit="regulaciones vigentes"
            />
          ) : (
            <NowBox
              title={`Valor actual (${y1})`}
              hl={hlC}
              setHl={setHlC}
              rows={D.paises.map((c, i) => ({ name: c.name, value: c.now, color: colores[i] }))}
            />
          )}
        </div>
      </section>

      <section className="card">
        <CardHead
          tall={true}
          title="Regulaciones vigentes por año y sector"
          sub={one ? "Acervo acumulado en " + country : `Acervo acumulado, ${y0}–${y1}`}
        >
          <div className="ctlrow">
            <div className="cg">
              <span className="clbl">Mostrar</span>
              <Dd
                value={String(topN)}
                onChange={(v) => {
                  setTopN(+v);
                  setHovS(null);
                }}
                options={[
                  ["10", "Top 10", "Top 10 sectores"],
                  ["5", "Top 5", "Top 5 sectores"],
                ]}
                label="Sectores a mostrar"
              />
            </div>
          </div>
        </CardHead>
        <div className="cbody">
          <div className="chart">
            <MultiLine
              T={T}
              data={sectorData}
              series={shownS}
              colors={shownS.map((n) => (n === hlS ? T.highlight : neutral))}
              hl={shownS.includes(hlS) ? hlS : null}
              setHighlight={() => {}}
            />
          </div>
          <NowBox
            title={`Valor actual (${y1})`}
            hl={hlS}
            setHl={setHovS}
            onPick={setPinS}
            rows={sectorNow.map((s) => ({ name: s.name, value: s.value, color: s.name === hlS ? T.highlight : neutral }))}
          />
        </div>
      </section>

      <section className="card">
        <CardHead
          tall={true}
          title="Regulaciones vigentes por año y tipo de regulación"
          sub="Ley, decreto, resolución, circular, reglamento y otros"
        />
        <div className="cbody">
          <div className="chart">
            <MultiLine
              T={T}
              data={typeData}
              series={D.tipos.map((t) => t[0])}
              colors={COLORES_SERIE}
              hl={hlT}
              setHighlight={setHlT}
            />
          </div>
          <NowBox
            title={`Valor actual (${y1})`}
            hl={hlT}
            setHl={setHlT}
            rows={D.tipos.map((t, i) => ({
              name: t[0],
              value: t[1][t[1].length - 1],
              color: COLORES_SERIE[i % COLORES_SERIE.length],
            }))}
          />
        </div>
      </section>

      <section className="card">
        <CardHead
          tall={true}
          ctlLeft={true}
          title={one ? "Características del acervo regulatorio de " + country : "Características del acervo regulatorio por país"}
        >
          <div className="ctlrow">
            <div className="cg">
              <span className="clbl">Indicador</span>
              <Dd
                value={ind}
                onChange={setInd}
                options={Object.entries(D.indicadores).map(([k, o]) => [k, o.label])}
                label="Indicador a mostrar"
              />
            </div>
          </div>
          <span className="csub unit" title={indObj.unit}>
            {indObj.unit.charAt(0).toUpperCase() + indObj.unit.slice(1)}
          </span>
        </CardHead>
        <div className="cbody">
          <div className="chart">
            {one ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={indSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={T.grid} />
                  <XAxis dataKey="year" {...axisProps(T)} />
                  <YAxis {...axisProps(T)} width={48} tickFormatter={(v) => indObj.fmt(v)} />
                  <Tooltip content={<Tip unit={indObj.unit} title={(l: any) => "Año " + l} />} />
                  <Line
                    type="monotone"
                    dataKey="v"
                    name={indObj.label}
                    stroke={cCol}
                    strokeWidth={2}
                    isAnimationActive={false}
                    dot={false}
                    activeDot={{ r: 5, stroke: T.surface, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 22, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
                  <CartesianGrid vertical={false} stroke={T.grid} />
                  <XAxis dataKey="name" {...axisProps(T)} interval={0} />
                  <YAxis {...axisProps(T)} width={48} tickFormatter={(v) => indObj.fmt(v)} />
                  <Tooltip
                    cursor={{ fill: T.grid, opacity: 0.5 }}
                    content={({ active, payload }) =>
                      active && payload && payload.length ? (
                        <div className="tt">
                          <div className="t">{payload[0].payload.name}</div>
                          <div className="r">
                            <i style={{ background: payload[0].payload.fill }}></i>
                            <span>{indObj.label}</span>
                            <b>{indObj.fmt(payload[0].value)}</b>
                          </div>
                          <div className="unit" style={{ marginTop: 6 }}>
                            {indObj.unit}
                          </div>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="v" radius={T.barRadius} maxBarSize={44} isAnimationActive={false}>
                    {barData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                    <LabelList
                      dataKey="v"
                      position="top"
                      formatter={(v) => indObj.fmt(v)}
                      style={{ fill: "var(--ink)", fontSize: 12, fontWeight: 600, fontFamily: "Inter, system-ui, sans-serif" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {one ? (
            <StatBox
              series={indSeries.map((r) => r.v)}
              color={cCol}
              label={`Valor actual (${y1})`}
              vs={yPrev}
              fmtV={indObj.fmt(indObj.vals[ci])}
              unit={indObj.unit}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
/** Panorama regulatorio: evolución del acervo normativo (regional o por país). */
export function PanoramaEditorial({
  country,
  paises = PAISES_FIXTURE,
  data,
  onCountryChange,
  filtros,
  userInitials,
  ultimaActualizacion = "15 de septiembre de 2026",
  anios,
}: ScreenProps<PanoramaData>) {
  const D = data ?? panoramaFixture(country);
  return (
    <PageShell
      eyebrow="Panorama regulatorio"
      t1="Panorama"
      t2="Regulatorio"
      infoKey="pan"
      intro="Composición y evolución del universo normativo en América Latina y el Caribe."
      stats={D.stats}
      country={country}
      paises={paises}
      onCountryChange={onCountryChange}
      filtros={filtros}
      userInitials={userInitials}
      ultimaActualizacion={ultimaActualizacion}
      anios={anios ?? `${D.years[0]}–${D.years[D.years.length - 1]}`}
    >
      <div className="zone z-base">
        <div className="zi">
          <PanoramaBody key={country} D={D} country={country} />
        </div>
      </div>
    </PageShell>
  );
}
