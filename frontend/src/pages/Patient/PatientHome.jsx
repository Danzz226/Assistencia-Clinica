import React, { useState, useEffect, useContext } from 'react';
import { Calendar, FileText, FlaskConical, Clock, TrendingUp } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Patient.scss';

const getSaudacao = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

const formatData = (str) =>
  str ? new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const formatHora = (str) =>
  str ? new Date(str).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_LABEL = { agendado: 'Agendado', realizado: 'Realizado', cancelado: 'Cancelado' };

const PatientHome = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [pacienteId, setPacienteId] = useState(null);
  const [stats, setStats]           = useState({ consultas: 0, exames: 0, prontuarios: 0 });
  const [proximas, setProximas]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [agendRes, pacientesRes] = await Promise.all([
          api.get('/agendamentos'),
          api.get('/pacientes'),
        ]);

        const agendamentos = agendRes.data || [];
        const pacientes    = pacientesRes.data || [];

        const pacienteLogado = pacientes.find(
          (p) => p.email?.toLowerCase() === user?.email?.toLowerCase()
        );

        if (!pacienteLogado) {
          toast.error('Perfil de paciente não encontrado. Contate o administrador.');
          setLoading(false);
          return;
        }

        setPacienteId(pacienteLogado.id);

        const [examesRes, prontuariosRes] = await Promise.all([
          api.get('/exames'),
          api.get('/prontuarios'),
        ]);

        const meusExames      = (examesRes.data || []).filter((e) => e.pacienteId === pacienteLogado.id);
        const meusProntuarios = (prontuariosRes.data || []).filter((p) => p.pacienteId === pacienteLogado.id);

        const agora = new Date();
        const futuras = agendamentos
          .filter((a) => a.status === 'agendado' && new Date(a.data) > agora)
          .sort((a, b) => new Date(a.data) - new Date(b.data))
          .slice(0, 3);

        setStats({
          consultas:    agendamentos.length,
          exames:       meusExames.length,
          prontuarios:  meusProntuarios.length,
        });
        setProximas(futuras);
      } catch {
        toast.error('Não foi possível conectar ao servidor.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDados();
  }, [user]);

  return (
    <div className="patient-page">
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
        Painel do Paciente
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        {getSaudacao()}, {user?.username || 'Paciente'}. Aqui você acompanha suas consultas, exames e histórico médico.
      </p>

      <div className="patient-page__section-label">LIFIUM · VISÃO GERAL</div>
      <h3 className="patient-page__section-title">Resumo</h3>

      <div className="patient-page__cards">
        <div className="patient-page__card">
          <div className="patient-page__card-icon"><Calendar size={24} /></div>
          <div className="patient-page__card-title">MINHAS CONSULTAS</div>
          <div className="patient-page__card-subtitle">Total de agendamentos</div>
          <div className="patient-page__card-number">{loading ? '—' : stats.consultas}</div>
          <div className="patient-page__card-pill patient-page__card-pill--blue">
            <TrendingUp size={14} /> Total acumulado
          </div>
        </div>

        <div className="patient-page__card">
          <div className="patient-page__card-icon"><FlaskConical size={24} /></div>
          <div className="patient-page__card-title">MEUS EXAMES</div>
          <div className="patient-page__card-subtitle">Exames solicitados</div>
          <div className="patient-page__card-number">{loading ? '—' : stats.exames}</div>
          <div className="patient-page__card-pill patient-page__card-pill--orange">
            <FlaskConical size={14} /> Total acumulado
          </div>
        </div>

        <div className="patient-page__card">
          <div className="patient-page__card-icon"><FileText size={24} /></div>
          <div className="patient-page__card-title">PRONTUÁRIOS</div>
          <div className="patient-page__card-subtitle">Registros médicos</div>
          <div className="patient-page__card-number">{loading ? '—' : stats.prontuarios}</div>
          <div className="patient-page__card-pill patient-page__card-pill--green">
            <TrendingUp size={14} /> Total acumulado
          </div>
        </div>
      </div>

      <div className="patient-page__section-label" style={{ marginTop: '0.5rem' }}>
        LIFIUM · AGENDA
      </div>
      <h3 className="patient-page__section-title">Próximas Consultas</h3>

      {loading ? (
        <div className="patient-page__loading">Carregando...</div>
      ) : proximas.length === 0 ? (
        <div className="patient-page__empty">Nenhuma consulta futura agendada.</div>
      ) : (
        <div className="patient-page__table-wrapper">
          <table className="patient-page__table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Médico</th>
                <th>Motivo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {proximas.map((a) => (
                <tr key={a.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                    {formatData(a.data)}
                  </td>
                  <td>{formatHora(a.data)}</td>
                  <td>{a.medicoNome || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {a.motivoConsulta ? a.motivoConsulta.substring(0, 50) + (a.motivoConsulta.length > 50 ? '…' : '') : '—'}
                  </td>
                  <td>
                    <span className={`patient-page__badge patient-page__badge--${a.status || 'default'}`}>
                      {STATUS_LABEL[a.status] || a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default PatientHome;
