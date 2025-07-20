const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('https://for-the-100th-time-1.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Store the token
      localStorage.setItem('token', data.token);
      // Handle successful login
    } else {
      // Handle error
      console.error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}; 