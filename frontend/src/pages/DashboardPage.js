/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-undef */
import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Button,
  Flex,
  Heading,
  Text,
  ColorModeScript,
  useColorMode,
  VStack,
  IconButton,
  useToast,
  Spinner,
  HStack
} from '@chakra-ui/react';
import { FaBolt, FaTachometerAlt, FaCog, FaSignOutAlt, FaUser, FaWallet, FaComments, FaLightbulb, FaChartBar, FaQuestionCircle, FaMoon, FaSun } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate, NavLink } from 'react-router-dom';
import { DashboardProvider, useDashboard } from '../context/DashboardContext';
import EnergyModeToggle from '../components/widgets/EnergyModeToggle';
import BudgetDial from '../components/widgets/BudgetDial';
import DailyForecast from '../components/widgets/DailyForecast';
import SolarOutput from '../components/widgets/SolarOutput';
import WidgetLayout from '../components/widgets/WidgetLayout';
import EnergyAvatar from '../components/widgets/EnergyAvatar';
import ActivityReport from '../components/widgets/ActivityReport';
import AITipsPanel from '../components/AITipsPanel';
import ErrorBoundary from '../components/ErrorBoundary';
import DashboardCard from '../components/DashboardCard';
import { LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Line, Legend } from 'recharts';
import ThemeSwitcher from '../components/widgets/ThemeSwitcher';
import { auth } from '../services/api';  // Keep if used elsewhere
import { useSubscription } from '../context/SubscriptionContext';
import dashboardBg from '../assets/images/Mpho_Jesica_Create_a_high-resolution_background_image_for_a_modern_energy_man_afcb404c-1dac-4159-b82d-73e5d60dcf59.png';

// Add missing variable declarations at the top

// Keep only one declaration at the top with other mock values

// Add the subscription plans array here for use in this component
const subscriptionPlans = [
  { id: 'basic-lite', name: 'Basic Lite', price: 29 },
  { id: 'basic', name: 'Basic', price: 49 },
  { id: 'basic-plus', name: 'Basic Plus', price: 69 },
  { id: 'standard-lite', name: 'Standard Lite', price: 79 },
  { id: 'standard', name: 'Standard', price: 99 },
  { id: 'standard-plus', name: 'Standard Plus', price: 119 },
  { id: 'premium', name: 'Premium', price: 149 },
  { id: 'premium-plus', name: 'Premium Plus', price: 309 },
];

// Update the mockSuggestPlan function to return the full plan object
function mockSuggestPlan(data) {
  if (!data || !data.budget) return subscriptionPlans[0] || { name: 'Basic Plan', description: 'Default plan' };  // Fallback
  const suitablePlan = subscriptionPlans.reduce((bestPlan, plan) => {
    if (plan.price <= data.budget && plan.price > bestPlan.price) {
      return plan;
    }
    return bestPlan;
  }, subscriptionPlans[0] || { name: 'Basic Plan', description: 'Default plan' });
  return suitablePlan;  // Return the full plan object
}

const themePresets = {
  arcticBlue: {
    bg: 'rgba(173, 216, 230, 0.18)',
    borderColor: 'rgba(173, 216, 230, 0.35)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
  },
  warmSunrise: {
    bg: 'rgba(255, 223, 186, 0.18)',
    borderColor: 'rgba(255, 183, 94, 0.35)',
    boxShadow: '0 8px 32px 0 rgba(255, 183, 94, 0.18)',
  },
  // ...add more themes
};

