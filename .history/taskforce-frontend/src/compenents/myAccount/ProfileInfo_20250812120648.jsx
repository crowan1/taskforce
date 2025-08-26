import React, { useState } from 'react';
import '../../assets/styles/compenents/includes/MyAccount/MyAccount.scss';
import profileService from '../../services/profil/profileService';

const ProfileInfo = ({ user, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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

    return (
        <div className="profile-card">
            <div className="profile-avatar">
                <div className="avatar-placeholder">
                    {user?.firstname?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
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
                    <button className="btn-edit" onClick={handleEdit}>
                        Modifier le profil
                    </button>
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
    );
};

export default ProfileInfo;
