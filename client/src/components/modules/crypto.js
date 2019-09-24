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
// export function encryptImage(image, password) {
//   debugger
//   // var key = crypto.createHash('sha256').update(password).digest('hex')
//   var cipher = crypto.createCipher(algorithm, password)
//   var crypted = cipher.update(image, 'utf8', 'hex')
//   crypted += cipher.final('hex');
//   return crypted;
//   return window.CryptoJS.AES.encrypt(image, password).toString()
// }
// const algorithm = 'aes-256-ctr';
// export function decryptImage(image, password) {
//   debugger
//   // var key = crypto.createHash('sha256').update(password).digest('hex')
//   var decipher = crypto.createDecipher(algorithm, password)
//   var dec = decipher.update(image, 'hex')
//   dec += decipher.final('hex');
//   return dec;
//   return window.CryptoJS.AES.decrypt(image, password).toString()
// }

export const encrypt = (buffer, key) => {
  key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);
  // Create an initialization vector
  const iv = crypto.randomBytes(16);
  // Create a new cipher using the algorithm, key, and iv
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  // Create the new (encrypted) buffer
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return result;
};
export const decrypt = (encrypted, key) => {
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
// Version 10 above
// const crypto = require('crypto')
// const algorithm = 'AES-256-CBC'
// const iv = Buffer.alloc(16, 0);
// module.exports = {
// 	decrypt({cipherText, password}) {
//     const key = crypto.scryptSync(password, 'salt', 24);
// 		const decipher = crypto.createDecipheriv(algorithm, key, iv)
// 		return decipher.update(cipherText, 'hex', 'utf8') + decipher.final('utf8')
// 	}
// 	, encrypt({text, password}) {
//     const key = crypto.scryptSync(password, 'salt', 24);
// 		const cipher = crypto.createCipheriv(algorithm, key, iv)
// 		return cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
// 	}
// }
