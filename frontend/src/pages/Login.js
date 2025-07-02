import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { Box, Input, Button } from '@chakra-ui/react';

const Login = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    // Implement login logic here
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/reset-password', { email, new_password: newPassword });
      toast({
        title: 'Password reset successfully',
        status: 'success',
        isClosable: true,
      });
      setIsResetMode(false);
    } catch (error) {
      toast({
        title: 'Reset failed',
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      {isResetMode ? (
        <form onSubmit={handlePasswordReset}>
          <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="New Password" type="password" onChange={(e) => setNewPassword(e.target.value)} />
          <Button type="submit">Reset Password</Button>
        </form>
      ) : (
        <form onSubmit={handleLogin}>
          <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit">Login</Button>
          <Button onClick={() => setIsResetMode(true)}>Forgot Password?</Button>
        </form>
      )}
    </Box>
  );
};

export default Login; 