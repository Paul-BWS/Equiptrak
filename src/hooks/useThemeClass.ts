import { useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme-provider';

export function useThemeClass() {
  const { theme } = useTheme();
  const prevTheme = useRef(theme);

  useEffect(() => {
    // Only update if theme has actually changed
    if (prevTheme.current === theme) {
      return;
    }

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    prevTheme.current = theme;
  }, [theme]);

  return theme;
} 