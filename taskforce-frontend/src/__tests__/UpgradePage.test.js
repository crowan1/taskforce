import React from 'react';
import { render, fireEvent } from '@testing-library/react'; 
jest.mock('../services/authServices', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn().mockResolvedValue(true),
  },
}));
const Upgrade = require('../pages/Upgrade').default;
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }), { virtual: true });
jest.mock('../compenents/includes/header', () => () => <div data-testid="header"/>);
jest.mock('../compenents/includes/footer', () => () => <div data-testid="footer"/>);
import UpgradeModal from '../compenents/dashboard/modal/UpgradeModal';

describe('Upgrade (real page)', () => {
  test('renders without crash (basic smoke)', () => {
    const { container } = render(<Upgrade />);
    expect(container).toBeTruthy();
  });
  
  test('UpgradeModal closed returns null', () => {
    const { container } = render(<UpgradeModal isOpen={false} onClose={() => {}} />);
    expect(container.textContent).toBe("");
  });
  
  test('UpgradeModal buttons trigger actions', () => {
    const onClose = jest.fn();
    const { getByText } = render(<UpgradeModal isOpen={true} onClose={onClose} />);
    fireEvent.click(getByText('Plus tard'));
    expect(onClose).toHaveBeenCalled();
    fireEvent.click(getByText('Passer au Premium'));
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(mockNavigate).toHaveBeenCalledWith('/upgrade');
  });
});


