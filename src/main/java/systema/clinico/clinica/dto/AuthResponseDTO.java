package systema.clinico.clinica.dto;

import systema.clinico.clinica.model.enums.TipoUsuario;

public record AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo, boolean mfaRequired, boolean mfaEnabled, String cpf, boolean forcarTrocaSenha) {

    public AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo) {
        this(id, token, nome, email, tipo, false, false, null, false);
    }

    public AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo, boolean mfaEnabled) {
        this(id, token, nome, email, tipo, false, mfaEnabled, null, false);
    }

    public AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo, boolean mfaEnabled, String cpf) {
        this(id, token, nome, email, tipo, false, mfaEnabled, cpf, false);
    }

    public AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo, boolean mfaEnabled, String cpf, boolean forcarTrocaSenha) {
        this(id, token, nome, email, tipo, false, mfaEnabled, cpf, forcarTrocaSenha);
    }

    // Compatibilidade sem id (MFA pendente)
    public AuthResponseDTO(String token, String nome, String email, TipoUsuario tipo, boolean mfaRequired, boolean mfaEnabled) {
        this(null, token, nome, email, tipo, mfaRequired, mfaEnabled, null, false);
    }
}
