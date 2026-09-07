// ─── Public types ─────────────────────────────────────────────────────────────
export type IrrGeneralCardProps = {
  valor: number;
  onVerDetalle?: () => void;
};

// ─── Main component ───────────────────────────────────────────────────────────
// Tarjeta destacada del IRR general del panel regional — fondo sólido (misma
// altura mínima que KpiCard) en vez del fondo neutro C.card del resto de KPIs.
export function IrrGeneralCard({ valor, onVerDetalle }: IrrGeneralCardProps) {
  return (
    <div
      className="rounded-lg flex flex-col justify-between"
      style={{ backgroundColor: "#26456B", color: "white", padding: 20, minHeight: 140 }}
    >
      <p
        className="uppercase tracking-widest"
        style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, color: "#CFE0F0" }}
      >
        IRR general
      </p>
      <p
        className="font-semibold leading-none"
        style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 36, color: "white" }}
      >
        {valor}
      </p>
      <button
        onClick={onVerDetalle}
        style={{
          alignSelf: "flex-start",
          backgroundColor: "rgba(255,255,255,.14)",
          border: "1px solid rgba(255,255,255,.35)",
          color: "white",
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 999,
          padding: "7px 14px",
          cursor: "pointer",
        }}
      >
        Ver detalle del IRR →
      </button>
    </div>
  );
}
