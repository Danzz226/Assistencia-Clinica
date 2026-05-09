package systema.clinico.clinica.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import systema.clinico.clinica.model.*;
import systema.clinico.clinica.model.enums.DiaSemana;
import systema.clinico.clinica.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@SecurityRequirement(name = "bearer-jwt")
public class AtendimentoController {

    private final MedicoRepository medicoRepository;
    private final PacienteRepository pacienteRepository;
    private final AdminRepository adminRepository;
    private final HorarioRepository horarioRepository;
    private final ExameRepository exameRepository;
    private final ProntuarioRepository prontuarioRepository;
    private final DiagnosticoRepository diagnosticoRepository;
    private final ReceitaRepository receitaRepository;
    private final RelatorioRepository relatorioRepository;

    public AtendimentoController(
            MedicoRepository medicoRepository,
            PacienteRepository pacienteRepository,
            AdminRepository adminRepository,
            HorarioRepository horarioRepository,
            ExameRepository exameRepository,
            ProntuarioRepository prontuarioRepository,
            DiagnosticoRepository diagnosticoRepository,
            ReceitaRepository receitaRepository,
            RelatorioRepository relatorioRepository) {
        this.medicoRepository = medicoRepository;
        this.pacienteRepository = pacienteRepository;
        this.adminRepository = adminRepository;
        this.horarioRepository = horarioRepository;
        this.exameRepository = exameRepository;
        this.prontuarioRepository = prontuarioRepository;
        this.diagnosticoRepository = diagnosticoRepository;
        this.receitaRepository = receitaRepository;
        this.relatorioRepository = relatorioRepository;
    }

    @GetMapping("/horarios")
    @Transactional(readOnly = true)
    public List<HorarioResponse> listarHorarios() {
        return horarioRepository.findAll().stream().map(this::horarioResponse).toList();
    }

    @GetMapping("/horarios/{id}")
    @Transactional(readOnly = true)
    public HorarioResponse buscarHorario(@PathVariable Integer id) {
        return horarioResponse(horario(id));
    }

    @PostMapping("/horarios")
    @Transactional
    public HorarioResponse criarHorario(@RequestBody @Valid HorarioRequest dto) {
        Horario horario = new Horario();
        aplicarHorario(horario, dto);
        return horarioResponse(horarioRepository.save(horario));
    }

    @PutMapping("/horarios/{id}")
    @Transactional
    public HorarioResponse atualizarHorario(@PathVariable Integer id, @RequestBody @Valid HorarioRequest dto) {
        Horario horario = horario(id);
        aplicarHorario(horario, dto);
        return horarioResponse(horarioRepository.save(horario));
    }

    @DeleteMapping("/horarios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerHorario(@PathVariable Integer id) {
        horarioRepository.delete(horario(id));
    }

    @GetMapping("/exames")
    @Transactional(readOnly = true)
    public List<ExameResponse> listarExames() {
        return exameRepository.findAll().stream().map(this::exameResponse).toList();
    }

    @GetMapping("/exames/{id}")
    @Transactional(readOnly = true)
    public ExameResponse buscarExame(@PathVariable Integer id) {
        return exameResponse(exame(id));
    }

    @PostMapping("/exames")
    @Transactional
    public ExameResponse criarExame(@RequestBody @Valid ExameRequest dto) {
        Exame exame = new Exame();
        aplicarExame(exame, dto);
        return exameResponse(exameRepository.save(exame));
    }

    @PutMapping("/exames/{id}")
    @Transactional
    public ExameResponse atualizarExame(@PathVariable Integer id, @RequestBody @Valid ExameRequest dto) {
        Exame exame = exame(id);
        aplicarExame(exame, dto);
        return exameResponse(exameRepository.save(exame));
    }

    @DeleteMapping("/exames/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerExame(@PathVariable Integer id) {
        exameRepository.delete(exame(id));
    }

    @GetMapping("/prontuarios")
    @Transactional(readOnly = true)
    public List<ProntuarioResponse> listarProntuarios() {
        return prontuarioRepository.findAll().stream().map(this::prontuarioResponse).toList();
    }

    @GetMapping("/prontuarios/{id}")
    @Transactional(readOnly = true)
    public ProntuarioResponse buscarProntuario(@PathVariable Integer id) {
        return prontuarioResponse(prontuario(id));
    }

    @PostMapping("/prontuarios")
    @Transactional
    public ProntuarioResponse criarProntuario(@RequestBody @Valid ProntuarioRequest dto) {
        Prontuario prontuario = new Prontuario();
        aplicarProntuario(prontuario, dto);
        return prontuarioResponse(prontuarioRepository.save(prontuario));
    }

    @PutMapping("/prontuarios/{id}")
    @Transactional
    public ProntuarioResponse atualizarProntuario(
            @PathVariable Integer id, @RequestBody @Valid ProntuarioRequest dto) {
        Prontuario prontuario = prontuario(id);
        aplicarProntuario(prontuario, dto);
        return prontuarioResponse(prontuarioRepository.save(prontuario));
    }

