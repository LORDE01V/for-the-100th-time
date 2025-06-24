import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create an axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 20000, // 20 second timeout
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Ensure token is properly formatted
            config.headers.Authorization = `Bearer ${token.trim()}`;
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
        console.error('API Error:', error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error data:', error.response.data);
            console.error('Error status:', error.response.status);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
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
            const response = await api.post('/api/auth/login', { email, password });
            if (response.data.success) {
                const token = String(response.data.token).trim();
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                // Removed redirection to let the component handle navigation
                // window.location.href = '/dashboard';
            }
            return response.data;
        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to connect to the server');
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/api/auth/register', {
                name: userData.name,
                username: userData.username,
                email: userData.email,
                password: userData.password,
                phone: userData.phone  // Changed from phone_number to phone
            });
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
    },

    getToken: () => {
        const token = localStorage.getItem('token');
        return token ? String(token).trim() : null;
    }
};

export const autoTopUp = {
    getSettings: async () => {
        try {
            const response = await api.get('/api/auto-topup/settings');
            return response.data;
        } catch (error) {
            throw new Error('Failed to get auto top-up settings');
        }
    },
    saveSettings: async (settings) => {
        try {
            const response = await api.post('/api/auto-topup/settings', settings);
            return response.data;
        } catch (error) {
            throw new Error('Failed to save auto top-up settings');
        }
    },
};

export const topUp = {
    process: async (data) => {
        try {
            const response = await api.post('/api/topup/process', data);
            return response.data;
        } catch (error) {
            throw new Error('Failed to process top-up');
        }
    },
};

export default api;
