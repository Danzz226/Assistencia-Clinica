package systema.clinico.clinica.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import systema.clinico.clinica.model.Admin;
import systema.clinico.clinica.model.Funcionario;
import systema.clinico.clinica.model.Medico;
import systema.clinico.clinica.model.Paciente;
import systema.clinico.clinica.model.Usuario;
import systema.clinico.clinica.model.Agendamento;
import systema.clinico.clinica.model.Horario;
import systema.clinico.clinica.model.enums.DiaSemana;
import systema.clinico.clinica.repository.AdminRepository;
import systema.clinico.clinica.repository.AgendamentoRepository;
import systema.clinico.clinica.repository.DiagnosticoRepository;
import systema.clinico.clinica.repository.ExameRepository;
import systema.clinico.clinica.repository.FuncionarioRepository;
import systema.clinico.clinica.repository.HorarioRepository;
import systema.clinico.clinica.repository.MedicoRepository;
import systema.clinico.clinica.repository.PacienteRepository;
import systema.clinico.clinica.repository.ProntuarioRepository;
import systema.clinico.clinica.repository.ReceitaRepository;
import systema.clinico.clinica.repository.UsuarioRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@SecurityRequirement(name = "bearer-jwt")
public class PerfilController {

    private final UsuarioRepository usuarioRepository;
    private final AdminRepository adminRepository;
    private final MedicoRepository medicoRepository;
    private final PacienteRepository pacienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ProntuarioRepository prontuarioRepository;
    private final ExameRepository exameRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final DiagnosticoRepository diagnosticoRepository;
    private final ReceitaRepository receitaRepository;
    private final HorarioRepository horarioRepository;

    public PerfilController(
            UsuarioRepository usuarioRepository,
            AdminRepository adminRepository,
            MedicoRepository medicoRepository,
            PacienteRepository pacienteRepository,
            FuncionarioRepository funcionarioRepository,
            ProntuarioRepository prontuarioRepository,
            ExameRepository exameRepository,
            AgendamentoRepository agendamentoRepository,
            DiagnosticoRepository diagnosticoRepository,
            ReceitaRepository receitaRepository,
            HorarioRepository horarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.adminRepository = adminRepository;
        this.medicoRepository = medicoRepository;
        this.pacienteRepository = pacienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.prontuarioRepository = prontuarioRepository;
        this.exameRepository = exameRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.diagnosticoRepository = diagnosticoRepository;
        this.receitaRepository = receitaRepository;
        this.horarioRepository = horarioRepository;
    }

    @GetMapping("/medicos")
    @Transactional(readOnly = true)
    public List<MedicoResponse> listarMedicos() {
        return medicoRepository.findAll().stream().map(this::medicoResponse).toList();
    }

    @GetMapping("/medicos/me")
    @Transactional(readOnly = true)
    public MedicoResponse medicoLogado(Authentication authentication) {
        String email = authentication.getName();
        Medico medico = medicoRepository.findByUsuario_Email(email)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado para o usuário logado"));
        return medicoResponse(medico);
    }

    @GetMapping("/medicos/me/pacientes")
    @Transactional(readOnly = true)
    public List<PacienteResponse> meusPacientes(Authentication authentication) {
        String email = authentication.getName();
        Medico medico = medicoRepository.findByUsuario_Email(email)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado para o usuário logado"));
        return pacienteRepository.findByMedicoRelacionado(medico.getId())
                .stream()
                .map(this::pacienteResponse)
                .toList();
    }

    @GetMapping("/medicos/especialidades")
    @Transactional(readOnly = true)
    public List<String> listarEspecialidades() {
        return medicoRepository.findDistinctEspecialidades();
    }

    @GetMapping("/medicos/disponiveis")
    @Transactional(readOnly = true)
    public List<MedicoDisponivel> medicosDisponiveis(
            @RequestParam String especialidade,
            @RequestParam LocalDate data) {
        return medicoRepository.findByEspecialidadeIgnoreCase(especialidade).stream()
                .map(m -> new MedicoDisponivel(
                        m.getId(),
                        m.getUsuario().getNome(),
                        m.getEspecialidade(),
                        m.getCrm(),
                        m.getUf(),
                        slotsDisponiveis(m.getId(), data)))
                .filter(md -> !md.slots().isEmpty())
                .toList();
    }

