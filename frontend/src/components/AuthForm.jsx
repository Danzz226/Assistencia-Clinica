// components/Auth/AuthForm.jsx

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.scss';

const AuthForm = ({ mode = 'login', role = 'doctor' }) => {
  const isSignup = mode === 'signup';

  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    phone: '',
    crm: '',
    cpf: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const { login, register } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg('');

    if (isSignup) {
      if (formData.password !== formData.confirmPassword) {
        return setErrorMsg('As senhas não coincidem');
      }

      try {
        // Mapear campos para os nomes do backend (CadastroUsuarioDTO)
        const tipo = role === 'doctor' ? 'medico' : 'paciente';
        const payload = {
          nome: formData.name,
          email: formData.identifier,
          senha: formData.password,
          tipo: tipo,
        };

        // Campos específicos por tipo
        if (tipo === 'medico') {
          payload.crm = formData.crm;
        }

        if (tipo === 'paciente') {
          if (formData.phone) payload.telefone = formData.phone;
        }

        const result = await register(payload);

        if (result.success) {
          navigate('/login');
        } else {
          setErrorMsg(result.message || 'Erro ao criar conta');
        }
      } catch (err) {
        setErrorMsg('Erro interno');
      }

      return;
    }

    // LOGIN
    let systemRole = role === 'doctor' ? 'medico' : role;

    if (formData.identifier.toLowerCase().includes('admin')) {
      systemRole = 'admin';
    }

    const result = await login(
      formData.identifier,
      formData.password,
      systemRole,
      mfaRequired ? mfaCode : undefined
    );

    if (result.mfaRequired) {
      setMfaRequired(true);
      setErrorMsg('Digite o código MFA do seu autenticador');
      return;
    }

    if (result.success) {
      if (result.role === 'admin') navigate('/admin/home');
      else if (result.role === 'medico') navigate('/medico/home');
      else navigate('/paciente/home');
    } else {
      setErrorMsg(result.message || 'Erro ao fazer login');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {errorMsg && (
        <div className="error-message">
          {errorMsg}
        </div>
      )}

      {isSignup && (
        <div className="form-group">
          <label>Nome Completo</label>

          <input
            type="text"
            name="name"
            placeholder="Seu nome"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
      )}

      <div className="form-group">
        <label>E-mail ou Telefone</label>

        <input
          type="text"
          name="identifier"
          placeholder={
            role === 'doctor'
              ? 'medico@exemplo.com'
              : 'paciente@exemplo.com'
          }
          value={formData.identifier}
          onChange={handleChange}
          required
        />
      </div>

      {isSignup && (
        <div className="form-group">
          <label>Telefone</label>

          <input
            type="text"
            name="phone"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
      )}

      {isSignup && role === 'doctor' && (
        <div className="form-group">
          <label>CRM</label>

          <input
            type="text"
            name="crm"
            placeholder="CRM 123456"
            value={formData.crm}
            onChange={handleChange}
            required
          />
        </div>
      )}

      {isSignup && role !== 'doctor' && (
        <div className="form-group">
          <label>CPF</label>

          <input
            type="text"
            name="cpf"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={handleChange}
            required
          />
        </div>
      )}

      <div className="form-group">
        <label>Senha</label>

        <input
          type="password"
          name="password"
          placeholder="Sua senha"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      {isSignup && (
        <div className="form-group">
          <label>Confirmar Senha</label>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirme sua senha"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
      )}

      {/* Campo MFA — aparece somente quando o backend pede código */}
      {!isSignup && mfaRequired && (
        <div className="form-group">
          <label>Código MFA (6 dígitos)</label>
          <input
            type="text"
            name="mfaCode"
            placeholder="000000"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            maxLength={6}
            autoFocus
            style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem' }}
          />
        </div>
      )}

      <button type="submit" className="btn-primary">
        {isSignup ? 'Criar Conta' : mfaRequired ? 'Verificar Código' : 'Entrar'}
      </button>

      <div className="auth-footer">
        {isSignup ? (
          <>
            Já possui conta? <Link to="/login">Entrar</Link>
          </>
        ) : (
          <>
            Não tem uma conta?{' '}
            <Link to="/signup">Crie uma aqui!</Link>
          </>
        )}
      </div>
    </form>
  );
};

export default AuthForm;
