import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Admin
import AdminHome from './pages/Admin/AdminHome';
import ManageUsers from './pages/Admin/ManageUsers';
import AdminAppointments from './pages/Admin/AdminAppointments';
import Reports from './pages/Admin/Reports';

// Médico
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorPatients from './pages/Doctor/DoctorPatients';
import DoctorExams from './pages/Doctor/DoctorExams';
import DoctorSchedule from './pages/Doctor/DoctorSchedule';

// Paciente
import PatientHome from './pages/Patient/PatientHome';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ─── Admin ─── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="home"                    element={<AdminHome />} />
        <Route path="usuarios"                element={<ManageUsers />} />
        <Route path="controle/agendamentos"   element={<AdminAppointments />} />
        <Route path="controle/relatorios"     element={<Reports />} />
        <Route path=""                        element={<Navigate to="home" replace />} />
      </Route>

      {/* ─── Médico ─── */}
      <Route
        path="/medico"
        element={
          <ProtectedRoute allowedRoles={['medico']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard principal com stats e prontuários recentes */}
        <Route path="home"      element={<DoctorDashboard />} />

        {/* Lista de pacientes vinculados ao médico via prontuários */}
        <Route path="pacientes" element={<DoctorPatients />} />

        {/* Prontuários (aba 1) e Exames (aba 2) do médico */}
        <Route path="exames"    element={<DoctorExams />} />

        {/* Grade semanal de horários de atendimento */}
        <Route path="horarios"  element={<DoctorSchedule />} />

        <Route path="" element={<Navigate to="home" replace />} />
      </Route>

      {/* ─── Paciente ─── */}
      <Route
        path="/paciente"
        element={
          <ProtectedRoute allowedRoles={['paciente']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<PatientHome />} />
        <Route path=""     element={<Navigate to="home" replace />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
