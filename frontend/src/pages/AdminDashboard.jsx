import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");

  const loadTickets = () => api("/tickets/all").then(setTickets);
  const loadAgents = () => api("/tickets/agents").then(setAgents);

  useEffect(() => {
    loadTickets();
    loadAgents();
    const i = setInterval(loadTickets, 5000);
    return () => clearInterval(i);
  }, []);

  const assign = async (ticketId, agentId) => {
    if (!agentId) return;
    await api(`/tickets/${ticketId}/assign`, {
      method: "PUT",
      body: JSON.stringify({ agent_id: agentId }),
    });
    loadTickets();
  };

  const setStatus = async (ticketId, status) => {
    await api(`/tickets/${ticketId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    loadTickets();
  };

  const filteredTickets = tickets.filter(t => {
    const matchTitle = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? t.status === statusFilter : true;
    const matchAgent = agentFilter ? String(t.assigned_to) === agentFilter : true;
    return matchTitle && matchStatus && matchAgent;
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>🛠 Panel de Administración</h2>

      {/* 🔎 Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <input
          placeholder="Buscar por título…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="open">Abierto</option>
          <option value="in_progress">En proceso</option>
          <option value="closed">Cerrado</option>
        </select>

        <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)}>
          <option value="">Todos los agentes</option>
          {agents.map(a => (
            <option key={a.id} value={a.id}>
              {a.email}
            </option>
          ))}
        </select>
      </div>

      <table border="1" cellPadding="6" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Usuario</th>
            <th>Asignado a</th>
            <th>Estado</th>
            <th>Asignar Agente</th>
          </tr>
        </thead>
        <tbody>
          {filteredTickets.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.title}</td>
              <td>{t.user_id}</td>
              <td>{t.assigned_to ?? "—"}</td>
              <td>
                <select
                  value={t.status}
                  onChange={e => setStatus(t.id, e.target.value)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    background:
                      t.status === "open" ? "#ffe082" :
                      t.status === "in_progress" ? "#81d4fa" :
                      "#a5d6a7",
                    border: "1px solid #999"
                  }}
                >
                  <option value="open">🟡 Abierto</option>
                  <option value="in_progress">🔵 En proceso</option>
                  <option value="closed">🟢 Cerrado</option>
                </select>
              </td>
              <td>
                <select onChange={e => assign(t.id, e.target.value)}>
                  <option value="">-- Selecciona agente --</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.email}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}