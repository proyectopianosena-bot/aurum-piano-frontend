import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("aurum_token");

    if (!token) {
      setLoading(false);
      return;
    }

    // Timeout de 5s — si el backend no responde, igual mostramos la página
    const timeout = setTimeout(() => {
      localStorage.removeItem("aurum_token");
      setUser(null);
      setLoading(false);
    }, 5000);

    api("/auth/me")
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("aurum_token");
        setUser(null);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("aurum_token", data.token);
    setUser(data.user);

    return data.user;
  };

  const confirmRegister = async (email, code) => {
    const data = await api("/auth/register/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });

    localStorage.setItem("aurum_token", data.token);
    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("aurum_token");
    setUser(null);
  };

  const updateAvatar = (avatar) => {
    setUser((prev) => (prev ? { ...prev, avatar } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        confirmRegister,
        logout,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}