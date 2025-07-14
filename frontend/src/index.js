import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { NavigationProvider } from './context/NavigationContext';

ReactDOM.render(
  <NavigationProvider>
    <App />
  </NavigationProvider>,
  document.getElementById('root')
);