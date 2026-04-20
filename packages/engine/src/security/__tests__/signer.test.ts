import { describe, it, expect } from 'vitest';
import { Signer } from '../signer.js';

describe('Signer', () => {
  it('should generate a valid Ed25519 key pair', () => {
    const { publicKey, privateKey } = Signer.generateKeyPair();
    
    expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
    expect(publicKey).toContain('-----END PUBLIC KEY-----');
    expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
    expect(privateKey).toContain('-----END PRIVATE KEY-----');
  });

  it('should sign and verify data correctly', () => {
    const { publicKey, privateKey } = Signer.generateKeyPair();
    const data = '{"foo":"bar"}';
    
    const signature = Signer.sign(data, privateKey);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
    
    const isValid = Signer.verify(data, signature, publicKey);
    expect(isValid).toBe(true);
  });

  it('should fail verification with wrong data', () => {
    const { publicKey, privateKey } = Signer.generateKeyPair();
    const data = '{"foo":"bar"}';
    const signature = Signer.sign(data, privateKey);
    
    const isValid = Signer.verify('wrong data', signature, publicKey);
    expect(isValid).toBe(false);
  });

  it('should fail verification with wrong signature', () => {
    const { publicKey, privateKey } = Signer.generateKeyPair();
    const data = '{"foo":"bar"}';
    const signature = Signer.sign(data, privateKey);
    
    // Modify signature slightly
    const wrongSignature = signature.substring(0, signature.length - 4) + 'AAAA';
    
    const isValid = Signer.verify(data, wrongSignature, publicKey);
    expect(isValid).toBe(false);
  });

  it('should fail verification with wrong public key', () => {
    const { privateKey } = Signer.generateKeyPair();
    const { publicKey: wrongPublicKey } = Signer.generateKeyPair();
    const data = '{"foo":"bar"}';
    const signature = Signer.sign(data, privateKey);
    
    const isValid = Signer.verify(data, signature, wrongPublicKey);
    expect(isValid).toBe(false);
  });
});
