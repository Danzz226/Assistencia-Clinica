import React, { forwardRef } from 'react';
import './ProntuarioPDF.scss';

const ProntuarioPDF = forwardRef(({ prontuario, tema = 'light' }, ref) => {
  if (!prontuario) return null;

  const fmt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const fmtDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const val = (v) => v || '—';

  const hasVitals =
    prontuario.pressaoArterial || prontuario.frequenciaCardiaca ||
    prontuario.frequenciaRespiratoria || prontuario.temperatura ||
    prontuario.saturacaoO2 || prontuario.peso || prontuario.altura;

  const hasAnamnese =
    prontuario.queixaPrincipal || prontuario.historicoDoencaAtual ||
    prontuario.historicoMedico || prontuario.historicoFamiliar ||
    prontuario.habitosVida || prontuario.alergias || prontuario.medicamentosEmUso;

  return (
    <div className={`pront-pdf pront-pdf--${tema}`} ref={ref}>
      <div className="pront-pdf__header">
        <div className="pront-pdf__header-title">PRONTUÁRIO MÉDICO</div>
        <div className="pront-pdf__header-date">Data do atendimento: {fmtDateTime(prontuario.dataRegistro)}</div>
      </div>

      <div className="pront-pdf__parties">
        <div className="pront-pdf__party">
          <div className="pront-pdf__party-label">PACIENTE</div>
          <div className="pront-pdf__party-name">{val(prontuario.pacienteNome)}</div>
          <div className="pront-pdf__party-detail">CPF: {val(prontuario.pacienteCpf)}</div>
          <div className="pront-pdf__party-detail">Data de Nasc.: {fmt(prontuario.pacienteDataNascimento)}</div>
          <div className="pront-pdf__party-detail">Telefone: {val(prontuario.pacienteTelefone)}</div>
        </div>
        <div className="pront-pdf__party-divider" />
        <div className="pront-pdf__party">
          <div className="pront-pdf__party-label">MÉDICO RESPONSÁVEL</div>
          <div className="pront-pdf__party-name">{prontuario.medicoNome ? `Dr(a). ${prontuario.medicoNome}` : '—'}</div>
          {prontuario.medicoCrm && (
            <div className="pront-pdf__party-detail">CRM: {prontuario.medicoCrm}{prontuario.medicoUf ? `/${prontuario.medicoUf}` : ''}</div>
          )}
          {prontuario.medicoEspecialidade && (
            <div className="pront-pdf__party-detail">Especialidade: {prontuario.medicoEspecialidade}</div>
          )}
          {prontuario.medicoTelefone && (
            <div className="pront-pdf__party-detail">Telefone: {prontuario.medicoTelefone}</div>
          )}
        </div>
      </div>

      {hasVitals && (
        <div className="pront-pdf__section">
          <div className="pront-pdf__section-title">SINAIS VITAIS</div>
          <div className="pront-pdf__vitals-grid">
            {prontuario.pressaoArterial      && <div className="pront-pdf__vital-item"><span className="pront-pdf__vital-label">PA</span><span className="pront-pdf__vital-value">{prontuario.pressaoArterial} mmHg</span></div>}
            {prontuario.frequenciaCardiaca   && <div className="pront-pdf__vital-item"><span className="pront-pdf__vital-label">FC</span><span className="pront-pdf__vital-value">{prontuario.frequenciaCardiaca} bpm</span></div>}
            {prontuario.frequenciaRespiratoria && <div className="pront-pdf__vital-item"><span className="pront-pdf__vital-label">FR</span><span className="pront-pdf__vital-value">{prontuario.frequenciaRespiratoria} rpm</span></div>}
            {prontuario.temperatura          && <div className="pront-pdf__vital-item"><span className="pront-pdf__vital-label">Temp.</span><span className="pront-pdf__vital-value">{prontuario.temperatura} °C</span></div>}
            {prontuario.saturacaoO2          && <div className="pront-pdf__vital-item"><span className="pront-pdf__vital-label">SpO₂</span><span className="pront-pdf__vital-value">{prontuario.saturacaoO2}%</span></div>}
            {prontuario.peso                 && <div className="pront-pdf__vital-item"><span className="pront-pdf__vital-label">Peso</span><span className="pront-pdf__vital-value">{prontuario.peso} kg</span></div>}
            {prontuario.altura               && <div className="pront-pdf__vital-item"><span className="pront-pdf__vital-label">Altura</span><span className="pront-pdf__vital-value">{prontuario.altura} cm</span></div>}
          </div>
        </div>
      )}

      {hasAnamnese && (
        <div className="pront-pdf__section">
          <div className="pront-pdf__section-title">ANAMNESE</div>
          {prontuario.queixaPrincipal      && <div className="pront-pdf__field"><span className="pront-pdf__field-label">Queixa Principal:</span><span className="pront-pdf__field-value">{prontuario.queixaPrincipal}</span></div>}
          {prontuario.historicoDoencaAtual && <div className="pront-pdf__field"><span className="pront-pdf__field-label">História da Doença Atual (HDA):</span><span className="pront-pdf__field-value">{prontuario.historicoDoencaAtual}</span></div>}
          {prontuario.historicoMedico      && <div className="pront-pdf__field"><span className="pront-pdf__field-label">Histórico Médico:</span><span className="pront-pdf__field-value">{prontuario.historicoMedico}</span></div>}
          {prontuario.historicoFamiliar    && <div className="pront-pdf__field"><span className="pront-pdf__field-label">Histórico Familiar:</span><span className="pront-pdf__field-value">{prontuario.historicoFamiliar}</span></div>}
          {prontuario.habitosVida          && <div className="pront-pdf__field"><span className="pront-pdf__field-label">Hábitos de Vida:</span><span className="pront-pdf__field-value">{prontuario.habitosVida}</span></div>}
          {prontuario.alergias             && <div className="pront-pdf__field"><span className="pront-pdf__field-label">Alergias:</span><span className="pront-pdf__field-value">{prontuario.alergias}</span></div>}
          {prontuario.medicamentosEmUso    && <div className="pront-pdf__field"><span className="pront-pdf__field-label">Medicamentos em Uso:</span><span className="pront-pdf__field-value">{prontuario.medicamentosEmUso}</span></div>}
        </div>
      )}

      {prontuario.exameFisico && (
        <div className="pront-pdf__section">
          <div className="pront-pdf__section-title">EXAME FÍSICO</div>
          <div className="pront-pdf__text-block">{prontuario.exameFisico}</div>
        </div>
      )}

      {(prontuario.cid10 || prontuario.hipoteseDiagnostica) && (
        <div className="pront-pdf__section">
          <div className="pront-pdf__section-title">HIPÓTESE DIAGNÓSTICA</div>
          {prontuario.cid10                && <div className="pront-pdf__field"><span className="pront-pdf__field-label">CID-10:</span><span className="pront-pdf__field-value">{prontuario.cid10}</span></div>}
          {prontuario.hipoteseDiagnostica  && <div className="pront-pdf__field"><span className="pront-pdf__field-label">Hipótese:</span><span className="pront-pdf__field-value">{prontuario.hipoteseDiagnostica}</span></div>}
        </div>
      )}

      {prontuario.conduta && (
        <div className="pront-pdf__section">
          <div className="pront-pdf__section-title">CONDUTA / PLANO TERAPÊUTICO</div>
          <div className="pront-pdf__text-block">{prontuario.conduta}</div>
        </div>
      )}

      {prontuario.descricao && (
        <div className="pront-pdf__section">
          <div className="pront-pdf__section-title">OBSERVAÇÕES</div>
          <div className="pront-pdf__text-block">{prontuario.descricao}</div>
        </div>
      )}

      <div className="pront-pdf__footer">
        <div className="pront-pdf__signature">
          <div className="pront-pdf__signature-line" />
          <div className="pront-pdf__signature-name">{prontuario.medicoNome ? `Dr(a). ${prontuario.medicoNome}` : 'Médico Responsável'}</div>
          {prontuario.medicoCrm && (
            <div className="pront-pdf__signature-crm">CRM: {prontuario.medicoCrm}{prontuario.medicoUf ? `/${prontuario.medicoUf}` : ''}</div>
          )}
        </div>
      </div>
    </div>
  );
});

ProntuarioPDF.displayName = 'ProntuarioPDF';
export default ProntuarioPDF;
