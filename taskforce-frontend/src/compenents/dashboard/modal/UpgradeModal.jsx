import React from 'react';
import { useNavigate } from 'react-router-dom';

const UpgradeModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        onClose();
        navigate('/upgrade');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content upgrade-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🚀 Passez au Premium</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="upgrade-content">
                    <div className="upgrade-icon">
                        <span className="icon">💎</span>
                    </div>
                    
                    <div className="upgrade-message">
                        <h3>Limite de 2 projets atteinte !</h3>
                        <p>Vous avez atteint la limite de votre plan gratuit. Passez au plan Premium pour créer des projets illimités !</p>
                    </div>

                    <div className="premium-features">
                        <h4>Plan Premium - 2.00€/mois</h4>
                        <ul>
                            <li>✅ Projets illimités</li>
                            <li>✅ Fonctionnalités avancées</li>
                            <li>✅ Support prioritaire</li>
                            <li>✅ Rapports détaillés</li>
                        </ul>
                    </div>

                    <div className="modal-actions">
                        <button 
                            className="btn-secondary" 
                            onClick={onClose}
                        >
                            Plus tard
                        </button>
                        <button 
                            className="btn-primary" 
                            onClick={handleUpgrade}
                        >
                            Passer au Premium
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
