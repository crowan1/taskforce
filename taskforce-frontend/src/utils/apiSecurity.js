export const SecurityUtils = {
    isValidJWT: (token) => {
        if (!token || typeof token !== 'string') return false;
        
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return false;
            
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            
            return payload.exp && payload.exp > now;
        } catch (error) {
            return false;
        }
    },

    validateEmail: (email) => {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validatePassword: (password) => {
        if (!password || password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        return true;
    },

    clearStorage: () => {
        sessionStorage.clear();
    }
};

export default SecurityUtils;

