import { useState } from "react";
import { Plus, Edit2, Trash2, X, Users, Wifi, Wind, Coffee, Waves, Star, Check, BedDouble } from "lucide-react";
import type { Store, Accommodation, AccommodationStatus } from "../../store/useStore";

const STATUS_CFG: Record<AccommodationStatus, { label: string; bg: string; text: string }> = {
  "disponível": { label: "Livre", bg: "#2d501615", text: "#2d5016" },
  "ocupado": { label: "Ocupado", bg: "#1e5f7415", text: "#1e5f74" },
  "reservado": { label: "Reservado", bg: "#c4882a15", text: "#c4882a" },
  "manutenção": { label: "Manutenção", bg: "#b9323215", text: "#b93232" },
};

const AMENITY_ICONS: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: "Wi-Fi" },
  "ar-cond": { icon: Wind, label: "Ar-condicionado" },
  café: { icon: Coffee, label: "Café da manhã" },
  banheira: { icon: Waves, label: "Banheira" },
  hidro: { icon: Waves, label: "Hidromassagem" },
  frigobar: { icon: Star, label: "Frigobar Premium" },
  lareira: { icon: Star, label: "Lareira" },
  varanda: { icon: Star, label: "Varanda privativa" },
};

type ModalMode = "add" | "edit" | "view";

const emptyForm = { name: "", type: "Cabana" as Accommodation["type"], capacity: 2, price: 0, amenities: [] as string[], image: "", description: "", status: "disponível" as AccommodationStatus };

