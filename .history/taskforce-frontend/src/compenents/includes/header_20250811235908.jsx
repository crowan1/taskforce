import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from "../../services/authServices";
import profileService from "../../services/profil/profileService";
import '../../assets/styles/compenents/includes/header.scss';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (authService.hasToken()) {
                    const userProfile = await authService.getProfile();
                    setIsAuthenticated(true);
                    setUser(userProfile);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                setIsAuthenticated(false);
                setUser(null);
            }
        };

        checkAuth();
    }, [location.pathname]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        navigate('/');
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-left">
                    <div className="logo" onClick={() => navigate('/')}>
                        <div className="logo-icon">
                            <svg viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                                <path d="M7 9h6M7 12h4M7 15h8" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <span className="logo-text">TaskForce</span>
                    </div>

                    <nav className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                        <button className="nav-link">Fonctionnalités</button>
                    </nav>
                </div>

                <div className="header-right">
                    {isAuthenticated ? (
                        <>
                            <button className="btn-login" onClick={() => navigate('/dashboard')}>
                                Mes Tableaux
                            </button>
                            <button className="btn-signup" onClick={() => navigate('/account')}>
                                Mon Compte
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn-login" onClick={() => navigate('/login')}>
                                Connexion
                            </button>
                            <button className="btn-signup" onClick={() => navigate('/register')}>
                                Créer un compte
                            </button>
                        </>
                    )}

                    <button className="mobile-menu-toggle" onClick={toggleMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;