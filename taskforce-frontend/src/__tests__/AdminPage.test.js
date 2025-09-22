import React from 'react';
import { render } from '@testing-library/react'; 
jest.mock('../services/authServices', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn().mockResolvedValue(true),
  }
}));
const Admin = require('../pages/Admin').default;

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock('../compenents/includes/header', () => () => <div data-testid="header"/>);
jest.mock('../compenents/includes/footer', () => () => <div data-testid="footer"/>);

describe('Admin (smoke)', () => {
  test('renders without crash', () => {
    const { container } = render(<Admin />);
    expect(container).toBeTruthy();
  });
});


