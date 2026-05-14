package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Diagnostico;

import java.util.List;

public interface DiagnosticoRepository extends JpaRepository<Diagnostico, Integer> {
    List<Diagnostico> findByProntuario_IdIn(List<Integer> prontuarioIds);
}
