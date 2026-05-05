import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChevronDown } from 'lucide-react';
import './Header.scss';

const Header = () => {
  const { user } = useContext(AuthContext);

  // Nome fixo conforme solicitado para o protótipo
  const username = 'Rogerinho';
  const role = user?.role || 'Visitante';

  // Usando um avatar genérico bonito via API do randomuser
  const avatarUrl = "https://randomuser.me/api/portraits/men/32.jpg";

  // Formata o papel para a badge
  const formatRole = (r) => {
    if (r === 'admin') return 'Admin';
    if (r === 'medico') return 'Médico';
    if (r === 'paciente') return 'Paciente';
    return r;
  };

  return (
    <header className="top-header">
      <div className="user-profile">
        <img src={avatarUrl} alt="Avatar" className="avatar" />
        <div className="user-details">
          <span className="user-name">{username}</span>
          <span className="role-badge">{formatRole(role)}</span>
        </div>
        <ChevronDown size={20} className="dropdown-icon" />
      </div>
    </header>
  );
};

export default Header;
