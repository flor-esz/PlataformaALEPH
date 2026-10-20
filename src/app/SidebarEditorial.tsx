// ─── Menú lateral · rediseño "Editorial luminosa" ───────────────────────────
// Reemplaza visualmente al `Sidebar` de App.tsx SIN cambiar su navegación:
// mismos destinos (`onNavigate`), mismas reglas de visibilidad por rol y por
// feature flag, mismo comportamiento de grupos (el primer clic abre el grupo
// y navega a su primer hijo), mismo cajón en móvil.
//
// Lo nuevo es solo apariencia y estructura visual: logo "RL", iconos en cajita,
// grupos con línea guía, botón para replegar a modo compacto (con tooltips),
// pie con usuario. Estilos en ../styles/sidebar-editorial.css, TODAS las clases
// con prefijo `edsb-` (no chocan con Tailwind ni con nada existente).
//
// No importa valores de App.tsx (solo tipos, que se borran al compilar), para
// no crear el ciclo App → SidebarEditorial → App descrito en theme.ts. Lo que
// necesita de App.tsx (FEATURES, ROLE_LABEL…) llega por props.
import { useEffect, useState } from "react";
import type React from "react";
import {
  FileText, ClipboardCheck, ClipboardList, Gauge, BookOpen,
  ChevronDown, ChevronLeft, X,
} from "lucide-react";
import type { View } from "./App";
import { I } from "./editorial/icons";

// Íconos del diseñador (los mismos trazos del prototipo, grosor 1.8). Mismo contrato que los de lucide
// (`size`, `strokeWidth`), así `row()`/`group()` no cambian. Lo que no está en el prototipo sigue con lucide.
const proto = (d: string): React.ElementType =>
  function ProtoIcon({ size = 17, strokeWidth = 1.8 }: { size?: number; strokeWidth?: number }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
      </svg>
    );
  };
const IcTableros = proto(I.panorama), IcPanorama = proto(I.bars), IcBarreras = proto(I.barreras),
  IcTramites = proto(I.tramites), IcCosteo = proto(I.impacto), IcIdr = proto(I.idr),
  IcReportes = proto(I.reportes), IcAdmin = proto(I.settings), IcUsuarios = proto(I.users),
  IcCatalogos = proto(I.layers), IcFuentes = proto(I.db), IcBitacora = proto(I.history),
  IcSalir = proto(I.logout);
import "../styles/sidebar-editorial.css";

const DASHBOARD_SECTIONS = ["dashboard", "barreras", "tramites", "impacto-economico", "indice"];

export interface SidebarEditorialProps {
  activeSection: string;
  setActiveSection: (s: any) => void;
  activeView: View;
  userRole: string;
  roleLabel: string;
  features: { validacionHitl: boolean; documentacionMetodologia: boolean };
  onNavigate: (v: View) => void;
  onLogout: () => void;
  isDrawerOpen?: boolean;
  onDrawerClose?: () => void;
  // Props que el Sidebar anterior recibía y este no usa; se aceptan para que
  // `<SidebarEditorial {...sidebarProps} />` compile sin cambios.
  activeCountry?: unknown;
  setUserRole?: unknown;
}

function useIsMobile768() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

