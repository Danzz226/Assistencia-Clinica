import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import GenericTable from '../GenericTable';
import { AuthContext } from '../../context/AuthContext';
import Badge from '../Badge/Badge';

const AppointmentsView = ({ viewRole }) => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useContext(AuthContext);
  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const response = await api.get('/consultas');
        let dados = response.data || [];
      
        if (viewRole === 'medico') {
         
          dados = dados.filter(consulta => consulta.medicoNome === user?.username);
        }
        setAgendamentos(dados);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        
        // --- MOCK DE DADOS PARA TESTE VISUAL (Caso o Java esteja offline) ---
        setAgendamentos([
          { id: 1, pacienteCpf: '111.222.333-44', medicoNome: 'dr_roberto', dataHora: '2026-05-15T14:30:00', status: 'AGENDADA', motivo: 'Checkup Anual' },
          { id: 2, pacienteCpf: '555.666.777-88', medicoNome: 'dr_roberto', dataHora: '2026-05-16T09:00:00', status: 'CONCLUIDA', motivo: 'Retorno de Exames' },
          { id: 3, pacienteCpf: '999.888.777-66', medicoNome: 'dra_ana', dataHora: '2026-05-20T11:00:00', status: 'CANCELADA', motivo: 'Sintomas Gripais' }
        ]);
        setErrorMsg('API Offline: Mostrando dados de teste.');
      }
    };
    fetchAgendamentos();
  }, [viewRole, user]);
  // Limpa o erro
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);
  // Função para formatar a data que vem do Java (Ex: 2026-05-15T14:30:00 -> 15/05/2026 às 14:30)
  const formatData = (dataString) => {
    if (!dataString) return '-';
    const date = new Date(dataString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  // Configuração das Colunas da Tabela
  const columns = [
    { 
      header: 'Data e Hora', 
      render: (row) => <strong>{formatData(row.dataHora)}</strong> 
    },
    { 
      header: 'Paciente', 
      render: (row) => (
        <div>
          <div style={{ fontWeight: '600', color: '#333' }}>CPF: {row.pacienteCpf}</div>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>Info: Paciente Cadastrado</div>
        </div>
      )
    },
    // Opcional: Só mostrar a coluna "Médico" se for o Admin olhando
    ...(viewRole === 'admin' ? [{ header: 'Médico', accessor: 'medicoNome' }] : []),
    { 
      header: 'Motivo', 
      render: (row) => <Badge variant="primary">{row.motivo || 'Consulta Geral'}</Badge> 
    },
    { 
      header: 'Status', 
      render: (row) => {
        let variant = 'default';
        if (row.status === 'AGENDADA') variant = 'info'; 
        if (row.status === 'CONCLUIDA') variant = 'success';
        if (row.status === 'CANCELADA') variant = 'danger';
        
        return <Badge variant={variant}>{row.status}</Badge>;
      }
    }
  ];
  return (
    <div style={{ maxWidth: '1200px', marginTop: '1rem', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        {viewRole === 'admin' ? 'Controle Geral de Agendamentos' : 'Meus Agendamentos'}
      </h1>
      <p style={{ marginBottom: '2rem' }}>
        Acompanhe e gerencie as consultas marcadas na clínica.
      </p>
    
      <GenericTable columns={columns} data={agendamentos} />
      {errorMsg && (
        <div className="manage-users-error" style={{position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '1rem', background: '#fff3f3', borderLeft: '4px solid #ff4d4f', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', color: '#cf1322'}}>
          <p style={{margin: 0}}>{errorMsg}</p>
        </div>
      )}
    </div>
  );
};
export default AppointmentsView;