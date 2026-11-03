import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ReservationStatus = "confirmado" | "pendente" | "cancelado" | "hospedado" | "concluído";
export type AccommodationStatus = "disponível" | "ocupado" | "reservado" | "manutenção";
export type EmployeeStatus = "ativo" | "inativo" | "férias";
export type PromotionType = "percentual" | "valor_fixo";
export type PaymentMethod = "Pix" | "Dinheiro" | "Cartão de Crédito" | "Cartão de Débito" | "Transferência Bancária";

export interface Accommodation {
  id: string;
  name: string;
  type: "Cabana" | "Chalé" | "Suíte" | "Flutuante";
  capacity: number;
  price: number;
  amenities: string[];
  image: string;
  description: string;
  status: AccommodationStatus;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  includes: string[];
  value: number;
  active: boolean;
  createdAt: string;
}

export interface ReservationOptional {
  id: string;
  name: string;
  unitValue: number;
  quantity: number;
  total: number;
  notes: string;
}

export interface Reservation {
  id: string;
  guest: string;
  phone: string;
  email: string;
  accommodationId: string;
  accommodationName: string;
  checkin: string;
  checkout: string;
  checkinTime?: string;
  checkoutTime?: string;
  value: number;
  originalValue: number;
  packageId: string;
  packageName: string;
  packageValue: number;
  optionals: ReservationOptional[];
  discountPercent: number;
  discountAmount: number;
  guests: number;
  status: ReservationStatus;
  paymentMethod: PaymentMethod;
  paymentMethod2?: string;
  paidPercent?: number;
  createdAt: string;
  notes: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  phone: string;
  admissionDate: string;
  status: EmployeeStatus;
  email: string;
}

export interface Service {
  id: string;
  name: string;
  value: number;
  available: boolean;
  description: string;
  category: string;
  hasQuantity?: boolean;
  quantityLabel?: string;
}

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  discount: number;
  validUntil: string;
  rules: string;
  active: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "receita" | "despesa";
  value: number;
  method: PaymentMethod;
  reservationId?: string;
  createdAt: string;
}

export type HistoryType = "reservation" | "finance" | "accommodation" | "employee" | "service" | "system";

export interface HistoryEntry {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: HistoryType;
  entityId?: string;
}

export const EXPENSE_CATEGORIES = [
  "Funcionários", "Compras café da manhã", "Compras jantar",
  "Conta de energia", "Internet", "Manutenção", "Empréstimo",
  "Pagamento flutuante", "Extras", "Outros",
];

export const REVENUE_CATEGORIES = [
  "Diárias da hospedagem", "Venda de artesanatos", "Aluguel flutuante", "Extras",
];

// ─── Default seed data ────────────────────────────────────────────────────────

