import { useState } from 'react';
import api from '../services/api';
import AuthContext from './auth-context';

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('usuario');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem('usuario');
      return null;
    }
  });
  const loading = false;

  const login = async (username, password, selectedRole) => {
    try {

      const response = await api.post('/usuarios/login', { username, password });

      // A API
      // retorna apenas a string de sucesso
      if (response.data === 'Login realizado com sucesso' || response.status === 200) {
        // Simulação do usuário com o perfil selecionado na tela de login
        // Quando a API tiver JWT, isso mudará para decodificar o token
        const loggedUser = { username, role: selectedRole };
        setUser(loggedUser);
        localStorage.setItem('usuario', JSON.stringify(loggedUser));
        return { success: true, role: selectedRole };
      } else {
        return { success: false, message: response.data || 'Erro no login' };
      }
    } catch (error) {
      console.error("Erro ao fazer login", error);
      
      // FALLBACK PARA TESTE: Permite login sem o backend estar rodando
      if (username.includes('teste') || username.includes('admin') || username.includes('medico') || username.includes('paciente')) {
         console.log("⚠️ API OFFLINE: Fazendo login em modo de teste");
         const loggedUser = { username, role: selectedRole };
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
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
