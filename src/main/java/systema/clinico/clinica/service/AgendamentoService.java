package systema.clinico.clinica.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
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
    public List<AgendamentoResponseDTO> listar(Authentication authentication) {
        if (temRole(authentication, "ROLE_ADMIN")) {
            return agendamentoRepository.findAll().stream().map(a -> paraDTO(a, true)).toList();
        }
        if (temRole(authentication, "ROLE_MEDICO")) {
            Medico medico = medicoDoUsuario(authentication);
            return agendamentoRepository.findByMedico_Id(medico.getId()).stream()
                    .map(a -> paraDTO(a, true))
                    .toList();
        }
        if (temRole(authentication, "ROLE_PACIENTE")) {
            Paciente paciente = pacienteDoUsuario(authentication);
            return agendamentoRepository.findByPaciente_Id(paciente.getId()).stream()
                    .map(a -> paraDTO(a, true))
                    .toList();
        }
        throw new AccessDeniedException("Perfil sem permissao para listar agendamentos");
    }

    @Transactional(readOnly = true)
    public AgendamentoResponseDTO buscar(Integer id) {
        Agendamento a = agendamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento nao encontrado"));
        return paraDTO(a);
    }

    @Transactional(readOnly = true)
    public AgendamentoResponseDTO buscar(Integer id, Authentication authentication) {
        Agendamento a = agendamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento nao encontrado"));
        if (!podeAcessarAgendamento(a, authentication)) {
            throw new AccessDeniedException("Voce nao tem permissao para ver este agendamento");
        }
        return paraDTO(a, podeVerMotivo(a, authentication));
    }

    @Transactional
    public AgendamentoResponseDTO criar(AgendamentoRequestDTO dto) {
        return criar(dto, null);
    }

    @Transactional
    public AgendamentoResponseDTO criar(AgendamentoRequestDTO dto, Authentication authentication) {
        validarPacientePodeAgendar(dto.pacienteId, authentication);
        validarData(dto.data);
        Paciente paciente = pacienteRepository.findById(dto.pacienteId)
                .orElseThrow(() -> new IllegalArgumentException("Paciente nao encontrado"));
        Medico medico = medicoRepository.findById(dto.medicoId)
                .orElseThrow(() -> new IllegalArgumentException("Medico nao encontrado"));

        if (agendamentoRepository.existsByMedico_IdAndData(dto.medicoId, dto.data)) {
            throw new IllegalArgumentException("Ja existe agendamento para este medico neste horario");
        }

        Agendamento a = new Agendamento();
        a.setPaciente(paciente);
        a.setMedico(medico);
        a.setData(dto.data);
        a.setMotivoConsulta(normalizarMotivo(dto.motivoConsulta));
        a.setStatus(dto.status != null ? dto.status : StatusAgendamento.agendado);
        Agendamento salvo = agendamentoRepository.save(a);
        return paraDTO(salvo);
    }

    @Transactional
    public AgendamentoResponseDTO atualizar(Integer id, AgendamentoRequestDTO dto) {
        Agendamento a = agendamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento nao encontrado"));
        validarData(dto.data);

        Paciente paciente = pacienteRepository.findById(dto.pacienteId)
                .orElseThrow(() -> new IllegalArgumentException("Paciente nao encontrado"));
        Medico medico = medicoRepository.findById(dto.medicoId)
                .orElseThrow(() -> new IllegalArgumentException("Medico nao encontrado"));

        if (agendamentoRepository.existsByMedico_IdAndDataAndIdNot(dto.medicoId, dto.data, id)) {
            throw new IllegalArgumentException("Ja existe agendamento para este medico neste horario");
        }

        a.setPaciente(paciente);
        a.setMedico(medico);
        a.setData(dto.data);
        a.setMotivoConsulta(normalizarMotivo(dto.motivoConsulta));
        if (dto.status != null) {
            a.setStatus(dto.status);
        }
        Agendamento salvo = agendamentoRepository.save(a);
        return paraDTO(salvo);
    }

    @Transactional
    public void remover(Integer id) {
        Agendamento a = agendamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento nao encontrado"));
        agendamentoRepository.delete(a);
    }

    private void validarData(LocalDateTime data) {
        if (data.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Nao e possivel usar data/hora no passado para agendar");
        }
    }

    private AgendamentoResponseDTO paraDTO(Agendamento a) {
        return paraDTO(a, true);
    }

    private AgendamentoResponseDTO paraDTO(Agendamento a, boolean incluirMotivo) {
        AgendamentoResponseDTO dto = new AgendamentoResponseDTO();
        dto.id = a.getId();
        dto.pacienteId = a.getPaciente().getId();
        dto.medicoId = a.getMedico().getId();
        dto.pacienteNome = a.getPaciente().getUsuario().getNome();
        dto.medicoNome = a.getMedico().getUsuario().getNome();
        dto.data = a.getData();
        dto.motivoConsulta = incluirMotivo ? a.getMotivoConsulta() : null;
        dto.status = a.getStatus();
        return dto;
    }

    private String normalizarMotivo(String motivoConsulta) {
        if (motivoConsulta == null || motivoConsulta.isBlank()) {
            return "Consulta agendada pelo sistema";
        }
        return motivoConsulta.trim();
    }

    private boolean podeAcessarAgendamento(Agendamento agendamento, Authentication authentication) {
        if (temRole(authentication, "ROLE_ADMIN")) {
            return true;
        }
        if (temRole(authentication, "ROLE_MEDICO")) {
            return medicoDoUsuario(authentication).getId().equals(agendamento.getMedico().getId());
        }
        if (temRole(authentication, "ROLE_PACIENTE")) {
            return pacienteDoUsuario(authentication).getId().equals(agendamento.getPaciente().getId());
        }
        return false;
    }

    private void validarPacientePodeAgendar(Integer pacienteId, Authentication authentication) {
        if (authentication == null || temRole(authentication, "ROLE_ADMIN")) {
            return;
        }
        if (temRole(authentication, "ROLE_PACIENTE")
                && pacienteDoUsuario(authentication).getId().equals(pacienteId)) {
            return;
        }
        throw new AccessDeniedException("Voce nao tem permissao para agendar por este paciente");
    }

    private boolean podeVerMotivo(Agendamento agendamento, Authentication authentication) {
        if (temRole(authentication, "ROLE_ADMIN")) {
            return true;
        }
        if (temRole(authentication, "ROLE_MEDICO")) {
            return medicoDoUsuario(authentication).getId().equals(agendamento.getMedico().getId());
        }
        if (temRole(authentication, "ROLE_PACIENTE")) {
            return pacienteDoUsuario(authentication).getId().equals(agendamento.getPaciente().getId());
        }
        return false;
    }

    private Medico medicoDoUsuario(Authentication authentication) {
        return medicoRepository.findByUsuario_Email(emailAutenticado(authentication))
                .orElseThrow(() -> new AccessDeniedException("Usuario medico sem perfil de medico vinculado"));
    }

    private Paciente pacienteDoUsuario(Authentication authentication) {
        return pacienteRepository.findByUsuario_Email(emailAutenticado(authentication))
                .orElseThrow(() -> new AccessDeniedException("Usuario paciente sem perfil de paciente vinculado"));
    }

    private String emailAutenticado(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("Usuario nao autenticado");
        }
        return authentication.getName();
    }

    private boolean temRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> role.equals(authority.getAuthority()));
    }
}
