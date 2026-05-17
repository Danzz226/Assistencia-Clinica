package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Horario;

public interface HorarioRepository extends JpaRepository<Horario, Integer> {
    void deleteByMedico_Id(Integer medicoId);
}
