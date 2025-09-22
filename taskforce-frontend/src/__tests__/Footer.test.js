import React from 'react';
import { render } from '@testing-library/react';
import Footer from '../compenents/includes/footer';
 
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}), { virtual: true });

describe('Footer (real component)', () => {
  test('renders brand text and sections', () => {
    const { getByText, container } = render(<Footer />);
    expect(getByText('TaskForce')).toBeTruthy();
    expect(container.textContent).toContain('Produit');
    expect(container.textContent).toContain('Support');
    expect(container.textContent).toContain('Tous droits réservés');
  });

  test('renders social links', () => {
    const { container } = render(<Footer />);
    const links = container.querySelectorAll('.social-link');
    expect(links.length).toBeGreaterThan(0);
  });

  test('contains brand sentence', () => {
    const { container } = render(<Footer />);
    expect(container.textContent).toContain('Répartition intelligente des tâches');
  });

  test('has product and support sections', () => {
    const { getByText } = render(<Footer />);
    expect(getByText('Produit')).toBeTruthy();
    expect(getByText('Support')).toBeTruthy();
  });
});


