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
  faultDetection: true,
  faultVisualization: true

};

// Expand activityReportData with more mock entries
export const activityReportData = {
  topUps: [
    { date: '2025-03-01', amount: 100, type: 'credit' },
    { date: '2025-03-15', amount: 150, type: 'credit' },
    { date: '2025-04-01', amount: 200, type: 'credit' },
    { date: '2025-04-15', amount: 120, type: 'credit' },
    { date: '2025-05-01', amount: 180, type: 'credit' },
    { date: '2025-05-15', amount: 250, type: 'credit' },
    { date: '2025-06-01', amount: 300, type: 'credit' },
    { date: '2025-06-15', amount: 110, type: 'credit' },
    { date: '2025-07-01', amount: 140, type: 'credit' },
    { date: '2025-07-15', amount: 160, type: 'credit' },
    { date: '2025-08-01', amount: 190, type: 'credit' },
    { date: '2025-08-15', amount: 210, type: 'credit' },
    { date: '2025-09-01', amount: 230, type: 'credit' },
    { date: '2025-09-15', amount: 150, type: 'credit' },
    { date: '2025-10-01', amount: 170, type: 'credit' },
    { date: '2025-10-15', amount: 220, type: 'credit' },
    { date: '2025-11-01', amount: 240, type: 'credit' },
    { date: '2025-11-15', amount: 130, type: 'credit' },
    { date: '2025-12-01', amount: 180, type: 'credit' },
    { date: '2025-12-15', amount: 200, type: 'credit' },
    { date: '2025-01-01', amount: 110, type: 'credit' },
    { date: '2025-01-15', amount: 140, type: 'credit' },
    { date: '2025-02-01', amount: 160, type: 'credit' },
    { date: '2025-02-15', amount: 190, type: 'credit' },
    { date: '2025-03-01', amount: 210, type: 'credit' },
    // Adding more to reach over 100 total entries across all arrays
    { date: '2025-03-02', amount: 120, type: 'credit' },
    { date: '2025-03-03', amount: 130, type: 'credit' },
    { date: '2025-03-04', amount: 140, type: 'credit' },
    { date: '2025-03-05', amount: 150, type: 'credit' },
    { date: '2025-03-06', amount: 160, type: 'credit' },
    { date: '2025-03-07', amount: 170, type: 'credit' },
    { date: '2025-03-08', amount: 180, type: 'credit' },
    { date: '2025-03-09', amount: 190, type: 'credit' },
    { date: '2025-03-10', amount: 200, type: 'credit' },
    { date: '2025-03-11', amount: 210, type: 'credit' },
    { date: '2025-03-12', amount: 220, type: 'credit' },
    { date: '2025-03-13', amount: 230, type: 'credit' },
    { date: '2025-03-14', amount: 240, type: 'credit' },
    { date: '2025-03-15', amount: 250, type: 'credit' },
    { date: '2025-03-16', amount: 260, type: 'credit' },
    { date: '2025-03-17', amount: 270, type: 'credit' },
    { date: '2025-03-18', amount: 280, type: 'credit' },
    { date: '2025-03-19', amount: 290, type: 'credit' },
    { date: '2025-03-20', amount: 300, type: 'credit' },
    { date: '2025-03-21', amount: 310, type: 'credit' },
    { date: '2025-03-22', amount: 320, type: 'credit' },
    { date: '2025-03-23', amount: 330, type: 'credit' },
    { date: '2025-03-24', amount: 340, type: 'credit' },
    { date: '2025-03-25', amount: 350, type: 'credit' }
  ],
  usage: [
    { date: '2025-03-01', amount: 25, type: 'debit' },
    { date: '2025-03-02', amount: 30, type: 'debit' },
    { date: '2025-04-01', amount: 35, type: 'debit' },
    { date: '2025-04-02', amount: 40, type: 'debit' },
    { date: '2025-05-01', amount: 45, type: 'debit' },
    { date: '2025-05-02', amount: 50, type: 'debit' },
    { date: '2025-06-01', amount: 55, type: 'debit' },
    { date: '2025-06-02', amount: 60, type: 'debit' },
    { date: '2025-07-01', amount: 65, type: 'debit' },
    { date: '2025-07-02', amount: 70, type: 'debit' },
    { date: '2025-08-01', amount: 75, type: 'debit' },
    { date: '2025-08-02', amount: 80, type: 'debit' },
    { date: '2025-09-01', amount: 85, type: 'debit' },
    { date: '2025-09-02', amount: 90, type: 'debit' },
    { date: '2025-10-01', amount: 95, type: 'debit' },
    { date: '2025-10-02', amount: 100, type: 'debit' },
    { date: '2025-11-01', amount: 105, type: 'debit' },
    { date: '2025-11-02', amount: 110, type: 'debit' },
    { date: '2025-12-01', amount: 115, type: 'debit' },
    { date: '2025-12-02', amount: 120, type: 'debit' },
    { date: '2025-01-01', amount: 125, type: 'debit' },
    { date: '2025-01-02', amount: 130, type: 'debit' },
    { date: '2025-02-01', amount: 135, type: 'debit' },
    { date: '2025-02-02', amount: 140, type: 'debit' },
    { date: '2025-03-01', amount: 145, type: 'debit' },
    // Continuing to add more
    { date: '2025-03-03', amount: 150, type: 'debit' },
    { date: '2025-03-04', amount: 155, type: 'debit' },
    { date: '2025-03-05', amount: 160, type: 'debit' },
    { date: '2025-03-06', amount: 165, type: 'debit' },
    { date: '2025-03-07', amount: 170, type: 'debit' },
    { date: '2025-03-08', amount: 175, type: 'debit' },
    { date: '2025-03-09', amount: 180, type: 'debit' },
    { date: '2025-03-10', amount: 185, type: 'debit' },
    { date: '2025-03-11', amount: 190, type: 'debit' },
    { date: '2025-03-12', amount: 195, type: 'debit' },
    { date: '2025-03-13', amount: 200, type: 'debit' },
    { date: '2025-03-14', amount: 205, type: 'debit' },
    { date: '2025-03-15', amount: 210, type: 'debit' },
    { date: '2025-03-16', amount: 215, type: 'debit' },
    { date: '2025-03-17', amount: 220, type: 'debit' },
    { date: '2025-03-18', amount: 225, type: 'debit' },
    { date: '2025-03-19', amount: 230, type: 'debit' },
    { date: '2025-03-20', amount: 235, type: 'debit' }
  ],
  savings: [
    { date: '2025-03-01', amount: 15, type: 'credit' },
    { date: '2025-03-02', amount: 20, type: 'credit' },
    { date: '2025-04-01', amount: 25, type: 'credit' },
    { date: '2025-04-02', amount: 30, type: 'credit' },
    { date: '2025-05-01', amount: 35, type: 'credit' },
    { date: '2025-05-02', amount: 40, type: 'credit' },
    { date: '2025-06-01', amount: 45, type: 'credit' },
    { date: '2025-06-02', amount: 50, type: 'credit' },
    { date: '2025-07-01', amount: 55, type: 'credit' },
    { date: '2025-07-02', amount: 60, type: 'credit' },
    { date: '2025-08-01', amount: 65, type: 'credit' },
    { date: '2025-08-02', amount: 70, type: 'credit' },
    { date: '2025-09-01', amount: 75, type: 'credit' },
    { date: '2025-09-02', amount: 80, type: 'credit' },
    { date: '2025-10-01', amount: 85, type: 'credit' },
    { date: '2025-10-02', amount: 90, type: 'credit' },
    { date: '2025-11-01', amount: 95, type: 'credit' },
    { date: '2025-11-02', amount: 100, type: 'credit' },
    { date: '2025-12-01', amount: 105, type: 'credit' },
    { date: '2025-12-02', amount: 110, type: 'credit' },
    { date: '2025-01-01', amount: 115, type: 'credit' },
    { date: '2025-01-02', amount: 120, type: 'credit' },
    { date: '2025-02-01', amount: 125, type: 'credit' },
    { date: '2025-02-02', amount: 130, type: 'credit' },
    { date: '2025-03-01', amount: 135, type: 'credit' },
    // Adding more
    { date: '2025-03-03', amount: 140, type: 'credit' },
    { date: '2025-03-04', amount: 145, type: 'credit' },
    { date: '2025-03-05', amount: 150, type: 'credit' },
    { date: '2025-03-06', amount: 155, type: 'credit' },
    { date: '2025-03-07', amount: 160, type: 'credit' },
    { date: '2025-03-08', amount: 165, type: 'credit' },
    { date: '2025-03-09', amount: 170, type: 'credit' },
    { date: '2025-03-10', amount: 175, type: 'credit' },
    { date: '2025-03-11', amount: 180, type: 'credit' },
    { date: '2025-03-12', amount: 185, type: 'credit' },
    { date: '2025-03-13', amount: 190, type: 'credit' },
    { date: '2025-03-14', amount: 195, type: 'credit' },
    { date: '2025-03-15', amount: 200, type: 'credit' },
    { date: '2025-03-16', amount: 205, type: 'credit' },
    { date: '2025-03-17', amount: 210, type: 'credit' },
    { date: '2025-03-18', amount: 215, type: 'credit' },
    { date: '2025-03-19', amount: 220, type: 'credit' },
    { date: '2025-03-20', amount: 225, type: 'credit' }
  ],
  alerts: [
    { date: '2025-03-01', message: 'Low credit warning', type: 'warning' },
    { date: '2025-03-15', message: 'Budget threshold reached', type: 'info' },
    { date: '2025-04-01', message: 'High usage alert', type: 'warning' },
    { date: '2025-04-15', message: 'System update needed', type: 'info' },
    { date: '2025-05-01', message: 'Low battery', type: 'warning' },
    { date: '2025-05-15', message: 'Savings milestone', type: 'info' },
    { date: '2025-06-01', message: 'Over usage', type: 'warning' },
    { date: '2025-06-15', message: 'Credit added', type: 'info' },
    { date: '2025-07-01', message: 'Maintenance required', type: 'warning' },
    { date: '2025-07-15', message: 'Energy peak', type: 'info' },
    { date: '2025-08-01', message: 'Low credit', type: 'warning' },
    { date: '2025-08-15', message: 'Budget alert', type: 'info' },
    { date: '2025-09-01', message: 'High consumption', type: 'warning' },
    { date: '2025-09-15', message: 'System check', type: 'info' },
    { date: '2025-10-01', message: 'Alert test', type: 'warning' },
    { date: '2025-10-15', message: 'Update available', type: 'info' },
    { date: '2025-11-01', message: 'Low funds', type: 'warning' },
    { date: '2025-11-15', message: 'Milestone reached', type: 'info' },
    { date: '2025-12-01', message: 'Over limit', type: 'warning' },
    { date: '2025-12-15', message: 'System notification', type: 'info' },
    { date: '2025-01-01', message: 'Warning message', type: 'warning' },
    { date: '2025-01-15', message: 'Info alert', type: 'info' },
    { date: '2025-02-01', message: 'High alert', type: 'warning' },
    { date: '2025-02-15', message: 'Low alert', type: 'info' },
    { date: '2025-03-01', message: 'Test alert', type: 'warning' },
    // Adding more
    { date: '2025-03-02', message: 'Another warning', type: 'warning' },
    { date: '2025-03-03', message: 'Info notice', type: 'info' },
    { date: '2025-03-04', message: 'System alert', type: 'warning' },
    { date: '2025-03-05', message: 'Budget info', type: 'info' },
    { date: '2025-03-06', message: 'High usage', type: 'warning' },
    { date: '2025-03-07', message: 'Low credit', type: 'info' },
    { date: '2025-03-08', message: 'Alert test', type: 'warning' },
    { date: '2025-03-09', message: 'Notification', type: 'info' },
    { date: '2025-03-10', message: 'Warning', type: 'warning' },
    { date: '2025-03-11', message: 'Info', type: 'info' },
    { date: '2025-03-12', message: 'High alert', type: 'warning' },
    { date: '2025-03-13', message: 'Low alert', type: 'info' },
    { date: '2025-03-14', message: 'Test', type: 'warning' },
    { date: '2025-03-15', message: 'System', type: 'info' },
    { date: '2025-03-16', message: 'Budget', type: 'warning' },
    { date: '2025-03-17', message: 'Usage alert', type: 'info' },
    { date: '2025-03-18', message: 'Credit warning', type: 'warning' },
    { date: '2025-03-19', message: 'Info message', type: 'info' },
    { date: '2025-03-20', message: 'Final alert', type: 'warning' }
  ],
  budgetProgress: 75,  // Keeping this as is
};

