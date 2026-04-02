package systema.clinico.clinica.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import systema.clinico.clinica.dto.LoginDTO;
import systema.clinico.clinica.dto.UsuarioDTO;
import systema.clinico.clinica.dto.UsuarioResponseDTO;
import systema.clinico.clinica.model.Usuario;
import systema.clinico.clinica.service.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    // 🔹 Cadastro de usuário
    // Aqui o frontend (React) fará requisições POST para cadastro de usuários
    @PostMapping
    public UsuarioResponseDTO criar(@RequestBody @Valid UsuarioDTO dto) {
        return service.salvar(dto);
    }

    // 🔹 Listar usuários (CRUD)
    @GetMapping
    public List<Usuario> listar() {
        return service.listarTodos();
    }

    // 🔹 Login
    // Aqui será feita validação de login com dados vindos do frontend
    @PostMapping("/login")
    public String login(@RequestBody LoginDTO dto) {
        return service.login(dto);
    }

    // 🔹 Teste rápido (opcional)
    @GetMapping("/teste")
    public String teste() {
        return "API funcionando 🚀";
    }
}