function AccommodationModal({ mode, accommodation, onSave, onClose }: {
  mode: ModalMode; accommodation?: Accommodation; onSave: (data: Omit<Accommodation, "id">) => void; onClose: () => void;
}) {
  const [form, setForm] = useState(accommodation ? { ...accommodation } : emptyForm);

  if (mode === "view" && accommodation) {
    const sc = STATUS_CFG[accommodation.status];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(10,18,7,0.6)", backdropFilter: "blur(6px)" }}>
        <div className="rounded-2xl w-full max-w-lg overflow-hidden" style={{ background: "#fdfaf5" }}>
          <div className="h-48 overflow-hidden relative">
            <img src={accommodation.image} alt={accommodation.name} className="w-full h-full object-cover" />
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
              <X size={14} style={{ color: "#fff" }} />
            </button>
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full" style={{ fontSize: "0.7rem", background: sc.bg, color: sc.text, fontWeight: 700, backdropFilter: "blur(4px)" }}>
              {sc.label}
            </span>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#1a2e14", fontWeight: 600 }}>{accommodation.name}</h2>
                <div style={{ fontSize: "0.8rem", color: "#7a7060" }}>{accommodation.type}</div>
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.3rem", color: "#2d5016", fontWeight: 700 }}>
                R$ {accommodation.price}<span style={{ fontSize: "0.7rem", color: "#7a7060" }}>/noite</span>
              </div>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#7a7060", lineHeight: 1.65, marginBottom: 16 }}>{accommodation.description}</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5" style={{ fontSize: "0.82rem", color: "#1c1a17" }}>
                <Users size={13} style={{ color: "#7a7060" }} /> Até {accommodation.capacity} hóspedes
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {accommodation.amenities.map(a => {
                const cfg = AMENITY_ICONS[a];
                return (
                  <span key={a} className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ fontSize: "0.72rem", background: "#2d501612", color: "#2d5016", fontWeight: 500 }}>
                    {cfg ? <cfg.icon size={11} /> : null} {cfg?.label || a}
                  </span>
                );
              })}
            </div>
            <button onClick={onClose} className="w-full mt-4 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem" }}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handleAmenity(a: string) {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(10,18,7,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="rounded-2xl w-full max-w-lg p-6 overflow-y-auto" style={{ background: "#fdfaf5", maxHeight: "90vh" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>
            {mode === "add" ? "Nova Acomodação" : "Editar Acomodação"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ede8df" }}><X size={15} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div style={{ gridColumn: "1/-1" }}>
            <label className="block mb-1.5" style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500 }}>Nome *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem", color: "#1c1a17" }} />
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500 }}>Tipo</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Accommodation["type"] }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem", color: "#1c1a17" }}>
              <option>Cabana</option><option>Chalé</option><option>Suíte</option>
            </select>
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500 }}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as AccommodationStatus }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem", color: "#1c1a17" }}>
              <option value="disponível">Livre</option><option value="ocupado">Ocupado</option><option value="reservado">Reservado</option><option value="manutenção">Manutenção</option>
            </select>
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500 }}>Capacidade</label>
            <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500 }}>Diária (R$)</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label className="block mb-1.5" style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500 }}>URL da Foto</label>
            <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label className="block mb-1.5" style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500 }}>Descrição</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl outline-none resize-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label className="block mb-2" style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500 }}>Comodidades</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(AMENITY_ICONS).map(([key, { label }]) => (
                <button key={key} onClick={() => handleAmenity(key)} type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors" style={{
                  background: form.amenities.includes(key) ? "#1a2e14" : "#ede8df",
                  color: form.amenities.includes(key) ? "#f0ead8" : "#7a7060",
                  fontSize: "0.75rem", fontWeight: 500
                }}>
                  {form.amenities.includes(key) && <Check size={10} />} {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl" style={{ background: "#ede8df", fontSize: "0.875rem", color: "#1c1a17" }}>Cancelar</button>
          <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem" }}>
            {mode === "add" ? "Adicionar" : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AccommodationsPage({ store }: { store: Store }) {
  const { accommodations, addAccommodation, updateAccommodation, deleteAccommodation } = store;
  const [modal, setModal] = useState<{ mode: ModalMode; acc?: Accommodation } | null>(null);
  const [filterStatus, setFilterStatus] = useState<AccommodationStatus | "todos">("todos");

  const filtered = accommodations.filter(a => filterStatus === "todos" || a.status === filterStatus);

  const counts = {
    disponível: accommodations.filter(a => a.status === "disponível").length,
    ocupado: accommodations.filter(a => a.status === "ocupado").length,
    reservado: accommodations.filter(a => a.status === "reservado").length,
    manutenção: accommodations.filter(a => a.status === "manutenção").length,
  };

  return (
    <div className="flex flex-col gap-5">
      {modal && (
        <AccommodationModal
          mode={modal.mode}
          accommodation={modal.acc}
          onSave={data => modal.mode === "add" ? addAccommodation(data) : modal.acc && updateAccommodation(modal.acc.id, data)}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1a2e14", fontWeight: 600 }}>Acomodações</h1>
          <p style={{ fontSize: "0.82rem", color: "#7a7060" }}>{accommodations.length} acomodações cadastradas</p>
        </div>
        <button onClick={() => setModal({ mode: "add" })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem", fontWeight: 500 }}>
          <Plus size={16} /> Adicionar Acomodação
        </button>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-4 gap-3">
        {(Object.entries(STATUS_CFG) as [AccommodationStatus, typeof STATUS_CFG[AccommodationStatus]][]).map(([status, cfg]) => (
          <button key={status} onClick={() => setFilterStatus(filterStatus === status ? "todos" : status)} className="rounded-xl p-4 flex items-center gap-3 transition-all" style={{ background: filterStatus === status ? cfg.bg : "#fdfaf5", border: `1.5px solid ${filterStatus === status ? cfg.text + "40" : "rgba(44,35,18,0.08)"}` }}>
            <div className="w-3 h-8 rounded-full" style={{ background: cfg.text }} />
            <div className="text-left">
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#1c1a17" }}>{counts[status]}</div>
              <div style={{ fontSize: "0.72rem", color: "#7a7060" }}>{cfg.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Accommodation cards */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {filtered.map(acc => {
          const sc = STATUS_CFG[acc.status];
          return (
            <div key={acc.id} className="rounded-2xl overflow-hidden" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.09)" }}>
              <div className="relative h-44 overflow-hidden">
                {acc.image ? (
                  <img src={acc.image} alt={acc.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "#ede8df" }}>
                    <BedDouble size={40} style={{ color: "#7a7060" }} />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full" style={{ fontSize: "0.68rem", background: "rgba(253,250,245,0.9)", color: sc.text, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {sc.label}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.7rem", background: "rgba(26,46,20,0.85)", color: "#d4a84b", fontWeight: 500 }}>
                    {acc.type}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", color: "#1a2e14", fontWeight: 600 }}>{acc.name}</div>
                    <div className="flex items-center gap-1 mt-0.5" style={{ fontSize: "0.75rem", color: "#7a7060" }}>
                      <Users size={11} /> {acc.capacity} hóspedes
                    </div>
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1rem", color: "#2d5016", fontWeight: 700, textAlign: "right" }}>
                    R$ {acc.price}<br /><span style={{ fontSize: "0.65rem", color: "#7a7060", fontWeight: 400 }}>/noite</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.8rem", color: "#7a7060", lineHeight: 1.5, marginBottom: 12 }} className="line-clamp-2">{acc.description}</p>
                <div className="flex items-center gap-1.5 mb-3">
                  {acc.amenities.slice(0, 4).map(a => {
                    const cfg = AMENITY_ICONS[a];
                    return cfg ? <cfg.icon key={a} size={13} style={{ color: "#7a7060" }} aria-label={cfg.label} /> : null;
                  })}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModal({ mode: "view", acc })} className="flex-1 py-1.5 rounded-lg" style={{ background: "#1a2e1410", color: "#1a2e14", fontSize: "0.78rem", fontWeight: 500 }}>
                    Detalhes
                  </button>
                  <button onClick={() => setModal({ mode: "edit", acc })} className="py-1.5 px-3 rounded-lg" style={{ background: "#2d501615", color: "#2d5016", fontSize: "0.78rem" }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => deleteAccommodation(acc.id, acc.name)} className="py-1.5 px-3 rounded-lg" style={{ background: "#b9323215", color: "#b93232", fontSize: "0.78rem" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
