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
@Table(name = "relatorios")
public class Relatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @Column(length = 150)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @CreationTimestamp
    @Column(name = "data_geracao", updatable = false)
    private LocalDateTime dataGeracao;
}
