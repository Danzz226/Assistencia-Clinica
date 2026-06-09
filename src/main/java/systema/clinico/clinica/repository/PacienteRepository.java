package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import systema.clinico.clinica.model.Paciente;

import java.util.List;
import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, Integer> {

    Optional<Paciente> findByUsuario_Email(String email);

    Optional<Paciente> findByUsuario_Id(Integer usuarioId);

    @Query("""
            SELECT DISTINCT p FROM Paciente p WHERE
              EXISTS (SELECT a FROM Agendamento a WHERE a.paciente = p AND a.medico.id = :medicoId) OR
              EXISTS (SELECT pr FROM Prontuario pr WHERE pr.paciente = p AND pr.medico.id = :medicoId) OR
              EXISTS (SELECT e FROM Exame e WHERE e.paciente = p AND e.medico.id = :medicoId)
            """)
    List<Paciente> findByMedicoRelacionado(@Param("medicoId") Integer medicoId);
}
