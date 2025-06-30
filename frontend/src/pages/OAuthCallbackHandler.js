import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallbackHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get user data from URL first
        const params = new URLSearchParams(window.location.search);
        const userParam = params.get('user');
        
        if (userParam) {
          try {
            const user = JSON.parse(userParam);
            console.log('Got user from URL:', user);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/home');
            return;
          } catch (e) {
            console.error('Failed to parse user from URL:', e);
          }
        }

        // Fallback to session check
        console.log('Checking session...');
        const response = await fetch('http://localhost:5000/api/auth/user', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Got user from session:', data);
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/home');
            return;
          }
        }

        // If both methods fail, go to login
        console.log('Auth failed, redirecting to login');
        navigate('/login');
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  return <div>Processing Google login...</div>;
};

export default OAuthCallbackHandler; 