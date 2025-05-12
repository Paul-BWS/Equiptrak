"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

// Constants for theme handling
const THEME_KEY = 'equiptrak-theme';
const DEFAULT_THEME = 'light';

const ThemeContext = React.createContext<{
  theme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
}>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  toggleTheme: () => {},
});

// Initialize theme from storage
const getInitialTheme = (): string => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  
  try {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    
    // If no valid theme stored, use default
    localStorage.setItem(THEME_KEY, DEFAULT_THEME);
    return DEFAULT_THEME;
  } catch (e) {
    console.error('Error reading theme from localStorage:', e);
    return DEFAULT_THEME;
  }
};

// Apply theme to document
const applyTheme = (theme: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Error applying theme:', e);
  }
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);
  const [theme, setThemeState] = React.useState(getInitialTheme);

  // Update theme with proper persistence
  const setTheme = React.useCallback((newTheme: string) => {
    if (newTheme === theme) return;
    setThemeState(newTheme);
    applyTheme(newTheme);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Initialize theme on mount
  React.useEffect(() => {
    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);

    // Add listener for storage changes (in case of multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_KEY && e.newValue) {
        setThemeState(e.newValue as 'light' | 'dark');
        applyTheme(e.newValue as 'light' | 'dark');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  // Prevent flash of incorrect theme
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }} aria-hidden="true">
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      <NextThemesProvider
        attribute="class"
        defaultTheme={theme}
        value={{ light: 'light', dark: 'dark' }}
        enableSystem={false}
        disableTransitionOnChange={false}
        storageKey={THEME_KEY}
        {...props}
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};