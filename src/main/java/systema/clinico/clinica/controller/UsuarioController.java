package systema.clinico.clinica.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import systema.clinico.clinica.dto.RedefinirSenhaDTO;
import systema.clinico.clinica.dto.UsuarioResumoDTO;
import systema.clinico.clinica.service.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@SecurityRequirement(name = "bearer-jwt")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioResumoDTO> listar() {
        return usuarioService.listarResumo();
    }

    @PatchMapping("/{id}/senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void redefinirSenha(@PathVariable Integer id, @RequestBody @Valid RedefinirSenhaDTO dto) {
        usuarioService.redefinirSenha(id, dto.novaSenha);
    }
}