const DEFAULT_PACKAGES: Package[] = [
  {
    id: "PKG-001",
    name: "Pacote 1",
    description: "Hospedagem + Café da Manhã",
    includes: ["Hospedagem na acomodação escolhida", "Café da manhã completo incluso"],
    value: 500,
    active: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "PKG-002",
    name: "Pacote 2",
    description: "Hospedagem + Café da Manhã + Jantar",
    includes: ["Hospedagem na acomodação escolhida", "Café da manhã completo incluso", "Jantar especial regional incluso"],
    value: 500,
    active: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

const DEFAULT_ACCOMMODATIONS: Accommodation[] = [
  {
    id: "FLU01", name: "Flutuante Tribo", type: "Flutuante", capacity: 2, price: 600,
    amenities: ["wifi", "café", "varanda"],
    image: "https://images.unsplash.com/photo-1766430436660-30af29dfa2a1?w=700&h=480&fit=crop&auto=format",
    description: "Experiência única em acomodação flutuante sobre as águas amazônicas, com deck privativo e vista panorâmica do rio.",
    status: "disponível",
  },
  {
    id: "KAN01", name: "Cabana Kanarô", type: "Cabana", capacity: 4, price: 1300,
    amenities: ["wifi", "café", "varanda", "ar-cond"],
    image: "https://images.unsplash.com/photo-1537622417195-e1ef8ce041e7?w=700&h=480&fit=crop&auto=format",
    description: "Cabana rústica e aconchegante às margens do rio, com varanda privativa e vista para a floresta amazônica.",
    status: "disponível",
  },
  {
    id: "CAI01", name: "Chalé Caiapó", type: "Chalé", capacity: 4, price: 520,
    amenities: ["wifi", "café", "lareira"],
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&h=480&fit=crop&auto=format",
    description: "Chalé tradicional com lareira, deck espaçoso e decoração inspirada na cultura Caiapó do Pará.",
    status: "ocupado",
  },
  {
    id: "KAM01", name: "Chalé Kamaiurá", type: "Chalé", capacity: 3, price: 490,
    amenities: ["wifi", "café"],
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=700&h=480&fit=crop&auto=format",
    description: "Aconchegante chalé para até 3 pessoas com arquitetura inspirada na aldeia Kamaiurá do Alto Xingu.",
    status: "disponível",
  },
  {
    id: "GUA01", name: "Suite Guarani", type: "Suíte", capacity: 2, price: 720,
    amenities: ["wifi", "café", "ar-cond", "banheira"],
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&h=480&fit=crop&auto=format",
    description: "Suíte de luxo com banheira de imersão, vista panorâmica e serviço de quarto exclusivo.",
    status: "disponível",
  },
  {
    id: "TIC01", name: "Suite Ticuna", type: "Suíte", capacity: 2, price: 760,
    amenities: ["wifi", "café", "ar-cond", "hidro", "frigobar"],
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=700&h=480&fit=crop&auto=format",
    description: "Nossa acomodação mais exclusiva com hidromassagem, frigobar premium e terraço privativo com vista para o rio.",
    status: "reservado",
  },
];

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: "E-001", name: "Marcos Tupã Silva", role: "Gerente Geral", salary: 5800, phone: "(92) 99871-3302", admissionDate: "2018-03-15", status: "ativo", email: "marcos@tribo.com" },
  { id: "E-002", name: "Ana Yara Costa", role: "Recepcionista", salary: 2200, phone: "(92) 98732-1100", admissionDate: "2021-06-01", status: "ativo", email: "ana@tribo.com" },
  { id: "E-003", name: "João Kaio Ferreira", role: "Guia Turístico", salary: 2600, phone: "(92) 97654-9988", admissionDate: "2020-01-10", status: "ativo", email: "joao@tribo.com" },
  { id: "E-004", name: "Lara Uiara Mendes", role: "Cozinheira", salary: 2400, phone: "(92) 96543-7765", admissionDate: "2022-04-20", status: "ativo", email: "lara@tribo.com" },
  { id: "E-005", name: "Pedro Araci Neto", role: "Manutenção", salary: 2100, phone: "(92) 95432-6654", admissionDate: "2019-11-05", status: "férias", email: "pedro@tribo.com" },
  { id: "E-006", name: "Sofia Iara Braga", role: "Camareira", salary: 1900, phone: "(92) 94321-5543", admissionDate: "2023-02-14", status: "ativo", email: "sofia@tribo.com" },
];

const DEFAULT_SERVICES: Service[] = [
  { id: "SRV-001", name: "Passeios", value: 40, available: true, description: "Passeios pelos arredores da pousada — trilhas, canoa e observação da fauna amazônica. Valor por casal.", category: "Passeios", hasQuantity: false, quantityLabel: "casal" },
  { id: "SRV-002", name: "Decoração Romântica", value: 150, available: true, description: "Decoração especial do quarto com pétalas de flores, velas e arranjos florais regionais.", category: "Decoração", hasQuantity: false, quantityLabel: "serviço" },
  { id: "SRV-003", name: "Massagem Terapêutica", value: 120, available: true, description: "Sessão de massagem relaxante com óleos essenciais amazônicos. Cobrado por pessoa.", category: "Bem-estar", hasQuantity: true, quantityLabel: "pessoa" },
  { id: "SRV-004", name: "Escalda Pés", value: 30, available: true, description: "Escalda pés com ervas medicinais e aromaterapia da flora amazônica.", category: "Bem-estar", hasQuantity: false, quantityLabel: "serviço" },
  { id: "SRV-005", name: "Café da Manhã", value: 45, available: true, description: "Café da manhã completo com produtos regionais amazônicos, frutas frescas e pães artesanais.", category: "Alimentação", hasQuantity: true, quantityLabel: "pessoa" },
  { id: "SRV-006", name: "Jantar", value: 80, available: true, description: "Jantar especial com culinária regional amazônica, incluindo pratos típicos e sobremesas da floresta.", category: "Alimentação", hasQuantity: true, quantityLabel: "pessoa" },
];

