package systema.clinico.clinica.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import systema.clinico.clinica.dto.LoginDTO;
import systema.clinico.clinica.dto.UsuarioDTO;
import systema.clinico.clinica.dto.UsuarioResponseDTO;
import systema.clinico.clinica.model.Usuario;
import systema.clinico.clinica.repository.UsuarioRepository;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    // 🔹 SALVAR USUÁRIO (com hash + validação)
    public UsuarioResponseDTO salvar(UsuarioDTO dto) {

        // 🔒 Validação: CPF não pode repetir
        if (repository.findByCpf(dto.cpf).isPresent()) {
            throw new RuntimeException("CPF já cadastrado");
        }

        Usuario usuario = new Usuario();

        usuario.setUsername(dto.username);
        usuario.setCpf(dto.cpf);

        // 🔐 Aqui acontece a criptografia da senha
        usuario.setPassword(passwordEncoder.encode(dto.password));

        Usuario salvo = repository.save(usuario);

        // 🔹 Retorno seguro (sem senha)
        UsuarioResponseDTO response = new UsuarioResponseDTO();
        response.id = salvo.getId();
        response.username = salvo.getUsername();
        response.cpf = salvo.getCpf();

        return response;
    }

    // 🔹 LISTAR USUÁRIOS
    public List<Usuario> listarTodos() {
        return repository.findAll();
    }

    // 🔹 LOGIN (validação de senha com hash)
    public String login(LoginDTO dto) {

        Usuario usuario = repository.findByCpf(dto.cpf)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // 🔐 Compara senha digitada com hash do banco
        if (!passwordEncoder.matches(dto.password, usuario.getPassword())) {
            throw new RuntimeException("Senha inválida");
        }

        return "Login realizado com sucesso";
    }
}