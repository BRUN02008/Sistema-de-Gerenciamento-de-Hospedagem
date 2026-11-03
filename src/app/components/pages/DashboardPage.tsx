import { TrendingUp, TrendingDown, BedDouble, DollarSign, ArrowDownRight, CalendarDays, ConciergeBell, Tag, ArrowRight } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Store } from "../../store/useStore";

type Page = "dashboard" | "reservations" | "accommodations" | "services" | "finances" | "packages" | "reports" | "settings";

const monthlyData = [
  { mes: "Jan", receita: 18400, despesa: 7200 },
  { mes: "Fev", receita: 22100, despesa: 8100 },
  { mes: "Mar", receita: 19800, despesa: 7600 },
  { mes: "Abr", receita: 25600, despesa: 9400 },
  { mes: "Mai", receita: 31200, despesa: 10200 },
  { mes: "Jun", receita: 0, despesa: 0 },
];

const occupancyData = [
  { dia: "Seg", taxa: 72 }, { dia: "Ter", taxa: 58 }, { dia: "Qua", taxa: 84 },
  { dia: "Qui", taxa: 91 }, { dia: "Sex", taxa: 95 }, { dia: "Sáb", taxa: 100 }, { dia: "Dom", taxa: 88 },
];

const historyColors: Record<string, string> = {
  reservation: "#2d5016", finance: "#c4882a", accommodation: "#1e5f74",
  employee: "#7a5028", service: "#4a7c2f", system: "#7a7060",
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-4 md:p-5 ${className}`} style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.09)" }}>
      {children}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, positive, color = "#c4882a" }: {
  icon: typeof DollarSign; label: string; value: string; sub?: string; positive?: boolean; color?: string;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div style={{ fontSize: "0.68rem", color: "#7a7060", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}12` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1c1a17", lineHeight: 1 }}>{value}</div>
      {sub && (
        <div className="flex items-center gap-1 mt-1.5">
          {positive !== undefined && (positive
            ? <TrendingUp size={10} style={{ color: "#2d5016" }} />
            : <TrendingDown size={10} style={{ color: "#b93232" }} />)}
          <span style={{ fontSize: "0.68rem", color: positive === true ? "#2d5016" : positive === false ? "#b93232" : "#7a7060" }}>{sub}</span>
        </div>
      )}
    </Card>
  );
}

const statusColors: Record<string, string> = {
  confirmado: "#2d5016", pendente: "#c4882a", cancelado: "#b93232", hospedado: "#1e5f74", "concluído": "#1a2e14",
};
const statusLabels: Record<string, string> = {
  confirmado: "Confirmado", pendente: "Pendente", cancelado: "Cancelado", hospedado: "Hospedado", "concluído": "Concluído",
};

function fmt(d: string) { return `${d.slice(8, 10)}/${d.slice(5, 7)}`; }
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

interface DashboardPageProps { store: Store; onNavigate: (page: Page) => void; }

