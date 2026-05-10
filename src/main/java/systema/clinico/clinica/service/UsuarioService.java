package systema.clinico.clinica.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import systema.clinico.clinica.dto.AuthResponseDTO;
import systema.clinico.clinica.dto.CadastroUsuarioDTO;
import systema.clinico.clinica.dto.LoginDTO;
import systema.clinico.clinica.dto.UsuarioResumoDTO;
import systema.clinico.clinica.model.Admin;
import systema.clinico.clinica.model.Funcionario;
import systema.clinico.clinica.model.Medico;
import systema.clinico.clinica.model.Paciente;
import systema.clinico.clinica.model.Usuario;
import systema.clinico.clinica.model.enums.TipoUsuario;
import systema.clinico.clinica.repository.AdminRepository;
import systema.clinico.clinica.repository.FuncionarioRepository;
import systema.clinico.clinica.repository.MedicoRepository;
import systema.clinico.clinica.repository.PacienteRepository;
import systema.clinico.clinica.repository.UsuarioRepository;
import systema.clinico.clinica.security.JwtService;

import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final AdminRepository adminRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PacienteRepository pacienteRepository,
            MedicoRepository medicoRepository,
            AdminRepository adminRepository,
            FuncionarioRepository funcionarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.adminRepository = adminRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponseDTO registrar(CadastroUsuarioDTO dto) {
        validarCadastroPorTipo(dto);

        String emailNorm = normalizarEmail(dto.email);
        if (usuarioRepository.findByEmail(emailNorm).isPresent()) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }

        Usuario u = new Usuario();
        u.setNome(dto.nome.trim());
        u.setEmail(emailNorm);
        u.setSenha(passwordEncoder.encode(dto.senha));
        u.setTipo(dto.tipo);

        Usuario salvo = usuarioRepository.save(u);
        criarPerfil(salvo, dto);

        String token = jwtService.gerarToken(salvo);
        return new AuthResponseDTO(token, salvo.getNome(), salvo.getEmail(), salvo.getTipo());
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

        String token = jwtService.gerarToken(usuario);
        return new AuthResponseDTO(token, usuario.getNome(), usuario.getEmail(), usuario.getTipo());
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

    private static String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void validarCadastroPorTipo(CadastroUsuarioDTO dto) {
        if (dto.tipo == TipoUsuario.medico) {
            if (dto.crm == null || dto.crm.isBlank()) {
                throw new IllegalArgumentException("CRM é obrigatório para cadastro de médico");
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
                if (dto.especialidade != null && !dto.especialidade.isBlank()) {
                    m.setEspecialidade(dto.especialidade.trim());
                }
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
