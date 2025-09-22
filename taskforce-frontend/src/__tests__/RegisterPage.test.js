import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Register from '../pages/Register';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock('../services/authServices', () => {
  const register = jest.fn();
  return {
    __esModule: true,
    default: {
      register,
    },
  };
});

jest.mock('../compenents/includes/header', () => () => <div data-testid="header"/>);
jest.mock('../compenents/includes/footer', () => () => <div data-testid="footer"/>);

describe('Register (real component + service mocked)', () => {
  beforeEach(() => mockNavigate.mockClear());

  test('submit success navigates to /dashboard', async () => {
    const api = require('../services/authServices').default;
    api.register.mockResolvedValue({ id: 1 });

    const { getByPlaceholderText, getByText, container } = render(<Register />);

    fireEvent.change(container.querySelector('input[name="firstname"]'), { target: { value: 'John' } });
    fireEvent.change(container.querySelector('input[name="lastname"]'), { target: { value: 'Doe' } });
    fireEvent.change(getByPlaceholderText(/@/), { target: { value: 'john@example.com' } });
    fireEvent.change(container.querySelector('input[name="password"]'), { target: { value: 'password123' } });

    fireEvent.click(getByText('Créer mon compte'));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });

  test('submit error shows message', async () => {
    const api = require('../services/authServices').default;
    api.register.mockRejectedValue(new Error('bad'));

    const { getByPlaceholderText, getByText, findByText, container } = render(<Register />);

    fireEvent.change(container.querySelector('input[name="firstname"]'), { target: { value: 'John' } });
    fireEvent.change(container.querySelector('input[name="lastname"]'), { target: { value: 'Doe' } });
    fireEvent.change(getByPlaceholderText(/@/), { target: { value: 'john@example.com' } });
    fireEvent.change(container.querySelector('input[name="password"]'), { target: { value: 'short' } });

    fireEvent.click(getByText('Créer mon compte'));

    expect(await findByText("Erreur lors de l'inscription")).toBeTruthy();
  });

  test('link navigates to /login', () => {
    const { getByText } = render(<Register />);
    fireEvent.click(getByText('Se connecter'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});