export function DashboardPage({ store, onNavigate }: DashboardPageProps) {
  const { reservations, transactions, services, packages, history, accommodations } = store;

  const totalReceita = transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.value, 0);
  const totalDespesa = transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.value, 0);
  const lucro = totalReceita - totalDespesa;

  const pending = reservations.filter(r => r.status === "pendente").length;
  const availableAcc = accommodations.filter(a => a.status === "disponível").length;
  const activeServices = services.filter(s => s.available).length;
  const activePromos = packages.filter(p => p.active).length;

  const dynamicMonthly = monthlyData.map(m => m.mes === "Jun" ? { ...m, receita: totalReceita, despesa: totalDespesa } : m);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#1a2e14", fontWeight: 600 }}>Dashboard</h1>
        <p style={{ fontSize: "0.8rem", color: "#7a7060", marginTop: 2 }}>Visão geral · Junho 2026</p>
      </div>

      {/* KPI row 1 — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard icon={DollarSign} label="Receita do Mês" value={`R$ ${(totalReceita/1000).toFixed(1)}k`} sub="+11.5% vs maio" positive={true} color="#2d5016" />
        <KpiCard icon={ArrowDownRight} label="Despesas" value={`R$ ${(totalDespesa/1000).toFixed(1)}k`} sub="-3.2% vs maio" positive={false} color="#b93232" />
        <KpiCard icon={TrendingUp} label="Lucro Líquido" value={`R$ ${(lucro/1000).toFixed(1)}k`} sub="Resultado" color="#c4882a" />
        <KpiCard icon={BedDouble} label="Disponíveis" value={`${availableAcc}/${accommodations.length}`} sub="livres hoje" color="#1e5f74" />
      </div>

      {/* KPI row 2 — 1 col mobile, 3 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <KpiCard icon={CalendarDays} label="Reservas Pendentes" value={String(pending)} sub="aguardam confirmação" color="#c4882a" />
        <KpiCard icon={ConciergeBell} label="Serviços Ativos" value={String(activeServices)} sub={`${services.length} total`} color="#4a7c2f" />
        <KpiCard icon={Tag} label="Pacotes Ativos" value={String(activePromos)} sub={`${packages.length} total`} color="#2d5016" />
      </div>

      {/* Charts row — 1 col mobile, 3 cols desktop (2+1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600, fontSize: "1rem" }}>Entradas e Saídas</h3>
                <p style={{ fontSize: "0.75rem", color: "#7a7060" }}>Últimos 6 meses</p>
              </div>
              <button onClick={() => onNavigate("finances")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ fontSize: "0.75rem", color: "#2d5016", background: "#2d501612" }}>
                Ver mais <ArrowRight size={12} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={dynamicMonthly}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d5016" stopOpacity={0.25} /><stop offset="95%" stopColor="#2d5016" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c4882a" stopOpacity={0.2} /><stop offset="95%" stopColor="#c4882a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,35,18,0.06)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#7a7060" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={32} />
                <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.1)", borderRadius: 10, fontSize: 12 }} formatter={(val, name) => [`R$ ${Number(val ?? 0).toLocaleString("pt-BR")}`, name === "receita" ? "Receita" : "Despesa"]} />
                <Area type="monotone" dataKey="receita" stroke="#2d5016" strokeWidth={2} fill="url(#gR)" name="receita" />
                <Area type="monotone" dataKey="despesa" stroke="#c4882a" strokeWidth={2} fill="url(#gD)" name="despesa" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card>
          <div className="mb-4">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600, fontSize: "1rem" }}>Ocupação Semanal</h3>
            <p style={{ fontSize: "0.75rem", color: "#7a7060" }}>Taxa por dia</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={occupancyData} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,35,18,0.06)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "#7a7060" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#7a7060" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} width={28} />
              <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.1)", borderRadius: 10, fontSize: 12 }} formatter={v => [`${v ?? 0}%`, "Ocupação"]} />
              <Bar dataKey="taxa" fill="#1a2e14" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row — 1 col mobile, 5 cols desktop (3+2) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Recent reservations */}
        <div className="md:col-span-3">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600, fontSize: "1rem" }}>Reservas Recentes</h3>
              <button onClick={() => onNavigate("reservations")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ fontSize: "0.75rem", color: "#2d5016", background: "#2d501612" }}>
                Todas <ArrowRight size={12} />
              </button>
            </div>
            {/* Mobile card list */}
            <div className="flex flex-col gap-2 md:hidden">
              {reservations.slice(0, 4).map(r => (
                <div key={r.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: "#f7f4ef" }}>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: "0.85rem", color: "#1c1a17", fontWeight: 500 }} className="truncate">{r.guest.split(" ")[0]} {r.guest.split(" ").slice(-1)}</div>
                    <div style={{ fontSize: "0.72rem", color: "#7a7060" }}>{r.accommodationName} · {fmt(r.checkin)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "#2d5016", fontWeight: 600 }}>R$ {r.value.toLocaleString("pt-BR")}</span>
                    <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "0.6rem", background: `${statusColors[r.status]}15`, color: statusColors[r.status], fontWeight: 700, textTransform: "uppercase" }}>
                      {statusLabels[r.status] || r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(44,35,18,0.07)" }}>
                    {["Hóspede", "Acomodação", "Check-in", "Valor", "Status"].map(h => (
                      <th key={h} className="pb-2 text-left" style={{ fontSize: "0.68rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: 8 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.slice(0, 5).map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: i < 4 ? "1px solid rgba(44,35,18,0.05)" : "none" }}>
                      <td className="py-2.5" style={{ fontSize: "0.85rem", color: "#1c1a17", fontWeight: 500 }}>{r.guest.split(" ")[0]} {r.guest.split(" ").slice(-1)}</td>
                      <td className="py-2.5" style={{ fontSize: "0.82rem", color: "#7a7060" }}>{r.accommodationName}</td>
                      <td className="py-2.5" style={{ fontSize: "0.78rem", fontFamily: "'DM Mono', monospace", color: "#1c1a17" }}>{fmt(r.checkin)}</td>
                      <td className="py-2.5" style={{ fontSize: "0.78rem", fontFamily: "'DM Mono', monospace", color: "#1c1a17" }}>R$ {r.value.toLocaleString("pt-BR")}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.65rem", background: `${statusColors[r.status]}15`, color: statusColors[r.status], fontWeight: 600, textTransform: "uppercase" }}>
                          {statusLabels[r.status] || r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* History */}
        <div className="md:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600, fontSize: "1rem" }}>Atividade Recente</h3>
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.68rem", background: "#2d501612", color: "#2d5016", fontWeight: 600 }}>{history.length}</span>
            </div>
            <div className="flex flex-col gap-0" style={{ maxHeight: 240, overflowY: "auto" }}>
              {history.slice(0, 8).map((entry, i) => {
                const color = historyColors[entry.type] || "#7a7060";
                return (
                  <div key={entry.id} className="flex items-start gap-3 py-2.5" style={{ borderBottom: i < 7 ? "1px solid rgba(44,35,18,0.05)" : "none" }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: "0.8rem", color: "#1c1a17", fontWeight: 500 }}>{entry.action}</div>
                      <div style={{ fontSize: "0.72rem", color: "#7a7060", marginTop: 1 }} className="truncate">{entry.description}</div>
                      <div style={{ fontSize: "0.67rem", color: "#b8b0a0", marginTop: 1, fontFamily: "'DM Mono', monospace" }}>{formatTime(entry.timestamp)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
