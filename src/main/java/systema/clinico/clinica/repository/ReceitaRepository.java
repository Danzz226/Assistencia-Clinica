package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Receita;

import java.util.List;

public interface ReceitaRepository extends JpaRepository<Receita, Integer> {
    List<Receita> findByProntuario_IdIn(List<Integer> prontuarioIds);
}
