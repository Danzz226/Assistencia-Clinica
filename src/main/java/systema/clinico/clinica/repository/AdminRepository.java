package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Admin;

public interface AdminRepository extends JpaRepository<Admin, Integer> {
}
