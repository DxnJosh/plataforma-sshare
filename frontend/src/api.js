const API_URL = "http://127.0.0.1:5000";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://127.0.0.1:5000${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    throw new Error("Error en API");
  }

  return res.json();
}

