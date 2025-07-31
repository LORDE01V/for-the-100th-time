/* global process */
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "https://backened-h577.onrender.com";

// Create an axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 10-second timeout
    withCredentials: true, // Include cookies in requests
    xsrfCookieName: 'csrftoken',  // Add CSRF protection
    xsrfHeaderName: 'X-CSRFToken'
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

// Add a response interceptor to handle common errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle connection timeout and server unavailable
        if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('Connection timeout. Please check your internet'));
        }
        if (!error.response) {
            return Promise.reject(new Error('Server unavailable. Please try again later'));
        }
        // Handle 401 and try refresh
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
            const response = await api.post('/fastapi/auth/login', {
                email: email.toLowerCase().trim(),
                password
            });
            if (response.data.success) {
                // Store token
                if (response.data.access_token) {
                    localStorage.setItem('token', response.data.access_token);
                } else if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
                // Always fetch user from backend after login
                let user = null;
                try {
                    const userResp = await api.get('/api/auth/user');
                    user = userResp.data.user;
                } catch (e) {
                    // fallback to response.data.user if present
                    user = response.data.user || null;
                }
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                } else {
                    localStorage.removeItem('user');
                }
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
            const response = await api.post('https://backened-h577.onrender.com/api/auth/register', userData);
            if (response.data.success) {
                if (response.data.access_token) {
                    localStorage.setItem('token', response.data.access_token);
                } else if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
            }
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

// AI Suggestions fetcher
export const fetchAISuggestions = async () => {
    try {
        const response = await api.get('/api/ai-suggestions', {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching AI suggestions:', error);
        return { success: false };
    }
};

export default api;