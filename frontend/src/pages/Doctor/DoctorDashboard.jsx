import React, { useState, useEffect, useContext } from 'react';
import { Users, FileText, TrendingUp, Clock, Calendar } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './DoctorDashboard.scss';

// TODO [BACKEND]: Quando o backend implementar:
//   1. Adicionar `perfilId` no AuthResponseDTO para não precisar buscar todos os médicos
//   2. Endpoint GET /medicos/{id}/prontuarios para filtragem server-side
//   3. Endpoint GET /medicos/{id}/horarios para filtragem server-side
// Por enquanto, buscamos tudo e filtramos no frontend por email/medicoId.

const DIAS_LABEL = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [medicoId, setMedicoId] = useState(null);
  const [medicoNome, setMedicoNome] = useState('');
  const [stats, setStats] = useState({
    pacientes: 0,
    prontuarios: 0,
    horariosHoje: [],
  });
  const [prontuariosRecentes, setProntuariosRecentes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Identifica o dia da semana atual no enum do backend
  const getDiaSemanaHoje = () => {
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    return dias[new Date().getDay()];
  };

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const medicoRes = await api.get('/medicos/me');
        const medicoLogado = medicoRes.data;
        setMedicoId(medicoLogado.id);
        setMedicoNome(medicoLogado.nome);

        // /pacientes buscado separado para não ser afetado por falha em outras chamadas
        const pacientesRes = await api.get('/medicos/me/pacientes');
        setStats(prev => ({ ...prev, pacientes: (pacientesRes.data || []).length }));

        try {
          const [prontuariosRes, horariosRes] = await Promise.all([
            api.get('/prontuarios'),
            api.get('/horarios'),
          ]);

          const meusProntuarios = (prontuariosRes.data || []).filter(
            (p) => p.medicoId === medicoLogado.id
          );
          const horariosHoje = (horariosRes.data || [])
            .filter((h) => h.medicoId === medicoLogado.id && h.diaSemana === getDiaSemanaHoje());

          setStats(prev => ({
            ...prev,
            prontuarios: meusProntuarios.length,
            horariosHoje,
          }));

          const recentes = [...meusProntuarios]
            .sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro))
            .slice(0, 5);
          setProntuariosRecentes(recentes);
        } catch {
          // prontuários/horários indisponíveis, mas contagem de pacientes já está correta
        }
      } catch {
        setMedicoNome(user?.nome || 'Médico');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDados();
  }, [user]);

  const formatData = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="doctor-dashboard">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Dashboard Médico</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {getSaudacao()}, {medicoNome ? `Dr(a). ${medicoNome}` : user?.username}. Aqui você acompanha seus pacientes, prontuários e sua agenda.
          </p>
        </div>
      </div>

      <div className="doctor-dashboard__section-label">LIFIUM · VISÃO MÉDICA</div>
      <h3 className="doctor-dashboard__section-title">Resumo</h3>

      <div className="doctor-dashboard__cards">
        {/* Card: Meus Pacientes */}
        <div className="doctor-dashboard__card">
          <div className="doctor-dashboard__card-icon-wrapper">
            <Users size={24} />
          </div>
          <div className="doctor-dashboard__card-title">MEUS PACIENTES</div>
          <div className="doctor-dashboard__card-subtitle">Total de pacientes</div>
          <div className="doctor-dashboard__card-number">
            {loading ? '—' : stats.pacientes}
          </div>
          <div className="doctor-dashboard__card-pill doctor-dashboard__card-pill--green">
            <TrendingUp size={14} /> Total acumulado
          </div>
        </div>

        {/* Card: Meus Prontuários */}
        <div className="doctor-dashboard__card">
          <div className="doctor-dashboard__card-icon-wrapper">
            <FileText size={24} />
          </div>
          <div className="doctor-dashboard__card-title">MEUS PRONTUÁRIOS</div>
          <div className="doctor-dashboard__card-subtitle">Registros médicos criados</div>
          <div className="doctor-dashboard__card-number">
            {loading ? '—' : stats.prontuarios}
          </div>
          <div className="doctor-dashboard__card-pill doctor-dashboard__card-pill--green">
            <TrendingUp size={14} /> Total acumulado
          </div>
        </div>

        {/* Card: Agenda Hoje */}
        <div className="doctor-dashboard__card">
          <div className="doctor-dashboard__card-icon-wrapper">
            <Calendar size={24} />
          </div>
          <div className="doctor-dashboard__card-title">AGENDA HOJE</div>
          <div className="doctor-dashboard__card-subtitle">
            {DIAS_LABEL[getDiaSemanaHoje()]}
          </div>
          <div className="doctor-dashboard__card-number">
            {loading ? '—' : stats.horariosHoje.length}
          </div>
          {stats.horariosHoje.length > 0 ? (
            <div className="doctor-dashboard__card-pill doctor-dashboard__card-pill--blue">
              <Clock size={14} />
              {stats.horariosHoje[0].horaInicio} – {stats.horariosHoje[0].horaFim}
            </div>
          ) : (
            <div className="doctor-dashboard__card-pill doctor-dashboard__card-pill--neutral">
              Sem horários hoje
            </div>
          )}
        </div>
      </div>

      {/* Prontuários Recentes */}
      <div className="doctor-dashboard__section-label" style={{ marginTop: '2.5rem' }}>
        LIFIUM · ATIVIDADE RECENTE
      </div>
      <h3 className="doctor-dashboard__section-title">Últimos Prontuários</h3>

      {loading ? (
        <div className="doctor-dashboard__loading">Carregando...</div>
      ) : prontuariosRecentes.length === 0 ? (
        <div className="doctor-dashboard__empty">Nenhum prontuário registrado ainda.</div>
      ) : (
        <div className="doctor-dashboard__table-wrapper">
          <table className="doctor-dashboard__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Descrição</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {prontuariosRecentes.map((p) => (
                <tr key={p.id}>
                  <td className="doctor-dashboard__table-id">{p.id}</td>
                  <td>{p.pacienteNome || `Paciente ${p.pacienteId}`}</td>
                  <td className="doctor-dashboard__table-desc">
                    {p.descricao ? p.descricao.substring(0, 60) + (p.descricao.length > 60 ? '…' : '') : '—'}
                  </td>
                  <td>{formatData(p.dataRegistro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
