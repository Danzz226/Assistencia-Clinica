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
      const { token, nome, email: responseEmail, tipo, mfaRequired, mfaEnabled } = response.data;

      // Backend pede código MFA
      if (mfaRequired && !token) {
        return { success: false, mfaRequired: true };
      }

      const loggedUser = { username: nome, email: responseEmail || email, role: tipo, mfaEnabled: !!mfaEnabled };
      setUser(loggedUser);
      localStorage.setItem('usuario', JSON.stringify(loggedUser));
      localStorage.setItem('token', token);
      return { success: true, role: tipo };
    } catch (error) {
      const message = error.response?.data?.erro || error.response?.data?.message || 'Usuário ou senha inválidos';
      return { success: false, message };
    }
  };

  /**
   * Registro de novo usuário via backend (signup).
   * Recebe payload já mapeado para os nomes do backend.
   */
  const register = async (payload) => {
    try {
      await api.post('/auth/register', payload);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.erro || error.response?.data?.message || 'Erro ao criar conta';
      return { success: false, message };
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
