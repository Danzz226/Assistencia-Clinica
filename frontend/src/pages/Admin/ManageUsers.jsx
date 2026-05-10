import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Pencil, Trash2, FileText, User } from 'lucide-react';
import api from '../../services/api';
import GenericTable from '../../components/GenericTable';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import Badge from '../../components/Badge/Badge';
import './ManageUsers.scss';

const ManageUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [senhasVisiveis, setSenhasVisiveis] = useState({}); // Controla quais senhas estão abertas
  const [errorMsg, setErrorMsg] = useState(''); // Estado para o toast de erro
  
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await api.get('/usuarios');
        setUsuarios(response.data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);

        // --- MOCK DE DADOS PARA TESTE VISUAL ---
        // Preenche a tabela com dados falsos se a API falhar
        setUsuarios([
          { id: 1, username: 'admin_master', role: 'ADMIN', password: 'senhaSuperSecreta123' },
          { id: 2, username: 'dr_roberto', role: 'MEDICO', password: 'robertoDoc2023' },
          { id: 3, username: 'maria_silva', role: 'PACIENTE', password: 'mariazinha99' },
          { id: 4, username: 'joao_souza', role: 'PACIENTE', password: 'joaosouza!@#' }
        ]);

        if (error.response) {
          setErrorMsg(`Erro do servidor (${error.response.status}): Não foi possível carregar os usuários.`);
        } else if (error.request) {
          setErrorMsg('Erro de conexão: Não foi possível conectar ao servidor Java.');
        } else {
          setErrorMsg(`Erro: ${error.message}`);
        }
      }
    };
    fetchUsuarios();
  }, []);

  // Limpa o toast de erro após 3 segundos
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const togglePassword = (userId) => {
    setSenhasVisiveis(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };
  
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Usuário (Username)', accessor: 'username' },
    { 
      header: 'Papel (Role)', 
      render: (row) => {
        const role = row.role?.toUpperCase() || 'N/A';
        let badgeType = 'default';
        
        if (role === 'ADMIN') badgeType = 'admin';
        else if (role === 'PACIENTE') badgeType = 'paciente';
        else if (role === 'MEDICO' || role === 'DOCTOR') badgeType = 'medico';

        return <Badge variant={badgeType}>{role}</Badge>;
      }
    },
    { 
      header: 'Senha', 
      
      render: (row) => {

        if (!isAdmin) {
          return <span>••••••••</span>;
        }
        
        const isVisible = senhasVisiveis[row.id];
        return (
          <div className="manage-users-password-wrapper">
            <span>{isVisible ? row.password : '••••••••'}</span>
            
            <button 
              onClick={() => togglePassword(row.id)}
              className="manage-users-password-btn"
              title={isVisible ? "Esconder senha" : "Ver senha"}
            >
              {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        );
      } 
    },
    {
      header: 'Ações',
      render: (row) => {
        const role = row.role?.toUpperCase() || '';
        
        return (
          <div className="manage-users-actions">
            <button className="action-btn edit" title="Editar">
              <Pencil size={20} />
            </button>
            <button className="action-btn delete" title="Excluir">
              <Trash2 size={20} />
            </button>
            
            {role === 'PACIENTE' && (
              <button className="action-btn prontuario" title="Ver Prontuário">
                <FileText size={20} />
              </button>
            )}

            {(role === 'MEDICO' || role === 'DOCTOR' || role === 'ADMIN') && (
              <button className="action-btn perfil" title="Ver Perfil">
                <User size={20} />
              </button>
            )}
          </div>
        );
      }
    }
  ];
  return (
    <div className="manage-users-container">
      <h1 className="manage-users-title">Gerenciar Usuários</h1>
      <p className="manage-users-desc">Visualize e gerencie os acessos do sistema.</p>
    
      <GenericTable columns={columns} data={usuarios} />

      {errorMsg && (
        <div className="manage-users-error">
          <h4>Aviso de Conexão</h4>
          <p>{errorMsg}</p>
        </div>
      )}
    </div>
  );
};


export default ManageUsers;