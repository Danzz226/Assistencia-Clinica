import React, { useState, useEffect, useContext } from 'react';
import { ClipboardList } from 'lucide-react';
import { useTableSort, SortIcon } from '../../hooks/useTableSort';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Patient.scss';

const formatData = (str) =>
  str ? new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const PatientExames = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [exames, setExames]   = useState([]);
  const [loading, setLoading] = useState(true);

  const { sortKey, sortDir, handleSort, sortedData: sortedExames } = useTableSort(exames);

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
          toast.error('Perfil de paciente não encontrado.');
          setLoading(false);
          return;
        }

        const meusExames = (examesRes.data || [])
          .filter((e) => e.pacienteId === pacienteLogado.id)
          .sort((a, b) => new Date(b.dataExame) - new Date(a.dataExame));

        setExames(meusExames);
      } catch {
        toast.error('Não foi possível carregar os exames.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDados();
  }, [user]);

  return (
    <div className="patient-page">
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
        Resultados e Exames
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Acompanhe todos os exames solicitados pelos seus médicos e seus resultados.
      </p>

      <div className="patient-page__section-label">LIFIUM · EXAMES</div>
      <h3 className="patient-page__section-title">
        Meus Exames
        {!loading && (
          <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-neutral)', marginLeft: '0.75rem' }}>
            ({exames.length} {exames.length === 1 ? 'registro' : 'registros'})
          </span>
        )}
      </h3>

      {loading ? (
        <div className="patient-page__loading">Carregando...</div>
      ) : exames.length === 0 ? (
        <div className="patient-page__empty">
          <ClipboardList size={36} style={{ color: 'var(--text-subtle)', marginBottom: '0.75rem' }} />
          <p>Nenhum exame registrado ainda.</p>
        </div>
      ) : (
        <div className="patient-page__table-wrapper">
          <table className="patient-page__table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('tipo')}>
                  <span className="th-content">Tipo de Exame <SortIcon sortKey={sortKey} columnKey="tipo" sortDir={sortDir} /></span>
                </th>
                <th className="sortable" onClick={() => handleSort('medicoNome')}>
                  <span className="th-content">Médico Solicitante <SortIcon sortKey={sortKey} columnKey="medicoNome" sortDir={sortDir} /></span>
                </th>
                <th className="sortable" onClick={() => handleSort('dataExame')}>
                  <span className="th-content">Data do Exame <SortIcon sortKey={sortKey} columnKey="dataExame" sortDir={sortDir} /></span>
                </th>
                <th className="sortable" onClick={() => handleSort('resultado')}>
                  <span className="th-content">Resultado <SortIcon sortKey={sortKey} columnKey="resultado" sortDir={sortDir} /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedExames.map((e) => (
                <tr key={e.id}>
                  <td>
                    <span className="patient-page__badge patient-page__badge--info">{e.tipo || '—'}</span>
                  </td>
                  <td>{e.medicoNome || '—'}</td>
                  <td>
                    <span className="patient-page__badge patient-page__badge--success">{formatData(e.dataExame)}</span>
                  </td>
                  <td style={{ color: e.resultado ? 'var(--text-body)' : 'var(--text-placeholder)', fontStyle: e.resultado ? 'normal' : 'italic' }}>
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

    </div>
  );
};

export default PatientExames;
