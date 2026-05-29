import React, { useState, useEffect, useContext } from 'react';
import { Lock, Mail, Stethoscope, Briefcase, Calendar, Phone, MapPin, CreditCard, Pencil } from 'lucide-react';
import Modal from './Modal';
import ResetPasswordModal from './ResetPasswordModal';
import EditProfileModal from './EditProfileModal';
import Badge from '../Badge/Badge';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import './UserProfileModal.scss';

const TIPO_ENDPOINT = {
  medico: '/medicos',
  paciente: '/pacientes',
  funcionario: '/funcionarios',
};

const TIPO_VARIANT = {
  admin: 'admin',
  medico: 'medico',
  paciente: 'paciente',
  funcionario: 'default',
};

const Avatar = ({ nome }) => {
  const initials = nome
    ? nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';
  return <div className="user-profile-modal__avatar">{initials}</div>;
};

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="user-profile-modal__info-row">
      <Icon size={16} className="user-profile-modal__info-row-icon" />
      <div>
        <div className="user-profile-modal__info-row-label">{label}</div>
        <div className="user-profile-modal__info-row-value">{value}</div>
      </div>
    </div>
  );
};

const UserProfileModal = ({ isOpen, onClose, usuario, isSelf = false }) => {
  const { user: loggedUser } = useContext(AuthContext);
  const isAdmin = loggedUser?.role === 'admin';

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !usuario) return;
    setPerfil(null);

    const tipo = usuario.tipo;
    if (!TIPO_ENDPOINT[tipo]) return;

    setLoading(true);

    const request = isSelf && tipo === 'medico'
      ? api.get('/medicos/me')
      : api.get(TIPO_ENDPOINT[tipo]).then(res => {
          const found = (res.data || []).find(p => p.usuarioId === usuario.id);
          return { data: found || null };
        });

    request
      .then(res => setPerfil(res.data || null))
      .catch(() => setPerfil(null))
      .finally(() => setLoading(false));
  }, [isOpen, usuario, isSelf]);

  const handleClose = () => {
    setPerfil(null);
    setEditOpen(false);
    onClose();
  };

  const recarregarPerfil = () => {
    if (!usuario) return;
    const tipo = usuario.tipo;
    if (!TIPO_ENDPOINT[tipo]) return;
    setLoading(true);
    const request = isSelf && tipo === 'medico'
      ? api.get('/medicos/me')
      : api.get(TIPO_ENDPOINT[tipo]).then(res => {
          const found = (res.data || []).find(p => p.usuarioId === usuario.id);
          return { data: found || null };
        });
    request
      .then(res => setPerfil(res.data || null))
      .catch(() => setPerfil(null))
      .finally(() => setLoading(false));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatCrm = (crm, uf) => {
    if (!crm) return null;
    return uf ? `CRM/${uf} ${crm}` : `CRM ${crm}`;
  };

  const formatCpf = (cpf) => {
    if (!cpf) return null;
    const num = cpf.replace(/\D/g, '');
    if (num.length !== 11) return cpf;
    return `${num.substring(0, 3)}.${num.substring(3, 6)}.${num.substring(6, 9)}-${num.substring(9)}`;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Perfil do Usuário">
        {usuario && (
          <div>
            <div className="user-profile-modal__header">
              <Avatar nome={usuario.nome} />
              <div>
                <div className="user-profile-modal__name">{usuario.nome}</div>
                <Badge variant={TIPO_VARIANT[usuario.tipo] || 'default'}>
                  {usuario.tipo?.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="user-profile-modal__body">
              <InfoRow icon={Mail} label="E-mail" value={usuario.email} />

              {loading && (
                <p className="user-profile-modal__loading">Carregando dados do perfil...</p>
              )}

              {!loading && usuario.tipo === 'medico' && (
                <>
                  <InfoRow icon={CreditCard} label="CRM" value={formatCrm(perfil?.crm, perfil?.uf)} />
                  <InfoRow icon={Stethoscope} label="Especialidade" value={perfil?.especialidade} />
                  <InfoRow icon={Phone} label="Telefone" value={perfil?.telefone} />
                  <InfoRow icon={CreditCard} label="CPF" value={formatCpf(usuario.cpf)} />
                </>
              )}

              {!loading && usuario.tipo === 'paciente' && (
                <>
                  <InfoRow icon={CreditCard} label="CPF" value={formatCpf(usuario.cpf)} />
                  <InfoRow icon={Calendar} label="Data de Nascimento" value={formatDate(perfil?.dataNascimento)} />
                  <InfoRow icon={Phone} label="Telefone" value={perfil?.telefone} />
                  <InfoRow icon={MapPin} label="Endereço" value={perfil?.endereco} />
                </>
              )}

              {!loading && usuario.tipo === 'funcionario' && (
                <>
                  <InfoRow icon={Briefcase} label="Cargo" value={perfil?.cargo} />
                  <InfoRow icon={CreditCard} label="CPF" value={formatCpf(usuario.cpf)} />
                </>
              )}

              {!loading && usuario.tipo === 'admin' && (
                <p className="user-profile-modal__admin-note">Administrador do sistema.</p>
              )}
            </div>

            <div className="user-profile-modal__footer">
              <button className="modal-btn-cancel" onClick={handleClose}>Fechar</button>
              <button
                className="modal-btn-submit user-profile-modal__btn-icon user-profile-modal__btn-reset"
                onClick={() => setResetOpen(true)}
              >
                <Lock size={14} />
                Redefinir Senha
              </button>
              {usuario.tipo !== 'admin' && (
                <button
                  className="modal-btn-submit user-profile-modal__btn-icon"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil size={14} />
                  Editar Perfil
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ResetPasswordModal
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        usuario={usuario}
        isSelf={isSelf}
      />

      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        usuario={usuario}
        perfil={perfil}
        onSaved={recarregarPerfil}
        isAdmin={isAdmin}
      />
    </>
  );
};

export default UserProfileModal;
