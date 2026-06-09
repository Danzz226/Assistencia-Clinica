import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Calendar, Clock, Search } from 'lucide-react';
import api from '../../services/api';
import DoctorCreateAppointmentModal from '../../components/Modal/DoctorCreateAppointmentModal';
import ConsultaDetailModal from '../../components/Modal/ConsultaDetailModal';
import './DoctorConsultas.scss';

const STATUS_LABEL = {
  agendado: 'Agendado',
  realizado: 'Finalizado',
  cancelado: 'Cancelado',
};

const TABS = [
  { key: 'hoje',       label: 'Hoje' },
  { key: 'proximas',   label: 'Próximas' },
  { key: 'realizadas', label: 'Realizadas' },
  { key: 'canceladas', label: 'Canceladas' },
];

const DoctorConsultas = () => {
  const { user } = useContext(AuthContext);

  const [agendamentos, setAgendamentos] = useState([]);
  const [medicoId, setMedicoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('hoje');
  const [busca, setBusca] = useState('');
  const [novaConsultaOpen, setNovaConsultaOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [medicoRes, agendRes] = await Promise.all([
        api.get('/medicos/me'),
        api.get('/agendamentos'),
      ]);
      setMedicoId(medicoRes.data.id);
      setAgendamentos(agendRes.data || []);
    } catch {
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const hojeStr = new Date().toISOString().slice(0, 10);

  const porTab = agendamentos.filter(a => {
    const dataStr = a.data.slice(0, 10);
    if (tab === 'hoje')       return a.status === 'agendado' && dataStr === hojeStr;
    if (tab === 'proximas')   return a.status === 'agendado' && dataStr > hojeStr;
    if (tab === 'realizadas') return a.status === 'realizado';
    if (tab === 'canceladas') return a.status === 'cancelado';
    return true;
  });

  const filtrados = porTab
    .filter(a =>
      !busca.trim() ||
      (a.pacienteNome || '').toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) =>
      tab === 'realizadas' || tab === 'canceladas'
        ? new Date(b.data) - new Date(a.data)
        : new Date(a.data) - new Date(b.data)
    );

  const contagens = {
    hoje:       agendamentos.filter(a => a.status === 'agendado' && a.data.slice(0, 10) === hojeStr).length,
    proximas:   agendamentos.filter(a => a.status === 'agendado' && a.data.slice(0, 10) > hojeStr).length,
    realizadas: agendamentos.filter(a => a.status === 'realizado').length,
    canceladas: agendamentos.filter(a => a.status === 'cancelado').length,
  };

  const fmtData = (iso) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const fmtHora = (iso) =>
    new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="doctor-consultas">
      <div className="doctor-consultas__heading">
        <div>
          <h1 className="doctor-consultas__title">Minhas Consultas</h1>
          <p className="doctor-consultas__desc">Gerencie agendamentos, registre prontuários e solicite exames por consulta.</p>
        </div>
        <button className="doctor-consultas__btn-nova" onClick={() => setNovaConsultaOpen(true)}>
          <Plus size={16} /> Nova Consulta
        </button>
      </div>

      {/* Tabs + busca */}
      <div className="doctor-consultas__toolbar">
        <div className="doctor-consultas__tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`doctor-consultas__tab${tab === t.key ? ' doctor-consultas__tab--active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {contagens[t.key] > 0 && (
                <span className={`doctor-consultas__tab-badge${t.key === 'hoje' ? ' doctor-consultas__tab-badge--hoje' : ''}`}>
                  {contagens[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="doctor-consultas__search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Lista */}
      <div className="doctor-consultas__list">
        {loading && (
          <p className="doctor-consultas__state">Carregando consultas...</p>
        )}

        {!loading && filtrados.length === 0 && (
          <div className="doctor-consultas__empty">
            <Calendar size={36} />
            <p>Nenhuma consulta {tab === 'hoje' ? 'para hoje' : tab === 'proximas' ? 'próxima' : tab === 'realizadas' ? 'realizada' : 'cancelada'}.</p>
          </div>
        )}

        {!loading && filtrados.map(a => (
          <div
            key={a.id}
            className="doctor-consultas__card"
            onClick={() => setSelectedConsulta(a)}
          >
            <div className={`doctor-consultas__card-indicator doctor-consultas__card-indicator--${a.status}`} />

            <div className="doctor-consultas__card-datetime">
              <span className="doctor-consultas__card-date">
                <Calendar size={12} />
                {fmtData(a.data)}
              </span>
              <span className="doctor-consultas__card-time">
                <Clock size={12} />
                {fmtHora(a.data)}
              </span>
            </div>

            <div className="doctor-consultas__card-patient">
              <div className="doctor-consultas__card-avatar">
                {(a.pacienteNome || '?').charAt(0).toUpperCase()}
              </div>
              <span className="doctor-consultas__card-patient-name">{a.pacienteNome || '—'}</span>
            </div>

            {a.motivoConsulta && (
              <div className="doctor-consultas__card-motivo">
                {a.motivoConsulta.length > 60
                  ? a.motivoConsulta.slice(0, 60) + '...'
                  : a.motivoConsulta}
              </div>
            )}

            <div className="doctor-consultas__card-right">
              <span className={`doctor-consultas__card-status doctor-consultas__card-status--${a.status}`}>
                {STATUS_LABEL[a.status]}
              </span>
              <button
                className="doctor-consultas__btn-gerenciar"
                onClick={e => { e.stopPropagation(); setSelectedConsulta(a); }}
              >
                Gerenciar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modais */}
      <DoctorCreateAppointmentModal
        isOpen={novaConsultaOpen}
        onClose={() => setNovaConsultaOpen(false)}
        onCreated={() => { setNovaConsultaOpen(false); load(); }}
      />

      {selectedConsulta && medicoId && (
        <ConsultaDetailModal
          consulta={selectedConsulta}
          medicoId={medicoId}
          onClose={() => setSelectedConsulta(null)}
          onUpdated={() => { setSelectedConsulta(null); load(); }}
        />
      )}
    </div>
  );
};

export default DoctorConsultas;
