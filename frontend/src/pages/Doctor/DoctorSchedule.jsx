import React, { useState, useEffect, useContext } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
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

  const [medicoId, setMedicoId] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
        // TODO [BACKEND]: Usar perfilId do token JWT em vez de buscar todos os médicos
        const medicosRes = await api.get('/medicos');
        const medicoLogado = (medicosRes.data || []).find(
          (m) => m.email?.toLowerCase() === user?.username?.toLowerCase()
        );

        if (!medicoLogado) {
          setErrorMsg('Médico não encontrado no sistema.');
          setLoading(false);
          return;
        }

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

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

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
      setSuccessMsg('Horário adicionado com sucesso!');
      setNovoHorario({ diaSemana: 'segunda', horaInicio: '08:00', horaFim: '12:00' });
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      setErrorMsg('Erro ao salvar horário. Verifique o backend.');
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (id) => {
    if (!window.confirm('Remover este horário?')) return;
    try {
      await api.delete(`/horarios/${id}`);
      setHorarios((prev) => prev.filter((h) => h.id !== id));
      setSuccessMsg('Horário removido.');
    } catch (error) {
      console.error('Erro ao remover horário:', error);
      setErrorMsg('Erro ao remover horário.');
    }
  };

  const horariosBy = (dia) => horarios.filter((h) => h.diaSemana === dia);
  const hoje = getDiaSemanaHoje();

  return (
    <div className="doctor-schedule">
      <div className="doctor-schedule__header">
        <div>
          <h1 className="doctor-schedule__title">Meus Horários</h1>
          <p className="doctor-schedule__desc">
            Configure sua grade semanal de atendimento.
          </p>
        </div>
        <button
          className="doctor-schedule__add-btn"
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
            );
          })}
        </div>
      )}

      {/* Toast sucesso */}
      {successMsg && (
        <div className="doctor-schedule__toast doctor-schedule__toast--success">
          {successMsg}
        </div>
      )}

      {/* Toast erro */}
      {errorMsg && (
        <div className="doctor-schedule__error">
          <h4>Aviso</h4>
          <p>{errorMsg}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
