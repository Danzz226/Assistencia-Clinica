// components/Auth/AuthForm.jsx

import React, { useState, useRef, useContext } from 'react';
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
    password: '',
    confirmPassword: '',
    mfaCode: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const pendingCredentials = useRef(null);

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin/home');
    else if (role === 'medico') navigate('/medico/home');
    else navigate('/paciente/home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isSignup) {
      if (formData.password !== formData.confirmPassword) {
        return setErrorMsg('As senhas não coincidem');
      }

      try {
        const payload = {
          nome: formData.name,
          email: formData.identifier,
          telefone: formData.phone,
          senha: formData.password,
          tipo: role === 'doctor' ? 'medico' : 'paciente',
          crm: formData.crm,
        };

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

    // LOGIN — passo MFA
    if (mfaRequired) {
      const { email, password } = pendingCredentials.current;
      const result = await login(email, password, formData.mfaCode);

      if (result.success) {
        redirectByRole(result.role);
      } else {
        setErrorMsg(result.message || 'Código MFA inválido');
      }
      return;
    }

    // LOGIN — primeiro passo
    const result = await login(formData.identifier, formData.password);

    if (result.mfaRequired) {
      pendingCredentials.current = { email: formData.identifier, password: formData.password };
      setMfaRequired(true);
      return;
    }

    if (result.success) {
      redirectByRole(result.role);
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

      {mfaRequired ? (
        <div className="form-group">
          <p className="mfa-hint">
            Digite o código de 6 dígitos do seu aplicativo autenticador.
          </p>
          <label>Código TOTP</label>
          <input
            type="text"
            name="mfaCode"
            placeholder="000000"
            value={formData.mfaCode}
            onChange={handleChange}
            maxLength={6}
            autoFocus
            required
          />
        </div>
      ) : (
        <>
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
        </>
      )}

      <button type="submit" className="btn-primary">
        {mfaRequired ? 'Verificar' : isSignup ? 'Criar Conta' : 'Entrar'}
      </button>

      {!mfaRequired && (
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
      )}
    </form>
  );
};

export default AuthForm;
