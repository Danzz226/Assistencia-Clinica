import React, { useState } from 'react';

import './Login.scss';

import RoleToggle from '../components/RoleToggle';
import AuthForm from '../components/AuthForm';
import LoginPresentation from '../components/LoginPresentation/LoginPresentation';

const Signup = () => {
  const [role, setRole] = useState('doctor');

  return (
    <div className="login-container">
      <LoginPresentation />

      <div className="login-right">
        <div className="login-box">
          <img
            src="/src/assets/logo.png"
            alt="Logo"
            className="login-logo"
          />

          <h1>Criar Conta</h1>

          <RoleToggle
            role={role}
            setRole={setRole}
          />

          <AuthForm
            mode="signup"
            role={role}
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;