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
  const login = async (email, password, selectedRole, mfaCode, mfaSetupCode) => {
    try {
      const payload = { email, senha: password };
      if (mfaCode) payload.mfaCode = mfaCode;
      if (mfaSetupCode) payload.mfaSetupCode = mfaSetupCode;

      const response = await api.post('/auth/login', payload);
      const { id, token, nome, email: responseEmail, tipo, mfaRequired, mfaSetupRequired, mfaEnabled, mfaSetupSecret, mfaSetupOtpauthUrl, forcarTrocaSenha } = response.data;

      if (mfaRequired && !token) {
        return { success: false, mfaRequired: true };
      }

      if (mfaSetupRequired && !token) {
        return { success: false, mfaSetupRequired: true, setupSecret: mfaSetupSecret, setupOtpauthUrl: mfaSetupOtpauthUrl };
      }

      const loggedUser = { id, username: nome, email: responseEmail || email, role: tipo, mfaEnabled: !!mfaEnabled, cpf: response.data.cpf ?? null, forcarTrocaSenha: !!forcarTrocaSenha };
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
      const response = await api.post('/auth/register', payload);
      const { id, token, nome, email: responseEmail, tipo, mfaEnabled } = response.data;
      if (token) {
        const loggedUser = { id, username: nome, email: responseEmail, role: tipo, mfaEnabled: !!mfaEnabled };
        setUser(loggedUser);
        localStorage.setItem('usuario', JSON.stringify(loggedUser));
        localStorage.setItem('token', token);
      }
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.erro || error.response?.data?.message || 'Erro ao criar conta';
      return { success: false, message };
    }
  };

  const updateUser = (newData) => {
    if (user) {
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);
      localStorage.setItem('usuario', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
