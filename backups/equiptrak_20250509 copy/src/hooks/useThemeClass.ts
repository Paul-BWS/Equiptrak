import { useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';

export function useThemeClass() {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return theme;
} 