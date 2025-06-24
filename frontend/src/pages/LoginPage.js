import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import gridXBackground from '../assets/images/gridx_background.jpg';
import { FcGoogle } from 'react-icons/fc';
import { 
  Flex, 
  Box, 
  Heading, 
  VStack, 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  Text, 
  useToast,
  FormErrorMessage,
  useColorModeValue
} from '@chakra-ui/react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const formBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(0, 0, 0, 0.6)');

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters long';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      const response = await auth.login(email, password);  // Corrected to pass separate arguments
      if (response.success) {
        console.log('Login successful, navigating to /home');  // Added for debugging
        toast({
          title: 'Login Successful!',
          description: 'Redirecting to home page.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/home');  // Changed from navigate('/') to navigate('/home')
      } else {
        toast({
          title: 'Login Error',
          description: response.message || 'Invalid credentials',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      let errorMessage = error.message || 'Login failed';
      if (error.response?.status === 400) errorMessage = 'Invalid request format. Please try again.';
      toast({
        title: 'Login Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google?action=login`;
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      p={4}
      position="relative"
      backgroundImage={`url(${gridXBackground})`}
      backgroundSize="cover"
      backgroundPosition="center"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="rgba(0, 0, 0, 0.5)"
        zIndex="1"
      />
      <Box
        maxW="md"
        w="full"
        bg={formBg}
        boxShadow="xl"  // Matched from RegisterPage.js
        borderRadius="xl"  // Matched from RegisterPage.js
        p={8}  // Matched from RegisterPage.js
        position="relative"
        zIndex="2"
        backdropFilter="blur(16px)"  // Matched from RegisterPage.js
        border="1px solid"
        borderColor={borderColor}
      >
        <Heading
          as="h2"
          size="xl"
          mb={6}
          color={textColor}
          textAlign="center"
        >
          Log In
        </Heading>
        <VStack as="form" spacing={4} onSubmit={handleSubmit} noValidate>
          <FormControl id="email" isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>
          <FormControl id="password" isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={loading}
          >
            Log In
          </Button>
          <Button
            width="full"
            onClick={handleGoogleLogin}
            leftIcon={<FcGoogle />}
            variant="outline"
          >
            Sign in with Google
          </Button>
          <Text color={textColor} mt={4} textAlign="center">
            Don't have an account?{' '}
            <Button
              variant="link"
              color="blue.500"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}

export default LoginPage;