    @DeleteMapping("/prontuarios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerProntuario(@PathVariable Integer id) {
        prontuarioRepository.delete(prontuario(id));
    }

    @GetMapping("/diagnosticos")
    @Transactional(readOnly = true)
    public List<DiagnosticoResponse> listarDiagnosticos() {
        return diagnosticoRepository.findAll().stream().map(this::diagnosticoResponse).toList();
    }

    @GetMapping("/diagnosticos/{id}")
    @Transactional(readOnly = true)
    public DiagnosticoResponse buscarDiagnostico(@PathVariable Integer id) {
        return diagnosticoResponse(diagnostico(id));
    }

    @PostMapping("/diagnosticos")
    @Transactional
    public DiagnosticoResponse criarDiagnostico(@RequestBody @Valid DiagnosticoRequest dto) {
        Diagnostico diagnostico = new Diagnostico();
        diagnostico.setProntuario(prontuario(dto.prontuarioId));
        diagnostico.setDescricao(dto.descricao);
        return diagnosticoResponse(diagnosticoRepository.save(diagnostico));
    }

    @PutMapping("/diagnosticos/{id}")
    @Transactional
    public DiagnosticoResponse atualizarDiagnostico(
            @PathVariable Integer id, @RequestBody @Valid DiagnosticoRequest dto) {
        Diagnostico diagnostico = diagnostico(id);
        diagnostico.setProntuario(prontuario(dto.prontuarioId));
        diagnostico.setDescricao(dto.descricao);
        return diagnosticoResponse(diagnosticoRepository.save(diagnostico));
    }

    @DeleteMapping("/diagnosticos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerDiagnostico(@PathVariable Integer id) {
        diagnosticoRepository.delete(diagnostico(id));
    }

    @GetMapping("/receitas")
    @Transactional(readOnly = true)
    public List<ReceitaResponse> listarReceitas() {
        return receitaRepository.findAll().stream().map(this::receitaResponse).toList();
    }

    @GetMapping("/receitas/{id}")
    @Transactional(readOnly = true)
    public ReceitaResponse buscarReceita(@PathVariable Integer id) {
        return receitaResponse(receita(id));
    }

    @PostMapping("/receitas")
    @Transactional
    public ReceitaResponse criarReceita(@RequestBody @Valid ReceitaRequest dto) {
        Receita receita = new Receita();
        aplicarReceita(receita, dto);
        return receitaResponse(receitaRepository.save(receita));
    }

    @PutMapping("/receitas/{id}")
    @Transactional
    public ReceitaResponse atualizarReceita(@PathVariable Integer id, @RequestBody @Valid ReceitaRequest dto) {
        Receita receita = receita(id);
        aplicarReceita(receita, dto);
        return receitaResponse(receitaRepository.save(receita));
    }

    @DeleteMapping("/receitas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerReceita(@PathVariable Integer id) {
        receitaRepository.delete(receita(id));
    }

    @GetMapping("/relatorios")
    @Transactional(readOnly = true)
    public List<RelatorioResponse> listarRelatorios() {
        return relatorioRepository.findAll().stream().map(this::relatorioResponse).toList();
    }

    @GetMapping("/relatorios/{id}")
    @Transactional(readOnly = true)
    public RelatorioResponse buscarRelatorio(@PathVariable Integer id) {
        return relatorioResponse(relatorio(id));
    }

    @PostMapping("/relatorios")
    @Transactional
    public RelatorioResponse criarRelatorio(@RequestBody @Valid RelatorioRequest dto) {
        Relatorio relatorio = new Relatorio();
        aplicarRelatorio(relatorio, dto);
        return relatorioResponse(relatorioRepository.save(relatorio));
    }

    @PutMapping("/relatorios/{id}")
    @Transactional
    public RelatorioResponse atualizarRelatorio(@PathVariable Integer id, @RequestBody @Valid RelatorioRequest dto) {
        Relatorio relatorio = relatorio(id);
        aplicarRelatorio(relatorio, dto);
        return relatorioResponse(relatorioRepository.save(relatorio));
    }

    @DeleteMapping("/relatorios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerRelatorio(@PathVariable Integer id) {
        relatorioRepository.delete(relatorio(id));
    }

    private void aplicarHorario(Horario horario, HorarioRequest dto) {
        horario.setMedico(medico(dto.medicoId));
        horario.setDiaSemana(dto.diaSemana);
        horario.setHoraInicio(dto.horaInicio);
        horario.setHoraFim(dto.horaFim);
    }

    private void aplicarExame(Exame exame, ExameRequest dto) {
        exame.setPaciente(paciente(dto.pacienteId));
        exame.setMedico(medico(dto.medicoId));
        exame.setTipo(dto.tipo);
        exame.setResultado(dto.resultado);
        exame.setDataExame(dto.dataExame);
    }

    private void aplicarProntuario(Prontuario prontuario, ProntuarioRequest dto) {
        prontuario.setPaciente(paciente(dto.pacienteId));
        prontuario.setMedico(medico(dto.medicoId));
        prontuario.setDescricao(dto.descricao);
    }

