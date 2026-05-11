import React, { useState, useEffect, useContext } from 'react';
import { Search, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './DoctorPatients.scss';

// TODO [BACKEND]: Substituir lógica de filtragem por endpoint dedicado:
//   GET /medicos/{id}/pacientes
// que retorne apenas os pacientes vinculados ao médico logado via prontuários.
// Por enquanto: buscamos GET /prontuarios + GET /pacientes e cruzamos no frontend.

const DoctorPatients = () => {
  const { user } = useContext(AuthContext);

  const [pacientes, setPacientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        // TODO [BACKEND]: Usar perfilId do token JWT em vez de buscar todos os médicos
        const medicosRes = await api.get('/medicos');
        const medicoLogado = (medicosRes.data || []).find(
          (m) => m.email?.toLowerCase() === user?.username?.toLowerCase()
        );

        if (!medicoLogado) {
          setErrorMsg('Médico não encontrado no sistema.');
          setLoading(false);
          return;
        }

        // TODO [BACKEND]: Substituir por GET /prontuarios?medicoId={id}
        const [prontuariosRes, pacientesRes] = await Promise.all([
          api.get('/prontuarios'),
          api.get('/pacientes'),
        ]);

        const meusProntuarios = (prontuariosRes.data || []).filter(
          (p) => p.medicoId === medicoLogado.id
        );

        // IDs únicos de pacientes que têm prontuário com este médico
        const pacienteIds = new Set(meusProntuarios.map((p) => p.pacienteId));

        // Último prontuário de cada paciente
        const ultimoProntuario = {};
        meusProntuarios.forEach((p) => {
          if (
            !ultimoProntuario[p.pacienteId] ||
            new Date(p.dataRegistro) > new Date(ultimoProntuario[p.pacienteId].dataRegistro)
          ) {
            ultimoProntuario[p.pacienteId] = p;
          }
        });

        const meusPacientes = (pacientesRes.data || [])
          .filter((p) => pacienteIds.has(p.id))
          .map((p) => ({
            ...p,
            ultimoProntuario: ultimoProntuario[p.id]?.dataRegistro || null,
          }));

        setPacientes(meusPacientes);
      } catch (error) {
        console.warn('⚠️ Backend offline — carregando pacientes mock.');
        // MOCK: Pacientes fictícios para testar a UI sem o backend
        setPacientes([
          { id: 1, nome: 'Ana Oliveira',    email: 'ana.oliveira@email.com',    telefone: '(11) 98765-4321', dataNascimento: '1985-03-12', ultimoProntuario: '2026-05-10T09:30:00' },
          { id: 2, nome: 'Bruno Santos',    email: 'bruno.santos@email.com',    telefone: '(21) 99123-4567', dataNascimento: '1990-07-22', ultimoProntuario: '2026-05-09T14:00:00' },
          { id: 3, nome: 'Carla Mendes',    email: 'carla.mendes@email.com',    telefone: '(31) 97654-3210', dataNascimento: '1978-11-05', ultimoProntuario: '2026-05-08T10:15:00' },
          { id: 4, nome: 'Diego Almeida',   email: 'diego.almeida@email.com',   telefone: '(41) 98877-6655', dataNascimento: '1965-01-30', ultimoProntuario: '2026-05-07T11:00:00' },
          { id: 5, nome: 'Eduarda Ferreira',email: 'eduarda.f@email.com',       telefone: '(51) 91234-5678', dataNascimento: '2000-09-14', ultimoProntuario: '2026-05-06T16:30:00' },
          { id: 6, nome: 'Felipe Costa',    email: 'felipe.costa@email.com',    telefone: '(61) 96543-2109', dataNascimento: '1995-06-18', ultimoProntuario: '2026-05-03T08:00:00' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchPacientes();
  }, [user]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  const formatData = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      p.email?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="doctor-patients">
      <h1 className="doctor-patients__title">Meus Pacientes</h1>
      <p className="doctor-patients__desc">
        Pacientes que possuem prontuário registrado por você.
      </p>

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
          {filtro ? 'Nenhum paciente encontrado para essa busca.' : 'Nenhum paciente registrado ainda.'}
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
                      <span className="doctor-patients__badge doctor-patients__badge--neutral">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {errorMsg && (
        <div className="doctor-patients__error">
          <h4>Aviso</h4>
          <p>{errorMsg}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
