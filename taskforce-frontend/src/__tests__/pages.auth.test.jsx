import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { useAuth } from '../context/AuthContext.jsx';
import authService from '../services/authServices';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' })
  };
});

jest.mock('../context/AuthContext.jsx', () => ({
  useAuth: jest.fn()
}));

jest.mock('../services/authServices', () => ({
  login: jest.fn(),
  register: jest.fn()
}));

describe('Login and Register pages', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    authService.login.mockReset();
    authService.register.mockReset();
    useAuth.mockReturnValue({ refreshAuth: jest.fn() });
  });

  it('logs in and navigates to account', async () => {
    authService.login.mockResolvedValueOnce({});
    const refreshAuth = jest.fn();
    useAuth.mockReturnValue({ refreshAuth });
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText("Nom d'utilisateur ou email"), {
      target: { name: 'email', value: 'user@test.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Mot de passe'), {
      target: { name: 'password', value: 'Password1' }
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Se connecter' }).closest('form'));
    await waitFor(() => expect(authService.login).toHaveBeenCalled());
    expect(refreshAuth).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/account');
  });

  it('shows error on login failure', async () => {
    authService.login.mockRejectedValueOnce(new Error('Erreur'));
    render(<Login />);
    fireEvent.submit(screen.getByRole('button', { name: 'Se connecter' }).closest('form'));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('validates password and registers', async () => {
    jest.useFakeTimers();
    authService.register.mockResolvedValueOnce({});
    render(<Register />);
    fireEvent.change(screen.getByPlaceholderText('Votre prénom'), {
      target: { name: 'firstname', value: 'Ada' }
    });
    fireEvent.change(screen.getByPlaceholderText('Votre nom'), {
      target: { name: 'lastname', value: 'Lovelace' }
    });
    fireEvent.change(screen.getByPlaceholderText('votre@email.com'), {
      target: { name: 'email', value: 'user@test.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Créez un mot de passe sécurisé'), {
      target: { name: 'password', value: 'Password1' }
    });
    fireEvent.submit(screen.getByRole('button', { name: /Créer mon compte/i }).closest('form'));
    await waitFor(() => expect(authService.register).toHaveBeenCalled());
    jest.advanceTimersByTime(2100);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    jest.useRealTimers();
  });

  it('shows password error when invalid', () => {
    render(<Register />);
    fireEvent.change(screen.getByPlaceholderText('Créez un mot de passe sécurisé'), {
      target: { name: 'password', value: 'short' }
    });
    fireEvent.submit(screen.getByRole('button', { name: /Créer mon compte/i }).closest('form'));
    expect(screen.getByText(/Le mot de passe doit contenir/i)).toBeInTheDocument();
  });
});

