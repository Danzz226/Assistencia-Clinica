package systema.clinico.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import systema.clinico.clinica.model.Usuario;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmail(String email);
}
