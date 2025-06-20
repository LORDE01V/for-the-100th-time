import React, { createContext, useContext, useState, useEffect } from 'react';
import { energyModes, defaultWidgetLayout } from '../utils/mockData';

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

  const value = {
    energyMode,
    currentTheme,
    widgetLayout,
    toggleEnergyMode,
    updateTheme,
    toggleWidget,
    currentModeConfig: energyModes[energyMode],
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
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