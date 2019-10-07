var crypto = require('crypto');
// var algorithm = 'aes256';
const algorithm = 'aes-256-ctr';

export function encryptText(text, password) {
  var key = crypto.createHash('sha256').update(password).digest('hex')
  var cipher = crypto.createCipher(algorithm, key)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

export function decryptText(text, password) {
  var key = crypto.createHash('sha256').update(password).digest('hex')
  var decipher = crypto.createDecipher(algorithm, key)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

export const encryptImage = (buffer, key) => {
  key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);
  // Create an initialization vector
  const iv = crypto.randomBytes(16);
  // Create a new cipher using the algorithm, key, and iv
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  // Create the new (encrypted) buffer
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return result;
};
export const decryptImage = (encrypted, key) => {
  key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);
  // Get the iv: the first 16 bytes
  const iv = encrypted.slice(0, 16);
  // Get the rest
  encrypted = encrypted.slice(16);
  // Create a decipher
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  // Actually decrypt it
  const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return result;
};

export const encryptRSA = (buffer, publicKey) => {
  const result = crypto.publicEncrypt(publicKey, buffer);
  return result; //return buffer
};

export const decryptRSA = (buffer, privateKey) => {
  const result = crypto.privateDecrypt(
      {
        key: privateKey.toString(),
        passphrase: '',
      },
      buffer,
    )
 return result; //return buffer
};
