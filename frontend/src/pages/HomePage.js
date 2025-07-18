// HomePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';
import ErrorBoundary from '../components/ErrorBoundary';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import backgroundVideo from '../assets/videos/Slowed-GridX-Video.mp4';

import {
  Box,
  Container,
  VStack,
  SimpleGrid,
  Heading,
  Text,
  Button,
  Icon,
  Input,
  Spinner,
  useColorModeValue,
  useToast,
  Fade,
  Flex,
  Grid,
} from '@chakra-ui/react';

import {
  FaSolarPanel,
  FaBatteryFull,
  FaTree,
  FaCoins,
  FaTools,
  FaLightbulb,
  FaHandshake,
  FaUsers,
  FaCreditCard,
  FaRegLightbulb,
  FaRegSun,
  FaSignOutAlt,
  FaUser,
} from 'react-icons/fa';

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
};

function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const newsletterBg = useColorModeValue('whiteAlpha.900', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.400');
  const headingColor = useColorModeValue('gray.900', 'white');
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');
  const user = auth.getCurrentUser();

  const [isLoadingGreeting, setIsLoadingGreeting] = useState(true);
  const [aiGreeting, setAiGreeting] = useState(null);
  const [greetingError, setGreetingError] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [email, setEmail] = useState('');

  const navCardBg = useColorModeValue('whiteAlpha.900', 'gray.800');

  const { navItems, solarTips } = useMemo(() => {
    const navItems = [
      { icon: FaSolarPanel, title: 'Dashboard', path: '/dashboard', description: 'View your power usage and financial summary', colorScheme: 'blue' },
      { icon: FaUser, title: 'Profile Details', path: '/personal-user', description: 'Update your personal information', colorScheme: 'blue' },
      { icon: FaBatteryFull, title: 'Top Up', path: '/top-up', description: 'Add credit to your power account', colorScheme: 'green' },
      { icon: FaCoins, title: 'Expenses', path: '/expenses', description: 'Track your power expenses', colorScheme: 'purple' },
      { icon: FaRegLightbulb, title: 'Notifications', path: '/notifications', description: 'View your alerts and updates', colorScheme: 'orange' },
      { icon: FaTools, title: 'Settings', path: '/settings', description: 'Customize your preferences', colorScheme: 'gray' },
      { icon: FaTree, title: 'Impact', path: '/impact', description: 'See your environmental impact', colorScheme: 'teal' },
      { icon: FaLightbulb, title: 'Support', path: '/support', description: 'Get help and find answers', colorScheme: 'blue' },
      { icon: Bot, title: 'AI Suggestions', path: '/ai-suggestions', description: 'Get smart tips from our AI to save energy and manage finances', colorScheme: 'purple' },
      { icon: FaRegSun, title: 'Forum', path: '/forum', description: 'Join the community discussion', colorScheme: 'purple' },
      { icon: FaHandshake, title: 'Refer & Earn', path: '/refer', description: 'Invite friends and get rewards', colorScheme: 'orange' },
      { icon: FaCreditCard, title: 'Subscriptions', path: '/subscription', description: 'Manage your energy subscription plans', colorScheme: 'blue' },
      { icon: FaUsers, title: 'Group Buying', path: '/group-buying', description: 'Join or create group solar purchases and save', colorScheme: 'purple' },
    ];
    const solarTips = [
      'Consider running high-consumption appliances during peak sunlight hours.',
      'Your battery storage is optimized for evening usage patterns.',
      'Opening curtains can reduce lighting costs by up to 30%.',
      'Current weather patterns suggest ideal solar generation today.',
    ];
    return { navItems, solarTips };
  }, []);

  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access this page',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      setTimeout(() => navigate('/login'), 1000);
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    const mockGreetingApi = async () => {
      try {
        const response = {
          message: `🌞 Good ${getTimeOfDay()}, ${user?.name || "Valued User"}! ` +
            `Here's your personalized energy tip: ${solarTips[currentTipIndex]}`
        };
        setAiGreeting(response.message);
        setGreetingError(false);
        setIsLoadingGreeting(false);
      } catch {
        setGreetingError(true);
        setAiGreeting('An error occurred while loading the greeting.');
        setIsLoadingGreeting(false);
      }
    };

    if (user) {
      mockGreetingApi();
    } else {
      setAiGreeting('Please log in to see personalized content.');
    }
  }, [user, currentTipIndex, solarTips]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev === solarTips.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [solarTips]);

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
        <Spinner size="xl" color={spinnerColor} />
      </Flex>
    );
  }

  return (
    <ErrorBoundary fallback={<Text>Error loading homepage. Refresh or check console.</Text>}>
      <Box minH="100vh" bg={bgColor} position="relative" overflow="hidden">
        {/* Background Video */}
        <Box position="fixed" top="0" left="0" w="100%" h="100%" zIndex="0">
          <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
            <source src={backgroundVideo} type="video/mp4" />
          </video>
          <Box position="absolute" top="0" left="0" w="100%" h="100%" bg="blackAlpha.700" />
        </Box>

        <Box position="relative" zIndex="2" py={10}>
          <Container maxW="6xl">
            {/* Header Section */}
            <Flex justify="space-between" direction={{ base: 'column', md: 'row' }} mb={8}>
              <Box>
                <Heading color={headingColor}>Welcome, {user.name} 👋</Heading>
                {isLoadingGreeting ? (
                  <Flex align="center" mt={2}>
                    <Spinner size="sm" color={spinnerColor} mr={2} />
                    <Text color={textColor}>Crafting your energy insights...</Text>
                  </Flex>
                ) : aiGreeting ? (
                  <Fade in={true} key={currentTipIndex}>
                    <Text mt={2} color={textColor} fontWeight="medium">{aiGreeting}</Text>
                  </Fade>
                ) : greetingError ? (
                  <Text mt={2} color="orange.400">{solarTips[currentTipIndex]}</Text>
                ) : null}
              </Box>

              <VStack align="flex-end">
                <Text color={textColor}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric'
                  })}
                </Text>
              </VStack>
            </Flex>

            {/* Navigation Cards */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
              {navItems.map((item) => (
                <motion.div key={item.title} whileHover={{ scale: 1.03 }}>
                  <Box
                    p={6}
                    borderRadius="xl"
                    bg={navCardBg}
                    boxShadow="lg"
                    textAlign="center"
                    transition="0.3s"
                  >
                    <Icon as={item.icon} boxSize={8} color={`${item.colorScheme}.500`} />
                    <Heading fontSize="lg" mt={2} color={headingColor}>{item.title}</Heading>
                    <Text mt={2} fontSize="sm" color={textColor}>{item.description}</Text>
                    <Button mt={4} colorScheme={item.colorScheme} as={Link} to={item.path}>Go to {item.title}</Button>
                  </Box>
                </motion.div>
              ))}
            </SimpleGrid>

            {/* Newsletter Section */}
            <Box mt={12} bg={newsletterBg} p={6} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={2}>Subscribe to Energy Updates</Heading>
              <Text mb={4} color={textColor}>Get the latest energy-saving tips and offers straight to your inbox.</Text>
              <Grid templateColumns={{ base: '1fr', md: '3fr 1fr' }} gap={4}>
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button colorScheme="blue" onClick={() => {
                  if (email.includes('@')) {
                    toast({ title: 'Subscribed!', description: 'Check your inbox.', status: 'success', duration: 5000, isClosable: true });
                  } else {
                    toast({ title: 'Invalid Email', description: 'Please enter a valid email.', status: 'error', duration: 3000, isClosable: true });
                  }
                }}>Subscribe</Button>
              </Grid>
            </Box>

            {/* Logout Button */}
            <Box textAlign="center" mt={10}>
              <Button colorScheme="red" onClick={handleLogout} leftIcon={<FaSignOutAlt />} size="lg">Logout</Button>
            </Box>
          </Container>

          <Box mt={12}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </ErrorBoundary>
  );
}

export default HomePage;
