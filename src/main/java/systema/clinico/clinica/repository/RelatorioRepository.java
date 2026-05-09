package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Relatorio;

public interface RelatorioRepository extends JpaRepository<Relatorio, Integer> {
}
