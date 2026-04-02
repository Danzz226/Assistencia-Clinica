package systema.clinico.clinica.dto;

import jakarta.validation.constraints.*;

public class UsuarioDTO {

    @NotBlank
    public String username;

    @NotBlank
    @Size(min = 6)
    public String password;

    @NotBlank
    public String cpf;
}
