import React, { useState } from 'react';
import '../assets/styles/Register.scss';
import { useNavigate } from 'react-router-dom';
import authService from "../services/authServices";
import Header from "../compenents/includes/header";
import Footer from "../compenents/includes/footer";

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstname: '',
        lastname: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await authService.register(formData);
            setFormData({
                email: '',
                password: '',
                firstname: '',
                lastname: ''
            });
            navigate("/dashboard");
        } catch (error) {
            setError('Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <Header />
            <div className="register-container">
            <div className="welcome-section">
                <div className="decorative-elements">
                    <div className="circle-1"></div>
                    <div className="circle-2"></div>
                    <div className="dot-1"></div>
                    <div className="dot-2"></div>
                    <div className="dot-3"></div>

                    <svg className="organic-shape-1" viewBox="0 0 100 100">
                        <path d="M20,30 Q40,10 60,30 Q80,50 60,70 Q40,90 20,70 Q0,50 20,30 Z" fill="currentColor"/>
                    </svg>
                    <svg className="organic-shape-2" viewBox="0 0 100 100">
                        <path d="M30,20 Q50,0 70,20 Q90,40 70,60 Q50,80 30,60 Q10,40 30,20 Z" fill="currentColor"/>
                    </svg>
                </div>

                <div className="welcome-content">
                    <h1>Rejoignez TaskForce !</h1>
                    <p>
                        Créez votre compte et commencez à organiser vos projets
                        de manière efficace avec notre plateforme de gestion de tâches.
                    </p>
                </div>
            </div>

            <div className="form-section">
                <div className="form-container">
                    <div className="form-header">
                        <h2>Créer un compte</h2>
                        <p>Remplissez vos informations pour commencer</p>
                    </div>

                    {error && (
                        <div className="alert error">
                            {error}
                            <button
                                type="button"
                                onClick={() => setError('')}
                                style={{
                                    float: 'right',
                                    background: 'none',
                                    border: 'none',
                                    color: '#991b1b',
                                    cursor: 'pointer'
                                }}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="alert success">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Prénom</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        name="firstname"
                                        value={formData.firstname}
                                        onChange={handleChange}
                                        placeholder="Votre prénom"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Nom</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        name="lastname"
                                        value={formData.lastname}
                                        onChange={handleChange}
                                        placeholder="Votre nom"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Adresse email</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="votre@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Mot de passe</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Créez un mot de passe sécurisé"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="loading-content">
                                    <svg className="spinner" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Création du compte...
                                </div>
                            ) : (
                                <div>
                                    Créer mon compte
                                </div>
                            )}
                        </button>

                        <div className="login-link">
                            Déjà un compte ?{' '}
                            <span
                                className="link"
                                onClick={() => navigate('/login')}
                            >
                                Se connecter
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <Footer />
        </div>
    
    );
};

export default Register;