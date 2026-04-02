package systema.clinico.clinica.dto;

import java.time.LocalDateTime;

public class ConsultaResponseDTO {
    public Long id;
    public String pacienteCpf;
    public String medicoNome;
    public LocalDateTime dataHora;
    public String status;
}