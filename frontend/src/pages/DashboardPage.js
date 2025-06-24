import React from 'react';
import {
  Box,
  SimpleGrid,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaArrowLeft, FaSolarPanel, FaCoins, FaTree, FaBolt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { DashboardProvider, useDashboard } from '../context/DashboardContext';
import EnergyModeToggle from '../components/widgets/EnergyModeToggle';
import BudgetDial from '../components/widgets/BudgetDial';
import DailyForecast from '../components/widgets/DailyForecast';
import ThemeSwitcher from '../components/widgets/ThemeSwitcher';
import SolarOutput from '../components/widgets/SolarOutput';
import WidgetLayout from '../components/widgets/WidgetLayout';
import EnergyAvatar from '../components/widgets/EnergyAvatar';
import ActivityReport from '../components/widgets/ActivityReport';
import AITipsPanel from '../components/AITipsPanel';
import ErrorBoundary from '../components/ErrorBoundary';
import { LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import DashboardCard from '../components/DashboardCard';

// Comment out or remove these lines:
// import StatusIndicator from '../components/widgets/StatusIndicator';
// import FinancialMetric from '../components/widgets/FinancialMetric';
// import ImpactMetrics from '../components/widgets/ImpactMetrics';

// Add missing variable declarations at the top
const dailySpend = 45.00;
const monthlyBudget = 1500;
const co2Saved = 120;
const treesEquivalent = 85;

// Keep only one declaration at the top with other mock values
const solarProduction = 8.2;  // kW
const batteryLevel = 75;      // %
const gridConsumption = 1.5;  // kW

function DashboardContent() {
  const navigate = useNavigate();
  const { headingColor, currentThemeConfig } = useDashboard();

  // Color mode values correctly inside component
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');

  // Move mock data either inside component or keep outside if static
  const energyData = [
    { time: '00:00', usage: 45 },
    { time: '06:00', usage: 30 },
    { time: '12:00', usage: 25 },
    { time: '18:00', usage: 40 }
  ];

  return (
    <Box
      minH="100vh"
      backgroundImage={currentThemeConfig.gradients.main}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment="fixed"
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
      <Box maxW="1400px" mx="auto" p={{ base: 4, md: 6, lg: 8 }} position="relative" zIndex={2}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8}>
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            onClick={() => navigate('/home')}
          >
            Back to Home
          </Button>
        </Flex>

        {/* Dashboard Title */}
        <Heading as="h1" size="xl" color={headingColor} mb={8}>
          Energy Dashboard
        </Heading>

        {/* Dashboard Grid */}
        <ErrorBoundary>
          <SimpleGrid 
            columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
            spacing={4}
            autoRows="minmax(200px, auto)"
          >
            {/* System Status Card */}
            <ErrorBoundary>
              <DashboardCard
                title="System Status"
                icon={FaSolarPanel}
                colSpan={1}
              >
                <Box p={4} bg={cardBg} borderRadius="md">
                  <Text fontWeight="bold" color={textColor}>System Status</Text>
                  <Text color={textColor}>Solar: {solarProduction}kW</Text>
                  <Text color={textColor}>Battery: {batteryLevel}%</Text>
                  <Text color={textColor}>Grid: {gridConsumption}kW</Text>
                </Box>
              </DashboardCard>
            </ErrorBoundary>

            {/* Energy Usage Card */}
            <ErrorBoundary>
              <DashboardCard
                title="Energy Usage"
                icon={FaBolt}
                colSpan={1}
              >
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={energyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="usage" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </DashboardCard>
            </ErrorBoundary>

            {/* Financial Overview Card */}
            <ErrorBoundary>
              <DashboardCard
                title="Financial Overview"
                icon={FaCoins}
                colSpan={1}
              >
                <Box p={4} bg={cardBg} borderRadius="md">
                  <VStack align="stretch" spacing={3}>
                    <Text fontWeight="bold" color={textColor}>Monthly Budget</Text>
                    <Text fontSize="2xl" color={textColor}>R{monthlyBudget}</Text>
                    <Progress value={(dailySpend * 30 / monthlyBudget) * 100} size="sm" colorScheme="blue" />
                    <Text fontSize="sm" color={textColor} opacity={0.7}>Daily Average: R{dailySpend}</Text>
                  </VStack>
                </Box>
              </DashboardCard>
            </ErrorBoundary>

            {/* Additional Cards */}
            <ErrorBoundary>
              <DashboardCard
                title="Environmental Impact"
                icon={FaTree}
                colSpan={1}
              >
                <Box p={4} bg={cardBg} borderRadius="md">
                  <Text fontWeight="bold" color={textColor}>Environmental Impact</Text>
                  <Text color={textColor}>CO₂ Saved: {co2Saved}kg</Text>
                  <Text color={textColor}>Trees Equivalent: {treesEquivalent}</Text>
                </Box>
              </DashboardCard>
            </ErrorBoundary>

            {/* First Row - Key Controls */}
            <ErrorBoundary>
              <EnergyModeToggle />
            </ErrorBoundary>
            
            <ErrorBoundary>
              <BudgetDial />
            </ErrorBoundary>

            <ErrorBoundary>
              <ThemeSwitcher />
            </ErrorBoundary>

            {/* Second Row - Visualizations */}
            <ErrorBoundary>
              <SolarOutput />
            </ErrorBoundary>

            <ErrorBoundary>
              <DailyForecast />
            </ErrorBoundary>

            {/* Third Row - Status & Activity */}
            <ErrorBoundary>
              <WidgetLayout />
            </ErrorBoundary>

            <ErrorBoundary>
              <EnergyAvatar />
            </ErrorBoundary>

            <ErrorBoundary>
              <ActivityReport />
            </ErrorBoundary>

            {/* Full Width Bottom Row */}
            <ErrorBoundary>
              <AITipsPanel />
            </ErrorBoundary>
          </SimpleGrid>
        </ErrorBoundary>
      </Box>
    </Box>
  );
}

function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

export default DashboardPage;
