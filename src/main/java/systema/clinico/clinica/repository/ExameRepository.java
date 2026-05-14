package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import systema.clinico.clinica.model.Exame;

public interface ExameRepository extends JpaRepository<Exame, Integer> {

    @Modifying
    @Query("UPDATE Exame e SET e.paciente = null WHERE e.paciente.id = :id")
    void clearPaciente(@Param("id") Integer pacienteId);
}
