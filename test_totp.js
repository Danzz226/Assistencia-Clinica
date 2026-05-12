const crypto = require('crypto');

function decodeBase32(secret) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = [];

    for (let i = 0; i < secret.length; i++) {
        value = (value << 5) | alphabet.indexOf(secret[i].toUpperCase());
        bits += 5;

        if (bits >= 8) {
            output.push((value >>> (bits - 8)) & 255);
            bits -= 8;
        }
    }
    return Buffer.from(output);
}

function generateHOTP(secret, counter) {
    const key = decodeBase32(secret);
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter), 0);

    const hmac = crypto.createHmac('sha1', key);
    hmac.update(buffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0xf;
    const binary = ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
}

const secret = 'JBSWY3DPEHPK3PXP'; // Example
const counter = Math.floor(Date.now() / 30000);
console.log('Time:', new Date().toISOString());
console.log('Node HOTP:', generateHOTP(secret, counter));
