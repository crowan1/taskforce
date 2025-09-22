jest.mock('axios', () => {
  const post = jest.fn();
  const get = jest.fn();
  const create = jest.fn(() => ({ post, get, interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } }));
  return { __esModule: true, default: { create }, post, get };
});

describe('authServices (unit)', () => {
  let auth;
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
  });

  test('validatePassword returns errors and strength', async () => {
    auth = require('../services/authServices').default;
    expect(auth.validatePassword('abc')).toMatchObject({ isValid: false });
    expect(auth.validatePassword('Abcdef1!').isValid).toBe(true);
  });

  test('sanitizeUserData keeps only whitelisted props', () => {
    const mod = require('../services/authServices');
    const raw = { id: 1, email: 'a@a.com', firstname: ' John ', lastname: ' Doe ', role: 'user', other: 'x' };
    localStorage.setItem('user', JSON.stringify(raw));
    auth = mod.default;
    const user = auth.getCurrentUser();
    expect(user).toEqual({ id: 1, email: 'a@a.com', firstname: 'John', lastname: 'Doe', role: 'user' });
  });

  test('register sanitizes payload and returns data', async () => {
    const axios = require('axios').default.create();
    axios.post.mockResolvedValueOnce({ data: { id: 1 } });
    auth = require('../services/authServices').default;
    const res = await auth.register({ email: '  A@A.com ', password: 'password123', firstname: ' John ', lastname: ' Doe ' });
    expect(res).toEqual({ id: 1 });
    expect(axios.post).toHaveBeenCalled();
  });

  test('login stores token and user', async () => {
    const axios = require('axios').default.create();
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000)+3600 }));
    const token = `${header}.${payload}.sig`;
    const user = { id: 5, email: 'u@u.com', firstname: 'A', lastname: 'B', role: 'user' };
    axios.post.mockResolvedValueOnce({ data: { token, user } });
    auth = require('../services/authServices').default;
    await auth.login({ email: 'u@u.com', password: 'x' });
    expect(localStorage.getItem('token')).toBe(token);
    expect(JSON.parse(localStorage.getItem('user')).email).toBe('u@u.com');
  });

  test('isAuthenticated false when no token', async () => {
    const axios = require('axios').default.create();
    axios.get.mockResolvedValueOnce({ data: { id: 1 } });
    auth = require('../services/authServices').default;
    const res = await auth.isAuthenticated();
    expect(res).toBe(false);
  });

  test('isAuthenticated true with valid token and /user OK', async () => {
    const axios = require('axios').default.create();
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000)+3600 }));
    const token = `${header}.${payload}.sig`;
    localStorage.setItem('token', token);
    axios.get.mockResolvedValueOnce({ data: { id: 5 } });
    auth = require('../services/authServices').default;
    const res = await auth.isAuthenticated();
    expect(res).toBe(true);
  });

  test('logout clears storage and redirects', async () => {
    const axios = require('axios').default.create();
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000)+3600 }));
    const token = `${header}.${payload}.sig`;
    localStorage.setItem('token', token);
    delete window.location;
    window.location = { replace: jest.fn(), pathname: '/' };
    auth = require('../services/authServices').default;
    await auth.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.replace).toHaveBeenCalledWith('/login');
  });

  test('refreshToken updates token', async () => {
    const axios = require('axios').default.create();
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000)+3600 }));
    const refresh = `${header}.${payload}.sig`;
    const newToken = `${header}.${btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000)+7200 }))}.sig`;
    localStorage.setItem('refreshToken', refresh);
    auth = require('../services/authServices').default;
    axios.post.mockResolvedValueOnce({ data: { token: newToken } });
    const res = await auth.refreshToken();
    expect(res).toBe(newToken);
    expect(localStorage.getItem('token')).toBe(newToken);
  });

  test('hasToken false when invalid token', () => {
    auth = require('../services/authServices').default;
    localStorage.setItem('token', 'invalid');
    expect(auth.hasToken()).toBe(false);
  });

  test('getToken null when invalid token', () => {
    auth = require('../services/authServices').default;
    localStorage.setItem('token', 'invalid');
    expect(auth.getToken()).toBeNull();
  });

  test('getCurrentUser returns null when malformed JSON', () => {
    auth = require('../services/authServices').default;
    localStorage.setItem('user', '{bad json');
    expect(auth.getCurrentUser()).toBeNull();
  });

  test('register throws on weak password', async () => {
    auth = require('../services/authServices').default;
    await expect(auth.register({ email: 'a@a.com', password: '123', firstname: 'A', lastname: 'B' }))
      .rejects.toBeDefined();
  });

  test('validatePassword returns strength labels', () => {
    auth = require('../services/authServices').default;
    expect(auth.validatePassword('Abcdef1!').strength).toBe('Fort');
    expect(auth.validatePassword('abcdef1!').strength).toBeDefined();
  });
});