    @GetMapping("/medicos/{id}")
    @Transactional(readOnly = true)
    public MedicoResponse buscarMedico(@PathVariable Integer id) {
        return medicoResponse(medico(id));
    }

    @PostMapping("/medicos")
    @Transactional
    public MedicoResponse criarMedico(@RequestBody @Valid MedicoRequest dto) {
        Medico medico = new Medico();
        medico.setUsuario(usuario(dto.usuarioId));
        aplicarMedico(medico, dto);
        return medicoResponse(medicoRepository.save(medico));
    }

    @PutMapping("/medicos/{id}")
    @Transactional
    public MedicoResponse atualizarMedico(@PathVariable Integer id, @RequestBody @Valid MedicoRequest dto) {
        Medico medico = medico(id);
        medico.setUsuario(usuario(dto.usuarioId));
        aplicarMedico(medico, dto);
        return medicoResponse(medicoRepository.save(medico));
    }

    @DeleteMapping("/medicos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerMedico(@PathVariable Integer id) {
        medicoRepository.delete(medico(id));
    }

    @GetMapping("/pacientes")
    @Transactional(readOnly = true)
    public List<PacienteResponse> listarPacientes() {
        return pacienteRepository.findAll().stream().map(this::pacienteResponse).toList();
    }

    @GetMapping("/pacientes/me")
    @Transactional(readOnly = true)
    public PacienteResponse pacienteLogado(Authentication authentication) {
        String email = authentication.getName();
        Paciente paciente = pacienteRepository.findByUsuario_Email(email)
                .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado para o usuário logado"));
        return pacienteResponse(paciente);
    }

    @GetMapping("/pacientes/{id}")
    @Transactional(readOnly = true)
    public PacienteResponse buscarPaciente(@PathVariable Integer id) {
        return pacienteResponse(paciente(id));
    }

    @PostMapping("/pacientes")
    @Transactional
    public PacienteResponse criarPaciente(@RequestBody @Valid PacienteRequest dto) {
        if (dto.usuarioId == null) throw new IllegalArgumentException("usuarioId é obrigatório para criar paciente");
        Paciente paciente = new Paciente();
        paciente.setUsuario(usuario(dto.usuarioId));
        aplicarPaciente(paciente, dto);
        return pacienteResponse(pacienteRepository.save(paciente));
    }

    @PutMapping("/pacientes/{id}")
    @Transactional
    public PacienteResponse atualizarPaciente(@PathVariable Integer id, @RequestBody @Valid PacienteRequest dto) {
        Paciente paciente = paciente(id);
        aplicarPaciente(paciente, dto);
        return pacienteResponse(pacienteRepository.save(paciente));
    }

    @DeleteMapping("/pacientes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void removerPaciente(@PathVariable Integer id) {
        diagnosticoRepository.deleteByPacienteId(id);
        receitaRepository.deleteByPacienteId(id);
        prontuarioRepository.deleteByPacienteId(id);
        exameRepository.deleteByPacienteId(id);
        agendamentoRepository.deleteByPacienteId(id);
        pacienteRepository.delete(paciente(id));
    }

    @GetMapping("/funcionarios")
    @Transactional(readOnly = true)
    public List<FuncionarioResponse> listarFuncionarios() {
        return funcionarioRepository.findAll().stream().map(this::funcionarioResponse).toList();
    }

    @GetMapping("/funcionarios/{id}")
    @Transactional(readOnly = true)
    public FuncionarioResponse buscarFuncionario(@PathVariable Integer id) {
        return funcionarioResponse(funcionario(id));
    }

    @PostMapping("/funcionarios")
    @Transactional
    public FuncionarioResponse criarFuncionario(@RequestBody @Valid FuncionarioRequest dto) {
        Funcionario funcionario = new Funcionario();
        funcionario.setUsuario(usuario(dto.usuarioId));
        funcionario.setCargo(dto.cargo);
        return funcionarioResponse(funcionarioRepository.save(funcionario));
    }

