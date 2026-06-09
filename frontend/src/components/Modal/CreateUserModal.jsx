import React, { useState } from 'react';
import Modal from './Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import PasswordStrengthMeter, { getPasswordStrength } from './PasswordStrengthMeter';
import PasswordInput from './PasswordInput';
import CustomSelect from '../CustomSelect/CustomSelect';
import { ESTADOS_BR } from '../CustomSelect/states';
import { ESPECIALIDADES_MEDICAS } from '../CustomSelect/specialties';

const PHONE_RE = /^\(\d{2}\) \d{5}-\d{4}$/;
const CPF_RE = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

const formatCpf = (val) => {
  if (!val) return '';
  let num = val.replace(/\D/g, '');
  if (num.length > 11) num = num.substring(0, 11);
  if (num.length <= 3) return num;
  if (num.length <= 6) return `${num.substring(0, 3)}.${num.substring(3)}`;
  if (num.length <= 9) return `${num.substring(0, 3)}.${num.substring(3, 6)}.${num.substring(6)}`;
  return `${num.substring(0, 3)}.${num.substring(3, 6)}.${num.substring(6, 9)}-${num.substring(9)}`;
};

const formatPhone = (val) => {
  if (!val) return '';
  let num = val.replace(/\D/g, '');
  if (num.length > 11) num = num.substring(0, 11);
  if (num.length <= 2) return num ? `(${num}` : '';
  if (num.length <= 7) return `(${num.substring(0, 2)}) ${num.substring(2)}`;
  return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
};

const TIPOS = [
  { value: 'paciente', label: 'Paciente' },
  { value: 'medico', label: 'Médico' },
  { value: 'funcionario', label: 'Funcionário' },
];

const INITIAL = {
  nome: '', email: '', senha: '', tipo: 'paciente',
  cpf: '', crm: '', uf: '', especialidade: '', cargo: '',
  dataNascimento: '', telefone: '', endereco: '',
};

const CreateUserModal = ({ isOpen, onClose, onCreated }) => {
  const { toast } = useToast();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    setForm(INITIAL);
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.tipo === 'medico' && !form.especialidade) {
      setError('Especialidade é obrigatória para médico.');
      return;
    }

    if (form.telefone && !PHONE_RE.test(form.telefone)) {
      setError('Telefone deve estar no formato: (11) 99999-9999');
      return;
    }

    if (form.tipo === 'paciente' && !form.cpf) {
      setError('CPF é obrigatório para paciente.');
      return;
    }

    if (form.cpf && !CPF_RE.test(form.cpf)) {
      setError('CPF deve estar no formato: 000.000.000-00');
      return;
    }

    if (getPasswordStrength(form.senha).level < 2) {
      toast.error('senha muito fraca');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        tipo: form.tipo,
      };

      if (form.cpf) payload.cpf = form.cpf;

      if (form.tipo === 'medico') {
        if (form.crm) payload.crm = form.crm;
        if (form.uf) payload.uf = form.uf;
        if (form.especialidade) payload.especialidade = form.especialidade;
        if (form.telefone) payload.telefone = form.telefone;
      }

      if (form.tipo === 'funcionario') {
        if (form.cargo) payload.cargo = form.cargo;
      }

      if (form.tipo === 'paciente') {
        if (form.dataNascimento) payload.dataNascimento = form.dataNascimento;
        if (form.telefone) payload.telefone = form.telefone;
        if (form.endereco) payload.endereco = form.endereco;
      }

      await api.post('/auth/register', payload);
      toast.success('Usuário cadastrado com sucesso!');
      onCreated?.();
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      const errorMsg = typeof msg === 'string' ? msg : 'Erro ao criar usuário. Verifique os dados.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Novo Usuário">
      <form className="modal-form" onSubmit={handleSubmit}>

        <div className="modal-field">
          <label>Nome completo *</label>
          <input type="text" value={form.nome} onChange={set('nome')} required maxLength={150} placeholder="Ex: João da Silva" />
        </div>

        <div className="modal-field">
          <label>E-mail *</label>
          <input type="email" value={form.email} onChange={set('email')} required maxLength={150} placeholder="email@exemplo.com" />
        </div>

        <div className="modal-field">
          <label>CPF {form.tipo === 'paciente' ? '*' : '(opcional)'}</label>
          <input type="text" value={form.cpf} onChange={(e) => setForm(prev => ({ ...prev, cpf: formatCpf(e.target.value) }))} required={form.tipo === 'paciente'} maxLength={14} placeholder="000.000.000-00" />
        </div>

        <div className="modal-field">
          <label>Senha *</label>
          <PasswordInput value={form.senha} onChange={set('senha')} required minLength={8} maxLength={255} placeholder="Mínimo 8 caracteres" />
          <PasswordStrengthMeter password={form.senha} />
        </div>

        <div className="modal-field">
          <label>Tipo de usuário *</label>
          <select value={form.tipo} onChange={set('tipo')} required>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {form.tipo === 'medico' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
              <div className="modal-field">
                <label>UF *</label>
                <CustomSelect
                  options={ESTADOS_BR}
                  value={form.uf}
                  onChange={(v) => setForm(prev => ({ ...prev, uf: v }))}
                  placeholder="Estado"
                />
              </div>
              <div className="modal-field">
                <label>CRM *</label>
                <input type="text" value={form.crm} onChange={set('crm')} maxLength={6} placeholder="Ex: 123456" />
              </div>
            </div>
            <div className="modal-field">
              <label>Especialidade *</label>
              <CustomSelect
                options={ESPECIALIDADES_MEDICAS}
                value={form.especialidade}
                onChange={(v) => setForm(prev => ({ ...prev, especialidade: v }))}
                placeholder="Selecione a especialidade"
              />
            </div>
            <div className="modal-field">
              <label>Telefone</label>
              <input type="text" value={form.telefone} onChange={(e) => setForm(prev => ({ ...prev, telefone: formatPhone(e.target.value) }))} maxLength={15} placeholder="(11) 99999-9999" />
            </div>
          </>
        )}

        {form.tipo === 'funcionario' && (
          <div className="modal-field">
            <label>Cargo</label>
            <input type="text" value={form.cargo} onChange={set('cargo')} maxLength={100} placeholder="Ex: Recepcionista" />
          </div>
        )}

        {form.tipo === 'paciente' && (
          <>
            <div className="modal-field">
              <label>Data de nascimento</label>
              <input type="date" value={form.dataNascimento} onChange={set('dataNascimento')} />
            </div>
            <div className="modal-field">
              <label>Telefone</label>
              <input type="text" value={form.telefone} onChange={(e) => setForm(prev => ({ ...prev, telefone: formatPhone(e.target.value) }))} maxLength={15} placeholder="(11) 99999-9999" />
            </div>
            <div className="modal-field">
              <label>Endereço</label>
              <textarea value={form.endereco} onChange={set('endereco')} placeholder="Rua, número, bairro, cidade..." />
            </div>
          </>
        )}

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-footer">
          <button type="button" className="modal-btn-cancel" onClick={handleClose}>Cancelar</button>
          <button type="submit" className="modal-btn-submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Usuário'}
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default CreateUserModal;
