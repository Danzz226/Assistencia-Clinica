package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Receita;

public interface ReceitaRepository extends JpaRepository<Receita, Integer> {
}
