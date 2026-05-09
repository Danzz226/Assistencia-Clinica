import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './LoginForm.css';

const LoginForm = ({ role }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Mapeamento simples do role do UI para o sistema
    let systemRole = role === 'doctor' ? 'medico' : role;
    if (identifier.toLowerCase().includes('admin')) systemRole = 'admin';

    const result = await login(identifier, password, systemRole);
    
    if (result.success) {
      if (result.role === 'admin') navigate('/admin/home');
      else if (result.role === 'medico') navigate('/medico/home');
      else navigate('/paciente/home');
    } else {
      setErrorMsg(result.message || 'Erro ao fazer login');
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {errorMsg && <div style={{ color: '#fc8181', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{errorMsg}</div>}

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
