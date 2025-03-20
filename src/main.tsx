import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("main.tsx - Application initialization started");

// Set UI theme to light mode by default
document.documentElement.classList.add('light');
document.documentElement.style.colorScheme = 'light';

console.log("main.tsx - About to render React app");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log("main.tsx - React render called");