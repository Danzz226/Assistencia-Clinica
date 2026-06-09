package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Horario;
import systema.clinico.clinica.model.enums.DiaSemana;

import java.util.List;

public interface HorarioRepository extends JpaRepository<Horario, Integer> {
    void deleteByMedico_Id(Integer medicoId);
    List<Horario> findByMedico_IdAndDiaSemana(Integer medicoId, DiaSemana diaSemana);
}
