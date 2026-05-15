import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChevronDown, User, Lock, LogOut, ShieldCheck, ShieldOff } from 'lucide-react';
import UserProfileModal from '../Modal/UserProfileModal';
import ResetPasswordModal from '../Modal/ResetPasswordModal';
import MfaSetupModal from '../Modal/MfaSetupModal';
import './Header.scss';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled ?? false);

  useEffect(() => {
    setMfaEnabled(user?.mfaEnabled ?? false);
  }, [user?.mfaEnabled]);

  const handleDisableMfa = () => {
    setMfaModalOpen(true);
    setDropdownOpen(false);
  };

  // Nome fixo conforme solicitado para o protótipo
  const username = user?.username || 'Visitante';
  const role = user?.role || 'Visitante';

  // Usando a sigla do perfil igual ao visualizar perfil
  const Avatar = ({ nome }) => {
    const initials = nome
      ? nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
      : '?';
    return (
      <div className="header-avatar-initials">
        {initials}
      </div>
    );
  };

  // Formata o papel para a badge
  const formatRole = (r) => {
    if (r === 'admin') return 'Admin';
    if (r === 'medico') return 'Médico';
    if (r === 'paciente') return 'Paciente';
    return r;
  };

  // Mapeia o usuário do contexto para o formato esperado pelos modais
  const mappedUser = {
    id: user?.id || 1, // Fallback id
    nome: username,
    email: user?.email,
    tipo: user?.role
  };

  return (
    <header className="top-header">
      <div className="header-user-container">
        <div 
          className={`user-profile${dropdownOpen ? ' active' : ''}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <Avatar nome={username} />
          <div className="user-details">
            <span className="user-name">{username}</span>
            <span className="role-badge">{formatRole(role)}</span>
          </div>
          <ChevronDown 
            size={20} 
            className="dropdown-icon" 
            style={{ 
              transition: 'transform 0.2s',
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          />
        </div>

        {dropdownOpen && (
          <>
            <div className="dropdown-overlay" onClick={() => setDropdownOpen(false)} />
            <div className="header-dropdown-menu">
              <button 
                className="dropdown-item" 
                onClick={() => {
                  setProfileModalOpen(true);
                  setDropdownOpen(false);
                }}
              >
                <User size={16} />
                Ver Perfil
              </button>
              <button 
                className="dropdown-item" 
                onClick={() => {
                  setResetModalOpen(true);
                  setDropdownOpen(false);
                }}
              >
                <Lock size={16} />
                Redefinir Senha
              </button>
              {mfaEnabled ? (
                <button
                  className="dropdown-item"
                  onClick={handleDisableMfa}
                >
                  <ShieldOff size={16} />
                  Desativar MFA
                </button>
              ) : (
                <button
                  className="dropdown-item"
                  onClick={() => { setMfaModalOpen(true); setDropdownOpen(false); }}
                >
                  <ShieldCheck size={16} />
                  Ativar MFA
                </button>
              )}
              <div className="dropdown-divider" />
              <button
                className="dropdown-item logout"
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </>
        )}
      </div>

      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        usuario={mappedUser}
      />

      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        usuario={mappedUser}
        isSelf={true}
      />

      <MfaSetupModal
        isOpen={mfaModalOpen}
        onClose={() => setMfaModalOpen(false)}
        onEnabled={(enabled) => setMfaEnabled(enabled)}
      />
    </header>
  );
};

export default Header;
