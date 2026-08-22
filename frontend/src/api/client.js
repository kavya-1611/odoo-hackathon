import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Attach the JWT to every outgoing request, if we have one.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pulsehr_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, force a clean logout instead of
// leaving the app in a broken half-authenticated state.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("pulsehr_token");
      localStorage.removeItem("pulsehr_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
