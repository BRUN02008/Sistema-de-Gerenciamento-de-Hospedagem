import { TrendingUp, TrendingDown, BedDouble, DollarSign, ArrowUpRight, ArrowDownRight, CalendarDays, ConciergeBell, Tag, ArrowRight } from "lucide-react";
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
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.09)" }}>
      {children}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, positive, color = "#c4882a" }: {
  icon: typeof DollarSign; label: string; value: string; sub?: string; positive?: boolean; color?: string;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div style={{ fontSize: "0.72rem", color: "#7a7060", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>{label}</div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.7rem", color: "#1c1a17", lineHeight: 1 }}>{value}</div>
      {sub && (
        <div className="flex items-center gap-1 mt-1.5">
          {positive !== undefined && (positive
            ? <TrendingUp size={11} style={{ color: "#2d5016" }} />
            : <TrendingDown size={11} style={{ color: "#b93232" }} />)}
          <span style={{ fontSize: "0.72rem", color: positive === true ? "#2d5016" : positive === false ? "#b93232" : "#7a7060" }}>{sub}</span>
        </div>
      )}
    </Card>
  );
}

const statusColors: Record<string, string> = {
  confirmado: "#2d5016", pendente: "#c4882a", cancelado: "#b93232", hospedado: "#1e5f74",
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
    <div className="flex flex-col gap-5">
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1a2e14", fontWeight: 600 }}>Dashboard</h1>
        <p style={{ fontSize: "0.82rem", color: "#7a7060", marginTop: 2 }}>Visão geral do sistema · Junho 2026</p>
      </div>

      {/* Main KPIs - row 1 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <KpiCard icon={DollarSign} label="Receita do Mês" value={`R$ ${(totalReceita/1000).toFixed(1)}k`} sub="+11.5% vs maio" positive={true} color="#2d5016" />
        <KpiCard icon={ArrowDownRight} label="Despesas do Mês" value={`R$ ${(totalDespesa/1000).toFixed(1)}k`} sub="-3.2% vs maio" positive={false} color="#b93232" />
        <KpiCard icon={TrendingUp} label="Lucro Líquido" value={`R$ ${(lucro/1000).toFixed(1)}k`} sub="Resultado do período" color="#c4882a" />
        <KpiCard icon={BedDouble} label="Disponíveis Hoje" value={`${availableAcc}/${accommodations.length}`} sub="acomodações livres" color="#1e5f74" />
      </div>

      {/* KPIs - row 2 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <KpiCard icon={CalendarDays} label="Reservas Pendentes" value={String(pending)} sub="aguardam confirmação" color="#c4882a" />
        <KpiCard icon={ConciergeBell} label="Serviços Ativos" value={String(activeServices)} sub={`${services.length} total cadastrados`} color="#4a7c2f" />
        <KpiCard icon={Tag} label="Pacotes Ativos" value={String(activePromos)} sub={`${packages.length} total`} color="#2d5016" />
      </div>

      {/* Charts */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Entradas e Saídas</h3>
              <p style={{ fontSize: "0.78rem", color: "#7a7060" }}>Últimos 6 meses</p>
            </div>
            <button onClick={() => onNavigate("finances")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ fontSize: "0.75rem", color: "#2d5016", background: "#2d501612" }}>
              Ver mais <ArrowRight size={12} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
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
              <YAxis tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.1)", borderRadius: 10, fontSize: 12 }} formatter={(val: number, name: string) => [`R$ ${val.toLocaleString("pt-BR")}`, name === "receita" ? "Receita" : "Despesa"]} />
              <Area type="monotone" dataKey="receita" stroke="#2d5016" strokeWidth={2} fill="url(#gR)" name="receita" />
              <Area type="monotone" dataKey="despesa" stroke="#c4882a" strokeWidth={2} fill="url(#gD)" name="despesa" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Ocupação Semanal</h3>
            <p style={{ fontSize: "0.78rem", color: "#7a7060" }}>Média por dia</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={occupancyData} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,35,18,0.06)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.1)", borderRadius: 10, fontSize: 12 }} formatter={(v: number) => [`${v}%`, "Ocupação"]} />
              <Bar dataKey="taxa" fill="#1a2e14" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "3fr 2fr" }}>
        {/* Recent reservations */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Reservas Recentes</h3>
            <button onClick={() => onNavigate("reservations")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ fontSize: "0.75rem", color: "#2d5016", background: "#2d501612" }}>
              Todas <ArrowRight size={12} />
            </button>
          </div>
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
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.65rem", background: `${statusColors[r.status]}15`, color: statusColors[r.status], fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* History */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Atividade Recente</h3>
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
                    <div style={{ fontSize: "0.67rem", color: "#7a7060", marginTop: 1, fontFamily: "'DM Mono', monospace" }}>{formatTime(entry.timestamp)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
