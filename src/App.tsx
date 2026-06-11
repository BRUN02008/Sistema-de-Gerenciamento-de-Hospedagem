import { useState } from "react";
import { useStore } from "./app/store/useStore";
import { LandingPage } from "./app/components/LandingPage";
import { AdminLoginModal } from "./app/components/AdminLoginModal";
import { UserBooking } from "./app/components/UserBooking";
import { AdminShell } from "./app/components/AdminShell";

type View = "landing" | "booking" | "admin";

export default function App() {
  const store = useStore();
  const [view, setView] = useState<View>("landing");
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // ── Admin login modal (shown over any view) ──────────────────────────────
  const adminModal = showAdminLogin && view !== "admin" && (
    <AdminLoginModal
      onSuccess={() => { setShowAdminLogin(false); setView("admin"); }}
      onClose={() => setShowAdminLogin(false)}
    />
  );

  if (view === "landing") {
    return (
      <>
        <LandingPage
          store={store}
          onStartBooking={() => setView("booking")}
          onAdminAccess={() => setShowAdminLogin(true)}
        />
        {adminModal}
      </>
    );
  }

  if (view === "booking") {
    return (
      <>
        <UserBooking
          store={store}
          onLogout={() => setView("landing")}
        />
        {adminModal}
      </>
    );
  }

  // Admin dashboard
  return (
    <AdminShell
      store={store}
      onLogout={() => setView("landing")}
    />
  );
}
