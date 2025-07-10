import React, { useState } from 'react';
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
  useColorModeValue,
  Select,
} from '@chakra-ui/react';
import {
  FaComments,
  FaSun
} from 'react-icons/fa';
import { motion } from 'framer-motion';
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
import ThemeSwitcher from '../components/widgets/ThemeSwitcher';
import { useSubscription } from '../context/SubscriptionContext';
import LoadsheddingStatus from '../components/widgets/LoadsheddingStatus'; // Correct import path
import dashboardBg from '../assets/images/Mpho_Jesica_Create_a_high-resolution_background_image_for_a_modern_energy_man_afcb404c-1dac-4159-b82d-73e5d60dcf59.png';
import { mockAreas } from '../utils/mockData';



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

function mockSuggestPlan(data) {
  if (!data || !data.budget) return subscriptionPlans[0] || { name: 'Basic Plan', description: 'Default plan' };
  const suitablePlan = subscriptionPlans.reduce((bestPlan, plan) => {
    if (plan.price <= data.budget && plan.price > bestPlan.price) {
      return plan;
    }
    return bestPlan;
  }, subscriptionPlans[0] || { name: 'Basic Plan', description: 'Default plan' });
  return suitablePlan;
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
};

function DashboardContent() {
  console.log('DashboardContent is rendering');
  const { setEnabledWidgets, enabledWidgets, selectedArea, setSelectedArea } = useDashboard();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { selectedPlan: recommendedPlan } = useSubscription();
  
  const cardBg = useColorModeValue('white', 'gray.800'); 

  if (!enabledWidgets || enabledWidgets.length === 0) {
    setEnabledWidgets(['EnergyModeToggle', 'BudgetDial', 'ThemeSwitcher', 'SolarOutput', 'DailyForecast', 'WidgetLayout', 'EnergyAvatar', 'ActivityReport', 'AITipsPanel', 'LoadsheddingStatus']);
  }

  const glassCardStyle = {
    bg: themePresets['arcticBlue'].bg,
    border: '2px solid rgba(255,255,255,0.7)',
    borderColor: themePresets['arcticBlue'].borderColor,
    boxShadow: themePresets['arcticBlue'].boxShadow,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '2xl',
    transition: 'background 0.3s, border 0.3s',
  };

  const bubbleButtonProps = {
    borderRadius: "full",
    boxSize: "56px",
    fontSize: "2xl",
    boxShadow: "lg",
    bg: "teal.400",
    color: "white",
    border: "4px solid white",
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
                      usageHours: 10,
                      budget: 500,
                      deviceCount: 5
                    };
                    const plan = mockSuggestPlan(mockData);
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
              <Select
                placeholder="Select Area for Loadshedding"
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const area = mockAreas.find(a => a.id === selectedId);
                  setSelectedArea(area);
                }}
                value={selectedArea ? selectedArea.id : ""}
                mt={4}
                bg={cardBg}
                color="white"
              >
                {mockAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </Select>
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
                      <DailyForecast selectedArea={selectedArea} />
                    </Box>
                  </motion.div>
                </ErrorBoundary>
              )}
              {enabledWidgets.includes('EnergyAvatar') && (
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
                      <SolarOutput selectedArea={selectedArea} />
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
              {/* Loadshedding Status Widget */}
              {enabledWidgets.includes('LoadsheddingStatus') && (
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
                      <LoadsheddingStatus selectedArea={selectedArea} />
                    </Box>
                  </motion.div>
                </ErrorBoundary>
              )}
            </SimpleGrid>
          </Box>
        </Flex>

        {/* Chatbot Bubble Button */}
        <IconButton
          aria-label="Open Chatbot"
          icon={<FaComments />}
          position="fixed"
          bottom="24px"
          right="24px"
          {...bubbleButtonProps}
        />

        {/* Toggle Mode Bubble Button (just above chatbot) */}
        <IconButton
          aria-label="Toggle color mode"
          icon={<FaSun />}
          onClick={toggleColorMode}
          position="fixed"
          bottom="90px"
          right="24px"
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
