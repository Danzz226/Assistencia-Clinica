import { useState, useLayoutEffect } from 'react';

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('lifium-theme') === 'dark'
  );

  useLayoutEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lifium-theme', theme);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return { isDarkMode, toggleTheme };
}
