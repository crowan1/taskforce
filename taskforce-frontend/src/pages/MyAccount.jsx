import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../compenents/includes/header";
import Footer from "../compenents/includes/footer";
import ProfileInfo from "../compenents/myAccount/ProfileInfo";
import UserSkillsManager from "../compenents/myAccount/UserSkillsManager";
import profileService from '../services/profil/profileService';
import authService from '../services/authServices';
import '../assets/styles/compenents/MyAccount/MyAccount.scss';

const MyAccount = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const userData = await profileService.getProfile();
                setUser(userData);
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

    const handleProfileUpdate = (updatedUser) => {
        const normalized = updatedUser?.user ?? updatedUser;
        setUser((prev) => ({ ...prev, ...normalized }));
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

                    <ProfileInfo user={user} onUpdate={handleProfileUpdate} />

                    <UserSkillsManager />

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

                    <div className="logout-section">
                        <button className="btn-logout" onClick={handleLogout}>
                            Se déconnecter
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MyAccount;