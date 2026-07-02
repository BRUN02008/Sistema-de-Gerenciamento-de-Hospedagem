import { useState } from "react";
import {
  LayoutDashboard, CalendarDays, BedDouble, ConciergeBell,
  DollarSign, Tag, BarChart3, Settings, LogOut,
  Search, ChevronRight, ChevronDown, X
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


export function AdminShell({ store, onLogout }: AdminShellProps) {
  const [page, setPage] = useState<Page>("dashboard");
  const [searchVal, setSearchVal] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const { reservations, packages } = store;
  const pendingCount = reservations.filter(r => r.status === "pendente").length;
  const activePackages = packages.filter(p => p.active).length;

  function renderPage() {
    switch (page) {
      case "dashboard": return <DashboardPage store={store} onNavigate={p => setPage(p as Page)} />;
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
      {/* ── SIDEBAR ── */}
      <aside className="flex-shrink-0 flex flex-col h-full" style={{ width: 240, background: "#1a2e14", color: "#e8e2d6" }}>
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <img src={triboLogo} alt="Tribo Hospedagem" className="rounded-xl object-cover flex-shrink-0" style={{ width: 38, height: 38 }} />
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", color: "#f7f4ef", fontSize: "0.88rem", fontWeight: 600, lineHeight: 1.2 }}>Tribo Hospedagem</div>
            <div style={{ fontSize: "0.58rem", color: "#c4882a", letterSpacing: "0.1em", textTransform: "uppercase" }}>Painel Administrativo</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          <div style={{ fontSize: "0.6rem", color: "rgba(232,226,214,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px 8px", fontWeight: 600 }}>Principal</div>
          {navItems.slice(0, 3).map(({ id, label, icon: Icon }) => {
            const active = page === id;
            const badge = id === "reservations" && pendingCount > 0 ? pendingCount : 0;
            return (
              <button key={id} onClick={() => setPage(id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{ background: active ? "rgba(196,136,42,0.15)" : "transparent", borderLeft: active ? "2.5px solid #c4882a" : "2.5px solid transparent", color: active ? "#f0ead8" : "rgba(232,226,214,0.65)" }}>
                <Icon size={16} style={{ color: active ? "#c4882a" : undefined, flexShrink: 0 }} />
                <span style={{ fontSize: "0.875rem", flex: 1 }}>{label}</span>
                {badge > 0 && <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#c4882a", fontSize: "0.65rem", color: "#1a2e14", fontWeight: 700 }}>{badge}</span>}
              </button>
            );
          })}

          <div style={{ fontSize: "0.6rem", color: "rgba(232,226,214,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 10px 8px", fontWeight: 600 }}>Gestão</div>
          {navItems.slice(3, 5).map(({ id, label, icon: Icon }) => {
            const active = page === id;
            return (
              <button key={id} onClick={() => setPage(id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{ background: active ? "rgba(196,136,42,0.15)" : "transparent", borderLeft: active ? "2.5px solid #c4882a" : "2.5px solid transparent", color: active ? "#f0ead8" : "rgba(232,226,214,0.65)" }}>
                <Icon size={16} style={{ color: active ? "#c4882a" : undefined, flexShrink: 0 }} />
                <span style={{ fontSize: "0.875rem" }}>{label}</span>
              </button>
            );
          })}

          <div style={{ fontSize: "0.6rem", color: "rgba(232,226,214,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 10px 8px", fontWeight: 600 }}>Estratégia</div>
          {navItems.slice(5).map(({ id, label, icon: Icon }) => {
            const active = page === id;
            const badge = id === "packages" && activePackages > 0 ? activePackages : 0;
            return (
              <button key={id} onClick={() => setPage(id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{ background: active ? "rgba(196,136,42,0.15)" : "transparent", borderLeft: active ? "2.5px solid #c4882a" : "2.5px solid transparent", color: active ? "#f0ead8" : "rgba(232,226,214,0.65)" }}>
                <Icon size={16} style={{ color: active ? "#c4882a" : undefined, flexShrink: 0 }} />
                <span style={{ fontSize: "0.875rem", flex: 1 }}>{label}</span>
                {badge > 0 && <span className="px-1.5 py-0.5 rounded-full" style={{ background: "#2d5016", fontSize: "0.62rem", color: "#f0ead8", fontWeight: 600 }}>{badge} ativos</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom user */}
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
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 flex-shrink-0" style={{ height: 64, background: "#fdfaf5", borderBottom: "1px solid rgba(44,35,18,0.08)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mr-4">
            <span style={{ fontSize: "0.78rem", color: "#7a7060" }}>Tribo</span>
            <ChevronRight size={13} style={{ color: "#ede8df" }} />
            <span style={{ fontSize: "0.82rem", color: "#1c1a17", fontWeight: 500 }}>{pageLabels[page]}</span>
          </div>

          <div className="flex-1 max-w-md flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.08)" }}>
            <Search size={14} style={{ color: "#7a7060", flexShrink: 0 }} />
            <input placeholder="Buscar reservas, hóspedes, acomodações…" value={searchVal} onChange={e => setSearchVal(e.target.value)} className="flex-1 outline-none bg-transparent" style={{ fontSize: "0.85rem", color: "#1c1a17" }} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-colors" style={{ background: showProfile ? "#ede8df" : "transparent", border: "1px solid rgba(44,35,18,0.08)" }}>
                <img src={triboLogo} alt="" className="rounded-full object-cover" style={{ width: 28, height: 28 }} />
                <div className="text-left">
                  <div style={{ fontSize: "0.8rem", color: "#1c1a17", fontWeight: 500, lineHeight: 1.2 }}>Admin</div>
                  <div style={{ fontSize: "0.65rem", color: "#7a7060", lineHeight: 1 }}>Gerente Geral</div>
                </div>
                <ChevronDown size={13} style={{ color: "#7a7060" }} />
              </button>
              {showProfile && (
                <div className="absolute right-0 top-12 w-52 rounded-2xl shadow-2xl overflow-hidden z-50" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.1)" }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(44,35,18,0.06)" }}>
                    <div style={{ fontSize: "0.85rem", color: "#1c1a17", fontWeight: 500 }}>Administrador</div>
                    <div style={{ fontSize: "0.75rem", color: "#7a7060" }}>admin@tribo.com</div>
                  </div>
                  <div className="p-2">
                    <button onClick={() => setPage("settings")} className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2" style={{ fontSize: "0.85rem", color: "#1c1a17", background: "none" }}>
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
          <div className="max-w-7xl mx-auto px-6 py-6">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}
