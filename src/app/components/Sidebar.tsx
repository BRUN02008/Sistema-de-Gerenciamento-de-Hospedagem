import { LayoutDashboard, CalendarDays, BedDouble, DollarSign, BarChart3, Settings, LogOut, Trees } from "lucide-react";

type Page = "dashboard" | "reservations" | "rooms" | "finances" | "reports" | "settings";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
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

export function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-full" style={{ background: "var(--sidebar)", color: "var(--sidebar-foreground)" }}>
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--sidebar-primary)" }}>
          <Trees size={16} style={{ color: "var(--sidebar-primary-foreground)" }} />
        </div>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", color: "var(--sidebar-foreground)", fontSize: "0.95rem", lineHeight: 1.2 }}>
            Tribo Hospedagem
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--sidebar-primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Gestão
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
              style={{
                background: isActive ? "var(--sidebar-accent)" : "transparent",
                color: isActive ? "var(--sidebar-accent-foreground)" : "var(--sidebar-foreground)",
                opacity: isActive ? 1 : 0.75,
              }}
            >
              <Icon size={17} />
              <span style={{ fontSize: "0.875rem" }}>{label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-1 rounded-full" style={{ background: "var(--sidebar-primary)" }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "var(--sidebar-accent)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs" style={{ background: "var(--sidebar-primary)", color: "var(--sidebar-primary-foreground)" }}>
            A
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: "0.8rem", color: "var(--sidebar-accent-foreground)" }}>Admin</div>
            <div style={{ fontSize: "0.7rem", color: "var(--sidebar-primary)" }}>Gerente</div>
          </div>
          <button onClick={onLogout} title="Sair"><LogOut size={14} style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }} /></button>
        </div>
      </div>
    </aside>
  );
}
