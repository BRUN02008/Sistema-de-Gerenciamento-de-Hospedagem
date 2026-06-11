import { useState, useEffect } from "react";
import { Trees, Shield, X, Eye, EyeOff, AlertCircle } from "lucide-react";

interface AdminLoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function AdminLoginModal({ onSuccess, onClose }: AdminLoginModalProps) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      setLoading(false);
      if (password === "tribo123") {
        onSuccess();
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setPassword("");
        if (next >= 3) {
          setError("Muitas tentativas. Verifique sua senha e tente novamente.");
        } else {
          setError("Senha incorreta. Tente novamente.");
        }
      }
    }, 600);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(10, 18, 7, 0.75)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
        style={{ background: "#fdfaf5", boxShadow: "0 25px 80px rgba(0,0,0,0.4)" }}
      >
        {/* Header strip */}
        <div className="px-6 pt-6 pb-5" style={{ background: "#1a2e14" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#c4882a" }}>
                <Trees size={15} style={{ color: "#1a2e14" }} />
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", color: "#f7f4ef", fontSize: "0.95rem" }}>
                Tribo Hospedagem
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(247,244,239,0.5)" }}
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(196,136,42,0.2)" }}>
              <Shield size={16} style={{ color: "#c4882a" }} />
            </div>
            <div>
              <div style={{ color: "#f7f4ef", fontSize: "0.95rem", fontWeight: 600 }}>Acesso Restrito</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(247,244,239,0.5)" }}>Somente para administradores</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Senha de Acesso
              </label>
              <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1.5px solid ${error ? "#b93232" : "rgba(44,35,18,0.15)"}`, background: "#f0ead8" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  autoFocus
                  className="flex-1 px-4 py-3 outline-none bg-transparent"
                  style={{ fontSize: "1rem", color: "#1a2e14", letterSpacing: showPw ? "normal" : "0.1em" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="px-3"
                  style={{ color: "#7a7060", background: "none", border: "none", cursor: "pointer" }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 mt-2.5">
                  <AlertCircle size={13} style={{ color: "#b93232", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.78rem", color: "#b93232" }}>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-xl transition-all"
              style={{
                background: loading || !password ? "rgba(45,80,22,0.4)" : "#2d5016",
                color: loading || !password ? "rgba(247,244,239,0.5)" : "#f7f4ef",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: loading || !password ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Verificando..." : "Entrar no Sistema"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              style={{ fontSize: "0.8rem", color: "#7a7060", background: "none", border: "none", cursor: "pointer" }}
            >
              ← Voltar ao site
            </button>
          </div>

          <div className="mt-5 pt-4 border-t" style={{ borderColor: "rgba(44,35,18,0.08)" }}>
            <div style={{ fontSize: "0.72rem", color: "rgba(120,112,96,0.6)", textAlign: "center" }}>
              Demo: use <span style={{ fontFamily: "'DM Mono', monospace", color: "#7a7060" }}>tribo123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
