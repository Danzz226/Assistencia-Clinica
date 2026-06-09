package systema.clinico.clinica.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import systema.clinico.clinica.dto.AgendamentoRequestDTO;
import systema.clinico.clinica.dto.AgendamentoResponseDTO;
import systema.clinico.clinica.service.AgendamentoService;

import java.util.List;

@RestController
@RequestMapping("/agendamentos")
@SecurityRequirement(name = "bearer-jwt")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'PACIENTE')")
    public List<AgendamentoResponseDTO> listar(Authentication authentication) {
        return agendamentoService.listar(authentication);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'PACIENTE')")
    public AgendamentoResponseDTO buscar(@PathVariable Integer id, Authentication authentication) {
        return agendamentoService.buscar(id, authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'PACIENTE')")
    public AgendamentoResponseDTO criar(@RequestBody @Valid AgendamentoRequestDTO dto, Authentication authentication) {
        return agendamentoService.criar(dto, authentication);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public AgendamentoResponseDTO atualizar(@PathVariable Integer id, @RequestBody @Valid AgendamentoRequestDTO dto, Authentication authentication) {
        return agendamentoService.atualizar(id, dto, authentication);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void remover(@PathVariable Integer id) {
        agendamentoService.remover(id);
    }
}
