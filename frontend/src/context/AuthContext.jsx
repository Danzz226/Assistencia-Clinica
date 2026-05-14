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

  const login = async (email, password, mfaCode) => {
    try {
      const payload = { email, senha: password };
      if (mfaCode) payload.mfaCode = mfaCode;

      const response = await api.post('/auth/login', payload);

      if (response.data.mfaRequired) {
        return { success: false, mfaRequired: true };
      }

      const { token, nome, tipo } = response.data;
      const loggedUser = { username: nome, email, role: tipo };
      setUser(loggedUser);
      localStorage.setItem('usuario', JSON.stringify(loggedUser));
      localStorage.setItem('token', token);
      return { success: true, role: tipo };
    } catch (error) {
      const message = error.response?.data?.erro || error.response?.data?.message || 'Usuário ou senha inválidos';
      return { success: false, message };
    }
  };

  const register = async (payload) => {
    try {
      await api.post('/auth/register', payload);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.erro || error.response?.data?.message || 'Erro ao criar conta';
      return { success: false, message };
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      return { success: true, data: updatedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao buscar perfil';
      return { success: false, message };
    }
  };

  const resetPassword = async (email) => {
    try {
      await api.post('/auth/reset-password', { email });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao redefinir senha';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, register, fetchProfile, resetPassword, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
