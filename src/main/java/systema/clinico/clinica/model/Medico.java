package systema.clinico.clinica.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "medicos")
public class Medico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false, length = 50)
    private String crm;

    @Column(length = 2)
    private String uf;

    @Column(length = 100)
    private String especialidade;

    @Column(length = 20)
    private String telefone;
}
