package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Medico;

public interface MedicoRepository extends JpaRepository<Medico, Integer> {
}
