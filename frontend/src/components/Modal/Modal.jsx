import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.scss';

const Modal = ({ isOpen, onClose, title, children, progressPercent, hideClose = false }) => {
  useEffect(() => {
    if (hideClose) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose, hideClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={hideClose ? undefined : onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {progressPercent !== undefined && (
          <div className="modal-progress-bar">
            <div className="modal-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
        <div className="modal-header">
          <h2>{title}</h2>
          {!hideClose && (
            <button className="modal-close-btn" type="button" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
