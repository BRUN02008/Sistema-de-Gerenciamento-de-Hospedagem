import { Download, TrendingUp, Clock, FileText, BedDouble, ConciergeBell, Tag } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell } from "recharts";
import type { Store } from "../../store/useStore";

const MONTHLY = [
  { mes: "Jan", receita: 18400, despesa: 7200, ocupacao: 62 },
  { mes: "Fev", receita: 22100, despesa: 8100, ocupacao: 71 },
  { mes: "Mar", receita: 19800, despesa: 7600, ocupacao: 68 },
  { mes: "Abr", receita: 25600, despesa: 9400, ocupacao: 78 },
  { mes: "Mai", receita: 31200, despesa: 10200, ocupacao: 85 },
  { mes: "Jun", receita: 0, despesa: 0, ocupacao: 91 },
];

const PERFORMANCE = [
  { metric: "Ocupação", value: 91 }, { metric: "Satisfação", value: 88 },
  { metric: "RevPAR", value: 76 }, { metric: "ADR", value: 82 }, { metric: "NPS", value: 70 },
];

const PIE_COLORS = ["#1a2e14", "#2d5016", "#4a7c2f", "#c4882a", "#7a5028"];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const historyColors: Record<string, string> = {
  reservation: "#2d5016", finance: "#c4882a", accommodation: "#1e5f74",
  employee: "#7a5028", service: "#4a7c2f", system: "#7a7060",
};

const historyLabels: Record<string, string> = {
  reservation: "Reserva", finance: "Financeiro", accommodation: "Acomodação",
  employee: "Funcionário", service: "Serviço", system: "Sistema",
};

function ExportCard({ icon: Icon, title, desc }: { icon: typeof FileText; title: string; desc: string }) {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#1a2e1410" }}>
        <Icon size={18} style={{ color: "#1a2e14" }} />
      </div>
      <div className="flex-1">
        <div style={{ fontSize: "0.875rem", color: "#1c1a17", fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: "0.75rem", color: "#7a7060" }}>{desc}</div>
      </div>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#1a2e1410", color: "#1a2e14", fontSize: "0.78rem", fontWeight: 500 }}>
        <Download size={12} /> PDF
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#2d501612", color: "#2d5016", fontSize: "0.78rem", fontWeight: 500 }}>
        <Download size={12} /> Excel
      </button>
    </div>
  );
}

