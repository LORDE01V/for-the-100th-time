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

// Expand activityReportData with more mock entries
export const activityReportData = {
  topUps: [
    { date: '2024-03-01', amount: 100, type: 'credit' },
    { date: '2024-03-15', amount: 150, type: 'credit' },
    { date: '2024-04-01', amount: 200, type: 'credit' },
    { date: '2024-04-15', amount: 120, type: 'credit' },
    { date: '2024-05-01', amount: 180, type: 'credit' },
    { date: '2024-05-15', amount: 250, type: 'credit' },
    { date: '2024-06-01', amount: 300, type: 'credit' },
    { date: '2024-06-15', amount: 110, type: 'credit' },
    { date: '2024-07-01', amount: 140, type: 'credit' },
    { date: '2024-07-15', amount: 160, type: 'credit' },
    { date: '2024-08-01', amount: 190, type: 'credit' },
    { date: '2024-08-15', amount: 210, type: 'credit' },
    { date: '2024-09-01', amount: 230, type: 'credit' },
    { date: '2024-09-15', amount: 150, type: 'credit' },
    { date: '2024-10-01', amount: 170, type: 'credit' },
    { date: '2024-10-15', amount: 220, type: 'credit' },
    { date: '2024-11-01', amount: 240, type: 'credit' },
    { date: '2024-11-15', amount: 130, type: 'credit' },
    { date: '2024-12-01', amount: 180, type: 'credit' },
    { date: '2024-12-15', amount: 200, type: 'credit' },
    { date: '2024-01-01', amount: 110, type: 'credit' },
    { date: '2024-01-15', amount: 140, type: 'credit' },
    { date: '2024-02-01', amount: 160, type: 'credit' },
    { date: '2024-02-15', amount: 190, type: 'credit' },
    { date: '2024-03-01', amount: 210, type: 'credit' },
    // Adding more to reach over 100 total entries across all arrays
    { date: '2024-03-02', amount: 120, type: 'credit' },
    { date: '2024-03-03', amount: 130, type: 'credit' },
    { date: '2024-03-04', amount: 140, type: 'credit' },
    { date: '2024-03-05', amount: 150, type: 'credit' },
    { date: '2024-03-06', amount: 160, type: 'credit' },
    { date: '2024-03-07', amount: 170, type: 'credit' },
    { date: '2024-03-08', amount: 180, type: 'credit' },
    { date: '2024-03-09', amount: 190, type: 'credit' },
    { date: '2024-03-10', amount: 200, type: 'credit' },
    { date: '2024-03-11', amount: 210, type: 'credit' },
    { date: '2024-03-12', amount: 220, type: 'credit' },
    { date: '2024-03-13', amount: 230, type: 'credit' },
    { date: '2024-03-14', amount: 240, type: 'credit' },
    { date: '2024-03-15', amount: 250, type: 'credit' },
    { date: '2024-03-16', amount: 260, type: 'credit' },
    { date: '2024-03-17', amount: 270, type: 'credit' },
    { date: '2024-03-18', amount: 280, type: 'credit' },
    { date: '2024-03-19', amount: 290, type: 'credit' },
    { date: '2024-03-20', amount: 300, type: 'credit' },
    { date: '2024-03-21', amount: 310, type: 'credit' },
    { date: '2024-03-22', amount: 320, type: 'credit' },
    { date: '2024-03-23', amount: 330, type: 'credit' },
    { date: '2024-03-24', amount: 340, type: 'credit' },
    { date: '2024-03-25', amount: 350, type: 'credit' }
  ],
  usage: [
    { date: '2024-03-01', amount: 25, type: 'debit' },
    { date: '2024-03-02', amount: 30, type: 'debit' },
    { date: '2024-04-01', amount: 35, type: 'debit' },
    { date: '2024-04-02', amount: 40, type: 'debit' },
    { date: '2024-05-01', amount: 45, type: 'debit' },
    { date: '2024-05-02', amount: 50, type: 'debit' },
    { date: '2024-06-01', amount: 55, type: 'debit' },
    { date: '2024-06-02', amount: 60, type: 'debit' },
    { date: '2024-07-01', amount: 65, type: 'debit' },
    { date: '2024-07-02', amount: 70, type: 'debit' },
    { date: '2024-08-01', amount: 75, type: 'debit' },
    { date: '2024-08-02', amount: 80, type: 'debit' },
    { date: '2024-09-01', amount: 85, type: 'debit' },
    { date: '2024-09-02', amount: 90, type: 'debit' },
    { date: '2024-10-01', amount: 95, type: 'debit' },
    { date: '2024-10-02', amount: 100, type: 'debit' },
    { date: '2024-11-01', amount: 105, type: 'debit' },
    { date: '2024-11-02', amount: 110, type: 'debit' },
    { date: '2024-12-01', amount: 115, type: 'debit' },
    { date: '2024-12-02', amount: 120, type: 'debit' },
    { date: '2024-01-01', amount: 125, type: 'debit' },
    { date: '2024-01-02', amount: 130, type: 'debit' },
    { date: '2024-02-01', amount: 135, type: 'debit' },
    { date: '2024-02-02', amount: 140, type: 'debit' },
    { date: '2024-03-01', amount: 145, type: 'debit' },
    // Continuing to add more
    { date: '2024-03-03', amount: 150, type: 'debit' },
    { date: '2024-03-04', amount: 155, type: 'debit' },
    { date: '2024-03-05', amount: 160, type: 'debit' },
    { date: '2024-03-06', amount: 165, type: 'debit' },
    { date: '2024-03-07', amount: 170, type: 'debit' },
    { date: '2024-03-08', amount: 175, type: 'debit' },
    { date: '2024-03-09', amount: 180, type: 'debit' },
    { date: '2024-03-10', amount: 185, type: 'debit' },
    { date: '2024-03-11', amount: 190, type: 'debit' },
    { date: '2024-03-12', amount: 195, type: 'debit' },
    { date: '2024-03-13', amount: 200, type: 'debit' },
    { date: '2024-03-14', amount: 205, type: 'debit' },
    { date: '2024-03-15', amount: 210, type: 'debit' },
    { date: '2024-03-16', amount: 215, type: 'debit' },
    { date: '2024-03-17', amount: 220, type: 'debit' },
    { date: '2024-03-18', amount: 225, type: 'debit' },
    { date: '2024-03-19', amount: 230, type: 'debit' },
    { date: '2024-03-20', amount: 235, type: 'debit' }
  ],
  savings: [
    { date: '2024-03-01', amount: 15, type: 'credit' },
    { date: '2024-03-02', amount: 20, type: 'credit' },
    { date: '2024-04-01', amount: 25, type: 'credit' },
    { date: '2024-04-02', amount: 30, type: 'credit' },
    { date: '2024-05-01', amount: 35, type: 'credit' },
    { date: '2024-05-02', amount: 40, type: 'credit' },
    { date: '2024-06-01', amount: 45, type: 'credit' },
    { date: '2024-06-02', amount: 50, type: 'credit' },
    { date: '2024-07-01', amount: 55, type: 'credit' },
    { date: '2024-07-02', amount: 60, type: 'credit' },
    { date: '2024-08-01', amount: 65, type: 'credit' },
    { date: '2024-08-02', amount: 70, type: 'credit' },
    { date: '2024-09-01', amount: 75, type: 'credit' },
    { date: '2024-09-02', amount: 80, type: 'credit' },
    { date: '2024-10-01', amount: 85, type: 'credit' },
    { date: '2024-10-02', amount: 90, type: 'credit' },
    { date: '2024-11-01', amount: 95, type: 'credit' },
    { date: '2024-11-02', amount: 100, type: 'credit' },
    { date: '2024-12-01', amount: 105, type: 'credit' },
    { date: '2024-12-02', amount: 110, type: 'credit' },
    { date: '2024-01-01', amount: 115, type: 'credit' },
    { date: '2024-01-02', amount: 120, type: 'credit' },
    { date: '2024-02-01', amount: 125, type: 'credit' },
    { date: '2024-02-02', amount: 130, type: 'credit' },
    { date: '2024-03-01', amount: 135, type: 'credit' },
    // Adding more
    { date: '2024-03-03', amount: 140, type: 'credit' },
    { date: '2024-03-04', amount: 145, type: 'credit' },
    { date: '2024-03-05', amount: 150, type: 'credit' },
    { date: '2024-03-06', amount: 155, type: 'credit' },
    { date: '2024-03-07', amount: 160, type: 'credit' },
    { date: '2024-03-08', amount: 165, type: 'credit' },
    { date: '2024-03-09', amount: 170, type: 'credit' },
    { date: '2024-03-10', amount: 175, type: 'credit' },
    { date: '2024-03-11', amount: 180, type: 'credit' },
    { date: '2024-03-12', amount: 185, type: 'credit' },
    { date: '2024-03-13', amount: 190, type: 'credit' },
    { date: '2024-03-14', amount: 195, type: 'credit' },
    { date: '2024-03-15', amount: 200, type: 'credit' },
    { date: '2024-03-16', amount: 205, type: 'credit' },
    { date: '2024-03-17', amount: 210, type: 'credit' },
    { date: '2024-03-18', amount: 215, type: 'credit' },
    { date: '2024-03-19', amount: 220, type: 'credit' },
    { date: '2024-03-20', amount: 225, type: 'credit' }
  ],
  alerts: [
    { date: '2024-03-01', message: 'Low credit warning', type: 'warning' },
    { date: '2024-03-15', message: 'Budget threshold reached', type: 'info' },
    { date: '2024-04-01', message: 'High usage alert', type: 'warning' },
    { date: '2024-04-15', message: 'System update needed', type: 'info' },
    { date: '2024-05-01', message: 'Low battery', type: 'warning' },
    { date: '2024-05-15', message: 'Savings milestone', type: 'info' },
    { date: '2024-06-01', message: 'Over usage', type: 'warning' },
    { date: '2024-06-15', message: 'Credit added', type: 'info' },
    { date: '2024-07-01', message: 'Maintenance required', type: 'warning' },
    { date: '2024-07-15', message: 'Energy peak', type: 'info' },
    { date: '2024-08-01', message: 'Low credit', type: 'warning' },
    { date: '2024-08-15', message: 'Budget alert', type: 'info' },
    { date: '2024-09-01', message: 'High consumption', type: 'warning' },
    { date: '2024-09-15', message: 'System check', type: 'info' },
    { date: '2024-10-01', message: 'Alert test', type: 'warning' },
    { date: '2024-10-15', message: 'Update available', type: 'info' },
    { date: '2024-11-01', message: 'Low funds', type: 'warning' },
    { date: '2024-11-15', message: 'Milestone reached', type: 'info' },
    { date: '2024-12-01', message: 'Over limit', type: 'warning' },
    { date: '2024-12-15', message: 'System notification', type: 'info' },
    { date: '2024-01-01', message: 'Warning message', type: 'warning' },
    { date: '2024-01-15', message: 'Info alert', type: 'info' },
    { date: '2024-02-01', message: 'High alert', type: 'warning' },
    { date: '2024-02-15', message: 'Low alert', type: 'info' },
    { date: '2024-03-01', message: 'Test alert', type: 'warning' },
    // Adding more
    { date: '2024-03-02', message: 'Another warning', type: 'warning' },
    { date: '2024-03-03', message: 'Info notice', type: 'info' },
    { date: '2024-03-04', message: 'System alert', type: 'warning' },
    { date: '2024-03-05', message: 'Budget info', type: 'info' },
    { date: '2024-03-06', message: 'High usage', type: 'warning' },
    { date: '2024-03-07', message: 'Low credit', type: 'info' },
    { date: '2024-03-08', message: 'Alert test', type: 'warning' },
    { date: '2024-03-09', message: 'Notification', type: 'info' },
    { date: '2024-03-10', message: 'Warning', type: 'warning' },
    { date: '2024-03-11', message: 'Info', type: 'info' },
    { date: '2024-03-12', message: 'High alert', type: 'warning' },
    { date: '2024-03-13', message: 'Low alert', type: 'info' },
    { date: '2024-03-14', message: 'Test', type: 'warning' },
    { date: '2024-03-15', message: 'System', type: 'info' },
    { date: '2024-03-16', message: 'Budget', type: 'warning' },
    { date: '2024-03-17', message: 'Usage alert', type: 'info' },
    { date: '2024-03-18', message: 'Credit warning', type: 'warning' },
    { date: '2024-03-19', message: 'Info message', type: 'info' },
    { date: '2024-03-20', message: 'Final alert', type: 'warning' }
  ],
  budgetProgress: 75,  // Keeping this as is
}; 