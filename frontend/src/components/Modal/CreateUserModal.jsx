import React, { useState } from 'react';
import Modal from './Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const TIPOS = [
  { value: 'paciente', label: 'Paciente' },
  { value: 'medico', label: 'Médico' },
  { value: 'admin', label: 'Administrador' },
  { value: 'funcionario', label: 'Funcionário' },
];

const INITIAL = {
  nome: '', email: '', senha: '', tipo: 'paciente',
  crm: '', especialidade: '', cargo: '',
  dataNascimento: '', telefone: '', endereco: '',
};

const CreateUserModal = ({ isOpen, onClose, onCreated }) => {
  const { toast } = useToast();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    setForm(INITIAL);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        tipo: form.tipo,
      };

      if (form.tipo === 'medico') {
        if (form.crm) payload.crm = form.crm;
        if (form.especialidade) payload.especialidade = form.especialidade;
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
      toast.error(typeof msg === 'string' ? msg : 'Erro ao criar usuário. Verifique os dados.');
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
          <label>Senha *</label>
          <input type="password" value={form.senha} onChange={set('senha')} required minLength={6} maxLength={255} placeholder="Mínimo 6 caracteres" />
        </div>

        <div className="modal-field">
          <label>Tipo de usuário *</label>
          <select value={form.tipo} onChange={set('tipo')} required>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {form.tipo === 'medico' && (
          <>
            <div className="modal-field">
              <label>CRM</label>
              <input type="text" value={form.crm} onChange={set('crm')} maxLength={50} placeholder="Ex: CRM/SP 123456" />
            </div>
            <div className="modal-field">
              <label>Especialidade</label>
              <input type="text" value={form.especialidade} onChange={set('especialidade')} maxLength={100} placeholder="Ex: Cardiologia" />
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
              <input type="text" value={form.telefone} onChange={set('telefone')} maxLength={20} placeholder="(11) 99999-9999" />
            </div>
            <div className="modal-field">
              <label>Endereço</label>
              <textarea value={form.endereco} onChange={set('endereco')} placeholder="Rua, número, bairro, cidade..." />
            </div>
          </>
        )}

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
