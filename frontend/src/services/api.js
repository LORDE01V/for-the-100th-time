import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Add a request interceptor to add the auth token to requests
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

// Add a response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear local storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API calls with improved error handling
export const auth = {
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to connect to the server');
        }
    },

    register: async (name, email, password) => {
        try {
            const response = await api.post('/auth/register', { name, email, password });
            return response.data;
        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to connect to the server');
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return response.json();
};

export default api;
