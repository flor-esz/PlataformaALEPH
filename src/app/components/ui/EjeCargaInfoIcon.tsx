import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

// ─── Ícono "qué mide este eje" (Trámites) ───────────────────────────────────
// Compartido por PanelTipoSubdimension (Trámites País, "CARGA POR EJE") y
// BarrerasPorPaisCard (Trámites Regional, fichas de país) -- ambos reciben el
// mismo EJE_CARGA_INFO (App.tsx) y solo lo pasan cuando el eje activo es de
// Trámites (Accesibilidad/Certidumbre/Cumplimiento/Proporcionalidad); Barreras
// no pasa `info`, así que este componente no renderiza nada ahí.
export function EjeCargaInfoIcon({ info }: { info?: { enfoque: string; pregunta: string } }) {
  if (!info) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label="Qué mide este eje" className="inline-flex items-center justify-center shrink-0" style={{ color: "#6B7A8D" }}>
          <Info size={13} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 text-[12px] space-y-2" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
        <p style={{ color: "#14161A" }}>{info.enfoque}</p>
        <p className="italic" style={{ color: "#6B7A8D" }}>{info.pregunta}</p>
      </PopoverContent>
    </Popover>
  );
}
