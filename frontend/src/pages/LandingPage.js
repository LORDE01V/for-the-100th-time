import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  Avatar,
  VStack,
  Image,
  Link,
  Divider,
} from '@chakra-ui/react';
import {
  FaSolarPanel,
  FaChartLine,
  FaLeaf,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import nathiProfile from '../assets/images/IMG Nathii.jpg';
import okuhleProfile from '../assets/images/sleigh.png';
import mphoProfile from '../assets/images/Mpho.png';
import LihleProfile from '../assets/images/Lihle.png';
import kgothatsoProfile from '../assets/images/kg_img.png';
import gridXBackground from '../assets/images/GridX-IMG.jpg';

// Create motion components
const MotionBox = motion.create(Box);

// Add these animation variants at the top of the file, after the imports
const textVariants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// Define animation variants for the Image container to perform the flip
const imageContainerFlipVariants = {
  animate: {
    rotateY: 0, // Default state: no rotation
    transition: {
        duration: 0.3, // Base transition speed for unhover
        ease: "easeInOut"
    }
  },
  hover: {
    rotateY: 180, // Flip 180 degrees around the Y-axis on hover
    transition: {
      duration: 0.6, // Duration for the flip
      ease: "easeInOut"
    }
  }
};

function RotatingGreetingsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Define greetings using useMemo
  const southAfricanGreetings = useMemo(() => [
    'Hello',
    'Hallo',
    'Sawubona',
    'Molo',
    'Lotjhani',
    'Sawubona',
    'Dumela',
    'Dumela',
    'Dumela',
    'Avuxeni',
    'Ndaa',
  ], []);

  useEffect(() => {
    if (southAfricanGreetings.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % southAfricanGreetings.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [southAfricanGreetings]);

  const containerBg = useColorModeValue('rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.8)');
  const greetingColor = useColorModeValue('white', 'white');

  const currentGreeting = southAfricanGreetings[currentIndex];

  const textVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (southAfricanGreetings.length === 0) {
    return null;
  }

  return (
    <Box
      py={10}
      px={4}
      bg={containerBg}
      textAlign="center"
      borderRadius="full"
      boxShadow="lg"
      maxW="container.md"
      mx="auto"
      mt={12}
      mb={12}
      backdropFilter="blur(10px)"
    >
      <Stack spacing={4}>
        <Heading 
          size="lg"
          color={greetingColor}
          textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
        >
          Discover the Spirit of South Africa!
        </Heading>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={textVariants}
          >
            <Text 
              fontSize={{ base: 'xl', md: '2xl' }} 
              fontWeight="bold" 
              color={greetingColor}
              textShadow="1px 1px 2px rgba(0, 0, 0, 0.5)"
            >
              {currentGreeting}
            </Text>
          </motion.div>
        </AnimatePresence>
      </Stack>
    </Box>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  
  // Keep these color mode values that are being used
  const containerBg = useColorModeValue('rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.8)');
  const greetingColor = useColorModeValue('white', 'white');
  const bgGradient = useColorModeValue(
    'linear(to-b, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))',
    'linear(to-b, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6))'
  );
  const textColor = useColorModeValue('white', 'white');
  const headingColor = useColorModeValue('white', 'white');
  const cardBorderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');
  const developerSectionBg = useColorModeValue('rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.8)');

  // Define and memoize the rotating messages
  const messages = useMemo(() => [
    "Manage your solar energy and finances in one place. Track usage, optimize costs, and make smarter energy decisions.",
    "Take control of your energy future. Monitor solar production and reduce your carbon footprint.",
    "Smart financial tools for sustainable living. Save money while saving the planet.",
    "Real-time insights into your energy consumption. Make informed decisions for a greener tomorrow.",
    "Join the renewable energy revolution. Power your home with clean, sustainable energy."
  ], []);

  // State for current message
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Effect to rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        prevIndex === messages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [messages]);

  // Enhanced features with animations and icons
  const features = useMemo(() => [
    {
      icon: FaSolarPanel,
      title: 'Solar Power Management',
      description: 'Monitor and optimize your solar energy usage in real-time',
      animation: {
        hover: {
          scale: 1.05,
          rotate: 2,
          transition: {
            duration: 0.3,
            ease: "easeInOut"
          }
        }
      }
    },
    {
      icon: FaChartLine,
      title: 'Smart Financial Tools',
      description: 'Track expenses, manage payments, and save on energy costs',
      animation: {
        hover: {
          scale: 1.05,
          rotate: -2,
          transition: {
            duration: 0.3,
            ease: "easeInOut"
          }
        }
      }
    },
    {
      icon: FaLeaf,
      title: 'Energy Efficiency',
      description: 'Get insights and recommendations to improve your energy consumption',
      animation: {
        hover: {
          scale: 1.05,
          rotate: 2,
          transition: {
            duration: 0.3,
            ease: "easeInOut"
          }
        }
      }
    },
  ], []);

  // Developer data
  const developers = useMemo(() => [
    { 
      name: 'Kgothatso Mokgashi', 
      role: 'Backend',
      description: "Builds secure, scalable APIs that connect frontend brilliance to solid server logic."
    },
    { 
      name: 'Okuhle Gadla', 
      role: 'Backend',
      description: "Builds secure, scalable APIs that connect frontend brilliance to solid server logic."
    },
    { 
      name: 'Thembelihle Zulu', 
      role: 'Database',
      description: "Ensures reliable data structures and optimized queries that keep the app's engine running strong."
    },
    { 
      name: 'Mpho Ramokhoase', 
      role: 'Frontend',
      description: "Crafts seamless, user-friendly interfaces with an eye for responsive design and smooth interactions."
    },
    { 
      name: 'Nkosinathi Radebe', 
      role: 'Frontend',
      description: "Brings UI designs to life with pixel-perfect precision and a deep focus on performance."
    },
  ], []);

  return (
    <Box 
      minH="100vh"
      position="relative"
      backgroundImage={`url(${gridXBackground})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment="fixed"
    >
      {/* Add an overlay to ensure content readability */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="rgba(0, 0, 0, 0.5)"
        zIndex="1"
      />

      {/* Hero Section */}
      <Box
        position="relative"
        zIndex="2"
        bgGradient={bgGradient}
        py={20}
        px={4}
      >
        <Container maxW="container.xl">
          <Stack
            spacing={8}
            align="center"
            textAlign="center"
          >
            <Heading
              as="h1"
              size="2xl"
              color={headingColor}
              fontWeight="bold"
              textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
            >
              Welcome to GridX
            </Heading>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={textVariants}
              >
                <Text
                  fontSize="xl"
                  color={textColor}
                  maxW="2xl"
                  minH="80px"
                  textShadow="1px 1px 2px rgba(0, 0, 0, 0.5)"
                >
                  {messages[currentMessageIndex]}
                </Text>
              </motion.div>
            </AnimatePresence>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={() => navigate('/register')}
              px={8}
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: 'lg',
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Rotating Greetings Section */}
      <Box position="relative" zIndex="2">
        <RotatingGreetingsSection />
      </Box>

      {/* Features Section with Enhanced Animation */}
      <Container maxW="container.xl" py={20} px={4} position="relative" zIndex="2">
        <Box
          position="relative"
          width="100%"
          overflow="hidden"
          sx={{
            '&:hover .feature-slider': {
              animationPlayState: 'paused',
            },
          }}
        >
          <Flex
            className="feature-slider"
            width="200%"
            position="relative"
            animation="slide 30s linear infinite"
            sx={{
              '@keyframes slide': {
                '0%': { transform: 'translateX(0)' },
                '100%': { transform: 'translateX(-50%)' },
              },
            }}
          >
            {/* First set of features */}
            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              spacing={10}
              width="100%"
              flexShrink={0}
            >
              {features.map((feature, index) => (
                <MotionBox
                  key={index}
                  p={8}
                  bg={containerBg}
                  borderRadius="full"
                  boxShadow="md"
                  borderWidth="1px"
                  borderColor={cardBorderColor}
                  textAlign="center"
                  whileHover="hover"
                  variants={feature.animation}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.3 }}
                  _hover={{
                    boxShadow: 'lg',
                  }}
                >
                  <Icon
                    as={feature.icon}
                    w={12}
                    h={12}
                    color="blue.500"
                    mb={4}
                    transition="all 0.3s ease"
                    _hover={{
                      transform: 'scale(1.1)',
                      color: 'blue.600',
                    }}
                  />
                  <Heading
                    as="h3"
                    size="md"
                    color={headingColor}
                    mb={4}
                    transition="all 0.3s ease"
                  >
                    {feature.title}
                  </Heading>
                  <motion.div
                    initial="initial"
                    animate="animate"
                    variants={textVariants}
                  >
                    <Text 
                      color={textColor}
                      transition="all 0.3s ease"
                    >
                      {feature.description}
                    </Text>
                  </motion.div>
                </MotionBox>
              ))}
            </SimpleGrid>

            {/* Duplicate set of features for seamless scrolling */}
            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              spacing={10}
              width="100%"
              flexShrink={0}
            >
              {features.map((feature, index) => (
                <MotionBox
                  key={`duplicate-${index}`}
                  p={8}
                  bg={containerBg}
                  borderRadius="full"
                  boxShadow="md"
                  borderWidth="1px"
                  borderColor={cardBorderColor}
                  textAlign="center"
                  whileHover="hover"
                  variants={feature.animation}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.3 }}
                  _hover={{
                    boxShadow: 'lg',
                  }}
                >
                  <Icon
                    as={feature.icon}
                    w={12}
                    h={12}
                    color="blue.500"
                    mb={4}
                    transition="all 0.3s ease"
                    _hover={{
                      transform: 'scale(1.1)',
                      color: 'blue.600',
                    }}
                  />
                  <Heading
                    as="h3"
                    size="md"
                    color={headingColor}
                    mb={4}
                    transition="all 0.3s ease"
                  >
                    {feature.title}
                  </Heading>
                  <motion.div
                    initial="initial"
                    animate="animate"
                    variants={textVariants}
                  >
                    <Text 
                      color={textColor}
                      transition="all 0.3s ease"
                    >
                      {feature.description}
                    </Text>
                  </motion.div>
                </MotionBox>
              ))}
            </SimpleGrid>
          </Flex>
        </Box>
      </Container>

      {/* Meet the Developers Section */}
      <Box
        bg={developerSectionBg}
        py={20}
        px={4}
        position="relative"
        zIndex="2"
      >
        <Container maxW="container.xl">
          <Heading
            as="h2"
            size="xl"
            textAlign="center"
            mb={10}
            color={headingColor}
            textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
          >
            Meet the Developers
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={8}>
            {developers.map((dev, index) => (
              <VStack
                key={index}
                spacing={3}
                p={4}
                bg={containerBg}
                borderRadius="lg"
                boxShadow="lg"
                borderWidth="1px"
                borderColor={cardBorderColor}
                textAlign="center"
                width="100%"
                backdropFilter="blur(10px)"
                position="relative"
                overflow="hidden"
                _hover={{
                   transform: 'translateY(-5px)',
                   boxShadow: 'xl',
                 }}
                 transition="all 0.3s ease"
              >
                <MotionBox
                  width="100%"
                  height="200px"
                  position="relative"
                  overflow="hidden"
                  borderRadius="lg"
                  mb={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  initial="animate"
                  whileHover="hover"
                  variants={imageContainerFlipVariants}
                >
                  {dev.name === 'Nkosinathi Radebe' ? (
                    <Image
                      src={nathiProfile}
                      alt={dev.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      objectPosition="center"
                      display="block"
                      margin="auto"
                      borderRadius="lg"
                    />
                  ) : dev.name === 'Okuhle Gadla' ? (
                    <Image
                      src={okuhleProfile}
                      alt={dev.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      objectPosition="center"
                      display="block"
                      margin="auto"
                      borderRadius="lg"
                    />
                  ) : dev.name === 'Mpho Ramokhoase' ? (
                    <Image
                      src={mphoProfile}
                      alt={dev.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      objectPosition="center"
                      display="block"
                      margin="auto"
                      borderRadius="lg"
                    />
                  ) : dev.name === 'Thembelihle Zulu' ? (
                    <Image
                      src={LihleProfile}
                      alt={dev.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      objectPosition="center"
                      display="block"
                      margin="auto"
                      borderRadius="lg"
                    />
                  ) : dev.name === 'Kgothatso Mokgashi' ? (
                    <Image
                      src={kgothatsoProfile}
                      alt={dev.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      objectPosition="center"
                      display="block"
                      margin="auto"
                      borderRadius="lg"
                    />
                  ) : (
                    <Avatar
                      size="full"
                      name={dev.name}
                      width="100%"
                      height="100%"
                      display="block"
                      margin="auto"
                      borderRadius="lg"
                    />
                  )}
                </MotionBox>

                <Box>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color={greetingColor}
                    textShadow="1px 1px 2px rgba(0, 0, 0, 0.5)"
                  >
                    {dev.name}
                  </Text>
                  <Text
                    fontSize="md"
                    color={greetingColor}
                    textShadow="1px 1px 2px rgba(0, 0, 0, 0.5)"
                    textDecoration="underline"
                    fontStyle="italic"
                  >
                    {dev.role}
                  </Text>
                  <Text
                    fontSize="sm"
                    color={greetingColor}
                    textAlign="center"
                    px={2}
                    textShadow="1px 1px 2px rgba(0, 0, 0, 0.5)"
                  >
                    {dev.description}
                  </Text>
                </Box>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* New Footer */}
      <Box
        as="footer"
        position="relative"
        zIndex="2"
        bg="rgba(0, 0, 0, 0.9)"
        py={12}
        mt={20}
      >
        <Container maxW="container.xl">
          <Stack spacing={10}>
            {/* Main Footer Content */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
              {/* Company Info */}
              <Stack spacing={4}>
                <Heading size="md" color={greetingColor}>GridX</Heading>
                <Text color={textColor} fontSize="sm">
                  Empowering South Africa with sustainable energy solutions and smart power management.
                </Text>
              </Stack>

              {/* Quick Links */}
              <Stack spacing={4}>
                <Heading size="sm" color={greetingColor}>Quick Links</Heading>
                <Link color={textColor} _hover={{ color: 'blue.400' }}>About Us</Link>
                <Link color={textColor} _hover={{ color: 'blue.400' }}>Services</Link>
                <Link color={textColor} _hover={{ color: 'blue.400' }}>Contact</Link>
                <Link 
                  as={RouterLink} 
                  to="/support" 
                  color={textColor} 
                  _hover={{ color: 'blue.400' }}
                >
                  Support
                </Link>
              </Stack>

              {/* Services */}
              <Stack spacing={4}>
                <Heading size="sm" color={greetingColor}>Services</Heading>
                <Link color={textColor} _hover={{ color: 'blue.400' }}>Solar Solutions</Link>
                <Link color={textColor} _hover={{ color: 'blue.400' }}>Power Management</Link>
                <Link color={textColor} _hover={{ color: 'blue.400' }}>Load Shedding</Link>
                <Link color={textColor} _hover={{ color: 'blue.400' }}>Energy Analytics</Link>
              </Stack>

              {/* Contact Info */}
              <Stack spacing={4}>
                <Heading size="sm" color={greetingColor}>Contact Us</Heading>
                <Text color={textColor} fontSize="sm">Email: gridx.noreply@gmail.com</Text>
                <Text color={textColor} fontSize="sm">Support Hours: Mon-Fri, 9:00-17:00</Text>
                <Text color={textColor} fontSize="sm">Address: Sandton, South Africa</Text>
              </Stack>
            </SimpleGrid>

            {/* Divider */}
            <Divider borderColor="gray.700" />

            {/* Copyright */}
            <Text color={textColor} fontSize="sm" textAlign="center">
              © {new Date().getFullYear()} GridX. All rights reserved.
            </Text>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
