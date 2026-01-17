jest.mock('axios', () => {
  const mockPost = jest.fn();
  const mockGet = jest.fn();
  const mockRequestUse = jest.fn();
  const mockResponseUse = jest.fn();
  return {
    create: jest.fn(() => ({
      post: mockPost,
      get: mockGet,
      interceptors: {
        request: { use: mockRequestUse },
        response: { use: mockResponseUse }
      }
    })),
    __mock: {
      mockPost,
      mockGet,
      mockRequestUse,
      mockResponseUse
    }
  };
});

import axios from 'axios';
import authService from '../services/authServices';

const makeToken = (payload) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (value) => btoa(JSON.stringify(value));
  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('authService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    axios.__mock.mockPost.mockReset();
    axios.__mock.mockGet.mockReset();
  });

  it('logs in and stores tokens and user', async () => {
    const token = makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
    axios.__mock.mockPost.mockResolvedValue({
      data: {
        token,
        refreshToken: token,
        user: { id: 1, email: 'user@test.com', firstname: 'Ada', lastname: 'Lovelace', role: 'manager' }
      }
    });
    await authService.login({ email: 'user@test.com', password: 'Password1' });
    expect(sessionStorage.getItem('token')).toBe(token);
    expect(sessionStorage.getItem('refreshToken')).toBe(token);
    expect(sessionStorage.getItem('user')).toContain('user@test.com');
  });

  it('checks authentication with valid token', async () => {
    const token = makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
    sessionStorage.setItem('token', token);
    axios.__mock.mockGet.mockResolvedValue({ data: { id: 1 } });
    const result = await authService.isAuthenticated();
    expect(result).toBe(true);
  });

  it('returns null when token invalid', () => {
    sessionStorage.setItem('token', 'bad.token.value');
    expect(authService.getToken()).toBe(null);
  });

  it('handles role helpers', () => {
    expect(authService.canAccessAdmin('manager')).toBe(true);
    expect(authService.canModifyTasks('responsable_projet')).toBe(true);
    expect(authService.isManager('manager')).toBe(true);
    expect(authService.isResponsableProjet('responsable_projet')).toBe(true);
    expect(authService.isCollaborateur('collaborateur')).toBe(true);
    expect(authService.canManageUsers('responsable_projet')).toBe(true);
    expect(authService.canManageProject('responsable_projet')).toBe(true);
  });

  it('filters admin accessible projects', () => {
    const projects = [
      { id: 1, users: [{ id: 10, role: 'manager' }] },
      { id: 2, users: [{ id: 10, role: 'collaborateur' }] }
    ];
    expect(authService.canAccessAdminGlobally(projects, 10)).toBe(true);
    const accessible = authService.getAdminAccessibleProjects(projects, 10);
    expect(accessible).toHaveLength(1);
    expect(accessible[0].id).toBe(1);
  });

  it('sets and gets current user role', () => {
    authService.setCurrentUserRole('manager');
    expect(authService.getCurrentUserRole()).toBe('manager');
    authService.setCurrentUserRole(null);
    expect(authService.getCurrentUserRole()).toBe(null);
  });

  it('validates password strength', () => {
    const strong = authService.validatePassword('Password1!');
    const weak = authService.validatePassword('pass');
    expect(strong.isValid).toBe(true);
    expect(weak.isValid).toBe(false);
  });

  it('checks token helpers', () => {
    const token = makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
    sessionStorage.setItem('token', token);
    expect(authService.hasToken()).toBe(true);
    sessionStorage.setItem('token', 'invalid');
    expect(authService.hasToken()).toBe(false);
  });

  it('gets user role in project', () => {
    const project = { users: [{ id: 1, role: 'manager' }] };
    expect(authService.getUserRoleInProject(project, 1)).toBe('manager');
    expect(authService.getUserRoleInProject(project, 2)).toBe(null);
  });

  it('handles invalid authentication token', async () => {
    sessionStorage.setItem('token', 'bad.token');
    const result = await authService.isAuthenticated();
    expect(result).toBe(false);
  });

  it('validates register inputs', async () => {
    await expect(authService.register({ email: '', password: '', firstname: '', lastname: '' })).rejects.toBeTruthy();
    await expect(authService.register({ email: 'bad', password: 'Password1', firstname: 'A', lastname: 'B' })).rejects.toBeTruthy();
    await expect(authService.register({ email: 'user@test.com', password: 'short', firstname: 'Ada', lastname: 'Lovelace' })).rejects.toBeTruthy();
  });

  it('handles refresh token', async () => {
    const refreshToken = makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
    const newToken = makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
    sessionStorage.setItem('refreshToken', refreshToken);
    axios.__mock.mockPost.mockResolvedValueOnce({ data: { token: newToken } });
    const result = await authService.refreshToken();
    expect(result).toBe(newToken);
    expect(sessionStorage.getItem('token')).toBe(newToken);
  });

  it('clears invalid refresh token', async () => {
    sessionStorage.setItem('refreshToken', 'bad.token');
    await expect(authService.refreshToken()).rejects.toBeTruthy();
    expect(sessionStorage.getItem('token')).toBe(null);
  });

  it('handles getCurrentUser parse error', () => {
    sessionStorage.setItem('user', '{bad');
    expect(authService.getCurrentUser()).toBe(null);
  });

  it('handles empty admin access helpers', () => {
    expect(authService.canAccessAdminGlobally(null, null)).toBe(false);
    expect(authService.getAdminAccessibleProjects(null, null)).toEqual([]);
  });

  it('logs out and clears storage', async () => {
    const token = makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
    sessionStorage.setItem('token', token);
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, replace: jest.fn() };
    axios.__mock.mockPost.mockResolvedValueOnce({ data: { success: true } });
    await authService.logout();
    expect(sessionStorage.getItem('token')).toBe(null);
    expect(window.location.replace).toHaveBeenCalledWith('/login');
    window.location = originalLocation;
  });
});

