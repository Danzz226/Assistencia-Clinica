import React, { useState, useEffect, useContext } from 'react';
import { ClipboardList } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './Patient.scss';

const formatData = (str) =>
  str ? new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const PatientExames = () => {
  const { user } = useContext(AuthContext);

  const [exames, setExames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [pacientesRes, examesRes] = await Promise.all([
          api.get('/pacientes'),
          api.get('/exames'),
        ]);

        const pacienteLogado = (pacientesRes.data || []).find(
          (p) => p.email?.toLowerCase() === user?.email?.toLowerCase()
        );

        if (!pacienteLogado) {
          setErrorMsg('Perfil de paciente não encontrado.');
          setLoading(false);
          return;
        }

        const meusExames = (examesRes.data || [])
          .filter((e) => e.pacienteId === pacienteLogado.id)
          .sort((a, b) => new Date(b.dataExame) - new Date(a.dataExame));

        setExames(meusExames);
      } catch {
        setErrorMsg('Não foi possível carregar os exames.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDados();
  }, [user]);

  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(''), 4000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  return (
    <div className="patient-page">
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
        Resultados e Exames
      </h1>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Acompanhe todos os exames solicitados pelos seus médicos e seus resultados.
      </p>

      <div className="patient-page__section-label">LIFIUM · EXAMES</div>
      <h3 className="patient-page__section-title">
        Meus Exames
        {!loading && (
          <span style={{ fontSize: '1rem', fontWeight: 400, color: '#888', marginLeft: '0.75rem' }}>
            ({exames.length} {exames.length === 1 ? 'registro' : 'registros'})
          </span>
        )}
      </h3>

      {loading ? (
        <div className="patient-page__loading">Carregando...</div>
      ) : exames.length === 0 ? (
        <div className="patient-page__empty">
          <ClipboardList size={36} style={{ color: '#c8d8d2', marginBottom: '0.75rem' }} />
          <p>Nenhum exame registrado ainda.</p>
        </div>
      ) : (
        <div className="patient-page__table-wrapper">
          <table className="patient-page__table">
            <thead>
              <tr>
                <th>Tipo de Exame</th>
                <th>Médico Solicitante</th>
                <th>Data do Exame</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {exames.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.tipo || '—'}</td>
                  <td>{e.medicoNome || '—'}</td>
                  <td>{formatData(e.dataExame)}</td>
                  <td style={{ color: e.resultado ? '#1a2332' : '#aaa', fontStyle: e.resultado ? 'normal' : 'italic' }}>
                    {e.resultado
                      ? e.resultado.substring(0, 80) + (e.resultado.length > 80 ? '…' : '')
                      : 'Aguardando resultado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {errorMsg && (
        <div className="patient-page__error">
          <h4>Erro</h4>
          <p>{errorMsg}</p>
        </div>
      )}
    </div>
  );
};

export default PatientExames;
