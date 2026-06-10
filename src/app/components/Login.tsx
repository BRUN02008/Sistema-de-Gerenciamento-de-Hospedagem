import { useState } from "react";
import { Shield, User, Trees } from "lucide-react";

interface LoginProps {
  onLogin: (role: "admin" | "user") => void;
}

export function Login({ onLogin }: LoginProps) {
  const [adminPw, setAdminPw] = useState("");
  const [error, setError] = useState("");
  const [showAdminForm, setShowAdminForm] = useState(false);

  const handleAdmin = () => {
    if (adminPw === "tribo123") {
      onLogin("admin");
    } else {
      setError("Senha incorreta");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--sidebar)" }}>
            <Trees size={28} style={{ color: "#c4882a" }} />
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "var(--foreground)" }}>
            Tribo Hospedagem
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginTop: 4 }}>
            Bem-vindo de volta
          </p>
        </div>

        {!showAdminForm ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onLogin("user")}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-colors text-left"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#2d501615" }}>
                <User size={20} style={{ color: "#2d5016" }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.95rem" }}>Hóspede</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Faça sua reserva online</div>
              </div>
            </button>

            <button
              onClick={() => setShowAdminForm(true)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-colors text-left"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#c4882a15" }}>
                <Shield size={20} style={{ color: "#c4882a" }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.95rem" }}>Administrador</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Acesso completo ao sistema</div>
              </div>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)", marginBottom: 16 }}>Acesso Admin</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 500, display: "block", marginBottom: 6 }}>Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPw}
                  onChange={e => { setAdminPw(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleAdmin()}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: "var(--input-background)", border: "1px solid var(--border)", fontSize: "0.9rem", color: "var(--foreground)" }}
                />
                {error && <div style={{ fontSize: "0.78rem", color: "#b93232", marginTop: 4 }}>{error}</div>}
              </div>
              <button onClick={handleAdmin} className="w-full py-2.5 rounded-xl" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.9rem" }}>
                Entrar
              </button>
              <button onClick={() => { setShowAdminForm(false); setAdminPw(""); setError(""); }} style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}>
                ← Voltar
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: 24 }}>
          Senha padrão admin: <span style={{ fontFamily: "'DM Mono', monospace" }}>tribo123</span>
        </p>
      </div>
    </div>
  );
}
