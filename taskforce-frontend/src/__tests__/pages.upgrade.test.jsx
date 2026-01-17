import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Upgrade from '../pages/Upgrade';
import authService from '../services/authServices';
import stripeService from '../services/stripeService';
import { useAuth } from '../context/AuthContext.jsx';

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
  isAuthenticated: jest.fn()
}));

jest.mock('../services/stripeService', () => ({
  getSubscriptionStatus: jest.fn(),
  syncSubscription: jest.fn()
}));

jest.mock('../context/AuthContext.jsx', () => ({
  useAuth: jest.fn()
}));

describe('Upgrade page', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    authService.isAuthenticated.mockReset();
    stripeService.getSubscriptionStatus.mockReset();
    stripeService.syncSubscription.mockReset();
    useAuth.mockReturnValue({ isAuthenticated: false, logout: jest.fn() });
    Object.defineProperty(window, 'location', {
      value: { search: '', href: '' },
      writable: true
    });
  });

  it('shows payment error when env missing', async () => {
    authService.isAuthenticated.mockResolvedValueOnce(true);
    stripeService.getSubscriptionStatus.mockResolvedValueOnce({ is_premium: false });
    render(<Upgrade />);
    await waitFor(() => expect(screen.getByText('Premium')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Passer au paiement sécurisé'));
    expect(screen.getByText('Définir REACT_APP_STRIPE_PAYMENT_LINK_URL.')).toBeInTheDocument();
  });
});

