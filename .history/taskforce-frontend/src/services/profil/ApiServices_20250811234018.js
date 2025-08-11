
    updateProfile: async (userData) => {
        try {
            const response = await api.put('/user', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },