import crypto = require("crypto")
import _random = require("./random")

export = {
    /**
     * 
     * @param str The String to encrypt
     * @param key_src A string of characters used to calculate to key
     * @param salt A string to use as the salt
     * @returns the encrypted data, the iv, the auth_tag, and the key
     */
    encrypt: (str: string, key_src = new _random(256, 9).alphaNumSpecial(true), salt = new _random(128, 9).alphaNum(true)): import("./").DecryptInfo => {
        let key = crypto.pbkdf2Sync(key_src, salt, 65535, 32, "sha512")//.toString("base64")//crypto.randomBytes(16).toString("base64")
        const iv = crypto.randomBytes(12)//.toString("base64")
        const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)

        let ciphertext = cipher.update(str, 'utf8', 'base64')
        ciphertext += cipher.final('base64')
        return { ciphertext, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString("base64"), key: key.toString("base64") }
    },
    /**
     * 
     * @param options The data to decrypt the string
     * @returns the decrypted string
     */
    decrypt: (options: import("./").DecryptInfo) => {
        const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(options.key, 'base64'), Buffer.from(options.iv, 'base64'));
        decipher.setAuthTag(Buffer.from(options.tag, "base64"));
        let str = decipher.update(options.ciphertext, 'base64', 'utf8');
        str += decipher.final('utf8');
        return str;
    }
}

