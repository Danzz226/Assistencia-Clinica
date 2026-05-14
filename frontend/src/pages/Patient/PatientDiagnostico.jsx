import React, { useState, useEffect, useContext } from 'react';
import { ChevronDown } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Patient.scss';

const formatData = (str) =>
  str
    ? new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

// ── Card de prontuário expansível ─────────────────────────────────────────────
const ProntuarioCard = ({ prontuario, diagnosticos }) => {
  const [aberto, setAberto] = useState(false);

  const meusDiag = diagnosticos.filter((d) => d.prontuarioId === prontuario.id);

  return (
    <div className="patient-page__prontuario-card">
      <div
        className="patient-page__prontuario-header"
        onClick={() => setAberto((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setAberto((v) => !v)}
      >
        <div className="patient-page__prontuario-header-left">
          <span className="patient-page__prontuario-header-title">
            Dr(a). {prontuario.medicoNome || '—'}
          </span>
          <span className="patient-page__prontuario-header-meta">
            {formatData(prontuario.dataRegistro)}
            {meusDiag.length > 0 && ` · ${meusDiag.length} diagnóstico${meusDiag.length > 1 ? 's' : ''}`}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`patient-page__prontuario-header-chevron${aberto ? ' patient-page__prontuario-header-chevron--open' : ''}`}
        />
      </div>

      {aberto && (
        <div className="patient-page__prontuario-body">
          <p className="patient-page__prontuario-body-desc">
            {prontuario.descricao || <em style={{ color: '#aaa' }}>Sem descrição registrada.</em>}
          </p>

          {meusDiag.length > 0 && (
            <>
              <div className="patient-page__prontuario-body-diag-title">Diagnósticos</div>
              <div className="patient-page__prontuario-body-diag-list">
                {meusDiag.map((d) => (
                  <div key={d.id} className="patient-page__prontuario-body-diag-item">
                    {d.descricao || <em>Sem descrição.</em>}
                    {d.data && (
                      <span style={{ float: 'right', fontSize: '0.75rem', color: '#888' }}>
                        {formatData(d.data)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {meusDiag.length === 0 && (
            <p style={{ color: '#aaa', fontSize: '0.85rem', fontStyle: 'italic' }}>
              Nenhum diagnóstico vinculado a este prontuário.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
const PatientDiagnostico = () => {
  const { user } = useContext(AuthContext);

  const [prontuarios, setProntuarios]   = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const { toast } = useToast();
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [pacientesRes, prontuariosRes, diagnosticosRes] = await Promise.all([
          api.get('/pacientes'),
          api.get('/prontuarios'),
          api.get('/diagnosticos'),
        ]);

        const pacienteLogado = (pacientesRes.data || []).find(
          (p) => p.email?.toLowerCase() === user?.email?.toLowerCase()
        );

        if (!pacienteLogado) {
          toast.error('Perfil de paciente não encontrado.');
          setLoading(false);
          return;
        }

        const meusProntuarios = (prontuariosRes.data || [])
          .filter((p) => p.pacienteId === pacienteLogado.id)
          .sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro));

        setProntuarios(meusProntuarios);
        setDiagnosticos(diagnosticosRes.data || []);
      } catch {
        toast.error('Não foi possível carregar os diagnósticos.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDados();
  }, [user]);

  return (
    <div className="patient-page">
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
        Meus Diagnósticos
      </h1>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Acesse seus prontuários médicos e os diagnósticos registrados pelos seus médicos.
      </p>

      <div className="patient-page__section-label">LIFIUM · HISTÓRICO CLÍNICO</div>
      <h3 className="patient-page__section-title">
        Prontuários
        {!loading && (
          <span style={{ fontSize: '1rem', fontWeight: 400, color: '#888', marginLeft: '0.75rem' }}>
            ({prontuarios.length} {prontuarios.length === 1 ? 'registro' : 'registros'})
          </span>
        )}
      </h3>

      {loading ? (
        <div className="patient-page__loading">Carregando...</div>
      ) : prontuarios.length === 0 ? (
        <div className="patient-page__empty">Nenhum prontuário registrado ainda.</div>
      ) : (
        <div className="patient-page__prontuario-list">
          {prontuarios.map((p) => (
            <ProntuarioCard key={p.id} prontuario={p} diagnosticos={diagnosticos} />
          ))}
        </div>
      )}

    </div>
  );
};

export default PatientDiagnostico;
