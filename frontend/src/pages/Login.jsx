import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async e => {
    e.preventDefault();
    setError("");

    try {
      const res = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      if (!res.access_token) {
        setError("Credenciales inválidas");
        return;
      }

      localStorage.setItem("token", res.access_token);
      onLogin();
    } catch {
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={submit}>
        <h2 style={styles.title}>Plataforma SShare</h2>
        <p style={styles.subtitle}>Inicia sesión para continuar</p>

        {error && <div style={styles.error}>{error}</div>}

        <input
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button style={styles.button}>Entrar</button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #2563eb, #1e3a8a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    background: "white",
    padding: 32,
    borderRadius: 16,
    width: 320,
    boxShadow: "0 10px 25px rgba(0,0,0,.25)",
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  title: {
    textAlign: "center",
    marginBottom: 4
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 10
  },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14
  },
  button: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 8,
    borderRadius: 6,
    fontSize: 13
  }
};
