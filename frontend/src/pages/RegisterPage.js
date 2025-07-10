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

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [strengthScore, setStrengthScore] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();

  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const formBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(0, 0, 0, 0.6)');

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      await auth.register({ 
        name,
        email,
        password,
        phone
      });

      toast({
        title: 'Registration Successful!',
        description: 'You can now log in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      let errorMessage = error.message;
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection to server timed out. Please check your internet connection and try again.';
      }
      
      if (error.response?.status === 504) {
        errorMessage = 'Server took too long to respond. Please try again later.';
      }

      toast({
        title: 'Registration Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    window.location.href = 
    `${backendUrl}/api/auth/google?action=register`;
  };

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
    const failedCriteria = criteria.find(c => {
      if ('condition' in c) {
        return !c.condition;
      } else if ('regex' in c) {
        return !c.regex.test(password);
      }
      return false;
    });
    return { message: `Weak - ${failedCriteria?.message || 'Improve your password.'}`, score };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const result = checkPasswordStrengthLocally(newPassword);
    setPasswordStrength(result.message);
    setStrengthScore(result.score);
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
        boxShadow="xl"
        borderRadius="xl"
        p={8}
        position="relative"
        zIndex="2"
        backdropFilter="blur(16px)"
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
          Create Account
        </Heading>

        <VStack as="form" spacing={4} onSubmit={handleSubmit} noValidate>
          <FormControl id="name" isInvalid={!!errors.name}>
            <FormLabel>Full Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

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
              onChange={handlePasswordChange}
              placeholder="Create password"
            />
            {passwordStrength && <Text mt={2} color="gray.600" fontSize="sm">{passwordStrength}</Text>}
            <Progress value={strengthScore} size="xs" mt={2} colorScheme={strengthScore > 60 ? 'green' : strengthScore > 20 ? 'yellow' : 'red'} />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <FormControl id="confirmPassword" isInvalid={!!errors.confirmPassword}>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>

          <FormControl id="phone" isInvalid={!!errors.phone}>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
            <FormErrorMessage>{errors.phone}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            w="full"
            isLoading={loading}
            loadingText="Registering..."
          >
            Create Account
          </Button>

          <Flex w="full" align="center" my={4}>
            <Box flex="1" h="1px" bg={borderColor} />
            <Text px={4} color={textColor}>or</Text>
            <Box flex="1" h="1px" bg={borderColor} />
          </Flex>

          <Button
            w="full"
            variant="outline"
            leftIcon={<FcGoogle />}
            onClick={handleGoogleRegister}
          >
            Continue with Google
          </Button>
        </VStack>

        <Text mt={6} textAlign="center" color={textColor}>
          Already have an account?{' '}
          <Button
            variant="link"
            color="teal.500"
            onClick={() => navigate('/login')}
          >
            Log in here
          </Button>
        </Text>
      </Box>
    </Flex>
  );
}

export default RegisterPage;