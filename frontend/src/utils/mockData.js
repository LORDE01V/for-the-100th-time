// Energy Mode Data
export const energyModes = {
  saver: {
    name: 'Saver Mode',
    description: 'Optimizes for low consumption',
    color: 'teal',
    icon: 'leaf',
  },
  boost: {
    name: 'Boost Mode',
    description: 'Prioritizes performance',
    color: 'orange',
    icon: 'zap',
  },
};

// Weekly Heatmap Data (7x24 grid)
export const weeklyHeatmapData = Array.from({ length: 7 }, () =>
  Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
);

// Budget Data
export const budgetData = {
  current: 750,
  max: 1000,
  unit: 'kWh',
  history: Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000)),
};

// Daily Energy Forecast
export const dailyForecast = [
  { hour: '00:00', usage: 20, icon: 'moon' },
  { hour: '06:00', usage: 35, icon: 'sunrise' },
  { hour: '12:00', usage: 85, icon: 'sun' },
  { hour: '18:00', usage: 65, icon: 'sunset' },
  { hour: '24:00', usage: 25, icon: 'moon' },
];

// Theme Presets
export const themePresets = {
  coolBlue: {
    name: 'Cool Blue',
    colors: {
      primary: 'blue.500',
      secondary: 'cyan.500',
      accent: 'teal.500',
    },
  },
  warmOrange: {
    name: 'Warm Orange',
    colors: {
      primary: 'orange.500',
      secondary: 'red.500',
      accent: 'yellow.500',
    },
  },
  deepPurple: {
    name: 'Deep Purple',
    colors: {
      primary: 'purple.500',
      secondary: 'pink.500',
      accent: 'indigo.500',
    },
  },
};

// Energy Avatar States
export const avatarStates = {
  happy: {
    emoji: '😊',
    label: 'Doing Great!',
    threshold: 70,
  },
  neutral: {
    emoji: '😐',
    label: 'Caution!',
    threshold: 40,
  },
  concern: {
    emoji: '😟',
    label: 'Over Budget',
    threshold: 0,
  },
};

// Solar Output Data
export const solarOutputData = {
  current: 76,
  history: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
  peak: 100,
};

// Widget Layout Configuration
export const defaultWidgetLayout = {
  energyMode: true,
  weeklyHeatmap: true,
  budgetDial: true,
  dailyForecast: true,
  themeSwitcher: true,
  energyAvatar: true,
  solarOutput: true,
};

// Activity Report Data
export const activityReportData = {
  topUps: [
    { date: '2024-03-01', amount: 100, type: 'credit' },
    { date: '2024-03-15', amount: 150, type: 'credit' },
  ],
  usage: [
    { date: '2024-03-01', amount: 25, type: 'debit' },
    { date: '2024-03-02', amount: 30, type: 'debit' },
  ],
  savings: [
    { date: '2024-03-01', amount: 15, type: 'credit' },
    { date: '2024-03-02', amount: 20, type: 'credit' },
  ],
  budgetProgress: 75,
  alerts: [
    { date: '2024-03-01', message: 'Low credit warning', type: 'warning' },
    { date: '2024-03-15', message: 'Budget threshold reached', type: 'info' },
  ],
}; 