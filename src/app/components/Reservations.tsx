import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, X, Search } from "lucide-react";
import type { Store } from "../store/useStore";
import { isRoomAvailable } from "../store/useStore";

const statusColors: Record<string, { bg: string; text: string }> = {
  confirmado: { bg: "#2d501618", text: "#2d5016" },
  pendente: { bg: "#c4882a18", text: "#c4882a" },
  cancelado: { bg: "#b9323218", text: "#b93232" },
  hospedado: { bg: "#1e5f7418", text: "#1e5f74" },
};

const statusLabels: Record<string, string> = {
  confirmado: "Confirmado", pendente: "Pendente", cancelado: "Cancelado", hospedado: "Hospedado",
};

const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const weekdays = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function fmt(dateStr: string) {
  return dateStr ? `${dateStr.slice(8,10)}/${dateStr.slice(5,7)}/${dateStr.slice(0,4)}` : "";
}

interface ReservationsProps { store: Store; }

function NewReservationModal({ store, onClose }: { store: Store; onClose: () => void }) {
  const { rooms, reservations, addReservation } = store;
  const [form, setForm] = useState({ guest: "", phone: "", email: "", roomId: rooms[0]?.id || "", checkin: "", checkout: "", guests: "2", notes: "" });
  const [error, setError] = useState("");

  const selectedRoom = rooms.find(r => r.id === form.roomId);
  const nights = form.checkin && form.checkout ? Math.round((new Date(form.checkout).getTime() - new Date(form.checkin).getTime()) / 86400000) : 0;
  const total = selectedRoom && nights > 0 ? nights * selectedRoom.price : 0;

  function handleSubmit() {
    if (!form.guest.trim()) { setError("Nome obrigatório"); return; }
    if (!form.phone.trim()) { setError("Telefone obrigatório"); return; }
    if (!form.checkin || !form.checkout) { setError("Datas obrigatórias"); return; }
    if (form.checkout <= form.checkin) { setError("Check-out deve ser após check-in"); return; }
    if (!isRoomAvailable(form.roomId, form.checkin, form.checkout, reservations)) {
      setError("Quarto indisponível nas datas selecionadas"); return;
    }
    addReservation({
      guest: form.guest.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      roomId: form.roomId,
      roomName: selectedRoom?.name || "",
      checkin: form.checkin,
      checkout: form.checkout,
      value: total,
      guests: parseInt(form.guests) || 1,
      notes: form.notes.trim(),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="rounded-2xl w-full max-w-lg p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>Nova Reserva</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}><X size={15} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Nome do Hóspede *", key: "guest", type: "text", col: "2" },
            { label: "Telefone *", key: "phone", type: "text", col: "1" },
            { label: "E-mail", key: "email", type: "email", col: "1" },
            { label: "Check-in *", key: "checkin", type: "date", col: "1" },
            { label: "Check-out *", key: "checkout", type: "date", col: "1" },
            { label: "Nº Hóspedes", key: "guests", type: "number", col: "1" },
          ].map(({ label, key, type, col }) => (
            <div key={key} style={{ gridColumn: col === "2" ? "1 / -1" : "auto" }}>
              <label style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", fontWeight: 500, display: "block", marginBottom: 5 }}>{label}</label>
              <input type={type} value={form[key as keyof typeof form]} onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setError(""); }}
                className="w-full px-3 py-2 rounded-lg outline-none" style={{ background: "var(--input-background)", border: "1px solid var(--border)", fontSize: "0.875rem", color: "var(--foreground)" }} />
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", fontWeight: 500, display: "block", marginBottom: 5 }}>Quarto *</label>
            <select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg outline-none" style={{ background: "var(--input-background)", border: "1px solid var(--border)", fontSize: "0.875rem", color: "var(--foreground)" }}>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name} — R$ {r.price}/noite</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", fontWeight: 500, display: "block", marginBottom: 5 }}>Observações</label>
            <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg outline-none" style={{ background: "var(--input-background)", border: "1px solid var(--border)", fontSize: "0.875rem", color: "var(--foreground)" }} />
          </div>
        </div>

        {total > 0 && (
          <div className="mt-3 px-3 py-2 rounded-lg flex justify-between" style={{ background: "#2d501612" }}>
            <span style={{ fontSize: "0.82rem", color: "#2d5016" }}>{nights} noites × R$ {selectedRoom?.price}</span>
            <span style={{ fontSize: "0.82rem", color: "#2d5016", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>Total: R$ {total.toLocaleString("pt-BR")}</span>
          </div>
        )}

        {error && <div className="mt-2 px-3 py-2 rounded-lg" style={{ background: "#b9323215", color: "#b93232", fontSize: "0.8rem" }}>{error}</div>}

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl" style={{ background: "var(--muted)", fontSize: "0.875rem", color: "var(--foreground)" }}>Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl" style={{ background: "var(--primary)", fontSize: "0.875rem", color: "var(--primary-foreground)" }}>Confirmar Reserva</button>
        </div>
      </div>
    </div>
  );
}

