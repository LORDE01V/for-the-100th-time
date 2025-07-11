import axios from 'axios';

// eslint-disable-next-line no-unused-vars
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create an axios instance with default config
const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',  // Remove /api from default
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Access-Control-Allow-Origin': 'http://localhost:3000'
    },
    timeout: 10000, // 10-second timeout
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

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Connection timeout. Please check your internet'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Server unavailable. Please try again later'));
    }
    return Promise.reject(error);
  }
);

// Auth API calls with improved error handling
export const auth = {
    login: async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', {
                email: email.toLowerCase().trim(),  // Normalize email
                password
            });
            if (response.data.success) {
                if (response.data.access_token) {
                    localStorage.setItem('token', response.data.access_token);
                }
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                // Removed redirection to let the component handle navigation
                // window.location.href = '/dashboard';
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error.response?.data);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to connect to the server');
        }
    },

    register: async (userData) => {  // Updated to accept an object
        try {
            const response = await api.post('/auth/register', userData);  // Pass the object directly
            if (response.data.success) {
                if (response.data.access_token) {
                    localStorage.setItem('token', response.data.access_token);
                }
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
            }
            return response.data;
        } catch (error) {
            console.error('Registration error:', error.response?.data);
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
  api.post = async function(url, data, ...args) {
    if (url === '/api/ai/sentiment') {
      // Simulate network delay
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

export const fetchAISuggestions = async () => {
  try {
    const response = await api.get('/api/ai-suggestions', {
      withCredentials: true, // Include cookies for authentication
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    return { success: false };
  }
};

export default api;
