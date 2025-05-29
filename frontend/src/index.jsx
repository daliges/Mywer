import './index.css';
import React from 'react';
import ReactDOM from 'react-dom'                  // or 'react-dom/client' for React 18
import { ThemeProvider } from 'styled-components';
import { theme, GlobalStyle } from './theme/theme';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);