export function ReportsPage({ store }: { store: Store }) {
  const { history, transactions, reservations, accommodations, services } = store;

  const totalReceita = transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.value, 0);
  const totalDespesa = transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.value, 0);

  const dynamicMonthly = MONTHLY.map(m => m.mes === "Jun" ? { ...m, receita: totalReceita, despesa: totalDespesa } : m);

  const revenueByCategory = transactions.filter(t => t.type === "receita")
    .reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.value; return acc; }, {});
  const revenuePie = Object.entries(revenueByCategory).map(([name, value]) => ({ name, value }));

  const kpis = [
    { label: "RevPAR", value: "R$ 452", trend: "+12%" },
    { label: "ADR", value: "R$ 596", trend: "+8%" },
    { label: "Cancelamentos", value: "4,2%", trend: "-1.1pp" },
    { label: "Estadia Média", value: "3.4 noites", trend: "+0.3" },
    { label: "Ocupação Mensal", value: "91%", trend: "+6pp" },
    { label: "NPS Score", value: "8.8", trend: "+0.4" },
    { label: "Ticket Médio", value: `R$ ${Math.round(totalReceita / Math.max(reservations.length, 1)).toLocaleString("pt-BR")}`, trend: "+5%" },
    { label: "Serviços Disponíveis", value: String(services.filter(s => s.available).length), trend: "estável" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1a2e14", fontWeight: 600 }}>Relatórios</h1>
        <p style={{ fontSize: "0.82rem", color: "#7a7060" }}>Desempenho geral · 2026</p>
      </div>

      {/* KPI grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-2xl p-4" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
            <div style={{ fontSize: "0.68rem", color: "#7a7060", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, fontWeight: 500 }}>{kpi.label}</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#1a2e14", fontWeight: 600 }}>{kpi.value}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={10} style={{ color: "#2d5016" }} />
              <span style={{ fontSize: "0.68rem", color: "#2d5016" }}>{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "3fr 2fr" }}>
        <div className="rounded-2xl p-5" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
          <div className="mb-4">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Reservas por Período</h3>
            <p style={{ fontSize: "0.78rem", color: "#7a7060" }}>Receita vs Despesa — semestral</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dynamicMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,35,18,0.06)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="ocupacao" stroke="#1a2e14" strokeWidth={2.5} dot={{ fill: "#1a2e14", r: 4 }} name="Ocupação %" />
              <Line yAxisId="right" type="monotone" dataKey="receita" stroke="#c4882a" strokeWidth={2.5} dot={{ fill: "#c4882a", r: 4 }} name="Receita" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
          <div className="mb-4">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Performance Geral</h3>
            <p style={{ fontSize: "0.78rem", color: "#7a7060" }}>Indicadores — Junho 2026</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={PERFORMANCE}>
              <PolarGrid stroke="rgba(44,35,18,0.08)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#7a7060" }} />
              <Radar dataKey="value" stroke="#1a2e14" fill="#1a2e14" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by category chart */}
      {revenuePie.length > 0 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-2xl p-5" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
            <div className="mb-4">
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Receitas por Categoria</h3>
            </div>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={revenuePie} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                    {revenuePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.1)", borderRadius: 8, fontSize: 11 }} formatter={(val, _name, item) => [`R$ ${Number(val ?? 0).toLocaleString("pt-BR")}`, String(item.payload?.name ?? "")]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {revenuePie.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <div>
                      <div style={{ fontSize: "0.78rem", color: "#1c1a17", fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: "0.72rem", fontFamily: "'DM Mono', monospace", color: "#7a7060" }}>R$ {item.value.toLocaleString("pt-BR")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accommodation occupancy */}
          <div className="rounded-2xl p-5" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
            <div className="mb-4">
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Ocupação por Acomodação</h3>
            </div>
            <div className="flex flex-col gap-3">
              {accommodations.map(acc => {
                const accRes = reservations.filter(r => r.accommodationId === acc.id && r.status !== "cancelado").length;
                const pct = Math.min(100, Math.round((accRes / Math.max(reservations.length, 1)) * 100 * accommodations.length));
                return (
                  <div key={acc.id}>
                    <div className="flex justify-between mb-1">
                      <span style={{ fontSize: "0.78rem", color: "#1c1a17", fontWeight: 500 }}>{acc.name}</span>
                      <span style={{ fontSize: "0.75rem", fontFamily: "'DM Mono', monospace", color: "#7a7060" }}>{accRes} reservas</span>
                    </div>
                    <div className="w-full rounded-full" style={{ height: 6, background: "#ede8df" }}>
                      <div className="rounded-full" style={{ width: `${Math.min(100, pct + 20)}%`, height: 6, background: "#1a2e14" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Export section */}
      <div>
        <div style={{ fontSize: "0.72rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Exportar Relatórios</div>
        <div className="grid grid-cols-2 gap-3">
          <ExportCard icon={FileText} title="Relatório Financeiro" desc="Receitas, despesas e saldo do período" />
          <ExportCard icon={BedDouble} title="Relatório de Reservas" desc="Histórico completo de hospedagens" />
          <ExportCard icon={ConciergeBell} title="Relatório de Serviços" desc="Serviços prestados e receita" />
          <ExportCard icon={BedDouble} title="Relatório de Ocupação" desc="Taxa de ocupação por acomodação" />
          <ExportCard icon={Tag} title="Relatório de Pacotes" desc="Pacotes vendidos e serviços opcionais" />
          <ExportCard icon={FileText} title="Relatório Completo" desc="Visão geral do sistema completo" />
        </div>
      </div>

      {/* Full history */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(44,35,18,0.06)" }}>
          <Clock size={15} style={{ color: "#7a7060" }} />
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Histórico Completo do Sistema</h3>
          <span className="ml-1 px-2 py-0.5 rounded-full" style={{ fontSize: "0.68rem", background: "#2d501612", color: "#2d5016", fontWeight: 600 }}>{history.length} eventos</span>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(44,35,18,0.05)" }}>
          {history.slice(0, 30).map(entry => {
            const color = historyColors[entry.type] || "#7a7060";
            return (
              <div key={entry.id} className="px-5 py-3 flex items-start gap-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "0.82rem", color: "#1c1a17", fontWeight: 500 }}>{entry.action}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "0.63rem", background: `${color}12`, color, fontWeight: 600, textTransform: "uppercase" }}>
                      {historyLabels[entry.type] || entry.type}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#7a7060", marginTop: 1 }}>{entry.description}</div>
                </div>
                <div style={{ fontSize: "0.7rem", color: "#7a7060", fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>{formatTime(entry.timestamp)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
