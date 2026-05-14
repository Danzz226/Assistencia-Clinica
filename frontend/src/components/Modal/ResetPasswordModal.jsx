import React, { useState } from 'react';
import Modal from './Modal';
import api from '../../services/api';

const INITIAL = { novaSenha: '', confirmar: '' };

const ResetPasswordModal = ({ isOpen, onClose, usuario, isSelf = false }) => {
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

    if (form.novaSenha !== form.confirmar) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const url = isSelf ? '/usuarios/me/senha' : `/usuarios/${usuario.id}/senha`;
      await api.patch(url, { novaSenha: form.novaSenha });
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.erro || err.response?.data?.message || err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Redefinir Senha">
      {usuario && (
        <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '1rem', marginTop: '-0.5rem' }}>
          Usuário: <strong style={{ color: '#333' }}>{usuario.nome}</strong>
        </p>
      )}
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-field">
          <label>Nova senha *</label>
          <input
            type="password"
            value={form.novaSenha}
            onChange={set('novaSenha')}
            required
            minLength={6}
            maxLength={255}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div className="modal-field">
          <label>Confirmar senha *</label>
          <input
            type="password"
            value={form.confirmar}
            onChange={set('confirmar')}
            required
            minLength={6}
            maxLength={255}
            placeholder="Confirme sua nova senha"
          />
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-footer">
          <button type="button" className="modal-btn-cancel" onClick={handleClose}>Cancelar</button>
          <button type="submit" className="modal-btn-submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Redefinir Senha'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal;
