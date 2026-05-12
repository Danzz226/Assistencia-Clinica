package systema.clinico.clinica;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BackendIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void loginUsuariosSenhaEAgendamentosFuncionamComContratoDoFrontend() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String adminEmail = "admin-" + suffix + "@teste.local";
        String pacienteEmail = "paciente-" + suffix + "@teste.local";
        String medicoEmail = "medico-" + suffix + "@teste.local";

        registrar("""
                {"nome":"Admin Teste","email":"%s","senha":"123456","tipo":"admin"}
                """.formatted(adminEmail));
        registrar("""
                {"nome":"Paciente Teste","email":"%s","senha":"123456","tipo":"paciente","telefone":"11999999999"}
                """.formatted(pacienteEmail));
        registrar("""
                {"nome":"Medico Teste","email":"%s","senha":"123456","tipo":"medico","crm":"CRM-%s","especialidade":"Clinica"}
                """.formatted(medicoEmail, suffix));

        String adminToken = login(adminEmail, "123456");

        JsonNode usuarios = json(mockMvc.perform(get("/usuarios")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists())
                .andReturn());
        int pacienteUsuarioId = idPorEmail(usuarios, pacienteEmail);

        mockMvc.perform(patch("/usuarios/{id}/senha", pacienteUsuarioId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"novaSenha":"654321"}
                                """))
                .andExpect(status().isNoContent());
        assertThat(login(pacienteEmail, "654321")).isNotBlank();

        int pacientePerfilId = primeiroId(getAutenticado("/pacientes", adminToken));
        int medicoPerfilId = primeiroId(getAutenticado("/medicos", adminToken));
        String dataInicial = LocalDateTime.now().plusDays(7).withNano(0).toString();
        String dataAtualizada = LocalDateTime.now().plusDays(8).withNano(0).toString();

        JsonNode agendamentoCriado = json(mockMvc.perform(post("/agendamentos")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"pacienteId":%d,"medicoId":%d,"data":"%s"}
                                """.formatted(pacientePerfilId, medicoPerfilId, dataInicial)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.motivoConsulta").value("Consulta agendada pelo sistema"))
                .andReturn());
        int agendamentoId = agendamentoCriado.get("id").asInt();

        mockMvc.perform(put("/agendamentos/{id}", agendamentoId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"pacienteId":%d,"medicoId":%d,"data":"%s","motivoConsulta":"Retorno","status":"realizado"}
                                """.formatted(pacientePerfilId, medicoPerfilId, dataAtualizada)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("realizado"));

        mockMvc.perform(get("/agendamentos/{id}", agendamentoId)
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(agendamentoId));

        mockMvc.perform(delete("/agendamentos/{id}", agendamentoId)
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isNoContent());
    }

    private void registrar(String body) throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    private String login(String email, String senha) throws Exception {
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","senha":"%s"}
                                """.formatted(email, senha)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();
        return json(result).get("token").asText();
    }

    private JsonNode getAutenticado(String path, String token) throws Exception {
        return json(mockMvc.perform(get(path).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn());
    }

    private JsonNode json(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private int primeiroId(JsonNode nodes) {
        assertThat(nodes).isNotEmpty();
        return nodes.get(0).get("id").asInt();
    }

    private int idPorEmail(JsonNode nodes, String email) {
        for (JsonNode node : nodes) {
            if (email.equals(node.get("email").asText())) {
                return node.get("id").asInt();
            }
        }
        throw new AssertionError("Usuario nao encontrado: " + email);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
