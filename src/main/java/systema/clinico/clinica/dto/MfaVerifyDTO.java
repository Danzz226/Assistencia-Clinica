package systema.clinico.clinica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record MfaVerifyDTO(
    @NotBlank
    @Pattern(regexp = "\\d{6}", message = "Codigo MFA deve conter 6 digitos")
    String code
) {}
