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
  ReferenceLine,
} from "recharts";
import {
  axisProps,
  MultiLine,
  NowBox,
  Tip,
  useYearZoom,
  yearHover,
  yearAxis,
  zoomBrush,
  ZoomHint,
  axT,
  sideTip,
  AX_TOP,
  AX_XH,
  star,
  otrosNote,
  YearBack,
} from "./charts";
import { CardHead } from "./cardhead";
import { fmtInt, mean } from "./format";
import { Dd } from "./ui";
import { PageShell } from "./PageShell";
import { PAISES_FIXTURE, panoramaFixture } from "./fixtures";
import {
  ALC,
  ALC_COLOR,
  ALC_DASH,
  COLORES_SERIE,
  colorPais,
  colorSector,
  T,
} from "./theme";
import type { PanoramaData, ScreenProps } from "./types";

/* ================= Panorama ================= */
function StatBox({
  series,
  color,
  fmtV,
  unit,
  label,
  alc,
  year,
  fmt,
  alcSeries,
  onBack,
  years,
  ultimo,
}: any) {
  const n = series.length;
  const yi = year != null ? years.indexOf(year) : -1,
    hov = yi >= 0;
  const i = hov ? yi : n - 1;
  const last = series[i],
    prev = i > 0 ? series[i - 1] : null;
  const pct = prev ? ((last - prev) / prev) * 100 : 0,
    up = pct >= 0;
  const sg =
    (up ? "+" : "−") +
    Math.abs(pct).toLocaleString("es-CO", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) +
    " %";
  const vTxt = hov ? (fmt || fmtInt)(last) : fmtV;
  const aTxt = hov && alcSeries ? (fmt || fmtInt)(alcSeries[i]) : alc;
  return (
    <div
      className={"now sbox" + (hov ? " is-year" : "")}
      style={{ "--sc": color } as React.CSSProperties}
      aria-live="polite"
    >
      <div className="st-l">
        {hov ? (
          <>
            <b>Año {year}</b>
            <YearBack onBack={onBack} ultimo={ultimo} />
          </>
        ) : (
          label
        )}
      </div>
      <div className="st-main">
        <div className="v">{vTxt}</div>
        <div className="u">{unit}</div>
      </div>
      {prev != null ? (
        <div className="st-chip">
          <span className="chip">
            {up ? "▲" : "▼"} {sg}
          </span>
          <span className="vs">vs. {years[i - 1]}</span>
        </div>
      ) : (
        <div className="st-chip">
          <span className="vs">Primer año de la serie</span>
        </div>
      )}
      {aTxt != null ? (
        <div className="st-alc">
          <span className="dash" aria-hidden="true"></span>
          <span>{ALC}</span>
          <b>{aTxt}</b>
        </div>
      ) : null}
    </div>
  );
}
function PanoramaBody({ D, country }: { D: PanoramaData; country: string }) {
  const [rS, zS] = useYearZoom(D.years.length),
    [rI, zI] = useYearZoom(D.years.length),
    [rC, zC] = useYearZoom(D.years.length),
    [rT, zT] = useYearZoom(D.years.length); // zoom de años por gráfica
  const [hlC, setHlC] = useState<any>(null);
  const [yC, setYC] = useState<any>(null),
    [yS, setYS] = useState<any>(null),
    [yT, setYT] = useState<any>(null),
    [yI, setYI] = useState<any>(null); // año bajo el cursor
  const [pinS, setPinS] = useState<any>(null); // ninguna línea resaltada por defecto
  const togS = (n: any) => setPinS((p) => (p === n ? null : n));
  const [topN, setTopN] = useState(10);
  const hlS = pinS;
  const [hlT, setHlT] = useState<any>(null);
  const [ind, setInd] = useState(() =>
    "age" in D.indicadores ? "age" : Object.keys(D.indicadores)[0],
  );
  const one = country !== "Todos";
  const ci = D.paises.findIndex((c) => c.name === country);
  const years = D.years;
  const y1 = years[years.length - 1];
  const NOW_T = `Valor actual (${y1})`;
  const colores = D.paises.map((c, i) => colorPais(c.name, i));
  const alcPorAnio: number[] =
    D.promedioAlc ??
    years.map((_, yi) => Math.round(mean(D.seriePais.map((s) => s[yi]))));
  const panoramaCountry = years.map((y, yi) => {
    const o: any = { year: y };
    D.paises.forEach((c, i) => (o[c.name] = D.seriePais[i][yi]));
    o[ALC] = alcPorAnio[yi];
    return o;
  });
  const sectorData = useMemo(
    () =>
      years.map((y, yi) => {
        const o: any = { year: y };
        D.sectores.forEach(([n, serie]) => (o[n] = serie[yi]));
        return o;
      }),
    [D],
  );
  const typeData = useMemo(
    () =>
      years.map((y, yi) => {
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

  const rawInd = D.indicadores[ind];
  const indObj = {
    ...rawInd,
    vals: rawInd.valores,
    fmt: (v: number) =>
      rawInd.decimals
        ? v.toFixed(rawInd.decimals).replace(".", ",")
        : fmtInt(v),
  };
  const indAx = indObj.unit.charAt(0).toUpperCase() + indObj.unit.slice(1);
  const indAvg = rawInd.promedio ?? mean(indObj.vals);
  const barData = D.paises
    .map((c, i) => ({
      name: c.name,
      id: c.id,
      v: indObj.vals[i],
      fill: colores[i],
    }))
    .sort((a, b) => b.v - a.v);
  const narrow = typeof window !== "undefined" && window.innerWidth <= 640; // cifras más pequeñas en celular
  /* Eje de países: nombre completo cuando cabe (≥ 60 px por barra); si no, el código de dos letras (regla de la hoja de estilo) */
  const CountryTick = ({ x, y, payload, width, visibleTicksCount }: any) => {
    const band = (width || 0) / (visibleTicksCount || 1);
    const c: any = D.paises.find((k) => k.name === payload.value) || {};
    return (
      <text
        x={x}
        y={y}
        dy="12"
        textAnchor="middle"
        fill={T.axis}
        fontSize="11.5"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {band >= 60 ? payload.value : c.id}
      </text>
    );
  };

  const at = (d: any[], y: any) =>
    d.find((r) => r.year === y) || d[d.length - 1];
  const oneData = one
    ? years.map((y, yi) => ({
        year: y,
        [country]: D.seriePais[ci][yi],
        [ALC]: panoramaCountry[yi][ALC],
      }))
    : [];
  const indDec = rawInd.decimals;
  const indSeries = one
    ? years.map((y, yi) => ({
        year: y,
        v: (D.serieIndicador?.[ind] ?? [])[yi],
        [ALC]:
          D.serieIndicadorAlc?.[ind]?.[yi] ??
          +(indAvg * (0.72 + (0.28 * yi) / (years.length - 1))).toFixed(indDec),
      }))
    : [];
  const cCol = one ? colores[ci] : T.highlight;

  return (
    <div className="grid2">
      <section className="card">
        <CardHead
          title={
            one
              ? "Regulaciones vigentes por año"
              : "Regulaciones vigentes por año y país"
          }
        />
        <div className="cbody">
          <div className="chart" ref={rC}>
            {one ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={oneData}
                  margin={{
                    top: AX_TOP,
                    right: 18,
                    left: 0,
                    bottom: zC ? 10 : 0,
                  }}
                  {...yearHover(setYC)}
                >
                  <defs>
                    <linearGradient id="ga-pan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={cCol} stopOpacity=".18" />
                      <stop offset="1" stopColor={cCol} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={T.grid} />
                  <XAxis {...yearAxis(T)} />
                  {zoomBrush(zC)}
                  <YAxis
                    {...axisProps(T)}
                    width={48}
                    tickFormatter={(v) => fmtInt(v)}
                    label={axT("Regulaciones vigentes", "y")}
                  />
                  <Tooltip {...sideTip(T)} />
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
                  <Area
                    type="monotone"
                    dataKey={ALC}
                    name={ALC}
                    stroke={ALC_COLOR}
                    strokeWidth={1.75}
                    strokeDasharray={ALC_DASH}
                    fill="none"
                    isAnimationActive={false}
                    activeDot={{ r: 4, stroke: T.surface, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <MultiLine
                zoom={zC}
                T={T}
                data={panoramaCountry}
                series={D.paises.map((c) => c.name)}
                colors={colores}
                hl={hlC}
                yT="Regulaciones vigentes"
                refKey={ALC}
                setYear={setYC}
                onPin={(n: any) => setHlC((p) => (p === n ? null : n))}
              />
            )}
          </div>
          {one ? (
            <StatBox
              years={years}
              ultimo={y1}
              series={D.seriePais[ci]}
              color={cCol}
              label={NOW_T}
              fmtV={fmtInt(D.paises[ci].now)}
              unit="regulaciones vigentes"
              alc={fmtInt(panoramaCountry[panoramaCountry.length - 1][ALC])}
              year={yC}
              onBack={() => setYC(null)}
              alcSeries={panoramaCountry.map((r) => r[ALC])}
            />
          ) : (
            <NowBox
              ultimo={y1}
              title={NOW_T}
              year={yC}
              onBack={() => setYC(null)}
              hl={hlC}
              onPick={(n: any) => setHlC((p) => (p === n ? null : n))}
              onClear={() => setHlC(null)}
              rows={((r) => [
                ...D.paises.map((c, i) => ({
                  name: c.name,
                  value: r[c.name],
                  color: hlC && hlC !== c.name ? neutral : colores[i],
                })),
                { name: ALC, value: r[ALC], color: ALC_COLOR, ref: true },
              ])(at(panoramaCountry, yC))}
            />
          )}
        </div>
        {ZoomHint(zC)}
      </section>

      <section className="card">
        <CardHead title="Regulaciones vigentes por año y tipo" />
        <div className="cbody">
          <div className="chart" ref={rT}>
            <MultiLine
              zoom={zT}
              T={T}
              data={typeData}
              series={D.tipos.map((t) => t[0])}
              colors={COLORES_SERIE}
              hl={hlT}
              yT="Regulaciones vigentes"
              setYear={setYT}
              onPin={(n: any) => setHlT((p) => (p === n ? null : n))}
            />
          </div>
          <NowBox
            ultimo={y1}
            title={NOW_T}
            year={yT}
            onBack={() => setYT(null)}
            hl={hlT}
            onPick={(n: any) => setHlT((p) => (p === n ? null : n))}
            onClear={() => setHlT(null)}
            rows={D.tipos.map((t, i) => ({
              name: t[0],
              label: star(t[0]),
              value: (yT != null
                ? at(typeData, yT)
                : typeData[typeData.length - 1])[t[0]],
              color:
                hlT && hlT !== t[0]
                  ? neutral
                  : COLORES_SERIE[i % COLORES_SERIE.length],
            }))}
          />
        </div>
        {otrosNote(D.tipos.map((t) => t[0]))}
        {ZoomHint(zT)}
      </section>

      <section className="card">
        <CardHead
          tall={true}
          ctlLeft={true}
          title="Regulaciones vigentes por año y sector"
        >
          <div className="ctlrow">
            <div className="cg">
              <span className="clbl">Mostrar</span>
              <Dd
                value={String(topN)}
                onChange={(v) => {
                  setTopN(+v);
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
          <div className="chart" ref={rS}>
            <MultiLine
              zoom={zS}
              T={T}
              data={sectorData}
              series={shownS}
              colors={shownS.map((n) =>
                colorSector(D.sectores.findIndex((x) => x[0] === n)),
              )}
              hl={shownS.includes(hlS) ? hlS : null}
              onPin={togS}
              yT="Regulaciones vigentes"
              setYear={setYS}
            />
          </div>
          <NowBox
            ultimo={y1}
            title={NOW_T}
            year={yS}
            onBack={() => setYS(null)}
            hl={hlS}
            onPick={togS}
            onClear={() => setPinS(null)}
            rows={sectorNow.map((s) => ({
              name: s.name,
              value: yS != null ? at(sectorData, yS)[s.name] : s.value,
              color:
                hlS && s.name !== hlS
                  ? neutral
                  : colorSector(D.sectores.findIndex((x) => x[0] === s.name)),
            }))}
          />
        </div>
        {ZoomHint(zS)}
      </section>

      <section className="card">
        <CardHead
          tall={true}
          ctlLeft={true}
          title={
            one
              ? "Características del acervo regulatorio de " + country
              : "Características del acervo regulatorio por país"
          }
        >
          <div className="ctlrow">
            <div className="cg">
              <span className="clbl">Indicador</span>
              <Dd
                value={ind}
                onChange={setInd}
                options={Object.entries(D.indicadores).map(([k, o]: any) => [
                  k,
                  o.label,
                ])}
                label="Indicador a mostrar"
              />
            </div>
          </div>
        </CardHead>
        <div className="cbody">
          <div className={"chart" + (one ? "" : " has-key")} ref={rI}>
            {one ? null : (
              <div
                className="alc-key"
                aria-label={ALC + ": " + indObj.fmt(indAvg)}
              >
                <i aria-hidden="true"></i>
                {ALC}
                <b>{indObj.fmt(indAvg)}</b>
              </div>
            )}
            {one ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={indSeries}
                  margin={{
                    top: AX_TOP,
                    right: 18,
                    left: 0,
                    bottom: zI ? 10 : 0,
                  }}
                  {...yearHover(setYI)}
                >
                  <CartesianGrid vertical={false} stroke={T.grid} />
                  <XAxis {...yearAxis(T)} />
                  {zoomBrush(zI)}
                  <YAxis
                    {...axisProps(T)}
                    width={48}
                    tickFormatter={(v) => indObj.fmt(v)}
                    label={axT(indAx, "y")}
                  />
                  <Tooltip {...sideTip(T)} />
                  <Line
                    type="monotone"
                    dataKey="v"
                    name={country}
                    stroke={cCol}
                    strokeWidth={2}
                    isAnimationActive={false}
                    dot={false}
                    activeDot={{ r: 5, stroke: T.surface, strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={ALC}
                    name={ALC}
                    stroke={ALC_COLOR}
                    strokeWidth={1.75}
                    strokeDasharray={ALC_DASH}
                    isAnimationActive={false}
                    dot={false}
                    activeDot={{ r: 4, stroke: T.surface, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: AX_TOP + 16, right: 8, left: 0, bottom: 0 }}
                  barCategoryGap="28%"
                >
                  <CartesianGrid vertical={false} stroke={T.grid} />
                  <XAxis
                    dataKey="name"
                    {...axisProps(T)}
                    interval={0}
                    height={AX_XH}
                    label={axT("País", "x")}
                    tick={CountryTick}
                  />
                  <YAxis
                    {...axisProps(T)}
                    width={48}
                    tickFormatter={(v) => indObj.fmt(v)}
                    label={axT(indAx, "y")}
                  />
                  <Tooltip
                    cursor={{ fill: T.grid, opacity: 0.5 }}
                    content={({ active, payload }) =>
                      active && payload && payload.length ? (
                        <div className="tt">
                          <div className="t">{payload[0].payload.name}</div>
                          <div className="r">
                            <i
                              style={{ background: payload[0].payload.fill }}
                            ></i>
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
                  <ReferenceLine
                    y={indAvg}
                    stroke={ALC_COLOR}
                    strokeWidth={1.5}
                    strokeDasharray={ALC_DASH}
                    ifOverflow="extendDomain"
                  />
                  <Bar
                    dataKey="v"
                    radius={T.barRadius}
                    maxBarSize={44}
                    isAnimationActive={false}
                  >
                    {barData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                    <LabelList
                      dataKey="v"
                      position="top"
                      formatter={(v) => indObj.fmt(v)}
                      style={{
                        fill: "var(--ink)",
                        fontSize: narrow ? 10.5 : 12,
                        fontWeight: 600,
                        fontFamily: "Inter, system-ui, sans-serif",
                        stroke: "#fff",
                        strokeWidth: 4,
                        strokeLinejoin: "round",
                        paintOrder: "stroke",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {one ? (
            <StatBox
              years={years}
              ultimo={y1}
              series={indSeries.map((r) => r.v)}
              color={cCol}
              label={NOW_T}
              fmtV={indObj.fmt(indObj.vals[ci])}
              unit={indObj.unit}
              alc={indObj.fmt(indAvg)}
              year={yI}
              onBack={() => setYI(null)}
              fmt={indObj.fmt}
              alcSeries={indSeries.map((r) => r[ALC])}
            />
          ) : null}
        </div>
        {one ? ZoomHint(zI) : null}
      </section>
    </div>
  );
}

/* ================= Barreras ================= */
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
