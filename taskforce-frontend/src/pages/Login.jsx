import React, { useState } from 'react';
import authService from "../services/authServices";
import { useNavigate } from "react-router-dom";
import '../assets/styles/Login.scss';
import Header from "../compenents/includes/header";
import Footer from "../compenents/includes/footer";
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const navigate = useNavigate();
    const { refreshAuth } = useAuth();

    const handleRegister = () => {
        navigate("/register");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authService.login(formData);
            await refreshAuth();
            navigate('/account');
        } catch (error) {
            console.error('Erreur de connexion:', error);
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header/>
            <div className="login-page">
                <div className="login-container">
                    <div className="login-form-text">

                        <div className="decorative-elements">
                            <div className="circle-1"></div>
                            <div className="circle-2"></div>
                            <div className="dot-1"></div>
                            <div className="dot-2"></div>
                            <div className="dot-3"></div>
                            <div className="dot-4"></div>
                            <div className="dot-5"></div>

                            <svg className="organic-shape-1" viewBox="0 0 100 100">
                                <path d="M20,30 Q40,10 60,30 Q80,50 60,70 Q40,90 20,70 Q0,50 20,30 Z"
                                      fill="currentColor"/>
                            </svg>
                            <svg className="organic-shape-2" viewBox="0 0 100 100">
                                <path d="M30,20 Q50,0 70,20 Q90,40 70,60 Q50,80 30,60 Q10,40 30,20 Z"
                                      fill="currentColor"/>
                            </svg>
                        </div>

                        <div className="welcome-content">
                            <div className="welcome-text">
                                <h1>Bon retour !</h1>
                                <p>Vous pouvez vous connecter avec votre compte existant</p>
                            </div>
                        </div>
                    </div>

                    <div className="login-form">
                        <div className="form-header">
                            <h2 className="login-title">Connexion</h2>
                        </div>

                        {error && (
                            <div className="error-message" role="alert" aria-live="polite">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="login-form-container">
                            <div className="input-group">
                                <label htmlFor="email" className="visually-hidden">Email</label>
                                <div className="input-wrapper">
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nom d'utilisateur ou email"
                                        className="form-input"
                                        aria-describedby="email-help"
                                        autoComplete="email"
                                    />
                                    <div className="input-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div id="email-help" className="visually-hidden">
                                    Saisissez votre adresse email
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="password" className="visually-hidden">Mot de passe</label>
                                <div className="input-wrapper">
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Mot de passe"
                                        className="form-input"
                                        aria-describedby="password-help"
                                        autoComplete="current-password"
                                    />
                                    <div className="input-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div id="password-help" className="visually-hidden">
                                    Saisissez votre mot de passe
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="login-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="loading-content">
                                        <svg className="spinner" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Connexion...
                                    </div>
                                ) : (
                                    'Se connecter'
                                )}
                            </button>
                        </form>

                        <p className="login-footer">
                            Nouveau ici ?{' '}
                            <button 
                                type="button"
                                className="link-button"
                                onClick={handleRegister}
                                aria-label="Créer un nouveau compte"
                            >
                                Créer un compte
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default Login;