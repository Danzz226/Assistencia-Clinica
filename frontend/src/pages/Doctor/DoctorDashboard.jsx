import React, { useState, useEffect, useContext } from 'react';
import { Users, FileText, TrendingUp, Clock, Calendar } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
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

  const [medicoId, setMedicoId] = useState(null);
  const [medicoNome, setMedicoNome] = useState('');
  const [stats, setStats] = useState({
    pacientes: 0,
    prontuarios: 0,
    horariosHoje: [],
  });
  const [prontuariosRecentes, setProntuariosRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Identifica o dia da semana atual no enum do backend
  const getDiaSemanaHoje = () => {
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    return dias[new Date().getDay()];
  };

  useEffect(() => {
    const fetchDados = async () => {
      try {
        // TODO [BACKEND]: Substituir por GET /auth/me ou usar perfilId do token JWT
        // quando implementado. Por agora buscamos todos os médicos e filtramos pelo email.
        const medicosRes = await api.get('/medicos');
        const medicos = medicosRes.data || [];

        // Encontra o médico logado pelo email (username = email no sistema)
        const medicoLogado = medicos.find(
          (m) => m.email?.toLowerCase() === user?.username?.toLowerCase()
        );

        if (!medicoLogado) {
          setErrorMsg('Médico não encontrado no sistema. Verifique o cadastro.');
          setLoading(false);
          return;
        }

        setMedicoId(medicoLogado.id);
        setMedicoNome(medicoLogado.nome);

        // TODO [BACKEND]: Substituir por GET /prontuarios?medicoId={id}
        const prontuariosRes = await api.get('/prontuarios');
        const todosProntuarios = prontuariosRes.data || [];
        const meusProntuarios = todosProntuarios.filter(
          (p) => p.medicoId === medicoLogado.id
        );

        // TODO [BACKEND]: Substituir por GET /horarios?medicoId={id}
        const horariosRes = await api.get('/horarios');
        const todosHorarios = horariosRes.data || [];
        const meusHorarios = todosHorarios.filter(
          (h) => h.medicoId === medicoLogado.id
        );
        const horariosHoje = meusHorarios.filter(
          (h) => h.diaSemana === getDiaSemanaHoje()
        );

        // Pacientes únicos via prontuários
        const pacientesUnicos = new Set(meusProntuarios.map((p) => p.pacienteId));

        setStats({
          pacientes: pacientesUnicos.size,
          prontuarios: meusProntuarios.length,
          horariosHoje,
        });

        // 5 prontuários mais recentes
        const recentes = [...meusProntuarios]
          .sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro))
          .slice(0, 5);
        setProntuariosRecentes(recentes);
      } catch (error) {
        console.warn('⚠️ Backend offline — carregando dados mock para visualização.');
        // MOCK: Dados fictícios para testar a UI sem o backend
        const nomeUsuario = user?.username?.split('@')[0] || 'Médico';
        setMedicoNome(nomeUsuario.charAt(0).toUpperCase() + nomeUsuario.slice(1));
        setStats({
          pacientes: 12,
          prontuarios: 47,
          horariosHoje: [{ horaInicio: '08:00', horaFim: '12:00' }],
        });
        setProntuariosRecentes([
          { id: 1, pacienteNome: 'Ana Oliveira',    descricao: 'Consulta de rotina — pressão arterial estável.', dataRegistro: '2026-05-10T09:30:00' },
          { id: 2, pacienteNome: 'Bruno Santos',    descricao: 'Revisão pós-cirúrgica, cicatrização normal.', dataRegistro: '2026-05-09T14:00:00' },
          { id: 3, pacienteNome: 'Carla Mendes',    descricao: 'Queixa de dor abdominal, solicitado exame.', dataRegistro: '2026-05-08T10:15:00' },
          { id: 4, pacienteNome: 'Diego Almeida',   descricao: 'Acompanhamento diabetes tipo 2.', dataRegistro: '2026-05-07T11:00:00' },
          { id: 5, pacienteNome: 'Eduarda Ferreira', descricao: 'Retorno de resultado de exame laboratorial.', dataRegistro: '2026-05-06T16:30:00' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDados();
  }, [user]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

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
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
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
          <div className="doctor-dashboard__card-subtitle">Pacientes com prontuário</div>
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

      {errorMsg && (
        <div className="doctor-dashboard__error">
          <h4>Aviso de Conexão</h4>
          <p>{errorMsg}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
