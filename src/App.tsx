import { useState } from "react";
import { useStore } from "./app/store/useStore";
import { Login } from "./app/components/Login";
import { Sidebar } from "./app/components/Sidebar";
import { Dashboard } from "./app/components/Dashboard";
import { Reservations } from "./app/components/Reservations";
import { Rooms } from "./app/components/Rooms";
import { Finances } from "./app/components/Finances";
import { Reports } from "./app/components/Reports";
import { UserBooking } from "./app/components/UserBooking";

type Page = "dashboard" | "reservations" | "rooms" | "finances" | "reports" | "settings";
type Role = "admin" | "user" | null;

export default function App() {
  const store = useStore();
  const [role, setRole] = useState<Role>(null);
  const [page, setPage] = useState<Page>("dashboard");

  if (role === null) {
    return <Login onLogin={setRole} />;
  }

  if (role === "user") {
    return <UserBooking store={store} onLogout={() => setRole(null)} />;
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard store={store} />;
      case "reservations": return <Reservations store={store} />;
      case "rooms": return <Rooms store={store} />;
      case "finances": return <Finances store={store} />;
      case "reports": return <Reports store={store} />;
      case "settings": return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.5rem", color: "var(--foreground)", marginBottom: 8 }}>Configurações</div>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Em desenvolvimento</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--background)" }}>
      <Sidebar activePage={page} onNavigate={p => { setPage(p); }} onLogout={() => setRole(null)} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-7">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
