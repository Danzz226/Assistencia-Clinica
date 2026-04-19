import React, { useState } from 'react';
import './Login.css';
import RoleToggle from '../components/RoleToggle';
import LoginForm from '../components/LoginForm';

const DOCTOR_IMAGE_URL = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop";

const Login = () => {
  const [role, setRole] = useState('doctor');

  return (
    <div className="login-container">
      <div className="login-left">
        <img 
          src={DOCTOR_IMAGE_URL} 
          alt="Medico" 
          className="login-image" 
        />
        <div className="login-image-overlay"></div>
      </div>
      
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
