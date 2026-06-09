package systema.clinico.clinica.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "prontuarios")
public class Prontuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id")
    private Medico medico;

    // Anamnese
    @Column(name = "queixa_principal", columnDefinition = "TEXT")
    private String queixaPrincipal;

    @Column(name = "historico_doenca_atual", columnDefinition = "TEXT")
    private String historicoDoencaAtual;

    @Column(name = "historico_medico", columnDefinition = "TEXT")
    private String historicoMedico;

    @Column(name = "historico_familiar", columnDefinition = "TEXT")
    private String historicoFamiliar;

    @Column(name = "habitos_vida", columnDefinition = "TEXT")
    private String habitosVida;

    @Column(columnDefinition = "TEXT")
    private String alergias;

    @Column(name = "medicamentos_em_uso", columnDefinition = "TEXT")
    private String medicamentosEmUso;

    // Sinais Vitais
    @Column(name = "pressao_arterial", length = 20)
    private String pressaoArterial;

    @Column(name = "frequencia_cardiaca")
    private Integer frequenciaCardiaca;

    @Column(name = "frequencia_respiratoria")
    private Integer frequenciaRespiratoria;

    private Double temperatura;

    @Column(name = "saturacao_o2")
    private Integer saturacaoO2;

    private Double peso;

    private Integer altura;

    // Exame Físico
    @Column(name = "exame_fisico", columnDefinition = "TEXT")
    private String exameFisico;

    // Hipótese Diagnóstica
    @Column(length = 10)
    private String cid10;

    @Column(name = "hipotese_diagnostica", columnDefinition = "TEXT")
    private String hipoteseDiagnostica;

    // Conduta / Plano Terapêutico
    @Column(columnDefinition = "TEXT")
    private String conduta;

    // Observações gerais
    @Column(columnDefinition = "TEXT")
    private String descricao;

    @CreationTimestamp
    @Column(name = "data_registro", updatable = false)
    private LocalDateTime dataRegistro;
}
