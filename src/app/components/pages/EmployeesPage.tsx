import { useState } from "react";
import { Plus, Edit2, Trash2, X, Phone, Mail } from "lucide-react";
import type { Store, Employee, EmployeeStatus } from "../../store/useStore";

const STATUS_CFG: Record<EmployeeStatus, { label: string; bg: string; text: string }> = {
  ativo: { label: "Ativo", bg: "#2d501615", text: "#2d5016" },
  inativo: { label: "Inativo", bg: "#b9323215", text: "#b93232" },
  férias: { label: "Férias", bg: "#c4882a15", text: "#c4882a" },
};

const ROLES = ["Gerente Geral", "Recepcionista", "Guia Turístico", "Cozinheira", "Cozinheiro", "Manutenção", "Camareira", "Camareiro", "Jardineiro", "Segurança", "Auxiliar Geral"];

function EmployeeModal({ employee, onSave, onClose }: { employee?: Employee; onSave: (d: Omit<Employee, "id">) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: employee?.name || "", role: employee?.role || ROLES[0], salary: employee?.salary || 0,
    phone: employee?.phone || "", email: employee?.email || "", admissionDate: employee?.admissionDate || "",
    status: employee?.status || "ativo" as EmployeeStatus
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(10,18,7,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "#fdfaf5" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e14", fontWeight: 600 }}>{employee ? "Editar Funcionário" : "Novo Funcionário"}</h2>
          <button aria-label="Fechar" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ede8df" }}><X size={15} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Nome Completo *", key: "name", type: "text", col: "2" },
            { label: "Telefone", key: "phone", type: "text", col: "1" },
            { label: "E-mail", key: "email", type: "email", col: "1" },
            { label: "Salário (R$)", key: "salary", type: "number", col: "1" },
            { label: "Data de Admissão", key: "admissionDate", type: "date", col: "1" },
          ].map(({ label, key, type, col }) => (
            <div key={key} style={{ gridColumn: col === "2" ? "1/-1" : "auto" }}>
              <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>{label}</label>
              <input aria-label={label} type={type} value={form[key as keyof typeof form] as string} onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? +e.target.value : e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Cargo</label>
            <select aria-label="Cargo" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#7a7060", fontWeight: 500, display: "block", marginBottom: 6 }}>Status</label>
            <select aria-label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as EmployeeStatus }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "#f0ead8", border: "1px solid rgba(44,35,18,0.12)", fontSize: "0.875rem" }}>
              <option value="ativo">Ativo</option><option value="inativo">Inativo</option><option value="férias">Férias</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button aria-label="Cancelar" onClick={onClose} className="flex-1 py-2.5 rounded-xl" style={{ background: "#ede8df", fontSize: "0.875rem" }}>Cancelar</button>
          <button aria-label="Salvar" onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem" }}>
            {employee ? "Salvar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function fmt(d: string) { if (!d) return "—"; return `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`; }

export function EmployeesPage({ store }: { store: Store }) {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = store;
  const [modal, setModal] = useState<Employee | null | "new">(null);
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "todos">("todos");

  const filtered = employees.filter(e => statusFilter === "todos" || e.status === statusFilter);
  const totalSalary = employees.filter(e => e.status === "ativo").reduce((s, e) => s + e.salary, 0);

  return (
    <div className="flex flex-col gap-5">
      {modal !== null && (
        <EmployeeModal
          employee={modal === "new" ? undefined : modal}
          onSave={data => modal === "new" ? addEmployee(data) : modal && updateEmployee(modal.id, data)}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1a2e14", fontWeight: 600 }}>Funcionários</h1>
          <p style={{ fontSize: "0.82rem", color: "#7a7060" }}>{employees.filter(e => e.status === "ativo").length} ativos · Folha: R$ {totalSalary.toLocaleString("pt-BR")}/mês</p>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.875rem", fontWeight: 500 }}>
          <Plus size={16} /> Novo Funcionário
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {(["ativo", "inativo", "férias"] as EmployeeStatus[]).map(s => {
          const cfg = STATUS_CFG[s];
          const count = employees.filter(e => e.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "todos" : s)} className="rounded-2xl p-4 flex items-center gap-3 transition-all" style={{ background: statusFilter === s ? cfg.bg : "#fdfaf5", border: `1.5px solid ${statusFilter === s ? cfg.text + "40" : "rgba(44,35,18,0.08)"}` }}>
              <div className="w-2 h-10 rounded-full" style={{ background: cfg.text }} />
              <div className="text-left">
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1c1a17" }}>{count}</div>
                <div style={{ fontSize: "0.75rem", color: "#7a7060" }}>{cfg.label}{s === "ativo" ? "s" : ""}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#f0ead8", borderBottom: "1px solid rgba(44,35,18,0.07)" }}>
              {["Funcionário", "Cargo", "Contato", "Salário", "Admissão", "Status", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: "0.68rem", color: "#7a7060", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp, i) => (
              <tr key={emp.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(44,35,18,0.05)" : "none" }}>
                <td className="px-5 py-3.5">
                  <div style={{ fontSize: "0.875rem", color: "#1c1a17", fontWeight: 500 }}>{emp.name}</div>
                </td>
                <td className="px-5 py-3.5" style={{ fontSize: "0.82rem", color: "#7a7060" }}>{emp.role}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1" style={{ fontSize: "0.78rem", color: "#7a7060" }}><Phone size={11} /> {emp.phone}</div>
                    {emp.email && <div className="flex items-center gap-1" style={{ fontSize: "0.75rem", color: "#7a7060" }}><Mail size={11} /> {emp.email}</div>}
                  </div>
                </td>
                <td className="px-5 py-3.5" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", color: "#2d5016", fontWeight: 500 }}>R$ {emp.salary.toLocaleString("pt-BR")}</td>
                <td className="px-5 py-3.5" style={{ fontSize: "0.8rem", fontFamily: "'DM Mono', monospace", color: "#7a7060" }}>{fmt(emp.admissionDate)}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded-full" style={{ fontSize: "0.68rem", background: STATUS_CFG[emp.status].bg, color: STATUS_CFG[emp.status].text, fontWeight: 600, textTransform: "uppercase" }}>
                    {STATUS_CFG[emp.status].label}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button aria-label="Editar funcionário" onClick={() => setModal(emp)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#2d501615", color: "#2d5016" }}><Edit2 size={12} /></button>
                    <button aria-label="Excluir funcionário" onClick={() => deleteEmployee(emp.id, emp.name)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#b9323215", color: "#b93232" }}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center" style={{ fontSize: "0.875rem", color: "#7a7060" }}>Nenhum funcionário encontrado</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
