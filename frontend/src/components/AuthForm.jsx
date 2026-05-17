// components/Auth/AuthForm.jsx

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MfaLoginModal from './Modal/MfaLoginModal';
import PasswordStrengthMeter, { getPasswordStrength } from './Modal/PasswordStrengthMeter';
import PasswordInput from './Modal/PasswordInput';
import CustomSelect from './CustomSelect/CustomSelect';
import { ESTADOS_BR } from './CustomSelect/states';
import './Auth.scss';

const formatPhone = (val) => {
  if (!val) return '';
  let num = val.replace(/\D/g, '');
  if (num.length > 11) num = num.substring(0, 11);
  if (num.length <= 2) return num ? `(${num}` : '';
  if (num.length <= 7) return `(${num.substring(0, 2)}) ${num.substring(2)}`;
  return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
};

const AuthForm = ({ mode = 'login', role = 'doctor' }) => {
  const isSignup = mode === 'signup';

  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    phone: '',
    crm: '',
    uf: '',
    cpf: '',
    password: '',
    confirmPassword: '',
  });

  const { toast } = useToast();
  const [mfaRequired, setMfaRequired] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState(null);

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

    if (isSignup) {
      if (getPasswordStrength(formData.password).level < 2) {
        toast.error('senha muito fraca');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }

      try {
       
        const tipo = role === 'doctor' ? 'medico' : 'paciente';
        const payload = {
          nome: formData.name,
          email: formData.identifier,
          senha: formData.password,
          tipo: tipo,
        };

 
        if (tipo === 'medico') {
          payload.crm = formData.crm;
          if (formData.uf) payload.uf = formData.uf;
        }

        if (tipo === 'paciente') {
          if (formData.phone) payload.telefone = formData.phone;
        }

        const result = await register(payload);

        if (result.success) {
          toast.success('Conta criada com sucesso!');
          navigate('/login');
        } else {
          toast.error(result.message || 'Erro ao criar conta');
        }
      } catch (err) {
        toast.error('Erro interno');
      }

      return;
    }

    // LOGIN
    let systemRole = role === 'doctor' ? 'medico' : role;

    if (formData.identifier.toLowerCase().includes('admin')) {
      systemRole = 'admin';
    }

    const result = await login(formData.identifier, formData.password, systemRole);

    if (result.mfaRequired) {
      setPendingCredentials({ email: formData.identifier, password: formData.password, role: systemRole });
      setMfaRequired(true);
      return;
    }

    if (result.success) {
      if (result.role === 'admin') navigate('/admin/home');
      else if (result.role === 'medico') navigate('/medico/home');
      else navigate('/paciente/home');
    } else {
      toast.error(result.message || 'Erro ao fazer login');
    }
  };

  const handleMfaVerify = async (mfaCode) => {
    const result = await login(
      pendingCredentials.email,
      pendingCredentials.password,
      pendingCredentials.role,
      mfaCode
    );

    if (result.success) {
      if (result.role === 'admin') navigate('/admin/home');
      else if (result.role === 'medico') navigate('/medico/home');
      else navigate('/paciente/home');
    }

    return result;
  };

  const handleMfaClose = () => {
    setMfaRequired(false);
    setPendingCredentials(null);
  };

  return (
    <>
      <MfaLoginModal
      isOpen={mfaRequired}
      onClose={handleMfaClose}
      onVerify={handleMfaVerify}
    />
      <form className="auth-form" onSubmit={handleSubmit}>
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
            onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
            maxLength={15}
            required
          />
        </div>
      )}

      {isSignup && role === 'doctor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label>UF</label>
            <CustomSelect
              options={ESTADOS_BR}
              value={formData.uf}
              onChange={(v) => setFormData(prev => ({ ...prev, uf: v }))}
              placeholder="Estado"
            />
          </div>
          <div className="form-group">
            <label>CRM</label>
            <input
              type="text"
              name="crm"
              placeholder="Ex: 123456"
              value={formData.crm}
              onChange={handleChange}
              required
              maxLength={6}
            />
          </div>
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

        <PasswordInput
          name="password"
          placeholder={isSignup ? 'Mínimo 8 caracteres' : 'Sua senha'}
          value={formData.password}
          onChange={handleChange}
          required
          minLength={isSignup ? 8 : undefined}
        />
        {isSignup && <PasswordStrengthMeter password={formData.password} />}
      </div>

      {isSignup && (
        <div className="form-group">
          <label>Confirmar Senha</label>

          <PasswordInput
            name="confirmPassword"
            placeholder="Confirme sua senha"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
      )}

      <button type="submit" className="btn-primary">
        {isSignup ? 'Criar Conta' : 'Entrar'}
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
    </>
  );
};

export default AuthForm;
