import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  Home, Users, Calendar, Activity, FlaskConical,
  Settings, LogOut, FileText, Stethoscope, Moon, Sun, Box, ClipboardList
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import './Sidebar.scss';
import logoImg from '../../assets/logo.png';


const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'admin'; // Fallback

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-container">
          <img src={logoImg} alt="Lifium Logo" />
        </div>
      </div>


      <nav className="sidebar-nav">
        {/* Links Admin */}
        {role === 'admin' && (
          <>
            <NavLink to="/admin/home" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Home size={20} /> <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/usuarios" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} /> <span>Gerenciar Usuários</span>
            </NavLink>
            <NavLink to="/admin/controle/agendamentos" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Calendar size={20} /> <span>Agendamentos</span>
            </NavLink>
            <NavLink to="/admin/controle/relatorios" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Activity size={20} /> <span>Relatórios</span>
            </NavLink>
          </>
        )}

        {/* Links Médico */}
        {role === 'medico' && (
          <>
            <NavLink to="/medico/home" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Home size={20} /> <span>Dashboard</span>
            </NavLink>
            <NavLink to="/medico/consultas" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <ClipboardList size={20} /> <span>Minhas Consultas</span>
            </NavLink>
            <NavLink to="/medico/horarios" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Calendar size={20} /> <span>Meus Horários</span>
            </NavLink>
            <NavLink to="/medico/pacientes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} /> <span>Meus Pacientes</span>
            </NavLink>
            <NavLink to="/medico/exames" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <FlaskConical size={20} /> <span>Exames e Prontuários</span>
            </NavLink>
          </>
        )}

        {/* Links Paciente */}
        {role === 'paciente' && (
          <>
            <NavLink to="/paciente/home" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Home size={20} /> <span>Dashboard</span>
            </NavLink>
            <NavLink to="/paciente/consultas" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Calendar size={20} /> <span>Minhas Consultas</span>
            </NavLink>
            <NavLink to="/paciente/historico-exames" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <FlaskConical size={20} /> <span>Resultados e Exames</span>
            </NavLink>
            <NavLink to="/paciente/diagnostico" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Stethoscope size={20} /> <span>Meus Diagnósticos</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className={`theme-toggle ${isDarkMode ? 'dark-mode-active' : ''}`} onClick={toggleTheme}>
          <div className="toggle-label">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <div className="toggle-switch"></div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
