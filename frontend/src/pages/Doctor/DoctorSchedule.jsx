import React, { useState, useEffect, useContext } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './DoctorSchedule.scss';

// TODO [BACKEND]: Substituir por endpoint filtrado GET /horarios?medicoId={id}
// e usar perfilId do token JWT em vez de buscar todos os médicos pelo email.
// Idealmente, no POST /horarios o medicoId deveria vir do próprio token (segurança).

const DIAS = [
  { key: 'segunda', label: 'Segunda' },
  { key: 'terca',   label: 'Terça'   },
  { key: 'quarta',  label: 'Quarta'  },
  { key: 'quinta',  label: 'Quinta'  },
  { key: 'sexta',   label: 'Sexta'   },
  { key: 'sabado',  label: 'Sábado'  },
  { key: 'domingo', label: 'Domingo' },
];

const DoctorSchedule = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [medicoId, setMedicoId] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado do formulário de novo horário
  const [showForm, setShowForm] = useState(false);
  const [novoHorario, setNovoHorario] = useState({
    diaSemana: 'segunda',
    horaInicio: '08:00',
    horaFim: '12:00',
  });
  const [salvando, setSalvando] = useState(false);

  const getDiaSemanaHoje = () => {
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    return dias[new Date().getDay()];
  };

  const fetchHorarios = async (mId) => {
    // TODO [BACKEND]: Substituir por GET /horarios?medicoId={mId}
    const res = await api.get('/horarios');
    const todos = res.data || [];
    return todos.filter((h) => h.medicoId === mId);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const medicoRes = await api.get('/medicos/me');
        const medicoLogado = medicoRes.data;
        setMedicoId(medicoLogado.id);
        const meusHorarios = await fetchHorarios(medicoLogado.id);
        setHorarios(meusHorarios);
      } catch (error) {
        console.warn('⚠️ Backend offline — carregando horários mock.');
        // MOCK: Horários fictícios para testar a UI sem o backend
        setMedicoId(-1); // ID mock para identificar modo offline
        setHorarios([
          { id: 1, medicoId: -1, diaSemana: 'segunda', horaInicio: '08:00:00', horaFim: '12:00:00' },
          { id: 2, medicoId: -1, diaSemana: 'segunda', horaInicio: '14:00:00', horaFim: '18:00:00' },
          { id: 3, medicoId: -1, diaSemana: 'terca',   horaInicio: '08:00:00', horaFim: '12:00:00' },
          { id: 4, medicoId: -1, diaSemana: 'quarta',  horaInicio: '09:00:00', horaFim: '13:00:00' },
          { id: 5, medicoId: -1, diaSemana: 'quinta',  horaInicio: '14:00:00', horaFim: '18:00:00' },
          { id: 6, medicoId: -1, diaSemana: 'sexta',   horaInicio: '08:00:00', horaFim: '11:00:00' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user) init();
  }, [user]);

  const handleSalvar = async () => {
    if (!medicoId) return;
    setSalvando(true);
    try {
      await api.post('/horarios', {
        medicoId,
        diaSemana: novoHorario.diaSemana,
        horaInicio: novoHorario.horaInicio + ':00',
        horaFim: novoHorario.horaFim + ':00',
      });
      const atualizados = await fetchHorarios(medicoId);
      setHorarios(atualizados);
      setShowForm(false);
      toast.success('Horário adicionado com sucesso!');
      setNovoHorario({ diaSemana: 'segunda', horaInicio: '08:00', horaFim: '12:00' });
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      toast.error('Erro ao salvar horário. Verifique o backend.');
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (id) => {
    if (!window.confirm('Remover este horário?')) return;
    try {
      await api.delete(`/horarios/${id}`);
      setHorarios((prev) => prev.filter((h) => h.id !== id));
      toast.success('Horário removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover horário:', error);
      toast.error('Erro ao remover horário.');
    }
  };

  const horariosBy = (dia) => horarios.filter((h) => h.diaSemana === dia);
  const hoje = getDiaSemanaHoje();

  return (
    <div className="doctor-schedule">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Meus Horários</h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Configure sua grade semanal de atendimento.</p>
        </div>
        <button
          className="doctor-schedule__add-btn"
          style={{ flexShrink: 0 }}
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Adicionar Horário
        </button>
      </div>

      {/* Formulário de novo horário */}
      {showForm && (
        <div className="doctor-schedule__form">
          <h3 className="doctor-schedule__form-title">Novo Horário de Atendimento</h3>
          <div className="doctor-schedule__form-fields">
            <div className="doctor-schedule__field">
              <label>Dia da Semana</label>
              <select
                value={novoHorario.diaSemana}
                onChange={(e) => setNovoHorario({ ...novoHorario, diaSemana: e.target.value })}
              >
                {DIAS.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className="doctor-schedule__field">
              <label>Hora de Início</label>
              <input
                type="time"
                value={novoHorario.horaInicio}
                onChange={(e) => setNovoHorario({ ...novoHorario, horaInicio: e.target.value })}
              />
            </div>
            <div className="doctor-schedule__field">
              <label>Hora de Fim</label>
              <input
                type="time"
                value={novoHorario.horaFim}
                onChange={(e) => setNovoHorario({ ...novoHorario, horaFim: e.target.value })}
              />
            </div>
          </div>
          <div className="doctor-schedule__form-actions">
            <button
              className="doctor-schedule__btn doctor-schedule__btn--cancel"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
            <button
              className="doctor-schedule__btn doctor-schedule__btn--save"
              onClick={handleSalvar}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar Horário'}
            </button>
          </div>
        </div>
      )}

      {/* Grade semanal */}
      {loading ? (
        <div className="doctor-schedule__empty">Carregando horários...</div>
      ) : (
        <div className="doctor-schedule__grid">
          {DIAS.map((dia) => {
            const slots = horariosBy(dia.key);
            const isHoje = dia.key === hoje;
            return (
              <div
                key={dia.key}
                className={`doctor-schedule__day ${isHoje ? 'doctor-schedule__day--today' : ''}`}
              >
                <div className="doctor-schedule__day-header">
                  <span className="doctor-schedule__day-name">{dia.label}</span>
                  {isHoje && (
                    <span className="doctor-schedule__day-today-badge">Hoje</span>
                  )}
                </div>

                <div className="doctor-schedule__day-content">
                  {slots.length === 0 ? (
                    <div className="doctor-schedule__day-empty">Livre</div>
                  ) : (
                    slots.map((h) => (
                      <div key={h.id} className="doctor-schedule__slot">
                        <Clock size={13} />
                        <span className="doctor-schedule__slot-time">
                          {h.horaInicio?.substring(0, 5)} – {h.horaFim?.substring(0, 5)}
                        </span>
                        <button
                          className="doctor-schedule__slot-remove"
                          onClick={() => handleRemover(h.id)}
                          title="Remover horário"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default DoctorSchedule;
