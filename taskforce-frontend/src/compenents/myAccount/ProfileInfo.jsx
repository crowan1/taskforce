import React, { useState } from 'react';
import '../../assets/styles/compenents/MyAccount/MyAccount.scss';
import profileService from '../../services/profil/profileService';
import stripeService from '../../services/stripeService';
import CancelPremiumModal from './CancelPremiumModal';

const ProfileInfo = ({ user, onUpdate, subscriptionStatus }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [editForm, setEditForm] = useState({
        email: user?.email || '',
        firstname: user?.firstname || '',
        lastname: user?.lastname || ''
    });

    const handleEdit = () => {
        setIsEditing(true);
        setEditForm({
            email: user?.email || '',
            firstname: user?.firstname || '',
            lastname: user?.lastname || ''
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            email: user?.email || '',
            firstname: user?.firstname || '',
            lastname: user?.lastname || ''
        });
    };

    const handleSave = async () => {
        try {
            const updatedUser = await profileService.updateProfile(editForm);
            onUpdate(updatedUser);
            setIsEditing(false);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
        } catch (err) {
            console.error('Erreur lors de la mise à jour du profil:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancelSubscription = async () => {
        try {
            try {
                await stripeService.syncSubscription();
            } catch (_) {}
            const result = await stripeService.cancelSubscription();
            
            if (result.success) {
                setShowCancelModal(false); 
                window.location.reload();
            } else {
                alert('Erreur lors de l\'annulation de l\'abonnement');
            }
        } catch (error) {
            console.error('Erreur lors de l\'annulation:', error);
            alert('Erreur lors de l\'annulation de l\'abonnement: ' + (error?.message || 'Inconnue'));
        }
    };

    const handleSyncNow = async () => {
        try {
            await stripeService.syncSubscription();
            window.location.reload();
        } catch (e) {
            alert('Impossible d\'actualiser l\'abonnement. Réessaie après quelques secondes.');
        }
    };

    return (
        <>
            <div className="profile-card">
                {showSuccessMessage && (
                    <div className="success-message">
                        ✅ Modifications enregistrées avec succès !
                    </div>
                )}
                <div className="profile-avatar">
                    <div className="avatar-placeholder">
                        {user?.firstname?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    {subscriptionStatus?.is_premium && (
                        <div className="premium-badge">
                            PREMIUM
                        </div>
                    )}
                </div>

                <div className="profile-info">
                    {!isEditing ? (
                        <div className="info-display">
                            <div className="info-group">
                                <label>Prénom</label>
                                <p>{user?.firstname ?? (editForm.firstname || 'Non renseigné')}</p>
                            </div>
                            <div className="info-group">
                                <label>Nom</label>
                                <p>{user?.lastname ?? (editForm.lastname || 'Non renseigné')}</p>
                            </div>
                            <div className="info-group">
                                <label>Email</label>
                                <p>{user?.email ?? (editForm.email || 'Non renseigné')}</p>
                            </div>
                            <div className="info-group">
                                <label>Membre depuis</label>
                                <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="info-edit">
                            <div className="form-group">
                                <label htmlFor="firstname">Prénom</label>
                                <input
                                    type="text"
                                    id="firstname"
                                    name="firstname"
                                    value={editForm.firstname}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastname">Nom</label>
                                <input
                                    type="text"
                                    id="lastname"
                                    name="lastname"
                                    value={editForm.lastname}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="profile-actions">
                    {!isEditing ? (
                        <>
                            <button className="btn-edit" onClick={handleEdit}>
                                Modifier le profil
                            </button>
                            {!subscriptionStatus?.is_premium ? (
                                <>
                                    <button 
                                        className="btn-premium" 
                                        onClick={() => window.location.href = '/upgrade'}
                                    >
                                        Devenir Premium
                                    </button>
                                    <button 
                                        className="btn-save" 
                                        onClick={handleSyncNow}
                                    >
                                        J'ai payé, actualiser
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className="btn-cancel-premium" 
                                    onClick={() => setShowCancelModal(true)}
                                >
                                    Arrêter d'être Premium
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button className="btn-save" onClick={handleSave}>
                                Enregistrer
                            </button>
                            <button className="btn-cancel" onClick={handleCancel}>
                                Annuler
                            </button>
                        </>
                    )}
                </div>
            </div>

            <CancelPremiumModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelSubscription}
            />
        </>
    );
};

export default ProfileInfo;
