import React, { useState, useEffect, useContext } from 'react';
import { FileText, FlaskConical } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './DoctorExams.scss';

// TODO [BACKEND]: Substituir por endpoints filtrados:
//   GET /prontuarios?medicoId={id}
//   GET /exames?medicoId={id}
// Por enquanto, buscamos tudo e filtramos no frontend pelo medicoId resolvido via email.

const DoctorExams = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [abaAtiva, setAbaAtiva] = useState('prontuarios');

  const [prontuarios, setProntuarios] = useState([]);
  const [exames, setExames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const medicoRes = await api.get('/medicos/me');
        const medicoLogado = medicoRes.data;

        // TODO [BACKEND]: Substituir por GET /prontuarios?medicoId={id} e GET /exames?medicoId={id}
        const [prontuariosRes, examesRes] = await Promise.all([
          api.get('/prontuarios'),
          api.get('/exames'),
        ]);

        setProntuarios(
          (prontuariosRes.data || []).filter((p) => p.medicoId === medicoLogado.id)
        );
        setExames(
          (examesRes.data || []).filter((e) => e.medicoId === medicoLogado.id)
        );
      } catch (error) {
        console.warn('⚠️ Backend offline — carregando dados mock de exames.');
        // MOCK: Dados fictícios para testar a UI sem o backend
        setProntuarios([
          { id: 1, pacienteNome: 'Ana Oliveira',     descricao: 'Consulta de rotina — pressão arterial estável, IMC normal.', dataRegistro: '2026-05-10T09:30:00' },
          { id: 2, pacienteNome: 'Bruno Santos',     descricao: 'Revisão pós-cirúrgica — cicatrização dentro do esperado.', dataRegistro: '2026-05-09T14:00:00' },
          { id: 3, pacienteNome: 'Carla Mendes',     descricao: 'Queixa de dor abdominal intermitente, solicitado USG.', dataRegistro: '2026-05-08T10:15:00' },
          { id: 4, pacienteNome: 'Diego Almeida',    descricao: 'Acompanhamento mensal — diabetes tipo 2 controlada.', dataRegistro: '2026-05-07T11:00:00' },
        ]);
        setExames([
          { id: 1, pacienteNome: 'Ana Oliveira',    tipo: 'Hemograma',          resultado: 'Hemoglobina: 13,5 g/dL — dentro da normalidade.', dataExame: '2026-05-08' },
          { id: 2, pacienteNome: 'Carla Mendes',    tipo: 'Ultrassonografia',   resultado: 'Ausência de alterações estruturais relevantes.', dataExame: '2026-05-09' },
          { id: 3, pacienteNome: 'Diego Almeida',   tipo: 'Glicemia em Jejum',  resultado: 'Glicemia: 118 mg/dL — levemente elevada.', dataExame: '2026-05-06' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDados();
  }, [user]);

  const formatData = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="doctor-exams">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Exames e Prontuários</h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Registros médicos e exames dos seus pacientes.</p>
        </div>
      </div>

      {/* Abas */}
      <div className="doctor-exams__tabs">
        <button
          className={`doctor-exams__tab ${abaAtiva === 'prontuarios' ? 'doctor-exams__tab--active' : ''}`}
          onClick={() => setAbaAtiva('prontuarios')}
        >
          <FileText size={16} />
          Prontuários
          <span className="doctor-exams__tab-badge">{prontuarios.length}</span>
        </button>
        <button
          className={`doctor-exams__tab ${abaAtiva === 'exames' ? 'doctor-exams__tab--active' : ''}`}
          onClick={() => setAbaAtiva('exames')}
        >
          <FlaskConical size={16} />
          Exames
          <span className="doctor-exams__tab-badge">{exames.length}</span>
        </button>
      </div>

      {/* Conteúdo das abas */}
      {loading ? (
        <div className="doctor-exams__empty">Carregando dados...</div>
      ) : (
        <>
          {/* Aba Prontuários */}
          {abaAtiva === 'prontuarios' && (
            prontuarios.length === 0 ? (
              <div className="doctor-exams__empty">Nenhum prontuário registrado.</div>
            ) : (
              <div className="doctor-exams__table-wrapper">
                <table className="doctor-exams__table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Paciente</th>
                      <th>Descrição</th>
                      <th>Data de Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prontuarios
                      .sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro))
                      .map((p) => (
                        <tr key={p.id}>
                          <td className="doctor-exams__id">#{p.id}</td>
                          <td>
                            <span className="doctor-exams__name">
                              {p.pacienteNome || `Paciente #${p.pacienteId}`}
                            </span>
                          </td>
                          <td className="doctor-exams__desc-cell">
                            {p.descricao
                              ? p.descricao.substring(0, 80) + (p.descricao.length > 80 ? '…' : '')
                              : <em>Sem descrição</em>}
                          </td>
                          <td>
                            <span className="doctor-exams__badge doctor-exams__badge--green">
                              {formatData(p.dataRegistro)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Aba Exames */}
          {abaAtiva === 'exames' && (
            exames.length === 0 ? (
              <div className="doctor-exams__empty">Nenhum exame registrado.</div>
            ) : (
              <div className="doctor-exams__table-wrapper">
                <table className="doctor-exams__table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Paciente</th>
                      <th>Tipo</th>
                      <th>Resultado</th>
                      <th>Data do Exame</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exames
                      .sort((a, b) => new Date(b.dataExame) - new Date(a.dataExame))
                      .map((e) => (
                        <tr key={e.id}>
                          <td className="doctor-exams__id">#{e.id}</td>
                          <td>
                            <span className="doctor-exams__name">
                              {e.pacienteNome || `Paciente #${e.pacienteId}`}
                            </span>
                          </td>
                          <td>
                            <span className="doctor-exams__badge doctor-exams__badge--blue">
                              {e.tipo || '—'}
                            </span>
                          </td>
                          <td className="doctor-exams__desc-cell">
                            {e.resultado
                              ? e.resultado.substring(0, 60) + (e.resultado.length > 60 ? '…' : '')
                              : <em>Pendente</em>}
                          </td>
                          <td>{formatData(e.dataExame)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

    </div>
  );
};

export default DoctorExams;
