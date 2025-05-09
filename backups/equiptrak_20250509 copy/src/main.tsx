import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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
    <App />
  </React.StrictMode>
);