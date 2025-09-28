import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});
const SecurityUtils = {
    isValidJWT: (token) => {
        if (!token || typeof token !== 'string') return false;
        
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return false;
            
            const header = JSON.parse(atob(parts[0]));
            if (!header.alg || !header.typ) return false;
            
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            
            return payload.exp && payload.exp > now;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    },

    clearStorage: () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.clear();
        
        document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
    },

    sanitizeUserData: (userData) => {
        if (!userData || typeof userData !== 'object') return null;
        
        return {
            id: userData.id,
            email: userData.email,
            firstname: userData.firstname?.trim(),
            lastname: userData.lastname?.trim(),
            role: userData.role,
        };
    },

    createRateLimiter: (maxRequests = 5, windowMs = 600000) => {
        const requests = new Map();
        
        return (key) => {
            const now = Date.now();
            const windowStart = now - windowMs;
            
            if (!requests.has(key)) {
                requests.set(key, []);
            }
            
            const userRequests = requests.get(key).filter(time => time > windowStart);
            
            if (userRequests.length >= maxRequests) {
                throw new Error('Trop de tentatives, veuillez patienter');
            }
            
            userRequests.push(now);
            requests.set(key, userRequests);
        };
    }
};

const loginRateLimiter = SecurityUtils.createRateLimiter(5, 300000);

