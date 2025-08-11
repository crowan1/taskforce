import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
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
        }
        return Promise.reject(error);
    }
);

const profileService = {
    // Récupérer le profil de l'utilisateur connecté
    getProfile: async () => {
        try {
            const response = await api.get('/user');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mettre à jour le profil de l'utilisateur
    updateProfile: async (userData) => {
        try {
            const response = await api.put('/user', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Changer le mot de passe (pour une future fonctionnalité)
    changePassword: async (passwordData) => {
        try {
            const response = await api.put('/user/password', passwordData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Supprimer le compte (pour une future fonctionnalité)
    deleteAccount: async () => {
        try {
            const response = await api.delete('/user');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },


    uploadProfilePicture: async (file) => {
        try {
            const formData = new FormData();
            formData.append('profile_picture', file);
            
            const response = await api.post('/user/profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default profileService;
