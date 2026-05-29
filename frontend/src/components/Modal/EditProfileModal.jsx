import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import Modal from './Modal';
import CustomSelect from '../CustomSelect/CustomSelect';
import { ESTADOS_BR } from '../CustomSelect/states';
import { ESPECIALIDADES_MEDICAS } from '../CustomSelect/specialties';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './EditProfileModal.scss';

const formatPhone = (val) => {
  if (!val) return '';
  let num = val.replace(/\D/g, '');
  if (num.length > 11) num = num.substring(0, 11);
  if (num.length <= 2) return num ? `(${num}` : '';
  if (num.length <= 7) return `(${num.substring(0, 2)}) ${num.substring(2)}`;
  return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
};

const EditProfileModal = ({ isOpen, onClose, usuario, perfil, onSaved, isAdmin = false }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !usuario) return;

    const base = {
      nome: usuario.nome || '',
      email: usuario.email || '',
      telefone: formatPhone(perfil?.telefone || ''),
    };

    if (usuario.tipo === 'medico') {
      setForm({ ...base, crm: perfil?.crm || '', uf: perfil?.uf || '', especialidade: perfil?.especialidade || '' });
    } else if (usuario.tipo === 'paciente') {
      setForm({ ...base, dataNascimento: perfil?.dataNascimento || '', endereco: perfil?.endereco || '' });
    } else {
      setForm(base);
    }
  }, [isOpen, usuario, perfil]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.nome?.trim()) { toast.error('Nome é obrigatório'); return; }
    if (!form.email?.trim()) { toast.error('E-mail é obrigatório'); return; }

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      telefone: form.telefone?.trim() || null,
    };

    if (usuario.tipo === 'medico') {
      payload.crm = form.crm?.trim() || null;
      payload.uf = form.uf || null;
      payload.especialidade = form.especialidade?.trim() || null;
    } else if (usuario.tipo === 'paciente') {
      payload.dataNascimento = form.dataNascimento || null;
      payload.endereco = form.endereco?.trim() || null;
    }

    const userId = usuario.id ?? perfil?.usuarioId;
    if (!userId) {
      toast.error('Não foi possível identificar o usuário. Faça logout e login novamente.');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/usuarios/${userId}`, payload);
      toast.success('Perfil atualizado com sucesso!');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil">
      <div>
        <div className="edit-profile-modal__field">
          <label className="edit-profile-modal__label">Nome Completo</label>
          <input className="edit-profile-modal__input" name="nome" value={form.nome || ''} onChange={handleChange} />
        </div>

        <div className="edit-profile-modal__field">
          <label className="edit-profile-modal__label">E-mail</label>
          <input className="edit-profile-modal__input" name="email" type="email" value={form.email || ''} onChange={handleChange} />
        </div>

        <div className="edit-profile-modal__field">
          <label className="edit-profile-modal__label">Telefone</label>
          <input
            className="edit-profile-modal__input"
            name="telefone"
            value={form.telefone || ''}
            onChange={(e) => setForm(prev => ({ ...prev, telefone: formatPhone(e.target.value) }))}
            maxLength={15}
            placeholder="(11) 99999-9999"
          />
        </div>

        {usuario?.tipo === 'medico' && (
          <>
            <div className="edit-profile-modal__medico-grid">
              <div>
                <label className="edit-profile-modal__label">
                  UF {!isAdmin && <span className="edit-profile-modal__label-hint">(somente admin)</span>}
                </label>
                <CustomSelect
                  options={ESTADOS_BR}
                  value={form.uf || ''}
                  onChange={(v) => isAdmin && setForm(prev => ({ ...prev, uf: v }))}
                  placeholder="Estado"
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <label className="edit-profile-modal__label">
                  CRM {!isAdmin && <span className="edit-profile-modal__label-hint">(somente admin)</span>}
                </label>
                <input
                  className={`edit-profile-modal__input${!isAdmin ? ' edit-profile-modal__input--readonly' : ''}`}
                  name="crm"
                  value={form.crm || ''}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="Ex: 123456"
                  readOnly={!isAdmin}
                />
              </div>
            </div>

            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label">
                Especialidade {!isAdmin && <span className="edit-profile-modal__label-hint">(somente admin)</span>}
              </label>
              <CustomSelect
                options={ESPECIALIDADES_MEDICAS}
                value={form.especialidade || ''}
                onChange={(v) => isAdmin && setForm(prev => ({ ...prev, especialidade: v }))}
                placeholder="Selecione a especialidade"
                disabled={!isAdmin}
              />
            </div>
          </>
        )}

        {usuario?.tipo === 'paciente' && (
          <>
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label">Data de Nascimento</label>
              <input
                className="edit-profile-modal__input"
                name="dataNascimento"
                type="date"
                value={form.dataNascimento || ''}
                onChange={handleChange}
              />
            </div>

            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label">Endereço</label>
              <input
                className="edit-profile-modal__input"
                name="endereco"
                value={form.endereco || ''}
                onChange={handleChange}
                placeholder="Rua, número, bairro..."
              />
            </div>
          </>
        )}

        <div className="edit-profile-modal__footer">
          <button className="modal-btn-cancel" onClick={onClose} disabled={saving}>Cancelar</button>
          <button
            className="modal-btn-submit edit-profile-modal__btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={14} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;