api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        
        if (token) {
            if (SecurityUtils.isValidJWT(token)) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.warn('Token invalide détecté, nettoyage...');
                SecurityUtils.clearStorage();
            }
        }
        
        config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        return config;
    },
    (error) => {
        console.error('Erreur intercepteur requête:', error);
        return Promise.reject(error);
    }
);
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const config = error.config;
        
        switch (status) {
            case 401:
                console.warn('Token expiré ou invalide');
                SecurityUtils.clearStorage();
                 
                const publicPaths = ['/login', '/register', '/', '/home'];
                const currentPath = window.location.pathname;
                
                if (!publicPaths.some(path => currentPath.includes(path))) {
                    sessionStorage.setItem('returnUrl', currentPath);
                    window.location.replace('/login');
                }
                break;
                
            case 403:
                console.error('Accès refusé:', error.response.data);
                break;
                
            case 429:
                console.warn('Rate limit atteint');
                break;
                
            case 422:
                console.error('Données invalides:', error.response.data);
                break;
                
            default:
                if (status >= 500) {
                    console.error('Erreur serveur:', error.response?.data);
                }
        }
        
        return Promise.reject(error);
    }
);
const authService = {
    register: async (userData) => {
        try {
            if (!userData.email || !userData.password || !userData.firstname || !userData.lastname) {
                throw new Error('Tous les champs sont requis');
            }
            
            if (userData.password.length < 8) {
                throw new Error('Le mot de passe doit contenir au moins 8 caractères');
            }
            
            if (!/[A-Z]/.test(userData.password)) {
                throw new Error('Le mot de passe doit contenir au moins une majuscule');
            }
            
            if (!/[0-9]/.test(userData.password)) {
                throw new Error('Le mot de passe doit contenir au moins un chiffre');
            }
            
            const sanitizedData = {
                email: userData.email.trim().toLowerCase(),
                password: userData.password,
                firstname: userData.firstname.trim(),
                lastname: userData.lastname.trim()
            };
            
            const response = await api.post('/register', sanitizedData);
            return response.data;
        } catch (error) {
            console.error('Erreur inscription:', error);
            throw error.response?.data || { message: error.message };
        }
    },

    login: async (credentials) => {
        try {
            if (!credentials.email || !credentials.password) {
                throw new Error('Email et mot de passe requis');
            }
            
            loginRateLimiter(credentials.email);
            
            const loginData = {
                username: credentials.email.trim().toLowerCase(),
                password: credentials.password
            };
            
            const response = await api.post('/login', loginData);
            const { token, user, refreshToken } = response.data;
            
            if (!token || !SecurityUtils.isValidJWT(token)) {
                throw new Error('Token invalide reçu du serveur');
            }
            
            sessionStorage.setItem('token', token);
            
            if (refreshToken && SecurityUtils.isValidJWT(refreshToken)) {
                sessionStorage.setItem('refreshToken', refreshToken);
            }
            
            if (user) {
                const sanitizedUser = SecurityUtils.sanitizeUserData(user);
                if (sanitizedUser) {
                    sessionStorage.setItem('user', JSON.stringify(sanitizedUser));
                }
            }
            
            return response.data;
        } catch (error) {
            console.error('Erreur connexion:', error);
            throw error.response?.data || { message: error.message };
        }
    },

    logout: async () => {
        try {
            const token = sessionStorage.getItem('token');
            
            if (token && SecurityUtils.isValidJWT(token)) {
                await api.post('/logout');
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion serveur:', error);
        } finally {
            SecurityUtils.clearStorage();
            window.location.replace('/login');
        }
    },

    hasToken: () => {
        const token = sessionStorage.getItem('token');
        return token && SecurityUtils.isValidJWT(token);
    },

    isAuthenticated: async () => {
        const token = sessionStorage.getItem('token');
        
        if (!token || !SecurityUtils.isValidJWT(token)) {
            SecurityUtils.clearStorage();
            return false;
        }

        try {
            const response = await api.get('/user');
            
            if (response.data && response.data.id) {
                return true;
            } else {
                throw new Error('Réponse utilisateur invalide');
            }
        } catch (error) {
            console.warn('Vérification authentification échouée:', error.message);
            SecurityUtils.clearStorage();
            return false;
        }
    },

    getToken: () => {
        const token = sessionStorage.getItem('token');
        return SecurityUtils.isValidJWT(token) ? token : null;
    },

    refreshToken: async () => {
        try {
            const refreshToken = sessionStorage.getItem('refreshToken');
            
            if (!refreshToken || !SecurityUtils.isValidJWT(refreshToken)) {
                throw new Error('Refresh token invalide');
            }
            
            const response = await api.post('/refresh-token', { refreshToken });
            const { token: newToken } = response.data;
            
            if (!SecurityUtils.isValidJWT(newToken)) {
                throw new Error('Nouveau token invalide');
            }
            
            sessionStorage.setItem('token', newToken);
            return newToken;
        } catch (error) {
            console.error('Erreur refresh token:', error);
            SecurityUtils.clearStorage();
            throw error;
        }
    },

    getCurrentUser: () => {
        try {
            const userStr = sessionStorage.getItem('user');
            if (!userStr) return null;
            
            const user = JSON.parse(userStr);
            return SecurityUtils.sanitizeUserData(user);
        } catch (error) {
            console.error('Erreur parsing utilisateur:', error);
            sessionStorage.removeItem('user');
            return null;
        }
    },

    canAccessAdmin: (userRole) => {
        return userRole && (userRole === 'manager' || userRole === 'responsable_projet');
    },

    canModifyTasks: (userRole) => {
        return userRole === 'responsable_projet';
    },

    canManageUsers: (userRole) => {
        return userRole === 'responsable_projet';
    },

    canManageProject: (userRole) => {
        return userRole === 'responsable_projet';
    },

    isManager: (userRole) => {
        return userRole === 'manager';
    },

    isResponsableProjet: (userRole) => {
        return userRole === 'responsable_projet';
    },

    isCollaborateur: (userRole) => {
        return userRole === 'collaborateur';
    },

    canAccessAdminGlobally: (projects, userId) => {
        if (!projects || !Array.isArray(projects) || !userId) return false;
        
        return projects.some(project => {
            const userRole = authService.getUserRoleInProject(project, userId);
            return userRole === 'manager' || userRole === 'responsable_projet';
        });
    },

    getAdminAccessibleProjects: (projects, userId) => {
        if (!projects || !Array.isArray(projects) || !userId) return [];
        
        return projects.filter(project => {
            const userRole = authService.getUserRoleInProject(project, userId);
            return userRole === 'manager' || userRole === 'responsable_projet';
        });
    },

    getUserRoleInProject: (project, userId) => {
        if (!project || !project.users || !userId) return null;
        const userInProject = project.users.find(u => u.id === userId);
        return userInProject?.role || null;
    },

    getCurrentUserRole: () => {
        return sessionStorage.getItem('currentUserRole');
    },

    setCurrentUserRole: (role) => {
        if (role) {
            sessionStorage.setItem('currentUserRole', role);
        } else {
            sessionStorage.removeItem('currentUserRole');
        }
    },

    validatePassword: (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        const errors = [];
        
        if (password.length < minLength) {
            errors.push(`Au moins ${minLength} caractères`);
        }
        if (!hasUpperCase) {
            errors.push('Une majuscule');
        }
        if (!hasLowerCase) {
            errors.push('Une minuscule');
        }
        if (!hasNumbers) {
            errors.push('Un chiffre');
        }
        if (!hasSpecialChar) {
            errors.push('Un caractère spécial');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            strength: errors.length === 0 ? 'Fort' : 
                     errors.length <= 2 ? 'Moyen' : 'Faible'
        };
    }
};

export default authService;