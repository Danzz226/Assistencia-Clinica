package systema.clinico.clinica.dto;

import systema.clinico.clinica.model.enums.TipoUsuario;

public record AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo, boolean mfaRequired, boolean mfaSetupRequired, boolean mfaEnabled, String mfaSetupSecret, String mfaSetupOtpauthUrl, String cpf, boolean forcarTrocaSenha) {

    public AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo) {
        this(id, token, nome, email, tipo, false, false, false, null, null, null, false);
    }

    public AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo, boolean mfaEnabled) {
        this(id, token, nome, email, tipo, false, false, mfaEnabled, null, null, null, false);
    }

    public AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo, boolean mfaEnabled, String cpf) {
        this(id, token, nome, email, tipo, false, false, mfaEnabled, null, null, cpf, false);
    }

    public AuthResponseDTO(Integer id, String token, String nome, String email, TipoUsuario tipo, boolean mfaEnabled, String cpf, boolean forcarTrocaSenha) {
        this(id, token, nome, email, tipo, false, false, mfaEnabled, null, null, cpf, forcarTrocaSenha);
    }

    // Compatibilidade sem id (MFA pendente — verificação)
    public AuthResponseDTO(String token, String nome, String email, TipoUsuario tipo, boolean mfaRequired, boolean mfaEnabled) {
        this(null, token, nome, email, tipo, mfaRequired, false, mfaEnabled, null, null, null, false);
    }
}
