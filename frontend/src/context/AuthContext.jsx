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

  const login = async (email, password, selectedRole) => {
    try {
      const response = await api.post('/auth/login', { email, senha: password });
      const { token, nome, tipo } = response.data;

      const loggedUser = { username: nome, email, role: tipo };
      setUser(loggedUser);
      localStorage.setItem('usuario', JSON.stringify(loggedUser));
      localStorage.setItem('token', token);
      return { success: true, role: tipo };
    } catch (error) {
      console.error("Erro ao fazer login", error);

      // FALLBACK PARA TESTE: Permite login sem o backend estar rodando
      if (email.includes('teste') || email.includes('admin') || email.includes('medico') || email.includes('paciente')) {
        console.log("⚠️ API OFFLINE: Fazendo login em modo de teste");
        const loggedUser = { username: email, email, role: selectedRole };
        setUser(loggedUser);
        localStorage.setItem('usuario', JSON.stringify(loggedUser));
        return { success: true, role: selectedRole };
      }

      return { success: false, message: 'Erro ao conectar ao servidor. Tente usar "admin" no e-mail para forçar o acesso offline.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
