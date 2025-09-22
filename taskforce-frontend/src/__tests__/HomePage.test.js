import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Home from '../pages/Home';
 
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });
 
jest.mock('../compenents/includes/header', () => () => <div data-testid="header"/>);
jest.mock('../compenents/includes/footer', () => () => <div data-testid="footer"/>);

describe('Home (real component)', () => {
  beforeEach(() => mockNavigate.mockClear());

  test('renders CTA and navigates to /register', () => {
    const { getByText } = render(<Home />);
    expect(getByText(/Organisez, gérez et optimisez/i)).toBeTruthy();
    const cta = getByText(/Inscrivez-vous, c'est gratuit/i);
    fireEvent.click(cta);
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
  
  test('renders header and footer', () => {
    const { getByTestId } = render(<Home />);
    expect(getByTestId('header')).toBeTruthy();
    expect(getByTestId('footer')).toBeTruthy();
  });

  test('contains privacy link text', () => {
    const { getByText } = render(<Home />);
    expect(getByText(/politique de confidentialité/i)).toBeTruthy();
  });
});


