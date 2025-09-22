import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });
 
jest.mock('../services/authServices', () => {
  const login = jest.fn();
  return {
    __esModule: true,
    default: {
      login,
      isAuthenticated: jest.fn().mockResolvedValue(false),
      logout: jest.fn(),
    },
  };
});

jest.mock('../compenents/includes/header', () => () => <div data-testid="header"/>);
jest.mock('../compenents/includes/footer', () => () => <div data-testid="footer"/>);

describe('Login (real component + real service mocked)', () => {
  beforeEach(() => mockNavigate.mockClear());

  test('success redirects to /account', async () => {
    const auth = require('../services/authServices').default;
    auth.login.mockResolvedValue({ token: 't' });

    const { getByPlaceholderText, getByText, container } = render(<Login />);
    fireEvent.change(getByPlaceholderText(/Nom d'utilisateur ou email/i), { target: { value: 'a@a.com' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'secret' } });
    fireEvent.click(getByText('Se connecter'));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/account'));
  });

  test('error shows message', async () => {
    const auth = require('../services/authServices').default;
    auth.login.mockRejectedValue(new Error('bad'));

    const { getByPlaceholderText, getByText, findByText, container } = render(<Login />);
    fireEvent.change(getByPlaceholderText(/Nom d'utilisateur ou email/i), { target: { value: 'a@a.com' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'wrong' } });
    fireEvent.click(getByText('Se connecter'));

    expect(await findByText('Erreur de connexion')).toBeTruthy();
  });

  test('link navigates to /register', () => {
    const { getByText } = render(<Login />);
    fireEvent.click(getByText('Créer un compte'));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});


