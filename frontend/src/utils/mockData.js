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
    name: 'Arctic Blue',
    colors: {
      primary: '#4299E1',
      secondary: '#63B3ED',
      accent: '#90CDF4',
      background: '#F7FAFC',
      text: '#2D3748'
    },
    gradients: {
      card: 'linear(to-br, #EBF8FF, #BEE3F8)'
    }
  },
  warmSunrise: {
    name: 'Warm Sunrise',
    colors: {
      primary: '#DD6B20',
      secondary: '#F6AD55',
      background: '#FFFAF0',
      text: '#2D3748',
      accent: '#F6AD55'
    },
    gradients: {
      main: 'linear(to-br, #DD6B20, #F6AD55)',
      card: 'linear(to-br, #FFFAF0, #FEEBC8)'
    }
  },
  warmOrange: {
    name: 'Warm Orange',
    colors: {
      primary: 'orange.500',
      secondary: 'red.500',
      background: 'orange.50',
      text: 'gray.800',
      accent: 'yellow.500',
    },
    gradients: {
      main: 'linear(to-br, orange.500, red.500)',
      card: 'linear(to-br, orange.50, red.50)'
    }
  },
  deepPurple: {
    name: 'Deep Purple',
    colors: {
      primary: 'purple.500',
      secondary: 'pink.500',
      background: 'purple.50',
      text: 'gray.800',
      accent: 'indigo.500',
    },
    gradients: {
      main: 'linear(to-br, purple.500, pink.500)',
      card: 'linear(to-br, purple.50, pink.50)'
    }
  },
  ecoGreen: {
    name: 'Eco Green',
    colors: {
      primary: '#48BB78',
      secondary: '#68D391',
      accent: '#9AE6B4',
      background: '#F0FFF4',
      text: '#2F855A'
    },
    gradients: {
      card: 'linear(to-br, #C6F6D5, #9AE6B4)'
    }
  },
  sunsetPink: {
    name: 'Sunset Pink',
    colors: {
      primary: '#ED64A6',
      secondary: '#F687B3',
      accent: '#FBB6CE',
      background: '#FFF5F7',
      text: '#97266D'
    },
    gradients: {
      card: 'linear(to-br, #FED7E2, #FBB6CE)'
    }
  }
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