package systema.clinico.clinica.service;

import org.springframework.stereotype.Service;
import systema.clinico.clinica.dto.ConsultaDTO;
import systema.clinico.clinica.dto.ConsultaResponseDTO;
import systema.clinico.clinica.model.Consulta;
import systema.clinico.clinica.repository.ConsultaRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ConsultaService {

    private final ConsultaRepository repository;

    public ConsultaService(ConsultaRepository repository) {
        this.repository = repository;
    }

    // 🔹 AGENDAR CONSULTA
    public ConsultaResponseDTO agendar(ConsultaDTO dto) {

        // 🚫 Não pode marcar no passado
        if (dto.dataHora.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Não é possível agendar no passado");
        }

        // 🚫 Verificar conflito de horário
        if (repository.findByMedicoNomeAndDataHora(dto.medicoNome, dto.dataHora).isPresent()) {
            throw new RuntimeException("Horário já ocupado para este médico");
        }

        Consulta consulta = new Consulta();
        consulta.setPacienteCpf(dto.pacienteCpf);
        consulta.setMedicoNome(dto.medicoNome);
        consulta.setDataHora(dto.dataHora);
        consulta.setStatus("AGENDADA");

        Consulta salva = repository.save(consulta);

        return toResponse(salva);
    }

    // 🔹 LISTAR CONSULTAS
    public List<Consulta> listar() {
        return repository.findAll();
    }

    // 🔹 CANCELAR CONSULTA (ADMIN)
    public String cancelar(Long id) {

        Consulta consulta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        consulta.setStatus("CANCELADA");
        repository.save(consulta);

        return "Consulta cancelada";
    }

    // 🔹 CONVERTER PARA DTO
    private ConsultaResponseDTO toResponse(Consulta c) {
        ConsultaResponseDTO dto = new ConsultaResponseDTO();
        dto.id = c.getId();
        dto.pacienteCpf = c.getPacienteCpf();
        dto.medicoNome = c.getMedicoNome();
        dto.dataHora = c.getDataHora();
        dto.status = c.getStatus();
        return dto;
    }
}