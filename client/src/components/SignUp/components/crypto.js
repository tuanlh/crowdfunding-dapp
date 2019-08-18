var crypto = require('crypto');
var algorithm = 'aes256';

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

export function encryptImage(image, password) {
  var key = crypto.createHash('sha256').update(password).digest('hex')
  var cipher = crypto.createCipher(algorithm, key)
  var crypted = cipher.update(image, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

export function decryptImage(image, password) {
  var key = crypto.createHash('sha256').update(password).digest('hex')
  var decipher = crypto.createDecipher(algorithm, key)
  var dec = decipher.update(image, 'hex')
  dec += decipher.final();
  return dec;
}
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
