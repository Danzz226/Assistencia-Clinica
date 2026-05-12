import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Login real via backend.
   * Se o backend retornar mfaRequired: true, retorna { mfaRequired: true } para o formulário.
   */
  const login = async (email, password, selectedRole, mfaCode) => {
    try {
      const payload = { email, senha: password };
      if (mfaCode) {
        payload.mfaCode = mfaCode;
      }

      const response = await api.post('/auth/login', payload);
      const { token, nome, tipo, mfaRequired } = response.data;

      // Backend pede código MFA
      if (mfaRequired && !token) {
        return { success: false, mfaRequired: true };
      }

      const loggedUser = { username: nome, email, role: tipo };
      setUser(loggedUser);
      localStorage.setItem('usuario', JSON.stringify(loggedUser));
      localStorage.setItem('token', token);
      return { success: true, role: tipo };
    } catch (error) {
      console.error("Erro ao fazer login", error);

      const msg =
        error.response?.data?.erro ||
        error.response?.data?.message ||
        (error.response
          ? `Erro do servidor (${error.response.status})`
          : 'Erro ao conectar ao servidor. Verifique se o backend está rodando.');

      return { success: false, message: msg };
    }
  };

  /**
   * Registro de novo usuário via backend (signup).
   * Recebe payload já mapeado para os nomes do backend.
   */
  const register = async (payload) => {
    try {
      const response = await api.post('/auth/register', payload);
      const { token, nome, tipo } = response.data;

      // Apenas retorna sucesso para que a tela redirecione ao login


      return { success: true, role: tipo };
    } catch (error) {
      console.error("Erro ao registrar", error);

      const msg =
        error.response?.data?.erro ||
        error.response?.data?.message ||
        (error.response
          ? `Erro do servidor (${error.response.status})`
          : 'Erro ao conectar ao servidor.');

      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