export function SidebarEditorial({
  activeSection, setActiveSection, activeView, userRole, roleLabel, features,
  onNavigate, onLogout, isDrawerOpen, onDrawerClose,
}: SidebarEditorialProps) {
  const isMobile = useIsMobile768();
  const [collapsed, setCollapsed] = useState(() => typeof window !== "undefined" && window.innerWidth < 1360);
  const [dashboardsOpen, setDashboardsOpen] = useState(DASHBOARD_SECTIONS.includes(activeSection));
  const [adminOpen, setAdminOpen] = useState(activeView.screen === "administracion");
  const [revisionOpen, setRevisionOpen] = useState(activeView.screen.startsWith("revision"));
  const [tip, setTip] = useState<{ label: string; top: number; left: number } | null>(null);

  const rail = !isMobile && collapsed;
  const nav = (fn: () => void) => { fn(); onDrawerClose?.(); };
  const adminTab = (activeView as { tab?: string }).tab;

  const show = (label: string) => (e: React.SyntheticEvent<HTMLElement>) => {
    if (!rail) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ label, top: r.top + r.height / 2, left: r.right + 12 });
  };
  const hide = () => setTip(null);

  const row = (
    label: string, section: string, Icon: React.ElementType,
    onClick?: () => void, forceActive?: boolean, child?: boolean,
  ) => {
    const active = forceActive !== undefined ? forceActive : activeSection === section;
    return (
      <button
        key={label}
        className={"edsb-sn" + (child ? " edsb-child" : "")}
        aria-current={active ? "page" : undefined}
        aria-label={label}
        onClick={() => { setActiveSection(section); onClick?.(); }}
        onMouseEnter={show(label)} onMouseLeave={hide} onFocus={show(label)} onBlur={hide}
      >
        <span className="edsb-ico"><Icon size={17} strokeWidth={1.8} /></span>
        <span className="edsb-txt">{label}</span>
        {child ? <span className="edsb-elbow" aria-hidden="true" /> : null}
      </button>
    );
  };

  const group = (
    gk: string, label: string, Icon: React.ElementType, isOpen: boolean,
    hasActive: boolean, onToggle: () => void, children: React.ReactNode,
  ) => (
    <div className="edsb-group" key={gk}>
      <button
        className={"edsb-sn edsb-parent" + (hasActive ? " has-active" : "")}
        aria-expanded={isOpen}
        aria-controls={"edsb-sub-" + gk}
        aria-label={label}
        onClick={() => { hide(); if (rail) setCollapsed(false); else onToggle(); }}
        onMouseEnter={show(label)} onMouseLeave={hide} onFocus={show(label)} onBlur={hide}
      >
        <span className="edsb-ico"><Icon size={17} strokeWidth={1.8} /></span>
        <span className="edsb-txt">{label}</span>
        <ChevronDown className="edsb-chev" size={16} />
      </button>
      <div className="edsb-collapse" id={"edsb-sub-" + gk} data-open={isOpen}>
        <div><div className="edsb-sub" role="group" aria-label={label}>{children}</div></div>
      </div>
    </div>
  );

  const isAdminTab = (t: string) => activeView.screen === "administracion" && adminTab === t;

  const panel = (
    <>
      {!isMobile && (
        <button
          className="edsb-toggle"
          aria-label={collapsed ? "Expandir el menú" : "Contraer el menú"}
          title={collapsed ? "Expandir el menú" : "Contraer el menú"}
          onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c); hide(); }}
        >
          <ChevronLeft size={15} />
        </button>
      )}
      <div className="edsb-in">
        <div
          className={"edsb-brand" + (rail ? " edsb-brand-btn" : "")}
          onClick={() => { if (rail) { setCollapsed(false); hide(); } }}
          title={rail ? "Expandir el menú" : undefined}
        >
          <span className="edsb-mark" role="img" aria-label="RegLAC"><b>R</b><i>L</i></span>
          <div className="edsb-word">
            <div className="edsb-name"><b>Reg</b><span>LAC</span></div>
            <small>Inteligencia regulatoria</small>
          </div>
          {isMobile && (
            <button className="edsb-close" aria-label="Cerrar menú" onClick={onDrawerClose}><X size={20} /></button>
          )}
        </div>

        <div className="edsb-label">Menú</div>

        {group(
          "dash", "Dashboards", IcTableros, dashboardsOpen,
          DASHBOARD_SECTIONS.includes(activeSection),
          () => { setDashboardsOpen(!dashboardsOpen); if (!dashboardsOpen) nav(() => onNavigate({ screen: "panel-regional" })); },
          <>
            {row("Panorama Regulatorio", "dashboard", IcPanorama, () => nav(() => onNavigate({ screen: "panel-regional" })))}
            {row("Barreras Regulatorias", "barreras", IcBarreras, () => nav(() => onNavigate({ screen: "barreras" })))}
            {row("Trámites con potencial de mejora", "tramites", IcTramites, () => nav(() => onNavigate({ screen: "tramites" })))}
            {row("Costeo", "impacto-economico", IcCosteo, () => nav(() => onNavigate({ screen: "impacto-economico" })), undefined, true)}
            {row("Índice / IDR", "indice", IcIdr, () => nav(() => onNavigate({ screen: "indice" })))}
          </>,
        )}

        {features.validacionHitl && ["asesor", "analista", "validador", "administrador"].includes(userRole) && group(
          "revision", "Calidad", ClipboardCheck, revisionOpen,
          activeSection === "revision",
          () => { setRevisionOpen(!revisionOpen); if (!revisionOpen) nav(() => onNavigate({ screen: "revision-repositorio" })); },
          <>
            {row("Hallazgos", "revision", ClipboardList, () => nav(() => onNavigate({ screen: "revision-repositorio" })), activeView.screen === "revision-repositorio")}
            {row("Log de errores", "revision", FileText, () => nav(() => onNavigate({ screen: "revision-log-errores" })), activeView.screen === "revision-log-errores")}
            {row("Indicadores", "revision", Gauge, () => nav(() => onNavigate({ screen: "revision-indicadores" })), activeView.screen === "revision-indicadores")}
          </>,
        )}

        {row("Reportes", "reportes", IcReportes, () => nav(() => onNavigate({ screen: "reportes" })))}
        {features.documentacionMetodologia && row("Metodología", "documentacion", BookOpen, () => nav(() => onNavigate({ screen: "documentacion" })))}

        {userRole === "administrador" && (
          <>
            <div className="edsb-label">Gestión</div>
            {group(
              "admin", "Administración", IcAdmin, adminOpen,
              activeSection === "administracion",
              () => { setAdminOpen(!adminOpen); if (!adminOpen) nav(() => onNavigate({ screen: "administracion", tab: "usuarios" })); },
              <>
                {row("Usuarios", "administracion", IcUsuarios, () => nav(() => onNavigate({ screen: "administracion", tab: "usuarios" })), isAdminTab("usuarios"))}
                {row("Catálogos", "administracion", IcCatalogos, () => nav(() => onNavigate({ screen: "administracion", tab: "catalogos" })), isAdminTab("catalogos"))}
                {row("Fuentes", "administracion", IcFuentes, () => nav(() => onNavigate({ screen: "administracion", tab: "fuentes" })), isAdminTab("fuentes"))}
                {row("Bitácora", "administracion", IcBitacora, () => nav(() => onNavigate({ screen: "administracion", tab: "bitacora" })), isAdminTab("bitacora"))}
              </>,
            )}
          </>
        )}

        <div className="edsb-foot">
          <div className="edsb-bid">Banco Interamericano de Desarrollo</div>
          <div className="edsb-user" onMouseEnter={show("Ana Mejía · " + roleLabel)} onMouseLeave={hide}>
            <span className="edsb-avatar" aria-hidden="true">AM</span>
            <div className="edsb-user-meta"><b>Ana Mejía</b><small>{roleLabel}</small></div>
          </div>
          <button
            className="edsb-sn" aria-label="Salir" onClick={onLogout}
            onMouseEnter={show("Salir")} onMouseLeave={hide} onFocus={show("Salir")} onBlur={hide}
          >
            <span className="edsb-ico"><IcSalir size={17} strokeWidth={1.8} /></span>
            <span className="edsb-txt">Salir</span>
          </button>
        </div>
      </div>
      {tip && <div className="edsb-tip" role="tooltip" style={{ top: tip.top, left: tip.left }}>{tip.label}</div>}
    </>
  );

  if (isMobile) {
    if (!isDrawerOpen) return null;
    return (
      <>
        <div className="edsb-scrim" onClick={onDrawerClose} />
        <aside className="edsb edsb-drawer" aria-label="Navegación principal">{panel}</aside>
      </>
    );
  }

  return (
    <aside className={"edsb" + (collapsed ? " edsb-collapsed" : "")} aria-label="Navegación principal">
      {panel}
    </aside>
  );
}
