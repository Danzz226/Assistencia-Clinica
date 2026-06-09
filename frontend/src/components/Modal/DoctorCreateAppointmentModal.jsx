import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const INITIAL = { pacienteId: '', data: '' };

const DoctorCreateAppointmentModal = ({ isOpen, onClose, onCreated }) => {
  const { toast } = useToast();
  const [form, setForm] = useState(INITIAL);
  const [pacientes, setPacientes] = useState([]);
  const [medicoId, setMedicoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingLists(true);
    Promise.all([api.get('/medicos/me'), api.get('/agendamentos')])
      .then(([medicoRes, agendRes]) => {
        const id = medicoRes.data.id;
        setMedicoId(id);

        // Extrai pacientes únicos dos agendamentos deste médico
        const seen = new Set();
        const lista = (agendRes.data || [])
          .filter(a => a.medicoId === id)
          .reduce((acc, a) => {
            if (!seen.has(a.pacienteId)) {
              seen.add(a.pacienteId);
              acc.push({ id: a.pacienteId, nome: a.pacienteNome });
            }
            return acc;
          }, [])
          .sort((a, b) => a.nome.localeCompare(b.nome));

        setPacientes(lista);
      })
      .catch(() => toast.error('Não foi possível carregar os dados.'))
      .finally(() => setLoadingLists(false));
  }, [isOpen]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    setForm(INITIAL);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/agendamentos', {
        pacienteId: parseInt(form.pacienteId),
        medicoId,
        data: form.data,
      });
      toast.success('Agendamento criado com sucesso!');
      onCreated?.();
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao criar agendamento. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const semPacientes = !loadingLists && pacientes.length === 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nova Consulta">
      <form className="modal-form" onSubmit={handleSubmit}>

        <div className="modal-field">
          <label>Paciente *</label>
          <select
            value={form.pacienteId}
            onChange={set('pacienteId')}
            required
            disabled={loadingLists || semPacientes}
          >
            <option value="">
              {loadingLists
                ? 'Carregando...'
                : semPacientes
                  ? 'Nenhum paciente vinculado'
                  : 'Selecione o paciente'}
            </option>
            {pacientes.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          {semPacientes && (
            <span className="modal-field-hint">
              Apenas pacientes com consultas anteriores são exibidos.
            </span>
          )}
        </div>

        <div className="modal-field">
          <label>Data e Hora *</label>
          <input
            type="datetime-local"
            value={form.data}
            onChange={set('data')}
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-btn-cancel" onClick={handleClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="modal-btn-submit"
            disabled={loading || loadingLists || semPacientes}
          >
            {loading ? 'Agendando...' : 'Criar Agendamento'}
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default DoctorCreateAppointmentModal;
