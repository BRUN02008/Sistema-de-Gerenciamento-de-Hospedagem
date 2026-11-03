import { useState } from "react";
import {
  LayoutDashboard, CalendarDays, BedDouble, ConciergeBell,
  DollarSign, Tag, BarChart3, Settings, LogOut,
  Search, ChevronRight, ChevronDown, X, Menu
} from "lucide-react";
import triboLogo from "../../imports/simbolo_do_tribo.jpeg";
import type { Store } from "../store/useStore";
import { DashboardPage } from "./pages/DashboardPage";
import { ReservationsPage } from "./pages/ReservationsPage";
import { AccommodationsPage } from "./pages/AccommodationsPage";
import { ServicesPage } from "./pages/ServicesPage";
import { FinancesPage } from "./pages/FinancesPage";
import { PackagesPage } from "./pages/PackagesPage";
import { ReportsPage } from "./pages/ReportsPage";

type Page = "dashboard" | "reservations" | "accommodations" | "services" | "finances" | "packages" | "reports" | "settings";

interface AdminShellProps {
  store: Store;
  onLogout: () => void;
}

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "reservations" as Page, label: "Reservas", icon: CalendarDays },
  { id: "accommodations" as Page, label: "Acomodações", icon: BedDouble },
  { id: "services" as Page, label: "Serviços", icon: ConciergeBell },
  { id: "finances" as Page, label: "Financeiro", icon: DollarSign },
  { id: "packages" as Page, label: "Pacotes", icon: Tag },
  { id: "reports" as Page, label: "Relatórios", icon: BarChart3 },
];

const navGroups = [
  { label: "Principal", items: navItems.slice(0, 3) },
  { label: "Gestão", items: navItems.slice(3, 5) },
  { label: "Estratégia", items: navItems.slice(5) },
];

const pageLabels: Record<Page, string> = {
  dashboard: "Dashboard",
  reservations: "Gestão de Reservas",
  accommodations: "Acomodações",
  services: "Serviços",
  finances: "Controle Financeiro",
  packages: "Pacotes",
  reports: "Relatórios",
  settings: "Configurações",
};

// ─── Shared nav content ───────────────────────────────────────────────────────