    private void aplicarReceita(Receita receita, ReceitaRequest dto) {
        receita.setProntuario(prontuario(dto.prontuarioId));
        receita.setMedicamento(dto.medicamento);
        receita.setDosagem(dto.dosagem);
        receita.setInstrucoes(dto.instrucoes);
    }

    private void aplicarRelatorio(Relatorio relatorio, RelatorioRequest dto) {
        relatorio.setAdmin(admin(dto.adminId));
        relatorio.setTitulo(dto.titulo);
        relatorio.setDescricao(dto.descricao);
    }

    private Medico medico(Integer id) {
        return medicoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Médico não encontrado"));
    }

    private Paciente paciente(Integer id) {
        return pacienteRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado"));
    }

    private Admin admin(Integer id) {
        return adminRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Admin não encontrado"));
    }

    private Horario horario(Integer id) {
        return horarioRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Horário não encontrado"));
    }

    private Exame exame(Integer id) {
        return exameRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Exame não encontrado"));
    }

    private Prontuario prontuario(Integer id) {
        return prontuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prontuário não encontrado"));
    }

    private Diagnostico diagnostico(Integer id) {
        return diagnosticoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Diagnóstico não encontrado"));
    }

    private Receita receita(Integer id) {
        return receitaRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Receita não encontrada"));
    }

    private Relatorio relatorio(Integer id) {
        return relatorioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Relatório não encontrado"));
    }

    private HorarioResponse horarioResponse(Horario h) {
        return new HorarioResponse(h.getId(), h.getMedico().getId(), h.getMedico().getUsuario().getNome(),
                h.getDiaSemana(), h.getHoraInicio(), h.getHoraFim());
    }

    private ExameResponse exameResponse(Exame e) {
        return new ExameResponse(e.getId(), e.getPaciente().getId(), e.getPaciente().getUsuario().getNome(),
                e.getMedico().getId(), e.getMedico().getUsuario().getNome(), e.getTipo(), e.getResultado(),
                e.getDataExame());
    }

    private ProntuarioResponse prontuarioResponse(Prontuario p) {
        return new ProntuarioResponse(p.getId(), p.getPaciente().getId(), p.getPaciente().getUsuario().getNome(),
                p.getMedico().getId(), p.getMedico().getUsuario().getNome(), p.getDescricao(), p.getDataRegistro());
    }

    private DiagnosticoResponse diagnosticoResponse(Diagnostico d) {
        return new DiagnosticoResponse(d.getId(), d.getProntuario().getId(), d.getDescricao(), d.getMarcadoEm());
    }

    private ReceitaResponse receitaResponse(Receita r) {
        return new ReceitaResponse(r.getId(), r.getProntuario().getId(), r.getMedicamento(), r.getDosagem(),
                r.getInstrucoes(), r.getMarcadoEm());
    }

    private RelatorioResponse relatorioResponse(Relatorio r) {
        return new RelatorioResponse(r.getId(), r.getAdmin().getId(), r.getTitulo(), r.getDescricao(),
                r.getDataGeracao());
    }

    public static class HorarioRequest {
        @NotNull
        public Integer medicoId;
        @NotNull
        public DiaSemana diaSemana;
        @NotNull
        public LocalTime horaInicio;
        @NotNull
        public LocalTime horaFim;
    }

    public record HorarioResponse(
            Integer id, Integer medicoId, String medicoNome, DiaSemana diaSemana, LocalTime horaInicio,
            LocalTime horaFim) {
    }

    public static class ExameRequest {
        @NotNull
        public Integer pacienteId;
        @NotNull
        public Integer medicoId;
        @Size(max = 100)
        public String tipo;
        public String resultado;
        public LocalDate dataExame;
    }

    public record ExameResponse(
            Integer id, Integer pacienteId, String pacienteNome, Integer medicoId, String medicoNome, String tipo,
            String resultado, LocalDate dataExame) {
    }

    public static class ProntuarioRequest {
        @NotNull
        public Integer pacienteId;
        @NotNull
        public Integer medicoId;
        public String descricao;
    }

    public record ProntuarioResponse(
            Integer id, Integer pacienteId, String pacienteNome, Integer medicoId, String medicoNome,
            String descricao, LocalDateTime dataRegistro) {
    }

    public static class DiagnosticoRequest {
        @NotNull
        public Integer prontuarioId;
        public String descricao;
    }

    public record DiagnosticoResponse(Integer id, Integer prontuarioId, String descricao, LocalDateTime data) {
    }

    public static class ReceitaRequest {
        @NotNull
        public Integer prontuarioId;
        @Size(max = 255)
        public String medicamento;
        @Size(max = 100)
        public String dosagem;
        public String instrucoes;
    }

    public record ReceitaResponse(
            Integer id, Integer prontuarioId, String medicamento, String dosagem, String instrucoes,
            LocalDateTime data) {
    }

    public static class RelatorioRequest {
        @NotNull
        public Integer adminId;
        @Size(max = 150)
        public String titulo;
        public String descricao;
    }

    public record RelatorioResponse(
            Integer id, Integer adminId, String titulo, String descricao, LocalDateTime dataGeracao) {
    }
}
