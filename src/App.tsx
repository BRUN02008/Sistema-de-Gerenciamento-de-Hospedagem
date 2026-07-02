import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useStore } from "./app/store/useStore";
import { AdminShell } from "./app/components/AdminShell";
import triboLogo from "./imports/simbolo_do_tribo.jpeg";

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      if (username === "adm123" && password === "tribo123") {
        onLogin();
      } else {
        setError("Usuário ou senha incorretos.");
        setPassword("");
      }
    }, 600);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#f7f4ef", fontFamily: "'Inter', sans-serif" }}>
      {/* Left panel - decorative */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 relative overflow-hidden" style={{ background: "#1a2e14" }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1700753146836-7091d0b28635?w=900&h=1200&fit=crop&auto=format&q=80"
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        <div className="relative text-center px-12">
          <img src={triboLogo} alt="Tribo Hospedagem" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", color: "#f7f4ef", fontWeight: 600, lineHeight: 1.2, marginBottom: 14 }}>
            Tribo<br />Hospedagem
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(247,244,239,0.6)", lineHeight: 1.7, maxWidth: 340 }}>
            Sistema de gestão interna para controle completo de reservas, finanças, equipe e acomodações.
          </p>
          <div className="flex flex-col gap-3 mt-10">
            {["Gestão de Reservas", "Controle Financeiro", "Gerenciamento de Equipe", "Relatórios Completos"].map(f => (
              <div key={f} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#c4882a" }} />
                <span style={{ fontSize: "0.875rem", color: "rgba(247,244,239,0.75)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src={triboLogo} alt="Tribo Hospedagem" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3" />
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#1a2e14", fontWeight: 600 }}>Tribo Hospedagem</div>
          </div>

          <div className="mb-8">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "#1a2e14", fontWeight: 600, marginBottom: 6 }}>
              Acesso ao Sistema
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#7a7060" }}>
              Painel administrativo restrito. Faça login para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label style={{ fontSize: "0.8rem", color: "#7a7060", fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                placeholder="adm123"
                autoFocus
                className="w-full px-5 py-3.5 rounded-2xl outline-none"
                style={{ border: `2px solid ${error ? "#b93232" : "rgba(44,35,18,0.12)"}`, background: "#fdfaf5", fontSize: "1rem", color: "#1a2e14" }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: "0.8rem", color: "#7a7060", fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Senha
              </label>
              <div className="flex items-center rounded-2xl overflow-hidden" style={{ border: `2px solid ${error ? "#b93232" : "rgba(44,35,18,0.12)"}`, background: "#fdfaf5", boxShadow: error ? "0 0 0 3px rgba(185,50,50,0.08)" : "none" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="flex-1 px-5 py-3.5 outline-none bg-transparent"
                  style={{ fontSize: "1rem", color: "#1a2e14", letterSpacing: showPw ? "normal" : "0.15em" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="px-4" style={{ color: "#7a7060", background: "none", border: "none", cursor: "pointer", lineHeight: 0 }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-2.5">
                  <AlertCircle size={14} style={{ color: "#b93232", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.8rem", color: "#b93232" }}>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3.5 rounded-2xl transition-all mt-2"
              style={{
                background: loading || !username || !password ? "rgba(26,46,20,0.35)" : "#1a2e14",
                color: loading || !username || !password ? "rgba(247,244,239,0.5)" : "#f7f4ef",
                fontSize: "0.95rem", fontWeight: 600,
                cursor: loading || !username || !password ? "not-allowed" : "pointer",
                letterSpacing: "0.02em",
              }}
            >
              {loading ? "Verificando…" : "Entrar no Sistema"}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-2xl" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.08)" }}>
            <div style={{ fontSize: "0.75rem", color: "#7a7060", marginBottom: 6, fontWeight: 500 }}>Credenciais de acesso:</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", color: "#1a2e14" }}>
              Usuário: <strong>adm123</strong>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", color: "#1a2e14", marginTop: 2 }}>
              Senha: <strong>tribo123</strong>
            </div>
          </div>

          <p style={{ fontSize: "0.72rem", color: "rgba(120,112,96,0.5)", textAlign: "center", marginTop: 24 }}>
            © 2026 Tribo Hospedagem · Sistema Interno
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const store = useStore();
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  return <AdminShell store={store} onLogout={() => setLoggedIn(false)} />;
}
