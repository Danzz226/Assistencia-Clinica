import React, { useState, useEffect, useContext } from 'react';
import { Plus } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Patient.scss';

const formatData = (str) =>
  str
    ? new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

const formatHora = (str) =>
  str ? new Date(str).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_LABEL = { agendado: 'Agendado', realizado: 'Realizado', cancelado: 'Cancelado' };

const amanha = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// ── Wizard de agendamento ─────────────────────────────────────────────────────
const AgendarWizard = ({ pacienteId, onClose, onSucesso }) => {
  const { toast } = useToast();
  const [passo, setPasso]                       = useState(1);
  const [especialidades, setEspecialidades]     = useState([]);
  const [especialidade, setEspecialidade]       = useState('');
  const [data, setData]                         = useState('');
  const [medicosDisponiveis, setMedicos]        = useState([]);
  const [medicoSelecionado, setMedico]          = useState(null);
  const [slotSelecionado, setSlot]              = useState('');
  const [motivo, setMotivo]                     = useState('');
  const [buscando, setBuscando]                 = useState(false);
  const [salvando, setSalvando]                 = useState(false);

  useEffect(() => {
    api.get('/medicos/especialidades').then(r => setEspecialidades(r.data || []));
  }, []);

  const buscarDisponiveis = async () => {
    if (new Date(data) < new Date(amanha())) {
      toast.error('A data da consulta deve ser a partir de amanhã.');
      return;
    }
    setBuscando(true);
    try {
      const res = await api.get('/medicos/disponiveis', { params: { especialidade, data } });
      setMedicos(res.data || []);
      setMedico(null);
      setSlot('');
      setPasso(2);
    } catch {
      toast.error('Não foi possível buscar os horários disponíveis.');
    } finally {
      setBuscando(false);
    }
  };

  const selecionarSlot = (medico, slot) => {
    setMedico(medico);
    setSlot(slot);
  };

  const avancarParaConfirmacao = () => {
    if (!medicoSelecionado || !slotSelecionado) {
      toast.error('Selecione um médico e um horário.');
      return;
    }
    if (new Date(`${data}T${slotSelecionado}`) <= new Date()) {
      toast.error('O horário selecionado já passou. Escolha outro horário.');
      return;
    }
    setPasso(3);
  };

  const confirmar = async () => {
    if (new Date(`${data}T${slotSelecionado}`) <= new Date()) {
      toast.error('O horário selecionado já passou. Escolha outro horário.');
      return;
    }
    setSalvando(true);
    try {
      await api.post('/agendamentos', {
        pacienteId,
        medicoId: medicoSelecionado.id,
        data: `${data}T${slotSelecionado}`,
        motivoConsulta: motivo.trim() || undefined,
      });
      onSucesso();
    } catch (err) {
      toast.error(err.response?.data?.erro || err.response?.data?.message || 'Erro ao agendar consulta.');
    } finally {
      setSalvando(false);
    }
  };

  const dataFormatada = data
    ? new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="patient-modal-overlay" onClick={onClose}>
      <div className="patient-modal patient-modal--wizard" onClick={e => e.stopPropagation()}>

        {/* ── Passo 1: Especialidade + Data ── */}
        {passo === 1 && (
          <>
            <p className="wizard-step">Passo 1 de 3 — Escolha a especialidade e a data</p>
            <h2 className="patient-modal__title">Nova Consulta</h2>

            <div className="patient-modal__field">
              <label>Especialidade</label>
              <select value={especialidade} onChange={e => setEspecialidade(e.target.value)}>
                <option value="">Selecione a especialidade...</option>
                {especialidades.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div className="patient-modal__field">
              <label>Data da consulta</label>
              <input
                type="date"
                value={data}
                min={amanha()}
                onChange={e => setData(e.target.value)}
              />
            </div>

            <div className="patient-modal__footer">
              <button className="patient-modal__btn-cancel" onClick={onClose}>Cancelar</button>
              <button
                className="patient-modal__btn-submit"
                onClick={buscarDisponiveis}
                disabled={!especialidade || !data || buscando}
              >
                {buscando ? 'Buscando...' : 'Buscar horários →'}
              </button>
            </div>
          </>
        )}

        {/* ── Passo 2: Escolher médico + slot ── */}
        {passo === 2 && (
          <>
            <p className="wizard-step">Passo 2 de 3 — Escolha o médico e o horário</p>
            <h2 className="patient-modal__title">{especialidade}</h2>
            <p className="wizard-data-label">{dataFormatada}</p>

            {medicosDisponiveis.length === 0 ? (
              <div className="wizard-vazio">
                Nenhum médico disponível nessa data.<br />
                <span>Tente outra data ou especialidade.</span>
              </div>
            ) : (
              <div className="wizard-lista-medicos">
                {medicosDisponiveis.map(m => (
                  <div
                    key={m.id}
                    className={`medico-card${medicoSelecionado?.id === m.id ? ' medico-card--selecionado' : ''}`}
                  >
                    <p className="medico-card__nome">{m.nome}</p>
                    <p className="medico-card__sub">CRM {m.crm}/{m.uf}</p>
                    <div className="medico-card__slots">
                      {m.slots.map(slot => (
                        <button
                          key={slot}
                          className={`slot-btn${medicoSelecionado?.id === m.id && slotSelecionado === slot ? ' slot-btn--selecionado' : ''}`}
                          onClick={() => selecionarSlot(m, slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="patient-modal__footer">
              <button className="patient-modal__btn-cancel" onClick={() => setPasso(1)}>
                ← Voltar
              </button>
              <button
                className="patient-modal__btn-submit"
                onClick={avancarParaConfirmacao}
                disabled={!medicoSelecionado || !slotSelecionado}
              >
                Próximo →
              </button>
            </div>
          </>
        )}

        {/* ── Passo 3: Motivo + Confirmação ── */}
        {passo === 3 && (
          <>
            <p className="wizard-step">Passo 3 de 3 — Confirme o agendamento</p>
            <h2 className="patient-modal__title">Confirmar Consulta</h2>

            <div className="wizard-resumo">
              <div className="wizard-resumo__item">
                <span>Especialidade</span>
                <span>{medicoSelecionado.especialidade}</span>
              </div>
              <div className="wizard-resumo__item">
                <span>Médico</span>
                <span>{medicoSelecionado.nome}</span>
              </div>
              <div className="wizard-resumo__item">
                <span>Data</span>
                <span>{dataFormatada}</span>
              </div>
              <div className="wizard-resumo__item">
                <span>Horário</span>
                <span>{slotSelecionado}</span>
              </div>
            </div>

            <div className="patient-modal__field">
              <label>Motivo da consulta (opcional)</label>
              <textarea
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Descreva brevemente o motivo..."
              />
            </div>

            <div className="patient-modal__footer">
              <button className="patient-modal__btn-cancel" onClick={() => setPasso(2)}>
                ← Voltar
              </button>
              <button className="patient-modal__btn-submit" onClick={confirmar} disabled={salvando}>
                {salvando ? 'Agendando...' : 'Confirmar Consulta'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
const PatientConsultas = () => {
  const { user } = useContext(AuthContext);

  const { toast } = useToast();
  const [consultas, setConsultas]   = useState([]);
  const [pacienteId, setPacienteId] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);

  const carregar = async () => {
    try {
      const [agendRes, pacientesRes] = await Promise.all([
        api.get('/agendamentos'),
        api.get('/pacientes'),
      ]);

      const pacienteLogado = (pacientesRes.data || []).find(
        (p) => p.email?.toLowerCase() === user?.email?.toLowerCase()
      );
      if (pacienteLogado) setPacienteId(pacienteLogado.id);

      const ordenadas = [...(agendRes.data || [])].sort(
        (a, b) => new Date(b.data) - new Date(a.data)
      );
      setConsultas(ordenadas);
    } catch {
      toast.error('Não foi possível carregar as consultas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) carregar();
  }, [user]);

  const handleSucesso = () => {
    setShowModal(false);
    toast.success('Consulta agendada com sucesso!');
    carregar();
  };

  return (
    <div className="patient-page">
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
        Minhas Consultas
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Visualize e gerencie todos os seus agendamentos médicos.
      </p>

      <div className="patient-page__section-label">LIFIUM · AGENDAMENTOS</div>
      <h3 className="patient-page__section-title">Histórico de Consultas</h3>

      <div className="patient-page__actions">
        <button
          className="patient-page__btn-primary"
          onClick={() => setShowModal(true)}
          disabled={!pacienteId}
          title={!pacienteId ? 'Seu perfil de paciente não foi encontrado' : undefined}
        >
          <Plus size={16} /> Nova Consulta
        </button>
      </div>

      {loading ? (
        <div className="patient-page__loading">Carregando...</div>
      ) : consultas.length === 0 ? (
        <div className="patient-page__empty">Nenhuma consulta encontrada.</div>
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
              {consultas.map((c) => (
                <tr key={c.id}>
                  <td>{formatData(c.data)}</td>
                  <td>{formatHora(c.data)}</td>
                  <td>{c.medicoNome || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {c.motivoConsulta
                      ? c.motivoConsulta.substring(0, 55) + (c.motivoConsulta.length > 55 ? '…' : '')
                      : '—'}
                  </td>
                  <td>
                    <span className={`patient-page__badge patient-page__badge--${c.status || 'default'}`}>
                      {STATUS_LABEL[c.status] || c.status || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AgendarWizard
          pacienteId={pacienteId}
          onClose={() => setShowModal(false)}
          onSucesso={handleSucesso}
        />
      )}
    </div>
  );
};

export default PatientConsultas;
