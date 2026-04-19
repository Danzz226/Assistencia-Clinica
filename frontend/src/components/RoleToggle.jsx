import React from 'react';
import './RoleToggle.css';

const RoleToggle = ({ role, setRole }) => {
  return (
    <div className={`role-toggle-container ${role === 'patient' ? 'is-patient' : ''}`}>
      <div className="role-toggle-slider"></div>
      <button 
        type="button" 
        className={`role-toggle-btn ${role === 'doctor' ? 'active' : ''}`}
        onClick={() => setRole('doctor')}
      >
        Médico
      </button>
      <button 
        type="button" 
        className={`role-toggle-btn ${role === 'patient' ? 'active' : ''}`}
        onClick={() => setRole('patient')}
      >
        Paciente
      </button>
    </div>
  );
};

export default RoleToggle;
