package systema.clinico.clinica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class MfaVerifyDTO {

    @NotBlank
    @Pattern(regexp = "\\d{6}", message = "Codigo MFA deve conter 6 digitos")
    public String code;
}
