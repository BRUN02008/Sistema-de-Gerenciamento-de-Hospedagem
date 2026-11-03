import { useState } from "react";
import { Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, Search, Check, Minus } from "lucide-react";
import type { Store, Reservation, ReservationStatus, ReservationOptional } from "../../store/useStore";
import { isAccommodationAvailable } from "../../store/useStore";

const STATUS_CFG: Record<ReservationStatus, { label: string; bg: string; text: string }> = {
  confirmado: { label: "Confirmado", bg: "#2d501615", text: "#2d5016" },
  pendente: { label: "Pendente", bg: "#c4882a15", text: "#c4882a" },
  cancelado: { label: "Cancelado", bg: "#b9323215", text: "#b93232" },
  hospedado: { label: "Hospedado", bg: "#1e5f7415", text: "#1e5f74" },
  concluído: { label: "Concluído", bg: "#1a2e1420", text: "#1a2e14" },
};

const PAYMENT_METHODS = ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Transferência Bancária"] as const;

function fmt(d: string) { return d ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : "—"; }
function fmtShort(d: string) { return d ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : "—"; }

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

// ─── Reservation Modal ────────────────────────────────────────────────────────

interface ModalForm {
  guest: string; phone: string; email: string;
  accommodationId: string;
  checkin: string; checkout: string;
  checkinTime: string; checkoutTime: string;
  guests: string;
  paymentMethod: string;
  paymentMethod2: string;
  notes: string;
  packageId: string;
  packageValue: number;
  optionals: { id: string; qty: number; notes: string }[];
  paidPercent: number;
}

