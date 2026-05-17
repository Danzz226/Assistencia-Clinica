package systema.clinico.clinica.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class EditarUsuarioDTO {

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 150)
    public String nome;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail com formato inválido")
    @Size(max = 150)
    public String email;

    public LocalDate dataNascimento;

    @Pattern(regexp = "^\\(\\d{2}\\) \\d{5}-\\d{4}$", message = "Telefone deve estar no formato (11) 99999-9999")
    @Size(max = 20)
    public String telefone;

    public String endereco;

    @Pattern(regexp = "^[0-9]{1,6}$", message = "CRM deve conter entre 1 e 6 dígitos numéricos")
    public String crm;

    @Pattern(regexp = "^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$",
             message = "UF inválida")
    public String uf;

    @Size(max = 100)
    public String especialidade;
}
