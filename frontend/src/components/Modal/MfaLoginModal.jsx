import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import logo from '../../assets/logo.png';

const TIMEOUT = 30;
const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MfaLoginModal = ({ isOpen, onClose, onVerify }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setCode('');
    setError('');
    setLoading(false);
    setSecondsLeft(TIMEOUT);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isOpen, onClose]);

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setSecondsLeft(TIMEOUT);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await onVerify(code);
      if (result && !result.success) {
        setError(result.message || 'Código inválido. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.round((code.length / 6) * 100);
  const strokeDashoffset = CIRCUMFERENCE * (1 - secondsLeft / TIMEOUT);
  const timerColor = secondsLeft <= 10 ? '#ef4444' : secondsLeft <= 20 ? '#f59e0b' : '#688E80';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verificação em Dois Fatores"
      progressPercent={progress}
    >
      <div style={{ textAlign: 'center' }}>
        <img
          src={logo}
          alt="Lifium"
          style={{ height: 80, objectFit: 'contain', marginBottom: '1.25rem' }}
        />

        <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.
        </p>

        <svg width="80" height="80" viewBox="0 0 80 80" style={{ marginBottom: '1.5rem' }}>
          <circle cx="40" cy="40" r={RADIUS} fill="none" stroke="#e8e8e8" strokeWidth="6" />
          <circle
            cx="40" cy="40" r={RADIUS}
            fill="none"
            stroke={timerColor}
            strokeWidth="6"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
          />
          <text
            x="40" y="44"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="20"
            fontWeight="700"
            fill={timerColor}
            style={{ transition: 'fill 0.4s ease', fontFamily: 'inherit' }}
          >
            {secondsLeft}
          </text>
        </svg>

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>Código do autenticador</label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              required
              maxLength={6}
              autoFocus
              style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.4rem' }}
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
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default MfaLoginModal;
