package systema.clinico.clinica.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import systema.clinico.clinica.dto.AgendamentoRequestDTO;
import systema.clinico.clinica.dto.AgendamentoResponseDTO;
import systema.clinico.clinica.model.Agendamento;
import systema.clinico.clinica.model.Medico;
import systema.clinico.clinica.model.Paciente;
import systema.clinico.clinica.model.enums.StatusAgendamento;
import systema.clinico.clinica.repository.AgendamentoRepository;
import systema.clinico.clinica.repository.MedicoRepository;
import systema.clinico.clinica.repository.PacienteRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;

    public AgendamentoService(
            AgendamentoRepository agendamentoRepository,
            PacienteRepository pacienteRepository,
            MedicoRepository medicoRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listar() {
        return agendamentoRepository.findAll().stream().map(this::paraDTO).toList();
    }

    @Transactional(readOnly = true)
    public AgendamentoResponseDTO buscar(Integer id) {
        Agendamento a = agendamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado"));
        return paraDTO(a);
    }

    @Transactional
    public AgendamentoResponseDTO criar(AgendamentoRequestDTO dto) {
        validarData(dto.data);
        Paciente paciente = pacienteRepository.findById(dto.pacienteId)
                .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado"));
        Medico medico = medicoRepository.findById(dto.medicoId)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado"));

        if (agendamentoRepository.existsByMedico_IdAndData(dto.medicoId, dto.data)) {
            throw new IllegalArgumentException("Já existe agendamento para este médico neste horário");
        }

        Agendamento a = new Agendamento();
        a.setPaciente(paciente);
        a.setMedico(medico);
        a.setData(dto.data);
        a.setStatus(dto.status != null ? dto.status : StatusAgendamento.agendado);
        Agendamento salvo = agendamentoRepository.save(a);
        return paraDTO(salvo);
    }

    @Transactional
    public AgendamentoResponseDTO atualizar(Integer id, AgendamentoRequestDTO dto) {
        Agendamento a = agendamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado"));

        Paciente paciente = pacienteRepository.findById(dto.pacienteId)
                .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado"));
        Medico medico = medicoRepository.findById(dto.medicoId)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado"));

        if (agendamentoRepository.existsByMedico_IdAndDataAndIdNot(dto.medicoId, dto.data, id)) {
            throw new IllegalArgumentException("Já existe agendamento para este médico neste horário");
        }

        a.setPaciente(paciente);
        a.setMedico(medico);
        a.setData(dto.data);
        if (dto.status != null) {
            a.setStatus(dto.status);
        }
        Agendamento salvo = agendamentoRepository.save(a);
        return paraDTO(salvo);
    }

    @Transactional
    public void remover(Integer id) {
        Agendamento a = agendamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado"));
        agendamentoRepository.delete(a);
    }

    private void validarData(LocalDateTime data) {
        if (data.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Não é possível usar data/hora no passado para agendar");
        }
    }

    private AgendamentoResponseDTO paraDTO(Agendamento a) {
        AgendamentoResponseDTO dto = new AgendamentoResponseDTO();
        dto.id = a.getId();
        dto.pacienteId = a.getPaciente().getId();
        dto.medicoId = a.getMedico().getId();
        dto.pacienteNome = a.getPaciente().getUsuario().getNome();
        dto.medicoNome = a.getMedico().getUsuario().getNome();
        dto.data = a.getData();
        dto.status = a.getStatus();
        return dto;
    }
}
