import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Pencil, Trash2, FileText, User, ChevronDown, Lock, Plus } from 'lucide-react';
import api from '../../services/api';
import GenericTable from '../../components/GenericTable';
import { AuthContext } from '../../context/AuthContext';
import Badge from '../../components/Badge/Badge';
import CreateUserModal from '../../components/Modal/CreateUserModal';
import ResetPasswordModal from '../../components/Modal/ResetPasswordModal';
import UserProfileModal from '../../components/Modal/UserProfileModal';
import '../../components/Modal/Modal.scss';
import './ManageUsers.scss';

const ManageUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setUsuarios([
        { id: 1, nome: 'Admin Master', email: 'admin@clinica.com', tipo: 'admin' },
        { id: 2, nome: 'Dr. Roberto Silva', email: 'roberto@clinica.com', tipo: 'medico' },
        { id: 3, nome: 'Maria Silva', email: 'maria@clinica.com', tipo: 'paciente' },
        { id: 4, nome: 'João Souza', email: 'joao@clinica.com', tipo: 'paciente' },
      ]);
      if (error.response) {
        setErrorMsg(`Erro do servidor (${error.response.status}): Não foi possível carregar os usuários.`);
      } else if (error.request) {
        setErrorMsg('Erro de conexão: Não foi possível conectar ao servidor Java.');
      } else {
        setErrorMsg(`Erro: ${error.message}`);
      }
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const openResetPassword = (row) => {
    setOpenDropdownId(null);
    setResetPasswordUser(row);
  };

  const openProfile = (row) => {
    setOpenDropdownId(null);
    setProfileUser(row);
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
            <button className="action-btn edit" title="Editar">
              <Pencil size={20} />
            </button>
            {isAdmin && (
              <button className="action-btn delete" title="Excluir">
                <Trash2 size={20} />
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
                  <User size={20} />
                  <ChevronDown
                    size={12}
                    style={{
                      transition: 'transform 0.2s',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>
              </div>
            )}
            {tipo === 'paciente' && (
              <button className="action-btn prontuario" title="Ver Prontuário">
                <FileText size={20} />
              </button>
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

      {/* Overlay fecha o dropdown ao clicar fora */}
      {openDropdownId !== null && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 150 }}
          onClick={() => setOpenDropdownId(null)}
        />
      )}

      {/* Menu do dropdown renderizado fora do overflow da tabela */}
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

      {errorMsg && (
        <div className="manage-users-error">
          <h4>Aviso de Conexão</h4>
          <p>{errorMsg}</p>
        </div>
      )}

      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={fetchUsuarios}
      />

      <ResetPasswordModal
        isOpen={!!resetPasswordUser}
        onClose={() => setResetPasswordUser(null)}
        usuario={resetPasswordUser}
      />

      <UserProfileModal
        isOpen={!!profileUser}
        onClose={() => setProfileUser(null)}
        usuario={profileUser}
      />
    </div>
  );
};

export default ManageUsers;
