/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { createContext, useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { getToken, saveAuth, logoutUser } from "../services/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get("/me");
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Erreur fetch user :", err);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const [token, setToken] = useState(getToken());
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.post("/login", credentials);
      const { token, user } = response.data;
      if (token && user) {
        saveAuth(token, user);
        setToken(token);
        setUser(user);
        setIsLoggedIn(true);
        console.log('✅ Connexion réussie:', { user: user.email, role: user.role });
        return { token, user };
      } else {
        throw new Error('Réponse invalide du serveur');
      }
      } catch (error) {
        console.error('Erreur de connexion:', error);
        setError(error.response?.data?.error || 'Erreur de connexion');
        setIsLoggedIn(false);
        setUser(null);
        setToken(null);
        throw error;
      } finally {
        setLoading(false);
      }
    };
  
  // Permet de mettre à jour les infos utilisateur dans le contexte
  const updateUserData = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  };

  const register = async (userData) => {
    const response = await axiosInstance.post("/register", userData);
    const { token, user } = response.data;
    saveAuth(token, user);
    setUser(user);
    setIsLoggedIn(true);
    return response.data;
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/logout");
    } catch (err) {
      console.error("Erreur logout :", err);
    } finally {
      logoutUser();
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, register, logout, updateUserData, error }}>
      {children}
    </AuthContext.Provider>
  );
}
