import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            try {
                const publicPaths = ['/login', '/register', '/', '/home'];
                const currentPath = window.location.pathname || '';
                const isPublic = publicPaths.some((p) => currentPath.includes(p));
                if (!isPublic) {
                    window.location.replace('/login');
                }
            } catch (_) {
            }
        }
        return Promise.reject(error);
    }
);

const profileService = {
    getProfile: async () => {
        try {
            const response = await api.get('/user');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateProfile: async (userData) => {
        try {
            const response = await api.put('/user', userData);
            return response.data?.user ?? response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default profileService;
