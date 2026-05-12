package systema.clinico.clinica.dto;

public record MfaSetupResponseDTO(String secret, String otpauthUrl, boolean enabled) {
}
