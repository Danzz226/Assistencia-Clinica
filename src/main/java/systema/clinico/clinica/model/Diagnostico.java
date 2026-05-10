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
@Table(name = "diagnosticos")
public class Diagnostico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prontuario_id")
    private Prontuario prontuario;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @CreationTimestamp
    @Column(name = "data", updatable = false)
    private LocalDateTime marcadoEm;
}
