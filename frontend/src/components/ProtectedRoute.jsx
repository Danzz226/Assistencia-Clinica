import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ResetPasswordModal from './Modal/ResetPasswordModal';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { authenticated, user, loading, updateUser } = useContext(AuthContext);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const homeRoutes = {
      'admin': '/admin/home',
      'medico': '/medico/home',
      'paciente': '/paciente/home'
    };
    return <Navigate to={homeRoutes[user?.role] || '/login'} replace />;
  }

  if (user?.forcarTrocaSenha) {
    return (
      <>
        {children}
        <ResetPasswordModal
          isOpen={true}
          onClose={() => {}}
          usuario={{ id: user.id, nome: user.username }}
          isSelf={true}
          forced={true}
          onSuccess={() => updateUser({ forcarTrocaSenha: false })}
        />
      </>
    );
  }

  return children;
};

export default ProtectedRoute;
