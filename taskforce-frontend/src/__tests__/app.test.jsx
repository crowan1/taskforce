import { render, screen } from '@testing-library/react';
import App from '../App';

jest.mock('../pages/Home', () => () => <div>HomePage</div>);
jest.mock('../pages/Login', () => () => <div>LoginPage</div>);
jest.mock('../pages/Register', () => () => <div>RegisterPage</div>);
jest.mock('../pages/Dashboard', () => () => <div>DashboardPage</div>);
jest.mock('../pages/MyAccount', () => () => <div>AccountPage</div>);
jest.mock('../pages/Admin', () => () => <div>AdminPage</div>);
jest.mock('../pages/Upgrade', () => () => <div>UpgradePage</div>);
jest.mock('../pages/NotFound', () => () => <div>NotFoundPage</div>);

describe('App routes', () => {
  it('renders home by default', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getByText('HomePage')).toBeInTheDocument();
  });

  it('renders login route', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
  });

  it('renders not found', () => {
    window.history.pushState({}, '', '/unknown');
    render(<App />);
    expect(screen.getByText('NotFoundPage')).toBeInTheDocument();
  });
});

