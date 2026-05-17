package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import systema.clinico.clinica.model.Diagnostico;

import java.util.List;

public interface DiagnosticoRepository extends JpaRepository<Diagnostico, Integer> {
    List<Diagnostico> findByProntuario_IdIn(List<Integer> prontuarioIds);

    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM diagnosticos WHERE prontuario_id IN (SELECT id FROM prontuarios WHERE paciente_id = :pacienteId)", nativeQuery = true)
    void deleteByPacienteId(@Param("pacienteId") Integer pacienteId);
}
