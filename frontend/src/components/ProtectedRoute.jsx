import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { authenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Se não tiver permissão, manda pra home específica do perfil
    const homeRoutes = {
      'admin': '/admin/home',
      'medico': '/medico/home',
      'paciente': '/paciente/home'
    };
    return <Navigate to={homeRoutes[user?.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
