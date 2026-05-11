import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../../services/api';

const INITIAL = { pacienteId: '', medicoId: '', data: '' };

const CreateAppointmentModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState(INITIAL);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoadingLists(true);
    setError('');
    Promise.all([api.get('/pacientes'), api.get('/medicos')])
      .then(([pRes, mRes]) => {
        setPacientes(pRes.data || []);
        setMedicos(mRes.data || []);
      })
      .catch(() => setError('Não foi possível carregar a lista de pacientes/médicos.'))
      .finally(() => setLoadingLists(false));
  }, [isOpen]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    setForm(INITIAL);
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/agendamentos', {
        pacienteId: parseInt(form.pacienteId),
        medicoId: parseInt(form.medicoId),
        data: form.data,
      });
      onCreated?.();
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Erro ao criar agendamento. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Novo Agendamento">
      <form className="modal-form" onSubmit={handleSubmit}>

        <div className="modal-field">
          <label>Paciente *</label>
          <select value={form.pacienteId} onChange={set('pacienteId')} required disabled={loadingLists}>
            <option value="">{loadingLists ? 'Carregando...' : 'Selecione o paciente'}</option>
            {pacientes.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div className="modal-field">
          <label>Médico *</label>
          <select value={form.medicoId} onChange={set('medicoId')} required disabled={loadingLists}>
            <option value="">{loadingLists ? 'Carregando...' : 'Selecione o médico'}</option>
            {medicos.map(m => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
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

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-footer">
          <button type="button" className="modal-btn-cancel" onClick={handleClose}>Cancelar</button>
          <button type="submit" className="modal-btn-submit" disabled={loading || loadingLists}>
            {loading ? 'Agendando...' : 'Criar Agendamento'}
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default CreateAppointmentModal;
