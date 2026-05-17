package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import systema.clinico.clinica.model.Receita;

import java.util.List;

public interface ReceitaRepository extends JpaRepository<Receita, Integer> {
    List<Receita> findByProntuario_IdIn(List<Integer> prontuarioIds);

    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM receitas WHERE prontuario_id IN (SELECT id FROM prontuarios WHERE paciente_id = :pacienteId)", nativeQuery = true)
    void deleteByPacienteId(@Param("pacienteId") Integer pacienteId);
}
