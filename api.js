import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create an axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
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
        if (error.response?.status === 401 && error.config && !error.config._retry) {  // Check if it's a 401 and not already retried
            error.config._retry = true;
            try {
                const refreshResponse = await api.post('/api/auth/refresh');  // Assume a refresh endpoint exists
                const newToken = refreshResponse.data.token;  // Get the new token from response
                localStorage.setItem('token', newToken);  // Update the token
                error.config.headers.Authorization = `Bearer ${newToken}`;  // Retry with new token
                return api(error.config);  // Retry the original request
            } catch (refreshError) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';  // Redirect if refresh fails
            }
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
                localStorage.setItem('token', response.data.token);

                // Always fetch user from backend after login
                const userResp = await api.get('/api/auth/user');
                const user = userResp.data.user;
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

export default api;
