import { useState } from "react";
import { LayoutDashboard, CalendarDays, BedDouble, DollarSign, BarChart3, Settings, LogOut, Trees, ChevronRight, Globe } from "lucide-react";
import { Dashboard } from "./Dashboard";
import { Reservations } from "./Reservations";
import { Rooms } from "./Rooms";
import { Finances } from "./Finances";
import { Reports } from "./Reports";
import type { Store } from "../store/useStore";

type Page = "dashboard" | "reservations" | "rooms" | "finances" | "reports" | "settings";

interface AdminShellProps {
  store: Store;
  onLogout: () => void;
}

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "reservations" as Page, label: "Reservas", icon: CalendarDays },
  { id: "rooms" as Page, label: "Quartos", icon: BedDouble },
  { id: "finances" as Page, label: "Financeiro", icon: DollarSign },
  { id: "reports" as Page, label: "Relatórios", icon: BarChart3 },
  { id: "settings" as Page, label: "Configurações", icon: Settings },
];

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  reservations: "Reservas",
  rooms: "Quartos",
  finances: "Financeiro",
  reports: "Relatórios",
  settings: "Configurações",
};

export function AdminShell({ store, onLogout }: AdminShellProps) {
  const [page, setPage] = useState<Page>("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard store={store} />;
      case "reservations": return <Reservations store={store} />;
      case "rooms": return <Rooms store={store} />;
      case "finances": return <Finances store={store} />;
      case "reports": return <Reports store={store} />;
      case "settings": return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Settings size={40} style={{ color: "var(--muted-foreground)", opacity: 0.3 }} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "var(--foreground)" }}>Configurações</div>
          <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Em desenvolvimento</p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "var(--background)" }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col h-full" style={{ background: "var(--sidebar)", color: "var(--sidebar-foreground)" }}>
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--sidebar-primary)" }}>
            <Trees size={16} style={{ color: "var(--sidebar-primary-foreground)" }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", color: "var(--sidebar-foreground)", fontSize: "0.9rem", lineHeight: 1.2, fontWeight: 600 }}>
              Tribo Hospedagem
            </div>
            <div style={{ fontSize: "0.58rem", color: "var(--sidebar-primary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Painel Admin
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = page === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                style={{
                  background: isActive ? "var(--sidebar-accent)" : "transparent",
                  color: isActive ? "var(--sidebar-accent-foreground)" : "var(--sidebar-foreground)",
                  opacity: isActive ? 1 : 0.72,
                }}
              >
                <Icon size={16} />
                <span style={{ fontSize: "0.875rem" }}>{label}</span>
                {isActive && <ChevronRight size={13} className="ml-auto" style={{ color: "var(--sidebar-primary)" }} />}
              </button>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="px-3 pb-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(232,226,214,0.55)", fontSize: "0.82rem" }}
          >
            <Globe size={14} />
            <span>Voltar ao Site</span>
          </button>
        </div>

        {/* Bottom user */}
        <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "var(--sidebar-accent)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs" style={{ background: "var(--sidebar-primary)", color: "var(--sidebar-primary-foreground)" }}>
              A
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: "0.8rem", color: "var(--sidebar-accent-foreground)", fontWeight: 500 }}>Administrador</div>
              <div style={{ fontSize: "0.68rem", color: "var(--sidebar-primary)" }}>Acesso Total</div>
            </div>
            <button onClick={onLogout} title="Sair" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(232,226,214,0.4)", lineHeight: 0 }}>
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", color: "var(--foreground)", fontWeight: 600 }}>
              {pageTitles[page]}
            </h1>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: 1 }}>
              Tribo Hospedagem · Painel Administrativo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full flex items-center gap-1.5" style={{ background: "#2d501612", border: "1px solid #2d501625" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#2d5016" }} />
              <span style={{ fontSize: "0.72rem", color: "#2d5016", fontWeight: 500 }}>Sistema Online</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: "var(--muted)", fontSize: "0.8rem", color: "var(--muted-foreground)" }}
            >
              <Globe size={13} /> Voltar ao Site
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-7">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
