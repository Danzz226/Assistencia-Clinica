import React from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import './Toast.scss';

const LABELS = { success: 'Sucesso', error: 'Erro' };
const ICONS  = {
  success: <CheckCircle2 size={18} />,
  error:   <XCircle size={18} />,
};

const ToastContainer = ({ toasts, onRemove }) => (
  <div className="toast-container">
    {toasts.map(({ id, type, message, exiting }) => (
      <div key={id} className={`toast toast--${type}${exiting ? ' exiting' : ''}`}>
        <div className="toast__icon">{ICONS[type]}</div>
        <div className="toast__body">
          <span className="toast__label">{LABELS[type]}</span>
          <span className="toast__message">{message}</span>
        </div>
        <button className="toast__close" onClick={() => onRemove(id)}>
          <X size={14} />
        </button>
      </div>
    ))}
  </div>
);

export default ToastContainer;
