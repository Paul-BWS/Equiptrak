import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import your components here
// Example: import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="app">
        <main className="app-main">
          <Routes>
            {/* Add your routes here */}
            <Route path="/" element={<div>Welcome to EquipTrak</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 