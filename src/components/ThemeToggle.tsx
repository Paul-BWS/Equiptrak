import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

const ThemeToggle = React.memo(() => {
  const { theme, toggleTheme } = useTheme();

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
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle; 