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

// ── Modal de agendamento ──────────────────────────────────────────────────────
const AgendarModal = ({ pacienteId, medicos, onClose, onSucesso }) => {
  const [form, setForm] = useState({ medicoId: '', data: '', motivo: '' });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!form.medicoId || !form.data) {
      setErro('Selecione o médico e a data/hora.');
      return;
    }

    try {
      setSalvando(true);
      await api.post('/agendamentos', {
        pacienteId,
        medicoId: Number(form.medicoId),
        data: form.data,
        motivoConsulta: form.motivo || undefined,
      });
      onSucesso();
    } catch (err) {
      setErro(err.response?.data?.erro || err.response?.data?.message || 'Erro ao agendar consulta.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="patient-modal-overlay" onClick={onClose}>
      <div className="patient-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="patient-modal__title">Nova Consulta</h2>

        <form onSubmit={handleSubmit}>
          <div className="patient-modal__field">
            <label>Médico</label>
            <select name="medicoId" value={form.medicoId} onChange={handleChange} required>
              <option value="">Selecione um médico...</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}{m.especialidade ? ` — ${m.especialidade}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="patient-modal__field">
            <label>Data e Horário</label>
            <input
              type="datetime-local"
              name="data"
              value={form.data}
              onChange={handleChange}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              required
            />
          </div>

          <div className="patient-modal__field">
            <label>Motivo da Consulta (opcional)</label>
            <textarea
              name="motivo"
              value={form.motivo}
              onChange={handleChange}
              placeholder="Descreva brevemente o motivo..."
            />
          </div>

          {erro && <p className="patient-modal__error">{erro}</p>}

          <div className="patient-modal__footer">
            <button type="button" className="patient-modal__btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="patient-modal__btn-submit" disabled={salvando}>
              {salvando ? 'Agendando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
const PatientConsultas = () => {
  const { user } = useContext(AuthContext);

  const { toast } = useToast();
  const [consultas, setConsultas]       = useState([]);
  const [medicos, setMedicos]           = useState([]);
  const [pacienteId, setPacienteId]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);

  const carregar = async () => {
    try {
      const [agendRes, pacientesRes, medicosRes] = await Promise.all([
        api.get('/agendamentos'),
        api.get('/pacientes'),
        api.get('/medicos'),
      ]);

      const pacienteLogado = (pacientesRes.data || []).find(
        (p) => p.email?.toLowerCase() === user?.email?.toLowerCase()
      );
      if (pacienteLogado) setPacienteId(pacienteLogado.id);

      const ordenadas = [...(agendRes.data || [])].sort(
        (a, b) => new Date(b.data) - new Date(a.data)
      );
      setConsultas(ordenadas);
      setMedicos(medicosRes.data || []);
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
    carregar();
  };

  return (
    <div className="patient-page">
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
        Minhas Consultas
      </h1>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Visualize e gerencie todos os seus agendamentos médicos.
      </p>

      <div className="patient-page__section-label">LIFIUM · AGENDAMENTOS</div>
      <h3 className="patient-page__section-title">Histórico de Consultas</h3>

      <div className="patient-page__actions">
        <button
          className="patient-page__btn-primary"
          onClick={() => setShowModal(true)}
          disabled={!pacienteId}
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
                  <td style={{ color: '#555', fontStyle: 'italic' }}>
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
        <AgendarModal
          pacienteId={pacienteId}
          medicos={medicos}
          onClose={() => setShowModal(false)}
          onSucesso={handleSucesso}
        />
      )}

    </div>
  );
};

export default PatientConsultas;