    @PutMapping("/funcionarios/{id}")
    @Transactional
    public FuncionarioResponse atualizarFuncionario(
            @PathVariable Integer id, @RequestBody @Valid FuncionarioRequest dto) {
        Funcionario funcionario = funcionario(id);
        funcionario.setUsuario(usuario(dto.usuarioId));
        funcionario.setCargo(dto.cargo);
        return funcionarioResponse(funcionarioRepository.save(funcionario));
    }

    @DeleteMapping("/funcionarios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerFuncionario(@PathVariable Integer id) {
        funcionarioRepository.delete(funcionario(id));
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    @GetMapping("/admin")
    @Transactional(readOnly = true)
    public List<AdminResponse> listarAdmins() {
        return adminRepository.findAll().stream().map(this::adminResponse).toList();
    }

    @GetMapping("/admin/me")
    @Transactional(readOnly = true)
    public AdminResponse adminLogado(Authentication authentication) {
        String email = authentication.getName();
        Admin admin = adminRepository.findByUsuario_Email(email)
                .orElseThrow(() -> new IllegalArgumentException("Admin não encontrado para o usuário logado"));
        return adminResponse(admin);
    }

    @PutMapping("/admin/{id}")
    @Transactional
    public AdminResponse atualizarAdmin(@PathVariable Integer id, @RequestBody AdminRequest dto) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin não encontrado"));
        if (dto.telefone != null) admin.setTelefone(dto.telefone.isBlank() ? null : dto.telefone.trim());
        return adminResponse(adminRepository.save(admin));
    }

    private Usuario usuario(Integer id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
    }

    private Medico medico(Integer id) {
        return medicoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Médico não encontrado"));
    }

    private Paciente paciente(Integer id) {
        return pacienteRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado"));
    }

    private Funcionario funcionario(Integer id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Funcionário não encontrado"));
    }

    private static void aplicarMedico(Medico medico, MedicoRequest dto) {
        medico.setCrm(dto.crm);
        medico.setUf(dto.uf);
        medico.setEspecialidade(dto.especialidade);
        if (dto.telefone != null && !dto.telefone.isBlank()) medico.setTelefone(dto.telefone.trim());
    }

    private static void aplicarPaciente(Paciente paciente, PacienteRequest dto) {
        paciente.setDataNascimento(dto.dataNascimento);
        paciente.setTelefone(dto.telefone);
        paciente.setEndereco(dto.endereco);
    }

    private MedicoResponse medicoResponse(Medico medico) {
        Usuario usuario = medico.getUsuario();
        return new MedicoResponse(
                medico.getId(), usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getCpf(),
                medico.getCrm(), medico.getUf(), medico.getEspecialidade(), medico.getTelefone());
    }

    private PacienteResponse pacienteResponse(Paciente paciente) {
        Usuario usuario = paciente.getUsuario();
        return new PacienteResponse(
                paciente.getId(), usuario.getId(), usuario.getNome(), usuario.getEmail(),
                usuario.getCpf(), paciente.getDataNascimento(), paciente.getTelefone(), paciente.getEndereco());
    }

    private FuncionarioResponse funcionarioResponse(Funcionario funcionario) {
        Usuario usuario = funcionario.getUsuario();
        return new FuncionarioResponse(
                funcionario.getId(), usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getCpf(), funcionario.getCargo());
    }

    public static class MedicoRequest {
        @NotNull
        public Integer usuarioId;
        @Pattern(regexp = "^[0-9]{1,6}$", message = "CRM deve conter entre 1 e 6 dígitos numéricos")
        public String crm;
        @Pattern(regexp = "^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$",
                 message = "UF inválida")
        public String uf;
        @Size(max = 100)
        public String especialidade;
        @Pattern(regexp = "^\\(\\d{2}\\) \\d{5}-\\d{4}$", message = "Telefone deve estar no formato (XX) XXXXX-XXXX")
        @Size(max = 20)
        public String telefone;
    }

    public record MedicoResponse(
            Integer id, Integer usuarioId, String nome, String email, String cpf,
            String crm, String uf, String especialidade, String telefone) {
    }

