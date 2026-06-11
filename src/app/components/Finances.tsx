import { useState } from "react";
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { Store } from "../store/useStore";

const PIE_COLORS = ["#2d5016", "#c4882a", "#4a7c2f", "#8b5e1a", "#b8b0a0"];

const monthlyData = [
  { mes: "Jan", receita: 18400, despesa: 7200 },
  { mes: "Fev", receita: 22100, despesa: 8100 },
  { mes: "Mar", receita: 19800, despesa: 7600 },
  { mes: "Abr", receita: 25600, despesa: 9400 },
  { mes: "Mai", receita: 31200, despesa: 10200 },
  { mes: "Jun", receita: 0, despesa: 0 }, // will be filled dynamically
];

interface FinancesProps { store: Store; }

function currencyTooltipValue(value: unknown) {
  return typeof value === "number" ? `R$ ${value.toLocaleString("pt-BR")}` : String(value ?? "");
}

export function Finances({ store }: FinancesProps) {
  const { transactions, addTransaction } = store;

  const [typeFilter, setTypeFilter] = useState<"todos" | "receita" | "despesa">("todos");
  const [showModal, setShowModal] = useState(false);
  const [newTx, setNewTx] = useState({ description: "", category: "Hospedagem", type: "receita" as "receita" | "despesa", value: "", method: "Pix" });
  const [formError, setFormError] = useState("");

  const totalReceita = transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.value, 0);
  const totalDespesa = transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.value, 0);
  const saldo = totalReceita - totalDespesa;

  const filtered = transactions.filter(t => typeFilter === "todos" || t.type === typeFilter);

  const expenseByCategory = transactions
    .filter(t => t.type === "despesa")
    .reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.value; return acc; }, {});
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Fill in June data from transactions
  const dynamicMonthly = monthlyData.map(m => {
    if (m.mes === "Jun") {
      return { ...m, receita: totalReceita, despesa: totalDespesa };
    }
    return m;
  });

  function handleSaveTx() {
    if (!newTx.description.trim()) { setFormError("Descrição obrigatória"); return; }
    const val = parseFloat(newTx.value);
    if (!val || val <= 0) { setFormError("Valor inválido"); return; }
    addTransaction({
      date: new Date().toISOString().slice(0, 10),
      description: newTx.description.trim(),
      category: newTx.category,
      type: newTx.type,
      value: val,
      method: newTx.method,
    });
    setShowModal(false);
    setNewTx({ description: "", category: "Hospedagem", type: "receita", value: "", method: "Pix" });
    setFormError("");
  }

  return (
    <div className="flex flex-col gap-6">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>Nova Transação</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}>✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", fontWeight: 500, display: "block", marginBottom: 5 }}>Tipo</label>
                <div className="flex gap-2">
                  {(["receita","despesa"] as const).map(t => (
                    <button key={t} onClick={() => setNewTx(f => ({ ...f, type: t }))} className="flex-1 py-2 rounded-lg" style={{ background: newTx.type === t ? (t === "receita" ? "#2d5016" : "#b93232") : "var(--muted)", color: newTx.type === t ? "#fdfaf5" : "var(--foreground)", fontSize: "0.875rem", textTransform: "capitalize" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", fontWeight: 500, display: "block", marginBottom: 5 }}>Descrição *</label>
                <input value={newTx.description} onChange={e => { setNewTx(f => ({ ...f, description: e.target.value })); setFormError(""); }} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ background: "var(--input-background)", border: "1px solid var(--border)", fontSize: "0.875rem", color: "var(--foreground)" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", fontWeight: 500, display: "block", marginBottom: 5 }}>Valor (R$) *</label>
                  <input type="number" value={newTx.value} onChange={e => { setNewTx(f => ({ ...f, value: e.target.value })); setFormError(""); }} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ background: "var(--input-background)", border: "1px solid var(--border)", fontSize: "0.875rem", color: "var(--foreground)" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", fontWeight: 500, display: "block", marginBottom: 5 }}>Pagamento</label>
                  <select value={newTx.method} onChange={e => setNewTx(f => ({ ...f, method: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ background: "var(--input-background)", border: "1px solid var(--border)", fontSize: "0.875rem", color: "var(--foreground)" }}>
                    <option>Pix</option><option>Cartão</option><option>Dinheiro</option><option>Transferência</option><option>Débito</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", fontWeight: 500, display: "block", marginBottom: 5 }}>Categoria</label>
                <select value={newTx.category} onChange={e => setNewTx(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ background: "var(--input-background)", border: "1px solid var(--border)", fontSize: "0.875rem", color: "var(--foreground)" }}>
                  <option>Hospedagem</option><option>Eventos</option><option>Alimentação</option><option>Pessoal</option><option>Manutenção</option><option>Utilidades</option><option>Outros</option>
                </select>
              </div>
              {formError && <div className="px-3 py-2 rounded-lg" style={{ background: "#b9323215", color: "#b93232", fontSize: "0.8rem" }}>{formError}</div>}
              <div className="flex gap-3 mt-1">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl" style={{ background: "var(--muted)", fontSize: "0.875rem", color: "var(--foreground)" }}>Cancelar</button>
                <button onClick={handleSaveTx} className="flex-1 py-2.5 rounded-xl" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.875rem" }}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>Financeiro</h1>
          <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Controle de caixa · Junho 2026</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.875rem" }}>
          <Plus size={16} /> Nova Transação
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-5" style={{ background: "#2d501610", border: "1.5px solid #2d501630" }}>
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight size={16} style={{ color: "#2d5016" }} />
            <span style={{ fontSize: "0.78rem", color: "#2d5016", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Receitas</span>
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "#2d5016" }}>R$ {totalReceita.toLocaleString("pt-BR")}</div>
          <div className="flex items-center gap-1 mt-1"><TrendingUp size={12} style={{ color: "#2d5016" }} /><span style={{ fontSize: "0.75rem", color: "#2d5016" }}>+11.5% vs maio</span></div>
        </div>
        <div className="rounded-xl p-5" style={{ background: "#b9323210", border: "1.5px solid #b9323230" }}>
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownRight size={16} style={{ color: "#b93232" }} />
            <span style={{ fontSize: "0.78rem", color: "#b93232", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Despesas</span>
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "#b93232" }}>R$ {totalDespesa.toLocaleString("pt-BR")}</div>
          <div className="flex items-center gap-1 mt-1"><TrendingDown size={12} style={{ color: "#b93232" }} /><span style={{ fontSize: "0.75rem", color: "#b93232" }}>-3.2% vs maio</span></div>
        </div>
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full" style={{ background: saldo >= 0 ? "#2d5016" : "#b93232" }} />
            <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Saldo Líquido</span>
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: saldo >= 0 ? "#2d5016" : "#b93232" }}>R$ {saldo.toLocaleString("pt-BR")}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: 4 }}>Lucro do período</div>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="mb-4">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>Fluxo de Caixa</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Receitas vs Despesas — 6 meses</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dynamicMonthly} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,35,18,0.07)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.12)", borderRadius: 8, fontSize: 12 }} formatter={(val, name) => [currencyTooltipValue(val), name === "receita" ? "Receita" : "Despesa"]} />
              <Bar dataKey="receita" fill="#2d5016" radius={[3, 3, 0, 0]} />
              <Bar dataKey="despesa" fill="#c4882a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="mb-4">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>Despesas por Categoria</h3>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.12)", borderRadius: 8, fontSize: 12 }} formatter={(val, _name, props) => [currencyTooltipValue(val), String(props.payload?.name ?? "")]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-2">
                {pieData.slice(0, 5).map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[idx] }} /><span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{item.name}</span></div>
                    <span style={{ fontSize: "0.75rem", fontFamily: "'DM Mono', monospace", color: "var(--foreground)" }}>R$ {item.value.toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Sem despesas registradas</div>
          )}
        </div>
      </div>

      {/* Extrato */}
      <div className="rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>Extrato</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{transactions.length} transações</p>
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--muted)" }}>
            {(["todos","receita","despesa"] as const).map(f => (
              <button key={f} onClick={() => setTypeFilter(f)} className="px-3 py-1 rounded-lg transition-colors" style={{ background: typeFilter === f ? "var(--card)" : "transparent", fontSize: "0.78rem", color: typeFilter === f ? "var(--foreground)" : "var(--muted-foreground)", textTransform: "capitalize" }}>
                {f === "todos" ? "Todos" : f}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              {["Data","Descrição","Categoria","Método","Valor"].map(h => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>
                <td className="px-5 py-3.5" style={{ fontSize: "0.78rem", fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)" }}>{t.date.slice(8,10)}/{t.date.slice(5,7)}/{t.date.slice(0,4)}</td>
                <td className="px-5 py-3.5" style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>{t.description}</td>
                <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-full" style={{ fontSize: "0.7rem", background: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 500 }}>{t.category}</span></td>
                <td className="px-5 py-3.5" style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{t.method}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    {t.type === "receita" ? <ArrowUpRight size={14} style={{ color: "#2d5016" }} /> : <ArrowDownRight size={14} style={{ color: "#b93232" }} />}
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.875rem", color: t.type === "receita" ? "#2d5016" : "#b93232", fontWeight: 500 }}>R$ {t.value.toLocaleString("pt-BR")}</span>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center" style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Nenhuma transação encontrada</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
