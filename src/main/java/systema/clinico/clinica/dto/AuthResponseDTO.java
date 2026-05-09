package systema.clinico.clinica.dto;

import systema.clinico.clinica.model.enums.TipoUsuario;

public record AuthResponseDTO(String token, String nome, String email, TipoUsuario tipo) {

}
