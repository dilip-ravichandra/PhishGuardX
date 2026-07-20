import { passwordService } from '../../src/services/password.service';

describe('passwordService', () => {
  it('hashes a password to a value different from the plaintext', async () => {
    const hash = await passwordService.hash('CorrectHorse1');
    expect(hash).not.toBe('CorrectHorse1');
    expect(hash.length).toBeGreaterThan(20);
  });

  it('verifies a correct password against its hash', async () => {
    const hash = await passwordService.hash('CorrectHorse1');
    await expect(passwordService.verify('CorrectHorse1', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await passwordService.hash('CorrectHorse1');
    await expect(passwordService.verify('WrongPassword1', hash)).resolves.toBe(false);
  });
});
