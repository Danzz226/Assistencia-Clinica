import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';

const MfaSetupLoginModal = ({ isOpen, onClose, setupData, onConfirm }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCode('');
    setError('');
    setLoading(false);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await onConfirm(code);
    setLoading(false);
    if (result && !result.success) {
      setError(result.message || 'Código inválido. Tente novamente.');
    }
  };

  const progress = Math.round((code.length / 6) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure a Autenticação MFA"
      progressPercent={progress}
    >
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Escaneie o QR Code com seu aplicativo autenticador<br />
          (Google Authenticator, Authy, Microsoft Authenticator, etc.)
        </p>

        {setupData?.otpauthUrl && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              padding: '1rem',
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--border-input)',
              display: 'inline-block',
            }}>
              <QRCodeSVG value={setupData.otpauthUrl} size={200} level="M" />
            </div>
          </div>
        )}

        <div style={{
          background: 'var(--surface-subtle)',
          padding: '0.75rem 1rem',
          borderRadius: 8,
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
          wordBreak: 'break-all',
        }}>
          <strong>Chave manual:</strong> {setupData?.secret}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>Digite o código de 6 dígitos do app</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              required
              maxLength={6}
              style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.4rem' }}
              autoFocus
            />
          </div>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-footer">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-btn-submit"
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Verificando...' : 'Ativar MFA e Entrar'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default MfaSetupLoginModal;
