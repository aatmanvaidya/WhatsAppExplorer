const crypto = require("crypto-js"),
  password = "12345wxhbwjhbx";

function checkIfEncrypted(text) {
  try {
    let decrypted = decryptContact(text);
    if (decrypted === undefined || decrypted === null || decrypted === "") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function encryptContact(text) {
  // if (checkIfEncrypted(text)) {
  //   return text;
  // }
  const hash = crypto.SHA256(password);
  // ecb mode for deterministic encryption
  const result = crypto.AES.encrypt(JSON.stringify({ text }), hash, {
    mode: crypto.mode.ECB,
  });
  return result.toString();
}

function decryptContact(text) {
  const hash = crypto.SHA256(password);
  const result = crypto.AES.decrypt(text, hash, { mode: crypto.mode.ECB });
  const str = result.toString(crypto.enc.Utf8);
  try {
    return JSON.parse(str).text;
  } catch (e) {
    return str;
  }
}

module.exports = {
  encryptContact,
  decryptContact,
};
