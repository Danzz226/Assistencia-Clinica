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
import systema.clinico.clinica.model.Funcionario;
import systema.clinico.clinica.model.Medico;
import systema.clinico.clinica.model.Paciente;
import systema.clinico.clinica.model.Usuario;
import systema.clinico.clinica.repository.AgendamentoRepository;
import systema.clinico.clinica.repository.DiagnosticoRepository;
import systema.clinico.clinica.repository.ExameRepository;
import systema.clinico.clinica.repository.FuncionarioRepository;
import systema.clinico.clinica.repository.MedicoRepository;
import systema.clinico.clinica.repository.PacienteRepository;
import systema.clinico.clinica.repository.ProntuarioRepository;
import systema.clinico.clinica.repository.ReceitaRepository;
import systema.clinico.clinica.repository.UsuarioRepository;

import java.time.LocalDate;
import java.util.List;

@RestController
@SecurityRequirement(name = "bearer-jwt")
public class PerfilController {

    private final UsuarioRepository usuarioRepository;
    private final MedicoRepository medicoRepository;
    private final PacienteRepository pacienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ProntuarioRepository prontuarioRepository;
    private final ExameRepository exameRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final DiagnosticoRepository diagnosticoRepository;
    private final ReceitaRepository receitaRepository;

    public PerfilController(
            UsuarioRepository usuarioRepository,
            MedicoRepository medicoRepository,
            PacienteRepository pacienteRepository,
            FuncionarioRepository funcionarioRepository,
            ProntuarioRepository prontuarioRepository,
            ExameRepository exameRepository,
            AgendamentoRepository agendamentoRepository,
            DiagnosticoRepository diagnosticoRepository,
            ReceitaRepository receitaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.medicoRepository = medicoRepository;
        this.pacienteRepository = pacienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.prontuarioRepository = prontuarioRepository;
        this.exameRepository = exameRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.diagnosticoRepository = diagnosticoRepository;
        this.receitaRepository = receitaRepository;
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
                medico.getId(), usuario.getId(), usuario.getNome(), usuario.getEmail(),
                medico.getCrm(), medico.getUf(), medico.getEspecialidade(), medico.getTelefone());
    }

    private PacienteResponse pacienteResponse(Paciente paciente) {
        Usuario usuario = paciente.getUsuario();
        return new PacienteResponse(
                paciente.getId(), usuario.getId(), usuario.getNome(), usuario.getEmail(),
                paciente.getDataNascimento(), paciente.getTelefone(), paciente.getEndereco());
    }

    private FuncionarioResponse funcionarioResponse(Funcionario funcionario) {
        Usuario usuario = funcionario.getUsuario();
        return new FuncionarioResponse(
                funcionario.getId(), usuario.getId(), usuario.getNome(), usuario.getEmail(), funcionario.getCargo());
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
            Integer id, Integer usuarioId, String nome, String email,
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
            Integer id, Integer usuarioId, String nome, String email, LocalDate dataNascimento,
            String telefone, String endereco) {
    }

    public static class FuncionarioRequest {
        @NotNull
        public Integer usuarioId;
        @Size(max = 100)
        public String cargo;
    }

    public record FuncionarioResponse(Integer id, Integer usuarioId, String nome, String email, String cargo) {
    }
}
