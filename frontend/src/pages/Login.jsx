import React, { useState } from 'react';
import './Login.css';
import RoleToggle from '../components/RoleToggle';
import LoginForm from '../components/LoginForm';
import LoginPresentation from '../components/LoginPresentation/LoginPresentation';

const Login = () => {
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
          
          <h1>Entrar no Sistema</h1>
          
          <RoleToggle role={role} setRole={setRole} />
          
          <LoginForm role={role} />
        </div>
      </div>
    </div>
  );
};

export default Login;
