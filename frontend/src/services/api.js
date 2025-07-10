import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create an axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 20000, // 20 second timeout
    withCredentials: true, // Added for JWT cookies
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
        try {
            const response = await api.post('/api/auth/login', { email, password });
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
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

// MOCK: Intercept /api/ai/sentiment for local dev/demo
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