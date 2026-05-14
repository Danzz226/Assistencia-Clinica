import React, { useState, useEffect, useContext } from 'react';
import { Search, User, Pencil, Trash2, ClipboardList, Plus, UserRound, Mail, Phone, MapPin, Cake } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Modal from '../../components/Modal/Modal';
import { useToast } from '../../context/ToastContext';
import './DoctorPatients.scss';

const DoctorPatients = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [medicoId, setMedicoId] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [prontuarios, setProntuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalType, setModalType] = useState(null); // 'edit' | 'delete' | 'prontuario'
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [showNewProntuario, setShowNewProntuario] = useState(false);
  const [novaDescricao, setNovaDescricao] = useState('');
  const [salvandoProntuario, setSalvandoProntuario] = useState(false);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const medicoRes = await api.get('/medicos/me');
        const medicoLogado = medicoRes.data;
        setMedicoId(medicoLogado.id);

        const [prontuariosRes, pacientesRes] = await Promise.all([
          api.get('/prontuarios'),
          api.get('/pacientes'),
        ]);

        const meusProntuarios = (prontuariosRes.data || []).filter(
          (p) => p.medicoId === medicoLogado.id
        );
        setProntuarios(meusProntuarios);

        const ultimoProntuario = {};
        meusProntuarios.forEach((p) => {
          if (
            !ultimoProntuario[p.pacienteId] ||
            new Date(p.dataRegistro) > new Date(ultimoProntuario[p.pacienteId].dataRegistro)
          ) {
            ultimoProntuario[p.pacienteId] = p;
          }
        });

        const todosPacientes = (pacientesRes.data || []).map((p) => ({
          ...p,
          ultimoProntuario: ultimoProntuario[p.id]?.dataRegistro || null,
        }));

        setPacientes(todosPacientes);
      } catch {
        setProntuarios([
          { id: 101, pacienteId: 1, medicoId: 1, dataRegistro: '2026-05-10T09:30:00', descricao: 'Paciente apresentou dor de cabeça leve. Prescrito analgésico.' },
          { id: 102, pacienteId: 1, medicoId: 1, dataRegistro: '2026-04-15T10:00:00', descricao: 'Retorno: melhora significativa. Sem queixas.' },
          { id: 103, pacienteId: 2, medicoId: 1, dataRegistro: '2026-05-09T14:00:00', descricao: 'Exame de rotina. Todos os indicadores normais.' },
          { id: 104, pacienteId: 3, medicoId: 1, dataRegistro: '2026-05-08T10:15:00', descricao: 'Queixa de dores lombares. Solicitado RX.' },
        ]);
        setPacientes([
          { id: 1, nome: 'Ana Oliveira',     email: 'ana.oliveira@email.com',    telefone: '(11) 98765-4321', dataNascimento: '1985-03-12', ultimoProntuario: '2026-05-10T09:30:00' },
          { id: 2, nome: 'Bruno Santos',     email: 'bruno.santos@email.com',    telefone: '(21) 99123-4567', dataNascimento: '1990-07-22', ultimoProntuario: '2026-05-09T14:00:00' },
          { id: 3, nome: 'Carla Mendes',     email: 'carla.mendes@email.com',    telefone: '(31) 97654-3210', dataNascimento: '1978-11-05', ultimoProntuario: '2026-05-08T10:15:00' },
          { id: 4, nome: 'Diego Almeida',    email: 'diego.almeida@email.com',   telefone: '(41) 98877-6655', dataNascimento: '1965-01-30', ultimoProntuario: null },
          { id: 5, nome: 'Eduarda Ferreira', email: 'eduarda.f@email.com',       telefone: '(51) 91234-5678', dataNascimento: '2000-09-14', ultimoProntuario: null },
          { id: 6, nome: 'Felipe Costa',     email: 'felipe.costa@email.com',    telefone: '(61) 96543-2109', dataNascimento: '1995-06-18', ultimoProntuario: null },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchPacientes();
  }, [user]);

  const formatData = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const openEdit = (p) => {
    setSelectedPaciente(p);
    setEditForm({
      usuarioId: p.usuarioId,
      telefone: p.telefone || '',
      dataNascimento: p.dataNascimento || '',
      endereco: p.endereco || '',
    });
    setModalType('edit');
  };

  const openDelete = (p) => {
    setSelectedPaciente(p);
    setModalType('delete');
  };

  const openPerfil = (p) => {
    setSelectedPaciente(p);
    setShowNewProntuario(false);
    setNovaDescricao('');
    setModalType('perfil');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedPaciente(null);
    setShowNewProntuario(false);
    setNovaDescricao('');
  };

  const prontuariosDoPaciente = prontuarios
    .filter((p) => p.pacienteId === selectedPaciente?.id)
    .sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro));

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await api.put(`/pacientes/${selectedPaciente.id}`, editForm);
      setPacientes((prev) =>
        prev.map((p) =>
          p.id === selectedPaciente.id
            ? { ...p, telefone: editForm.telefone, dataNascimento: editForm.dataNascimento, endereco: editForm.endereco }
            : p
        )
      );
      toast.success('Alterações salvas com sucesso!');
      closeModal();
    } catch {
      toast.error('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/pacientes/${selectedPaciente.id}`);
      setPacientes((prev) => prev.filter((p) => p.id !== selectedPaciente.id));
      toast.success('Paciente excluído com sucesso!');
      closeModal();
    } catch {
      toast.error('Erro ao excluir paciente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCriarProntuario = async () => {
    if (!novaDescricao.trim() || !medicoId || !selectedPaciente) return;
    setSalvandoProntuario(true);
    try {
      const res = await api.post('/prontuarios', {
        pacienteId: selectedPaciente.id,
        medicoId,
        descricao: novaDescricao.trim(),
      });
      const novo = res.data;
      setProntuarios((prev) => [novo, ...prev]);
      setPacientes((prev) =>
        prev.map((p) =>
          p.id === selectedPaciente.id
            ? { ...p, ultimoProntuario: novo.dataRegistro }
            : p
        )
      );
      setNovaDescricao('');
      setShowNewProntuario(false);
      toast.success('Prontuário criado com sucesso!');
    } catch {
      toast.error('Erro ao criar prontuário.');
    } finally {
      setSalvandoProntuario(false);
    }
  };

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      p.email?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="doctor-patients">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Meus Pacientes</h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Todos os pacientes cadastrados no sistema.</p>
        </div>
      </div>

      <div className="doctor-patients__toolbar">
        <div className="doctor-patients__search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="doctor-patients__count">
          {pacientesFiltrados.length} paciente{pacientesFiltrados.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="doctor-patients__empty">Carregando pacientes...</div>
      ) : pacientesFiltrados.length === 0 ? (
        <div className="doctor-patients__empty">
          {filtro ? 'Nenhum paciente encontrado para essa busca.' : 'Nenhum paciente cadastrado ainda.'}
        </div>
      ) : (
        <div className="doctor-patients__table-wrapper">
          <table className="doctor-patients__table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Data Nasc.</th>
                <th>Último Prontuário</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="doctor-patients__patient-cell">
                      <div className="doctor-patients__avatar">
                        <User size={16} />
                      </div>
                      <span>{p.nome}</span>
                    </div>
                  </td>
                  <td>{p.email || '—'}</td>
                  <td>{p.telefone || '—'}</td>
                  <td>{formatData(p.dataNascimento)}</td>
                  <td>
                    {p.ultimoProntuario ? (
                      <span className="doctor-patients__badge doctor-patients__badge--green">
                        {formatData(p.ultimoProntuario)}
                      </span>
                    ) : (
                      <span className="doctor-patients__badge doctor-patients__badge--neutral">Sem registro</span>
                    )}
                  </td>
                  <td>
                    <div className="doctor-patients__actions">
                      <button className="dp-action-btn dp-action-btn--edit" title="Editar paciente" onClick={() => openEdit(p)}>
                        <Pencil size={15} />
                      </button>
                      <button className="dp-action-btn dp-action-btn--delete" title="Excluir paciente" onClick={() => openDelete(p)}>
                        <Trash2 size={15} />
                      </button>
                      <button className="dp-action-btn dp-action-btn--prontuario" title="Ver perfil" onClick={() => openPerfil(p)}>
                        <ClipboardList size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Editar */}
      <Modal isOpen={modalType === 'edit'} onClose={closeModal} title={`Editar Paciente — ${selectedPaciente?.nome}`}>
        <div className="modal-form">
          <div className="modal-field">
            <label>Telefone</label>
            <input value={editForm.telefone || ''} onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })} />
          </div>
          <div className="modal-field">
            <label>Data de Nascimento</label>
            <input type="date" value={editForm.dataNascimento || ''} onChange={(e) => setEditForm({ ...editForm, dataNascimento: e.target.value })} />
          </div>
          <div className="modal-field">
            <label>Endereço</label>
            <input value={editForm.endereco || ''} onChange={(e) => setEditForm({ ...editForm, endereco: e.target.value })} />
          </div>
          <div className="modal-footer">
            <button className="modal-btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="modal-btn-submit" onClick={handleEditSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Excluir */}
      <Modal isOpen={modalType === 'delete'} onClose={closeModal} title="Excluir Paciente">
        <div className="dp-delete-modal">
          <p>Tem certeza que deseja excluir o paciente <strong>{selectedPaciente?.nome}</strong>? Esta ação não pode ser desfeita.</p>
          <div className="modal-footer">
            <button className="modal-btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="modal-btn-danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Perfil do Paciente */}
      <Modal isOpen={modalType === 'perfil'} onClose={closeModal} title="Perfil do Paciente">
        <div className="dp-perfil-modal">

          {/* Cabeçalho do paciente */}
          <div className="dp-perfil-header">
            <div className="dp-perfil-avatar">
              <UserRound size={28} />
            </div>
            <div>
              <div className="dp-perfil-nome">{selectedPaciente?.nome}</div>
              <div className="dp-perfil-role">Paciente</div>
            </div>
          </div>

          {/* Informações */}
          <div className="dp-perfil-info">
            {selectedPaciente?.email && (
              <div className="dp-perfil-info-row">
                <Mail size={14} />
                <span>{selectedPaciente.email}</span>
              </div>
            )}
            {selectedPaciente?.telefone && (
              <div className="dp-perfil-info-row">
                <Phone size={14} />
                <span>{selectedPaciente.telefone}</span>
              </div>
            )}
            {selectedPaciente?.dataNascimento && (
              <div className="dp-perfil-info-row">
                <Cake size={14} />
                <span>{formatData(selectedPaciente.dataNascimento)}</span>
              </div>
            )}
            {selectedPaciente?.endereco && (
              <div className="dp-perfil-info-row">
                <MapPin size={14} />
                <span>{selectedPaciente.endereco}</span>
              </div>
            )}
          </div>

          <div className="dp-perfil-divider" />

          {/* Prontuários */}
          <div className="dp-perfil-section-title">Prontuários</div>

          {showNewProntuario ? (
            <div className="dp-prontuario-new-form">
              <label>Descrição do prontuário</label>
              <textarea
                rows={4}
                placeholder="Descreva a consulta, diagnóstico ou observações..."
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
              />
              <div className="dp-prontuario-new-actions">
                <button className="modal-btn-cancel" onClick={() => setShowNewProntuario(false)}>
                  Cancelar
                </button>
                <button
                  className="modal-btn-submit"
                  onClick={handleCriarProntuario}
                  disabled={salvandoProntuario || !novaDescricao.trim()}
                >
                  {salvandoProntuario ? 'Salvando...' : 'Salvar Prontuário'}
                </button>
              </div>
            </div>
          ) : (
            <button className="dp-prontuario-add-btn" onClick={() => setShowNewProntuario(true)}>
              <Plus size={15} />
              Novo Prontuário
            </button>
          )}

          {prontuariosDoPaciente.length === 0 ? (
            <p className="dp-prontuario-empty">Nenhum prontuário registrado por você para este paciente.</p>
          ) : (
            <ul className="dp-prontuario-list">
              {prontuariosDoPaciente.map((pr) => (
                <li key={pr.id} className="dp-prontuario-item">
                  <span className="dp-prontuario-date">{formatData(pr.dataRegistro)}</span>
                  <p className="dp-prontuario-desc">{pr.descricao || 'Sem descrição.'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DoctorPatients;
