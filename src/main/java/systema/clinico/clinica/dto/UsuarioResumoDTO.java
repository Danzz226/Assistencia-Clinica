package systema.clinico.clinica.dto;

import systema.clinico.clinica.model.enums.TipoUsuario;

public record UsuarioResumoDTO(Integer id, String nome, String email, TipoUsuario tipo, String cpf, String especialidade) {
}

