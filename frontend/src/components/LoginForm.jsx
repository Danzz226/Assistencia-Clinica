import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ role }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { role, identifier, password });
    
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="identifier">E-mail ou Telefone</label>
        <input 
          type="text" 
          id="identifier" 
          placeholder={role === 'doctor' ? 'medico@exemplo.com' : 'paciente@exemplo.com'} 
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Senha</label>
        <input 
          type="password" 
          id="password" 
          placeholder="Sua senha" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn-primary">
        Entrar
      </button>

      <div className="login-footer">
        Não tem uma conta? <a href="/signup">Crie uma aqui!</a>
      </div>
    </form>
  );
};

export default LoginForm;
