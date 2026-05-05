import React from 'react';

const PatientHome = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', color: '#1a2332' }}>Painel do Paciente</h1>
      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2>Bem-vindo à sua área de saúde</h2>
        <p style={{ marginTop: '1rem', color: '#4a5568' }}>
          Acompanhe suas próximas consultas agendadas, visualize os resultados de seus exames e tenha acesso a todos os seus diagnósticos anteriores de forma fácil e segura.
        </p>
      </div>
    </div>
  );
};

export default PatientHome;
