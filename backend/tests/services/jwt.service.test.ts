import { jwtService } from '../../src/services/jwt.service';

describe('jwtService', () => {
  it('generates and verifies an access token round-trip', () => {
    const token = jwtService.generateAccessToken({ sub: 'user-123', role: 'admin' });
    const payload = jwtService.verifyAccessToken(token);
    expect(payload.sub).toBe('user-123');
    expect(payload.role).toBe('admin');
  });

  it('generates and verifies a refresh token round-trip', () => {
    const token = jwtService.generateRefreshToken({ sub: 'user-456' });
    const payload = jwtService.verifyRefreshToken(token);
    expect(payload.sub).toBe('user-456');
  });

  it('throws when verifying a tampered access token', () => {
    const token = jwtService.generateAccessToken({ sub: 'user-123', role: 'user' });
    const tampered = `${token}tampered`;
    expect(() => jwtService.verifyAccessToken(tampered)).toThrow();
  });

  it('produces a deterministic hash for the same token', () => {
    const token = jwtService.generateRefreshToken({ sub: 'user-789' });
    expect(jwtService.hashToken(token)).toBe(jwtService.hashToken(token));
  });

  it('produces different hashes for different tokens', () => {
    const tokenA = jwtService.generateRefreshToken({ sub: 'user-a' });
    const tokenB = jwtService.generateRefreshToken({ sub: 'user-b' });
    expect(jwtService.hashToken(tokenA)).not.toBe(jwtService.hashToken(tokenB));
  });
});
