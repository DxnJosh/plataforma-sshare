import { useEffect, useState } from "react";
import { api } from "../api";

export default function AgentDashboard({ onOpen }) {
  const [tickets, setTickets] = useState([]);

  const load = () => api("/tickets/mine").then(setTickets);

  useEffect(() => {
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  const setStatus = async (id, status) => {
    await api(`/tickets/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👨‍💻 Mis Tickets Asignados</h2>

      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.title}</td>
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
                <button onClick={() => onOpen(t.id)}>💬 Ver Chat</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}