import { useState } from "react";
import { Plus, Edit2, Trash2, X, Tag, Percent, DollarSign, ToggleRight, ToggleLeft } from "lucide-react";
import type { Store, Promotion, PromotionType } from "../../store/useStore";

function PromotionModal({ promotion, onSave, onClose }: { promotion?: Promotion; onSave: (d: Omit<Promotion, "id" | "createdAt">) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: promotion?.name || "", type: promotion?.type || "percentual" as PromotionType,
    discount: promotion?.discount || 0, validUntil: promotion?.validUntil || "",
    rules: promotion?.rules || "", active: promotion?.active ?? true,
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(10,18,7,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "#fdfaf5" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>{promotion ? "Editar Promoção" : "Nova Promoção"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ede8df" }}><X size={15} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Nome da Promoção *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 8 }}>Tipo de Desconto</label>
            <div className="flex gap-2">
              {([["percentual", "Percentual (%)", Percent], ["valor_fixo", "Valor Fixo (R$)", DollarSign]] as const).map(([val, label, Icon]) => (
                <button key={val} onClick={() => setForm(f => ({ ...f, type: val as PromotionType }))} type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl" style={{ background: form.type === val ? "#1a2e14" : "#ede8df", color: form.type === val ? "#f7f4ef" : "#7a7060", fontSize: "0.85rem" }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>
                {form.type === "percentual" ? "Percentual (%)" : "Valor Fixo (R$)"}
              </label>
              <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Data de Validade</label>
              <input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Regras e Condições</label>
            <textarea value={form.rules} onChange={e => setForm(f => ({ ...f, rules: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-xl outline-none resize-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f0ead8" }}>
            <span style={{ fontSize: "0.85rem", color: "#1c1a17", fontWeight: 500 }}>Promoção ativa</span>
            <button onClick={() => setForm(f => ({ ...f, active: !f.active }))} style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 0 }}>
              {form.active ? <ToggleRight size={28} style={{ color: "#2d5016" }} /> : <ToggleLeft size={28} style={{ color: "#7a7060" }} />}
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl" style={{ background: "#ede8df", fontSize: "0.875rem" }}>Cancelar</button>
            <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem" }}>
              {promotion ? "Salvar" : "Criar Promoção"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function fmtDate(d: string) { if (!d) return "—"; return `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`; }

export function PromotionsPage({ store }: { store: Store }) {
  const { promotions, addPromotion, updatePromotion, deletePromotion } = store;
  const [modal, setModal] = useState<Promotion | null | "new">(null);

  const active = promotions.filter(p => p.active);
  const inactive = promotions.filter(p => !p.active);

  function PromotionCard({ p }: { p: Promotion }) {
    const isExpired = p.validUntil && p.validUntil < "2026-06-04";
    return (
      <div className="rounded-2xl p-5" style={{ background: "#fdfaf5", border: `1.5px solid ${p.active && !isExpired ? "rgba(196,136,42,0.2)" : "rgba(44,35,18,0.08)"}` }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: p.active && !isExpired ? "#c4882a18" : "#ede8df" }}>
              <Tag size={18} style={{ color: p.active && !isExpired ? "#c4882a" : "#7a7060" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: "#1a2e14", fontWeight: 600 }}>{p.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.67rem", background: p.active && !isExpired ? "#c4882a15" : "#ede8df", color: p.active && !isExpired ? "#c4882a" : "#7a7060", fontWeight: 600, textTransform: "uppercase" }}>
                  {isExpired ? "Expirada" : p.active ? "Ativa" : "Inativa"}
                </span>
                <span style={{ fontSize: "0.72rem", color: "#7a7060" }}>até {fmtDate(p.validUntil)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#2d5016", fontWeight: 700, lineHeight: 1 }}>
              {p.type === "percentual" ? `${p.discount}%` : `R$ ${p.discount}`}
            </div>
            <div style={{ fontSize: "0.68rem", color: "#7a7060" }}>{p.type === "percentual" ? "de desconto" : "desconto fixo"}</div>
          </div>
        </div>
        {p.rules && (
          <p style={{ fontSize: "0.8rem", color: "#7a7060", lineHeight: 1.55, borderTop: "1px solid rgba(44,35,18,0.06)", paddingTop: 10, marginBottom: 12 }}>{p.rules}</p>
        )}
        <div className="flex gap-2">
          <button onClick={() => updatePromotion(p.id, { active: !p.active })} className="flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5" style={{ background: p.active ? "#b9323212" : "#2d501612", color: p.active ? "#b93232" : "#2d5016", fontSize: "0.78rem" }}>
            {p.active ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
            {p.active ? "Desativar" : "Ativar"}
          </button>
          <button onClick={() => setModal(p)} className="py-1.5 px-3 rounded-lg" style={{ background: "#2d501612", color: "#2d5016" }}><Edit2 size={13} /></button>
          <button onClick={() => deletePromotion(p.id, p.name)} className="py-1.5 px-3 rounded-lg" style={{ background: "#b9323212", color: "#b93232" }}><Trash2 size={13} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {modal !== null && (
        <PromotionModal
          promotion={modal === "new" ? undefined : modal}
          onSave={data => modal === "new" ? addPromotion(data) : modal && updatePromotion(modal.id, data)}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1a2e14", fontWeight: 600 }}>Promoções e Descontos</h1>
          <p style={{ fontSize: "0.82rem", color: "#7a7060" }}>{active.length} ativas · {promotions.length} total</p>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem", fontWeight: 500 }}>
          <Plus size={16} /> Nova Promoção
        </button>
      </div>

      {active.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ background: "#c4882a" }} />
            <span style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Promoções Ativas</span>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {active.map(p => <PromotionCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {inactive.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 mt-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "#7a7060" }} />
            <span style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Inativas / Encerradas</span>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {inactive.map(p => <PromotionCard key={p.id} p={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
