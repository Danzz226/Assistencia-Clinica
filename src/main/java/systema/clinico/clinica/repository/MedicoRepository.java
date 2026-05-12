package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Medico;

import java.util.Optional;

public interface MedicoRepository extends JpaRepository<Medico, Integer> {

    Optional<Medico> findByUsuario_Email(String email);

    boolean existsByCrm(String crm);
}
