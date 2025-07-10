const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      '/api/auth/login',
      { email, password },
      { withCredentials: true }
    );

    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      toast({
        title: 'Login successful',
        status: 'success',
        isClosable: true,
      });
      window.location.href = response.data.redirect || '/home';
    } else {
      toast({
        title: 'Unexpected response from server',
        status: 'warning',
        isClosable: true,
      });
    }
  } catch (error) {
    toast({
      title: error.response?.data?.message || 'Login failed',
      status: 'error',
      isClosable: true,
    });
  }
}; 