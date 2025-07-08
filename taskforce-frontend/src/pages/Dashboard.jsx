import React, { useState, useEffect } from 'react';
import authService from "../services/authServices";
import { useNavigate } from "react-router-dom";
import '../assets/styles/Dashboard.scss';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                if (!authService.isAuthenticated()) {
                    navigate('/login');
                    return;
                }

                const userData = await authService.getProfile();
                setUser(userData);

            } catch (error) {
                console.error('Erreur lors du chargement des donnéess utilisateur:', error);
                setError('Ereur lors du chargement des données');

                if (error.status === 401 || error.message?.includes('401')) {
                    authService.logout();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <svg viewBox="0 0 24 24">
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="opacity-25"
                        ></circle>
                        <path
                            fill="currentColor"
                            className="opacity-75"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                </div>
                <div className="loading-text">⏳ Chargement...</div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="error-container">
                <div className="error-icon">❌</div>
                <div className="error-message">{error}</div>
                <button
                    onClick={() => navigate('/login')}
                    className="error-button"
                >
                    Retour à la connexion
                </button>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="dashboard-container">
            {/* Header avec utilisateur connecté */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1 className="header-title">Dashboard</h1>
                </div>

                <div className="user-section">
                    <div className="user-card">
                        <div className="user-avatar">
                            {((user?.firstname || user?.name || 'U').charAt(0) + (user?.lastname || '').charAt(0)).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">
                                {user?.firstname || user?.name || 'Utilisateur'} {user?.lastname || ''}
                            </div>
                            <div className="user-email">
                                {user?.email}
                            </div>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="logout-button">
                        Déconnexion
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;