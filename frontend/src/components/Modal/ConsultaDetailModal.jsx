import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Check, FlaskConical, FileText, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../Badge/Badge';
import './ConsultaDetailModal.scss';

const STATUS_LABEL = {
  agendado: 'Agendado',
  realizado: 'Finalizado',
  cancelado: 'Cancelado',
};

const STATUS_VARIANT = {
  agendado: 'info',
  realizado: 'success',
  cancelado: 'danger',
};

const EMPTY_PRONT = {
  queixaPrincipal: '', historicoDoencaAtual: '', historicoMedico: '',
  historicoFamiliar: '', habitosVida: '', alergias: '', medicamentosEmUso: '',
  pressaoArterial: '', frequenciaCardiaca: '', frequenciaRespiratoria: '',
  temperatura: '', saturacaoO2: '', peso: '', altura: '',
  exameFisico: '', cid10: '', hipoteseDiagnostica: '', conduta: '', descricao: '',
};

const getInitials = (nome) =>
  nome ? nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : '?';

const ConsultaDetailModal = ({ consulta, medicoId, onClose, onUpdated }) => {
  const { toast } = useToast();

  const [currentStatus, setCurrentStatus] = useState(consulta.status);
  const [statusLoading, setStatusLoading] = useState(false);

  const [prontuarios, setProntuarios] = useState([]);
  const [exames, setExames] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [showProntuarioForm, setShowProntuarioForm] = useState(false);
  const [novoProntuario, setNovoProntuario] = useState(EMPTY_PRONT);
  const [showOpcional, setShowOpcional] = useState(false);
  const [savingProntuario, setSavingProntuario] = useState(false);

  const [showExameForm, setShowExameForm] = useState(false);
  const [novoExame, setNovoExame] = useState({ tipo: '', dataExame: '' });
  const [savingExame, setSavingExame] = useState(false);

  const [resultadoEdit, setResultadoEdit] = useState({});
  const [savingResultado, setSavingResultado] = useState(null);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [pronRes, exaRes] = await Promise.all([
        api.get('/prontuarios'),
        api.get('/exames'),
      ]);
      setProntuarios(
        (pronRes.data || [])
          .filter(p => p.pacienteId === consulta.pacienteId && p.medicoId === medicoId)
          .sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro))
      );
      setExames(
        (exaRes.data || [])
          .filter(e => e.pacienteId === consulta.pacienteId && e.medicoId === medicoId)
          .sort((a, b) => new Date(b.dataExame) - new Date(a.dataExame))
      );
    } finally {
      setLoadingData(false);
    }
  }, [consulta.pacienteId, medicoId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Fecha ao pressionar ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fmtDataHora = (iso) =>
    new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const fmtData = (dateStr) => {
    const [y, m, d] = String(dateStr).split('-');
    return `${d}/${m}/${y}`;
  };

  // ─── Status ───────────────────────────────────────────────────────────────
  const updateStatus = async (novoStatus) => {
    setStatusLoading(true);
    try {
      await api.put(`/agendamentos/${consulta.id}`, {
        pacienteId: consulta.pacienteId,
        medicoId: consulta.medicoId ?? medicoId,
        data: consulta.data,
        motivoConsulta: consulta.motivoConsulta ?? '',
        status: novoStatus,
      });
      setCurrentStatus(novoStatus);
      toast.success('Status da consulta atualizado!');
      onUpdated?.();
    } catch {
      toast.error('Não foi possível atualizar o status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // ─── Prontuário ──────────────────────────────────────────────────────────
  const setPront = (field) => (e) =>
    setNovoProntuario(prev => ({ ...prev, [field]: e.target.value }));

  const prontVazio = Object.entries(novoProntuario)
    .every(([, v]) => !String(v).trim());

  const salvarProntuario = async () => {
    if (prontVazio) return;
    setSavingProntuario(true);
    try {
      const payload = { pacienteId: consulta.pacienteId, medicoId };
      Object.entries(novoProntuario).forEach(([k, v]) => {
        if (String(v).trim()) payload[k] = typeof v === 'string' ? v.trim() : v;
      });
      await api.post('/prontuarios', payload);
      toast.success('Prontuário registrado!');
      setNovoProntuario(EMPTY_PRONT);
      setShowOpcional(false);
      setShowProntuarioForm(false);
      loadData();
    } catch {
      toast.error('Erro ao registrar prontuário.');
    } finally {
      setSavingProntuario(false);
    }
  };

  // ─── Exame ───────────────────────────────────────────────────────────────
  const solicitarExame = async () => {
    if (!novoExame.tipo.trim() || !novoExame.dataExame) return;
    setSavingExame(true);
    try {
      await api.post('/exames', {
        pacienteId: consulta.pacienteId,
        medicoId,
        tipo: novoExame.tipo.trim(),
        dataExame: novoExame.dataExame,
      });
      toast.success('Exame solicitado!');
      setNovoExame({ tipo: '', dataExame: '' });
      setShowExameForm(false);
      loadData();
    } catch {
      toast.error('Erro ao solicitar exame.');
    } finally {
      setSavingExame(false);
    }
  };

  const salvarResultado = async (exameId) => {
    const resultado = resultadoEdit[exameId]?.trim();
    if (!resultado) return;
    setSavingResultado(exameId);
    try {
      const exame = exames.find(e => e.id === exameId);
      await api.put(`/exames/${exameId}`, {
        pacienteId: exame.pacienteId,
        medicoId: exame.medicoId,
        tipo: exame.tipo,
        dataExame: exame.dataExame,
        resultado,
      });
      toast.success('Resultado registrado!');
      setResultadoEdit(prev => { const n = { ...prev }; delete n[exameId]; return n; });
      loadData();
    } catch {
      toast.error('Erro ao salvar resultado.');
    } finally {
      setSavingResultado(null);
    }
  };

  const examesPendentes = exames.filter(e => !e.resultado?.trim());
  const examesConcluidos = exames.filter(e => e.resultado?.trim());

  return (
    <div className="cd-overlay" onClick={onClose}>
      <div className="cd-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="cd-modal__header">
          <div className="cd-header-info">
            <div className="cd-header-patient">
              <div className="cd-patient-avatar">{getInitials(consulta.pacienteNome)}</div>
              <h2>{consulta.pacienteNome}</h2>
            </div>
            <div className="cd-header-summary">
              <div className="cd-summary-row">
                <span className="cd-summary-label">Data</span>
                <span className="cd-summary-value">
                  <Calendar size={12} />{fmtDataHora(consulta.data)}
                </span>
              </div>
              <div className="cd-summary-row">
                <span className="cd-summary-label">Status</span>
                <Badge variant={STATUS_VARIANT[currentStatus]}>
                  {STATUS_LABEL[currentStatus]}
                </Badge>
              </div>
              {consulta.motivoConsulta && (
                <div className="cd-summary-row">
                  <span className="cd-summary-label">Descrição</span>
                  <span className="cd-summary-value">{consulta.motivoConsulta}</span>
                </div>
              )}
            </div>
          </div>

          <div className="cd-header-actions">
            {currentStatus === 'agendado' && (
              <>
                <button
                  className="cd-btn cd-btn--realizar"
                  onClick={() => updateStatus('realizado')}
                  disabled={statusLoading}
                >
                  <Check size={14} /> Realizar
                </button>
                <button
                  className="cd-btn cd-btn--cancelar"
                  onClick={() => updateStatus('cancelado')}
                  disabled={statusLoading}
                >
                  <X size={14} /> Cancelar
                </button>
              </>
            )}
            <button className="cd-btn-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="cd-modal__body">

          {/* ── Prontuários ─────────────────────────────────────────── */}
          <section className="cd-section">
            <div className="cd-section__header">
              <div className="cd-section__title">
                <FileText size={15} />
                <h3>Prontuários</h3>
                {prontuarios.length > 0 && (
                  <span className="cd-count">{prontuarios.length}</span>
                )}
              </div>
              <button
                className="cd-btn-add"
                onClick={() => setShowProntuarioForm(v => !v)}
              >
                <Plus size={13} />
                {showProntuarioForm ? 'Fechar' : 'Novo'}
              </button>
            </div>

            {showProntuarioForm && (
              <div className="cd-inline-form">

                {/* ── Essenciais ── */}
                <p className="cd-pront-label">Queixa Principal</p>
                <textarea rows={2} placeholder="Motivo da consulta..." value={novoProntuario.queixaPrincipal} onChange={setPront('queixaPrincipal')} />

                <p className="cd-pront-label">Sinais Vitais</p>
                <div className="cd-pront-grid">
                  <div className="cd-pront-field">
                    <label>PA</label>
                    <input type="text" placeholder="120/80" value={novoProntuario.pressaoArterial} onChange={setPront('pressaoArterial')} />
                  </div>
                  <div className="cd-pront-field">
                    <label>FC (bpm)</label>
                    <input type="number" placeholder="80" min={0} value={novoProntuario.frequenciaCardiaca} onChange={setPront('frequenciaCardiaca')} />
                  </div>
                  <div className="cd-pront-field">
                    <label>Temp (°C)</label>
                    <input type="number" placeholder="36.5" step="0.1" min={0} value={novoProntuario.temperatura} onChange={setPront('temperatura')} />
                  </div>
                </div>

                <p className="cd-pront-label">Hipótese Diagnóstica</p>
                <div className="cd-pront-grid cd-pront-grid--2">
                  <div className="cd-pront-field">
                    <label>CID-10</label>
                    <input type="text" placeholder="Ex: J06.9" maxLength={10} value={novoProntuario.cid10} onChange={setPront('cid10')} />
                  </div>
                  <div className="cd-pront-field">
                    <label>Hipótese</label>
                    <input type="text" placeholder="Diagnóstico provisório..." value={novoProntuario.hipoteseDiagnostica} onChange={setPront('hipoteseDiagnostica')} />
                  </div>
                </div>

                <p className="cd-pront-label">Conduta / Plano Terapêutico</p>
                <textarea rows={2} placeholder="Prescrição, encaminhamentos, orientações..." value={novoProntuario.conduta} onChange={setPront('conduta')} />

                <p className="cd-pront-label">Observações Gerais</p>
                <textarea rows={2} placeholder="Evoluções, anotações livres..." value={novoProntuario.descricao} onChange={setPront('descricao')} />

                {/* ── Opcionais ── */}
                <button
                  type="button"
                  className="cd-opcional-toggle"
                  onClick={() => setShowOpcional(v => !v)}
                >
                  {showOpcional ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {showOpcional ? 'Ocultar campos adicionais' : 'Mostrar campos adicionais'}
                </button>

                {showOpcional && (
                  <div className="cd-opcional-section">
                    <p className="cd-pront-label">Anamnese</p>
                    <textarea rows={2} placeholder="História da Doença Atual (HDA)..." value={novoProntuario.historicoDoencaAtual} onChange={setPront('historicoDoencaAtual')} />
                    <textarea rows={2} placeholder="Histórico médico anterior..." value={novoProntuario.historicoMedico} onChange={setPront('historicoMedico')} />
                    <textarea rows={2} placeholder="Histórico familiar..." value={novoProntuario.historicoFamiliar} onChange={setPront('historicoFamiliar')} />
                    <textarea rows={2} placeholder="Hábitos de vida (tabagismo, etilismo, atividade física...)..." value={novoProntuario.habitosVida} onChange={setPront('habitosVida')} />
                    <textarea rows={2} placeholder="Alergias conhecidas..." value={novoProntuario.alergias} onChange={setPront('alergias')} />
                    <textarea rows={2} placeholder="Medicamentos em uso..." value={novoProntuario.medicamentosEmUso} onChange={setPront('medicamentosEmUso')} />

                    <p className="cd-pront-label">Sinais Vitais Adicionais</p>
                    <div className="cd-pront-grid">
                      <div className="cd-pront-field">
                        <label>FR (rpm)</label>
                        <input type="number" placeholder="16" min={0} value={novoProntuario.frequenciaRespiratoria} onChange={setPront('frequenciaRespiratoria')} />
                      </div>
                      <div className="cd-pront-field">
                        <label>SpO₂ (%)</label>
                        <input type="number" placeholder="98" min={0} max={100} value={novoProntuario.saturacaoO2} onChange={setPront('saturacaoO2')} />
                      </div>
                      <div className="cd-pront-field">
                        <label>Peso (kg)</label>
                        <input type="number" placeholder="70" step="0.1" min={0} value={novoProntuario.peso} onChange={setPront('peso')} />
                      </div>
                    </div>
                    <div className="cd-pront-grid cd-pront-grid--1">
                      <div className="cd-pront-field">
                        <label>Altura (cm)</label>
                        <input type="number" placeholder="170" min={0} value={novoProntuario.altura} onChange={setPront('altura')} />
                      </div>
                    </div>

                    <p className="cd-pront-label">Exame Físico</p>
                    <textarea rows={3} placeholder="Achados do exame físico..." value={novoProntuario.exameFisico} onChange={setPront('exameFisico')} />
                  </div>
                )}

                <div className="cd-form-actions">
                  <button onClick={() => { setShowProntuarioForm(false); setNovoProntuario(EMPTY_PRONT); setShowOpcional(false); }}>
                    Cancelar
                  </button>
                  <button
                    className="cd-btn-save"
                    onClick={salvarProntuario}
                    disabled={savingProntuario || prontVazio}
                  >
                    {savingProntuario ? 'Salvando...' : 'Salvar Prontuário'}
                  </button>
                </div>
              </div>
            )}

            {loadingData ? (
              <p className="cd-empty">Carregando...</p>
            ) : prontuarios.length === 0 ? (
              <p className="cd-empty">Nenhum prontuário registrado.</p>
            ) : (
              <div className="cd-prontuario-list">
                {prontuarios.map(p => (
                  <div key={p.id} className="cd-prontuario-item">
                    <span className="cd-prontuario-date">
                      {new Date(p.dataRegistro).toLocaleDateString('pt-BR')}
                    </span>
                    <p>{p.descricao}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Exames ──────────────────────────────────────────────── */}
          <section className="cd-section">
            <div className="cd-section__header">
              <div className="cd-section__title">
                <FlaskConical size={15} />
                <h3>Exames</h3>
                {examesPendentes.length > 0 && (
                  <span className="cd-count cd-count--pending">
                    {examesPendentes.length} pendente{examesPendentes.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                className="cd-btn-add"
                onClick={() => setShowExameForm(v => !v)}
              >
                <Plus size={13} />
                {showExameForm ? 'Fechar' : 'Solicitar'}
              </button>
            </div>

            {showExameForm && (
              <div className="cd-inline-form">
                <div className="cd-form-row">
                  <input
                    type="text"
                    placeholder="Tipo do exame (ex: Hemograma, Glicemia...)"
                    value={novoExame.tipo}
                    onChange={e => setNovoExame(prev => ({ ...prev, tipo: e.target.value }))}
                  />
                  <input
                    type="date"
                    value={novoExame.dataExame}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => setNovoExame(prev => ({ ...prev, dataExame: e.target.value }))}
                  />
                </div>
                <div className="cd-form-actions">
                  <button onClick={() => { setShowExameForm(false); setNovoExame({ tipo: '', dataExame: '' }); }}>
                    Cancelar
                  </button>
                  <button
                    className="cd-btn-save"
                    onClick={solicitarExame}
                    disabled={savingExame || !novoExame.tipo.trim() || !novoExame.dataExame}
                  >
                    {savingExame ? 'Solicitando...' : 'Solicitar Exame'}
                  </button>
                </div>
              </div>
            )}

            {loadingData ? (
              <p className="cd-empty">Carregando...</p>
            ) : exames.length === 0 ? (
              <p className="cd-empty">Nenhum exame solicitado.</p>
            ) : (
              <div className="cd-exame-list">
                {examesPendentes.map(e => (
                  <div key={e.id} className="cd-exame-item cd-exame-item--pending">
                    <div className="cd-exame-top">
                      <span className="cd-exame-tipo">{e.tipo}</span>
                      <span className="cd-exame-data">{fmtData(e.dataExame)}</span>
                      <span className="cd-exame-badge cd-exame-badge--pending">Pendente</span>
                    </div>
                    <div className="cd-exame-resultado-row">
                      <input
                        type="text"
                        placeholder="Registrar resultado..."
                        value={resultadoEdit[e.id] || ''}
                        onChange={ev =>
                          setResultadoEdit(prev => ({ ...prev, [e.id]: ev.target.value }))
                        }
                        onKeyDown={ev => { if (ev.key === 'Enter') salvarResultado(e.id); }}
                      />
                      <button
                        className="cd-btn-check"
                        onClick={() => salvarResultado(e.id)}
                        disabled={savingResultado === e.id || !resultadoEdit[e.id]?.trim()}
                        title="Salvar resultado"
                      >
                        {savingResultado === e.id ? '...' : <Check size={13} />}
                      </button>
                    </div>
                  </div>
                ))}
                {examesConcluidos.map(e => (
                  <div key={e.id} className="cd-exame-item cd-exame-item--done">
                    <div className="cd-exame-top">
                      <span className="cd-exame-tipo">{e.tipo}</span>
                      <span className="cd-exame-data">{fmtData(e.dataExame)}</span>
                      <span className="cd-exame-badge cd-exame-badge--done">Concluído</span>
                    </div>
                    <p className="cd-exame-resultado-text">{e.resultado}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default ConsultaDetailModal;
