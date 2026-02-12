const crypto = require('crypto');
const { env } = require('../config/env');

function keyBuffer() {
  return Buffer.from(env.encryptionKey, 'hex').subarray(0, 32);
}

function encryptValue(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
    tag: tag.toString('hex')
  };
}

function decryptValue(payload) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer(), Buffer.from(payload.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(payload.tag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.content, 'hex')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

module.exports = { encryptValue, decryptValue };
