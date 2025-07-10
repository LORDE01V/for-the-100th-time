import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';
import OneSignal from 'react-onesignal'; // Import OneSignal

// Extend the default theme to configure color mode
const config = {
  initialColorMode: 'light', // Set the initial color mode to 'light'
  useSystemColorMode: false, // Disable using the system's color mode preference
};

const theme = extendTheme({ config });

// Initialize OneSignal here, once for the entire app
if (!window.OneSignal || !window.OneSignal._initCalled) {
  OneSignal.init({
  appId: process.env.REACT_APP_ONESIGNAL_APP_ID, // Your OneSignal App ID
  allowLocalhostAsSecureOrigin: true, // Required for local development
  notifyButton: {
    enable: true, // Enable the native OneSignal prompt
  },
  // autoResubscribe: true, // Automatically resubscribe users
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
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
