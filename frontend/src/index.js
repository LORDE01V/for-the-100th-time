import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';
import { NavigationProvider } from './context/NavigationContext';
import { DashboardProvider } from "./context/DashboardContext";

// Extend the default theme to configure color mode
const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

// Initialize OneSignal here, once for the entire app
// OneSignal initialization and related code have been removed

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