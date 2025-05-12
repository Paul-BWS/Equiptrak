import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // On mount, set theme from localStorage or system
    const saved = localStorage.getItem('theme');
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 z-50 p-2 rounded-full bg-white border border-gray-300 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
      type="button"
    >
      {theme === 'light' ? <Moon className="h-5 w-5 text-gray-700" /> : <Sun className="h-5 w-5 text-yellow-400" />}
    </button>
  );
} 