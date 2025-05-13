import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Force cache busting on version mismatch
const APP_VERSION = '1.0.9';
const CACHE_TIMESTAMP = Date.now();

// Clear any old cached data
if (localStorage.getItem('app_version') !== APP_VERSION) {
  localStorage.clear();
  localStorage.setItem('app_version', APP_VERSION);
  // Force reload if version mismatch
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

console.log("main.tsx - Application initialization started");

// Add error boundary for root level errors
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error });
  return false;
};

// Verify root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Failed to find root element');
} else {
  console.log('Root element found, attempting to mount React');
}

console.log("main.tsx - About to render React app");

ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <App key={`${APP_VERSION}-${CACHE_TIMESTAMP}`} />
  </React.StrictMode>
);