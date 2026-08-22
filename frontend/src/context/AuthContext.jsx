import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("pulsehr_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pulsehr_token");
    if (!token) {
      setLoading(false);
      return;
    }
    // Re-validate the session on refresh so stale/expired tokens don't
    // leave stale user data sitting in the UI.
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("pulsehr_user", JSON.stringify(res.data));
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("pulsehr_token", res.data.token);
    localStorage.setItem("pulsehr_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  async function signup(payload) {
    const res = await api.post("/auth/signup", payload);
    localStorage.setItem("pulsehr_token", res.data.token);
    localStorage.setItem("pulsehr_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem("pulsehr_token");
    localStorage.removeItem("pulsehr_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
