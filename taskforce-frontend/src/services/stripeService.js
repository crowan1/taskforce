const API_BASE_URL = 'http://localhost:8000/api';

class StripeService {
    async createPaymentIntent(amount = 999) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/stripe/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Request-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                },
                body: JSON.stringify({ amount })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création du paiement');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur Stripe:', error);
            throw error;
        }
    }

    async createSubscription(paymentMethodId) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const requestData = { 
                payment_method_id: paymentMethodId,
                user_id: user.id
            };
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/stripe/create-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Request-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de l\'abonnement');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur Stripe:', error);
            throw error;
        }
    }

    async getSubscriptionStatus() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/stripe/subscription-status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Request-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du statut');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur Stripe:', error);
            throw error;
        }
    }

    async cancelSubscription() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/stripe/cancel-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Request-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de l\'annulation de l\'abonnement');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur Stripe:', error);
            throw error;
        }
    }
}

export default new StripeService();
