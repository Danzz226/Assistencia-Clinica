package systema.clinico.clinica.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import systema.clinico.clinica.dto.AuthResponseDTO;
import systema.clinico.clinica.dto.CadastroUsuarioDTO;
import systema.clinico.clinica.dto.LoginDTO;
import systema.clinico.clinica.dto.MfaSetupResponseDTO;
import systema.clinico.clinica.dto.EditarUsuarioDTO;
import systema.clinico.clinica.dto.UsuarioResumoDTO;
import systema.clinico.clinica.model.Admin;
import systema.clinico.clinica.model.Funcionario;
import systema.clinico.clinica.model.Medico;
import systema.clinico.clinica.model.Paciente;
import systema.clinico.clinica.model.Usuario;
import systema.clinico.clinica.model.enums.TipoUsuario;
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
import systema.clinico.clinica.security.JwtService;
import systema.clinico.clinica.security.TotpService;

import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

@Service
public class UsuarioService {

    private static final Set<String> ESPECIALIDADES_VALIDAS = Set.of(
        "Acupuntura", "Alergia e Imunologia", "Anestesiologia", "Angiologia",
        "Cancerologia", "Cardiologia", "Cirurgia Cardiovascular", "Cirurgia da Mão",
        "Cirurgia de Cabeça e Pescoço", "Cirurgia do Aparelho Digestivo", "Cirurgia Geral",
        "Cirurgia Pediátrica", "Cirurgia Plástica", "Cirurgia Torácica", "Cirurgia Vascular",
        "Clínica Médica", "Coloproctologia", "Dermatologia", "Endocrinologia e Metabologia",
        "Endoscopia", "Gastroenterologia", "Genética Médica", "Geriatria",
        "Ginecologia e Obstetrícia", "Hematologia e Hemoterapia", "Homeopatia",
        "Infectologia", "Mastologia", "Medicina de Emergência",
        "Medicina de Família e Comunidade", "Medicina do Trabalho", "Medicina do Tráfego",
        "Medicina Esportiva", "Medicina Física e Reabilitação", "Medicina Intensiva",
        "Medicina Legal e Perícia Médica", "Medicina Nuclear", "Medicina Preventiva e Social",
        "Nefrologia", "Neurocirurgia", "Neurologia", "Nutrologia", "Oftalmologia",
        "Oncologia Clínica", "Ortopedia e Traumatologia", "Otorrinolaringologia",
        "Patologia", "Patologia Clínica / Medicina Laboratorial", "Pediatria",
        "Pneumologia", "Psiquiatria", "Radiologia e Diagnóstico por Imagem",
        "Reumatologia", "Urologia"
    );

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final AdminRepository adminRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final HorarioRepository horarioRepository;
    private final ProntuarioRepository prontuarioRepository;
    private final DiagnosticoRepository diagnosticoRepository;
    private final ReceitaRepository receitaRepository;
    private final ExameRepository exameRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TotpService totpService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PacienteRepository pacienteRepository,
            MedicoRepository medicoRepository,
            AdminRepository adminRepository,
            FuncionarioRepository funcionarioRepository,
            AgendamentoRepository agendamentoRepository,
            HorarioRepository horarioRepository,
            ProntuarioRepository prontuarioRepository,
            DiagnosticoRepository diagnosticoRepository,
            ReceitaRepository receitaRepository,
            ExameRepository exameRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            TotpService totpService) {
        this.usuarioRepository = usuarioRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.adminRepository = adminRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.horarioRepository = horarioRepository;
        this.prontuarioRepository = prontuarioRepository;
        this.diagnosticoRepository = diagnosticoRepository;
        this.receitaRepository = receitaRepository;
        this.exameRepository = exameRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.totpService = totpService;
    }

    @Transactional
    public AuthResponseDTO registrar(CadastroUsuarioDTO dto) {
        validarCadastroPorTipo(dto);

        String emailNorm = normalizarEmail(dto.email);
        if (usuarioRepository.findByEmail(emailNorm).isPresent()) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }

        String cpfLimpo = null;
        if (dto.cpf != null && !dto.cpf.isBlank()) {
            cpfLimpo = dto.cpf.replaceAll("[^0-9]", "");
            if (usuarioRepository.findByCpf(cpfLimpo).isPresent()) {
                throw new IllegalArgumentException("CPF já cadastrado");
            }
        }

        Usuario u = new Usuario();
        u.setNome(dto.nome.trim());
        u.setEmail(emailNorm);
        u.setCpf(cpfLimpo);
        u.setSenha(passwordEncoder.encode(dto.senha));
        u.setTipo(dto.tipo);

        Usuario salvo = usuarioRepository.save(u);
        criarPerfil(salvo, dto);

        String token = jwtService.gerarToken(salvo);
        return new AuthResponseDTO(salvo.getId(), token, salvo.getNome(), salvo.getEmail(), salvo.getTipo(), salvo.isMfaEnabled());
    }

    /** readOnly não pode ser usado aqui porque a migração de senha em texto pode persistir novo hash no login. */
    @Transactional
    public AuthResponseDTO login(LoginDTO dto) {
        String emailNorm = normalizarEmail(dto.email);
        Usuario usuario = usuarioRepository.findByEmail(emailNorm)
                .orElseThrow(() -> new IllegalArgumentException("E-mail ou senha inválidos"));

        if (!verificarSenha(usuario, dto.senha)) {
            throw new IllegalArgumentException("E-mail ou senha inválidos");
        }

        if (usuario.isMfaEnabled()) {
            if (dto.mfaCode == null || dto.mfaCode.isBlank()) {
                return new AuthResponseDTO(null, usuario.getNome(), usuario.getEmail(), usuario.getTipo(), true, true);
            } else if (!totpService.verificar(usuario.getMfaSecret(), dto.mfaCode)) {
                throw new IllegalArgumentException("Código MFA inválido");
            }
        }

        String token = jwtService.gerarToken(usuario);
        return new AuthResponseDTO(usuario.getId(), token, usuario.getNome(), usuario.getEmail(), usuario.getTipo(), usuario.isMfaEnabled());
    }

    @Transactional(readOnly = true)
    public List<UsuarioResumoDTO> listarResumo() {
        return usuarioRepository.findAll().stream()
                .map(usuario -> new UsuarioResumoDTO(
                        usuario.getId(),
                        usuario.getNome(),
                        usuario.getEmail(),
                        usuario.getTipo()))
                .toList();
    }

    @Transactional
    public void deletar(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        switch (usuario.getTipo()) {
            case medico -> medicoRepository.findByUsuario_Id(id).ifPresent(medico -> {
                agendamentoRepository.clearMedico(medico.getId());
                horarioRepository.deleteByMedico_Id(medico.getId());
                medicoRepository.delete(medico);
            });
            case paciente -> pacienteRepository.findByUsuario_Id(id).ifPresent(paciente -> {
                diagnosticoRepository.deleteByPacienteId(paciente.getId());
                receitaRepository.deleteByPacienteId(paciente.getId());
                prontuarioRepository.deleteByPacienteId(paciente.getId());
                exameRepository.deleteByPacienteId(paciente.getId());
                agendamentoRepository.deleteByPacienteId(paciente.getId());
                pacienteRepository.delete(paciente);
            });
            case admin -> adminRepository.findByUsuario_Id(id).ifPresent(adminRepository::delete);
            case funcionario -> funcionarioRepository.findByUsuario_Id(id).ifPresent(funcionarioRepository::delete);
        }

        usuarioRepository.delete(usuario);
    }

    @Transactional
    public void atualizar(Integer id, EditarUsuarioDTO dto, Authentication authentication) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isMedico = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MEDICO"));
        String emailLogado = authentication.getName();

        if (!isAdmin) {
            boolean editandoSiMesmo = usuario.getEmail().equals(normalizarEmail(emailLogado));
            boolean medicoEditandoPaciente = isMedico && usuario.getTipo() == TipoUsuario.paciente;
            if (!editandoSiMesmo && !medicoEditandoPaciente) {
                throw new AccessDeniedException("Sem permissão para editar este usuário.");
            }
        }

        String emailNorm = normalizarEmail(dto.email);
        if (!usuario.getEmail().equals(emailNorm)) {
            if (usuarioRepository.findByEmail(emailNorm).isPresent()) {
                throw new IllegalArgumentException("E-mail já está em uso por outro usuário");
            }
            usuario.setEmail(emailNorm);
        }

        usuario.setNome(dto.nome.trim());
        usuarioRepository.save(usuario);

        switch (usuario.getTipo()) {
            case paciente -> pacienteRepository.findByUsuario_Id(usuario.getId()).ifPresent(p -> {
                p.setDataNascimento(dto.dataNascimento);
                if (dto.telefone != null && !dto.telefone.isBlank()) p.setTelefone(dto.telefone.trim());
                if (dto.endereco != null && !dto.endereco.isBlank()) p.setEndereco(dto.endereco.trim());
                pacienteRepository.save(p);
            });
            case medico -> medicoRepository.findByUsuario_Id(usuario.getId()).ifPresent(m -> {
                // CRM, UF e especialidade são credenciais profissionais — só ADMIN pode alterar
                if (isAdmin) {
                    if (dto.crm != null && !dto.crm.isBlank()) m.setCrm(dto.crm.trim());
                    if (dto.uf != null && !dto.uf.isBlank()) m.setUf(dto.uf.trim());
                    if (dto.especialidade != null && !dto.especialidade.isBlank()) {
                        if (!ESPECIALIDADES_VALIDAS.contains(dto.especialidade.trim())) {
                            throw new IllegalArgumentException("Especialidade inválida");
                        }
                        m.setEspecialidade(dto.especialidade.trim());
                    }
                }
                if (dto.telefone != null && !dto.telefone.isBlank()) m.setTelefone(dto.telefone.trim());
                medicoRepository.save(m);
            });
            default -> {}
        }
    }

    @Transactional
    public void redefinirSenha(Integer id, String novaSenha) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        validarSenhaDiferente(usuario, novaSenha);
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResumoDTO buscarResumoPorEmail(String email) {
        Usuario usuario = buscarPorEmailAutenticado(email);
        return new UsuarioResumoDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipo());
    }

    @Transactional
    public void redefinirSenhaPorEmail(String email, String novaSenha) {
        Usuario usuario = buscarPorEmailAutenticado(email);
        validarSenhaDiferente(usuario, novaSenha);
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public MfaSetupResponseDTO iniciarMfa(String email) {
        Usuario usuario = buscarPorEmailAutenticado(email);
        String secret = usuario.getMfaSecret();
        if (secret == null || secret.isBlank()) {
            secret = totpService.gerarSecret();
            usuario.setMfaSecret(secret);
            usuarioRepository.save(usuario);
        }
        return new MfaSetupResponseDTO(
                secret,
                totpService.otpauthUrl("Assistencia Clinica", usuario.getEmail(), secret),
                usuario.isMfaEnabled());
    }

    @Transactional
    public void habilitarMfa(String email, String code) {
        Usuario usuario = buscarPorEmailAutenticado(email);
        if (usuario.getMfaSecret() == null || usuario.getMfaSecret().isBlank()) {
            usuario.setMfaSecret(totpService.gerarSecret());
        }
        if (!totpService.verificar(usuario.getMfaSecret(), code)) {
            throw new IllegalArgumentException("Codigo MFA invalido");
        }
        usuario.setMfaEnabled(true);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void desabilitarMfa(String email, String code) {
        Usuario usuario = buscarPorEmailAutenticado(email);
        if (!totpService.verificar(usuario.getMfaSecret(), code)) {
            throw new IllegalArgumentException("Codigo MFA invalido");
        }
        usuario.setMfaEnabled(false);
        usuario.setMfaSecret(null);
        usuarioRepository.save(usuario);
    }

    private static String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private Usuario buscarPorEmailAutenticado(String email) {
        return usuarioRepository.findByEmail(normalizarEmail(email))
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado nao encontrado"));
    }

    private void validarCadastroPorTipo(CadastroUsuarioDTO dto) {
        if (dto.tipo == TipoUsuario.medico) {
            if (dto.crm == null || dto.crm.isBlank()) {
                throw new IllegalArgumentException("CRM é obrigatório para cadastro de médico");
            }
            if (medicoRepository.existsByCrm(dto.crm.trim())) {
                throw new IllegalArgumentException("CRM já cadastrado");
            }
            if (dto.especialidade == null || dto.especialidade.isBlank()) {
                throw new IllegalArgumentException("Especialidade é obrigatória para cadastro de médico");
            }
            if (!ESPECIALIDADES_VALIDAS.contains(dto.especialidade.trim())) {
                throw new IllegalArgumentException("Especialidade inválida");
            }
        }
        if (dto.tipo == TipoUsuario.funcionario) {
            if (dto.cargo == null || dto.cargo.isBlank()) {
                throw new IllegalArgumentException("Cargo é obrigatório para funcionário");
            }
        }
    }

    private void criarPerfil(Usuario salvo, CadastroUsuarioDTO dto) {
        switch (dto.tipo) {
            case admin -> {
                Admin admin = new Admin();
                admin.setUsuario(salvo);
                adminRepository.save(admin);
            }
            case medico -> {
                Medico m = new Medico();
                m.setUsuario(salvo);
                m.setCrm(dto.crm.trim());
                if (dto.uf != null && !dto.uf.isBlank()) m.setUf(dto.uf.trim());
                if (dto.especialidade != null && !dto.especialidade.isBlank()) m.setEspecialidade(dto.especialidade.trim());
                if (dto.telefone != null && !dto.telefone.isBlank()) m.setTelefone(dto.telefone.trim());
                medicoRepository.save(m);
            }
            case funcionario -> {
                Funcionario f = new Funcionario();
                f.setUsuario(salvo);
                f.setCargo(dto.cargo.trim());
                funcionarioRepository.save(f);
            }
            case paciente -> {
                Paciente p = new Paciente();
                p.setUsuario(salvo);
                p.setDataNascimento(dto.dataNascimento);
                if (dto.telefone != null && !dto.telefone.isBlank()) {
                    p.setTelefone(dto.telefone.trim());
                }
                if (dto.endereco != null && !dto.endereco.isBlank()) {
                    p.setEndereco(dto.endereco.trim());
                }
                pacienteRepository.save(p);
            }
        }
    }

    private void validarSenhaDiferente(Usuario usuario, String novaSenha) {
        String armazenada = usuario.getSenha();
        if (armazenada == null) return;
        boolean igual = armazenada.startsWith("$2")
                ? passwordEncoder.matches(novaSenha, armazenada)
                : novaSenha.equals(armazenada);
        if (igual) throw new IllegalArgumentException("A nova senha não pode ser igual à senha atual.");
    }

    /**
     * Aceita hashes BCrypt compatíveis com os seeds gerados pela aplicação e faz migração
     * automática se ainda estiver em texto puro como no arquivo Clinica.sql original.
     */
    private boolean verificarSenha(Usuario usuario, String senhaInformada) {
        String armazenada = usuario.getSenha();
        if (armazenada == null || senhaInformada == null) {
            return false;
        }
        if (armazenada.startsWith("$2")) {
            return passwordEncoder.matches(senhaInformada, armazenada);
        }
        boolean textoPuroIgual = Objects.equals(senhaInformada, armazenada);
        if (textoPuroIgual) {
            usuario.setSenha(passwordEncoder.encode(senhaInformada));
            usuarioRepository.save(usuario);
        }
        return textoPuroIgual;
    }
}
