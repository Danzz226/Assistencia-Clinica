import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';
import api from '../../services/api';

const MfaSetupModal = ({ isOpen, onClose, onEnabled }) => {
  const [step, setStep] = useState('loading'); // loading | setup | verify | done | disable
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCode('');
    setError('');
    setLoading(false);

    api.post('/auth/mfa/setup')
      .then(res => {
        setSecret(res.data.secret);
        setOtpauthUrl(res.data.otpauthUrl);
        setMfaEnabled(res.data.mfaEnabled);
        setStep(res.data.mfaEnabled ? 'disable' : 'setup');
      })
      .catch(err => {
        setError('Erro ao carregar configuração MFA.');
        setStep('setup');
      });
  }, [isOpen]);

  const handleEnable = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/mfa/enable', { code });
      setStep('done');
      onEnabled?.(true);
    } catch (err) {
      const msg = err.response?.data?.erro || 'Código inválido. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/mfa/disable', { code });
      setMfaEnabled(false);
      onEnabled?.(false);
      setStep('setup');
      setCode('');
    } catch (err) {
      const msg = err.response?.data?.erro || 'Código inválido. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('loading');
    setCode('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Autenticação em Dois Fatores (MFA)">
      <div style={{ textAlign: 'center' }}>

        {step === 'loading' && (
          <p style={{ color: '#888', padding: '2rem 0' }}>Carregando...</p>
        )}

        {step === 'setup' && (
          <>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Escaneie o QR Code abaixo com seu aplicativo autenticador
              <br />(Google Authenticator, Authy, Microsoft Authenticator, etc.)
            </p>

            {otpauthUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <div style={{
                  padding: '1rem',
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e8e8e8',
                  display: 'inline-block',
                }}>
                  <QRCodeSVG value={otpauthUrl} size={200} level="M" />
                </div>
              </div>
            )}

            <div style={{
              background: '#f5f8f7',
              padding: '0.75rem 1rem',
              borderRadius: 8,
              fontSize: '0.8rem',
              color: '#666',
              marginBottom: '1.25rem',
              wordBreak: 'break-all',
            }}>
              <strong>Chave manual:</strong> {secret}
            </div>

            <form onSubmit={handleEnable}>
              <div className="modal-field">
                <label>Digite o código de 6 dígitos do app</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  maxLength={6}
                  style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem' }}
                  autoFocus
                />
              </div>

              {error && <p className="modal-error">{error}</p>}

              <div className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={handleClose}>Cancelar</button>
                <button type="submit" className="modal-btn-submit" disabled={loading || code.length !== 6}>
                  {loading ? 'Verificando...' : 'Ativar MFA'}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'done' && (
          <div style={{ padding: '2rem 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #30e3a7 0%, #1a9e78 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2rem', color: '#fff',
            }}>
              ✓
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: '#1a1a1a' }}>MFA Ativado com Sucesso!</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              A partir do próximo login, você precisará informar o código do autenticador.
            </p>
            <button className="modal-btn-submit" onClick={handleClose}>Fechar</button>
          </div>
        )}

        {step === 'disable' && (
          <>
            <div style={{
              background: '#fff3f3',
              border: '1px solid #ffd6d6',
              borderRadius: 8,
              padding: '1rem',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              color: '#cf1322',
            }}>
              O MFA está <strong>ativado</strong> na sua conta. Para desativar, digite o código atual do autenticador.
            </div>

            <form onSubmit={handleDisable}>
              <div className="modal-field">
                <label>Código de 6 dígitos</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  maxLength={6}
                  style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem' }}
                  autoFocus
                />
              </div>

              {error && <p className="modal-error">{error}</p>}

              <div className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={handleClose}>Cancelar</button>
                <button
                  type="submit"
                  className="modal-btn-submit"
                  style={{ background: '#ef4444' }}
                  disabled={loading || code.length !== 6}
                >
                  {loading ? 'Desativando...' : 'Desativar MFA'}
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </Modal>
  );
};

export default MfaSetupModal;
