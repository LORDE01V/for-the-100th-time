import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
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
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                const token = String(response.data.token).trim();
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
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
            throw error;
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

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return response.json();
};

// Add these new API endpoints
export const expenses = {
    // Get all expenses for the current user
    getAll: async () => {
        try {
            const response = await api.get('/expenses');
            return response.data;
        } catch (error) {
            console.error('Error in expenses.getAll:', error);
            throw error;
        }
    },

    // Add a new expense
    create: async (expenseData) => {
        try {
            const response = await api.post('/expenses', expenseData);
            return response.data;
        } catch (error) {
            console.error('Error in expenses.create:', error);
            throw error;
        }
    }
};

export const topUp = {
    // Process a top-up transaction
    process: async (topUpData) => {
        try {
            console.log('Sending top-up request with data:', topUpData); // Debug log
            const response = await api.post('/topup', topUpData);
            console.log('Top-up response:', response.data); // Debug log
            return response.data;
        } catch (error) {
            console.error('Top-up error details:', error.response?.data); // Debug log
            throw error;
        }
    },

    // Get current balance
    getBalance: async () => {
        try {
            const response = await api.get('/topup/balance');
            return response.data;
        } catch (error) {
            console.error('Balance fetch error:', error.response?.data); // Debug log
            throw error;
        }
    }
};

// Add this to your existing API services
export const autoTopUp = {
    // Get auto top-up settings
    getSettings: async () => {
        try {
            console.log('Fetching auto top-up settings...');
            const response = await api.get('/auto-topup/settings');
            console.log('Auto top-up settings response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in autoTopUp.getSettings:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    },

    // Save auto top-up settings
    saveSettings: async (settings) => {
        try {
            console.log('Saving auto top-up settings:', settings);
            const response = await api.post('/auto-topup/settings', {
                minBalance: parseFloat(settings.minBalance),
                autoTopUpAmount: parseFloat(settings.autoTopUpAmount),
                autoTopUpFrequency: settings.autoTopUpFrequency
            });
            console.log('Save settings response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in autoTopUp.saveSettings:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    },

    // Toggle auto top-up
    toggle: async (isEnabled) => {
        try {
            const response = await api.post('/auto-topup/toggle', { isEnabled });
            return response.data;
        } catch (error) {
            console.error('Error in autoTopUp.toggle:', error);
            throw error;
        }
    }
};

export default api;
