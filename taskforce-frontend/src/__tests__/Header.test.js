import React from 'react';
import { render, fireEvent } from '@testing-library/react';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}), { virtual: true });
 
jest.mock('../services/authServices', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn().mockResolvedValue(false),
    logout: jest.fn(),
  },
}));
jest.mock('../services/profil/profileService', () => ({
  __esModule: true,
  default: {
    getProfile: jest.fn().mockResolvedValue({ id: 1, name: 'John' }),
  },
}));

const Header = require('../compenents/includes/header').default;

describe('Header (real component)', () => {
  beforeEach(() => mockNavigate.mockClear());

  test('shows unauthenticated actions and navigates to /login', () => {
    const { getByText } = render(<Header />);
    expect(getByText('Connexion')).toBeTruthy();
    fireEvent.click(getByText('Connexion'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});


