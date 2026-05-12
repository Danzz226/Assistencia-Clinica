package systema.clinico.clinica.security;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Instant;

@Service
public class TotpService {

    private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final int TIME_STEP_SECONDS = 30;
    private static final int CODE_DIGITS = 6;
    private static final int SECRET_BYTES = 20;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public String gerarSecret() {
        byte[] bytes = new byte[SECRET_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return encodeBase32(bytes);
    }

    public String otpauthUrl(String issuer, String account, String secret) {
        String label = urlEncode(issuer + ":" + account);
        return "otpauth://totp/" + label
                + "?secret=" + secret
                + "&issuer=" + urlEncode(issuer)
                + "&algorithm=SHA1&digits=" + CODE_DIGITS
                + "&period=" + TIME_STEP_SECONDS;
    }

    public boolean verificar(String secret, String code) {
        if (secret == null || secret.isBlank() || code == null || !code.matches("\\d{6}")) {
            return false;
        }

        long contadorAtual = Instant.now().getEpochSecond() / TIME_STEP_SECONDS;
        for (long offset = -1; offset <= 1; offset++) {
            if (gerarCodigo(secret, contadorAtual + offset).equals(code)) {
                return true;
            }
        }
        return false;
    }

    private String gerarCodigo(String secret, long contador) {
        try {
            byte[] key = decodeBase32(secret);
            byte[] data = ByteBuffer.allocate(Long.BYTES).putLong(contador).array();
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(data);

            int offset = hash[hash.length - 1] & 0x0f;
            int binary = ((hash[offset] & 0x7f) << 24)
                    | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8)
                    | (hash[offset + 3] & 0xff);
            int otp = binary % 1_000_000;
            return String.format("%06d", otp);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Nao foi possivel gerar codigo MFA", e);
        }
    }

    private static String encodeBase32(byte[] data) {
        StringBuilder result = new StringBuilder((data.length * 8 + 4) / 5);
        int buffer = 0;
        int bitsLeft = 0;

        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xff);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                int index = (buffer >> (bitsLeft - 5)) & 31;
                bitsLeft -= 5;
                result.append(BASE32_ALPHABET.charAt(index));
            }
        }

        if (bitsLeft > 0) {
            int index = (buffer << (5 - bitsLeft)) & 31;
            result.append(BASE32_ALPHABET.charAt(index));
        }
        return result.toString();
    }

    private static byte[] decodeBase32(String secret) {
        String normalized = secret.replace("=", "").replace(" ", "").toUpperCase();
        ByteBuffer output = ByteBuffer.allocate(normalized.length() * 5 / 8);
        int buffer = 0;
        int bitsLeft = 0;

        for (char c : normalized.toCharArray()) {
            int value = BASE32_ALPHABET.indexOf(c);
            if (value < 0) {
                throw new IllegalArgumentException("Secret MFA invalido");
            }
            buffer = (buffer << 5) | value;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                output.put((byte) ((buffer >> (bitsLeft - 8)) & 0xff));
                bitsLeft -= 8;
            }
        }

        byte[] decoded = new byte[output.position()];
        output.flip();
        output.get(decoded);
        return decoded;
    }

    private static String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
