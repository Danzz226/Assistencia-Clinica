package systema.clinico.clinica.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import systema.clinico.clinica.model.enums.TipoUsuario;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @JsonIgnore
    @Column(nullable = false, length = 255)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoUsuario tipo;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;
}
