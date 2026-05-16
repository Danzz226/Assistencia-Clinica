package systema.clinico.clinica.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import systema.clinico.clinica.model.enums.TipoUsuario;

import java.time.LocalDate;

public class CadastroUsuarioDTO {

    @NotBlank
    @Size(max = 150)
    public String nome;

    @Email
    @NotBlank
    @Size(max = 150)
    public String email;

    @NotBlank
    @Size(min = 6, max = 255)
    public String senha;

    @NotBlank
    @Size(max = 14)
    public String cpf;

    @NotNull
    public TipoUsuario tipo;

    @Pattern(regexp = "^[0-9]{1,6}$", message = "CRM deve conter entre 1 e 6 dígitos numéricos")
    public String crm;

    @Size(max = 100)
    public String especialidade;

    @Size(max = 100)
    public String cargo;

    public LocalDate dataNascimento;

    @Size(max = 20)
    public String telefone;

    public String endereco;
}