const DEFAULT_PROMOTIONS: Promotion[] = [
  { id: "P-001", name: "Semana Verde", type: "percentual", discount: 15, validUntil: "2026-07-15", rules: "Válido para check-in de segunda a quinta. Mínimo 2 noites.", active: true, createdAt: "2026-05-15T00:00:00Z" },
];

const EMPTY_RES_FIELDS = {
  packageId: "PKG-001", packageName: "Pacote 1", packageValue: 500,
  optionals: [] as ReservationOptional[], discountPercent: 0, discountAmount: 0, originalValue: 500,
  paidPercent: 0,
};

const DEFAULT_RESERVATIONS: Reservation[] = [
  { id: "R-2401", guest: "Carolina Ferreira", phone: "(11) 99421-3302", email: "carolina@email.com", accommodationId: "CAI01", accommodationName: "Chalé Caiapó", checkin: "2026-06-04", checkout: "2026-06-07", checkinTime: "14:00", checkoutTime: "12:00", value: 1500, ...EMPTY_RES_FIELDS, guests: 2, status: "hospedado", paymentMethod: "Cartão de Crédito", createdAt: "2026-05-20T10:30:00Z", notes: "" },
  { id: "R-2402", guest: "Marcos Oliveira", phone: "(21) 98734-5521", email: "marcos@email.com", accommodationId: "TIC01", accommodationName: "Suite Ticuna", checkin: "2026-06-05", checkout: "2026-06-08", checkinTime: "15:00", checkoutTime: "11:00", value: 650, packageId: "PKG-002", packageName: "Pacote 2", packageValue: 500, optionals: [{ id: "SRV-002", name: "Decoração Romântica", unitValue: 150, quantity: 1, total: 150, notes: "" }], discountPercent: 0, discountAmount: 0, originalValue: 650, paidPercent: 50, guests: 2, status: "confirmado", paymentMethod: "Pix", createdAt: "2026-05-22T14:00:00Z", notes: "" },
  { id: "R-2403", guest: "Ana Beatriz Lima", phone: "(31) 97654-2211", email: "ana@email.com", accommodationId: "KAM01", accommodationName: "Chalé Kamaiurá", checkin: "2026-06-06", checkout: "2026-06-09", value: 500, ...EMPTY_RES_FIELDS, guests: 1, status: "confirmado", paymentMethod: "Transferência Bancária", createdAt: "2026-05-28T09:15:00Z", notes: "" },
  { id: "R-2404", guest: "Roberto Santos", phone: "(11) 96543-8870", email: "roberto@email.com", accommodationId: "KAN01", accommodationName: "Cabana Kanarô", checkin: "2026-06-07", checkout: "2026-06-10", value: 540, packageId: "PKG-001", packageName: "Pacote 1", packageValue: 500, optionals: [{ id: "SRV-001", name: "Passeios", unitValue: 40, quantity: 1, total: 40, notes: "" }], discountPercent: 0, discountAmount: 0, originalValue: 540, paidPercent: 100, guests: 3, status: "confirmado", paymentMethod: "Dinheiro", createdAt: "2026-05-30T16:45:00Z", notes: "" },
  { id: "R-2405", guest: "Juliana Costa", phone: "(41) 95432-1198", email: "juliana@email.com", accommodationId: "GUA01", accommodationName: "Suite Guarani", checkin: "2026-06-08", checkout: "2026-06-12", value: 500, ...{ packageId: "PKG-002", packageName: "Pacote 2", packageValue: 500, optionals: [] as ReservationOptional[], discountPercent: 0, discountAmount: 0, originalValue: 500, paidPercent: 0 }, guests: 2, status: "pendente", paymentMethod: "Cartão de Débito", createdAt: "2026-06-01T11:00:00Z", notes: "" },
  { id: "R-2406", guest: "Fernando Alves", phone: "(51) 94321-0077", email: "fernando@email.com", accommodationId: "KAM01", accommodationName: "Chalé Kamaiurá", checkin: "2026-06-10", checkout: "2026-06-13", value: 500, ...EMPTY_RES_FIELDS, guests: 2, status: "confirmado", paymentMethod: "Pix", createdAt: "2026-06-02T08:30:00Z", notes: "" },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: "T-501", date: "2026-06-04", description: "Diária - Chalé Caiapó (C. Ferreira)", category: "Diárias da hospedagem", type: "receita", value: 1500, method: "Cartão de Crédito", reservationId: "R-2401", createdAt: "2026-06-04T10:00:00Z" },
  { id: "T-502", date: "2026-06-04", description: "Compras café da manhã — Mercado Central", category: "Compras café da manhã", type: "despesa", value: 840, method: "Pix", createdAt: "2026-06-04T08:00:00Z" },
  { id: "T-503", date: "2026-06-03", description: "Diária - Suite Ticuna (M. Oliveira)", category: "Diárias da hospedagem", type: "receita", value: 1620, method: "Pix", createdAt: "2026-06-03T09:00:00Z" },
  { id: "T-504", date: "2026-06-03", description: "Conta de energia — Junho", category: "Conta de energia", type: "despesa", value: 1240, method: "Transferência Bancária", createdAt: "2026-06-03T10:00:00Z" },
  { id: "T-505", date: "2026-06-02", description: "Venda artesanato indígena", category: "Venda de artesanatos", type: "receita", value: 380, method: "Dinheiro", createdAt: "2026-06-02T14:00:00Z" },
  { id: "T-506", date: "2026-06-02", description: "Manutenção deck Chalé Kamaiurá", category: "Manutenção", type: "despesa", value: 650, method: "Dinheiro", createdAt: "2026-06-02T15:00:00Z" },
  { id: "T-507", date: "2026-06-01", description: "Aluguel flutuante — Evento de pesca", category: "Aluguel flutuante", type: "receita", value: 1800, method: "Transferência Bancária", createdAt: "2026-06-01T08:00:00Z" },
  { id: "T-508", date: "2026-06-01", description: "Salários — Junho 2026", category: "Funcionários", type: "despesa", value: 17000, method: "Transferência Bancária", createdAt: "2026-06-01T09:00:00Z" },
  { id: "T-509", date: "2026-05-31", description: "Compras jantar — Insumos", category: "Compras jantar", type: "despesa", value: 620, method: "Pix", createdAt: "2026-05-31T11:00:00Z" },
  { id: "T-510", date: "2026-05-31", description: "Internet — Mensal", category: "Internet", type: "despesa", value: 320, method: "Transferência Bancária", createdAt: "2026-05-31T12:00:00Z" },
];

