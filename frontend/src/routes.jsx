import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';

import AdminHome from './pages/Admin/AdminHome';
import DoctorHome from './pages/Doctor/DoctorHome';
import PatientHome from './pages/Patient/PatientHome';
import ManageUsers from './pages/Admin/ManageUsers';
import AdminAppointments from './pages/Admin/AdminAppointments';
import Reports from './pages/Admin/Reports';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      {/* Redirecionamento padrão */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rotas Protegidas - Admin */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<AdminHome />} />
        
        <Route path="usuarios" element={<ManageUsers />} />
        
        <Route path="controle/agendamentos" element={<AdminAppointments />} />
        
        {/* Relatorios */}
        <Route path="controle/relatorios" element={<Reports />} />
        
        <Route path="" element={<Navigate to="home" replace />} />
      </Route>

      {/* Rotas Protegidas - Médico */}
      <Route 
        path="/medico" 
        element={
          <ProtectedRoute allowedRoles={['medico']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<DoctorHome />} />
        <Route path="" element={<Navigate to="home" replace />} />
      </Route>

      {/* Rotas Protegidas - Paciente */}
      <Route 
        path="/paciente" 
        element={
          <ProtectedRoute allowedRoles={['paciente']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<PatientHome />} />
        <Route path="" element={<Navigate to="home" replace />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
