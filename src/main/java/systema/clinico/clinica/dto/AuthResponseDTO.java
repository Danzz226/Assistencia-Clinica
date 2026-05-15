package systema.clinico.clinica.dto;

import systema.clinico.clinica.model.enums.TipoUsuario;

public record AuthResponseDTO(String token, String nome, String email, TipoUsuario tipo, boolean mfaRequired, boolean mfaEnabled) {

    public AuthResponseDTO(String token, String nome, String email, TipoUsuario tipo) {
        this(token, nome, email, tipo, false, false);
    }

    public AuthResponseDTO(String token, String nome, String email, TipoUsuario tipo, boolean mfaEnabled) {
        this(token, nome, email, tipo, false, mfaEnabled);
    }

}
