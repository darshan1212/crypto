/* eslint-disable max-statements */
'use strict'

const crypto = require('crypto')

class Encryption {
  constructor() {
    this.IV_LENGTH = 16 // For AES, this is always 16
    this._decrypt = this._decrypt.bind(this)
    this._encrypt = this._encrypt.bind(this)
    this._cryptFunction = this._cryptFunction.bind(this)
  }

  /**
   * Creates a key buffer from a string using SHA-256
   * @param {string} key - The key string to hash
   * @returns {Buffer} The hashed key buffer
   */
  createKeyBuffer(key) {
    if (!key) {
      throw new Error('Key is required')
    }
    return crypto
      .createHash('sha256')
      .update(key)
      .digest()
  }

  _decrypt(password, algorithm, encoding) {
    return value => {
      const valueParts = value.split(':')
      const iv = Buffer.from(valueParts.shift(), encoding)
      const encryptedText = Buffer.from(valueParts.join(':'), encoding)
      const decipher = crypto.createDecipheriv(algorithm, Buffer.from(password), iv)
      let decrypted = decipher.update(encryptedText)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      return JSON.parse(decrypted.toString())
    }
  }

  _encrypt(password, algorithm, encoding) {
    return value => {
      const iv = crypto.randomBytes(this.IV_LENGTH)
      const cipher = crypto.createCipheriv(algorithm, Buffer.from(password), iv)
      let encrypted = cipher.update(JSON.stringify(value))
      encrypted = Buffer.concat([encrypted, cipher.final()])
      return iv.toString(encoding) + ':' + encrypted.toString(encoding)
    }
  }

  _cryptFunction(type, password, algorithm, encoding) {
    const cryptValue =
      type === 'encrypt'
        ? this._encrypt(password, algorithm, encoding)
        : this._decrypt(password, algorithm, encoding)

    return (object, keys, isArray = false) => {
      const output = isArray ? object.map(e => e) : Object.assign({}, object)
      const length = isArray ? object.length : keys.length

      if (keys.length === 0) {
        for (let i = 0, len = Object.keys(object).length; i < len; i++) {
          const key = isArray ? i : Object.keys(object)[i]
          if (typeof object[key] !== 'undefined') {
            output[key] = object[key]
            // eslint-disable-next-line max-depth
            if (typeof object[key] !== 'object') {
              output[key] = cryptValue(object[key])
            } else if (Array.isArray(object[key])) {
              output[key] = this._cryptFunction(
                type,
                password,
                algorithm,
                encoding
              )(object[key], keys, true)
            } else {
              output[key] = this._cryptFunction(
                type,
                password,
                algorithm,
                encoding
              )(object[key], keys)
            }
          }
        }
        return output
      }

      for (let i = 0; i < length; i++) {
        const key = isArray ? i : keys[i]
        if (typeof object[key] !== 'undefined') {
          output[key] = object[key]
          if (typeof object[key] !== 'object') {
            output[key] = cryptValue(object[key])
          } else if (Array.isArray(object[key])) {
            output[key] = this._cryptFunction(
              type,
              password,
              algorithm,
              encoding
            )(object[key], keys, true)
          } else {
            output[key] = this._cryptFunction(
              type,
              password,
              algorithm,
              encoding
            )(object[key], keys)
          }
        }
      }
      return output
    }
  }

  /**
   * Encrypts an object recursively, optionally selecting specific keys to encrypt
   * @param {Object} object - The object to encrypt
   * @param {string} password - The encryption password
   * @param {Object} config - Configuration options
   * @param {string} config.algorithm - Encryption algorithm (default: 'aes-256-cbc')
   * @param {string} config.encoding - Output encoding (default: 'hex')
   * @param {string[]} config.keys - Keys to encrypt (default: [], encrypts all)
   * @returns {Object} The encrypted object
   */
  encrypt(object, password, { algorithm = 'aes-256-cbc', encoding = 'hex', keys = [] } = {}) {
    if (!object || typeof object !== 'object' || Array.isArray(object)) {
      throw new Error('First argument must be an object.')
    }
    if (!password) {
      throw new Error('Password is required.')
    }
    // If password is a string, convert it to a buffer
    const keyBuffer = typeof password === 'string' ? this.createKeyBuffer(password) : password
    return this._cryptFunction('encrypt', keyBuffer, algorithm, encoding)(object, keys)
  }

  /**
   * Decrypts an object recursively, optionally selecting specific keys to decrypt
   * @param {Object} object - The object to decrypt
   * @param {string} password - The decryption password
   * @param {Object} config - Configuration options
   * @param {string} config.algorithm - Encryption algorithm (default: 'aes-256-cbc')
   * @param {string} config.encoding - Input encoding (default: 'hex')
   * @param {string[]} config.keys - Keys to decrypt (default: [], decrypts all)
   * @returns {Object} The decrypted object
   */
  decrypt(object, password, { algorithm = 'aes-256-cbc', encoding = 'hex', keys = [] } = {}) {
    if (!object || typeof object !== 'object' || Array.isArray(object)) {
      throw new Error('First argument must be an object.')
    }
    if (!password) {
      throw new Error('Password is required.')
    }
    // If password is a string, convert it to a buffer
    const keyBuffer = typeof password === 'string' ? this.createKeyBuffer(password) : password
    return this._cryptFunction('decrypt', keyBuffer, algorithm, encoding)(object, keys)
  }
}

module.exports = new Encryption()
