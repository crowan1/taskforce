import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import NotFound from '../pages/NotFound';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock('../compenents/includes/header', () => () => <div data-testid="header"/>);
jest.mock('../compenents/includes/footer', () => () => <div data-testid="footer"/>);

describe('NotFound (real component)', () => {
  beforeEach(() => mockNavigate.mockClear());

  test('renders 404 and actions', () => {
    const { getByText } = render(<NotFound />);
    expect(getByText('404')).toBeTruthy();
    expect(getByText('Page non trouvée')).toBeTruthy();
  });

  test('buttons navigate', () => {
    const { getByText } = render(<NotFound />);
    fireEvent.click(getByText("Retour à l'accueil"));
    expect(mockNavigate).toHaveBeenCalledWith('/');
    fireEvent.click(getByText('Page précédente'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});


