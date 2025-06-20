import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api'; // Assuming auth service is still used
import gridXBackground from '../assets/images/GridX-IMG.jpg'; // Make sure this path is correct for your background image
import { FcGoogle } from 'react-icons/fc'; // Import the Google icon
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

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State for validation errors
  const navigate = useNavigate();
  const toast = useToast(); // Initialize toast for Chakra UI notifications

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

  // Function to validate form inputs
  const validateForm = () => {
      const newErrors = {};
      if (!name.trim()) newErrors.name = 'Full Name is required';
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
      return Object.keys(newErrors).length === 0; // Return true if no errors
  };


  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('Attempting registration with:', { name, email, password }); // Debug log
      const response = await auth.register(name, email, password);
      console.log('Registration response:', response); // Debug log
      if (response.success) {
        toast({
          title: 'Registration Successful!',
          description: 'You can now log in.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      } else {
        toast({
          title: 'Registration Failed.',
          description: response.message || 'An unexpected error occurred.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      }); // Enhanced error logging
      toast({
        title: 'An error occurred.',
        description: error.message || 'Could not connect to the server.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Use Flex for centering the form vertically and horizontally
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      p={4}
      position="relative"
      backgroundImage={`url(${gridXBackground})`} // Set background image
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment="fixed"
    >
      {/* Add overlay for better readability */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="rgba(0, 0, 0, 0.5)" // Dark overlay with 50% opacity
        zIndex="1"
      />

      {/* Form container with enhanced glassmorphism styling */}
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
          Register
        </Heading>
        {/* VStack for vertical stacking of form controls */}
        <VStack as="form" spacing={4} onSubmit={handleSubmit} noValidate>
          {/* Form Control for Full Name */}
          <FormControl id="name" isInvalid={!!errors.name}>
            <FormLabel color={textColor}>Full Name</FormLabel>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
             {/* Display error message if validation fails */}
             <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

          {/* Form Control for Email */}
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

          {/* Form Control for Password */}
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

          {/* Form Control for Confirm Password */}
          <FormControl id="confirm-password" isInvalid={!!errors.confirmPassword}>
            <FormLabel color={textColor}>Confirm Password</FormLabel>
            <Input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
             <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            fontSize="md"
            isLoading={loading}
            loadingText="Registering..."
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
            Register
          </Button>

          {/* Add divider */}
          <Flex w="full" align="center" my={4}>
            <Box flex="1" h="1px" bg={borderColor} />
            <Text px={4} color={textColor} fontSize="sm">or</Text>
            <Box flex="1" h="1px" bg={borderColor} />
          </Flex>

          {/* Gmail Button */}
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

        {/* Link to Login page */}
        <Text mt={6} color={textColor}>
          Already have an account?{' '}
          <Button
            variant="link"
            color="teal.300"
            _hover={{ textDecoration: 'underline' }}
            onClick={() => navigate('/login')}
          >
            Login here
          </Button>
        </Text>
      </Box>
    </Flex>
  );
}

export default RegisterPage; // Export the component 