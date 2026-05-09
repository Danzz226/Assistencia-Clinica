package systema.clinico.clinica.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginDTO {

    @Email
    @NotBlank
    public String email;

    @NotBlank
    public String senha;
}