function DashboardContent() {
  const navigate = useNavigate();
  const { setEnabledWidgets, enabledWidgets } = useDashboard();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { selectedPlan: recommendedPlan } = useSubscription();
  const [selectedTheme, setSelectedTheme] = useState('arcticBlue');

  // Update theme variables to be dynamic based on color mode
  const backgroundColor = colorMode === 'light' ? '#ffffff' : '#1e1e2f';  // Light: white, Dark: dark background
  const cardBg = colorMode === 'light' ? '#ffffff' : '#2b2b3d';  // Light: white, Dark: dark card
  const textColor = colorMode === 'light' ? '#000000' : '#ffffff';  // Light: black, Dark: white
  const accentColor = 'teal.300';  // Keep accent as is

  // Updated energyData to end at 17:00
  const energyData = [
    { time: '00:00', usage: 45 },
    { time: '01:00', usage: 42 },
    { time: '02:00', usage: 40 },
    { time: '03:00', usage: 38 },
    { time: '04:00', usage: 35 },
    { time: '05:00', usage: 32 },
    { time: '06:00', usage: 30 },
    { time: '07:00', usage: 28 },
    { time: '08:00', usage: 25 },
    { time: '09:00', usage: 22 },
    { time: '10:00', usage: 20 },
    { time: '11:00', usage: 18 },
    { time: '12:00', usage: 15 },
    { time: '13:00', usage: 14 },
    { time: '14:00', usage: 16 },
    { time: '15:00', usage: 18 },
    { time: '16:00', usage: 20 },
    { time: '17:00', usage: 22 },
  ];

  // Default enabled widgets (can be toggled via user interaction)
  if (!enabledWidgets || enabledWidgets.length === 0) {
    setEnabledWidgets(['EnergyModeToggle', 'BudgetDial', 'ThemeSwitcher', 'SolarOutput', 'DailyForecast', 'WidgetLayout', 'EnergyAvatar', 'ActivityReport', 'AITipsPanel']);  // Initialize if needed
  }

  const glassCardStyle = {
    bg: themePresets[selectedTheme].bg,
    border: '2px solid rgba(255,255,255,0.7)',
    borderColor: themePresets[selectedTheme].borderColor,
    boxShadow: themePresets[selectedTheme].boxShadow,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '2xl',
    transition: 'background 0.3s, border 0.3s',
  };

  // Common style for both buttons
  const bubbleButtonProps = {
    borderRadius: "full",
    boxSize: "56px",
    fontSize: "2xl",
    boxShadow: "lg",
    bg: "teal.400",
    color: "white",
    border: "4px solid white", // Optional: makes the border stand out
    _hover: { bg: "teal.500" },
    zIndex: 9999,
  };

  return (
    <Box
      minH="100vh"
      backgroundImage={`url(${dashboardBg})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      position="relative"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={colorMode === 'light' ? 'rgba(255,255,255,0.1)' : 'rgba(30,30,47,0.1)'}
        zIndex={0}
      />
      <Box position="relative" zIndex={1} p={8}>
        <Flex direction="row" w="full" maxW="1400px" mx="auto">
          <Box w="full" px={8} py={6}>
            <Box
              display="inline-block"
              bg="rgba(0,0,0,0.45)"
              px={6}
              py={2}
              borderRadius="lg"
              mt={6}
              mb={4}
              mx="auto"
              style={{ display: 'block' }}
            >
              <Heading
                as="h1"
                size="xl"
                color="white"
                textShadow="0 2px 8px rgba(0,0,0,0.7)"
                textAlign="center"
              >
                Energy Dashboard
              </Heading>
            </Box>

            <Box textAlign="center" mb={8}>
              <Button
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const mockData = {
                      usageHours: 10,  // Hardcoded mock value
                      budget: 500,     // Hardcoded mock value
                      deviceCount: 5   // Hardcoded mock value
                    };
                    const plan = mockSuggestPlan(mockData);  // Now returns full object
                    toast({
                      title: `Recommended: ${plan.name}`,
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });
                  } catch (error) {
                    toast({
                      title: 'Failed to fetch recommendation',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                rightIcon={isLoading ? <Spinner size="sm" /> : null}
                isLoading={isLoading}
                colorScheme="teal"
                size="lg"
              >
                Suggest Plan
              </Button>
            </Box>

            <SimpleGrid columns={3} spacing={6}>
              {enabledWidgets.includes('EnergyModeToggle') && (
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05, boxShadow: 'lg' }}
                    as={Box}
                    bg={cardBg}
                    p={6}
                    borderRadius="2xl"
                    boxShadow="md"
                  >
                    <Box {...glassCardStyle}>
                      <EnergyModeToggle />
                    </Box>
                  </motion.div>
                </ErrorBoundary>
              )}
              {enabledWidgets.includes('ThemeSwitcher') && (
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05, boxShadow: 'lg' }}
                  >
                    <Box {...glassCardStyle}>
                      <ThemeSwitcher />
                    </Box>
                  </motion.div>
                </ErrorBoundary>
              )}
              <DashboardCard
                title={`Recommended Plan: ${recommendedPlan ? recommendedPlan.name : 'None'}`}
                isHighlighted={recommendedPlan}
                borderColor={recommendedPlan ? 'green.400' : 'transparent'}
                boxShadow={recommendedPlan ? 'outline' : 'md'}
                content={
                  recommendedPlan ? (
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold">Plan Name: {recommendedPlan.name}</Text>
                      <Text>Description: {recommendedPlan.description || 'No description available.'}</Text>
                      <Text fontWeight="bold">Price: ${recommendedPlan.price}</Text>
                      <Text fontWeight="bold">Features:</Text>
                      {recommendedPlan.features && recommendedPlan.features.length > 0 ? (
                        <VStack align="start" pl={4}>
                          {recommendedPlan.features.map((feature, index) => (
                            <Text key={index} fontSize="sm">- {feature}</Text>
                          ))}
                        </VStack>
                      ) : (
                        <Text>No features available.</Text>
                      )}
                      <Text fontWeight="bold">ID: {recommendedPlan.id || 'N/A'}</Text>
                    </VStack>
                  ) : 'No plan recommended yet'
                }
                sx={glassCardStyle}
              />
              {enabledWidgets.includes('DailyForecast') && (
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    as={Box}
                    bg={cardBg}
                    p={6}
                    borderRadius="2xl"
                    boxShadow="md"
                    _hover={{ boxShadow: "lg" }}
                  >
                    <Box {...glassCardStyle}>
                      <DailyForecast />
                    </Box>
                  </motion.div>
                </ErrorBoundary>
              )}
              {enabledWidgets.includes('EnergyAvatar') && (  // Assuming EnergyAvatar is Energy Status
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    as={Box}
                    bg={cardBg}
                    p={6}
                    borderRadius="2xl"
                    boxShadow="md"
                    _hover={{ boxShadow: "lg" }}
                  >
                    <Box {...glassCardStyle}>
                      <EnergyAvatar />
                    </Box>
                  </motion.div>
                </ErrorBoundary>
              )}

              {enabledWidgets.includes('BudgetDial') && (
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    as={Box}
                    bg={cardBg}
                    p={6}
                    borderRadius="2xl"
                    boxShadow="md"
                    _hover={{ boxShadow: "lg" }}
                  >
                    <Box {...glassCardStyle}>
                      <BudgetDial />
                    </Box>
                  </motion.div>
                </ErrorBoundary>
              )}
              {enabledWidgets.includes('SolarOutput') && (
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    as={Box}
                    bg={cardBg}
                    p={6}
                    borderRadius="2xl"
                    boxShadow="md"
                    _hover={{ boxShadow: "lg" }}
                  >
                    <Box {...glassCardStyle}>
                      <SolarOutput />
                    </Box>
                  </motion.div>
                </ErrorBoundary>
              )}

              {enabledWidgets.includes('AITipsPanel') && (
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    as={Box}
                    bg={cardBg}
                    p={6}
                    borderRadius="2xl"
                    boxShadow="md"
                    _hover={{ boxShadow: "lg" }}
                  >
                    <Box {...glassCardStyle}>
                      <AITipsPanel />
                    </Box>
                  </motion.div>
                </ErrorBoundary>
              )}
              {enabledWidgets.includes('ActivityReport') && (
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    as={Box}
                    bg={cardBg}
                    p={6}
                    borderRadius="2xl"
                    boxShadow="md"
                    _hover={{ boxShadow: "lg" }}
                  >
                    <Box {...glassCardStyle}>
                      <ActivityReport />
                    </Box>
                  </motion.div>
                </ErrorBoundary>
              )}
              {enabledWidgets.includes('WidgetLayout') && (
                <ErrorBoundary>
                  <motion.div>
                    <Box {...glassCardStyle}>
                      <WidgetLayout />
                    </Box>
                  </motion.div>
                </ErrorBoundary>
              )}
            </SimpleGrid>

            <Box w="full" mt={8} {...glassCardStyle} p={6}>
              <DashboardCard title="Loadshedding Updates" icon={FaBolt}>
                <Box h="400px" w="100%" display="flex" alignItems="center" justifyContent="center">
                  <Text color="gray.400" fontSize="lg" textAlign="center">
                    Loadshedding updates will appear here.
                  </Text>
                </Box>
              </DashboardCard>
            </Box>
          </Box>
        </Flex>

        {/* Chatbot Bubble Button */}
        <IconButton
          aria-label="Open Chatbot"
          icon={<FaComments />}
          position="fixed"
          bottom="20px"
          right="20px"
          {...bubbleButtonProps}
          // onClick={...} // your chatbot open handler
        />

        {/* Toggle Mode Bubble Button (just above chatbot) */}
        <IconButton
          aria-label="Toggle color mode"
          icon={<FaSun />}
          onClick={toggleColorMode}
          position="fixed"
          bottom="90px"   // 24px (chatbot) + 56px (button size) + 10px (gap)
          right="20px"
          {...bubbleButtonProps}
        />
      </Box>
    </Box>
  );
}

function DashboardPage() {
  return (
    <DashboardProvider>
      <ColorModeScript initialColorMode="dark" />
      <DashboardContent />
    </DashboardProvider>
  );
}

export default DashboardPage;