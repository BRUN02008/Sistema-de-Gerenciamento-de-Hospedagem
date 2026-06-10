import { useState } from "react";
import { Users, Wifi, Wind, Coffee, Check, X } from "lucide-react";
import type { Store } from "../store/useStore";
import { getBlockedDates } from "../store/useStore";

const amenityIcons: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: "Wi-Fi" },
  "ar-cond": { icon: Wind, label: "Ar-condicionado" },
  café: { icon: Coffee, label: "Café da manhã" },
};

const typeColors: Record<string, string> = { Chalé: "#2d5016", Suíte: "#c4882a", Standard: "#7a7060" };

const typeFilters = ["Todos", "Chalé", "Suíte", "Standard"] as const;
type TypeFilter = typeof typeFilters[number];

interface RoomsProps { store: Store; }

export function Rooms({ store }: RoomsProps) {
  const { rooms, reservations } = store;
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("Todos");
  const [selected, setSelected] = useState<typeof rooms[0] | null>(null);

  // Today string
  const todayStr = "2026-06-04";

  function getRoomStatus(roomId: string): "disponível" | "ocupado" | "reservado" {
    const blockedToday = getBlockedDates(roomId, reservations).includes(todayStr);
    if (blockedToday) {
      const activeRes = reservations.find(r => r.roomId === roomId && r.status === "hospedado" && todayStr >= r.checkin && todayStr < r.checkout);
      return activeRes ? "ocupado" : "reservado";
    }
    return "disponível";
  }

  const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    disponível: { label: "Disponível", bg: "#2d501618", text: "#2d5016", dot: "#2d5016" },
    ocupado: { label: "Ocupado", bg: "#1e5f7418", text: "#1e5f74", dot: "#1e5f74" },
    reservado: { label: "Reservado", bg: "#c4882a18", text: "#c4882a", dot: "#c4882a" },
  };

  const filteredRooms = rooms.filter(r => typeFilter === "Todos" || r.type === typeFilter);

  const counts = {
    disponível: rooms.filter(r => getRoomStatus(r.id) === "disponível").length,
    ocupado: rooms.filter(r => getRoomStatus(r.id) === "ocupado").length,
    reservado: rooms.filter(r => getRoomStatus(r.id) === "reservado").length,
  };

  // Next reservation for a room
  function nextReservation(roomId: string) {
    return reservations
      .filter(r => r.roomId === roomId && r.status !== "cancelado" && r.checkin >= todayStr)
      .sort((a, b) => a.checkin.localeCompare(b.checkin))[0] || null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>Quartos</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{rooms.length} unidades · {counts.disponível} disponíveis hoje</p>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-3 gap-3">
        {(["disponível","ocupado","reservado"] as const).map(s => (
          <div key={s} className="rounded-xl p-4 flex items-center gap-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="w-2 h-8 rounded-full" style={{ background: statusConfig[s].dot }} />
            <div>
              <div style={{ fontSize: "1.4rem", fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>{counts[s]}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "capitalize" }}>{statusConfig[s].label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--muted)" }}>
        {typeFilters.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className="px-3 py-1.5 rounded-lg transition-colors" style={{ background: typeFilter === t ? "var(--card)" : "transparent", fontSize: "0.8rem", color: typeFilter === t ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: typeFilter === t ? 500 : 400 }}>
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {filteredRooms.map(room => {
          const status = getRoomStatus(room.id);
          const sc = statusConfig[status];
          const next = nextReservation(room.id);
          return (
            <div key={room.id} className="rounded-xl overflow-hidden cursor-pointer transition-shadow hover:shadow-md" style={{ background: "var(--card)", border: "1px solid var(--border)" }} onClick={() => setSelected(room)}>
              <div className="relative h-36 overflow-hidden">
                <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 rounded-full" style={{ fontSize: "0.68rem", background: sc.bg, color: sc.text, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", backdropFilter: "blur(6px)" }}>
                    {sc.label}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1rem", color: "var(--foreground)" }}>{room.name}</div>
                    <div style={{ fontSize: "0.78rem", color: typeColors[room.type], fontWeight: 500 }}>{room.type}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9rem", color: "var(--foreground)", fontWeight: 500 }}>R$ {room.price}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>/noite</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1" style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                    <Users size={12} /> {room.capacity} hóspedes
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    {room.amenities.map(a => {
                      const cfg = amenityIcons[a];
                      return cfg ? <span key={a} title={cfg.label}><cfg.icon size={13} style={{ color: "var(--muted-foreground)" }} /></span> : null;
                    })}
                  </div>
                </div>
                {next && status === "reservado" && (
                  <div className="mt-2 px-2 py-1.5 rounded-lg" style={{ background: "#c4882a12", fontSize: "0.72rem", color: "#c4882a" }}>
                    Próx: {next.guest.split(" ")[0]} · {next.checkin.slice(8,10)}/{next.checkin.slice(5,7)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-y-0 right-0 w-80 shadow-2xl flex flex-col z-40" style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>{selected.name}</h3>
            <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}><X size={14} /></button>
          </div>
          <div className="h-44 overflow-hidden">
            <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 px-5 py-4 flex flex-col gap-4 overflow-y-auto">
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{selected.description}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Tipo", value: selected.type },
                { label: "Capacidade", value: `${selected.capacity} hósp.` },
                { label: "Diária", value: `R$ ${selected.price}` },
                { label: "Status", value: statusConfig[getRoomStatus(selected.id)].label },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-lg" style={{ background: "var(--muted)" }}>
                  <div style={{ fontSize: "0.67rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--foreground)", fontWeight: 500, marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Upcoming reservations for this room */}
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Reservas Futuras</div>
              {reservations.filter(r => r.roomId === selected.id && r.status !== "cancelado" && r.checkin >= todayStr).slice(0, 3).map(r => (
                <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg mb-2" style={{ background: "var(--muted)", fontSize: "0.8rem" }}>
                  <div>
                    <div style={{ color: "var(--foreground)", fontWeight: 500 }}>{r.guest.split(" ")[0]}</div>
                    <div style={{ color: "var(--muted-foreground)", fontSize: "0.72rem", fontFamily: "'DM Mono', monospace" }}>{r.checkin.slice(8,10)}/{r.checkin.slice(5,7)} → {r.checkout.slice(8,10)}/{r.checkout.slice(5,7)}</div>
                  </div>
                  <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 20, background: statusConfig[r.status as keyof typeof statusConfig]?.bg || "#eee", color: statusConfig[r.status as keyof typeof statusConfig]?.text || "#666", fontWeight: 600 }}>
                    {r.status}
                  </span>
                </div>
              ))}
              {reservations.filter(r => r.roomId === selected.id && r.status !== "cancelado" && r.checkin >= todayStr).length === 0 && (
                <div style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>Sem reservas futuras</div>
              )}
            </div>

            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Comodidades</div>
              <div className="flex flex-col gap-2">
                {Object.entries(amenityIcons).map(([key, { label }]) => {
                  const has = selected.amenities.includes(key);
                  return (
                    <div key={key} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: has ? "#2d501620" : "var(--muted)" }}>
                        {has ? <Check size={10} style={{ color: "#2d5016" }} /> : <X size={10} style={{ color: "var(--muted-foreground)" }} />}
                      </div>
                      <span style={{ fontSize: "0.85rem", color: has ? "var(--foreground)" : "var(--muted-foreground)" }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
