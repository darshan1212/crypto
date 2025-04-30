# JSON Object Crypto

A utility for encrypting and decrypting JSON objects with selective field encryption. This package allows you to encrypt specific fields in your JSON objects while keeping others in plain text.

## Features

- Encrypt and decrypt JSON objects
- Selective field encryption
- Support for nested objects and arrays
- Uses AES-256-CBC encryption by default
- Configurable encryption algorithm and encoding

## Installation

```bash
npm install json-object-crypto
```

## Usage

```javascript
const crypto = require('json-object-crypto');

// Example object
const data = {
  name: "John Doe",
  email: "john@example.com",
  password: "secret123",
  address: {
    street: "123 Main St",
    city: "New York"
  }
};

// Encrypt specific fields
const encrypted = crypto.encrypt(data, "your-secret-key", {
  keys: ["password", "email"]
});

// Decrypt the encrypted object
const decrypted = crypto.decrypt(encrypted, "your-secret-key", {
  keys: ["password", "email"]
});
```

## API

### `encrypt(object, password, config)`

Encrypts an object with the given password.

#### Parameters

- `object` (Object): The object to encrypt
- `password` (string): The encryption password
- `config` (Object): Configuration options
  - `algorithm` (string): Encryption algorithm (default: 'aes-256-cbc')
  - `encoding` (string): Output encoding (default: 'hex')
  - `keys` (string[]): Keys to encrypt (default: [], encrypts all)

### `decrypt(object, password, config)`

Decrypts an object with the given password.

#### Parameters

- `object` (Object): The object to decrypt
- `password` (string): The decryption password
- `config` (Object): Configuration options
  - `algorithm` (string): Encryption algorithm (default: 'aes-256-cbc')
  - `encoding` (string): Input encoding (default: 'hex')
  - `keys` (string[]): Keys to decrypt (default: [], decrypts all)

## License

MIT 