export function Reservations({ store }: ReservationsProps) {
  const { reservations, cancelReservation, checkinReservation, checkoutReservation, updateReservation } = store;

  const [calDate, setCalDate] = useState(new Date(2026, 5, 1));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"list" | "calendar">("list");
  const [statusFilter, setStatusFilter] = useState<"todos" | "confirmado" | "pendente" | "hospedado" | "cancelado">("todos");

  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const selected = reservations.find(r => r.id === selectedId) || null;

  const filtered = reservations.filter(r => {
    const matchSearch = r.guest.toLowerCase().includes(search.toLowerCase()) || r.roomName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function getReservationsForDay(day: number): typeof reservations {
    const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return reservations.filter(r => r.status !== "cancelado" && dateStr >= r.checkin && dateStr < r.checkout);
  }

  return (
    <div className="flex flex-col gap-6">
      {showModal && <NewReservationModal store={store} onClose={() => setShowModal(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>Reservas</h1>
          <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{reservations.length} registros</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.875rem" }}>
          <Plus size={16} /> Nova Reserva
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--muted)" }}>
        {(["list","calendar"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="px-4 py-1.5 rounded-lg transition-colors" style={{ background: tab === t ? "var(--card)" : "transparent", fontSize: "0.875rem", color: tab === t ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: tab === t ? 500 : 400 }}>
            {t === "list" ? "Lista" : "Calendário"}
          </button>
        ))}
      </div>

      {tab === "list" ? (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 min-w-60" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <Search size={15} style={{ color: "var(--muted-foreground)" }} />
              <input placeholder="Buscar hóspede, quarto ou ID…" value={search} onChange={e => setSearch(e.target.value)} className="flex-1 outline-none bg-transparent" style={{ fontSize: "0.875rem", color: "var(--foreground)" }} />
            </div>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--muted)" }}>
              {(["todos","confirmado","pendente","hospedado","cancelado"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className="px-3 py-1 rounded-lg" style={{ background: statusFilter === s ? "var(--card)" : "transparent", fontSize: "0.75rem", color: statusFilter === s ? "var(--foreground)" : "var(--muted-foreground)", textTransform: "capitalize" }}>
                  {s === "todos" ? "Todos" : statusLabels[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                  {["ID","Hóspede","Quarto","Check-in","Check-out","Valor","Status"].map(h => (
                    <th key={h} className="px-5 py-3 text-left" style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} onClick={() => setSelectedId(r.id)} className="cursor-pointer" style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-5 py-3.5" style={{ fontSize: "0.78rem", fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)" }}>{r.id}</td>
                    <td className="px-5 py-3.5" style={{ fontSize: "0.875rem", color: "var(--foreground)", fontWeight: 500 }}>{r.guest}</td>
                    <td className="px-5 py-3.5" style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{r.roomName}</td>
                    <td className="px-5 py-3.5" style={{ fontSize: "0.8rem", fontFamily: "'DM Mono', monospace", color: "var(--foreground)" }}>{fmt(r.checkin)}</td>
                    <td className="px-5 py-3.5" style={{ fontSize: "0.8rem", fontFamily: "'DM Mono', monospace", color: "var(--foreground)" }}>{fmt(r.checkout)}</td>
                    <td className="px-5 py-3.5" style={{ fontSize: "0.875rem", fontFamily: "'DM Mono', monospace", color: "var(--foreground)" }}>R$ {r.value.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full" style={{ fontSize: "0.68rem", background: statusColors[r.status].bg, color: statusColors[r.status].text, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {statusLabels[r.status]}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-8 text-center" style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Nenhuma reserva encontrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>{months[month]} {year}</h2>
            <div className="flex gap-2">
              <button onClick={() => setCalDate(new Date(year, month - 1, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}><ChevronLeft size={16} /></button>
              <button onClick={() => setCalDate(new Date(year, month + 1, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekdays.map(d => <div key={d} className="text-center py-1" style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase" }}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayRes = getReservationsForDay(day);
              const isToday = day === 4 && month === 5 && year === 2026;
              return (
                <div key={day} className="rounded-lg p-1.5 cursor-pointer transition-colors min-h-14 flex flex-col" style={{ background: isToday ? "#2d501618" : dayRes.length > 0 ? "var(--muted)" : "var(--muted)", border: isToday ? "1.5px solid #2d5016" : "1px solid transparent" }}>
                  <span style={{ fontSize: "0.8rem", color: isToday ? "#2d5016" : "var(--foreground)", fontWeight: isToday ? 600 : 400 }}>{day}</span>
                  {dayRes.slice(0, 2).map(r => (
                    <div key={r.id} onClick={() => setSelectedId(r.id)} className="rounded px-1 py-0.5 mt-0.5 truncate" style={{ fontSize: "0.65rem", background: statusColors[r.status].bg, color: statusColors[r.status].text, cursor: "pointer" }}>
                      {r.guest.split(" ")[0]}
                    </div>
                  ))}
                  {dayRes.length > 2 && <div style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", marginTop: 1 }}>+{dayRes.length - 2}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail side panel */}
      {selected && (
        <div className="fixed inset-y-0 right-0 w-80 shadow-2xl flex flex-col z-40" style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>Reserva {selected.id}</h3>
            <button onClick={() => setSelectedId(null)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}><X size={14} /></button>
          </div>
          <div className="flex-1 px-5 py-4 overflow-y-auto flex flex-col gap-4">
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Hóspede</div>
              <div style={{ fontSize: "1.1rem", fontFamily: "'Playfair Display', serif", color: "var(--foreground)", marginTop: 2 }}>{selected.guest}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>{selected.phone}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>{selected.email}</div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Quarto", value: selected.roomName },
                { label: "Hóspedes", value: `${selected.guests} pessoa${selected.guests > 1 ? "s" : ""}` },
                { label: "Check-in", value: fmt(selected.checkin) },
                { label: "Check-out", value: fmt(selected.checkout) },
                { label: "Total", value: `R$ ${selected.value.toLocaleString("pt-BR")}` },
                { label: "Cadastro", value: new Date(selected.createdAt).toLocaleDateString("pt-BR") },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-lg" style={{ background: "var(--muted)" }}>
                  <div style={{ fontSize: "0.67rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  <div style={{ fontSize: "0.84rem", color: "var(--foreground)", fontWeight: 500, marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Status Atual</div>
              <span className="px-3 py-1.5 rounded-full" style={{ fontSize: "0.75rem", background: statusColors[selected.status].bg, color: statusColors[selected.status].text, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {statusLabels[selected.status]}
              </span>
            </div>
            {selected.notes && (
              <div className="p-3 rounded-lg" style={{ background: "var(--muted)" }}>
                <div style={{ fontSize: "0.67rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Observações</div>
                <div style={{ fontSize: "0.82rem", color: "var(--foreground)" }}>{selected.notes}</div>
              </div>
            )}
          </div>
          <div className="px-5 pb-5 flex flex-col gap-2">
            {selected.status === "confirmado" && (
              <button onClick={() => checkinReservation(selected.id, selected.guest, selected.roomName)} className="w-full py-2.5 rounded-xl" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.875rem" }}>
                ✓ Fazer Check-in
              </button>
            )}
            {selected.status === "hospedado" && (
              <button onClick={() => checkoutReservation(selected.id, selected.guest, selected.roomName)} className="w-full py-2.5 rounded-xl" style={{ background: "#1e5f74", color: "#fdfaf5", fontSize: "0.875rem" }}>
                ✓ Fazer Check-out
              </button>
            )}
            {selected.status === "pendente" && (
              <button onClick={() => updateReservation(selected.id, { status: "confirmado" })} className="w-full py-2.5 rounded-xl" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.875rem" }}>
                ✓ Confirmar Reserva
              </button>
            )}
            {selected.status !== "cancelado" && (
              <button onClick={() => { cancelReservation(selected.id, selected.guest, selected.roomName); setSelectedId(null); }} className="w-full py-2.5 rounded-xl" style={{ background: "#b9323218", color: "#b93232", fontSize: "0.875rem" }}>
                Cancelar Reserva
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