function ReservationModal({ store, reservation, onClose }: { store: Store; reservation?: Reservation; onClose: () => void }) {
  const { accommodations, reservations, packages, services, addReservation, updateReservation } = store;
  const activePkgs = packages.filter(p => p.active);
  const availableServices = services.filter(s => s.available);

  const initPkgId = reservation?.packageId || activePkgs[0]?.id || "";
  const initPkg = packages.find(p => p.id === initPkgId);

  const [form, setForm] = useState<ModalForm>({
    guest: reservation?.guest || "",
    phone: reservation?.phone || "",
    email: reservation?.email || "",
    accommodationId: reservation?.accommodationId || accommodations[0]?.id || "",
    checkin: reservation?.checkin || "",
    checkout: reservation?.checkout || "",
    checkinTime: reservation?.checkinTime || "14:00",
    checkoutTime: reservation?.checkoutTime || "12:00",
    guests: String(reservation?.guests || 2),
    paymentMethod: reservation?.paymentMethod || "Pix",
    paymentMethod2: reservation?.paymentMethod2 || "",
    notes: reservation?.notes || "",
    packageId: initPkgId,
    packageValue: reservation?.packageValue ?? (initPkg?.value || 500),
    optionals: reservation?.optionals?.map(o => ({ id: o.id, qty: o.quantity, notes: o.notes })) || [],
    paidPercent: reservation?.paidPercent ?? 0,
  });
  const [error, setError] = useState("");

  const selectedAcc = accommodations.find(a => a.id === form.accommodationId);
  const selectedPkg = packages.find(p => p.id === form.packageId);

  const optionalsTotal = form.optionals.reduce((sum, opt) => {
    const svc = availableServices.find(s => s.id === opt.id);
    return sum + (svc ? svc.value * Math.max(1, opt.qty) : 0);
  }, 0);
  const finalValue = form.packageValue + optionalsTotal;
  const paidAmount = Math.round(finalValue * form.paidPercent / 100);

  function toggleOptional(id: string) {
    setForm(f => {
      const exists = f.optionals.find(o => o.id === id);
      if (exists) return { ...f, optionals: f.optionals.filter(o => o.id !== id) };
      return { ...f, optionals: [...f.optionals, { id, qty: 1, notes: "" }] };
    });
  }

  function setOptQty(id: string, qty: number) {
    setForm(f => ({ ...f, optionals: f.optionals.map(o => o.id === id ? { ...o, qty: Math.max(1, qty) } : o) }));
  }

  function handleSave() {
    if (!form.guest.trim()) { setError("Nome obrigatório"); return; }
    if (!form.packageId) { setError("Selecione um pacote"); return; }
    if (!form.checkin || !form.checkout) { setError("Datas obrigatórias"); return; }
    if (form.checkout <= form.checkin) { setError("Check-out deve ser posterior ao check-in"); return; }
    if (!isAccommodationAvailable(form.accommodationId, form.checkin, form.checkout, reservations, reservation?.id)) {
      setError("Acomodação indisponível nas datas selecionadas"); return;
    }

    const builtOptionals: ReservationOptional[] = form.optionals.map(opt => {
      const svc = availableServices.find(s => s.id === opt.id)!;
      return { id: opt.id, name: svc.name, unitValue: svc.value, quantity: opt.qty, total: svc.value * opt.qty, notes: opt.notes };
    });

    const data = {
      guest: form.guest.trim(), phone: form.phone.trim(), email: form.email.trim(),
      accommodationId: form.accommodationId, accommodationName: selectedAcc?.name || "",
      checkin: form.checkin, checkout: form.checkout,
      checkinTime: form.checkinTime, checkoutTime: form.checkoutTime,
      value: finalValue, originalValue: finalValue,
      packageId: form.packageId, packageName: selectedPkg?.name || "", packageValue: form.packageValue,
      optionals: builtOptionals,
      discountPercent: 0, discountAmount: 0,
      guests: parseInt(form.guests) || 1,
      paymentMethod: form.paymentMethod as typeof PAYMENT_METHODS[number],
      paymentMethod2: form.paymentMethod2 || undefined,
      paidPercent: form.paidPercent,
      notes: form.notes.trim(),
    };

    if (reservation) { updateReservation(reservation.id, data); }
    else { addReservation(data); }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(10,18,7,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl" style={{ background: "#fdfaf5", maxHeight: "95vh", display: "flex", flexDirection: "column" }}>
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "rgba(44,35,18,0.08)" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600, fontSize: "1.05rem" }}>
            {reservation ? "Editar Reserva" : "Nova Reserva"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ede8df" }}><X size={15} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 md:px-6 py-5 flex flex-col gap-5">
          {/* 1. Dados do hóspede */}
          <section>
            <div style={{ fontSize: "0.7rem", color: "#7a7060", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Dados do Hóspede</div>
            <div className="flex flex-col gap-3">
              <div>
                <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>Nome completo *</label>
                <input value={form.guest} onChange={e => { setForm(f => ({ ...f, guest: e.target.value })); setError(""); }} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>Telefone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>E-mail</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>Check-in *</label>
                <div className="flex gap-2">
                  <input type="date" value={form.checkin} onChange={e => { setForm(f => ({ ...f, checkin: e.target.value })); setError(""); }} className="flex-1 px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
                  <input type="time" value={form.checkinTime} onChange={e => setForm(f => ({ ...f, checkinTime: e.target.value }))} className="w-24 px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>Check-out *</label>
                <div className="flex gap-2">
                  <input type="date" value={form.checkout} onChange={e => { setForm(f => ({ ...f, checkout: e.target.value })); setError(""); }} className="flex-1 px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
                  <input type="time" value={form.checkoutTime} onChange={e => setForm(f => ({ ...f, checkoutTime: e.target.value }))} className="w-24 px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>Nº de Hóspedes</label>
                  <input type="number" value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>Acomodação *</label>
                  <select value={form.accommodationId} onChange={e => { setForm(f => ({ ...f, accommodationId: e.target.value })); setError(""); }} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }}>
                    {accommodations.filter(a => a.status !== "manutenção").map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Pacote */}
          <section>
            <div style={{ fontSize: "0.7rem", color: "#7a7060", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Selecionar Pacote <span style={{ color: "#b93232" }}>*</span>
            </div>
            <div className="flex flex-col gap-2">
              {activePkgs.map(pkg => {
                const sel = form.packageId === pkg.id;
                return (
                  <button key={pkg.id} type="button" onClick={() => setForm(f => ({ ...f, packageId: pkg.id, packageValue: pkg.value }))}
                    className="flex items-start gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                    style={{ background: sel ? "#1a2e14" : "#f0ead8", border: `2px solid ${sel ? "#1a2e14" : "rgba(44,35,18,0.1)"}` }}>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ borderColor: sel ? "#d4a84b" : "#7a7060" }}>
                      {sel && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#d4a84b" }} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: sel ? "#f7f4ef" : "#1a2e14" }}>{pkg.name}</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "0.9rem", color: sel ? "#d4a84b" : "#2d5016", flexShrink: 0 }}>
                          R$ {pkg.value}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: sel ? "rgba(247,244,239,0.6)" : "#7a7060", marginTop: 2 }}>{pkg.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {form.packageId && (
              <div className="mt-3">
                <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>Valor do Pacote (R$) — editável</label>
                <input type="number" value={form.packageValue} onChange={e => setForm(f => ({ ...f, packageValue: +e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
              </div>
            )}
          </section>

          {/* 3. Opcionais */}
          <section>
            <div style={{ fontSize: "0.7rem", color: "#7a7060", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Serviços Opcionais</div>
            <div className="flex flex-col gap-2">
              {availableServices.map(item => {
                const selected = form.optionals.find(o => o.id === item.id);
                return (
                  <div key={item.id}>
                    <button type="button" onClick={() => toggleOptional(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                      style={{ background: selected ? "#2d501612" : "#f0ead8", border: `1.5px solid ${selected ? "#2d501640" : "transparent"}` }}>
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: selected ? "#2d5016" : "#ede8df", border: selected ? "none" : "1.5px solid rgba(44,35,18,0.2)" }}>
                        {selected && <Check size={11} style={{ color: "#fff" }} />}
                      </div>
                      <div className="flex-1">
                        <div style={{ fontSize: "0.875rem", color: "#1c1a17", fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#7a7060" }}>R$ {item.value} por {item.quantityLabel || "serviço"}</div>
                      </div>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: selected ? "#2d5016" : "#7a7060", fontSize: "0.85rem", flexShrink: 0 }}>
                        +R$ {selected ? item.value * selected.qty : item.value}
                      </span>
                    </button>
                    {selected && item.hasQuantity && (
                      <div className="mt-1 ml-8 pl-4 flex items-center gap-3" style={{ borderLeft: "2px solid #2d501630" }}>
                        <span style={{ fontSize: "0.75rem", color: "#7a7060" }}>Qtd:</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setOptQty(item.id, selected.qty - 1)} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#ede8df" }}><Minus size={11} /></button>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9rem", fontWeight: 600, minWidth: 20, textAlign: "center" }}>{selected.qty}</span>
                          <button type="button" onClick={() => setOptQty(item.id, selected.qty + 1)} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#ede8df" }}><Plus size={11} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Valor e forma de pagamento */}
          <section>
            <div style={{ fontSize: "0.7rem", color: "#7a7060", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Valor e Forma de Pagamento</div>
            <div className="flex flex-col gap-3">
              <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "#1a2e14" }}>
                <div>
                  <div style={{ fontSize: "0.68rem", color: "rgba(247,244,239,0.55)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Valor Total</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(247,244,239,0.45)", marginTop: 2 }}>Pacote + serviços opcionais</div>
                </div>
                <output style={{ fontFamily: "'DM Mono', monospace", color: "#d4a84b", fontSize: "1.15rem", fontWeight: 700 }}>
                  R$ {finalValue.toLocaleString("pt-BR")}
                </output>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>Forma de Pagamento (principal)</label>
                <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }}>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>Segundo método (pagamento misto, opcional)</label>
                <select value={form.paymentMethod2} onChange={e => setForm(f => ({ ...f, paymentMethod2: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }}>
                  <option value="">— nenhum —</option>
                  {PAYMENT_METHODS.filter(m => m !== form.paymentMethod).map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>
                  % Pago — {form.paidPercent}%
                  {form.paidPercent > 0 && <span style={{ color: "#2d5016", marginLeft: 6 }}>· R$ {paidAmount.toLocaleString("pt-BR")}</span>}
                </label>
                <input type="range" min={0} max={100} step={5} value={form.paidPercent} onChange={e => setForm(f => ({ ...f, paidPercent: +e.target.value }))}
                  className="w-full" style={{ accentColor: "#2d5016" }} />
                <div className="flex gap-2 mt-2">
                  {[0, 25, 50, 75, 100].map(v => (
                    <button key={v} type="button" onClick={() => setForm(f => ({ ...f, paidPercent: v }))}
                      className="flex-1 py-1.5 rounded-lg" style={{ background: form.paidPercent === v ? "#1a2e14" : "#ede8df", color: form.paidPercent === v ? "#f7f4ef" : "#7a7060", fontSize: "0.72rem", fontFamily: "'DM Mono', monospace" }}>
                      {v}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 5. Observações */}
          <section>
            <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Observações gerais</label>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
          </section>

          {/* Resumo */}
          {selectedPkg && (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid rgba(44,35,18,0.1)" }}>
              <div style={{ background: "#f0ead8", padding: "12px 16px" }}>
                <div style={{ fontSize: "0.7rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Resumo</div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between" style={{ fontSize: "0.85rem" }}>
                    <span style={{ color: "#7a7060" }}>{selectedPkg.name}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", color: "#1c1a17" }}>R$ {form.packageValue}</span>
                  </div>
                  {form.optionals.map(opt => {
                    const svc = availableServices.find(s => s.id === opt.id);
                    if (!svc) return null;
                    return (
                      <div key={opt.id} className="flex justify-between" style={{ fontSize: "0.82rem" }}>
                        <span style={{ color: "#7a7060" }}>+ {svc.name}{opt.qty > 1 ? ` ×${opt.qty}` : ""}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", color: "#1c1a17" }}>R$ {svc.value * opt.qty}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="px-4 py-3" style={{ background: "#1a2e14" }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "0.82rem", color: "rgba(247,244,239,0.6)" }}>Valor Total</span>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#d4a84b", fontWeight: 700 }}>R$ {finalValue.toLocaleString("pt-BR")}</div>
                </div>
                {form.paidPercent > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <span style={{ fontSize: "0.72rem", color: "rgba(247,244,239,0.45)" }}>Pago ({form.paidPercent}%)</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.82rem", color: "#4a9e4a" }}>R$ {paidAmount.toLocaleString("pt-BR")}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && <div className="px-3 py-2.5 rounded-xl" style={{ background: "#b9323212", color: "#b93232", fontSize: "0.82rem" }}>{error}</div>}
        </div>

        <div className="px-5 md:px-6 py-4 border-t flex gap-3 flex-shrink-0" style={{ borderColor: "rgba(44,35,18,0.08)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl" style={{ background: "#ede8df", fontSize: "0.875rem" }}>Cancelar</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem", fontWeight: 500 }}>
            {reservation ? "Salvar" : "Confirmar Reserva"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export function ReservationsPage({ store }: { store: Store }) {
  const { reservations, checkinReservation, checkoutReservation, deleteReservation, cancelReservation, updateReservation } = store;
  const [tab, setTab] = useState<"list" | "calendar">("list");
  const [modal, setModal] = useState<Reservation | null | "new">(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "todos">("todos");
  const [calDate, setCalDate] = useState(new Date(2026, 5, 1));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const filtered = reservations.filter(r =>
    (statusFilter === "todos" || r.status === statusFilter) &&
    (r.guest.toLowerCase().includes(search.toLowerCase()) ||
      r.accommodationName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()))
  );

  const selected = reservations.find(r => r.id === selectedId) || null;

  function getResForDay(day: number) {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return reservations.filter(r => r.status !== "cancelado" && r.status !== "concluído" && ds >= r.checkin && ds < r.checkout);
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {modal !== null && (
        <ReservationModal store={store} reservation={modal === "new" ? undefined : modal} onClose={() => setModal(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#1a2e14", fontWeight: 600 }}>Gestão de Reservas</h1>
          <p style={{ fontSize: "0.8rem", color: "#7a7060" }}>{reservations.length} reservas registradas</p>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem", fontWeight: 500 }}>
          <Plus size={16} /> <span className="hidden sm:inline">Nova Reserva</span><span className="sm:hidden">Nova</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#ede8df" }}>
            {(["list", "calendar"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className="px-3 py-1.5 rounded-lg" style={{ background: tab === t ? "#fdfaf5" : "transparent", fontSize: "0.82rem", color: tab === t ? "#1c1a17" : "#7a7060", fontWeight: tab === t ? 500 : 400 }}>
                {t === "list" ? "Lista" : "Calendário"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-40" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
            <Search size={14} style={{ color: "#7a7060" }} />
            <input placeholder="Buscar hóspede, acomodação…" value={search} onChange={e => setSearch(e.target.value)} className="flex-1 outline-none bg-transparent" style={{ fontSize: "0.82rem", color: "#1c1a17", minWidth: 0 }} />
          </div>
        </div>
        {/* Status filter chips — wrap on mobile */}
        <div className="flex gap-1 flex-wrap p-1 rounded-xl" style={{ background: "#ede8df" }}>
          {(["todos", "hospedado", "confirmado", "pendente", "concluído", "cancelado"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className="px-2.5 py-1 rounded-lg" style={{ background: statusFilter === s ? "#fdfaf5" : "transparent", fontSize: "0.72rem", color: statusFilter === s ? "#1c1a17" : "#7a7060" }}>
              {s === "todos" ? "Todos" : STATUS_CFG[s as ReservationStatus]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {tab === "list" ? (
        <>
          {/* Mobile card list */}
          <div className="flex flex-col gap-2 md:hidden">
            {filtered.map(r => (
              <div key={r.id} onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
                className="rounded-2xl p-4 cursor-pointer"
                style={{ background: selectedId === r.id ? "#f0ead8" : "#fdfaf5", border: `1px solid ${selectedId === r.id ? "rgba(44,35,18,0.15)" : "rgba(44,35,18,0.07)"}` }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 mr-2">
                    <div style={{ fontSize: "0.925rem", color: "#1c1a17", fontWeight: 600 }}>{r.guest}</div>
                    <div style={{ fontSize: "0.75rem", color: "#7a7060" }}>{r.phone}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontSize: "0.65rem", background: STATUS_CFG[r.status].bg, color: STATUS_CFG[r.status].text, fontWeight: 700, textTransform: "uppercase" }}>
                    {STATUS_CFG[r.status].label}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#1a2e14", fontWeight: 500, marginBottom: 6 }}>{r.accommodationName}</div>
                <div className="flex items-center gap-3 flex-wrap" style={{ fontSize: "0.75rem", color: "#7a7060" }}>
                  <span>⬐ {fmtShort(r.checkin)}{r.checkinTime ? " " + r.checkinTime : ""}</span>
                  <span>→ {fmtShort(r.checkout)}{r.checkoutTime ? " " + r.checkoutTime : ""}</span>
                  {r.packageName && <span className="px-1.5 py-0.5 rounded-full" style={{ background: "#1a2e1410", color: "#1a2e14", fontSize: "0.65rem" }}>{r.packageName}</span>}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.925rem", color: "#2d5016", fontWeight: 700 }}>R$ {r.value.toLocaleString("pt-BR")}</div>
                    {(r.paidPercent ?? 0) > 0 && (
                      <div style={{ fontSize: "0.68rem", color: (r.paidPercent ?? 0) >= 100 ? "#2d5016" : "#c4882a" }}>Pago: {r.paidPercent}%</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={e => { e.stopPropagation(); setModal(r); }} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#2d501615", color: "#2d5016" }}><Edit2 size={13} /></button>
                    <button onClick={e => { e.stopPropagation(); deleteReservation(r.id, r.guest, r.accommodationName); if (selectedId === r.id) setSelectedId(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#b9323215", color: "#b93232" }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-10 text-center rounded-2xl" style={{ background: "#fdfaf5", fontSize: "0.875rem", color: "#7a7060" }}>Nenhuma reserva encontrada</div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#f0ead8", borderBottom: "1px solid rgba(44,35,18,0.07)" }}>
                    {["Hóspede", "Acomodação", "Check-in", "Check-out", "Pacote", "Opcionais", "Valor Total", "% Pago", "Status", ""].map(h => (
                      <th key={h} className="px-3 py-3 text-left" style={{ fontSize: "0.67rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} onClick={() => setSelectedId(r.id === selectedId ? null : r.id)} className="cursor-pointer" style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(44,35,18,0.05)" : "none", background: selectedId === r.id ? "#f0ead8" : "transparent" }}>
                      <td className="px-3 py-3">
                        <div style={{ fontSize: "0.875rem", color: "#1c1a17", fontWeight: 500 }}>{r.guest}</div>
                        <div style={{ fontSize: "0.72rem", color: "#7a7060" }}>{r.phone}</div>
                      </td>
                      <td className="px-3 py-3" style={{ fontSize: "0.8rem", color: "#7a7060", whiteSpace: "nowrap" }}>{r.accommodationName}</td>
                      <td className="px-3 py-3">
                        <div style={{ fontSize: "0.78rem", fontFamily: "'DM Mono', monospace", color: "#1c1a17", whiteSpace: "nowrap" }}>{fmt(r.checkin)}</div>
                        {r.checkinTime && <div style={{ fontSize: "0.68rem", color: "#7a7060" }}>{r.checkinTime}</div>}
                      </td>
                      <td className="px-3 py-3">
                        <div style={{ fontSize: "0.78rem", fontFamily: "'DM Mono', monospace", color: "#1c1a17", whiteSpace: "nowrap" }}>{fmt(r.checkout)}</div>
                        {r.checkoutTime && <div style={{ fontSize: "0.68rem", color: "#7a7060" }}>{r.checkoutTime}</div>}
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.67rem", background: "#1a2e1412", color: "#1a2e14", fontWeight: 500, whiteSpace: "nowrap" }}>{r.packageName || "—"}</span>
                      </td>
                      <td className="px-3 py-3" style={{ fontSize: "0.75rem", color: "#7a7060" }}>{(r.optionals?.length || 0) > 0 ? `${r.optionals.length} item` : "—"}</td>
                      <td className="px-3 py-3">
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", color: "#2d5016", fontWeight: 600, whiteSpace: "nowrap" }}>R$ {r.value.toLocaleString("pt-BR")}</div>
                      </td>
                      <td className="px-3 py-3">
                        {(r.paidPercent ?? 0) > 0 ? (
                          <div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: (r.paidPercent ?? 0) >= 100 ? "#2d5016" : "#c4882a", fontWeight: 600 }}>{r.paidPercent}%</div>
                            <div className="w-14 h-1 rounded-full mt-1" style={{ background: "#ede8df" }}>
                              <div className="h-full rounded-full" style={{ width: `${r.paidPercent}%`, background: (r.paidPercent ?? 0) >= 100 ? "#2d5016" : "#c4882a" }} />
                            </div>
                          </div>
                        ) : <span style={{ fontSize: "0.72rem", color: "#b93232" }}>Não pago</span>}
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2.5 py-1 rounded-full" style={{ fontSize: "0.65rem", background: STATUS_CFG[r.status].bg, color: STATUS_CFG[r.status].text, fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                          {STATUS_CFG[r.status].label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={e => { e.stopPropagation(); setModal(r); }} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#2d501615", color: "#2d5016" }}><Edit2 size={12} /></button>
                          <button onClick={e => { e.stopPropagation(); deleteReservation(r.id, r.guest, r.accommodationName); if (selectedId === r.id) setSelectedId(null); }} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#b9323215", color: "#b93232" }}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={10} className="px-5 py-10 text-center" style={{ fontSize: "0.875rem", color: "#7a7060" }}>Nenhuma reserva encontrada</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl p-4 md:p-5" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>{MONTHS[month]} {year}</h3>
            <div className="flex gap-2">
              <button onClick={() => setCalDate(new Date(year, month - 1, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ede8df" }}><ChevronLeft size={15} /></button>
              <button onClick={() => setCalDate(new Date(year, month + 1, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ede8df" }}><ChevronRight size={15} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["D","S","T","Q","Q","S","S"].map((d, i) => (
              <div key={i} className="text-center py-1" style={{ fontSize: "0.65rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase" }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayRes = getResForDay(day);
              const isToday = day === 4 && month === 5 && year === 2026;
              return (
                <div key={day} className="rounded-lg p-1 min-h-10 md:min-h-14 md:rounded-xl" style={{ background: isToday ? "#1a2e1415" : "#f0ead8", border: isToday ? "1.5px solid #1a2e14" : "1px solid transparent" }}>
                  <span style={{ fontSize: "0.7rem", color: isToday ? "#1a2e14" : "#7a7060", fontWeight: isToday ? 600 : 400 }}>{day}</span>
                  {dayRes.slice(0, 2).map(r => (
                    <div key={r.id} onClick={() => setSelectedId(r.id)} className="rounded px-1 py-0.5 mt-0.5 truncate cursor-pointer" style={{ fontSize: "0.55rem", background: STATUS_CFG[r.status].bg, color: STATUS_CFG[r.status].text }}>
                      {r.accommodationName.replace("Cabana ", "").replace("Chalé ", "").replace("Suite ", "").replace("Flutuante ", "")}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(10,18,7,0.35)" }}
            onClick={() => setSelectedId(null)}
          />
          {/* Panel: bottom sheet on mobile, right sidebar on md+ */}
          <div
            className="fixed z-50 flex flex-col inset-x-0 bottom-0 w-full rounded-t-[20px] max-h-[82vh] md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:w-80 md:rounded-none md:max-h-none"
            style={{ background: "#fdfaf5", borderTop: "1px solid rgba(44,35,18,0.1)", boxShadow: "0 -8px 40px rgba(0,0,0,0.18)" }}
          >
              <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "rgba(44,35,18,0.08)" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>{selected.accommodationName}</h3>
                <button onClick={() => setSelectedId(null)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#ede8df" }}><X size={13} /></button>
              </div>
              <div className="flex-1 px-5 py-4 overflow-y-auto flex flex-col gap-3">
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: "#1a2e14" }}>{selected.guest}</div>
                  <div style={{ fontSize: "0.8rem", color: "#7a7060" }}>{selected.phone}</div>
                  {selected.email && <div style={{ fontSize: "0.75rem", color: "#7a7060" }}>{selected.email}</div>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { l: "Check-in", v: `${fmt(selected.checkin)}${selected.checkinTime ? " " + selected.checkinTime : ""}` },
                    { l: "Check-out", v: `${fmt(selected.checkout)}${selected.checkoutTime ? " " + selected.checkoutTime : ""}` },
                    { l: "Hóspedes", v: `${selected.guests}` },
                    { l: "Forma de pagamento", v: selected.paymentMethod + (selected.paymentMethod2 ? ` + ${selected.paymentMethod2}` : "") },
                  ].map(({ l, v }) => (
                    <div key={l} className="p-2.5 rounded-xl" style={{ background: "#f0ead8", gridColumn: l === "Forma de pagamento" ? "1/-1" : undefined }}>
                      <div style={{ fontSize: "0.62rem", color: "#7a7060", textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</div>
                      <div style={{ fontSize: "0.8rem", color: "#1c1a17", fontWeight: 500, marginTop: 1 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {selected.packageName && (
                  <div className="p-3 rounded-xl" style={{ background: "#1a2e1410", border: "1px solid #1a2e1420" }}>
                    <div style={{ fontSize: "0.62rem", color: "#7a7060", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Pacote</div>
                    <div style={{ fontSize: "0.9rem", color: "#1a2e14", fontWeight: 600 }}>{selected.packageName}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.82rem", color: "#2d5016" }}>R$ {(selected.packageValue || 0).toLocaleString("pt-BR")}</div>
                  </div>
                )}
                {(selected.optionals?.length || 0) > 0 && (
                  <div>
                    <div style={{ fontSize: "0.62rem", color: "#7a7060", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Opcionais</div>
                    <div className="flex flex-col gap-1.5">
                      {selected.optionals.map(opt => (
                        <div key={opt.id} className="flex justify-between px-3 py-2 rounded-lg" style={{ background: "#f0ead8", fontSize: "0.82rem" }}>
                          <span style={{ color: "#1c1a17" }}>{opt.name}{opt.quantity > 1 ? ` ×${opt.quantity}` : ""}</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", color: "#2d5016" }}>+R$ {opt.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(44,35,18,0.1)" }}>
                  <div className="flex items-center justify-between px-3 py-2.5" style={{ background: "#1a2e14" }}>
                    <span style={{ fontSize: "0.82rem", color: "rgba(247,244,239,0.6)" }}>Valor Total</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "1rem", color: "#d4a84b", fontWeight: 700 }}>R$ {selected.value.toLocaleString("pt-BR")}</span>
                  </div>
                  {(selected.paidPercent ?? 0) > 0 && (
                    <div className="px-3 py-2" style={{ background: "#f0ead8" }}>
                      <div className="flex justify-between mb-1" style={{ fontSize: "0.75rem" }}>
                        <span style={{ color: "#7a7060" }}>Pago ({selected.paidPercent}%)</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", color: "#2d5016", fontWeight: 600 }}>R$ {Math.round(selected.value * (selected.paidPercent ?? 0) / 100).toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: "#ede8df" }}>
                        <div className="h-full rounded-full" style={{ width: `${selected.paidPercent}%`, background: (selected.paidPercent ?? 0) >= 100 ? "#2d5016" : "#c4882a" }} />
                      </div>
                    </div>
                  )}
                </div>
                <span className="px-3 py-1.5 rounded-full w-fit" style={{ fontSize: "0.72rem", background: STATUS_CFG[selected.status].bg, color: STATUS_CFG[selected.status].text, fontWeight: 600, textTransform: "uppercase" }}>
                  {STATUS_CFG[selected.status].label}
                </span>
                {selected.notes && <div className="p-3 rounded-xl" style={{ background: "#f0ead8", fontSize: "0.82rem", color: "#7a7060" }}>{selected.notes}</div>}
              </div>
              <div className="px-5 pb-5 pt-3 flex flex-col gap-2 border-t flex-shrink-0" style={{ borderColor: "rgba(44,35,18,0.06)" }}>
                {selected.status === "pendente" && (
                  <button onClick={() => updateReservation(selected.id, { status: "confirmado" })} className="w-full py-2.5 rounded-xl" style={{ background: "#2d5016", color: "#f7f4ef", fontSize: "0.875rem" }}>✓ Confirmar</button>
                )}
                {selected.status === "confirmado" && (
                  <button onClick={() => checkinReservation(selected.id, selected.guest, selected.accommodationName, selected.accommodationId)} className="w-full py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem" }}>✓ Fazer Check-in</button>
                )}
                {selected.status === "hospedado" && (
                  <button onClick={() => checkoutReservation(selected.id, selected.guest, selected.accommodationName, selected.accommodationId)} className="w-full py-2.5 rounded-xl" style={{ background: "#1e5f74", color: "#f7f4ef", fontSize: "0.875rem" }}>✓ Checkout → Concluído</button>
                )}
                <button onClick={() => setModal(selected)} className="w-full py-2.5 rounded-xl" style={{ background: "#ede8df", fontSize: "0.875rem", color: "#1c1a17" }}>✎ Editar</button>
                {selected.status !== "cancelado" && selected.status !== "concluído" && (
                  <button onClick={() => { cancelReservation(selected.id, selected.accommodationId, selected.guest, selected.accommodationName); setSelectedId(null); }} className="w-full py-2.5 rounded-xl" style={{ background: "#b9323215", color: "#b93232", fontSize: "0.875rem" }}>Cancelar Reserva</button>
                )}
              </div>
            </div>
          </>
        )}
    </div>
  );
}
