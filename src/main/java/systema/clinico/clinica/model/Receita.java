package systema.clinico.clinica.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "receitas")
public class Receita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prontuario_id")
    private Prontuario prontuario;

    @Column(length = 255)
    private String medicamento;

    @Column(length = 100)
    private String dosagem;

    @Column(columnDefinition = "TEXT")
    private String instrucoes;

    @CreationTimestamp
    @Column(name = "data", updatable = false)
    private LocalDateTime marcadoEm;
}
