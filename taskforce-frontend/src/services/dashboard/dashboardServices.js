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
        console.error('API Error:', {
            url,
            status: response.status,
            errorData,
            body: options.body
        });
        
        const error = new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.errorData = errorData;
        throw error;
    }
    
    return response.json();
};

export const dashboardServices = {
    getProjects: async () => {
        return apiCall(`${API_BASE_URL}/projects`);
    },

    createProject: async (projectData) => {
        return apiCall(`${API_BASE_URL}/projects`, {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    },

    updateProject: async (projectId, projectData) => {
        return apiCall(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(projectData)
        });
    },

    deleteProject: async (projectId) => {
        return apiCall(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'DELETE'
        });
    },

    addUserToProject: async (projectId, email, role = 'member') => {
        return apiCall(`${API_BASE_URL}/projects/${projectId}/add-user`, {
            method: 'POST',
            body: JSON.stringify({ email, role })
        });
    },

    updateUserRole: async (projectId, userId, role) => {
        return apiCall(`${API_BASE_URL}/projects/${projectId}/update-user-role`, {
            method: 'PUT',
            body: JSON.stringify({ userId, role })
        });
    },

    removeUserFromProject: async (projectId, userId) => {
        return apiCall(`${API_BASE_URL}/projects/${projectId}/remove-user`, {
            method: 'DELETE',
            body: JSON.stringify({ userId })
        });
    },

    // =tâches
    getTasks: async (projectId) => {
        const url = projectId 
            ? `${API_BASE_URL}/tasks?projectId=${projectId}`
            : `${API_BASE_URL}/tasks`;
        return apiCall(url);
    },

    createTask: async (taskData) => {
        return apiCall(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    },

    updateTask: async (taskId, taskData) => {
        return apiCall(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
    },

    deleteTask: async (taskId) => {
        return apiCall(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
    },

    uploadTaskImage: async (taskId, imageFile) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/upload-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    deleteTaskImage: async (taskId, imagePath) => {
        return apiCall(`${API_BASE_URL}/tasks/${taskId}/delete-image`, {
            method: 'DELETE',
            body: JSON.stringify({ imagePath })
        });
    },

    addSkillsToTask: async (taskId, skillIds) => {
        return apiCall(`${API_BASE_URL}/tasks/${taskId}/add-skills`, {
            method: 'POST',
            body: JSON.stringify({ skillIds })
        });
    },

    assignTaskAutomatically: async (taskId) => {
        return apiCall(`${API_BASE_URL}/tasks/${taskId}/assign`, {
            method: 'POST'
        });
    },

    assignAllProjectTasks: async (projectId) => {
        return apiCall(`${API_BASE_URL}/tasks/project/${projectId}/assign-all`, {
            method: 'POST'
        });
    },

    getProjectWorkload: async (projectId) => {
        return apiCall(`${API_BASE_URL}/tasks/project/${projectId}/workload`);
    },

    // COlonnes
    getColumns: async (projectId) => {
        return apiCall(`${API_BASE_URL}/columns?projectId=${projectId}`);
    },

    createColumn: async (columnData) => {
        return apiCall(`${API_BASE_URL}/columns`, {
            method: 'POST',
            body: JSON.stringify(columnData)
        });
    },

    updateColumn: async (columnId, columnData) => {
        return apiCall(`${API_BASE_URL}/columns/${columnId}`, {
            method: 'PUT',
            body: JSON.stringify(columnData)
        });
    },

    deleteColumn: async (columnId) => {
        return apiCall(`${API_BASE_URL}/columns/${columnId}`, {
            method: 'DELETE'
        });
    },

    // compétences
    getSkills: async () => {
        return apiCall(`${API_BASE_URL}/skills`);
    },

    createSkill: async (skillData) => {
        return apiCall(`${API_BASE_URL}/skills`, {
            method: 'POST',
            body: JSON.stringify(skillData)
        });
    },

    updateSkill: async (skillId, skillData) => {
        return apiCall(`${API_BASE_URL}/skills/${skillId}`, {
            method: 'PUT',
            body: JSON.stringify(skillData)
        });
    },

    deleteSkill: async (skillId) => {
        return apiCall(`${API_BASE_URL}/skills/${skillId}`, {
            method: 'DELETE'
        });
    },

    // utilisateurs
    getUsers: async () => {
        return apiCall(`${API_BASE_URL}/users`);
    },

    getAllUsers: async () => {
        return apiCall(`${API_BASE_URL}/users`);
    },

    getProjectUsers: async (projectId) => {
        return apiCall(`${API_BASE_URL}/projects/${projectId}/users`);
    },

    getProfile: async () => {
        return apiCall(`${API_BASE_URL}/user`);
    },

    // compétences utilisateur
    getUserSkills: async () => {
        return apiCall(`${API_BASE_URL}/user-skills`);
    },

    getUserSkillsByUserId: async (userId) => {
        return apiCall(`${API_BASE_URL}/users/${userId}/skills`);
    },

    addUserSkill: async (skillData) => {
        return apiCall(`${API_BASE_URL}/user-skills`, {
            method: 'POST',
            body: JSON.stringify(skillData)
        });
    },

    updateUserSkill: async (userSkillId, skillData) => {
        return apiCall(`${API_BASE_URL}/user-skills/${userSkillId}`, {
            method: 'PUT',
            body: JSON.stringify(skillData)
        });
    },

    deleteUserSkill: async (skillId) => {
        return apiCall(`${API_BASE_URL}/user-skills/skill/${skillId}`, {
            method: 'DELETE'
        });
    },

    getProjectUserSkills: async (projectId) => {
        return apiCall(`${API_BASE_URL}/projects/${projectId}/skills/users`);
    },

    getAllAvailableProjectSkills: async (projectId) => {
        return apiCall(`${API_BASE_URL}/projects/${projectId}/skills/available`);
    },

    createProjectSkill: async (projectId, skillData) => {
        return apiCall(`${API_BASE_URL}/projects/${projectId}/skills`, {
            method: 'POST',
            body: JSON.stringify(skillData)
        });
    },

    deleteProjectSkill: async (skillId) => {
        return apiCall(`${API_BASE_URL}/projects/skills/${skillId}`, {
            method: 'DELETE'
        });
    }
};
