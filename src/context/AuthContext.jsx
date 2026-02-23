import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

  const login = async (username, password) => {
    try {
      const res = await API.post("auth/login/", { username, password });
      localStorage.setItem("access", res.data.access_token);
      localStorage.setItem("refresh", res.data.refresh_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      const role = res.data.user.role;
      if (role === "CITIZEN") navigate("/user-dashboard");
      else if (role === "OFFICER") navigate("/municipal-dashboard");
      else if (role === "ADMIN") navigate("/admin");
    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data);
      throw err;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
