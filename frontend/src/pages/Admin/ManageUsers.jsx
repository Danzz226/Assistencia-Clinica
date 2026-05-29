import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Pencil, Trash2, FileText, User, ChevronDown, Lock, Plus, ClipboardList } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import GenericTable from '../../components/GenericTable';
import { AuthContext } from '../../context/AuthContext';
import Badge from '../../components/Badge/Badge';
import Modal from '../../components/Modal/Modal';
import CreateUserModal from '../../components/Modal/CreateUserModal';
import ResetPasswordModal from '../../components/Modal/ResetPasswordModal';
import UserProfileModal from '../../components/Modal/UserProfileModal';
import '../../components/Modal/Modal.scss';
import './ManageUsers.scss';

const ManageUsers = () => {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [prontuarioUser, setProntuarioUser] = useState(null);
  const [prontuarios, setProntuarios] = useState([]);
  const [loadingProntuarios, setLoadingProntuarios] = useState(false);

  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await api.get('/usuarios');

      const filteredUsuarios = response.data.filter(u => u.tipo?.toLowerCase() !== 'admin');
      setUsuarios(filteredUsuarios);
    } catch (error) {
      setUsuarios([]);
      const msg = error.response?.data?.message
        || (error.response ? `Erro ${error.response.status} ao carregar usuários.` : 'Sem conexão com o servidor.');
      toast.error(msg);
    }
  }, []);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const formatPhone = (val) => {
    if (!val) return '';
    let num = val.replace(/\D/g, '');
    if (num.length > 11) num = num.substring(0, 11);
    if (num.length <= 2) return num ? `(${num}` : '';
    if (num.length <= 7) return `(${num.substring(0, 2)}) ${num.substring(2)}`;
    return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
  };

  const openEdit = async (row) => {
    setEditUser(row);
    setEditForm({ nome: row.nome, email: row.email, tipo: row.tipo });

    try {
      if (row.tipo === 'paciente') {
        const res = await api.get('/pacientes');
        const p = res.data.find(x => x.usuarioId === row.id);
        if (p) {
          setEditForm(prev => ({
            ...prev,
            telefone: formatPhone(p.telefone),
            dataNascimento: p.dataNascimento || '',
            endereco: p.endereco || ''
          }));
        }
      } else if (row.tipo === 'medico') {
        const res = await api.get('/medicos');
        const m = res.data.find(x => x.usuarioId === row.id);
        if (m) {
          setEditForm(prev => ({
            ...prev,
            crm: m.crm || '',
            uf: m.uf || '',
            especialidade: m.especialidade || '',
            telefone: formatPhone(m.telefone || ''),
          }));
        }
      }
    } catch (e) {
      console.error('Erro ao carregar dados do perfil', e);
    }
  };

  const openDelete = (row) => setDeleteUser(row);

  const openProntuario = async (row) => {
    setProntuarioUser(row);
    setLoadingProntuarios(true);
    try {
      const [pacientesRes, prontuariosRes] = await Promise.all([
        api.get('/pacientes'),
        api.get('/prontuarios'),
      ]);
      const paciente = (pacientesRes.data || []).find(p => p.usuarioId === row.id);
      const lista = paciente
        ? (prontuariosRes.data || []).filter(p => p.pacienteId === paciente.id)
        : [];
      setProntuarios(lista.sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro)));
    } catch {
      setProntuarios([]);
    } finally {
      setLoadingProntuarios(false);
    }
  };

  const handleEditSave = async () => {
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_RE.test(editForm.email)) {
      toast.error('Formato de e-mail inválido.');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/usuarios/${editUser.id}`, editForm);
      setUsuarios(prev => prev.map(u => u.id === editUser.id ? { ...u, ...editForm } : u));
      toast.success('Alterações salvas com sucesso!');
      setEditUser(null);
    } catch {
      toast.error('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/usuarios/${deleteUser.id}`);
      setUsuarios(prev => prev.filter(u => u.id !== deleteUser.id));
      toast.delete('Usuário excluído com sucesso!');
      setDeleteUser(null);
    } catch {
      toast.error('Erro ao excluir usuário.');
    } finally {
      setSaving(false);
    }
  };

  const openResetPassword = (row) => {
    setOpenDropdownId(null);
    setResetPasswordUser(row);
  };

  const openProfile = (row) => {
    setOpenDropdownId(null);
    setProfileUser(row);
  };

  const formatData = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nome', accessor: 'nome' },
    { header: 'E-mail', accessor: 'email' },
    {
      header: 'Tipo',
      render: (row) => {
        const tipo = row.tipo?.toLowerCase() || '';
        const variantMap = { admin: 'admin', medico: 'medico', paciente: 'paciente', funcionario: 'default' };
        return <Badge variant={variantMap[tipo] || 'default'}>{row.tipo?.toUpperCase() || 'N/A'}</Badge>;
      },
    },
    {
      header: 'Ações',
      render: (row) => {
        const tipo = row.tipo?.toLowerCase() || '';
        const isOpen = openDropdownId === row.id;

        return (
          <div className="manage-users-actions">
            <button className="action-btn edit" title="Editar" onClick={() => openEdit(row)}>
              <Pencil size={16} />
            </button>
            {isAdmin && (
              <button className="action-btn delete" title="Excluir" onClick={() => openDelete(row)}>
                <Trash2 size={16} />
              </button>
            )}
            {(tipo === 'medico' || tipo === 'admin' || tipo === 'funcionario' || tipo === 'paciente') && (
              <div className="profile-dropdown-wrapper">
                <button
                  className={`action-btn perfil profile-dropdown-trigger${isOpen ? ' active' : ''}`}
                  title="Perfil"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                    setOpenDropdownId(isOpen ? null : row.id);
                  }}
                >
                  <User size={16} />
                  <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
              </div>
            )}
            {tipo === 'paciente' ? (
              <button className="action-btn prontuario" title="Ver Prontuário" onClick={() => openProntuario(row)}>
                <ClipboardList size={16} />
              </button>
            ) : (
              <span style={{ width: 28, display: 'inline-block', flexShrink: 0 }} />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="manage-users-container">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Gerenciar Usuários</h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Visualize e gerencie os acessos do sistema.</p>
        </div>
        {isAdmin && (
          <button className="btn-create" style={{ flexShrink: 0 }} onClick={() => setCreateModalOpen(true)}>
            <Plus size={15} />
            Novo Usuário
          </button>
        )}
      </div>

      <GenericTable columns={columns} data={usuarios} />

      {openDropdownId !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setOpenDropdownId(null)} />
      )}

      {openDropdownId !== null && (
        <div
          className="profile-dropdown-menu"
          style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, zIndex: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const row = usuarios.find(u => u.id === openDropdownId);
            return row ? (
              <>
                <button className="profile-dropdown-item" onClick={() => openProfile(row)}>
                  <User size={14} />
                  Ver Perfil
                </button>
                <button className="profile-dropdown-item danger" onClick={() => openResetPassword(row)}>
                  <Lock size={14} />
                  Redefinir Senha
                </button>
              </>
            ) : null;
          })()}
        </div>
      )}

      {/* Modal Editar */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Editar Usuário">
        <div className="modal-form">
          <div className="modal-field">
            <label>Nome</label>
            <input value={editForm.nome || ''} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} />
          </div>
          <div className="modal-field">
            <label>Email</label>
            <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          </div>

          {editForm.tipo === 'paciente' && (
            <>
              <div className="modal-field">
                <label>Data de Nascimento</label>
                <input type="date" value={editForm.dataNascimento || ''} onChange={(e) => setEditForm({ ...editForm, dataNascimento: e.target.value })} />
              </div>
              <div className="modal-field">
                <label>Telefone</label>
                <input 
                  value={editForm.telefone || ''} 
                  onChange={(e) => setEditForm({ ...editForm, telefone: formatPhone(e.target.value) })} 
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="modal-field">
                <label>Endereço</label>
                <input value={editForm.endereco || ''} onChange={(e) => setEditForm({ ...editForm, endereco: e.target.value })} />
              </div>
            </>
          )}

          {editForm.tipo === 'medico' && (
            <>
              <div className="modal-field">
                <label>CRM</label>
                <input value={editForm.crm || ''} onChange={(e) => setEditForm({ ...editForm, crm: e.target.value })} maxLength={6} />
              </div>
              <div className="modal-field">
                <label>Especialidade</label>
                <input value={editForm.especialidade || ''} onChange={(e) => setEditForm({ ...editForm, especialidade: e.target.value })} />
              </div>
            </>
          )}
          <div className="modal-footer">
            <button className="modal-btn-cancel" onClick={() => setEditUser(null)}>Cancelar</button>
            <button className="modal-btn-submit" onClick={handleEditSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Excluir */}
      <Modal isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} title="Excluir Usuário">
        <div className="mu-delete-modal">
          <p>Tem certeza que deseja excluir o usuário <strong>{deleteUser?.nome}</strong>? Esta ação não pode ser desfeita.</p>
          <div className="modal-footer">
            <button className="modal-btn-cancel" onClick={() => setDeleteUser(null)}>Cancelar</button>
            <button className="modal-btn-danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Prontuário */}
      <Modal isOpen={!!prontuarioUser} onClose={() => setProntuarioUser(null)} title={`Prontuários — ${prontuarioUser?.nome}`}>
        <div className="mu-prontuario-modal">
          {loadingProntuarios ? (
            <p className="mu-prontuario-empty">Carregando prontuários...</p>
          ) : prontuarios.length === 0 ? (
            <p className="mu-prontuario-empty">Nenhum prontuário registrado para este paciente.</p>
          ) : (
            <ul className="mu-prontuario-list">
              {prontuarios.map((pr) => (
                <li key={pr.id} className="mu-prontuario-item">
                  <span className="mu-prontuario-date">{formatData(pr.dataRegistro)}</span>
                  <p className="mu-prontuario-desc">{pr.descricao || 'Sem descrição.'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      <CreateUserModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreated={fetchUsuarios} />
      <ResetPasswordModal isOpen={!!resetPasswordUser} onClose={() => setResetPasswordUser(null)} usuario={resetPasswordUser} />
      <UserProfileModal isOpen={!!profileUser} onClose={() => setProfileUser(null)} usuario={profileUser} />
    </div>
  );
};

export default ManageUsers;
