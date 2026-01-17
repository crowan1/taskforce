import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyAccount from '../pages/MyAccount';
import authService from '../services/authServices';
import profileService from '../services/profil/profileService';
import stripeService from '../services/stripeService';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' })
  };
});

jest.mock('../services/authServices', () => ({
  isAuthenticated: jest.fn(),
  logout: jest.fn()
}));

jest.mock('../services/profil/profileService', () => ({
  getProfile: jest.fn()
}));

jest.mock('../services/stripeService', () => ({
  getSubscriptionStatus: jest.fn()
}));

jest.mock('../compenents/myAccount/ProfileInfo', () => () => <div>ProfileInfo</div>);
jest.mock('../compenents/myAccount/UserSkillsManager', () => () => <div>UserSkillsManager</div>);
jest.mock('../compenents/myAccount/UserTasksManager', () => () => <div>UserTasksManager</div>);

describe('MyAccount page', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    authService.isAuthenticated.mockReset();
    authService.logout.mockReset();
    profileService.getProfile.mockReset();
    stripeService.getSubscriptionStatus.mockReset();
  });

  it('loads profile and allows logout', async () => {
    authService.isAuthenticated.mockResolvedValueOnce(true);
    profileService.getProfile.mockResolvedValueOnce({ id: 1, roles: [] });
    stripeService.getSubscriptionStatus.mockResolvedValueOnce({ is_premium: false });
    render(<MyAccount />);
    await waitFor(() => expect(screen.getByText('Mon Compte')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Se déconnecter'));
    expect(authService.logout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

