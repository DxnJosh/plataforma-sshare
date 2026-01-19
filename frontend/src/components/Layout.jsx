export default function Layout({ children, onNav }) {
  const token = localStorage.getItem("token");
  let email = "";

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      email = payload.sub;
    } catch {}
  }

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <h2 style={{ marginBottom: 20 }}>🧩 SShare</h2>
        <button style={styles.btn} onClick={() => onNav("tickets")}>🎫 Tickets</button>
        <button style={styles.btn} onClick={() => onNav("notifications")}>🔔 Notificaciones</button>
        <button style={styles.btn} onClick={() => onNav("admin")}>🛠 Admin</button>
      </aside>

      <div style={styles.content}>
        <header style={styles.header}>
          <div>👤 {email}</div>
          <button onClick={logout} style={styles.logout}>Cerrar sesión</button>
        </header>

        <main style={styles.main}>
          {children}
        </main>
      </div>
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
  content: { flex: 1, display: "flex", flexDirection: "column" },
  header: {
    height: 50,
    background: "#ffffff",
    borderBottom: "1px solid #ddd",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logout: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer"
  },
  main: {
    flex: 1,
    background: "#f5f7fa",
    padding: 20,
    overflowY: "auto"
  }
};
