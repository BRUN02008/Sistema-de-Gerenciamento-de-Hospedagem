import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Wifi, Wind, Coffee, Users, Check, Trees, LogOut, CalendarDays } from "lucide-react";
import type { Store } from "../store/useStore";
import { isRoomAvailable, getBlockedDates } from "../store/useStore";

interface UserBookingProps {
  store: Store;
  onLogout: () => void;
}

const amenityIcons: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: "Wi-Fi" },
  "ar-cond": { icon: Wind, label: "Ar-condicionado" },
  café: { icon: Coffee, label: "Café da manhã" },
};

const typeColors: Record<string, string> = { Chalé: "#2d5016", Suíte: "#c4882a", Standard: "#7a7060" };

const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const weekdays = ["D","S","T","Q","Q","S","S"];

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function formatDate(s: string) {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

type Step = "rooms" | "dates" | "form" | "confirm";

export function UserBooking({ store, onLogout }: UserBookingProps) {
  const { rooms, reservations, addReservation } = store;

  const [step, setStep] = useState<Step>("rooms");
  const [selectedRoom, setSelectedRoom] = useState<typeof rooms[0] | null>(null);
  const [typeFilter, setTypeFilter] = useState<"Todos" | "Chalé" | "Suíte" | "Standard">("Todos");

  // Date picking
  const todayStr = "2026-06-04";
  const [calDate, setCalDate] = useState(new Date(2026, 5, 1));
  const [checkin, setCheckin] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Form
  const [form, setForm] = useState({ guest: "", email: "", phone: "", guests: "2", notes: "" });
  const [formError, setFormError] = useState("");

  // Success
  const [successReservation, setSuccessReservation] = useState<string | null>(null);

  const blockedDates = useMemo(() =>
    selectedRoom ? new Set(getBlockedDates(selectedRoom.id, reservations)) : new Set<string>(),
    [selectedRoom, reservations]
  );

  const nights = checkin && checkout ? diffDays(checkin, checkout) : 0;
  const totalValue = selectedRoom ? nights * selectedRoom.price : 0;

  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();

  function handleDayClick(dateStr: string) {
    if (blockedDates.has(dateStr) || dateStr < todayStr) return;
    if (!checkin || (checkin && checkout)) {
      setCheckin(dateStr);
      setCheckout(null);
    } else {
      if (dateStr <= checkin) { setCheckin(dateStr); setCheckout(null); return; }
      // Check no blocked dates in range
      const cur = new Date(checkin);
      cur.setDate(cur.getDate() + 1);
      let blocked = false;
      while (toDateStr(cur) < dateStr) {
        if (blockedDates.has(toDateStr(cur))) { blocked = true; break; }
        cur.setDate(cur.getDate() + 1);
      }
      if (blocked) { setCheckin(dateStr); setCheckout(null); return; }
      setCheckout(dateStr);
    }
  }

  function getDayState(dateStr: string): "blocked" | "past" | "today" | "checkin" | "checkout" | "range" | "hover-range" | "available" {
    if (dateStr < todayStr) return "past";
    if (dateStr === todayStr) return "today";
    if (blockedDates.has(dateStr)) return "blocked";
    if (checkin && dateStr === checkin) return "checkin";
    if (checkout && dateStr === checkout) return "checkout";
    if (checkin && checkout && dateStr > checkin && dateStr < checkout) return "range";
    if (checkin && !checkout && hoverDate && dateStr > checkin && dateStr <= hoverDate && !blockedDates.has(dateStr)) return "hover-range";
    return "available";
  }

  function dayStyle(state: ReturnType<typeof getDayState>) {
    switch (state) {
      case "blocked": return { bg: "#b9323215", text: "#b93232", cursor: "not-allowed", border: "1px solid #b9323225" };
      case "past": return { bg: "transparent", text: "var(--muted-foreground)", cursor: "not-allowed", opacity: 0.4 };
      case "today": return { bg: "var(--primary)", text: "var(--primary-foreground)", cursor: "pointer" };
      case "checkin": return { bg: "#2d5016", text: "#fdfaf5", cursor: "pointer" };
      case "checkout": return { bg: "#2d5016", text: "#fdfaf5", cursor: "pointer" };
      case "range": return { bg: "#2d501620", text: "#2d5016", cursor: "pointer" };
      case "hover-range": return { bg: "#2d501612", text: "#2d5016", cursor: "pointer" };
      case "available": return { bg: "var(--muted)", text: "var(--foreground)", cursor: "pointer" };
    }
  }

  function validateForm() {
    if (!form.guest.trim()) return "Nome é obrigatório";
    if (!form.phone.trim()) return "Telefone é obrigatório";
    if (!form.email.trim()) return "E-mail é obrigatório";
    if (!form.guests || parseInt(form.guests) < 1) return "Número de hóspedes inválido";
    if (selectedRoom && parseInt(form.guests) > selectedRoom.capacity) return `Capacidade máxima: ${selectedRoom.capacity} hóspedes`;
    return "";
  }

  function handleConfirm() {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    if (!selectedRoom || !checkin || !checkout) return;

    const ok = isRoomAvailable(selectedRoom.id, checkin, checkout, reservations);
    if (!ok) { setFormError("Este quarto não está mais disponível para as datas selecionadas."); return; }

    const res = addReservation({
      guest: form.guest.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      checkin,
      checkout,
      value: totalValue,
      guests: parseInt(form.guests),
      notes: form.notes.trim(),
    });

    setSuccessReservation(res.id);
    setStep("confirm");
  }

  function reset() {
    setStep("rooms");
    setSelectedRoom(null);
    setCheckin(null);
    setCheckout(null);
    setForm({ guest: "", email: "", phone: "", guests: "2", notes: "" });
    setFormError("");
    setSuccessReservation(null);
  }

  const filteredRooms = rooms.filter(r => typeFilter === "Todos" || r.type === typeFilter);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b" style={{ background: "var(--sidebar)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#c4882a" }}>
            <Trees size={16} style={{ color: "#1e2f12" }} />
          </div>
          <div style={{ fontFamily: "'DM Serif Display', serif", color: "#e8e2d6", fontSize: "1.1rem" }}>
            Tribo Hospedagem
          </div>
        </div>
        <div className="flex items-center gap-3">
          {step !== "rooms" && step !== "confirm" && (
            <button onClick={reset} style={{ fontSize: "0.8rem", color: "#e8e2d680", background: "none", border: "none", cursor: "pointer" }}>
              ← Recomeçar
            </button>
          )}
          <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.08)", fontSize: "0.8rem", color: "#e8e2d6" }}>
            <LogOut size={13} /> Sair
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">

        {/* ── STEP: ROOMS ── */}
        {step === "rooms" && (
          <>
            <div className="mb-6">
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.8rem", color: "var(--foreground)" }}>Escolha seu quarto</h1>
              <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginTop: 4 }}>Selecione o tipo de acomodação ideal para você</p>
            </div>

            {/* Type filter */}
            <div className="flex gap-2 mb-6">
              {(["Todos","Chalé","Suíte","Standard"] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} className="px-4 py-1.5 rounded-full transition-colors" style={{
                  background: typeFilter === t ? "var(--primary)" : "var(--card)",
                  color: typeFilter === t ? "var(--primary-foreground)" : "var(--foreground)",
                  border: "1px solid var(--border)",
                  fontSize: "0.85rem",
                }}>{t}</button>
              ))}
            </div>

            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {filteredRooms.map(room => {
                return (
                  <div key={room.id} className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                    style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}
                    onClick={() => { setSelectedRoom(room); setStep("dates"); setCalDate(new Date(2026,5,1)); }}
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full" style={{ fontSize: "0.68rem", background: `${typeColors[room.type]}22`, color: typeColors[room.type], fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", backdropFilter: "blur(6px)" }}>
                          {room.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.05rem", color: "var(--foreground)" }}>{room.name}</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9rem", color: "var(--foreground)", fontWeight: 600 }}>R$ {room.price}<span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", fontWeight: 400 }}>/noite</span></div>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: 12 }}>{room.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1" style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                          <Users size={12} /> {room.capacity} hóspedes
                        </div>
                        <div className="flex gap-1.5">
                          {room.amenities.map(a => {
                            const cfg = amenityIcons[a];
                            return cfg ? <span key={a} title={cfg.label}><cfg.icon size={13} style={{ color: "var(--muted-foreground)" }} /></span> : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── STEP: DATES ── */}
        {step === "dates" && selectedRoom && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => { setStep("rooms"); setCheckin(null); setCheckout(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.6rem", color: "var(--foreground)" }}>Escolha as datas</h1>
                <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{selectedRoom.name} · R$ {selectedRoom.price}/noite</p>
              </div>
            </div>

            <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 320px" }}>
              {/* Calendar */}
              <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>{months[calMonth]} {calYear}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setCalDate(new Date(calYear, calMonth - 1, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}>
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setCalDate(new Date(calYear, calMonth + 1, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-4" style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: "#b9323215", border: "1px solid #b9323225" }} /> Indisponível</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: "#2d5016" }} /> Selecionado</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: "#2d501620" }} /> Intervalo</div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {weekdays.map((d, i) => (
                    <div key={i} className="text-center py-1" style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600 }}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const state = getDayState(dateStr);
                    const s = dayStyle(state);
                    return (
                      <div
                        key={day}
                        className="aspect-square rounded-lg flex items-center justify-center select-none"
                        style={{ background: s.bg, color: s.text, cursor: s.cursor, fontSize: "0.85rem", opacity: "opacity" in s ? s.opacity : undefined }}
                        onClick={() => handleDayClick(dateStr)}
                        onMouseEnter={() => setHoverDate(dateStr)}
                        onMouseLeave={() => setHoverDate(null)}
                      >
                        {day}
                        {state === "blocked" && <span style={{ position: "absolute", fontSize: "0.5rem" }}>✕</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary panel */}
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="mb-4">
                    <img src={selectedRoom.image} alt={selectedRoom.name} className="w-full rounded-xl object-cover" style={{ height: 120 }} />
                  </div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", color: "var(--foreground)", marginBottom: 4 }}>{selectedRoom.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: 16 }}>{selectedRoom.type} · {selectedRoom.capacity} hóspedes</div>

                  {checkin && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--muted)" }}>
                        <div>
                          <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Check-in</div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.875rem", color: "var(--foreground)", marginTop: 2 }}>{formatDate(checkin)}</div>
                        </div>
                        <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
                        <div>
                          <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Check-out</div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.875rem", color: checkout ? "var(--foreground)" : "var(--muted-foreground)", marginTop: 2 }}>
                            {checkout ? formatDate(checkout) : "— selecione"}
                          </div>
                        </div>
                      </div>

                      {checkout && (
                        <>
                          <div className="flex justify-between px-1" style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                            <span>{nights} noite{nights !== 1 ? "s" : ""} × R$ {selectedRoom.price}</span>
                            <span style={{ color: "var(--foreground)", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>R$ {totalValue.toLocaleString("pt-BR")}</span>
                          </div>
                          <button
                            onClick={() => setStep("form")}
                            className="w-full py-3 rounded-xl mt-2"
                            style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.9rem", fontWeight: 500 }}
                          >
                            Continuar →
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {!checkin && (
                    <div className="text-center py-4" style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                      <CalendarDays size={24} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                      Clique em uma data de check-in
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── STEP: FORM ── */}
        {step === "form" && selectedRoom && checkin && checkout && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep("dates")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.6rem", color: "var(--foreground)" }}>Seus dados</h1>
                <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Preencha para finalizar a reserva</p>
              </div>
            </div>

            <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 300px" }}>
              <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                {[
                  { label: "Nome completo *", key: "guest", type: "text", placeholder: "Seu nome" },
                  { label: "E-mail *", key: "email", type: "email", placeholder: "seu@email.com" },
                  { label: "Telefone *", key: "phone", type: "text", placeholder: "(00) 00000-0000" },
                  { label: "Número de hóspedes *", key: "guests", type: "number", placeholder: "1" },
                  { label: "Observações", key: "notes", type: "text", placeholder: "Necessidades especiais, horário de chegada..." },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 500, display: "block", marginBottom: 6 }}>{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setFormError(""); }}
                      className="w-full px-3 py-2.5 rounded-xl outline-none"
                      style={{ background: "var(--input-background)", border: "1px solid var(--border)", fontSize: "0.875rem", color: "var(--foreground)" }}
                    />
                  </div>
                ))}
                {formError && (
                  <div className="px-3 py-2.5 rounded-xl" style={{ background: "#b9323215", color: "#b93232", fontSize: "0.82rem" }}>
                    {formError}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1rem", color: "var(--foreground)", marginBottom: 12 }}>Resumo da Reserva</div>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { label: "Acomodação", val: selectedRoom.name },
                      { label: "Check-in", val: formatDate(checkin) },
                      { label: "Check-out", val: formatDate(checkout) },
                      { label: "Noites", val: `${nights}` },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between" style={{ fontSize: "0.85rem" }}>
                        <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
                        <span style={{ color: "var(--foreground)", fontFamily: "'DM Mono', monospace" }}>{val}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2.5 mt-1 flex justify-between" style={{ borderColor: "var(--border)" }}>
                      <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.9rem" }}>Total</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: "var(--foreground)", fontSize: "0.9rem" }}>R$ {totalValue.toLocaleString("pt-BR")}</span>
                    </div>
                  </div>
                </div>
                <button onClick={handleConfirm} className="w-full py-3 rounded-xl" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.9rem", fontWeight: 500 }}>
                  Confirmar Reserva
                </button>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textAlign: "center" }}>
                  Pagamento será cobrado no check-in. Cancelamento grátis até 48h antes.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── STEP: CONFIRM ── */}
        {step === "confirm" && selectedRoom && checkin && checkout && successReservation && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "#2d501618", border: "2px solid #2d5016" }}>
                <Check size={28} style={{ color: "#2d5016" }} />
              </div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "var(--foreground)", marginBottom: 8 }}>Reserva Confirmada!</h1>
              <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: 24 }}>
                Sua reserva foi registrada com sucesso. Aguarde a confirmação da nossa equipe.
              </p>
              <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between" style={{ fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--muted-foreground)" }}>Código</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", color: "#2d5016", fontWeight: 600 }}>{successReservation}</span>
                  </div>
                  {[
                    { label: "Acomodação", val: selectedRoom.name },
                    { label: "Hóspede", val: form.guest },
                    { label: "Check-in", val: formatDate(checkin) },
                    { label: "Check-out", val: formatDate(checkout) },
                    { label: "Total", val: `R$ ${totalValue.toLocaleString("pt-BR")}` },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between" style={{ fontSize: "0.85rem" }}>
                      <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
                      <span style={{ color: "var(--foreground)", fontFamily: "'DM Mono', monospace" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={reset} className="px-8 py-3 rounded-xl" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.9rem" }}>
                Fazer nova reserva
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
