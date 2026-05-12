import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';
import api from '../../services/api';

const STEPS = { LOADING: 'loading', QR: 'qr', SUCCESS: 'success' };

const MfaSetupModal = ({ isOpen, onClose, onEnabled }) => {
  const [step, setStep] = useState(STEPS.LOADING);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setStep(STEPS.LOADING);
    setCode('');
    setError('');

    api.post('/auth/mfa/setup')
      .then(({ data }) => {
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
        setStep(STEPS.QR);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Erro ao iniciar configuração de MFA';
        setError(msg);
        setStep(STEPS.QR);
      });
  }, [isOpen]);

  const handleEnable = async (e) => {
    e.preventDefault();
    setError('');
    setVerifying(true);

    try {
      await api.post('/auth/mfa/enable', { code });
      setStep(STEPS.SUCCESS);
      onEnabled?.();
    } catch (err) {
      const msg = err.response?.data?.message || 'Código inválido. Tente novamente.';
      setError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setStep(STEPS.LOADING);
    setQrCodeUrl('');
    setSecret('');
    setCode('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Configurar Autenticação em Dois Fatores">

      {step === STEPS.LOADING && (
        <p className="mfa-setup-hint">Carregando...</p>
      )}

      {step === STEPS.QR && (
        <form className="modal-form" onSubmit={handleEnable}>
          <p className="mfa-setup-hint">
            Escaneie o QR Code com um aplicativo autenticador (Google Authenticator, Authy etc.).
          </p>

          {qrCodeUrl && (
            <div className="mfa-qr-wrapper">
              <QRCodeSVG value={qrCodeUrl} size={200} />
            </div>
          )}

          {secret && (
            <div className="modal-field">
              <label>Chave manual</label>
              <input
                type="text"
                value={secret}
                readOnly
                className="mfa-secret-input"
                onClick={(e) => e.target.select()}
              />
            </div>
          )}

          <div className="modal-field">
            <label>Código TOTP *</label>
            <input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              autoFocus
            />
          </div>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-footer">
            <button type="button" className="modal-btn-cancel" onClick={handleClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-btn-submit"
              disabled={verifying || code.length !== 6}
            >
              {verifying ? 'Verificando...' : 'Ativar MFA'}
            </button>
          </div>
        </form>
      )}

      {step === STEPS.SUCCESS && (
        <div className="modal-form">
          <p className="mfa-setup-hint mfa-setup-success">
            MFA ativado com sucesso! Seu login agora exigirá o código do autenticador.
          </p>
          <div className="modal-footer">
            <button type="button" className="modal-btn-submit" onClick={handleClose}>
              Fechar
            </button>
          </div>
        </div>
      )}

    </Modal>
  );
};

export default MfaSetupModal;
