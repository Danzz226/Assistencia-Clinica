import React, { useState } from 'react';
import Modal from './Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import PasswordStrengthMeter, { getPasswordStrength } from './PasswordStrengthMeter';
import PasswordInput from './PasswordInput';

const INITIAL = { novaSenha: '', confirmar: '' };

const ResetPasswordModal = ({ isOpen, onClose, usuario, isSelf = false, forced = false, onSuccess }) => {
  const { toast } = useToast();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    if (forced) return;
    setForm(INITIAL);
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.novaSenha.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (getPasswordStrength(form.novaSenha).level < 2) {
      toast.error('senha muito fraca');
      return;
    }
    if (form.novaSenha !== form.confirmar) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const url = isSelf ? '/usuarios/me/senha' : `/usuarios/${usuario.id}/senha`;
      await api.patch(url, { novaSenha: form.novaSenha });
      toast.success('Senha redefinida com sucesso!');
      setForm(INITIAL);
      setError('');
      if (onSuccess) onSuccess();
      else handleClose();
    } catch (err) {
      const msg = err.response?.data?.erro || err.response?.data?.message || err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Redefinir Senha" hideClose={forced}>
      {forced && (
        <p style={{ fontSize: '0.88rem', color: 'var(--warning-color, #d97706)', marginBottom: '1rem', marginTop: '-0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>⚠</span>
          <span>Por segurança, você precisa criar uma nova senha antes de continuar.</span>
        </p>
      )}
      {!forced && usuario && (
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem', marginTop: '-0.5rem' }}>
          Usuário: <strong style={{ color: 'var(--text-heading)' }}>{usuario.nome}</strong>
        </p>
      )}
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-field">
          <label>Nova senha *</label>
          <PasswordInput
            value={form.novaSenha}
            onChange={set('novaSenha')}
            required
            minLength={8}
            maxLength={255}
            placeholder="Mínimo 8 caracteres"
          />
          <PasswordStrengthMeter password={form.novaSenha} />
        </div>
        <div className="modal-field">
          <label>Confirmar senha *</label>
          <PasswordInput
            value={form.confirmar}
            onChange={set('confirmar')}
            required
            minLength={8}
            maxLength={255}
            placeholder="Confirme sua nova senha"
          />
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-footer">
          {!forced && (
            <button type="button" className="modal-btn-cancel" onClick={handleClose}>Cancelar</button>
          )}
          <button type="submit" className="modal-btn-submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Redefinir Senha'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal;
