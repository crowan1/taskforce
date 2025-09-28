import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../assets/styles/compenents/includes/header.scss';
import logo from '../../assets/icons/Icon_TF.png';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);


    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        try { logout(); } catch (_) {}
        navigate('/');
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-left">
                    <div className="logo" onClick={() => navigate('/')}>
                        <div className="logo-icon">
                            <img src={logo} alt="TaskForce" />
                        </div>
                        <span className="logo-text">TaskForce</span>
                    </div>

                    <nav className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                    </nav>
                </div>

                <div className="header-right">
                    {isAuthenticated ? (
                        <>
                            <button className="btn-login" onClick={() => navigate('/dashboard')}>
                                Mes Tableaux
                            </button>
                            <button className="btn-admin" onClick={() => navigate('/admin')}>
                                Admin
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

                    <button 
                        className="mobile-menu-toggle" 
                        onClick={toggleMenu}
                        aria-label="Toggle mobile menu"
                        aria-expanded={isMenuOpen}
                    >
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