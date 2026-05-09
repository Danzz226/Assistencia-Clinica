package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Diagnostico;

public interface DiagnosticoRepository extends JpaRepository<Diagnostico, Integer> {
}
