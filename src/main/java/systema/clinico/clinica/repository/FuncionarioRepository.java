package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Funcionario;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Integer> {
}
