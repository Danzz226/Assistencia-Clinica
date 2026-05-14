package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import systema.clinico.clinica.model.Agendamento;

import java.time.LocalDateTime;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {

    boolean existsByMedico_IdAndData(Integer medicoId, LocalDateTime data);

    boolean existsByMedico_IdAndDataAndIdNot(Integer medicoId, LocalDateTime data, Integer id);

    List<Agendamento> findByMedico_Id(Integer medicoId);

    List<Agendamento> findByPaciente_Id(Integer pacienteId);

    @Modifying
    @Query("UPDATE Agendamento a SET a.paciente = null WHERE a.paciente.id = :id")
    void clearPaciente(@Param("id") Integer pacienteId);
}
