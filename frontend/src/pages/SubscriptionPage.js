import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Button,
  useColorModeValue,
  Container,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FaArrowLeft, FaCreditCard } from 'react-icons/fa';

function SubscriptionPage() {
  const navigate = useNavigate();

  // State for selected plan
  const [selectedPlan, setSelectedPlan] = useState('');

  // Load the saved subscription plan from localStorage on component mount
  useEffect(() => {
    const savedPlan = localStorage.getItem('subscriptionPlan');
    if (savedPlan) {
      setSelectedPlan(savedPlan);
    }
  }, []);

  // Handle plan selection
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    localStorage.setItem('subscriptionPlan', plan); // Save the selection to localStorage
  };

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.800', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.300', 'gray.700');

  // Subscription plans
  const subscriptionPlans = useMemo(() => [
    {
      id: 'basic',
      name: 'Basic',
      price: 49,
      features: [
        'Access to core features',
        'Basic energy usage tracking',
        'Email support'
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 99,
      features: [
        'All Basic features',
        'Detailed analytics & reports',
        'Priority email & chat support',
        'Load shedding notifications'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 149,
      features: [
        'All Standard features',
        'Real-time energy monitoring',
        'Dedicated account manager',
        'Early access to new features',
        'VIP support'
      ]
    },
  ], []);

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <Flex justify="space-between" align="center" mb={8}>
          <Button
            leftIcon={<FaArrowLeft />}
            onClick={() => navigate(-1)}
            variant="ghost"
          >
            Back
          </Button>
          <Heading as="h1" size="xl" color={headingColor}>
            <FaCreditCard style={{ display: 'inline-block', marginRight: '0.5rem' }} />
            Subscription Plans
          </Heading>
          <Box w="136px" /> {/* Spacer for alignment */}
        </Flex>

        <Alert status="info" mb={8} borderRadius="md">
          <AlertIcon />
          Choose the plan that best fits your energy management needs
        </Alert>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {subscriptionPlans.map((plan) => (
            <Box
              key={plan.id}
              p={6}
              borderWidth="1px"
              borderRadius="md"
              borderColor={cardBorderColor}
              bg={selectedPlan === plan.id ? 'blue.500' : cardBg}
              color={selectedPlan === plan.id ? 'white' : textColor}
              _hover={{
                transform: 'translateY(-5px)',
                transition: 'all 0.2s',
                boxShadow: 'lg'
              }}
            >
              <VStack spacing={4} align="stretch">
                <Heading size="md">{plan.name}</Heading>
                <Text fontSize="2xl" fontWeight="bold">
                  R{plan.price}/month
                </Text>
                
                <VStack align="start" spacing={2}>
                  {plan.features.map((feature, index) => (
                    <Text key={index}>
                      ✓ {feature}
                    </Text>
                  ))}
                </VStack>

                <Button
                  colorScheme={selectedPlan === plan.id ? 'green' : 'blue'}
                  mt={4}
                  w="full"
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        <Text mt={8} fontSize="lg" fontWeight="bold">
          Selected Plan: {selectedPlan ? subscriptionPlans.find(plan => plan.id === selectedPlan)?.name : 'None'}
        </Text>
      </Container>
    </Box>
  );
}

export default SubscriptionPage;