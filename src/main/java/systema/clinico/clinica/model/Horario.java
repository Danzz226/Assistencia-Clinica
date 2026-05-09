package systema.clinico.clinica.model;

import jakarta.persistence.*;
import lombok.*;
import systema.clinico.clinica.model.enums.DiaSemana;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "horarios")
public class Horario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id")
    private Medico medico;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", length = 20)
    private DiaSemana diaSemana;

    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(name = "hora_fim")
    private LocalTime horaFim;
}
