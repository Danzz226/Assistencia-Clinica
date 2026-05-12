import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import GenericTable from '../GenericTable';
import { AuthContext } from '../../context/AuthContext';
import Badge from '../Badge/Badge';
import CreateAppointmentModal from '../Modal/CreateAppointmentModal';
import '../Modal/Modal.scss';

const STATUS_LABEL = {
  agendado: 'AGENDADA',
  realizado: 'REALIZADA',
  cancelado: 'CANCELADA',
};

const STATUS_VARIANT = {
  agendado: 'info',
  realizado: 'success',
  cancelado: 'danger',
};

const AppointmentsView = ({ viewRole }) => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchAgendamentos = useCallback(async () => {
    try {
      const response = await api.get('/agendamentos');
      let dados = response.data || [];

      if (viewRole === 'medico') {
        dados = dados.filter(a => a.medicoNome === user?.username);
      }

      setAgendamentos(dados);
    } catch (error) {
      setAgendamentos([]);
      const msg = error.response?.data?.message
        || (error.response ? `Erro ${error.response.status} ao carregar agendamentos.` : 'Sem conexão com o servidor.');
      setErrorMsg(msg);
    }
  }, [viewRole, user]);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const formatData = (dataString) => {
    if (!dataString) return '-';
    const date = new Date(dataString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const columns = [
    {
      header: 'Data e Hora',
      render: (row) => <strong>{formatData(row.data)}</strong>,
    },
    {
      header: 'Paciente',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '600', color: '#333' }}>{row.pacienteNome}</div>
        </div>
      ),
    },
    ...(viewRole === 'admin' ? [{ header: 'Médico', accessor: 'medicoNome' }] : []),
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'default'}>
          {STATUS_LABEL[row.status] || row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', marginTop: '1rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
            {viewRole === 'admin' ? 'Controle Geral de Agendamentos' : 'Meus Agendamentos'}
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Acompanhe e gerencie as consultas marcadas na clínica.
          </p>
        </div>
        {viewRole === 'admin' && (
          <button className="btn-create" style={{ flexShrink: 0 }} onClick={() => setModalOpen(true)}>
            <Plus size={15} />
            Novo Agendamento
          </button>
        )}
      </div>

      <div style={{ marginTop: '0' }}>
        <GenericTable columns={columns} data={agendamentos} />
      </div>

      {errorMsg && (
        <div style={{ position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '1rem', background: '#fff3f3', borderLeft: '4px solid #ff4d4f', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', color: '#cf1322' }}>
          <p style={{ margin: 0 }}>{errorMsg}</p>
        </div>
      )}

      <CreateAppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchAgendamentos}
      />
    </div>
  );
};

export default AppointmentsView;
