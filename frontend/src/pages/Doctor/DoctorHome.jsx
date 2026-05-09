import React from 'react';

const DoctorHome = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', color: '#1a2332' }}>Dashboard do Médico</h1>
      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2>Bem-vindo à sua área de trabalho</h2>
        <p style={{ marginTop: '1rem', color: '#4a5568' }}>
          Aqui você pode visualizar sua agenda de consultas de hoje, gerenciar seus horários de atendimento e acessar os prontuários dos seus pacientes.
        </p>
      </div>
    </div>
  );
};

export default DoctorHome;
