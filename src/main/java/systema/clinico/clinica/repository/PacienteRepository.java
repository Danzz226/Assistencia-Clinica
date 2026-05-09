package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, Integer> {
}
