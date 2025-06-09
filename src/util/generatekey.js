import { webcrypto } from 'node:crypto';

async function exportKeyToPem(cryptoKey, isPrivate) {
    const format = isPrivate ? 'pkcs8' : 'spki';
    const exportedKey = await webcrypto.subtle.exportKey(format, cryptoKey);
    const keyData = Buffer.from(exportedKey).toString('base64');
    const pemHeader = isPrivate ? '-----BEGIN PRIVATE KEY-----' : '-----BEGIN PUBLIC KEY-----';
    const pemFooter = isPrivate ? '-----END PRIVATE KEY-----' : '-----END PUBLIC KEY-----';
    return `${pemHeader}\n${keyData}\n${pemFooter}`;
}

async function generateAndExportKeys() {
    const keyPair = await webcrypto.subtle.generateKey(
        {
            name: 'RSA-PSS',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
        true,
        ['sign', 'verify']
    );
    const publicKeyPem = await exportKeyToPem(keyPair.publicKey, false);
    const privateKeyPem = await exportKeyToPem(keyPair.privateKey, true);
    console.log('Public Key (PEM):\n', publicKeyPem);
    console.log('Private Key (PEM):\n', privateKeyPem);
}

await generateAndExportKeys();