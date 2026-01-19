import { useEffect, useState } from "react";
import { api } from "../api";

export default function Tickets({ onOpen }) {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api("/tickets").then(setTickets);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📋 Mis tickets</h2>

      {tickets.length === 0 && <p>No tienes tickets aún.</p>}

      {tickets.map(t => (
        <div
          key={t.id}
          onClick={() => onOpen(t.id)}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 8,
            cursor: "pointer",
            borderRadius: 6
          }}
        >
          <b>#{t.id}</b> – {t.title}
          <div style={{ fontSize: 12, color: "#666" }}>
            Estado: {t.status} | Prioridad: {t.priority}
          </div>
        </div>
      ))}
    </div>
  );
}
