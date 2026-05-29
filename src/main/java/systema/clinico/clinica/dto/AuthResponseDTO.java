package systema.clinico.clinica.dto;

import systema.clinico.clinica.model.enums.TipoUsuario;

public record AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo, boolean mfaRequired, boolean mfaEnabled) {

    public AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo) {
        this(id, token, nome, email, tipo, false, false);
    }

    public AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo, boolean mfaEnabled) {
        this(id, token, nome, email, tipo, false, mfaEnabled);
    }

    // Compatibilidade sem id (MFA pendente)
    public AuthResponseDTO(String token, String nome, String email, TipoUsuario tipo, boolean mfaRequired, boolean mfaEnabled) {
        this(null, token, nome, email, tipo, mfaRequired, mfaEnabled);
    }
}
