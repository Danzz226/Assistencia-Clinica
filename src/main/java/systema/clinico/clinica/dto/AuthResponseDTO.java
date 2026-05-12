package systema.clinico.clinica.dto;

import systema.clinico.clinica.model.enums.TipoUsuario;

public record AuthResponseDTO(String token, String nome, String email, TipoUsuario tipo, boolean mfaRequired) {

    public AuthResponseDTO(String token, String nome, String email, TipoUsuario tipo) {
        this(token, nome, email, tipo, false);
    }

}
