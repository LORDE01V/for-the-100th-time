import React, { createContext, useState, useContext } from "react";

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
      card: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)"
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

export const useDashboard = () => useContext(DashboardContext); 