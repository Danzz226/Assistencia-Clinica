package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Agendamento;

import java.time.LocalDateTime;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {

    boolean existsByMedico_IdAndData(Integer medicoId, LocalDateTime data);

    boolean existsByMedico_IdAndDataAndIdNot(Integer medicoId, LocalDateTime data, Integer id);

    List<Agendamento> findByMedico_Id(Integer medicoId);

    List<Agendamento> findByPaciente_Id(Integer pacienteId);
}
