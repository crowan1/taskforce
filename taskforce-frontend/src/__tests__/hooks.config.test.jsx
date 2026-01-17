import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../config/api';
import { STRIPE_CONFIG } from '../config/stripe';
import { useLocalStorage, useApiCache } from '../hooks/useLocalStorage';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';

const mockGetToken = jest.fn();
const mockGetCurrentUserRole = jest.fn();
const mockLogout = jest.fn();
const mockGetProfile = jest.fn();

jest.mock('../services/authServices', () => ({
  getToken: (...args) => mockGetToken(...args),
  getCurrentUserRole: (...args) => mockGetCurrentUserRole(...args),
  logout: (...args) => mockLogout(...args)
}));

jest.mock('../services/profil/profileService', () => ({
  getProfile: (...args) => mockGetProfile(...args)
}));

const LocalStorageComponent = () => {
  const [value, setValue] = useLocalStorage('key', 'default');
  return (
    <div>
      <span>{value}</span>
      <button onClick={() => setValue('next')}>Set</button>
    </div>
  );
};

const ApiCacheComponent = ({ apiCall }) => {
  const { data, loading } = useApiCache('cache-key', apiCall, []);
  return (
    <div>
      <span>{loading ? 'loading' : 'loaded'}</span>
      <span>{data ? data.status : 'none'}</span>
    </div>
  );
};

const ApiCacheRefetchComponent = ({ apiCall }) => {
  const { refetch } = useApiCache('cache-key', apiCall, []);
  return (
    <button onClick={refetch}>Refetch</button>
  );
};

const AuthConsumer = () => {
  const { isAuthenticated, canAccessAdmin, loading } = useAuth();
  return (
    <div>
      <span>{loading ? 'loading' : 'ready'}</span>
      <span>{isAuthenticated ? 'auth' : 'guest'}</span>
      <span>{canAccessAdmin ? 'admin' : 'no-admin'}</span>
    </div>
  );
};

describe('Config and hooks', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockGetToken.mockReset();
    mockGetCurrentUserRole.mockReset();
    mockLogout.mockReset();
    mockGetProfile.mockReset();
  });

  it('exposes API config', () => {
    expect(API_CONFIG).toHaveProperty('baseURL');
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/login');
    expect(HTTP_STATUS.OK).toBe(200);
    expect(STRIPE_CONFIG).toHaveProperty('publishableKey');
  });

  it('stores local storage values', () => {
    render(<LocalStorageComponent />);
    expect(screen.getByText('default')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Set'));
    expect(screen.getByText('next')).toBeInTheDocument();
  });

  it('loads api cache data', async () => {
    const apiCall = jest.fn().mockResolvedValueOnce({ status: 'ok' });
    render(<ApiCacheComponent apiCall={apiCall} />);
    await waitFor(() => expect(screen.getByText('loaded')).toBeInTheDocument());
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('refetch clears cache', () => {
    sessionStorage.setItem('cache-key', JSON.stringify({ data: { status: 'cached' }, timestamp: Date.now() }));
    const apiCall = jest.fn().mockResolvedValueOnce({ status: 'ok' });
    render(<ApiCacheRefetchComponent apiCall={apiCall} />);
    fireEvent.click(screen.getByText('Refetch'));
    expect(sessionStorage.getItem('cache-key')).toBe(null);
  });

  it('auth context loads profile with token', async () => {
    mockGetToken.mockReturnValue('token');
    mockGetCurrentUserRole.mockReturnValue('manager');
    mockGetProfile.mockResolvedValueOnce({ roles: ['ROLE_ADMIN'] });
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('ready')).toBeInTheDocument());
    expect(screen.getByText('auth')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('auth context handles missing token', async () => {
    mockGetToken.mockReturnValue(null);
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('ready')).toBeInTheDocument());
    expect(screen.getByText('guest')).toBeInTheDocument();
    expect(screen.getByText('no-admin')).toBeInTheDocument();
  });

  it('auth context handles profile error', async () => {
    mockGetToken.mockReturnValue('token');
    mockGetProfile.mockRejectedValueOnce(new Error('Fail'));
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('ready')).toBeInTheDocument());
    expect(screen.getByText('guest')).toBeInTheDocument();
  });
});

