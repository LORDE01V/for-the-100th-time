/* eslint-disable no-unused-vars */
import React, { useMemo, useState, useEffect } from 'react';
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
  Alert,
  AlertIcon,
  useToast,

  HStack,
} from '@chakra-ui/react';
import { FaArrowLeft, FaCreditCard, FaBolt, FaSun, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

import { auth } from '../services/api'; // Import the API service with token refresh
import subscriptionsBackground from '../assets/images/subscriptions_page.png';  // Import the background image

function SubscriptionPage() {
  const navigate = useNavigate();
  const toast = useToast();
  
  // Define color mode values for the component
  const headingColor = useColorModeValue('gray.900', 'white');
  const glassCardBg = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(17, 25, 40, 0.2)');
  const glassBorderColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.1)');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  const subscriptionPlans = useMemo(() => [
    {
      id: 'basic-lite',
      name: 'Basic Lite',
      price: 29,
      features: [
        'Limited access to core features',
        'Basic energy tracking',
        'Standard email support'
      ],
      description: 'Ideal for newcomers, this plan offers a simple introduction to energy management with easy-to-use tools and community tips.'
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 49,
      features: [
        'Access to core features',
        'Basic energy usage tracking',
        'Email support'
      ],
      description: 'A solid starting point for everyday users, focusing on reliable tracking and essential tools for home energy optimization.'
    },
    {
      id: 'basic-plus',
      name: 'Basic Plus',
      price: 69,
      features: [
        'All Basic features',
        'Enhanced tracking reports',
        'Priority email support'
      ],
      description: 'Step up with advanced reports and priority support, perfect for users looking to dive deeper into their energy habits.'
    },
    {
      id: 'standard-lite',
      name: 'Standard Lite',
      price: 79,
      features: [
        'Most Standard features',
        'Basic analytics',
        'Email and chat support',
        'Standard notifications'
      ],
      description: 'A balanced plan for moderate users, including analytics and notifications to help manage energy more efficiently.'
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
      ],
      description: 'Comprehensive analytics for proactive energy management, with real-time notifications to stay ahead of usage.'
    },
    {
      id: 'standard-plus',
      name: 'Standard Plus',
      price: 119,
      features: [
        'All Standard features',
        'Advanced reports',
        '24/7 support',
        'Enhanced notifications'
      ],
      description: 'Elevate your experience with 24/7 support and advanced tools, ideal for families or small businesses.'
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
      ],
      description: ''
    },
    {
      id: 'premium-plus',
      name: 'Premium Plus',
      price: 309,
      features: [
        'All Premium features',
        'Enhanced real-time monitoring',
        'Dedicated manager',
        'VIP access and support'
      ],
      description: 'Unlock dedicated support and real-time insights, tailored for users who demand the best in energy solutions.'
    },
  ], []);

  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    // Check for successful subscription in localStorage
    const selectedPlan = localStorage.getItem('selectedPlan');
    if (selectedPlan) {
      try {
        const plan = JSON.parse(selectedPlan);
        setCurrentSubscription(plan);
      } catch (error) {
        console.error('Error parsing selected plan:', error);
      }
    }
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    
    // Check for successful payment return
    if (query.get('status') === 'success') {
      const selectedPlan = localStorage.getItem('selectedPlan');
      if (selectedPlan) {
        try {
          const plan = JSON.parse(selectedPlan);
          setCurrentSubscription(plan);
          
          // Update the most recent pending subscription transaction to 'Paid'
          const existingTransactions = JSON.parse(localStorage.getItem('subscription_transactions') || '[]');
          if (existingTransactions.length > 0) {
            const lastTransaction = existingTransactions[existingTransactions.length - 1];
            if (lastTransaction.status === 'Pending' && lastTransaction.planId === plan.id) {
              lastTransaction.status = 'Paid';
              lastTransaction.description = `${plan.name} subscription activated successfully`;
              localStorage.setItem('subscription_transactions', JSON.stringify(existingTransactions));
            }
          }
          
          toast({
            title: 'Subscription Activated!',
            description: `You are now subscribed to ${plan.name}. Welcome to your new plan!`,
            status: 'success',
            duration: 7000,
            isClosable: true,
          });
        } catch (error) {
          console.error('Error parsing selected plan:', error);
        }
      }
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (query.get('status') === 'failed') {
      toast({
        title: 'Payment Failed',
        description: 'Your payment was not successful. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (query.get('status') === 'error') {
      toast({
        title: 'An Error Occurred',
        description: 'An unexpected error occurred during payment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const handleSelectPlan = async (plan) => {
    try {
      const user = auth.getCurrentUser();
      
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to select a plan.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
        return;
      }

      console.log('Making subscription payment request for plan:', plan.name);
      console.log('Plan details:', { id: plan.id, name: plan.name, price: plan.price });

      // Use the API service which handles token refresh automatically
      const data = await auth.topup(plan.price, 'subscription');

      if (data.success && data.authorization_url) {
        console.log('Redirecting to Paystack for subscription:', data.authorization_url);
        
        // Store selected plan info for post-payment reference
        localStorage.setItem('selectedPlan', JSON.stringify({
          id: plan.id,
          name: plan.name,
          price: plan.price
        }));
        
        // Save subscription transaction to localStorage for tracking
        const transaction = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          amount: plan.price,
          category: 'Subscription',
          status: 'Pending',
          description: `${plan.name} subscription initiated`,
          type: 'subscription',
          planId: plan.id,
          planName: plan.name
        };
        
        const existingTransactions = JSON.parse(localStorage.getItem('subscription_transactions') || '[]');
        localStorage.setItem('subscription_transactions', JSON.stringify([...existingTransactions, transaction]));
        
        window.location.href = data.authorization_url;
      } else {
        console.error('Subscription payment failed:', data);
        toast({
          title: 'Payment Failed',
          description: data.error || data.message || 'Failed to initialize payment.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      
      // Handle specific authentication errors
      if (error.message.includes('token') || error.message.includes('authentication') || error.message.includes('401')) {
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      } else {
        toast({
          title: 'Error',
          description: error.message || 'An unexpected error occurred. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };



  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      p={4}
      backgroundImage={`url(${subscriptionsBackground})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment="fixed"
      backgroundRepeat="no-repeat"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
      }}
    >
      <Box
        maxW="container.xl"
        width="100%"
        py={8}
        px={{ base: 2, md: 8 }}
        position="relative"
        zIndex={2}
      >
        <HStack justify="space-between" align="center" mb={8}>
          <Button
            leftIcon={<FaArrowLeft />}
            onClick={() => navigate(-1)}
            variant="ghost"
            mr={4}
          >
            Back
          </Button>
        </HStack>

        <Heading size="xl" color={headingColor} mb={2} textAlign="center">
          <FaCreditCard style={{ display: 'inline-block', marginRight: '0.5rem' }} />
          Subscription Plans
        </Heading>

        <Text color={mutedTextColor} fontSize="lg" textAlign="center" mb={6}>
          Unlock exclusive savings and features tailored to your energy needs!
        </Text>

        <Alert status={currentSubscription ? "success" : "info"} mb={8} borderRadius="md">
          <AlertIcon />
          {currentSubscription 
            ? `You are currently subscribed to ${currentSubscription.name}` 
            : "Choose the plan that best fits your energy management needs"
          }
        </Alert>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
          {subscriptionPlans.map((plan) => (
            <motion.div 
              key={plan.id} 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }} 
              whileHover={{ scale: 1.05, boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)' }} 
              style={{ height: '100%' }}
            >
              <Box
                p={6}
                borderRadius="md"
                bg={glassCardBg}
                boxShadow="lg"
                _hover={{ boxShadow: 'xl' }}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="flex-start"
                height="100%"
                minH="340px"
                maxW="320px"
                mx="auto"
                sx={{ backdropFilter: "blur(15px)" }}
                borderColor={currentSubscription && currentSubscription.id === plan.id ? 'blue.500' : glassBorderColor}
                borderWidth={currentSubscription && currentSubscription.id === plan.id ? '2px' : '1px'}
              >
                <VStack spacing={4} align="stretch" height="100%">
                  <Flex align="center" justify="center">
                    {plan.id.includes('basic') && <FaBolt size="24px" color="blue" />}
                    {plan.id.includes('standard') && <FaSun size="24px" color="yellow" />}
                    {plan.id.includes('premium') && <FaShieldAlt size="24px" color="gold" />}
                    <Heading size="md" color={headingColor} ml={2}>
                      {plan.name}
                    </Heading>
                  </Flex>
                  
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    R{plan.price}/month
                  </Text>
                  
                  <VStack align="start" spacing={2} flex="1" maxH="120px" overflowY="auto">
                    {plan.features.map((feature, index) => (
                      <Flex key={index} align="center">
                        <FaCheckCircle color="green" />
                        <Text ml={2}>{feature}</Text>
                      </Flex>
                    ))}
                  </VStack>
                  
                  <Button 
                    onClick={() => handleSelectPlan(plan)} 
                    colorScheme={currentSubscription && currentSubscription.id === plan.id ? "blue" : "green"} 
                    width="full"
                  >
                    {currentSubscription && currentSubscription.id === plan.id 
                      ? "Current Plan" 
                      : currentSubscription 
                        ? "Change to This Plan" 
                        : "Select Plan"
                    }
                   </Button>
                </VStack>
              </Box>
            </motion.div>
          ))}
        </SimpleGrid>
      </Box>
    </Flex>
  );
}

export default SubscriptionPage; 