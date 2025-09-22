import React from 'react';
import { render, screen, waitFor } from '@testing-library/react'; 

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }), { virtual: true });
jest.mock('../compenents/includes/header', () => () => <div data-testid="header"/>);
jest.mock('../compenents/includes/footer', () => () => <div data-testid="footer"/>);
jest.mock('../compenents/myAccount/ProfileInfo', () => () => <div data-testid="profile-info"/>);
jest.mock('../compenents/myAccount/UserSkillsManager', () => () => <div data-testid="skills"/>);
jest.mock('../compenents/myAccount/UserTasksManager', () => () => <div data-testid="tasks"/>);

jest.mock('../services/profil/profileService', () => ({
  __esModule: true,
  default: {
    getProfile: jest.fn().mockResolvedValue({ id: 1, email: 'a@a.com', roles: ['ROLE_USER'] }),
  },
}));
jest.mock('../services/authServices', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn().mockResolvedValue(true),
    logout: jest.fn(),
  },
}));
jest.mock('../services/stripeService', () => ({
  __esModule: true,
  default: {
    getSubscriptionStatus: jest.fn().mockResolvedValue({ is_premium: false }),
  },
}));

describe('MyAccount (real page with mocked services)', () => {
  beforeEach(() => mockNavigate.mockClear());

  test('renders profile sections after loading', async () => {
    const MyAccount = require('../pages/MyAccount').default;
    render(<MyAccount />);
    expect(screen.getByText('Chargement de votre profil...')).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId('profile-info')).toBeTruthy());
    expect(screen.getByTestId('skills')).toBeTruthy();
    expect(screen.getByTestId('tasks')).toBeTruthy();
  });

  test('redirects to login when not authenticated', async () => {
    const auth = require('../services/authServices').default;
    auth.isAuthenticated.mockResolvedValueOnce(false);
    const MyAccount = require('../pages/MyAccount').default;
    render(<MyAccount />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  test('logout button navigates to / after logout()', async () => {
    const auth = require('../services/authServices').default;
    auth.isAuthenticated.mockResolvedValueOnce(true);
    const MyAccount = require('../pages/MyAccount').default;
    const { findByText } = render(<MyAccount />);
    expect(await findByText('Chargement de votre profil...')).toBeTruthy();
  });
});


