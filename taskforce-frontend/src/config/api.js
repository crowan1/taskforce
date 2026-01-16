export const API_CONFIG = {
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: false,
    maxRetries: 2,
    retryDelay: 1000
};

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/login',
        REGISTER: '/register',
        LOGOUT: '/logout',
        REFRESH: '/refresh-token',
        PROFILE: '/user'
    },
    PROJECTS: '/projects',
    TASKS: '/tasks',
    COLUMNS: '/columns',
    SKILLS: '/skills',
    USERS: '/users'
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500
};

export default API_CONFIG;
