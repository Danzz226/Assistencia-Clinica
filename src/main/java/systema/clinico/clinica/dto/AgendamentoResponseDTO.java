package systema.clinico.clinica.dto;

import systema.clinico.clinica.model.enums.StatusAgendamento;

import java.time.LocalDateTime;

public class AgendamentoResponseDTO {

    public Integer id;
    public Integer pacienteId;
    public Integer medicoId;
    public String pacienteNome;
    public String medicoNome;
    public LocalDateTime data;
    public String motivoConsulta;
    public StatusAgendamento status;
}
