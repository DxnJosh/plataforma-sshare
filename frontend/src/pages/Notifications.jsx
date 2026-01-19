import { useEffect, useState } from "react";
import { api } from "../api";

export default function Notifications() {
  const [notes, setNotes] = useState([]);

  const load = () => {
    api("/tickets/notifications").then(setNotes);
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 5000); // polling cada 5s
    return () => clearInterval(i);
  }, []);

  const markRead = async (id) => {
    await api(`/tickets/notifications/${id}/read`, {
      method: "PUT",
    });
    load();
  };

  return (
    <div style={{ padding: 10 }}>
      <h3>🔔 Notificaciones</h3>

      {notes.length === 0 && <p>No tienes notificaciones</p>}

      {notes.map((n) => (
        <div
          key={n.id}
          onClick={() => markRead(n.id)}
          style={{
            border: "1px solid #ccc",
            padding: 8,
            marginBottom: 6,
            borderRadius: 6,
            background: "#f9f9f9",
            cursor: "pointer",
          }}
        >
          <b>Ticket #{n.ticket_id}</b>
          <div>{n.message}</div>
        </div>
      ))}
    </div>
  );
}
