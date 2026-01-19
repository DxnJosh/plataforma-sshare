import { useEffect, useRef, useState } from "react";
import { api } from "../api";

export default function TicketChat({ ticketId }) {
  const [comments, setComments] = useState([]);
  const [msg, setMsg] = useState("");
  const boxRef = useRef(null);

  const load = () => api(`/tickets/${ticketId}/comments`).then(setComments);

  useEffect(() => {
    load();
    const i = setInterval(load, 2500);
    return () => clearInterval(i);
  }, [ticketId]);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [comments]);

  const send = async () => {
    if (!msg.trim()) return;
    await api(`/tickets/${ticketId}/comments`, {
      method: "POST",
      body: JSON.stringify({ message: msg }),
    });
    setMsg("");
    load();
  };

  const myEmail = JSON.parse(atob(localStorage.getItem("token").split(".")[1]))?.sub;

  return (
    <div style={styles.container}>
      <div style={styles.header}>💬 Ticket #{ticketId}</div>

      <div style={styles.chatBox} ref={boxRef}>
        {comments.map(c => {
          const isMine = c.user.id == myEmail;
          return (
            <div
              key={c.id}
              style={{
                ...styles.msg,
                alignSelf: isMine ? "flex-end" : "flex-start",
                background: isMine ? "#dcf8c6" : "#fff"
              }}
            >
              <div style={styles.author}>{c.user.email}</div>
              <div>{c.message}</div>
              <div style={styles.time}>
                {new Date(c.created_at).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.inputBar}>
        <input
          style={styles.input}
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Escribe un mensaje…"
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button style={styles.button} onClick={send}>Enviar</button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", height: "100vh" },
  header: { padding: 12, background: "#075e54", color: "white", fontWeight: "bold" },
  chatBox: {
    flex: 1,
    padding: 10,
    overflowY: "auto",
    background: "#ece5dd",
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  msg: {
    maxWidth: "70%",
    padding: 8,
    borderRadius: 8,
    boxShadow: "0 1px 2px rgba(0,0,0,.2)"
  },
  author: { fontSize: 12, fontWeight: "bold" },
  time: { fontSize: 10, textAlign: "right", color: "#555" },
  inputBar: {
    display: "flex",
    padding: 10,
    borderTop: "1px solid #ccc",
    background: "#f0f0f0"
  },
  input: { flex: 1, padding: 8, borderRadius: 20, border: "1px solid #ccc" },
  button: { marginLeft: 8, padding: "8px 16px", borderRadius: 20 }
};
