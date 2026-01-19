import { useEffect, useState } from "react";
import { api } from "../api";

export default function Tickets({ onOpen }) {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api("/tickets").then(setTickets);
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>🎫 Mis Tickets</h2>

      <div style={styles.grid}>
        {tickets.map(t => (
          <div key={t.id} style={styles.card} onClick={() => onOpen(t.id)}>
            <div style={styles.header}>
              <strong>#{t.id}</strong>
              <span style={{
                ...styles.status,
                background: statusColor(t.status)
              }}>
                {t.status}
              </span>
            </div>

            <div style={styles.title}>{t.title}</div>

            <div style={styles.meta}>
              <div>👤 Usuario: {t.user_id}</div>
              <div>🕒 {new Date(t.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const statusColor = status => {
  if (status === "open") return "#3b82f6";
  if (status === "in_progress") return "#f59e0b";
  if (status === "closed") return "#10b981";
  return "#6b7280";
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16
  },
  card: {
    background: "white",
    padding: 16,
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(0,0,0,.08)",
    cursor: "pointer",
    transition: "transform .15s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10
  },
  status: {
    color: "white",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8
  },
  meta: {
    fontSize: 12,
    color: "#555",
    display: "flex",
    flexDirection: "column",
    gap: 4
  }
};
