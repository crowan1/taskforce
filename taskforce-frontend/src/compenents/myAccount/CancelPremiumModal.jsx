import React from 'react';
import '../../assets/styles/compenents/MyAccount/MyAccount.scss';

const CancelPremiumModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="cancel-premium-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Annuler l'abonnement Premium</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                
                <div className="modal-body">
                    <p>Êtes-vous sûr de vouloir arrêter votre abonnement Premium ?</p>
                    <p className="warning-text">Vous perdrez l'accès aux fonctionnalités Premium.</p>
                </div>
                
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Annuler
                    </button>
                    <button className="btn-confirm" onClick={onConfirm}>
                        Oui, arrêter Premium
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelPremiumModal;
