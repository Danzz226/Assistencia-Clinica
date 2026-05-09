package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Exame;

public interface ExameRepository extends JpaRepository<Exame, Integer> {
}
