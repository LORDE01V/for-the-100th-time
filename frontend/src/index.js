import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';

// Extend the default theme to configure color mode
const config = {
  initialColorMode: 'light', // Set the initial color mode to 'light'
  useSystemColorMode: false, // Disable using the system's color mode preference
};

const theme = extendTheme({ config });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
