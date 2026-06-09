import React, { useState } from 'react';
import { Sun } from 'lucide-react';

import './Login.scss';

import RoleToggle from '../components/RoleToggle';
import AuthForm from '../components/AuthForm';
import LoginPresentation from '../components/LoginPresentation/LoginPresentation';
import { useTheme } from '../hooks/useTheme';

const Signup = () => {
  const [role, setRole] = useState('doctor');
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="login-container">
      <LoginPresentation isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="login-right-wrapper">
        <button
          className={`login-theme-sun${!isDarkMode ? ' login-theme-sun--active' : ''}`}
          onClick={() => { if (isDarkMode) toggleTheme(); }}
          title="Modo claro"
        >
          <Sun size={22} />
        </button>

        <div className="login-right">
          <div className="login-box">
            <img src="/src/assets/logo.png" alt="Logo" className="login-logo" />

            <h1>Criar Conta</h1>

            <RoleToggle role={role} setRole={setRole} />

            <AuthForm mode="signup" role={role} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
