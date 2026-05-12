package systema.clinico.clinica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RedefinirSenhaDTO {

    @NotBlank
    @Size(min = 6, max = 255)
    public String novaSenha;
}
