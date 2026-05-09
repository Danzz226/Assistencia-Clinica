import React from 'react';

const AdminHome = () => {
  return (
    <div style={{ maxWidth: '800px', marginTop: '1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000', marginBottom: '1.5rem' }}>
        Dashboard Administrativo
      </h1>
      
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000', marginBottom: '0.75rem' }}>
        Acompanhe exames e prontuários dos pacientes
      </h2>
      
      <p style={{ fontSize: '1rem', color: '#333', lineHeight: '1.5' }}>
        Aqui você poderá gerenciar usuários, funcionários, visualizar
        <br />
        todas as consultas marcadas na clínica e acessar relatórios
        <br />
        gerenciais.
      </p>
    </div>
  );
};

export default AdminHome;
