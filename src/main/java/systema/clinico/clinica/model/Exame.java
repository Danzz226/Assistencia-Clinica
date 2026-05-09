package systema.clinico.clinica.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "exames")
public class Exame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id")
    private Medico medico;

    @Column(length = 100)
    private String tipo;

    @Column(columnDefinition = "TEXT")
    private String resultado;

    @Column(name = "data_exame")
    private LocalDate dataExame;
}
