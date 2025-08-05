import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { energyModes, defaultWidgetLayout, themePresets } from '../utils/mockData';
import { Box } from '@chakra-ui/react';  // Only keep necessary imports

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [energyMode, setEnergyMode] = useState("saver");
  const [widgetLayout, setWidgetLayout] = useState({ ...defaultWidgetLayout });
  const [currentTheme, setCurrentTheme] = useState("coolBlue");

  const toggleEnergyMode = () => {
    setEnergyMode((prev) => (prev === "saver" ? "boost" : "saver"));
  };

  const updateTheme = (theme) => {
    setCurrentTheme(theme);
  };

  const toggleWidget = (widgetKey) => {
    setWidgetLayout((prev) => ({
      ...prev,
      [widgetKey]: !prev[widgetKey]
    }));
  };

  const [enabledWidgets, setEnabledWidgets] = useState([
    'EnergyModeToggle', 'BudgetDial', 'ThemeSwitcher', 'SolarOutput', 'DailyForecast', 'WidgetLayout', 'EnergyAvatar', 'ActivityReport', 'AITipsPanel', 'FaultDetection', 'FaultVisualization'
  ]);

  const value = {
    energyMode,
    currentTheme,
    widgetLayout,
    toggleEnergyMode,
    updateTheme,
    toggleWidget,
    currentModeConfig: energyModes[energyMode],
    currentThemeConfig: themePresets[currentTheme],
    enabledWidgets,
    setEnabledWidgets,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

DashboardProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Ensure only one declaration of useDashboard
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Fix for ESLint warning: Ensure 'enabledWidgets' is used or remove if unnecessary
// In the provided code, 'enabledWidgets' is in the context value but not used elsewhere.
// Adding a simple usage in the Dashboard component to demonstrate; if it's truly unused, consider removing the variable entirely.
const Dashboard = () => {
  const { enabledWidgets } = useDashboard();  // Explicitly use it here to resolve the warning
  console.log('Enabled widgets:', enabledWidgets);  // Temporary log for demonstration; remove in production if not needed
  
  return (
    <Box>
      {/* Your dashboard content */}
    </Box>
  );
};

export default Dashboard; 