import React, { useState, useEffect } from 'react';
import { Lock, Mail, User, Stethoscope, Briefcase, Calendar, Phone, MapPin } from 'lucide-react';
import Modal from './Modal';
import ResetPasswordModal from './ResetPasswordModal';
import Badge from '../Badge/Badge';
import api from '../../services/api';

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
  return (
    <div style={{
      width: 64, height: 64, borderRadius: '50%',
      background: 'linear-gradient(135deg, #30e3a7 0%, #1a9e78 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.4rem', fontWeight: '700', color: '#fff',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', padding: '0.6rem 0', borderBottom: '1px solid #f5f5f5' }}>
      <Icon size={16} style={{ color: '#30e3a7', marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.92rem', color: '#333', marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
};

const UserProfileModal = ({ isOpen, onClose, usuario }) => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !usuario) return;
    setPerfil(null);

    const endpoint = TIPO_ENDPOINT[usuario.tipo];
    if (!endpoint) return;

    setLoading(true);
    api.get(endpoint)
      .then(res => {
        const found = (res.data || []).find(p => p.usuarioId === usuario.id);
        setPerfil(found || null);
      })
      .catch(() => setPerfil(null))
      .finally(() => setLoading(false));
  }, [isOpen, usuario]);

  const handleClose = () => {
    setPerfil(null);
    onClose();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Perfil do Usuário">
        {usuario && (
          <div>
            {/* Cabeçalho com avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#f9fbfa', borderRadius: 10 }}>
              <Avatar nome={usuario.nome} />
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a' }}>{usuario.nome}</div>
                <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.4rem' }}>{usuario.email}</div>
                <Badge variant={TIPO_VARIANT[usuario.tipo] || 'default'}>
                  {usuario.tipo?.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Infos gerais */}
            <div style={{ marginBottom: '0.5rem' }}>
              <InfoRow icon={Mail} label="E-mail" value={usuario.email} />

              {loading && (
                <p style={{ fontSize: '0.85rem', color: '#aaa', padding: '0.75rem 0' }}>Carregando dados do perfil...</p>
              )}

              {/* Médico */}
              {!loading && usuario.tipo === 'medico' && (
                <>
                  <InfoRow icon={Stethoscope} label="CRM" value={perfil?.crm} />
                  <InfoRow icon={User} label="Especialidade" value={perfil?.especialidade} />
                </>
              )}

              {/* Paciente */}
              {!loading && usuario.tipo === 'paciente' && (
                <>
                  <InfoRow icon={Calendar} label="Data de Nascimento" value={formatDate(perfil?.dataNascimento)} />
                  <InfoRow icon={Phone} label="Telefone" value={perfil?.telefone} />
                  <InfoRow icon={MapPin} label="Endereço" value={perfil?.endereco} />
                </>
              )}

              {/* Funcionário */}
              {!loading && usuario.tipo === 'funcionario' && (
                <InfoRow icon={Briefcase} label="Cargo" value={perfil?.cargo} />
              )}

              {/* Admin sem campos extras */}
              {!loading && usuario.tipo === 'admin' && (
                <p style={{ fontSize: '0.85rem', color: '#aaa', padding: '0.5rem 0' }}>Administrador do sistema.</p>
              )}
            </div>

            {/* Rodapé com ação */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="modal-btn-cancel" onClick={handleClose}>Fechar</button>
              <button
                className="modal-btn-submit"
                style={{ background: '#fff', border: '1.5px solid #e0e0e0', color: '#333', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={() => setResetOpen(true)}
              >
                <Lock size={14} />
                Redefinir Senha
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ResetPasswordModal
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        usuario={usuario}
      />
    </>
  );
};

export default UserProfileModal;