const DEFAULT_HISTORY: HistoryEntry[] = [
  { id: "H-001", action: "Reserva criada", description: "Carolina Ferreira — Chalé Caiapó", timestamp: "2026-05-20T10:30:00Z", type: "reservation", entityId: "R-2401" },
  { id: "H-002", action: "Reserva criada", description: "Marcos Oliveira — Suite Ticuna", timestamp: "2026-05-22T14:00:00Z", type: "reservation", entityId: "R-2402" },
  { id: "H-003", action: "Receita registrada", description: "Chalé Caiapó — R$ 1.500", timestamp: "2026-06-04T10:00:00Z", type: "finance", entityId: "T-501" },
  { id: "H-004", action: "Check-in realizado", description: "Carolina Ferreira — Chalé Caiapó", timestamp: "2026-06-04T12:00:00Z", type: "reservation", entityId: "R-2401" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export function isAccommodationAvailable(
  accommodationId: string, checkin: string, checkout: string,
  reservations: Reservation[], excludeId?: string
): boolean {
  const ci = new Date(checkin).getTime();
  const co = new Date(checkout).getTime();
  return !reservations.some(r => {
    if (r.accommodationId !== accommodationId) return false;
    if (r.id === excludeId) return false;
    if (r.status === "cancelado" || r.status === "concluído") return false;
    const rci = new Date(r.checkin).getTime();
    const rco = new Date(r.checkout).getTime();
    return ci < rco && co > rci;
  });
}

function syncAccStatus(accId: string, allReservations: Reservation[]): AccommodationStatus {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentTime = now.toTimeString().slice(0, 5);
  const active = allReservations.filter(r => r.accommodationId === accId && r.status !== "cancelado" && r.status !== "concluído");
  const isOccupied = active.some(r => {
    if (r.status !== "hospedado") return false;
    if (today > r.checkin && today < r.checkout) return true;
    if (today === r.checkin) return currentTime >= (r.checkinTime || "00:00");
    if (today === r.checkout) return currentTime < (r.checkoutTime || "23:59");
    return false;
  });
  if (isOccupied) return "ocupado";
  if (active.length > 0) return "reservado";
  return "disponível";
}

export function getBlockedDates(accommodationId: string, reservations: Reservation[]): string[] {
  const blocked: string[] = [];
  reservations.forEach(r => {
    if (r.accommodationId !== accommodationId || r.status === "cancelado" || r.status === "concluído") return;
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

// ─── Store ───────────────────────────────────────────────────────────────────

function loadOrSeed<T>(key: string, defaults: T): T {
  const stored = load<T | null>(key, null);
  if (!stored) { save(key, defaults); return defaults; }
  return stored;
}

export function useStore() {
  const [accommodations, setAccommodationsRaw] = useState<Accommodation[]>(() => loadOrSeed("tribo_v4_accommodations", DEFAULT_ACCOMMODATIONS));
  const [reservations, setReservationsRaw] = useState<Reservation[]>(() => loadOrSeed("tribo_v5_reservations", DEFAULT_RESERVATIONS));
  const [transactions, setTransactionsRaw] = useState<Transaction[]>(() => loadOrSeed("tribo_v2_transactions", DEFAULT_TRANSACTIONS));
  const [employees, setEmployeesRaw] = useState<Employee[]>(() => loadOrSeed("tribo_v2_employees", DEFAULT_EMPLOYEES));
  const [services, setServicesRaw] = useState<Service[]>(() => loadOrSeed("tribo_v4_services", DEFAULT_SERVICES));
  const [promotions, setPromotionsRaw] = useState<Promotion[]>(() => loadOrSeed("tribo_v2_promotions", DEFAULT_PROMOTIONS));
  const [packages, setPackagesRaw] = useState<Package[]>(() => loadOrSeed("tribo_v2_packages", DEFAULT_PACKAGES));
  const [history, setHistoryRaw] = useState<HistoryEntry[]>(() => loadOrSeed("tribo_v2_history", DEFAULT_HISTORY));

  const addHistory = useCallback((entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    const e: HistoryEntry = { ...entry, id: generateId("H"), timestamp: new Date().toISOString() };
    setHistoryRaw(prev => { const u = [e, ...prev]; save("tribo_v2_history", u); return u; });
  }, []);

  // ─── Reservations ───────────────────────────────────────────────────────────
  const addReservation = useCallback((data: Omit<Reservation, "id" | "createdAt" | "status">) => {
    const r: Reservation = { ...data, id: generateId("R"), status: "pendente", createdAt: new Date().toISOString() };
    setReservationsRaw(prev => { const u = [r, ...prev]; save("tribo_v5_reservations", u); return u; });
    setAccommodationsRaw(prev => {
      const updated = prev.map(a => a.id !== data.accommodationId || a.status === "manutenção" ? a : { ...a, status: "reservado" as AccommodationStatus });
      save("tribo_v4_accommodations", updated);
      return updated;
    });
    addHistory({ action: "Reserva criada", description: `${data.guest} — ${data.accommodationName} | ${data.packageName}`, type: "reservation", entityId: r.id });
    return r;
  }, [addHistory]);

  const updateReservation = useCallback((id: string, changes: Partial<Reservation>) => {
    setReservationsRaw(prev => {
      const current = prev.find(r => r.id === id);
      const updated = prev.map(r => r.id === id ? { ...r, ...changes } : r);
      save("tribo_v5_reservations", updated);
      if (current) {
        const affectedIds = new Set([current.accommodationId, changes.accommodationId || current.accommodationId]);
        setAccommodationsRaw(accPrev => {
          const synced = accPrev.map(acc => affectedIds.has(acc.id) && acc.status !== "manutenção"
            ? { ...acc, status: syncAccStatus(acc.id, updated) }
            : acc);
          save("tribo_v4_accommodations", synced);
          return synced;
        });
      }
      return updated;
    });
  }, []);

  const cancelReservation = useCallback((id: string, accId: string, guest: string, acc: string) => {
    setReservationsRaw(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: "cancelado" as ReservationStatus } : r);
      save("tribo_v5_reservations", updated);
      setAccommodationsRaw(accPrev => {
        const s = syncAccStatus(accId, updated);
        const u = accPrev.map(a => a.id === accId && a.status !== "manutenção" ? { ...a, status: s } : a);
        save("tribo_v4_accommodations", u);
        return u;
      });
      return updated;
    });
    addHistory({ action: "Reserva cancelada", description: `${guest} — ${acc}`, type: "reservation", entityId: id });
  }, [addHistory]);

  const deleteReservation = useCallback((id: string, guest: string, acc: string) => {
    setReservationsRaw(prev => {
      const target = prev.find(r => r.id === id);
      const updated = prev.filter(r => r.id !== id);
      save("tribo_v5_reservations", updated);
      if (target) {
        setAccommodationsRaw(accPrev => {
          const s = syncAccStatus(target.accommodationId, updated);
          const u = accPrev.map(a => a.id === target.accommodationId && a.status !== "manutenção" ? { ...a, status: s } : a);
          save("tribo_v4_accommodations", u);
          return u;
        });
      }
      return updated;
    });
    addHistory({ action: "Reserva excluída", description: `${guest} — ${acc}`, type: "reservation", entityId: id });
  }, [addHistory]);

  const checkinReservation = useCallback((id: string, g: string, a: string, accId: string) => {
    updateReservation(id, { status: "hospedado" });
    setAccommodationsRaw(prev => {
      const u = prev.map(acc => acc.id === accId && acc.status !== "manutenção" ? { ...acc, status: "ocupado" as AccommodationStatus } : acc);
      save("tribo_v4_accommodations", u);
      return u;
    });
    addHistory({ action: "Check-in realizado", description: `${g} — ${a}`, type: "reservation", entityId: id });
  }, [updateReservation, addHistory]);

  const checkoutReservation = useCallback((id: string, g: string, a: string, accId: string) => {
    setReservationsRaw(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: "concluído" as ReservationStatus } : r);
      save("tribo_v5_reservations", updated);
      setAccommodationsRaw(accPrev => {
        const s = syncAccStatus(accId, updated);
        const u = accPrev.map(acc => acc.id === accId && acc.status !== "manutenção" ? { ...acc, status: s } : acc);
        save("tribo_v4_accommodations", u);
        return u;
      });
      return updated;
    });
    addHistory({ action: "Check-out realizado", description: `${g} — ${a}`, type: "reservation", entityId: id });
  }, [addHistory]);

  // ─── Accommodations ─────────────────────────────────────────────────────────
  const addAccommodation = useCallback((data: Omit<Accommodation, "id">) => {
    const a: Accommodation = { ...data, id: generateId("ACC") };
    setAccommodationsRaw(prev => { const u = [...prev, a]; save("tribo_v4_accommodations", u); return u; });
    addHistory({ action: "Acomodação adicionada", description: data.name, type: "accommodation", entityId: a.id });
  }, [addHistory]);

  const updateAccommodation = useCallback((id: string, changes: Partial<Accommodation>) => {
    setAccommodationsRaw(prev => { const u = prev.map(a => a.id === id ? { ...a, ...changes } : a); save("tribo_v4_accommodations", u); return u; });
  }, []);

  const deleteAccommodation = useCallback((id: string, name: string) => {
    setAccommodationsRaw(prev => { const u = prev.filter(a => a.id !== id); save("tribo_v4_accommodations", u); return u; });
    addHistory({ action: "Acomodação excluída", description: name, type: "accommodation", entityId: id });
  }, [addHistory]);

  // ─── Employees ──────────────────────────────────────────────────────────────
  const addEmployee = useCallback((data: Omit<Employee, "id">) => {
    const e: Employee = { ...data, id: generateId("E") };
    setEmployeesRaw(prev => { const u = [...prev, e]; save("tribo_v2_employees", u); return u; });
    addHistory({ action: "Funcionário adicionado", description: `${data.name} — ${data.role}`, type: "employee", entityId: e.id });
    return e;
  }, [addHistory]);

  const updateEmployee = useCallback((id: string, changes: Partial<Employee>) => {
    setEmployeesRaw(prev => { const u = prev.map(e => e.id === id ? { ...e, ...changes } : e); save("tribo_v2_employees", u); return u; });
  }, []);

  const deleteEmployee = useCallback((id: string, name: string) => {
    setEmployeesRaw(prev => { const u = prev.filter(e => e.id !== id); save("tribo_v2_employees", u); return u; });
    addHistory({ action: "Funcionário excluído", description: name, type: "employee", entityId: id });
  }, [addHistory]);

  // ─── Services ───────────────────────────────────────────────────────────────
  const addService = useCallback((data: Omit<Service, "id">) => {
    const s: Service = { ...data, id: generateId("S") };
    setServicesRaw(prev => { const u = [...prev, s]; save("tribo_v4_services", u); return u; });
    addHistory({ action: "Serviço adicionado", description: data.name, type: "service", entityId: s.id });
  }, [addHistory]);

  const updateService = useCallback((id: string, changes: Partial<Service>) => {
    setServicesRaw(prev => { const u = prev.map(s => s.id === id ? { ...s, ...changes } : s); save("tribo_v4_services", u); return u; });
  }, []);

  const deleteService = useCallback((id: string, name: string) => {
    setServicesRaw(prev => { const u = prev.filter(s => s.id !== id); save("tribo_v4_services", u); return u; });
    addHistory({ action: "Serviço excluído", description: name, type: "service", entityId: id });
  }, [addHistory]);

  // ─── Packages ───────────────────────────────────────────────────────────────
  const addPackage = useCallback((data: Omit<Package, "id" | "createdAt">) => {
    const p: Package = { ...data, id: generateId("PKG"), createdAt: new Date().toISOString() };
    setPackagesRaw(prev => { const u = [...prev, p]; save("tribo_v2_packages", u); return u; });
    addHistory({ action: "Pacote criado", description: data.name, type: "system", entityId: p.id });
  }, [addHistory]);

  const updatePackage = useCallback((id: string, changes: Partial<Package>) => {
    setPackagesRaw(prev => { const u = prev.map(p => p.id === id ? { ...p, ...changes } : p); save("tribo_v2_packages", u); return u; });
  }, []);

  const deletePackage = useCallback((id: string, name: string) => {
    setPackagesRaw(prev => { const u = prev.filter(p => p.id !== id); save("tribo_v2_packages", u); return u; });
    addHistory({ action: "Pacote excluído", description: name, type: "system", entityId: id });
  }, [addHistory]);

  // ─── Promotions (mantido para compatibilidade) ────────────────────────────
  const addPromotion = useCallback((data: Omit<Promotion, "id" | "createdAt">) => {
    const p: Promotion = { ...data, id: generateId("P"), createdAt: new Date().toISOString() };
    setPromotionsRaw(prev => { const u = [...prev, p]; save("tribo_v2_promotions", u); return u; });
  }, []);

  const updatePromotion = useCallback((id: string, changes: Partial<Promotion>) => {
    setPromotionsRaw(prev => { const u = prev.map(p => p.id === id ? { ...p, ...changes } : p); save("tribo_v2_promotions", u); return u; });
  }, []);

  const deletePromotion = useCallback((id: string) => {
    setPromotionsRaw(prev => { const u = prev.filter(p => p.id !== id); save("tribo_v2_promotions", u); return u; });
  }, []);

  // ─── Transactions ────────────────────────────────────────────────────────────
  const addTransaction = useCallback((data: Omit<Transaction, "id" | "createdAt">) => {
    const t: Transaction = { ...data, id: generateId("T"), createdAt: new Date().toISOString() };
    setTransactionsRaw(prev => { const u = [t, ...prev]; save("tribo_v2_transactions", u); return u; });
    addHistory({ action: data.type === "receita" ? "Receita registrada" : "Despesa registrada", description: `${data.description} — R$ ${data.value.toLocaleString("pt-BR")}`, type: "finance", entityId: t.id });
    return t;
  }, [addHistory]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactionsRaw(prev => { const u = prev.filter(t => t.id !== id); save("tribo_v2_transactions", u); return u; });
  }, []);

  return {
    accommodations, reservations, transactions, employees, services, promotions, packages, history,
    addReservation, updateReservation, deleteReservation, cancelReservation, checkinReservation, checkoutReservation,
    addAccommodation, updateAccommodation, deleteAccommodation,
    addEmployee, updateEmployee, deleteEmployee,
    addService, updateService, deleteService,
    addPackage, updatePackage, deletePackage,
    addPromotion, updatePromotion, deletePromotion,
    addTransaction, deleteTransaction,
    addHistory,
  };
}

export type Store = ReturnType<typeof useStore>;
