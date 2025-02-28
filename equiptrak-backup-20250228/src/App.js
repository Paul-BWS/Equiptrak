import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import pages (we'll create these next)
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 