    public static class PacienteRequest {
        public Integer usuarioId;
        public LocalDate dataNascimento;
        @Pattern(regexp = "^\\(\\d{2}\\) \\d{5}-\\d{4}$", message = "Telefone deve estar no formato: (11) 99999-9999")
        @Size(max = 20)
        public String telefone;
        public String endereco;
    }

    public record PacienteResponse(
            Integer id, Integer usuarioId, String nome, String email, String cpf,
            LocalDate dataNascimento, String telefone, String endereco) {
    }

    public static class FuncionarioRequest {
        @NotNull
        public Integer usuarioId;
        @Size(max = 100)
        public String cargo;
    }

    public record FuncionarioResponse(Integer id, Integer usuarioId, String nome, String email, String cpf, String cargo) {
    }

    private AdminResponse adminResponse(Admin admin) {
        Usuario usuario = admin.getUsuario();
        return new AdminResponse(
                admin.getId(), usuario.getId(), usuario.getNome(), usuario.getEmail(),
                usuario.getCpf(), admin.getTelefone(), usuario.isMfaEnabled());
    }

    public static class AdminRequest {
        @Pattern(regexp = "^(\\(\\d{2}\\) \\d{5}-\\d{4})?$", message = "Telefone deve estar no formato (XX) XXXXX-XXXX")
        @Size(max = 20)
        public String telefone;
    }

    public record AdminResponse(
            Integer id, Integer usuarioId, String nome, String email,
            String cpf, String telefone, boolean mfaEnabled) {
    }

    public record MedicoDisponivel(
            Integer id, String nome, String especialidade, String crm, String uf, List<String> slots) {
    }

    // ── Lógica de slots ──────────────────────────────────────────────────────

    private static final int    DURACAO_SLOT_MIN   = 30;
    private static final LocalTime HORA_PADRAO_INICIO = LocalTime.of(8, 0);
    private static final LocalTime HORA_PADRAO_FIM    = LocalTime.of(18, 0);

    private List<String> slotsDisponiveis(Integer medicoId, LocalDate data) {
        DiaSemana dia = diaSemana(data.getDayOfWeek());
        List<Horario> horarios = horarioRepository.findByMedico_IdAndDiaSemana(medicoId, dia);

        List<LocalTime> candidatos = new ArrayList<>();
        if (horarios.isEmpty()) {
            candidatos = gerarSlots(HORA_PADRAO_INICIO, HORA_PADRAO_FIM);
        } else {
            for (Horario h : horarios) {
                candidatos.addAll(gerarSlots(h.getHoraInicio(), h.getHoraFim()));
            }
        }

        Set<LocalDateTime> ocupados = agendamentoRepository
                .findByMedico_IdAndDataBetween(medicoId, data.atStartOfDay(), data.atTime(23, 59, 59))
                .stream()
                .map(Agendamento::getData)
                .collect(Collectors.toSet());

        return candidatos.stream()
                .filter(slot -> !ocupados.contains(data.atTime(slot)))
                .map(slot -> slot.toString().substring(0, 5))
                .distinct()
                .sorted()
                .toList();
    }

    private static List<LocalTime> gerarSlots(LocalTime inicio, LocalTime fim) {
        List<LocalTime> slots = new ArrayList<>();
        LocalTime atual = inicio;
        while (!atual.isAfter(fim.minusMinutes(DURACAO_SLOT_MIN))) {
            slots.add(atual);
            atual = atual.plusMinutes(DURACAO_SLOT_MIN);
        }
        return slots;
    }

    private static DiaSemana diaSemana(DayOfWeek dow) {
        return switch (dow) {
            case MONDAY    -> DiaSemana.segunda;
            case TUESDAY   -> DiaSemana.terca;
            case WEDNESDAY -> DiaSemana.quarta;
            case THURSDAY  -> DiaSemana.quinta;
            case FRIDAY    -> DiaSemana.sexta;
            case SATURDAY  -> DiaSemana.sabado;
            case SUNDAY    -> DiaSemana.domingo;
        };
    }
}
