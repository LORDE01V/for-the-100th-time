/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState } from 'react';
import { energyModes } from '../utils/mockData';
import { Box, Flex, Text, Button, Heading, SimpleGrid } from '@chakra-ui/react';
import { FaHome, FaTachometerAlt, FaCog, FaSignOutAlt, FaBolt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import EnergyModeToggle from '../components/widgets/EnergyModeToggle';
import DailyForecast from '../components/widgets/DailyForecast';
import EnergyAvatar from '../components/widgets/EnergyAvatar';
import BudgetDial from '../components/widgets/BudgetDial';
import SolarOutput from '../components/widgets/SolarOutput';
import ThemeSwitcher from '../components/widgets/ThemeSwitcher';
import AITipsPanel from '../components/AITipsPanel';
import ActivityReport from '../components/widgets/ActivityReport';
import WidgetLayout from '../components/widgets/WidgetLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadsheddingStatus from '../components/widgets/LoadsheddingStatus'; // Added missing import
import PropTypes from 'prop-types';

export const DashboardContext = createContext();

const defaultThemeConfig = {
  colors: {
    primary: "#3182ce",
    text: "#2d3748",
  }
};

const THEME_PRESETS = {
  arcticBlue: {
    colors: {
      primary: "#3182ce",
      text: "#2d3748",
    },
    gradients: {
      card: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
    },
    name: "Arctic Blue"
  },
  warmSunrise: {
    colors: {
      primary: "#ffb347",
      text: "#2d3748",
    },
    gradients: {
      card: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)" // Fixed extra quote
    },
    name: "Warm Sunrise"
  }
};

const defaultModeConfig = {
  color: "teal",
  description: "Saver mode is active.",
};

// List of all widget keys you want to show
const ALL_WIDGETS = [
  "EnergyModeToggle",
  "BudgetDial",
  "ThemeSwitcher",
  "SolarOutput",
  "DailyForecast",
  "WidgetLayout",
  "EnergyAvatar",
  "ActivityReport",
  "AITipsPanel",
  "LoadsheddingStatus"
];

// Default layout: all widgets visible
const defaultWidgetLayout = ALL_WIDGETS.reduce((acc, key) => {
  acc[key] = true;
  return acc;
}, {});

export const DashboardProvider = ({ children }) => {
  const [selectedEskomArea, setSelectedEskomArea] = useState(null);
  const [enabledWidgets, setEnabledWidgets] = useState([...ALL_WIDGETS]);
  const [energyMode, setEnergyMode] = useState("saver");
  const [widgetLayout, setWidgetLayout] = useState({ ...defaultWidgetLayout });
  const [currentTheme, setCurrentTheme] = useState("arcticBlue");

  const selectEskomArea = (area) => setSelectedEskomArea(area);

  const toggleEnergyMode = () => {
    setEnergyMode((prev) => (prev === "saver" ? "boost" : "saver"));
  };

  const toggleWidget = (key) => {
    setWidgetLayout((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setEnabledWidgets((prev) =>
      prev.includes(key)
        ? prev.filter((w) => w !== key)
        : [...prev, key]
    );
  };

  const updateTheme = (themeKey) => {
    if (THEME_PRESETS[themeKey]) {
      setCurrentTheme(themeKey);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        selectedEskomArea,
        selectEskomArea,
        enabledWidgets,
        setEnabledWidgets,
        currentTheme,
        updateTheme,
        currentThemeConfig: THEME_PRESETS[currentTheme] || defaultThemeConfig,
        energyMode,
        toggleEnergyMode,
        currentModeConfig: defaultModeConfig,
        widgetLayout,
        toggleWidget,
      }}
      >
        {children}
    </DashboardContext.Provider>
  );
};

DashboardProvider.propTypes = {
  children: PropTypes.node.isRequired,
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
          </SimpleGrid>
        </Box>
      </Flex>
    </Box>
  );
}; 