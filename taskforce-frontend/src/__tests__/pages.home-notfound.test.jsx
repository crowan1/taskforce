import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
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

describe('Home and NotFound pages', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    useAuth.mockReturnValue({ isAuthenticated: false, logout: jest.fn() });
  });

  it('navigates to register from home', () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Inscrivez-vous, c'est gratuit !"));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('navigates from not found actions', () => {
    render(<NotFound />);
    fireEvent.click(screen.getByText("Retour à l'accueil"));
    expect(mockNavigate).toHaveBeenCalledWith('/');
    fireEvent.click(screen.getByText('Page précédente'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});

