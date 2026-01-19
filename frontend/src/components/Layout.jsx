export default function Layout({ children, onNav }) {
  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <h2 style={{ marginBottom: 20 }}>🧩 SShare</h2>
        <button style={styles.btn} onClick={() => onNav("tickets")}>🎫 Tickets</button>
        <button style={styles.btn} onClick={() => onNav("notifications")}>🔔 Notificaciones</button>
        <button style={styles.btn} onClick={() => onNav("admin")}>🛠 Admin</button>
      </aside>

      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  app: { display: "flex", height: "100vh", fontFamily: "Arial" },
  sidebar: {
    width: 220,
    background: "#1f2933",
    color: "white",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  btn: {
    background: "transparent",
    color: "white",
    border: "none",
    padding: "10px 0",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 14
  },
  main: {
    flex: 1,
    background: "#f5f7fa",
    padding: 20,
    overflowY: "auto"
  }
};
