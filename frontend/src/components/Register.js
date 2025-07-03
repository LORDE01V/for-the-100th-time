// frontend/src/components/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

// Import Chakra UI components
import {
  Box, // Added Box import as it might be useful for layout, though not explicitly used in the last version
  Flex, // Added Flex import if needed for layout
  Heading, // Added Heading import for the title
  FormControl, // Added FormControl import for form fields if you plan to use Chakra forms later
  FormLabel, // Added FormLabel import for form fields
  Input, // Added Input import for form fields
  Button,
  Text, // Added Text import for general text
  VStack, // Added VStack for vertical stacking
  useToast // Added useToast for potential future use (e.g., registration success message)
} from '@chakra-ui/react';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        if (!name || !email || !password) {
            setError('All fields are required');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            const response = await auth.register(name, email, password);
            if (response.success) {
                navigate('/login');
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (error) {
            if (error.message === 'Network Error') {
                setError('Cannot connect to the server. Please make sure the backend server is running.');
            } else {
                setError(error.message || 'Registration failed. Please try again.');
            }
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Heading as="h2" size="xl" mb={6} textAlign="center">Register</Heading>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <FormLabel>Full Name</FormLabel>
                    <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <FormLabel>Email address</FormLabel>
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <FormLabel>Password</FormLabel>
                    <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>
                <Button
                    type="submit"
                    colorScheme="teal"
                    size="lg"
                    fontSize="md"
                    isLoading={loading}
                    loadingText="Registering..."
                    w="full"
                    mt={4}
                >
                    Register
                </Button>
            </form>
            <VStack mt={6} spacing={4}>
                <Button
                    type="button"
                    colorScheme="blue"
                    size="md"
                    width="full"
                    onClick={() => {
                        console.log("Navigating to login from 'Register here' button...");
                        navigate('/login');
                    }}
                >
                    Register here
                </Button>
            </VStack>
        </div>
    );
}

export default Register;