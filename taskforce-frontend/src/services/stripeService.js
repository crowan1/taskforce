const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

class StripeService {
    async secureApiCall(url, options = {}) {
        const token = sessionStorage.getItem('token');

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            },
            ...options
        };

        const response = await fetch(url, defaultOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (response.status === 401) {
                sessionStorage.clear();
                window.location.href = '/login';
            }
            
            throw new Error(errorData.error || 'Erreur API');
        }

        return await response.json();
    }

    async createCheckoutSession() {
        try {
            return await this.secureApiCall(`${API_BASE_URL}/stripe/create-checkout-session`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Erreur Stripe Checkout:', error);
            throw error;
        }
    }
    async createPaymentIntent(amount = 999) {
        try {
            return await this.secureApiCall(`${API_BASE_URL}/stripe/create-payment-intent`, {
                method: 'POST',
                body: JSON.stringify({ amount })
            });
        } catch (error) {
            console.error('Erreur Stripe Payment Intent:', error);
            throw error;
        }
    }

    async createSubscription(paymentMethodId) {
        try {
            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
            const requestData = { 
                payment_method_id: paymentMethodId,
                user_id: user.id
            };
            
            return await this.secureApiCall(`${API_BASE_URL}/stripe/create-subscription`, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });
        } catch (error) {
            console.error('Erreur Stripe Subscription:', error);
            throw error;
        }
    }

    async getSubscriptionStatus() {
        try {
            return await this.secureApiCall(`${API_BASE_URL}/stripe/subscription-status`, {
                method: 'GET'
            });
        } catch (error) {
            console.error('Erreur Stripe Status:', error);
            throw error;
        }
    }

    async cancelSubscription() {
        try {
            return await this.secureApiCall(`${API_BASE_URL}/stripe/cancel-subscription`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Erreur Stripe Cancel:', error);
            throw error;
        }
    }

    async syncSubscription() {
        try {
            return await this.secureApiCall(`${API_BASE_URL}/stripe/sync-subscription`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Erreur Stripe Sync:', error);
            throw error;
        }
    }
}

export default new StripeService();
