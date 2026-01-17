import { SecurityUtils } from '../utils/apiSecurity';

const makeToken = (payload) => {
  const encode = (value) => btoa(JSON.stringify(value));
  return `header.${encode(payload)}.signature`;
};

describe('SecurityUtils', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('validates jwt expiration', () => {
    const valid = makeToken({ exp: Math.floor(Date.now() / 1000) + 1000 });
    const expired = makeToken({ exp: Math.floor(Date.now() / 1000) - 10 });
    expect(SecurityUtils.isValidJWT(valid)).toBe(true);
    expect(SecurityUtils.isValidJWT(expired)).toBe(false);
    expect(SecurityUtils.isValidJWT('')).toBe(false);
    expect(SecurityUtils.isValidJWT('a.b')).toBe(false);
  });

  it('validates email and password', () => {
    expect(SecurityUtils.validateEmail('test@example.com')).toBe(true);
    expect(SecurityUtils.validateEmail('bad-email')).toBe(false);
    expect(SecurityUtils.validatePassword('Password1')).toBe(true);
    expect(SecurityUtils.validatePassword('short')).toBe(false);
  });

  it('clears session storage', () => {
    sessionStorage.setItem('token', 'abc');
    SecurityUtils.clearStorage();
    expect(sessionStorage.getItem('token')).toBe(null);
  });
});

