import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api'; // Assuming auth service is still used
import gridXBackground from '../assets/images/GridX-IMG.jpg'; // Make sure this path and filename are correct
import { FcGoogle } from 'react-icons/fc'; // Add this import

// Import Chakra UI Components
import {
  Box,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  VStack,
  useToast, // For displaying messages
  useColorModeValue, // For light/dark mode styling
   FormErrorMessage, // For displaying validation errors
} from '@chakra-ui/react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State for validation errors
  const navigate = useNavigate();
  const toast = useToast(); // Initialize toast

  // Function to validate form inputs
  const validateForm = () => {
      const newErrors = {};
      if (!email.trim()) {
          newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
          newErrors.email = 'Email address is invalid';
      }
      if (!password) {
          newErrors.password = 'Password is required';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0; // Return true if no errors
  };


  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission

     if (!validateForm()) {
        return; // Stop submission if validation fails
    }

    setLoading(true); // Set loading state
    setErrors({}); // Clear previous errors

    try {
      const response = await auth.login(email, password); // Call backend API
      if (response.success) {
        toast({ // Show success message
            title: 'Login Successful!',
            description: 'Welcome back!',
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
        navigate('/home'); // Changed to '/home'
      } else {
        toast({ // Show error message from backend
            title: 'Login Failed.',
            description: response.message || 'Invalid email or password.',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
      }
    } catch (error) {
        console.error('Login error:', error);
         toast({ // Handle network errors or other exceptions
            title: 'An error occurred.',
            description: error.message || 'Could not connect to the server.',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Update color mode values for glassmorphism effect
  const formBg = useColorModeValue(
    'rgba(255, 255, 255, 0.15)',
    'rgba(26, 32, 44, 0.15)'
  );
  const textColor = useColorModeValue('white', 'white');
  const borderColor = useColorModeValue(
    'rgba(255, 255, 255, 0.2)',
    'rgba(255, 255, 255, 0.1)'
  );

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
      backgroundAttachment="fixed"
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
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        borderRadius="xl"
        p={8}
        textAlign="center"
        position="relative"
        zIndex="2"
        backdropFilter="blur(16px)"
        border="1px solid"
        borderColor={borderColor}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'xl',
          padding: '2px',
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <Heading 
          as="h2" 
          size="xl" 
          mb={6} 
          color={textColor}
          textShadow="0 2px 4px rgba(0,0,0,0.2)"
        >
          Login
        </Heading>
        <VStack as="form" spacing={4} onSubmit={handleSubmit} noValidate>
          <FormControl id="email" isInvalid={!!errors.email}>
            <FormLabel color={textColor}>Email address</FormLabel>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="rgba(255, 255, 255, 0.1)"
              borderColor={borderColor}
              color={textColor}
              _hover={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
              _focus={{
                borderColor: 'rgba(255, 255, 255, 0.5)',
                boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.5)',
              }}
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl id="password" isInvalid={!!errors.password}>
            <FormLabel color={textColor}>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="rgba(255, 255, 255, 0.1)"
              borderColor={borderColor}
              color={textColor}
              _hover={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
              _focus={{
                borderColor: 'rgba(255, 255, 255, 0.5)',
                boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.5)',
              }}
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            fontSize="md"
            isLoading={loading}
            loadingText="Logging in..."
            w="full"
            mt={4}
            bg="rgba(49, 151, 149, 0.8)"
            _hover={{
              bg: 'rgba(49, 151, 149, 0.9)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            _active={{
              bg: 'rgba(49, 151, 149, 1)',
              transform: 'translateY(0)',
            }}
          >
            Login
          </Button>

          <Flex w="full" align="center" my={4}>
            <Box flex="1" h="1px" bg={borderColor} />
            <Text px={4} color={textColor} fontSize="sm">or</Text>
            <Box flex="1" h="1px" bg={borderColor} />
          </Flex>

          <Button
            w="full"
            size="lg"
            variant="outline"
            leftIcon={<FcGoogle size="20px" />}
            onClick={() => navigate('/auth/google')}
            bg="rgba(255, 255, 255, 0.1)"
            borderColor={borderColor}
            color={textColor}
            _hover={{
              bg: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            _active={{
              bg: 'rgba(255, 255, 255, 0.3)',
              transform: 'translateY(0)',
            }}
          >
            Continue with Gmail
          </Button>
        </VStack>

        <Text mt={6} color={textColor}>
          Don't have an account?{' '}
          <Button
            variant="link"
            color="teal.300"
            _hover={{ textDecoration: 'underline' }}
            onClick={() => navigate('/register')}
          >
            Register here
          </Button>
        </Text>
      </Box>
    </Flex>
  );
}

export default LoginPage;
