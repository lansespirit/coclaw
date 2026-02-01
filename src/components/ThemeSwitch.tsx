import { useEffect, useState } from 'react';
import { Button } from '@heroui/react';
import { IconMoon, IconSun } from './icons';

export const ThemeSwitch = () => {
  // Initialize with 'dark' to match the default theme and prevent icon flashing
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Check initial theme
    const savedTheme = localStorage.getItem('theme');
    // Default to dark unless the user explicitly chose a theme.
    const currentTheme = savedTheme || 'dark';

    setTheme(currentTheme);
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <Button isIconOnly variant="light" onPress={toggleTheme} aria-label="Toggle Dark Mode">
      {/* Show the icon for the NEXT state (dark theme shows sun, light theme shows moon) */}
      {theme === 'dark' ? (
        <IconSun className="w-5 h-5" aria-hidden="true" />
      ) : (
        <IconMoon className="w-5 h-5" aria-hidden="true" />
      )}
    </Button>
  );
};
