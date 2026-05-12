package systema.clinico.clinica.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import systema.clinico.clinica.model.enums.StatusAgendamento;

import java.time.LocalDateTime;

public class AgendamentoRequestDTO {

    @NotNull
    public Integer pacienteId;

    @NotNull
    public Integer medicoId;

    @NotNull
    public LocalDateTime data;

    @Size(max = 2000)
    public String motivoConsulta;

    public StatusAgendamento status;
}
