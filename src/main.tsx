import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Version handling
const APP_VERSION = '1.0.9';
const BUILD_TIME = new Date().toISOString();
const FORCE_CACHE_CLEAR = true; // Added to force cache clearing

// Clear cache and reload if version mismatch
const lastVersion = localStorage.getItem('app_version') || '';
if (lastVersion !== APP_VERSION || FORCE_CACHE_CLEAR) {
  console.log(`Version change detected: ${lastVersion} -> ${APP_VERSION}`);
  // Clear cache
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  // Clear localStorage except for critical items
  const criticalItems = ['theme'];
  const itemsToKeep: Record<string, string> = {};
  criticalItems.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) itemsToKeep[key] = value;
  });
  localStorage.clear();
  Object.entries(itemsToKeep).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  localStorage.setItem('app_version', APP_VERSION);
  localStorage.setItem('build_time', BUILD_TIME);
  
  // Force reload the page
  window.location.reload();
}

console.log(`App Version: ${APP_VERSION}, Build Time: ${BUILD_TIME}`);

// Add error boundary for root level errors
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error });
  return false;
};

// Mount the application
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Failed to find root element');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App key={`${APP_VERSION}-${BUILD_TIME}`} />
    </React.StrictMode>
  );
}