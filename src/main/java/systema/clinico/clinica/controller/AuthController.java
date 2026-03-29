package systema.clinico.clinica.controller;

import systema.clinico.clinica.model.Usuario;
import systema.clinico.clinica.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    private final UsuarioService service;

    public AuthController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public Usuario registrar(@RequestBody Usuario usuario) {
        return service.salvar(usuario);
    }

    @PostMapping("/login")
    public String login(@RequestBody Usuario usuario) {
        boolean valido = service.validarLogin(usuario.getUsername(), usuario.getPassword());

        return valido ? "Login realizado com sucesso" : "Senha inválida";
    }
}