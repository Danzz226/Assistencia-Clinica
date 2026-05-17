package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import systema.clinico.clinica.model.Prontuario;

import java.util.List;

public interface ProntuarioRepository extends JpaRepository<Prontuario, Integer> {
    List<Prontuario> findByPaciente_Id(Integer pacienteId);

    List<Prontuario> findByPacienteIsNotNull();

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Prontuario p SET p.paciente = null WHERE p.paciente.id = :id")
    void clearPaciente(@Param("id") Integer pacienteId);

    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM prontuarios WHERE paciente_id = :pacienteId", nativeQuery = true)
    void deleteByPacienteId(@Param("pacienteId") Integer pacienteId);
}
