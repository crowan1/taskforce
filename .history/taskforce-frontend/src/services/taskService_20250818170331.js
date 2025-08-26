const API_BASE_URL = 'http://localhost:8000/api';

const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

export const taskService = {
    // Récupérer toutes les tâches d'un projet
    getTasks: async (projectId) => {
        const url = projectId 
            ? `${API_BASE_URL}/tasks?projectId=${projectId}`
            : `${API_BASE_URL}/tasks`;
        return apiCall(url);
    },

    // Créer une nouvelle tâche
    createTask: async (taskData) => {
        return apiCall(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    },

    // Mettre à jour une tâche
    updateTask: async (taskId, taskData) => {
        return apiCall(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
    },

    // Supprimer une tâche
    deleteTask: async (taskId) => {
        return apiCall(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
    },

    // Ajouter des compétences à une tâche
    addSkillsToTask: async (taskId, skillIds) => {
        return apiCall(`${API_BASE_URL}/tasks/${taskId}/add-skills`, {
            method: 'POST',
            body: JSON.stringify({ skillIds })
        });
    }
};
