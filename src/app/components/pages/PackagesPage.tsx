import { useState } from "react";
import { Plus, Edit2, Trash2, X, Check, ToggleLeft, ToggleRight, Package } from "lucide-react";
import type { Store, Package as PkgType } from "../../store/useStore";

function PackageModal({ pkg, onSave, onClose }: {
  pkg?: PkgType;
  onSave: (d: Omit<PkgType, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: pkg?.name || "",
    description: pkg?.description || "",
    includes: pkg?.includes.join("\n") || "",
    value: pkg?.value || 0,
    active: pkg?.active ?? true,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(10,18,7,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "#fdfaf5" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>{pkg ? "Editar Pacote" : "Novo Pacote"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ede8df" }}><X size={15} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Nome do Pacote *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Descrição curta</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>O que inclui (um item por linha)</label>
            <textarea value={form.includes} onChange={e => setForm(f => ({ ...f, includes: e.target.value }))} rows={4} className="w-full px-3 py-2.5 rounded-xl outline-none resize-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Valor por casal (R$)</label>
            <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f0ead8" }}>
            <span style={{ fontSize: "0.85rem", color: "#1c1a17", fontWeight: 500 }}>Pacote ativo</span>
            <button onClick={() => setForm(f => ({ ...f, active: !f.active }))} style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 0 }}>
              {form.active ? <ToggleRight size={28} style={{ color: "#2d5016" }} /> : <ToggleLeft size={28} style={{ color: "#7a7060" }} />}
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl" style={{ background: "#ede8df", fontSize: "0.875rem" }}>Cancelar</button>
            <button
              onClick={() => {
                onSave({
                  name: form.name.trim(),
                  description: form.description.trim(),
                  includes: form.includes.split("\n").map(l => l.trim()).filter(Boolean),
                  value: form.value,
                  active: form.active,
                });
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl"
              style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem" }}
            >
              {pkg ? "Salvar" : "Criar Pacote"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PackagesPage({ store }: { store: Store }) {
  const { packages, addPackage, updatePackage, deletePackage } = store;
  const [modal, setModal] = useState<PkgType | null | "new">(null);

  const active = packages.filter(p => p.active);
  const inactive = packages.filter(p => !p.active);

  function PkgCard({ p }: { p: PkgType }) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fdfaf5", border: `2px solid ${p.active ? "rgba(44,35,18,0.1)" : "rgba(44,35,18,0.05)"}`, opacity: p.active ? 1 : 0.6 }}>
        {/* Header strip */}
        <div className="px-5 py-4" style={{ background: p.active ? "#1a2e14" : "#ede8df" }}>
          <div className="flex items-start justify-between">
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", color: p.active ? "#f7f4ef" : "#7a7060", fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: "0.8rem", color: p.active ? "rgba(247,244,239,0.6)" : "#7a7060", marginTop: 2 }}>{p.description}</div>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: p.active ? "#d4a84b" : "#7a7060", fontWeight: 700, lineHeight: 1 }}>
                R$ {p.value}
              </div>
              <div style={{ fontSize: "0.68rem", color: p.active ? "rgba(247,244,239,0.5)" : "#b8b0a0" }}>por casal/noite</div>
            </div>
          </div>
        </div>

        {/* Includes */}
        <div className="px-5 py-4">
          <div style={{ fontSize: "0.72rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
            Incluso no pacote
          </div>
          <div className="flex flex-col gap-2">
            {p.includes.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#2d501618" }}>
                  <Check size={10} style={{ color: "#2d5016" }} />
                </div>
                <span style={{ fontSize: "0.85rem", color: "#1c1a17" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-4 flex gap-2">
          <button
            onClick={() => updatePackage(p.id, { active: !p.active })}
            className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5"
            style={{ background: p.active ? "#b9323212" : "#2d501612", color: p.active ? "#b93232" : "#2d5016", fontSize: "0.8rem" }}
          >
            {p.active ? <><ToggleLeft size={14} /> Desativar</> : <><ToggleRight size={14} /> Ativar</>}
          </button>
          <button onClick={() => setModal(p)} className="py-2 px-4 rounded-xl" style={{ background: "#2d501612", color: "#2d5016" }}>
            <Edit2 size={14} />
          </button>
          <button onClick={() => deletePackage(p.id, p.name)} className="py-2 px-4 rounded-xl" style={{ background: "#b9323212", color: "#b93232" }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {modal !== null && (
        <PackageModal
          pkg={modal === "new" ? undefined : modal}
          onSave={data => modal === "new" ? addPackage(data) : modal && updatePackage(modal.id, data)}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1a2e14", fontWeight: 600 }}>Pacotes</h1>
          <p style={{ fontSize: "0.82rem", color: "#7a7060" }}>{active.length} ativo{active.length !== 1 ? "s" : ""} · {packages.length} total</p>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem", fontWeight: 500 }}>
          <Plus size={16} /> Novo Pacote
        </button>
      </div>

      {/* Info banner */}
      <div className="rounded-2xl px-5 py-4 flex items-start gap-3" style={{ background: "#2d501610", border: "1px solid #2d501625" }}>
        <Package size={18} style={{ color: "#2d5016", marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: "0.875rem", color: "#2d5016", fontWeight: 500 }}>Como funcionam os pacotes</div>
          <div style={{ fontSize: "0.8rem", color: "#2d501680", lineHeight: 1.55, marginTop: 2 }}>
            Os pacotes definem o valor base de cada reserva. Ao criar uma reserva, o hóspede deve escolher obrigatoriamente um pacote. Serviços opcionais são somados ao valor do pacote, com possibilidade de desconto sobre o total.
          </div>
        </div>
      </div>

      {active.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ background: "#2d5016" }} />
            <span style={{ fontSize: "0.75rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Pacotes Ativos</span>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {active.map(p => <PkgCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {inactive.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ background: "#b8b0a0" }} />
            <span style={{ fontSize: "0.75rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Inativos</span>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {inactive.map(p => <PkgCard key={p.id} p={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
