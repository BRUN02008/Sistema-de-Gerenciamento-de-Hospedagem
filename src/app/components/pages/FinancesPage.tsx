import { useState } from "react";
import { Plus, ArrowUpRight, ArrowDownRight, Trash2, X, TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { PaymentMethod, Store } from "../../store/useStore";
import { EXPENSE_CATEGORIES, REVENUE_CATEGORIES } from "../../store/useStore";

const PAYMENT_METHODS = ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Transferência Bancária"] as const;
const PIE_COLORS = ["#1a2e14", "#2d5016", "#4a7c2f", "#c4882a", "#8b5e1a", "#d4a84b", "#7a7060", "#b8b0a0", "#7a5028"];

const monthlyBase = [
  { mes: "Jan", receita: 18400, despesa: 7200 },
  { mes: "Fev", receita: 22100, despesa: 8100 },
  { mes: "Mar", receita: 19800, despesa: 7600 },
  { mes: "Abr", receita: 25600, despesa: 9400 },
  { mes: "Mai", receita: 31200, despesa: 10200 },
  { mes: "Jun", receita: 0, despesa: 0 },
];

export function FinancesPage({ store }: { store: Store }) {
  const { transactions, addTransaction, deleteTransaction } = store;
  const [modal, setModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"todos" | "receita" | "despesa">("todos");
  const [newTx, setNewTx] = useState({ description: "", category: REVENUE_CATEGORIES[0], type: "receita" as "receita" | "despesa", value: "", method: "Pix" as typeof PAYMENT_METHODS[number] });
  const [formError, setFormError] = useState("");

  const totalReceita = transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.value, 0);
  const totalDespesa = transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.value, 0);
  const saldo = totalReceita - totalDespesa;

  const filtered = transactions.filter(t => typeFilter === "todos" || t.type === typeFilter);

  const expenseByCategory = transactions.filter(t => t.type === "despesa")
    .reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.value; return acc; }, {});
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const dynamicMonthly = monthlyBase.map(m => m.mes === "Jun" ? { ...m, receita: totalReceita, despesa: totalDespesa } : m);

  function handleSave() {
    if (!newTx.description.trim()) { setFormError("Descrição obrigatória"); return; }
    const val = parseFloat(newTx.value);
    if (!val || val <= 0) { setFormError("Valor inválido"); return; }
    addTransaction({ date: new Date().toISOString().slice(0, 10), description: newTx.description.trim(), category: newTx.category, type: newTx.type, value: val, method: newTx.method });
    setModal(false);
    setNewTx({ description: "", category: REVENUE_CATEGORIES[0], type: "receita", value: "", method: "Pix" });
    setFormError("");
  }

  const currentCategories = newTx.type === "receita" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="flex flex-col gap-5">
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(10,18,7,0.6)", backdropFilter: "blur(6px)" }}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "#fdfaf5" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Nova Transação</h2>
              <button aria-label="Fechar" onClick={() => setModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ede8df" }}><X size={15} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 8 }}>Tipo</label>
                <div className="flex gap-2">
                  {(["receita", "despesa"] as const).map(t => (
                    <button key={t} type="button" aria-label={t === "receita" ? "Receita" : "Despesa"} onClick={() => setNewTx(f => ({ ...f, type: t, category: (t === "receita" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES)[0] }))} className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2" style={{ background: newTx.type === t ? (t === "receita" ? "#2d5016" : "#b93232") : "#ede8df", color: newTx.type === t ? "#f7f4ef" : "#7a7060", fontSize: "0.875rem" }}>
                      {t === "receita" ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />} {t === "receita" ? "Receita" : "Despesa"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Descrição *</label>
                <input aria-label="Descrição" value={newTx.description} onChange={e => { setNewTx(f => ({ ...f, description: e.target.value })); setFormError(""); }} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Categoria</label>
                <select aria-label="Categoria" value={newTx.category} onChange={e => setNewTx(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }}>
                  {currentCategories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Valor (R$) *</label>
                  <input aria-label="Valor" type="number" value={newTx.value} onChange={e => { setNewTx(f => ({ ...f, value: e.target.value })); setFormError(""); }} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Forma de Pagamento</label>
                  <select aria-label="Forma de Pagamento" value={newTx.method} onChange={e => setNewTx(f => ({ ...f, method: e.target.value as PaymentMethod }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }}>
                    {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              {formError && <div className="px-3 py-2 rounded-lg" style={{ background: "#b9323212", color: "#b93232", fontSize: "0.8rem" }}>{formError}</div>}
              <div className="flex gap-3">
                <button aria-label="Cancelar" onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl" style={{ background: "#ede8df", fontSize: "0.875rem" }}>Cancelar</button>
                <button aria-label="Registrar" onClick={handleSave} className="flex-1 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem" }}>Registrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1a2e14", fontWeight: 600 }}>Controle Financeiro</h1>
          <p style={{ fontSize: "0.82rem", color: "#7a7060" }}>Caixa mensal · Junho 2026</p>
        </div>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem", fontWeight: 500 }}>
          <Plus size={16} /> Nova Transação
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "#2d501610", border: "1.5px solid #2d501630" }}>
          <div className="flex items-center gap-2 mb-3"><ArrowUpRight size={16} style={{ color: "#2d5016" }} /><span style={{ fontSize: "0.72rem", color: "#2d5016", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Entradas</span></div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#2d5016", fontWeight: 700 }}>R$ {(totalReceita/1000).toFixed(1)}k</div>
          <div className="flex items-center gap-1 mt-1"><TrendingUp size={11} style={{ color: "#2d5016" }} /><span style={{ fontSize: "0.72rem", color: "#2d5016" }}>+11.5% vs maio</span></div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "#b9323210", border: "1.5px solid #b9323230" }}>
          <div className="flex items-center gap-2 mb-3"><ArrowDownRight size={16} style={{ color: "#b93232" }} /><span style={{ fontSize: "0.72rem", color: "#b93232", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Saídas</span></div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#b93232", fontWeight: 700 }}>R$ {(totalDespesa/1000).toFixed(1)}k</div>
          <div className="flex items-center gap-1 mt-1"><TrendingDown size={11} style={{ color: "#b93232" }} /><span style={{ fontSize: "0.72rem", color: "#b93232" }}>-3.2% vs maio</span></div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
          <div className="flex items-center gap-2 mb-3"><div className="w-3 h-3 rounded-full" style={{ background: saldo >= 0 ? "#2d5016" : "#b93232" }} /><span style={{ fontSize: "0.72rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Saldo / Lucro</span></div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: saldo >= 0 ? "#2d5016" : "#b93232", fontWeight: 700 }}>R$ {(saldo/1000).toFixed(1)}k</div>
          <div style={{ fontSize: "0.72rem", color: "#7a7060", marginTop: 4 }}>Resultado do período</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="rounded-2xl p-5" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
          <div className="mb-4">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Relatório Mensal</h3>
            <p style={{ fontSize: "0.78rem", color: "#7a7060" }}>Entradas e saídas — 6 meses</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dynamicMonthly} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,35,18,0.06)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#7a7060" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.1)", borderRadius: 10, fontSize: 12 }} formatter={(val, name) => [`R$ ${Number(val ?? 0).toLocaleString("pt-BR")}`, name === "receita" ? "Entrada" : "Saída"]} />
              <Bar dataKey="receita" fill="#2d5016" radius={[3, 3, 0, 0]} />
              <Bar dataKey="despesa" fill="#c4882a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
          <div className="mb-3">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Saídas por Categoria</h3>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={56} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(val, _, p) => [`R$ ${Number(val ?? 0).toLocaleString("pt-BR")}`, p.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-2">
                {pieData.slice(0, 5).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} /><span style={{ fontSize: "0.72rem", color: "#7a7060" }} className="truncate max-w-28">{item.name}</span></div>
                    <span style={{ fontSize: "0.72rem", fontFamily: "'DM Mono', monospace", color: "#1c1a17" }}>R$ {item.value.toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="flex items-center justify-center h-32" style={{ color: "#7a7060", fontSize: "0.875rem" }}>Sem despesas</div>}
        </div>
      </div>

      {/* Extrato */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(44,35,18,0.06)" }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>Extrato</h3>
            <p style={{ fontSize: "0.78rem", color: "#7a7060" }}>{transactions.length} transações</p>
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#ede8df" }}>
            {(["todos", "receita", "despesa"] as const).map(f => (
              <button key={f} onClick={() => setTypeFilter(f)} className="px-3 py-1 rounded-lg" style={{ background: typeFilter === f ? "#fdfaf5" : "transparent", fontSize: "0.75rem", color: typeFilter === f ? "#1c1a17" : "#7a7060" }}>
                {f === "todos" ? "Todos" : f === "receita" ? "Entradas" : "Saídas"}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#f7f4ef", borderBottom: "1px solid rgba(44,35,18,0.06)" }}>
              {["Data", "Descrição", "Categoria", "Pagamento", "Valor", ""].map(h => (
                <th key={h} className="px-5 py-2.5 text-left" style={{ fontSize: "0.67rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(44,35,18,0.04)" : "none" }}>
                <td className="px-5 py-3" style={{ fontSize: "0.75rem", fontFamily: "'DM Mono', monospace", color: "#7a7060" }}>{t.date.slice(8, 10)}/{t.date.slice(5, 7)}/{t.date.slice(0, 4)}</td>
                <td className="px-5 py-3" style={{ fontSize: "0.85rem", color: "#1c1a17" }}>{t.description}</td>
                <td className="px-5 py-3"><span className="px-2.5 py-1 rounded-full" style={{ fontSize: "0.68rem", background: "#ede8df", color: "#7a7060", fontWeight: 500 }}>{t.category}</span></td>
                <td className="px-5 py-3" style={{ fontSize: "0.78rem", color: "#7a7060" }}>{t.method}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    {t.type === "receita" ? <ArrowUpRight size={13} style={{ color: "#2d5016" }} /> : <ArrowDownRight size={13} style={{ color: "#b93232" }} />}
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.875rem", color: t.type === "receita" ? "#2d5016" : "#b93232", fontWeight: 600 }}>R$ {t.value.toLocaleString("pt-BR")}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <button aria-label="Excluir transação" onClick={() => deleteTransaction(t.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#b9323212", color: "#b93232" }}><Trash2 size={12} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center" style={{ fontSize: "0.875rem", color: "#7a7060" }}>Nenhuma transação</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}





