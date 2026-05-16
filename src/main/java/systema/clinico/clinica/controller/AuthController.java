package systema.clinico.clinica.controller;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import systema.clinico.clinica.dto.AuthResponseDTO;
import systema.clinico.clinica.dto.CadastroUsuarioDTO;
import systema.clinico.clinica.dto.LoginDTO;
import systema.clinico.clinica.dto.MfaSetupResponseDTO;
import systema.clinico.clinica.dto.MfaVerifyDTO;
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
        try {
            return usuarioService.registrar(dto);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.err.println("=== ERRO DE INTEGRIDADE NO BANCO DE DADOS ===");
            e.printStackTrace();
            throw new IllegalArgumentException("Conflito de dados detalhado: " + 
                (e.getMostSpecificCause() != null ? e.getMostSpecificCause().getMessage() : e.getMessage()));
        } catch (Exception e) {
            System.err.println("=== ERRO GERAL NO CADASTRO ===");
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody @Valid LoginDTO dto) {
        return usuarioService.login(dto);
    }

    @PostMapping("/mfa/setup")
    @PreAuthorize("isAuthenticated()")
    public MfaSetupResponseDTO iniciarMfa(Authentication authentication) {
        return usuarioService.iniciarMfa(authentication.getName());
    }

    @PostMapping("/mfa/enable")
    @PreAuthorize("isAuthenticated()")
    public void habilitarMfa(@RequestBody @Valid MfaVerifyDTO dto, Authentication authentication) {
        usuarioService.habilitarMfa(authentication.getName(), dto.code());
    }

    @PostMapping("/mfa/disable")
    @PreAuthorize("isAuthenticated()")
    public void desabilitarMfa(@RequestBody @Valid MfaVerifyDTO dto, Authentication authentication) {
        usuarioService.desabilitarMfa(authentication.getName(), dto.code());
    }
}
