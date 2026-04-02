package systema.clinico.clinica.controller;

import org.springframework.web.bind.annotation.*;
import systema.clinico.clinica.dto.ConsultaDTO;
import systema.clinico.clinica.dto.ConsultaResponseDTO;
import systema.clinico.clinica.model.Consulta;
import systema.clinico.clinica.service.ConsultaService;

import java.util.List;

@RestController
@RequestMapping("/consultas")
@CrossOrigin("*")
public class ConsultaController {

    private final ConsultaService service;

    public ConsultaController(ConsultaService service) {
        this.service = service;
    }

    // 🔹 Agendar consulta
    // Aqui o frontend (React) fará requisições para agendamento
    @PostMapping
    public ConsultaResponseDTO agendar(@RequestBody ConsultaDTO dto) {
        return service.agendar(dto);
    }

    // 🔹 Listar consultas
    @GetMapping
    public List<Consulta> listar() {
        return service.listar();
    }

    // 🔹 Cancelar consulta (admin)
    @DeleteMapping("/{id}")
    public String cancelar(@PathVariable Long id) {
        return service.cancelar(id);
    }
}