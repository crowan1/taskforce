import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../compenents/includes/header";
import Footer from "../compenents/includes/footer";
import authService from '../services/authServices';
import '../assets/styles/compenents/includes/MyAccount/';

const MyAccount = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const userData = await authService.getProfile();
                setUser(userData);
                setEditForm({
                    email: userData.email || '',
                    firstname: userData.firstname || '',
                    lastname: userData.lastname || ''
                });
            } catch (err) {
                setError('Erreur lors du chargement du profil');
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        if (authService.hasToken()) {
            fetchUserProfile();
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            email: user.email || '',
            firstname: user.firstname || '',
            lastname: user.lastname || ''
        });
    };

    const handleSave = async () => {
        try {
            // Ici vous pouvez ajouter une méthode pour mettre à jour le profil
            // const updatedUser = await authService.updateProfile(editForm);
            // setUser(updatedUser);
            setIsEditing(false);
            // Pour l'instant, on simule la mise à jour
            setUser({ ...user, ...editForm });
        } catch (err) {
            setError('Erreur lors de la mise à jour du profil');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="my-account-container">
                <Header />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Chargement de votre profil...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-account-container">
                <Header />
                <div className="error-container">
                    <h2>Erreur</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Réessayer</button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="my-account-container">
            <Header />
            <main className="my-account-main">
                <div className="my-account-content">
                    <div className="profile-header">
                        <h1>Mon Compte</h1>
                        <p>Gérez vos informations personnelles</p>
                    </div>

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
                                        <p>{user?.firstname || 'Non renseigné'}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Nom</label>
                                        <p>{user?.lastname || 'Non renseigné'}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Email</label>
                                        <p>{user?.email || 'Non renseigné'}</p>
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
                                    <button className="btn-logout" onClick={handleLogout}>
                                        Se déconnecter
                                    </button>
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

                    <div className="account-stats">
                        <div className="stat-card">
                            <h3>Informations du compte</h3>
                            <div className="stat-item">
                                <span className="stat-label">Dernière mise à jour</span>
                                <span className="stat-value">{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR') : 'Non disponible'}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Rôle</span>
                                <span className="stat-value">{user?.roles?.includes('ROLE_ADMIN') ? 'Administrateur' : 'Utilisateur'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MyAccount;