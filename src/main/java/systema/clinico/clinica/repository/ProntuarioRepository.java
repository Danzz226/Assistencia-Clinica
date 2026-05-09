package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Prontuario;

public interface ProntuarioRepository extends JpaRepository<Prontuario, Integer> {
}
