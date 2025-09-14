import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Header from '../compenents/includes/header';
import Footer from '../compenents/includes/footer';
import stripeService from '../services/stripeService';
import authService from '../services/authServices';
import '../assets/styles/Premium.scss';

const stripePromise = loadStripe('pk_test_51S6AkoJUQKk2FvCnMDbFve7QqXDzOpDX0iK1S2nV8junCmZayRzeWIWZMb8EPpfGsChriTGJtSIXnNxivo8HZXLd00TaiPyKbi');

const CheckoutForm = ({ onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const cardElement = elements.getElement(CardElement);
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            const result = await stripeService.createSubscription(paymentMethod.id);
            
            if (result.subscription_id) {
                onSuccess(result);
            } else {
                setError('Erreur lors de la création de l\'abonnement');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <div className="card-input">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '14px',
                                color: '#000000',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                '::placeholder': {
                                    color: '#999999',
                                },
                            },
                            invalid: {
                                color: '#dc2626',
                            },
                        },
                        hidePostalCode: true,
                        disableLink: true,
                    }}
                />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button 
                type="submit" 
                disabled={!stripe || loading}
                className="btn-pay"
            >
                {loading ? 'Traitement...' : 'Payer 2.00€'}
            </button>
        </form>
    );
};

const Upgrade = () => {
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
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
                        <p>2.00€ / mois</p>
                    </div>

                    <div className="payment-modal">
                        <div className="upgrade-content">
                            <div className="modal-header">
                                <h2>Paiement</h2>
                            </div>

                                        <div className="payment-form-container">
                                            <Elements stripe={stripePromise}>
                                                <CheckoutForm 
                                                    onSuccess={handleSuccess}
                                                    onError={handleError}
                                                />
                                            </Elements>
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