function NavContent({
  page, onNavigate, pendingCount, activePackages, onLogout, onClose,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
  pendingCount: number;
  activePackages: number;
  onLogout: () => void;
  onClose?: () => void;
}) {
  function nav(id: Page) {
    onNavigate(id);
    onClose?.();
  }

  return (
    <>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <div style={{ fontSize: "0.6rem", color: "rgba(232,226,214,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px 8px", fontWeight: 600 }}>
              {group.label}
            </div>
            {group.items.map(({ id, label, icon: Icon }) => {
              const active = page === id;
              const badge =
                id === "reservations" && pendingCount > 0 ? pendingCount
                : id === "packages" && activePackages > 0 ? activePackages
                : 0;
              return (
                <button
                  key={id}
                  onClick={() => nav(id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{
                    background: active ? "rgba(196,136,42,0.15)" : "transparent",
                    borderLeft: active ? "2.5px solid #c4882a" : "2.5px solid transparent",
                    color: active ? "#f0ead8" : "rgba(232,226,214,0.65)",
                  }}
                >
                  <Icon size={16} style={{ color: active ? "#c4882a" : undefined, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.875rem", flex: 1 }}>{label}</span>
                  {badge > 0 && (
                    id === "reservations"
                      ? <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#c4882a", fontSize: "0.65rem", color: "#1a2e14", fontWeight: 700 }}>{badge}</span>
                      : <span className="px-1.5 py-0.5 rounded-full" style={{ background: "#2d5016", fontSize: "0.62rem", color: "#f0ead8", fontWeight: 600 }}>{badge} ativos</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
          <img src={triboLogo} alt="" className="rounded-full object-cover flex-shrink-0" style={{ width: 32, height: 32 }} />
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: "0.8rem", color: "#f0ead8", fontWeight: 500 }}>Administrador</div>
            <div style={{ fontSize: "0.67rem", color: "#c4882a" }}>Acesso Total</div>
          </div>
          <button onClick={onLogout} title="Sair" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(232,226,214,0.35)", lineHeight: 0 }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function AdminShell({ store, onLogout }: AdminShellProps) {
  const [page, setPage] = useState<Page>("dashboard");
  const [searchVal, setSearchVal] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { reservations, packages } = store;
  const pendingCount = reservations.filter(r => r.status === "pendente").length;
  const activePackages = packages.filter(p => p.active).length;

  function navigateTo(p: Page) {
    setPage(p);
    setShowProfile(false);
  }

  function renderPage() {
    switch (page) {
      case "dashboard": return <DashboardPage store={store} onNavigate={p => navigateTo(p as Page)} />;
      case "reservations": return <ReservationsPage store={store} />;
      case "accommodations": return <AccommodationsPage store={store} />;
      case "services": return <ServicesPage store={store} />;
      case "finances": return <FinancesPage store={store} />;
      case "packages": return <PackagesPage store={store} />;
      case "reports": return <ReportsPage store={store} />;
      case "settings": return (
        <div className="flex items-center justify-center h-72 flex-col gap-3">
          <Settings size={36} style={{ color: "#ede8df" }} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#1c1a17" }}>Configurações</div>
          <p style={{ fontSize: "0.875rem", color: "#7a7060" }}>Em desenvolvimento</p>
        </div>
      );
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "#f7f4ef" }}>

      {/* ── SIDEBAR — desktop/tablet only ── */}
      <aside
        className="hidden md:flex flex-shrink-0 flex-col h-full"
        style={{ width: 240, background: "#1a2e14", color: "#e8e2d6" }}
      >
        <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <img src={triboLogo} alt="Tribo Hospedagem" className="rounded-xl object-cover flex-shrink-0" style={{ width: 38, height: 38 }} />
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", color: "#f7f4ef", fontSize: "0.88rem", fontWeight: 600, lineHeight: 1.2 }}>Tribo Hospedagem</div>
            <div style={{ fontSize: "0.58rem", color: "#c4882a", letterSpacing: "0.1em", textTransform: "uppercase" }}>Painel Administrativo</div>
          </div>
        </div>
        <NavContent
          page={page}
          onNavigate={navigateTo}
          pendingCount={pendingCount}
          activePackages={activePackages}
          onLogout={onLogout}
        />
      </aside>

      {/* ── MOBILE OVERLAY BACKDROP ── */}
      <div
        onClick={() => setMobileOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(10,18,7,0.55)",
          backdropFilter: "blur(3px)",
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transition: "opacity 280ms ease",
        }}
      />

      {/* ── MOBILE SLIDE-IN MENU ── */}
      <div
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
          width: 280,
          background: "#1a2e14",
          color: "#e8e2d6",
          display: "flex",
          flexDirection: "column",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: mobileOpen ? "8px 0 40px rgba(0,0,0,0.35)" : "none",
        }}
      >
        {/* Mobile menu header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <img src={triboLogo} alt="Tribo Hospedagem" className="rounded-xl object-cover flex-shrink-0" style={{ width: 36, height: 36 }} />
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", color: "#f7f4ef", fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.2 }}>Tribo Hospedagem</div>
              <div style={{ fontSize: "0.56rem", color: "#c4882a", letterSpacing: "0.1em", textTransform: "uppercase" }}>Painel Administrativo</div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(232,226,214,0.7)", border: "none", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>

        <NavContent
          page={page}
          onNavigate={navigateTo}
          pendingCount={pendingCount}
          activePackages={activePackages}
          onLogout={onLogout}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header
          className="flex items-center gap-3 px-4 md:px-6 flex-shrink-0"
          style={{ height: 64, background: "#fdfaf5", borderBottom: "1px solid rgba(44,35,18,0.08)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
        >
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
            style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.1)", color: "#1a2e14", cursor: "pointer" }}
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>

          {/* Logo mark — mobile only, when menu is closed */}
          <div className="flex md:hidden items-center gap-2 flex-shrink-0">
            <img src={triboLogo} alt="" className="rounded-lg object-cover" style={{ width: 26, height: 26 }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.85rem", color: "#1a2e14", fontWeight: 600 }}>Tribo</span>
          </div>

          {/* Breadcrumb — desktop */}
          <div className="hidden md:flex items-center gap-2 mr-4 flex-shrink-0">
            <span style={{ fontSize: "0.78rem", color: "#7a7060" }}>Tribo</span>
            <ChevronRight size={13} style={{ color: "#ede8df" }} />
            <span style={{ fontSize: "0.82rem", color: "#1c1a17", fontWeight: 500 }}>{pageLabels[page]}</span>
          </div>

          {/* Search — hidden on small mobile, visible md+ */}
          <div className="hidden sm:flex flex-1 max-w-md items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.08)" }}>
            <Search size={14} style={{ color: "#7a7060", flexShrink: 0 }} />
            <input placeholder="Buscar reservas, hóspedes…" value={searchVal} onChange={e => setSearchVal(e.target.value)} className="flex-1 outline-none bg-transparent" style={{ fontSize: "0.85rem", color: "#1c1a17" }} />
          </div>

          {/* Page label — mobile only, centered */}
          <div className="flex sm:hidden flex-1 justify-center">
            <span style={{ fontSize: "0.82rem", color: "#1c1a17", fontWeight: 500 }}>{pageLabels[page]}</span>
          </div>

          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl transition-colors"
                style={{ background: showProfile ? "#ede8df" : "transparent", border: "1px solid rgba(44,35,18,0.08)" }}
              >
                <img src={triboLogo} alt="" className="rounded-full object-cover" style={{ width: 28, height: 28 }} />
                <div className="hidden md:block text-left">
                  <div style={{ fontSize: "0.8rem", color: "#1c1a17", fontWeight: 500, lineHeight: 1.2 }}>Admin</div>
                  <div style={{ fontSize: "0.65rem", color: "#7a7060", lineHeight: 1 }}>Gerente Geral</div>
                </div>
                <ChevronDown size={13} style={{ color: "#7a7060" }} className="hidden md:block" />
              </button>
              {showProfile && (
                <div className="absolute right-0 top-12 w-52 rounded-2xl shadow-2xl overflow-hidden z-50" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.1)" }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(44,35,18,0.06)" }}>
                    <div style={{ fontSize: "0.85rem", color: "#1c1a17", fontWeight: 500 }}>Administrador</div>
                    <div style={{ fontSize: "0.75rem", color: "#7a7060" }}>admin@tribo.com</div>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { navigateTo("settings"); setShowProfile(false); }} className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2" style={{ fontSize: "0.85rem", color: "#1c1a17", background: "none" }}>
                      <Settings size={14} style={{ color: "#7a7060" }} /> Configurações
                    </button>
                    <button onClick={onLogout} className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2" style={{ fontSize: "0.85rem", color: "#b93232", background: "none" }}>
                      <LogOut size={14} /> Sair do sistema
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ background: "#f7f4ef" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}
