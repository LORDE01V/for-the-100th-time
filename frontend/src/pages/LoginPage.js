import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useColorModeValue,
  Progress
} from '@chakra-ui/react';
import { auth } from '../services/api';
import gridXBackground from '../assets/images/gridx_background.jpg';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [strengthScore, setStrengthScore] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();

  const checkPasswordStrengthLocally = (password) => {
    if (!password) return { message: 'Password is required.', score: 0 };
    let score = 0;
    const criteria = [
      { regex: /[A-Z]/, points: 20, message: 'Include an uppercase letter.' },
      { regex: /[a-z]/, points: 20, message: 'Include a lowercase letter.' },
      { regex: /[0-9]/, points: 20, message: 'Include a number.' },
      { regex: /[!@#$%^&*]/, points: 20, message: 'Include a special character.' },
      { condition: password.length >= 8, points: 20, message: 'Aim for at least 8 characters.' }
    ];

    criteria.forEach(c => {
      if ('condition' in c) {
        if (c.condition) score += c.points;
      } else if ('regex' in c) {
        if (c.regex.test(password)) score += c.points;
      }
    });

    if (score === 100) return { message: 'Strong - Good job!', score };
    return { message: `Weak - ${criteria.find(c => !('condition' in c ? c.condition : c.regex && c.regex.test(password)))?.message || 'Improve your password.'}`, score };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const result = checkPasswordStrengthLocally(newPassword);
    setPasswordStrength(result.message);
    setStrengthScore(result.score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters long';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    try {
      const response = await auth.login(email, password);
      if (response.success) {
        toast({
          title: 'Login Successful!',
          description: 'Redirecting to home page.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/home');
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
      let errorMessage;
      if (error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.response?.status === 502) {
        errorMessage = 'Server is temporarily unavailable. Please try again later.';
      } else {
        errorMessage = error.message || 'Login failed';
      }
      
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
        bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(0, 0, 0, 0.6)')}
        boxShadow="xl"
        borderRadius="xl"
        p={8}
        position="relative"
        zIndex="2"
        backdropFilter="blur(16px)"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
      >
        <Heading as="h2" size="xl" mb={6} color={useColorModeValue('gray.800', 'white')} textAlign="center">
          Log In
        </Heading>
        <VStack as="form" spacing={4} onSubmit={handleSubmit} noValidate>
          <FormControl id="email" isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>
          <FormControl id="password" isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={handlePasswordChange} placeholder="Enter password" />
            {passwordStrength && <Text mt={2} color="gray.600" fontSize="sm">{passwordStrength}</Text>}
            <Progress value={strengthScore} size="xs" mt={2} colorScheme={strengthScore > 60 ? 'green' : strengthScore > 20 ? 'yellow' : 'red'} />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>
          <Button type="submit" colorScheme="blue" width="full" isLoading={loading}>Log In</Button>
          <Button width="full" onClick={handleGoogleLogin} leftIcon={<FcGoogle />} variant="outline">Sign in with Google</Button>
          <Text color={useColorModeValue('gray.800', 'white')} mt={4} textAlign="center">
            Don't have an account?{' '}
            <Button variant="link" color="blue.500" onClick={() => navigate('/register')}>Register</Button>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}

export default LoginPage;