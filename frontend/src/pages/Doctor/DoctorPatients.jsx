import React, { useState, useEffect, useContext } from 'react';
import { Search, User, Pencil, Trash2, ClipboardList, Plus, UserRound, Mail, Phone, MapPin, Cake, CreditCard } from 'lucide-react';
import { useTableSort, SortIcon } from '../../hooks/useTableSort';
import { FaFilePdf } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Modal from '../../components/Modal/Modal';
import { downloadProntuarioPDF } from '../../services/downloadPDF';
import { useToast } from '../../context/ToastContext';
import './DoctorPatients.scss';

const EMPTY_PRONTUARIO = {
  queixaPrincipal: '',
  historicoDoencaAtual: '',
  historicoMedico: '',
  historicoFamiliar: '',
  habitosVida: '',
  alergias: '',
  medicamentosEmUso: '',
  pressaoArterial: '',
  frequenciaCardiaca: '',
  frequenciaRespiratoria: '',
  temperatura: '',
  saturacaoO2: '',
  peso: '',
  altura: '',
  exameFisico: '',
  cid10: '',
  hipoteseDiagnostica: '',
  conduta: '',
  descricao: '',
};

const DoctorPatients = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [medicoId, setMedicoId] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [prontuarios, setProntuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalType, setModalType] = useState(null);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [novoProntuario, setNovoProntuario] = useState(EMPTY_PRONTUARIO);
  const [salvandoProntuario, setSalvandoProntuario] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadPDF = async (pr) => {
    setDownloadingId(pr.id);
    try {
      await downloadProntuarioPDF(pr);
      toast.success('PDF baixado com sucesso!');
    } catch {
      toast.error('Erro ao gerar o PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const medicoRes = await api.get('/medicos/me');
        const medicoLogado = medicoRes.data;
        setMedicoId(medicoLogado.id);

        const [prontuariosRes, pacientesRes] = await Promise.all([
          api.get('/prontuarios'),
          api.get('/medicos/me/pacientes'),
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

  const PHONE_RE = /^\(\d{2}\) \d{5}-\d{4}$/;

  const openEdit = (p) => {
    setSelectedPaciente(p);
    setEditError('');
    setEditForm({ usuarioId: p.usuarioId, nome: p.nome || '', email: p.email || '', telefone: p.telefone || '', dataNascimento: p.dataNascimento || '', endereco: p.endereco || '' });
    setModalType('edit');
  };

  const openDelete = (p) => { setSelectedPaciente(p); setModalType('delete'); };

  const openPerfil = (p) => { setSelectedPaciente(p); setModalType('perfil'); };

  const openNovoProntuario = (p) => {
    setSelectedPaciente(p);
    setNovoProntuario(EMPTY_PRONTUARIO);
    setModalType('novoProntuario');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedPaciente(null);
    setNovoProntuario(EMPTY_PRONTUARIO);
  };

  const prontuariosDoPaciente = prontuarios
    .filter((p) => p.pacienteId === selectedPaciente?.id)
    .sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro));

  const handleEditSave = async () => {
    setEditError('');
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editForm.email && !EMAIL_RE.test(editForm.email)) { setEditError('Formato de e-mail inválido.'); return; }
    if (editForm.telefone && !PHONE_RE.test(editForm.telefone)) { setEditError('Telefone deve estar no formato: (11) 99999-9999'); return; }
    setSaving(true);
    try {
      const payload = { nome: editForm.nome, email: editForm.email, telefone: editForm.telefone || null, dataNascimento: editForm.dataNascimento || null, endereco: editForm.endereco || null };
      await api.put(`/usuarios/${selectedPaciente.usuarioId}`, payload);
      setPacientes((prev) => prev.map((p) => p.id === selectedPaciente.id ? { ...p, ...payload } : p));
      toast.success('Alterações salvas com sucesso!');
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.erro || err.response?.data?.message || err.response?.data;
      setEditError(typeof msg === 'string' ? msg : 'Erro ao salvar alterações.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/pacientes/${selectedPaciente.id}`);
      setPacientes((prev) => prev.filter((p) => p.id !== selectedPaciente.id));
      toast.delete('Paciente excluído com sucesso!');
      closeModal();
    } catch { toast.error('Erro ao excluir paciente.'); }
    finally { setSaving(false); }
  };

  const handleCriarProntuario = async () => {
    if (!medicoId || !selectedPaciente) return;
    setSalvandoProntuario(true);
    try {
      const payload = {
        pacienteId: selectedPaciente.id,
        medicoId,
        ...novoProntuario,
        frequenciaCardiaca:     novoProntuario.frequenciaCardiaca     ? parseInt(novoProntuario.frequenciaCardiaca)     : null,
        frequenciaRespiratoria: novoProntuario.frequenciaRespiratoria ? parseInt(novoProntuario.frequenciaRespiratoria) : null,
        temperatura:            novoProntuario.temperatura            ? parseFloat(novoProntuario.temperatura)          : null,
        saturacaoO2:            novoProntuario.saturacaoO2            ? parseInt(novoProntuario.saturacaoO2)            : null,
        peso:                   novoProntuario.peso                   ? parseFloat(novoProntuario.peso)                 : null,
        altura:                 novoProntuario.altura                 ? parseInt(novoProntuario.altura)                 : null,
      };
      const res = await api.post('/prontuarios', payload);
      const novo = res.data;
      setProntuarios((prev) => [novo, ...prev]);
      setPacientes((prev) => prev.map((p) => p.id === selectedPaciente.id ? { ...p, ultimoProntuario: novo.dataRegistro } : p));
      toast.success('Prontuário criado com sucesso!');
      closeModal();
    } catch { toast.error('Erro ao criar prontuário.'); }
    finally { setSalvandoProntuario(false); }
  };

  const pacientesFiltrados = pacientes.filter(
    (p) => p.nome?.toLowerCase().includes(filtro.toLowerCase()) || p.email?.toLowerCase().includes(filtro.toLowerCase())
  );

  const { sortKey, sortDir, handleSort, sortedData: sortedPacientes } = useTableSort(pacientesFiltrados);

  const formatPhone = (val) => {
    if (!val) return '';
    let num = val.replace(/\D/g, '');
    if (num.length > 11) num = num.substring(0, 11);
    if (num.length <= 2) return num ? `(${num}` : '';
    if (num.length <= 7) return `(${num.substring(0, 2)}) ${num.substring(2)}`;
    return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
  };

  const setField = (field) => (e) => setNovoProntuario((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="doctor-patients">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Meus Pacientes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Todos os pacientes cadastrados no sistema.</p>
        </div>
      </div>

      <div className="doctor-patients__toolbar">
        <div className="doctor-patients__search">
          <Search size={16} />
          <input type="text" placeholder="Buscar por nome ou email..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
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
                <th className="sortable" onClick={() => handleSort('nome')}>
                  <span className="th-content">Paciente <SortIcon sortKey={sortKey} columnKey="nome" sortDir={sortDir} /></span>
                </th>
                <th className="sortable" onClick={() => handleSort('email')}>
                  <span className="th-content">Email <SortIcon sortKey={sortKey} columnKey="email" sortDir={sortDir} /></span>
                </th>
                <th className="sortable" onClick={() => handleSort('telefone')}>
                  <span className="th-content">Telefone <SortIcon sortKey={sortKey} columnKey="telefone" sortDir={sortDir} /></span>
                </th>
                <th className="sortable" onClick={() => handleSort('dataNascimento')}>
                  <span className="th-content">Data Nasc. <SortIcon sortKey={sortKey} columnKey="dataNascimento" sortDir={sortDir} /></span>
                </th>
                <th className="sortable" onClick={() => handleSort('ultimoProntuario')}>
                  <span className="th-content">Último Prontuário <SortIcon sortKey={sortKey} columnKey="ultimoProntuario" sortDir={sortDir} /></span>
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedPacientes.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="doctor-patients__patient-cell">
                      <div className="doctor-patients__avatar"><User size={16} /></div>
                      <span>{p.nome}</span>
                    </div>
                  </td>
                  <td>{p.email || '—'}</td>
                  <td>{p.telefone || '—'}</td>
                  <td>{formatData(p.dataNascimento)}</td>
                  <td>
                    {p.ultimoProntuario ? (
                      <span className="doctor-patients__badge doctor-patients__badge--green">{formatData(p.ultimoProntuario)}</span>
                    ) : (
                      <span className="doctor-patients__badge doctor-patients__badge--neutral">Sem registro</span>
                    )}
                  </td>
                  <td>
                    <div className="doctor-patients__actions">
                      <button className="dp-action-btn dp-action-btn--edit" title="Editar paciente" onClick={() => openEdit(p)}><Pencil size={15} /></button>
                      <button className="dp-action-btn dp-action-btn--delete" title="Excluir paciente" onClick={() => openDelete(p)}><Trash2 size={15} /></button>
                      <button className="dp-action-btn dp-action-btn--prontuario" title="Ver prontuários" onClick={() => openPerfil(p)}><ClipboardList size={15} /></button>
                      <button className="dp-action-btn dp-action-btn--new-pront" title="Novo prontuário" onClick={() => openNovoProntuario(p)}><Plus size={15} /></button>
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
          <div className="modal-field"><label>Nome</label><input value={editForm.nome || ''} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} /></div>
          <div className="modal-field"><label>E-mail</label><input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
          <div className="modal-field"><label>Telefone</label><input value={editForm.telefone || ''} onChange={(e) => setEditForm({ ...editForm, telefone: formatPhone(e.target.value) })} placeholder="(11) 99999-9999" maxLength={15} /></div>
          <div className="modal-field"><label>Data de Nascimento</label><input type="date" value={editForm.dataNascimento || ''} onChange={(e) => setEditForm({ ...editForm, dataNascimento: e.target.value })} /></div>
          <div className="modal-field"><label>Endereço</label><input value={editForm.endereco || ''} onChange={(e) => setEditForm({ ...editForm, endereco: e.target.value })} /></div>
          {editError && <p className="modal-error">{editError}</p>}
          <div className="modal-footer">
            <button className="modal-btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="modal-btn-submit" onClick={handleEditSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </div>
      </Modal>

      {/* Modal Excluir */}
      <Modal isOpen={modalType === 'delete'} onClose={closeModal} title="Excluir Paciente">
        <div className="dp-delete-modal">
          <p>Tem certeza que deseja excluir o paciente <strong>{selectedPaciente?.nome}</strong>? Esta ação não pode ser desfeita.</p>
          <div className="modal-footer">
            <button className="modal-btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="modal-btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Excluindo...' : 'Excluir'}</button>
          </div>
        </div>
      </Modal>

      {/* Modal Perfil — lista de prontuários */}
      <Modal isOpen={modalType === 'perfil'} onClose={closeModal} title="Perfil do Paciente">
        <div className="dp-perfil-modal">
          <div className="dp-perfil-header">
            <div className="dp-perfil-avatar"><UserRound size={28} /></div>
            <div>
              <div className="dp-perfil-nome">{selectedPaciente?.nome}</div>
              <div className="dp-perfil-role">Paciente</div>
            </div>
          </div>
          <div className="dp-perfil-info">
            <div className="dp-perfil-info-row"><Mail size={14} /><span>{selectedPaciente?.email || 'Não informado'}</span></div>
            <div className="dp-perfil-info-row"><CreditCard size={14} /><span>{selectedPaciente?.cpf || 'Não informado'}</span></div>
            <div className="dp-perfil-info-row"><Phone size={14} /><span>{selectedPaciente?.telefone || 'Não informado'}</span></div>
            <div className="dp-perfil-info-row"><Cake size={14} /><span>{selectedPaciente?.dataNascimento ? formatData(selectedPaciente.dataNascimento) : 'Não informado'}</span></div>
            <div className="dp-perfil-info-row"><MapPin size={14} /><span>{selectedPaciente?.endereco || 'Não informado'}</span></div>
          </div>
          <div className="dp-perfil-divider" />

          <div className="dp-perfil-section-header">
            <span className="dp-perfil-section-title">Prontuários</span>
            <button className="dp-prontuario-add-btn" onClick={() => { closeModal(); setTimeout(() => openNovoProntuario(selectedPaciente), 10); }}>
              <Plus size={14} /> Novo
            </button>
          </div>

          {prontuariosDoPaciente.length === 0 ? (
            <p className="dp-prontuario-empty">Nenhum prontuário registrado por você para este paciente.</p>
          ) : (
            <ul className="dp-prontuario-list">
              {prontuariosDoPaciente.map((pr) => (
                <li key={pr.id} className="dp-prontuario-item">
                  <div className="dp-prontuario-item-header">
                    <span className="dp-prontuario-date">{formatData(pr.dataRegistro)}</span>
                    <div className="dp-prontuario-item-actions">
                      <button
                        className="btn-pdf-icon"
                        title="Baixar PDF"
                        disabled={downloadingId === pr.id}
                        onClick={() => handleDownloadPDF(pr)}
                      >
                        {downloadingId === pr.id ? 'Gerando...' : 'Download PDF'}
                        <FaFilePdf size={20} color="#e53e3e" />
                      </button>
                    </div>
                  </div>
                  <p className="dp-prontuario-desc">{pr.queixaPrincipal || pr.descricao || 'Sem descrição.'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      {/* Modal Novo Prontuário — standalone */}
      <Modal isOpen={modalType === 'novoProntuario'} onClose={closeModal} title={`Novo Prontuário — ${selectedPaciente?.nome}`}>
        <div className="dp-novo-pront-modal">

          <div className="dp-pront-section-label">Sinais Vitais</div>
          <div className="dp-pront-vitals-grid">
            <div className="dp-pront-field"><label>PA (mmHg)</label><input placeholder="120/80" value={novoProntuario.pressaoArterial} onChange={setField('pressaoArterial')} /></div>
            <div className="dp-pront-field"><label>FC (bpm)</label><input type="number" placeholder="72" value={novoProntuario.frequenciaCardiaca} onChange={setField('frequenciaCardiaca')} /></div>
            <div className="dp-pront-field"><label>FR (rpm)</label><input type="number" placeholder="16" value={novoProntuario.frequenciaRespiratoria} onChange={setField('frequenciaRespiratoria')} /></div>
            <div className="dp-pront-field"><label>Temp. (°C)</label><input type="number" step="0.1" placeholder="36.5" value={novoProntuario.temperatura} onChange={setField('temperatura')} /></div>
            <div className="dp-pront-field"><label>SpO₂ (%)</label><input type="number" placeholder="98" value={novoProntuario.saturacaoO2} onChange={setField('saturacaoO2')} /></div>
            <div className="dp-pront-field"><label>Peso (kg)</label><input type="number" step="0.1" placeholder="70.5" value={novoProntuario.peso} onChange={setField('peso')} /></div>
            <div className="dp-pront-field"><label>Altura (cm)</label><input type="number" placeholder="170" value={novoProntuario.altura} onChange={setField('altura')} /></div>
          </div>

          <div className="dp-pront-section-label">Anamnese</div>
          <div className="dp-pront-field"><label>Queixa Principal</label><textarea rows={2} placeholder="Motivo principal da consulta..." value={novoProntuario.queixaPrincipal} onChange={setField('queixaPrincipal')} /></div>
          <div className="dp-pront-field"><label>História da Doença Atual (HDA)</label><textarea rows={3} placeholder="Evolução e características da queixa..." value={novoProntuario.historicoDoencaAtual} onChange={setField('historicoDoencaAtual')} /></div>
          <div className="dp-pront-field"><label>Histórico Médico</label><textarea rows={2} placeholder="Doenças prévias, cirurgias, internações..." value={novoProntuario.historicoMedico} onChange={setField('historicoMedico')} /></div>
          <div className="dp-pront-field"><label>Histórico Familiar</label><textarea rows={2} placeholder="Doenças hereditárias relevantes..." value={novoProntuario.historicoFamiliar} onChange={setField('historicoFamiliar')} /></div>
          <div className="dp-pront-field"><label>Hábitos de Vida</label><textarea rows={2} placeholder="Tabagismo, etilismo, atividade física..." value={novoProntuario.habitosVida} onChange={setField('habitosVida')} /></div>
          <div className="dp-pront-field"><label>Alergias</label><textarea rows={2} placeholder="Medicamentos, alimentos, substâncias..." value={novoProntuario.alergias} onChange={setField('alergias')} /></div>
          <div className="dp-pront-field"><label>Medicamentos em Uso</label><textarea rows={2} placeholder="Nome, dose e frequência..." value={novoProntuario.medicamentosEmUso} onChange={setField('medicamentosEmUso')} /></div>

          <div className="dp-pront-section-label">Exame Físico</div>
          <div className="dp-pront-field"><label>Descrição</label><textarea rows={3} placeholder="Achados do exame físico..." value={novoProntuario.exameFisico} onChange={setField('exameFisico')} /></div>

          <div className="dp-pront-section-label">Hipótese Diagnóstica</div>
          <div className="dp-pront-vitals-grid">
            <div className="dp-pront-field"><label>CID-10</label><input placeholder="J06.9" value={novoProntuario.cid10} onChange={setField('cid10')} maxLength={10} /></div>
          </div>
          <div className="dp-pront-field"><label>Hipótese</label><textarea rows={2} placeholder="Diagnóstico ou suspeita diagnóstica..." value={novoProntuario.hipoteseDiagnostica} onChange={setField('hipoteseDiagnostica')} /></div>

          <div className="dp-pront-section-label">Conduta / Plano Terapêutico</div>
          <div className="dp-pront-field"><label>Conduta</label><textarea rows={3} placeholder="Tratamento prescrito, orientações, encaminhamentos..." value={novoProntuario.conduta} onChange={setField('conduta')} /></div>

          <div className="dp-pront-section-label">Observações Gerais</div>
          <div className="dp-pront-field"><label>Observações</label><textarea rows={2} placeholder="Informações adicionais..." value={novoProntuario.descricao} onChange={setField('descricao')} /></div>

          <div className="modal-footer">
            <button className="modal-btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="modal-btn-submit" onClick={handleCriarProntuario} disabled={salvandoProntuario}>
              {salvandoProntuario ? 'Salvando...' : 'Salvar Prontuário'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorPatients;
