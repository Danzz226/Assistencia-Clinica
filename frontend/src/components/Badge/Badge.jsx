import React from 'react';
import './Badge.scss';

const Badge = ({ children, variant = 'default' }) => {
  return (
    <span className={`ui-badge badge-${variant}`}>
      {children}
    </span>
  );
};

export default Badge;
