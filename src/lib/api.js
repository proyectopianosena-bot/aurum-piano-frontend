const API_URL = import.meta.env.VITE_API_URL || "https://aurum-piano-api.onrender.com";

export async function api(path, options = {}) {
  const token = localStorage.getItem("aurum_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Error en la solicitud");
  }
  return data;
}

export { API_URL };
