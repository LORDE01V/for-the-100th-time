import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
// eslint-disable-next-line no-unused-vars
import { useDashboard } from '../context/DashboardContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

// Import the video
import backgroundVideo from '../assets/videos/Slowed-GridX-Video.mp4';

// Import Chakra UI Components
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Container,
  Spinner,
  useToast,
  IconButton,
  VStack,
  Fade,
  Input,
  Grid
} from '@chakra-ui/react';

// Import Icons
import {
  FaSolarPanel,
  FaBatteryFull,
  FaPlug,
  FaTree,
  FaCoins,
  FaTools,
  FaLightbulb,
  FaHandshake,
  FaUsers,
  FaCreditCard,
  FaRegLightbulb,
  FaRegSun,
  FaRegMoon,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';

// Import useColorMode hook
import { useColorMode } from '@chakra-ui/react';

// Import the image
import aboutBg from '../assets/images/About_Page_IMG.png';

// Constants and utility functions
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
};

const GLASS_STYLES = {
  light: {
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
  },
  dark: {
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(17, 25, 40, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  }
};

function HomePage() {
  // Hooks and state
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const newsletterBg = useColorModeValue('whiteAlpha.900', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.400');
  const headingColor = useColorModeValue('gray.900', 'white');
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');
  const glassStyles = useColorModeValue(GLASS_STYLES.light, GLASS_STYLES.dark);
  const user = auth.getCurrentUser();
  console.log('HomePage rendering: User is', user ? 'logged in' : 'not logged in');
  // const { currentThemeConfig } = useDashboard(); // Remove or comment out this line

  const [isLoadingGreeting, setIsLoadingGreeting] = useState(true);
  const [aiGreeting, setAiGreeting] = useState(null);
  const [greetingError, setGreetingError] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Memoized data configs
  const { navItems, solarTips } = useMemo(() => ({
    navItems: [
    {
      icon: FaSolarPanel,
      title: 'Dashboard',
      description: 'View your power usage and financial summary',
      path: '/dashboard',
      colorScheme: 'blue'
    },
    {
      icon: FaBatteryFull,
      title: 'Profile',
      description: 'Manage your personal information',
      path: '/profile',
      colorScheme: 'teal'
    },
    {
      icon: FaPlug,
      title: 'Top Up',
      description: 'Add credit to your power account',
      path: '/top-up',
      colorScheme: 'green'
    },
    {
      icon: FaCoins,
      title: 'Expenses',
      description: 'Track your power expenses',
      path: '/expenses',
      colorScheme: 'purple'
    },
    {
      icon: FaRegLightbulb,
      title: 'Notifications',
      description: 'View your alerts and updates',
      path: '/notifications',
      colorScheme: 'orange'
    },
    {
      icon: FaTools,
      title: 'Settings',
      description: 'Customize your preferences',
      path: '/settings',
      colorScheme: 'gray'
    },
    {
      icon: FaTree,
      title: 'Impact',
      description: 'See your environmental impact',
      path: '/impact',
      colorScheme: 'teal'
    },
    {
      icon: FaLightbulb,
      title: 'Support',
      description: 'Get help and find answers',
      path: '/support',
      colorScheme: 'blue'
    },
    {
      icon: FaRegSun,
      title: 'Forum',
      description: 'Join the community discussion',
      path: '/forum',
      colorScheme: 'purple'
    },
    {
      icon: FaHandshake,
      title: 'Refer & Earn',
      description: 'Invite friends and get rewards',
      path: '/refer',
      colorScheme: 'orange'
    },
    {
      icon: FaUsers,
      title: 'Group Buying',
      description: 'Join or create group solar purchases and save',
      path: '/group-buying',
      colorScheme: 'purple'
    },
    {
      icon: FaCreditCard,
      title: 'Subscriptions',
      description: 'Manage your energy subscription plans',
      path: '/subscription',
      colorScheme: 'blue'
    },
    {
      icon: Bot,
      title: 'AI Suggestions',
      description: 'Get smart tips from our AI to save energy and manage finances',
      path: '/ai-suggestions',
      colorScheme: 'purple'
    },
    {
      icon: FaUser,
      title: 'Profile Details',
      description: 'Update your personal information',
      path: '/personal-user',
      colorScheme: 'blue'
    }
    ],
    solarTips: [
    'Consider running high-consumption appliances during peak sunlight hours.',
    'Your battery storage is optimized for evening usage patterns.',
    'Did you know opening curtains can reduce lighting costs by up to 30%?',
    'Current weather patterns suggest ideal solar generation today.'
    ]
  }), []);

  // Effects
  useEffect(() => {
    console.log('Checking user authentication in useEffect');
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
        console.log('Fetching greeting for user:', user);
        // Simulate a successful response for testing; remove randomness
        const response = {
          message: `🌞 Good ${getTimeOfDay()}, ${user?.name || "Valued User"}! ` +
                   `Here's your personalized energy tip: ${solarTips[currentTipIndex]}`
        };
        setAiGreeting(response.message);
        setGreetingError(false);
        setIsLoadingGreeting(false);
      } catch (error) {
        console.error('Error fetching greeting:', error);
        setGreetingError(true);
        setAiGreeting('An error occurred while loading the greeting. Please try again later.');
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
      setCurrentTipIndex((prevIndex) => 
        prevIndex === solarTips.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [solarTips.length]);

  // Handlers
  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  // Render helpers
  const renderHeader = () => (
          <Flex justify="space-between" align="flex-start" mb={8} direction={{ base: 'column', md: 'row' }} gap={4}>
            <Box flex="1">
        <Heading as="h1" size="xl" color={headingColor} mb={2}>
          Welcome, {user.name}! 
              </Heading>
              
              {isLoadingGreeting ? (
                <Flex align="center" mt={2}>
            <Spinner size="sm" mr={2} color={spinnerColor} />
            <Text fontSize="sm" color={textColor}>
                    Crafting your energy insights...
                  </Text>
                </Flex>
              ) : aiGreeting ? (
                <Fade in={true} key={currentTipIndex}>
                  <Text 
                    fontSize="lg" 
              color={headingColor} 
                    fontWeight="medium" 
                    mt={2}
                    transition="opacity 0.5s ease-in-out"
                  >
                    {aiGreeting}
                  </Text>
                </Fade>
              ) : greetingError ? (
          <Text fontSize="md" color="orange.600" mt={2}>
            ⚠️ Connection Issue: {solarTips[currentTipIndex]}
                </Text>
              ) : null}
            </Box>

            <Flex align="center" gap={4} mt={{ base: 2, md: 0 }}>
              <VStack align="flex-end" spacing={1}>
          <Text fontSize="sm" color={textColor} textAlign="right">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
                <IconButton
                  aria-label="Toggle Theme"
                  icon={colorMode === 'light' ? <FaRegMoon /> : <FaRegSun />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size="sm"
            color={textColor}
                />
              </VStack>
            </Flex>
          </Flex>
  );

  const renderNavGrid = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={8}>
      {navItems.map((item) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05, boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)' }}
        >
          <Box
            p={6}
            borderWidth="1px"
            borderRadius="md"
            bg={glassStyles.backgroundColor}
            boxShadow="lg"
            _hover={{ boxShadow: 'xl' }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="200px"  // Consistent height for cards
            backdropFilter="blur(10px)"
          >
            <Flex align="center" justify="center">
              <Icon as={item.icon} boxSize={8} color={item.colorScheme + '.500'} />
              <Heading size="md" color={headingColor} ml={2}>{item.title}</Heading>
            </Flex>
            <Text color={textColor} mt={2} textAlign="center">
              {item.description}
            </Text>
            <Button
              mt={4}
              colorScheme={item.colorScheme}
              as={Link}
              to={item.path}
              size="md"
              width="full"
            >
              Go to {item.title}
            </Button>
          </Box>
        </motion.div>
      ))}
    </SimpleGrid>
  );

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
        <Spinner size="xl" color={spinnerColor} />
      </Flex>
    );
  }

  return (
    <ErrorBoundary fallback={<Text>Error loading page. Please try refreshing. Check console for details.</Text>}>
      <Box
        minH="100vh"
        backgroundImage={`url(${aboutBg})`}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        px={4}
        py={8}
        overflow="auto"
      >
        {/* Video Background */}
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          zIndex="0"
          overflow="hidden"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
          {/* Overlay to ensure content readability */}
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            bg="rgba(0, 0, 0, 0.5)"
            zIndex="1"
          />
        </Box>

        {/* Main Content - Add relative positioning and z-index */}
        <Box position="relative" zIndex="2" pb={20}>
          <Container maxW="container.xl" py={8}>
            {renderHeader()}
            {renderNavGrid()}
            
            {/* Newsletter Signup Section */}
            <Box as="section" py={4} px={6} bg={newsletterBg} borderRadius="md" boxShadow="sm" mt={8} borderWidth="0">
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} justify="center" align="center">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  variant="outline"
                  size="md"
                  w="100%"
                  id="newsletterEmail"
                />
                <Button 
                  colorScheme="blue" 
                  onClick={() => {
                    const emailInput = document.getElementById('newsletterEmail');
                    if (emailInput && emailInput.value.includes('@')) {
                      toast({
                        title: 'Subscription Successful!',
                        description: 'You have been subscribed. Check your email for confirmation.',
                        status: 'success',
                        duration: 5000,
                        isClosable: true
                      });
                    } else {
                      toast({
                        title: 'Error',
                        description: 'Please enter a valid email address.',
                        status: 'error',
                        duration: 3000,
                        isClosable: true
                      });
                    }
                  }}
                >
                  Subscribe
                </Button>
              </Grid>
            </Box>
            
            {/* Moved Logout Button */}
            <Box textAlign="center" mt={8}>
              <Button
                colorScheme="red"
                onClick={handleLogout}
                leftIcon={<FaSignOutAlt />}
                size="lg"
              >
                Logout
              </Button>
            </Box>
          </Container>
          {/* Ensure Footer is rendered with proper styling */}
          <Box mt={8} position="relative" zIndex="3" width="100%" bg="transparent">
            <Footer />
          </Box>
        </Box>
      </Box>
    </ErrorBoundary>
  );
}

export default HomePage;
