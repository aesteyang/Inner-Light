import React, { useState, useEffect } from 'react';
import NavigationTabs from '../common/NavigationTabs';
import ThemeSelector, { THEMES } from '../common/ThemeSelector';

export default function Layout({ children, currentPageName }) {
  const [theme, setTheme] = useState('warm');

  useEffect(() => {
    const saved = localStorage.getItem('inner-light-theme');
    if (saved) setTheme(saved);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('inner-light-theme', newTheme);
  };

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.primaryLight }}>
      <NavigationTabs currentPage={currentPageName} />
      <ThemeSelector currentTheme={theme} onThemeChange={handleThemeChange} />
      <main>{children}</main>
    </div>
  );
}
