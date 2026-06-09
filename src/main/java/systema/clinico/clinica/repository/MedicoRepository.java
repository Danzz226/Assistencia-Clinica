package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import systema.clinico.clinica.model.Medico;

import java.util.List;
import java.util.Optional;

public interface MedicoRepository extends JpaRepository<Medico, Integer> {

    Optional<Medico> findByUsuario_Email(String email);

    Optional<Medico> findByUsuario_Id(Integer usuarioId);

    boolean existsByCrm(String crm);

    @Query("SELECT m FROM Medico m JOIN FETCH m.usuario")
    List<Medico> findAllWithUsuario();

    @Query("SELECT DISTINCT m.especialidade FROM Medico m WHERE m.especialidade IS NOT NULL AND m.especialidade <> '' ORDER BY m.especialidade ASC")
    List<String> findDistinctEspecialidades();

    List<Medico> findByEspecialidadeIgnoreCase(String especialidade);
}
