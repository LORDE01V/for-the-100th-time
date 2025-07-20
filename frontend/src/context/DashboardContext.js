import React, { createContext, useContext, useState, useEffect } from 'react';
import { energyModes, defaultWidgetLayout, themePresets } from '../utils/mockData';
import { Box, Flex, Text, Button, Heading, SimpleGrid } from '@chakra-ui/react';
import { FaHome, FaTachometerAlt, FaCog, FaSignOutAlt, FaBolt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import EnergyModeToggle from '../components/widgets/EnergyModeToggle';
import DailyForecast from '../components/widgets/DailyForecast';
import EnergyAvatar from '../components/widgets/EnergyAvatar';
import BudgetDial from '../components/widgets/BudgetDial';
import SolarOutput from '../components/widgets/SolarOutput';
import ThemeSwitcher from '../components/widgets/ThemeSwitcher';
import AITipsPanel from '../components/AITipsPanel';
import ActivityReport from '../components/widgets/ActivityReport';
import WidgetLayout from '../components/widgets/WidgetLayout';
import DashboardCard from '../components/DashboardCard';
import ErrorBoundary from '../components/ErrorBoundary';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  // Energy Mode State
  const [energyMode, setEnergyMode] = useState(() => {
    const saved = localStorage.getItem('energyMode');
    return saved || 'saver';
  });

  // Theme State
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('dashboardTheme');
    return saved || 'coolBlue';
  });

  // Widget Layout State
  const [widgetLayout, setWidgetLayout] = useState(() => {
    const saved = localStorage.getItem('widgetLayout');
    return saved ? JSON.parse(saved) : defaultWidgetLayout;
  });

  const currentThemeConfig = themePresets[currentTheme] || themePresets.coolBlue;

  // Persist Energy Mode
  useEffect(() => {
    localStorage.setItem('energyMode', energyMode);
  }, [energyMode]);

  // Persist Theme
  useEffect(() => {
    localStorage.setItem('dashboardTheme', currentTheme);
  }, [currentTheme]);

  // Persist Widget Layout
  useEffect(() => {
    localStorage.setItem('widgetLayout', JSON.stringify(widgetLayout));
  }, [widgetLayout]);

  const toggleEnergyMode = () => {
    setEnergyMode(prev => prev === 'saver' ? 'boost' : 'saver');
  };

  const updateTheme = (theme) => {
    setCurrentTheme(theme);
  };

  const toggleWidget = (widgetId) => {
    setWidgetLayout(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }));
  };

  const [enabledWidgets, setEnabledWidgets] = useState(['EnergyModeToggle', 'BudgetDial', 'ThemeSwitcher', 'SolarOutput', 'DailyForecast', 'WidgetLayout', 'EnergyAvatar', 'ActivityReport', 'AITipsPanel']);  // Initial default array

  const value = {
    energyMode,
    currentTheme,
    widgetLayout,
    toggleEnergyMode,
    updateTheme,
    toggleWidget,
    currentModeConfig: energyModes[energyMode],
    currentThemeConfig,
    enabledWidgets,
    setEnabledWidgets,
  };

  return (
    <DashboardContext.Provider value={value}>
      <Box
        minH="100vh"
        bgGradient={currentThemeConfig.gradients.main}
        backgroundAttachment="fixed"
      >
        {children}
      </Box>
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

const Dashboard = () => {
  const { enabledWidgets } = useDashboard();
  const navigate = useNavigate();

  // Override with dark theme colors as per instructions
  const backgroundColor = '#1e1e2f';  // Dark background
  const cardBg = '#2b2b3d';  // Card backgrounds
  const textColor = '#ffffff';  // Light text
  const accentColor = 'teal.300';  // Accent for highlights

  return (
    <Box
      minH="100vh"
      bg={backgroundColor}  // Apply dark background
      color={textColor}  // Apply light text color
      overflowY="auto"
      px={{ base: 4, md: 8 }}
      py={6}
    >
      <Flex direction="row" w="full" maxW="1400px" mx="auto">
        {/* Vertical Sidebar */}
        <Box
          as="nav"
          w={{ base: '60px', md: '200px' }}  // Collapse on small screens
          bg="gray.800"
          h="100vh"
          position="fixed"
          left={0}
          p={4}
          borderRightWidth="1px"
          borderColor="gray.700"
        >
          <Flex direction="column" align="center" gap={6}>
            <Text fontSize="lg" fontWeight="bold">Menu</Text>
            <Button variant="ghost" onClick={() => navigate('/home')} leftIcon={<FaHome />} />
            <Button variant="ghost" onClick={() => navigate('/dashboard')} leftIcon={<FaTachometerAlt />} />
            <Button variant="ghost" onClick={() => navigate('/settings')} leftIcon={<FaCog />} />
            <Button variant="ghost" onClick={() => navigate('/logout')} leftIcon={<FaSignOutAlt />} />
          </Flex>
        </Box>

        {/* Main Content with Padding for Sidebar */}
        <Box ml={{ base: 0, md: '200px' }} w="full" px={8} py={6}>
          <Heading as="h1" size="xl" color={accentColor} mb={8}>
            Energy Dashboard
          </Heading>

          {/* Widget Grid with Specified Grouping */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={6}
            mb={8}
          >
            {/* Top Row: Energy Mode, Daily Forecast, Energy Status */}
            {enabledWidgets.includes('EnergyModeToggle') && (
              <ErrorBoundary>
                <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" _hover={{ boxShadow: "lg" }}>
                  <EnergyModeToggle />
                </Box>
              </ErrorBoundary>
            )}
            {enabledWidgets.includes('DailyForecast') && (
              <ErrorBoundary>
                <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" _hover={{ boxShadow: "lg" }}>
                  <DailyForecast />
                </Box>
              </ErrorBoundary>
            )}
            {enabledWidgets.includes('EnergyAvatar') && (  // Assuming EnergyAvatar is Energy Status
              <ErrorBoundary>
                <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" _hover={{ boxShadow: "lg" }}>
                  <EnergyAvatar />
                </Box>
              </ErrorBoundary>
            )}

            {/* Second Row: Monthly Budget, Solar Output, Theme Presets */}
            {enabledWidgets.includes('BudgetDial') && (
              <ErrorBoundary>
                <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" _hover={{ boxShadow: "lg" }}>
                  <BudgetDial />
                </Box>
              </ErrorBoundary>
            )}
            {enabledWidgets.includes('SolarOutput') && (
              <ErrorBoundary>
                <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" _hover={{ boxShadow: "lg" }}>
                  <SolarOutput />
                </Box>
              </ErrorBoundary>
            )}
            {enabledWidgets.includes('ThemeSwitcher') && (
              <ErrorBoundary>
                <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" _hover={{ boxShadow: "lg" }}>
                  <ThemeSwitcher />
                </Box>
              </ErrorBoundary>
            )}

            {/* Third Row: AI Tips, Activity Report, Widget Layout */}
            {enabledWidgets.includes('AITipsPanel') && (
              <ErrorBoundary>
                <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" _hover={{ boxShadow: "lg" }}>
                  <AITipsPanel />
                </Box>
              </ErrorBoundary>
            )}
            {enabledWidgets.includes('ActivityReport') && (
              <ErrorBoundary>
                <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" _hover={{ boxShadow: "lg" }}>
                  <ActivityReport />
                </Box>
              </ErrorBoundary>
            )}
            {enabledWidgets.includes('WidgetLayout') && (
              <ErrorBoundary>
                <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" _hover={{ boxShadow: "lg" }}>
                  <WidgetLayout />
                </Box>
              </ErrorBoundary>
            )}
          </SimpleGrid>

          {/* Full-width Energy Usage Chart at the Bottom */}
          <Box w="full" mt={8} bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" _hover={{ boxShadow: "lg" }}>
            <ErrorBoundary>
              <DashboardCard title="Energy Usage" icon={FaBolt}>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis
                        dataKey="name"
                        tickFormatter={(str) => {
                          if (str === '2023-04-24') {
                            return '24';
                          }
                          return '';
                        }}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => {
                          return `Usage: ${value} kWh`;
                        }}
                      />
                      <Line type="monotone" dataKey="usage" stroke={accentColor} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </DashboardCard>
            </ErrorBoundary>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Dashboard; 