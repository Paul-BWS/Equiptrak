import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// Simple Home component
function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Home Page</h1>
      <p>Welcome to EquipTrack</p>
      <div>
        <Link to="/about">About</Link>
      </div>
    </div>
  );
}

// Simple About component
function About() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>About Page</h1>
      <p>This is a simple test app to verify routing works.</p>
      <div>
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
}

function TestApp() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="equiptrak-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default TestApp; 