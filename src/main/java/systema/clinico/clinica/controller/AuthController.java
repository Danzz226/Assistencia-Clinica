package systema.clinico.clinica.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import systema.clinico.clinica.dto.AuthResponseDTO;
import systema.clinico.clinica.dto.CadastroUsuarioDTO;
import systema.clinico.clinica.dto.LoginDTO;
import systema.clinico.clinica.service.UsuarioService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/register")
    public AuthResponseDTO cadastrar(@RequestBody @Valid CadastroUsuarioDTO dto) {
        return usuarioService.registrar(dto);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody @Valid LoginDTO dto) {
        return usuarioService.login(dto);
    }
}
