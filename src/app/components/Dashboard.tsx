import { TrendingUp, TrendingDown, BedDouble, Users, DollarSign } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Store } from "../store/useStore";

const revenueData = [
  { mes: "Jan", receita: 18400, despesa: 7200 },
  { mes: "Fev", receita: 22100, despesa: 8100 },
  { mes: "Mar", receita: 19800, despesa: 7600 },
  { mes: "Abr", receita: 25600, despesa: 9400 },
  { mes: "Mai", receita: 31200, despesa: 10200 },
  { mes: "Jun", receita: 34800, despesa: 11800 },
];

const occupancyData = [
  { dia: "Seg", taxa: 72 },
  { dia: "Ter", taxa: 58 },
  { dia: "Qua", taxa: 84 },
  { dia: "Qui", taxa: 91 },
  { dia: "Sex", taxa: 95 },
  { dia: "Sáb", taxa: 100 },
  { dia: "Dom", taxa: 88 },
];

const historyColors: Record<string, string> = {
  reservation: "#2d5016",
  finance: "#c4882a",
  room: "#1e5f74",
  system: "#7a7060",
};

const statusColors: Record<string, string> = {
  confirmado: "#2d5016",
  pendente: "#c4882a",
  cancelado: "#b93232",
  hospedado: "#1e5f74",
};

function StatCard({ icon: Icon, label, value, trend, sub }: {
  icon: typeof DollarSign; label: string; value: string; trend?: number; sub?: string;
}) {
  return (
    <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}>
          <Icon size={15} style={{ color: "var(--accent)" }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: "1.6rem", fontFamily: "'DM Serif Display', serif", color: "var(--foreground)", lineHeight: 1.1 }}>{value}</div>
        {(trend !== undefined || sub) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend !== undefined && (
              trend >= 0
                ? <TrendingUp size={13} style={{ color: "#2d5016" }} />
                : <TrendingDown size={13} style={{ color: "#b93232" }} />
            )}
            <span style={{ fontSize: "0.75rem", color: trend !== undefined && trend >= 0 ? "#2d5016" : trend !== undefined ? "#b93232" : "var(--muted-foreground)" }}>
              {trend !== undefined ? `${trend > 0 ? "+" : ""}${trend}% vs mês anterior` : sub}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

interface DashboardProps {
  store: Store;
}

export function Dashboard({ store }: DashboardProps) {
  const { reservations, transactions, history } = store;

  const totalReceita = transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.value, 0);
  const totalDespesa = transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.value, 0);

  const hospedados = reservations.filter(r => r.status === "hospedado").length;
  const pending = reservations.filter(r => r.status === "pendente").length;

  const recentHistory = [...history].slice(0, 15);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>Visão Geral</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Junho 2026 · Dados em tempo real</p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <StatCard icon={DollarSign} label="Receita do Mês" value={`R$ ${totalReceita.toLocaleString("pt-BR")}`} trend={11.5} />
        <StatCard icon={TrendingDown} label="Despesas" value={`R$ ${totalDespesa.toLocaleString("pt-BR")}`} trend={-3.2} />
        <StatCard icon={BedDouble} label="Hospedados Agora" value={String(hospedados)} sub="hóspedes no quarto" />
        <StatCard icon={Users} label="Pendentes" value={String(pending)} sub="aguardando confirmação" />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="mb-4">
            <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>Receita vs Despesas</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Últimos 6 meses</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="recG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d5016" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2d5016" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="despG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c4882a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#c4882a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,35,18,0.07)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.12)", borderRadius: 8, fontSize: 12 }} formatter={(val: unknown, name: unknown) => [`R$ ${Number(val ?? 0).toLocaleString("pt-BR")}`, name === "receita" ? "Receita" : "Despesa"]} />
              <Area type="monotone" dataKey="receita" stroke="#2d5016" strokeWidth={2} fill="url(#recG)" />
              <Area type="monotone" dataKey="despesa" stroke="#c4882a" strokeWidth={2} fill="url(#despG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="mb-4">
            <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>Ocupação Semanal</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Esta semana</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={occupancyData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,35,18,0.07)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.12)", borderRadius: 8, fontSize: 12 }} formatter={(val: unknown) => [`${Number(val ?? 0)}%`, "Taxa"]} />
              <Bar dataKey="taxa" fill="#2d5016" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "3fr 2fr" }}>
        {/* Recent reservations */}
        <div className="rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>Reservas Recentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Hóspede", "Quarto", "Check-in", "Valor", "Status"].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left" style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.slice(0, 7).map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < 6 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-5 py-3" style={{ fontSize: "0.875rem", color: "var(--foreground)", fontWeight: 500 }}>{r.guest}</td>
                    <td className="px-5 py-3" style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>{r.roomName}</td>
                    <td className="px-5 py-3" style={{ fontSize: "0.8rem", fontFamily: "'DM Mono', monospace", color: "var(--foreground)" }}>{r.checkin.slice(8, 10)}/{r.checkin.slice(5, 7)}</td>
                    <td className="px-5 py-3" style={{ fontSize: "0.82rem", fontFamily: "'DM Mono', monospace", color: "var(--foreground)" }}>R$ {r.value.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.68rem", background: `${statusColors[r.status]}18`, color: statusColors[r.status], fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* History log */}
        <div className="rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>Histórico</h3>
            <span className="px-2 py-0.5 rounded-full ml-1" style={{ fontSize: "0.7rem", background: "#2d501618", color: "#2d5016", fontWeight: 600 }}>{history.length}</span>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
            {recentHistory.map((entry, i) => {
              const color = historyColors[entry.type] || "#7a7060";
              return (
                <div key={entry.id} className="px-5 py-3 flex items-start gap-3" style={{ borderBottom: i < recentHistory.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}18` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: "0.8rem", color: "var(--foreground)", fontWeight: 500 }}>{entry.action}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: 1 }} className="truncate">{entry.description}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{formatTime(entry.timestamp)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
