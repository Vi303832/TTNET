import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, signToken, verifyToken } from '../src/lib/auth';

describe('Auth & Security Unit Tests (Faz 1 & Faz 4 IDOR Protection)', () => {
  it('should securely hash password with bcrypt and verify correctly', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.length).toBeGreaterThan(20);

    const isMatch = await comparePassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('should sign and verify JWT tokens securely', () => {
    const payload = {
      userId: 'usr_test_123',
      email: 'test@ttnet.com',
      name: 'Stajyer Geliştirici'
    };

    const token = signToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should reject invalid or tampered JWT tokens', () => {
    expect(verifyToken('invalid.tampered.token')).toBeNull();
    expect(verifyToken(null)).toBeNull();
    expect(verifyToken('')).toBeNull();
  });
});
