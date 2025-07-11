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
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import { FaArrowLeft, FaCreditCard, FaBolt, FaSun, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useSubscription } from '../context/SubscriptionContext';
import subscriptionsBackground from '../assets/images/subscriptions_page.png';  // Import the background image

function SubscriptionPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { selectPlan } = useSubscription();
  
  // Ensure all useColorModeValue calls are at the top level
  const headingColor = useColorModeValue('gray.900', 'white');
  const newCardBg = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(17, 25, 40, 0.75)');
  const newBorderColor = useColorModeValue('gray.300', 'gray.700');
  const glassCardBg = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(17, 25, 40, 0.2)');
  const glassBorderColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.1)');
  
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

  const [selectedPlans, setSelectedPlans] = useState([]);
  const [rationale] = useState({});
  
  useEffect(() => {
    const savedPlans = localStorage.getItem('selectedPlans');
    if (savedPlans) {
      setSelectedPlans(JSON.parse(savedPlans));
    }
  }, []);
  
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  let mockRationaleMessages = [
    "This plan suits your low energy usage pattern based on mock data analysis.",
    "Based on your data, this is a great match for high efficiency needs.",
    "Ideal for users with moderate usage; it optimizes costs effectively.",
    "This option aligns well with your peak-hour energy patterns.",
    "Perfect for solar-dependent setups like yours.",
    "Enhances your energy tracking with minimal investment.",
    "A smart choice for reducing your carbon footprint.",
    "Tailored for users seeking reliable load shedding solutions.",
    "Boosts your energy management with advanced features.",
    "Great for everyday efficiency and cost savings.",
    "This plan fits users with variable energy demands.",
    "Optimizes for low-usage scenarios to save more.",
    "Balances cost and features for your energy profile.",
    "Supports real-time monitoring for better decisions.",
    "Ideal if you're focusing on sustainable energy sources.",
    "Provides excellent value for high-usage households.",
    "Enhances notifications for proactive energy management.",
    "A solid pick for users prioritizing 24/7 support.",
    "Matches your needs for detailed analytics reports.",
    "Streamlines your energy optimization efforts.",
    "Best for those with growing energy requirements.",
    "Delivers premium insights at an affordable rate.",
    "Adapts to your energy habits for maximum efficiency.",
    "Unlocks advanced tools for energy conservation.",
    "Suited for users with solar and grid hybrid systems.",
    "Offers robust features for budget-conscious users.",
    "Elevates your setup with priority support options.",
    "Tailored for peak performance in energy tracking.",
    "A versatile plan for mixed energy usage patterns.",
    "Focuses on cost-effective solutions for you.",
    "Integrates well with your current energy setup.",
    "Provides comprehensive monitoring for better savings.",
    "Ideal for users expanding their energy systems.",
    "Enhances your experience with real-time data insights.",
    "Perfect match for low-maintenance energy needs.",
    "Boosts efficiency for users with high demands.",
    "Supports your goals for sustainable living.",
    "A reliable choice for everyday energy challenges.",
    "Optimizes for users with fluctuating usage.",
    "Delivers value through advanced reporting features.",
    "Great for those seeking customizable energy plans.",
    "Aligns with your profile for optimal energy use.",
    "Enhances control over your energy consumption.",
    "Tailored to handle your specific energy patterns.",
    "Provides a strong foundation for energy management.",
    "Ideal for proactive users monitoring their usage.",
    "Balances features and cost for your needs.",
    "Unlocks potential savings with smart analytics.",
    "Suited for dynamic energy environments.",
    "Offers premium support for peace of mind.",
    "A top pick for efficient and eco-friendly options."
  ];

  mockRationaleMessages = mockRationaleMessages.filter(message => !message.includes("energy profile"));

  const handleSelectPlan = (plan) => {
    selectPlan(plan);
    window.location.href = '/dashboard';
  };

  const fetchPlanRationale = async (planId) => {
    // Implementation of fetchPlanRationale function
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
      backgroundRepeat="no-repeat"  // Added to prevent repetition
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
        py={8}
        position="relative"
        zIndex={2}
      >
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
          <Box w="136px" />
        </Flex>
        <Alert status="info" mb={8} borderRadius="md">
          <AlertIcon />
          Choose the plan that best fits your energy management needs
        </Alert>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
          {subscriptionPlans.map((plan) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} whileHover={{ scale: 1.05, boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)' }} style={{ height: '100%' }}>
              <Box
                p={6}
                borderWidth="1px"
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
                backdropFilter="blur(15px)"  // Increased blur for better effect
                borderColor={selectedPlans.includes(plan.id) ? 'green.500' : glassBorderColor}
              >
                <VStack spacing={4} align="stretch" height="100%">
                  <Flex align="center" justify="center">
                    {plan.id.includes('basic') && <FaBolt size="24px" color="blue" />}
                    {plan.id.includes('standard') && <FaSun size="24px" color="yellow" />}
                    {plan.id.includes('premium') && <FaShieldAlt size="24px" color="gold" />}
                    <Heading size="md" color={headingColor} ml={2}>{plan.name}</Heading>
                  </Flex>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">R{plan.price}/month</Text>
                  <VStack align="start" spacing={2} flex="1" maxH="120px" overflowY="auto">
                    {plan.features.map((feature, index) => (
                      <Flex key={index} align="center">
                        <FaCheckCircle color="green" />
                        <Text ml={2}>{feature}</Text>
                      </Flex>
                    ))}
                  </VStack>
                  <Button onClick={() => handleSelectPlan(plan)} colorScheme={selectedPlans.includes(plan.id) ? 'red' : 'green'} width="full">{selectedPlans.includes(plan.id) ? 'Unselect' : 'Select'}</Button>
                  <Button onClick={() => fetchPlanRationale(plan.id)}>Get Rationale</Button>
                </VStack>
                {selectedPlans.includes(plan.id) && (
                  <Box mt={4}>
                    {rationale[plan.id]?.isLoading ? (
                      <Spinner size="md" />
                    ) : rationale[plan.id]?.message ? (
                      <Tooltip label={rationale[plan.id].message} hasArrow placement="top">
                        <Text color={mutedTextColor} fontSize="sm">
                          {rationale[plan.id].message.slice(0, 50)}...
                        </Text>
                      </Tooltip>
                    ) : null}
                  </Box>
                )}
              </Box>
            </motion.div>
          ))}
        </SimpleGrid>
        <Text color={mutedTextColor} mb={4}>Review and update your profile details.</Text>
      </Box>
    </Flex>
  );
}

export default SubscriptionPage; 