import { useState } from "react";
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight, Info } from "lucide-react";
import type { Store, Service } from "../../store/useStore";

const CATEGORIES = ["Passeios", "Decoração", "Bem-estar", "Alimentação", "Transporte", "Lavanderia", "Outros"];

function ServiceModal({ service, onSave, onClose }: { service?: Service; onSave: (d: Omit<Service, "id">) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: service?.name || "",
    value: service?.value || 0,
    available: service?.available ?? true,
    description: service?.description || "",
    category: service?.category || CATEGORIES[0],
    hasQuantity: service?.hasQuantity ?? false,
    quantityLabel: service?.quantityLabel || "pessoa",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(10,18,7,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "#fdfaf5" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>{service ? "Editar Serviço" : "Novo Serviço"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ede8df" }}><X size={15} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Nome do Serviço *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Valor (R$)</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Categoria</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Descrição</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl outline-none resize-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </div>

          {/* Quantity toggle */}
          <div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f0ead8" }}>
              <div>
                <div style={{ fontSize: "0.85rem", color: "#1c1a17", fontWeight: 500 }}>Permite quantidade</div>
                <div style={{ fontSize: "0.75rem", color: "#7a7060" }}>Ex: cobrado por pessoa, por item</div>
              </div>
              <button onClick={() => setForm(f => ({ ...f, hasQuantity: !f.hasQuantity }))} style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 0 }}>
                {form.hasQuantity ? <ToggleRight size={28} style={{ color: "#2d5016" }} /> : <ToggleLeft size={28} style={{ color: "#7a7060" }} />}
              </button>
            </div>
            {form.hasQuantity && (
              <div className="mt-2">
                <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Unidade (ex: pessoa, item, hora)</label>
                <input value={form.quantityLabel} onChange={e => setForm(f => ({ ...f, quantityLabel: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f0ead8" }}>
            <span style={{ fontSize: "0.85rem", color: "#1c1a17", fontWeight: 500 }}>Disponível para reserva</span>
            <button onClick={() => setForm(f => ({ ...f, available: !f.available }))} style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 0 }}>
              {form.available ? <ToggleRight size={28} style={{ color: "#2d5016" }} /> : <ToggleLeft size={28} style={{ color: "#7a7060" }} />}
            </button>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl" style={{ background: "#ede8df", fontSize: "0.875rem" }}>Cancelar</button>
            <button onClick={() => { onSave({ name: form.name, value: form.value, available: form.available, description: form.description, category: form.category, hasQuantity: form.hasQuantity, quantityLabel: form.quantityLabel }); onClose(); }}
              className="flex-1 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem" }}>
              {service ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServicesPage({ store }: { store: Store }) {
  const { services, addService, updateService, deleteService } = store;
  const [modal, setModal] = useState<Service | null | "new">(null);
  const [catFilter, setCatFilter] = useState("Todos");

  const filtered = services.filter(s => catFilter === "Todos" || s.category === catFilter);
  const allCategories = ["Todos", ...Array.from(new Set(services.map(s => s.category)))];

  return (
    <div className="flex flex-col gap-5">
      {modal !== null && (
        <ServiceModal
          service={modal === "new" ? undefined : modal}
          onSave={data => modal === "new" ? addService(data) : modal && updateService(modal.id, data)}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1a2e14", fontWeight: 600 }}>Serviços</h1>
          <p style={{ fontSize: "0.82rem", color: "#7a7060" }}>{services.filter(s => s.available).length} disponíveis · {services.length} total</p>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem", fontWeight: 500 }}>
          <Plus size={16} /> Novo Serviço
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "#2d501610", border: "1px solid #2d501625" }}>
        <Info size={16} style={{ color: "#2d5016", flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: "0.82rem", color: "#2d5016", lineHeight: 1.55 }}>
          Os serviços disponíveis aqui aparecem como <strong>opcionais selecionáveis</strong> no momento da reserva. Serviços marcados como indisponíveis não aparecem na lista de opcionais.
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {allCategories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} className="px-3 py-1.5 rounded-full" style={{ background: catFilter === c ? "#1a2e14" : "#fdfaf5", color: catFilter === c ? "#f7f4ef" : "#7a7060", border: "1px solid rgba(44,35,18,0.1)", fontSize: "0.8rem" }}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {filtered.map(service => (
          <div key={service.id} className="rounded-2xl p-5" style={{ background: "#fdfaf5", border: `1.5px solid ${service.available ? "rgba(44,35,18,0.08)" : "rgba(185,50,50,0.12)"}`, opacity: service.available ? 1 : 0.7 }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 mr-3">
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: "#1a2e14", fontWeight: 600 }}>{service.name}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.67rem", background: "#1a2e1410", color: "#7a7060", fontWeight: 500 }}>{service.category}</span>
                  {service.hasQuantity && (
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.67rem", background: "#c4882a15", color: "#c4882a", fontWeight: 600 }}>por {service.quantityLabel}</span>
                  )}
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.67rem", background: service.available ? "#2d501612" : "#b9323212", color: service.available ? "#2d5016" : "#b93232", fontWeight: 600 }}>
                    {service.available ? "Disponível" : "Indisponível"}
                  </span>
                </div>
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1rem", color: "#2d5016", fontWeight: 700, flexShrink: 0 }}>
                R$ {service.value}
              </div>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#7a7060", lineHeight: 1.55, marginBottom: 14 }}>{service.description}</p>
            <div className="flex gap-2">
              <button onClick={() => updateService(service.id, { available: !service.available })} className="flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5" style={{ background: service.available ? "#b9323212" : "#2d501612", color: service.available ? "#b93232" : "#2d5016", fontSize: "0.78rem" }}>
                {service.available ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                {service.available ? "Desativar" : "Ativar"}
              </button>
              <button onClick={() => setModal(service)} className="py-1.5 px-3 rounded-lg" style={{ background: "#2d501612", color: "#2d5016" }}><Edit2 size={13} /></button>
              <button onClick={() => deleteService(service.id, service.name)} className="py-1.5 px-3 rounded-lg" style={{ background: "#b9323212", color: "#b93232" }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl p-8 text-center col-span-full" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
            <div style={{ fontSize: "0.875rem", color: "#7a7060" }}>Nenhum serviço encontrado nesta categoria</div>
          </div>
        )}
      </div>
    </div>
  );
}
