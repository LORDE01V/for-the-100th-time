import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';
import { NavigationProvider } from './context/NavigationContext';
import { DashboardProvider } from "./context/DashboardContext";
import notificationService from './services/notificationService';

// Extend the default theme to configure color mode
const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

// Initialize OneSignal with proper error handling
if (process.env.REACT_APP_ONESIGNAL_APP_ID) {
  notificationService.initialize().catch((error) => {
    console.warn('OneSignal initialization failed:', error);
  });
} else {
  console.warn('OneSignal App ID not configured. Push notifications will not work.');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <DashboardProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </DashboardProvider>
    </ChakraProvider>
  </React.StrictMode>
);