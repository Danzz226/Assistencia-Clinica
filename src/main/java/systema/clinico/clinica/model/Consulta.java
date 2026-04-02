package systema.clinico.clinica.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@Entity
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String pacienteCpf;
    private String medicoNome;

    private LocalDateTime dataHora;

    private String status; // AGENDADA, CANCELADA, CONCLUIDA


}