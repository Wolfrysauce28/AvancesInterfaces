import React, { useState } from 'react';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button
        onClick={toggleTheme}
        className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all"
        aria-label="Cambiar tema"
      >
        <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
      </button>
    </div>
  );
};
export default ThemeToggle;