// Mock Areas for Area Selection
export const mockAreas = [
  { id: 'johannesburg', name: 'Johannesburg', latitude: -26.2041, longitude: 28.0473 },
  { id: 'capetown', name: 'Cape Town', latitude: -33.9249, longitude: 18.4241 },
  { id: 'durban', name: 'Durban', latitude: -29.8587, longitude: 31.0218 },
  { id: 'pretoria', name: 'Pretoria', latitude: -25.7479, longitude: 28.2293 },
  { id: 'bloemfontein', name: 'Bloemfontein', latitude: -29.0852, longitude: 26.2159 },
  { id: 'polokwane', name: 'Polokwane', latitude: -23.9045, longitude: 29.4688 },
  { id: 'nelspruit', name: 'Nelspruit', latitude: -25.4773, longitude: 30.9700 },
  { id: 'kimberley', name: 'Kimberley', latitude: -28.7383, longitude: 24.7630 },
  { id: 'mafikeng', name: 'Mafikeng', latitude: -25.8733, longitude: 25.6713 },
  { id: 'gqeberha', name: 'Gqeberha', latitude: -33.9611, longitude: 25.6102 },
  { id: 'eastlondon', name: 'East London', latitude: -33.0186, longitude: 27.8942 },
];

// Theme Presets for Theme Switcher
export const themePresets = {
  coolBlue: {
    name: 'Cool Blue',
    colors: {
      primary: 'blue.500',
      secondary: 'blue.300',
      accent: 'blue.100',
      text: 'gray.700',
      background: 'blue.50'
    },
    gradients: {
      card: 'linear(to-br, blue.50, blue.100)'
    },
    bg: 'rgba(173, 216, 230, 0.18)',
    borderColor: 'rgba(173, 216, 230, 0.35)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
  },
  arcticBlue: {
    name: 'Arctic Blue',
    colors: {
      primary: 'cyan.500',
      secondary: 'cyan.300',
      accent: 'cyan.100',
      text: 'gray.700',
      background: 'cyan.50'
    },
    gradients: {
      card: 'linear(to-br, cyan.50, cyan.100)'
    },
    bg: 'rgba(173, 216, 230, 0.18)',
    borderColor: 'rgba(173, 216, 230, 0.35)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
  },
  warmSunrise: {
    name: 'Warm Sunrise',
    colors: {
      primary: 'orange.500',
      secondary: 'orange.300',
      accent: 'orange.100',
      text: 'gray.700',
      background: 'orange.50'
    },
    gradients: {
      card: 'linear(to-br, orange.50, orange.100)'
    },
    bg: 'rgba(255, 223, 186, 0.18)',
    borderColor: 'rgba(255, 183, 94, 0.35)',
    boxShadow: '0 8px 32px 0 rgba(255, 183, 94, 0.18)',
  },
  forestGreen: {
    name: 'Forest Green',
    colors: {
      primary: 'green.500',
      secondary: 'green.300',
      accent: 'green.100',
      text: 'gray.700',
      background: 'green.50'
    },
    gradients: {
      card: 'linear(to-br, green.50, green.100)'
    },
    bg: 'rgba(144, 238, 144, 0.18)',
    borderColor: 'rgba(144, 238, 144, 0.35)',
    boxShadow: '0 8px 32px 0 rgba(34, 139, 34, 0.18)',
  },
  lavender: {
    name: 'Lavender',
    colors: {
      primary: 'purple.500',
      secondary: 'purple.300',
      accent: 'purple.100',
      text: 'gray.700',
      background: 'purple.50'
    },
    gradients: {
      card: 'linear(to-br, purple.50, purple.100)'
    },
    bg: 'rgba(230, 230, 250, 0.18)',
    borderColor: 'rgba(230, 230, 250, 0.35)',
    boxShadow: '0 8px 32px 0 rgba(147, 112, 219, 0.18)',
  },
  coral: {
    name: 'Coral',
    colors: {
      primary: 'red.500',
      secondary: 'red.300',
      accent: 'red.100',
      text: 'gray.700',
      background: 'red.50'
    },
    gradients: {
      card: 'linear(to-br, red.50, red.100)'
    },
    bg: 'rgba(255, 127, 80, 0.18)',
    borderColor: 'rgba(255, 127, 80, 0.35)',
    boxShadow: '0 8px 32px 0 rgba(255, 69, 0, 0.18)',
  }
}; 