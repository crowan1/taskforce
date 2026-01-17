import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../compenents/includes/header';
import Footer from '../compenents/includes/footer';
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

jest.mock('../context/AuthContext.jsx', () => ({
  useAuth: jest.fn()
}));

describe('Header and Footer', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders header for guest and navigates', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, logout: jest.fn() });
    render(<Header />);
    fireEvent.click(screen.getByText('Connexion'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders header for authenticated user', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, logout: jest.fn() });
    render(<Header />);
    expect(screen.getByText('Mes Tableaux')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Mon Compte'));
    expect(mockNavigate).toHaveBeenCalledWith('/account');
  });

  it('renders footer content', () => {
    render(<Footer />);
    expect(screen.getByText('TaskForce')).toBeInTheDocument();
  });
});

