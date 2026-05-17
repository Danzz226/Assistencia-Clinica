import React from 'react';

const LEVELS = [
  null,
  { label: 'Fraca',  cls: 'weak'   },
  { label: 'Média',  cls: 'medium' },
  { label: 'Forte',  cls: 'strong' },
];

export const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', cls: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const idx = score <= 1 ? 1 : score === 2 ? 2 : 3;
  return { level: idx, ...LEVELS[idx] };
};

const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;

  const { level, label, cls } = getPasswordStrength(password);

  return (
    <div className={`password-strength password-strength--${cls}`}>
      <div className="password-strength-bars">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`password-strength-bar${i <= level ? ' active' : ''}`}
          />
        ))}
      </div>
      <span className="password-strength-label">{label}</span>
    </div>
  );
};

export default PasswordStrengthMeter;
