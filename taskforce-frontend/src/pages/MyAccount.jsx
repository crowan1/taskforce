import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../compenents/includes/header";
import Footer from "../compenents/includes/footer";
import ProfileInfo from "../compenents/myAccount/ProfileInfo";
import UserSkillsManager from "../compenents/myAccount/UserSkillsManager";
import UserTasksManager from "../compenents/myAccount/UserTasksManager";
import profileService from '../services/profil/profileService';
import authService from '../services/authServices';
import stripeService from '../services/stripeService';
import '../assets/styles/compenents/MyAccount/MyAccount.scss';

const MyAccount = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const [userData, subscription] = await Promise.all([
                    profileService.getProfile(),
                    stripeService.getSubscriptionStatus().catch(() => ({ is_premium: false }))
                ]);
                setUser(userData);
                setSubscriptionStatus(subscription);
            } catch (err) {
                setError('Erreur lors du chargement du profil');
                console.error('Error fetching profile/subscription:', err);
            } finally {
                setLoading(false);
            }
        };

        const checkAuth = async () => {
            const isAuth = await authService.isAuthenticated();
            if (isAuth) {
                await fetchUserProfile();
            } else {
                navigate('/login');
            }
        };
        
        checkAuth();
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

                    <ProfileInfo user={user} onUpdate={handleProfileUpdate} subscriptionStatus={subscriptionStatus} />

                    <UserSkillsManager />

                    <UserTasksManager />

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
                            <div className="stat-item">
                                <span className="stat-label">Plan</span>
                                <span className="stat-value">
                                    {subscriptionStatus?.is_premium ? 'Premium' : 'Gratuit (2 projets max)'}
                                </span>
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