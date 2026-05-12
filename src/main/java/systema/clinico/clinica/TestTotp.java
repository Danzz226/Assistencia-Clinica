package systema.clinico.clinica;

import systema.clinico.clinica.security.TotpService;

public class TestTotp {
    public static void main(String[] args) {
        TotpService service = new TotpService();
        String secret = service.gerarSecret();
        System.out.println("Secret: " + secret);
        
        long contadorAtual = java.time.Instant.now().getEpochSecond() / 30;
        for (long offset = -1; offset <= 1; offset++) {
            System.out.println("Offset " + offset + ": " + service.gerarCodigoPublico(secret, contadorAtual + offset));
        }
    }
}
