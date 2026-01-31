import { useEffect, useState } from 'react';
import { Button } from '@heroui/react';

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
      {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
    </Button>
  );
};

// Simple icons to avoid external dependencies for now
const SunIcon = ({ className }: { className?: string }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);
