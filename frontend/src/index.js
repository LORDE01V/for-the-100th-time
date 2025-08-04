import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';
import { NavigationProvider } from './context/NavigationContext';
import OneSignal from 'react-onesignal';
import { DashboardProvider } from "./context/DashboardContext";

// Extend the default theme to configure color mode
const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

// Initialize OneSignal here, once for the entire app
if (!window.OneSignal || !window.OneSignal._initCalled) {
  OneSignal.init({
    appId: process.env.REACT_APP_ONESIGNAL_APP_ID,
    allowLocalhostAsSecureOrigin: true,
    notifyButton: {
      enable: true,
    },
    // autoResubscribe: true,
  }).then(() => {
    // You can add more OneSignal logic here, e.g., prompt for push notifications
    // OneSignal.showSlidedownPrompt();
  }).catch((error) => {
    // Handle error if needed
  });
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