import { useState, useCallback } from "react";

export type ReservationStatus = "confirmado" | "pendente" | "cancelado" | "hospedado";

export interface Reservation {
  id: string;
  guest: string;
  phone: string;
  email: string;
  roomId: string;
  roomName: string;
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  value: number;
  guests: number;
  status: ReservationStatus;
  createdAt: string;
  notes: string;
}

export interface Room {
  id: string;
  name: string;
  type: "Chalé" | "Suíte" | "Standard";
  capacity: number;
  price: number;
  amenities: string[];
  image: string;
  description: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: string;
  type: "receita" | "despesa";
  value: number;
  method: string;
  reservationId?: string;
  createdAt: string;
}

export type HistoryType = "reservation" | "finance" | "room" | "system";

export interface HistoryEntry {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: HistoryType;
  entityId?: string;
}

// ─── Default seed data ────────────────────────────────────────────────────────

const DEFAULT_ROOMS: Room[] = [
  { id: "CH01", name: "Chalé 01", type: "Chalé", capacity: 4, price: 460, amenities: ["wifi", "ar-cond", "café"], image: "https://images.unsplash.com/photo-1537622417195-e1ef8ce041e7?w=600&h=400&fit=crop&auto=format", description: "Chalé espaçoso com varanda e vista para a mata." },
  { id: "CH02", name: "Chalé 02", type: "Chalé", capacity: 4, price: 460, amenities: ["wifi", "ar-cond", "café"], image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&h=400&fit=crop&auto=format", description: "Chalé aconchegante com lareira e deck privativo." },
  { id: "CH03", name: "Chalé 03", type: "Chalé", capacity: 4, price: 540, amenities: ["wifi", "ar-cond", "café"], image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&h=400&fit=crop&auto=format", description: "Chalé premium com hidromassagem externa." },
  { id: "CH04", name: "Chalé 04", type: "Chalé", capacity: 2, price: 420, amenities: ["wifi", "café"], image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=400&fit=crop&auto=format", description: "Chalé romântico ideal para casais." },
  { id: "SU01", name: "Suíte 01", type: "Suíte", capacity: 2, price: 680, amenities: ["wifi", "ar-cond", "café"], image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&auto=format", description: "Suíte luxuosa com cama king e banheira." },
  { id: "SU02", name: "Suíte 02", type: "Suíte", capacity: 2, price: 700, amenities: ["wifi", "ar-cond", "café"], image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop&auto=format", description: "Suíte master com vista panorâmica." },
  { id: "SU03", name: "Suíte 03", type: "Suíte", capacity: 2, price: 700, amenities: ["wifi", "ar-cond"], image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop&auto=format", description: "Suíte executiva com escritório integrado." },
  { id: "ST01", name: "Standard 01", type: "Standard", capacity: 2, price: 280, amenities: ["wifi"], image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&h=400&fit=crop&auto=format", description: "Quarto confortável com tudo o que você precisa." },
  { id: "ST02", name: "Standard 02", type: "Standard", capacity: 2, price: 280, amenities: ["wifi"], image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop&auto=format", description: "Quarto padrão com cama de casal." },
  { id: "ST03", name: "Standard 03", type: "Standard", capacity: 3, price: 320, amenities: ["wifi", "ar-cond"], image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop&auto=format", description: "Quarto triplo espaçoso." },
];

const DEFAULT_RESERVATIONS: Reservation[] = [
  { id: "R-2401", guest: "Carolina Ferreira", phone: "(11) 99421-3302", email: "carolina@email.com", roomId: "CH04", roomName: "Chalé 04", checkin: "2026-06-04", checkout: "2026-06-07", value: 1260, guests: 2, status: "hospedado", createdAt: "2026-05-20T10:30:00Z", notes: "" },
  { id: "R-2402", guest: "Marcos Oliveira", phone: "(21) 98734-5521", email: "marcos@email.com", roomId: "SU02", roomName: "Suíte 02", checkin: "2026-06-05", checkout: "2026-06-08", value: 2100, guests: 2, status: "confirmado", createdAt: "2026-05-22T14:00:00Z", notes: "" },
  { id: "R-2403", guest: "Ana Beatriz Lima", phone: "(31) 97654-2211", email: "ana@email.com", roomId: "ST01", roomName: "Standard 01", checkin: "2026-06-06", checkout: "2026-06-09", value: 840, guests: 1, status: "confirmado", createdAt: "2026-05-28T09:15:00Z", notes: "" },
  { id: "R-2404", guest: "Roberto Santos", phone: "(11) 96543-8870", email: "roberto@email.com", roomId: "CH01", roomName: "Chalé 01", checkin: "2026-06-07", checkout: "2026-06-10", value: 1380, guests: 3, status: "confirmado", createdAt: "2026-05-30T16:45:00Z", notes: "" },
  { id: "R-2405", guest: "Juliana Costa", phone: "(41) 95432-1198", email: "juliana@email.com", roomId: "SU03", roomName: "Suíte 03", checkin: "2026-06-08", checkout: "2026-06-12", value: 2800, guests: 2, status: "pendente", createdAt: "2026-06-01T11:00:00Z", notes: "" },
  { id: "R-2406", guest: "Fernando Alves", phone: "(51) 94321-0077", email: "fernando@email.com", roomId: "ST03", roomName: "Standard 03", checkin: "2026-06-10", checkout: "2026-06-13", value: 900, guests: 2, status: "confirmado", createdAt: "2026-06-02T08:30:00Z", notes: "" },
  { id: "R-2407", guest: "Patrícia Mendes", phone: "(71) 93210-9966", email: "patricia@email.com", roomId: "CH03", roomName: "Chalé 03", checkin: "2026-06-12", checkout: "2026-06-15", value: 1620, guests: 2, status: "confirmado", createdAt: "2026-06-03T15:20:00Z", notes: "" },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: "T-501", date: "2026-06-04", description: "Hospedagem - Chalé 04 (C. Ferreira)", category: "Hospedagem", type: "receita", value: 1260, method: "Cartão", reservationId: "R-2401", createdAt: "2026-06-04T10:00:00Z" },
  { id: "T-502", date: "2026-06-04", description: "Fornecedor - Alimentos e Bebidas", category: "Alimentação", type: "despesa", value: 1840, method: "Pix", createdAt: "2026-06-04T11:00:00Z" },
  { id: "T-503", date: "2026-06-03", description: "Hospedagem - Suite 01 (P. Braga)", category: "Hospedagem", type: "receita", value: 2100, method: "Pix", createdAt: "2026-06-03T09:00:00Z" },
  { id: "T-504", date: "2026-06-03", description: "Conta de energia elétrica", category: "Utilidades", type: "despesa", value: 2340, method: "Débito", createdAt: "2026-06-03T10:00:00Z" },
  { id: "T-505", date: "2026-06-02", description: "Reserva antecipada - Chalé 03", category: "Hospedagem", type: "receita", value: 810, method: "Pix", createdAt: "2026-06-02T14:00:00Z" },
  { id: "T-506", date: "2026-06-02", description: "Limpeza e conservação", category: "Manutenção", type: "despesa", value: 680, method: "Dinheiro", createdAt: "2026-06-02T15:00:00Z" },
  { id: "T-507", date: "2026-06-01", description: "Eventos - Casamento Silva", category: "Eventos", type: "receita", value: 8500, method: "Transferência", createdAt: "2026-06-01T08:00:00Z" },
  { id: "T-508", date: "2026-06-01", description: "Salários - Junho 2026", category: "Pessoal", type: "despesa", value: 5200, method: "Transferência", createdAt: "2026-06-01T09:00:00Z" },
];

const DEFAULT_HISTORY: HistoryEntry[] = [
  { id: "H-001", action: "Reserva criada", description: "Carolina Ferreira — Chalé 04 (04/06 → 07/06)", timestamp: "2026-05-20T10:30:00Z", type: "reservation", entityId: "R-2401" },
  { id: "H-002", action: "Reserva criada", description: "Marcos Oliveira — Suíte 02 (05/06 → 08/06)", timestamp: "2026-05-22T14:00:00Z", type: "reservation", entityId: "R-2402" },
  { id: "H-003", action: "Pagamento registrado", description: "Receita R$ 1.260 — Hospedagem Chalé 04", timestamp: "2026-06-04T10:00:00Z", type: "finance", entityId: "T-501" },
  { id: "H-004", action: "Check-in realizado", description: "Carolina Ferreira — Chalé 04", timestamp: "2026-06-04T12:00:00Z", type: "reservation", entityId: "R-2401" },
  { id: "H-005", action: "Despesa registrada", description: "Fornecedor Alimentos R$ 1.840", timestamp: "2026-06-04T11:00:00Z", type: "finance", entityId: "T-502" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ─── Check if a room is available for a date range ───────────────────────────

export function isRoomAvailable(
  roomId: string,
  checkin: string,
  checkout: string,
  reservations: Reservation[],
  excludeId?: string
): boolean {
  const ci = new Date(checkin).getTime();
  const co = new Date(checkout).getTime();
  return !reservations.some(r => {
    if (r.roomId !== roomId) return false;
    if (r.id === excludeId) return false;
    if (r.status === "cancelado") return false;
    const rci = new Date(r.checkin).getTime();
    const rco = new Date(r.checkout).getTime();
    return ci < rco && co > rci;
  });
}

/** Returns all dates (YYYY-MM-DD) blocked for a room */
export function getBlockedDates(roomId: string, reservations: Reservation[]): string[] {
  const blocked: string[] = [];
  reservations.forEach(r => {
    if (r.roomId !== roomId || r.status === "cancelado") return;
    const ci = new Date(r.checkin);
    const co = new Date(r.checkout);
    const cur = new Date(ci);
    while (cur < co) {
      blocked.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
  });
  return blocked;
}

// ─── Store hook ───────────────────────────────────────────────────────────────

export function useStore() {
  const [rooms] = useState<Room[]>(() => {
    const stored = load<Room[] | null>("tribo_rooms", null);
    if (!stored) {
      save("tribo_rooms", DEFAULT_ROOMS);
      return DEFAULT_ROOMS;
    }
    return stored;
  });

  const [reservations, setReservationsRaw] = useState<Reservation[]>(() => {
    const stored = load<Reservation[] | null>("tribo_reservations", null);
    if (!stored) {
      save("tribo_reservations", DEFAULT_RESERVATIONS);
      return DEFAULT_RESERVATIONS;
    }
    return stored;
  });

  const [transactions, setTransactionsRaw] = useState<Transaction[]>(() => {
    const stored = load<Transaction[] | null>("tribo_transactions", null);
    if (!stored) {
      save("tribo_transactions", DEFAULT_TRANSACTIONS);
      return DEFAULT_TRANSACTIONS;
    }
    return stored;
  });

  const [history, setHistoryRaw] = useState<HistoryEntry[]>(() => {
    const stored = load<HistoryEntry[] | null>("tribo_history", null);
    if (!stored) {
      save("tribo_history", DEFAULT_HISTORY);
      return DEFAULT_HISTORY;
    }
    return stored;
  });

  const addHistory = useCallback((entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: generateId("H"),
      timestamp: new Date().toISOString(),
    };
    setHistoryRaw(prev => {
      const updated = [newEntry, ...prev];
      save("tribo_history", updated);
      return updated;
    });
  }, []);

  const addReservation = useCallback((data: Omit<Reservation, "id" | "createdAt" | "status">) => {
    const reservation: Reservation = {
      ...data,
      id: generateId("R"),
      status: "pendente",
      createdAt: new Date().toISOString(),
    };
    setReservationsRaw(prev => {
      const updated = [reservation, ...prev];
      save("tribo_reservations", updated);
      return updated;
    });
    addHistory({
      action: "Reserva criada",
      description: `${data.guest} — ${data.roomName} (${data.checkin} → ${data.checkout})`,
      type: "reservation",
      entityId: reservation.id,
    });
    return reservation;
  }, [addHistory]);

  const updateReservation = useCallback((id: string, changes: Partial<Reservation>) => {
    setReservationsRaw(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...changes } : r);
      save("tribo_reservations", updated);
      return updated;
    });
  }, []);

  const cancelReservation = useCallback((id: string, guestName: string, roomName: string) => {
    updateReservation(id, { status: "cancelado" });
    addHistory({
      action: "Reserva cancelada",
      description: `${guestName} — ${roomName}`,
      type: "reservation",
      entityId: id,
    });
  }, [updateReservation, addHistory]);

  const checkinReservation = useCallback((id: string, guestName: string, roomName: string) => {
    updateReservation(id, { status: "hospedado" });
    addHistory({
      action: "Check-in realizado",
      description: `${guestName} — ${roomName}`,
      type: "reservation",
      entityId: id,
    });
  }, [updateReservation, addHistory]);

  const checkoutReservation = useCallback((id: string, guestName: string, roomName: string) => {
    updateReservation(id, { status: "confirmado" });
    addHistory({
      action: "Check-out realizado",
      description: `${guestName} — ${roomName}`,
      type: "reservation",
      entityId: id,
    });
  }, [updateReservation, addHistory]);

  const addTransaction = useCallback((data: Omit<Transaction, "id" | "createdAt">) => {
    const tx: Transaction = {
      ...data,
      id: generateId("T"),
      createdAt: new Date().toISOString(),
    };
    setTransactionsRaw(prev => {
      const updated = [tx, ...prev];
      save("tribo_transactions", updated);
      return updated;
    });
    addHistory({
      action: data.type === "receita" ? "Receita registrada" : "Despesa registrada",
      description: `${data.description} — R$ ${data.value.toLocaleString("pt-BR")}`,
      type: "finance",
      entityId: tx.id,
    });
    return tx;
  }, [addHistory]);

  return {
    rooms,
    reservations,
    transactions,
    history,
    addReservation,
    updateReservation,
    cancelReservation,
    checkinReservation,
    checkoutReservation,
    addTransaction,
    addHistory,
  };
}

export type Store = ReturnType<typeof useStore>;
