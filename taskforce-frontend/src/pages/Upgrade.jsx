import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../compenents/includes/header';
import Footer from '../compenents/includes/footer';
import stripeService from '../services/stripeService';
import authService from '../services/authServices';
import '../assets/styles/Premium.scss';

const Upgrade = () => {
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await authService.isAuthenticated();
            if (!isAuth) {
                navigate('/login');
                return;
            }
            await fetchSubscriptionStatus();
        };
        
        checkAuth();
    }, [navigate]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            const sync = async () => {
                try {
                    await stripeService.syncSubscription();
                } catch (e) {
                }
                setSuccess(true);
                await fetchSubscriptionStatus();
                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);
            };
            sync();
        } else if (params.get('canceled') === 'true') {
            setError('Paiement annulé.');
        }
    }, [navigate]);

    const fetchSubscriptionStatus = async () => {
        try {
            const status = await stripeService.getSubscriptionStatus();
            setSubscriptionStatus(status);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (result) => {
        setSuccess(true);
        setTimeout(() => {
            navigate('/dashboard');
        }, 3000);
    };

    const handleError = (error) => {
        console.error('Erreur de paiement:', error);
    };

    const handleCheckout = () => {
        setError(null);
        const paymentLinkUrl = process.env.REACT_APP_STRIPE_PAYMENT_LINK_URL;
        if (!paymentLinkUrl) {
            setError('Définir REACT_APP_STRIPE_PAYMENT_LINK_URL.');
            return;
        }
        window.location.href = paymentLinkUrl;
    };

    if (loading) {
                return (
                    <div className="premium-container">
                        <Header />
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Chargement...</p>
                        </div>
                        <Footer />
                    </div>
                );
    }

    if (subscriptionStatus?.is_premium) {
        return (
            <div className="premium-container">
                <Header />
                <div className="already-premium">
                    <h1>✅ Vous êtes déjà Premium !</h1>
                    <p>Profitez de toutes les fonctionnalités TaskForce</p>
                    <button onClick={() => navigate('/dashboard')} className="btn-primary">
                        Retour au Dashboard
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    if (success) {
        return (
            <div className="premium-container">
                <Header />
                <div className="success-container">
                    <h1>🎉 Félicitations !</h1>
                    <p>Votre abonnement Premium est activé !</p>
                    <p>Vous allez être redirigé vers le dashboard...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="premium-container">
            <Header />
            <main className="premium-main">
                <div className="premium-content">
                    <div className="premium-header">
                        <h1>Premium</h1>
                        <p>10.00€ / mois</p>
                    </div>

                    <div className="payment-modal">
                        <div className="upgrade-content">
                            <div className="modal-header">
                                <h2>Paiement</h2>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <div className="payment-form-container" style={{ textAlign: 'center' }}>
                                <button onClick={handleCheckout} className="btn-pay">
                                    Passer au paiement sécurisé
                                </button>
                            </div>

                            <div className="security-info">
                                <p>Paiement sécurisé par Stripe</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Upgrade;
