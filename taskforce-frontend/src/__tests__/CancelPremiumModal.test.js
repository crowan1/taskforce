import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CancelPremiumModal from '../compenents/myAccount/CancelPremiumModal';

describe('CancelPremiumModal - Vrai composant', () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders modal when isOpen is true', () => {
        render(<CancelPremiumModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        
        expect(screen.getByText('Annuler l\'abonnement Premium')).toBeInTheDocument();
        expect(screen.getByText('Êtes-vous sûr de vouloir arrêter votre abonnement Premium ?')).toBeInTheDocument();
        expect(screen.getByText('Vous perdrez l\'accès aux fonctionnalités Premium.')).toBeInTheDocument();
    });

    test('does not render modal when isOpen is false', () => {
        render(<CancelPremiumModal isOpen={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        
        expect(screen.queryByText('Annuler l\'abonnement Premium')).not.toBeInTheDocument();
    });

    test('calls onClose when close button is clicked', () => {
        render(<CancelPremiumModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        
        const closeButton = screen.getByText('×');
        fireEvent.click(closeButton);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when cancel button is clicked', () => {
        render(<CancelPremiumModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        
        const cancelButton = screen.getByText('Annuler');
        fireEvent.click(cancelButton);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onConfirm when confirm button is clicked', () => {
        render(<CancelPremiumModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        
        const confirmButton = screen.getByText('Oui, arrêter Premium');
        fireEvent.click(confirmButton);
        
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when overlay is clicked', () => {
        render(<CancelPremiumModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        
        const overlay = screen.getByText('Annuler l\'abonnement Premium').closest('.modal-overlay');
        fireEvent.click(overlay);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('does not call onClose when modal content is clicked', () => {
        render(<CancelPremiumModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        
        const modalContent = screen.getByText('Annuler l\'abonnement Premium').closest('.cancel-premium-modal');
        fireEvent.click(modalContent);
        
        expect(mockOnClose).not.toHaveBeenCalled();
    });
});
