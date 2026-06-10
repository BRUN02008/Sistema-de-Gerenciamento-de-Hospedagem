import { Download, TrendingUp, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import type { Store } from "../store/useStore";

const historyColors: Record<string, string> = {
  reservation: "#2d5016", finance: "#c4882a", room: "#1e5f74", system: "#7a7060",
};

const historyTypeLabel: Record<string, string> = {
  reservation: "Reserva", finance: "Financeiro", room: "Quarto", system: "Sistema",
};

const monthlyOccupancy = [
  { mes: "Jan", taxa: 62, receita: 18400 },
  { mes: "Fev", taxa: 71, receita: 22100 },
  { mes: "Mar", taxa: 68, receita: 19800 },
  { mes: "Abr", taxa: 78, receita: 25600 },
  { mes: "Mai", taxa: 85, receita: 31200 },
  { mes: "Jun", taxa: 91, receita: 34800 },
];

const performanceMetrics = [
  { metric: "Ocupação", value: 91 },
  { metric: "Satisfação", value: 88 },
  { metric: "RevPAR", value: 76 },
  { metric: "ADR", value: 82 },
  { metric: "NPS", value: 70 },
];

const kpiCards = [
  { label: "RevPAR", value: "R$ 385", sub: "+12% vs mai" },
  { label: "ADR (Diária Média)", value: "R$ 423", sub: "+8% vs mai" },
  { label: "Taxa de Cancelamento", value: "4,2%", sub: "-1.1pp vs mai" },
  { label: "Estadia Média", value: "3.4 noites", sub: "+0.3 vs mai" },
];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

interface ReportsProps { store: Store; }

export function Reports({ store }: ReportsProps) {
  const { history, transactions } = store;

  const totalReceita = transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.value, 0);

  const revenueByType = [
    { tipo: "Hospedagem", valor: transactions.filter(t => t.category === "Hospedagem" && t.type === "receita").reduce((s,t) => s+t.value,0) },
    { tipo: "Eventos", valor: transactions.filter(t => t.category === "Eventos" && t.type === "receita").reduce((s,t) => s+t.value,0) },
    { tipo: "Outros", valor: transactions.filter(t => !["Hospedagem","Eventos"].includes(t.category) && t.type === "receita").reduce((s,t) => s+t.value,0) },
  ].filter(r => r.valor > 0);

  const dynamicMonthly = monthlyOccupancy.map(m => m.mes === "Jun" ? { ...m, receita: totalReceita } : m);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>Relatórios</h1>
          <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Desempenho · 2026</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "var(--muted)", color: "var(--foreground)", fontSize: "0.875rem" }}>
          <Download size={15} /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map(kpi => (
          <div key={kpi.label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{kpi.label}</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.4rem", color: "var(--foreground)" }}>{kpi.value}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={11} style={{ color: "#2d5016" }} />
              <span style={{ fontSize: "0.72rem", color: "#2d5016" }}>{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "3fr 2fr" }}>
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="mb-4">
            <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>Ocupação & Receita</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Tendência semestral</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dynamicMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,35,18,0.07)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.12)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="taxa" stroke="#2d5016" strokeWidth={2.5} dot={{ fill: "#2d5016", r: 4 }} name="Ocupação %" />
              <Line yAxisId="right" type="monotone" dataKey="receita" stroke="#c4882a" strokeWidth={2.5} dot={{ fill: "#c4882a", r: 4 }} name="Receita" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="mb-4">
            <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>Performance Geral</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Indicadores — Junho</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={performanceMetrics}>
              <PolarGrid stroke="rgba(44,35,18,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#7a7060" }} />
              <Radar dataKey="value" stroke="#2d5016" fill="#2d5016" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {revenueByType.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="mb-4">
            <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>Receita por Segmento</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Junho 2026</p>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={revenueByType} layout="vertical" barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,35,18,0.07)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="tipo" tick={{ fontSize: 12, fill: "#7a7060" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.12)", borderRadius: 8, fontSize: 12 }} formatter={(val: unknown) => [`R$ ${Number(val ?? 0).toLocaleString("pt-BR")}`, "Receita"]} />
              <Bar dataKey="valor" fill="#2d5016" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Full history log */}
      <div className="rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
          <Clock size={16} style={{ color: "var(--muted-foreground)" }} />
          <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>Histórico Completo</h3>
          <span className="ml-1 px-2 py-0.5 rounded-full" style={{ fontSize: "0.7rem", background: "#2d501618", color: "#2d5016", fontWeight: 600 }}>{history.length} eventos</span>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {history.slice(0, 50).map((entry) => {
            const color = historyColors[entry.type] || "#7a7060";
            return (
              <div key={entry.id} className="px-6 py-3 flex items-start gap-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "0.82rem", color: "var(--foreground)", fontWeight: 500 }}>{entry.action}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "0.65rem", background: `${color}15`, color, fontWeight: 600, textTransform: "uppercase" }}>
                      {historyTypeLabel[entry.type] || entry.type}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: 1 }}>{entry.description}</div>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>{formatTime(entry.timestamp)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
