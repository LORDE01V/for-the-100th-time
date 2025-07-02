import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create an axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 20000, // 20 second timeout
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
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
    async (error) => {
        if (error.response?.status === 401 && error.config && !error.config._retry) {
            error.config._retry = true;
            try {
                const refreshResponse = await api.post('/api/auth/refresh');
                const newToken = refreshResponse.data.token;
                localStorage.setItem('token', newToken);
                error.config.headers.Authorization = `Bearer ${newToken}`;
                return api(error.config);
            } catch (refreshError) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const auth = {
    login: async (email, password) => {
        const response = await api.post('/api/auth/login', { email, password });
        if (response.data.success) {
            const token = String(response.data.token).trim();
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
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

// Top-Up API calls
export const topUp = {
    process: async (payload) => {
        const response = await api.post('/api/topup', payload);
        return response.data;
    }
};

// Auto Top-Up API calls
export const autoTopUp = {
    getSettings: async () => {
        const response = await api.get('/api/auto-topup/settings');
        return response.data;
    },

    saveSettings: async (settings) => {
        const response = await api.post('/api/auto-topup/settings', settings);
        return response.data;
    }
};

// Mock sentiment analysis for local development
if (window.location.hostname === 'localhost') {
    const originalPost = api.post;
    api.post = async function (url, data, ...args) {
        if (url === '/api/ai/sentiment') {
            await new Promise(res => setTimeout(res, 800));
            const text = (data.text || '').toLowerCase();
            let tone = 'neutral';
            if (text.match(/happy|great|awesome|love|good|excellent/)) tone = 'positive';
            else if (text.match(/sad|bad|terrible|hate|angry|awful/)) tone = 'negative';
            return { data: { tone } };
        }
        return originalPost.call(this, url, data, ...args);
    };
}

export default api;