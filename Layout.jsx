import React, { useState, useEffect, createContext, useContext } from 'react';
import NavigationTabs from '@/components/common/NavigationTabs';
import ThemeSelector, { THEMES } from '@/components/common/ThemeSelector';
import { cn } from "@/lib/utils";

const ThemeContext = createContext({ theme: 'warm', colors: THEMES[0].colors });

export const useTheme = () => useContext(ThemeContext);

export default function Layout({ children, currentPageName }) {
  const [theme, setTheme] = useState('warm');
  
  useEffect(() => {
    const saved = localStorage.getItem('bible-app-theme');
    if (saved) setTheme(saved);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('bible-app-theme', newTheme);
  };

  const currentThemeData = THEMES.find(t => t.id === theme) || THEMES[0];
  const isDark = theme === 'midnight';

  return (
    <ThemeContext.Provider value={{ theme, colors: currentThemeData.colors }}>
      <div className={cn("min-h-screen transition-colors duration-500", isDark ? "bg-slate-900" : "bg-stone-50")}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');
          
          :root {
            --font-serif: 'Crimson Pro', Georgia, serif;
            --font-sans: 'Inter', system-ui, sans-serif;
            --color-primary: ${currentThemeData.colors.primary};
            --color-primary-light: ${currentThemeData.colors.primaryLight};
            --color-accent: ${currentThemeData.colors.accent};
            --color-accent-light: ${currentThemeData.colors.accentLight};
          }
          
          body {
            font-family: var(--font-sans);
          }
          
          .font-serif {
            font-family: var(--font-serif);
          }
          
          .theme-primary {
            color: var(--color-primary);
          }
          
          .theme-primary-bg {
            background-color: var(--color-primary);
          }
          
          .theme-primary-light-bg {
            background-color: var(--color-primary-light);
          }
          
          .theme-accent {
            color: var(--color-accent);
          }
          
          .theme-accent-bg {
            background-color: var(--color-accent);
          }
          
          html {
            scroll-behavior: smooth;
          }
          
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: ${isDark ? '#1e293b' : '#f5f5f4'};
          }
          
          ::-webkit-scrollbar-thumb {
            background: ${isDark ? '#475569' : '#d6d3d1'};
            border-radius: 3px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? '#64748b' : '#a8a29e'};
          }

          ${isDark ? `
            .dark-mode-text { color: #f1f5f9 !important; }
            .dark-mode-text-secondary { color: #94a3b8 !important; }
            .dark-mode-card { background-color: rgba(30, 41, 59, 0.8) !important; border-color: rgba(51, 65, 85, 0.5) !important; }
            .dark-mode-input { background-color: rgba(30, 41, 59, 0.6) !important; border-color: rgba(51, 65, 85, 0.5) !important; color: #f1f5f9 !important; }
          ` : ''}
        `}</style>
        
        {/* Desktop Navigation */}
        <div className={cn(
          "hidden md:block sticky top-0 z-50 backdrop-blur-lg border-b transition-colors duration-500",
          isDark ? "bg-slate-900/90 border-slate-700" : "bg-white/80 border-stone-200"
        )}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <NavigationTabs currentPage={currentPageName} isDark={isDark} />
            <div className="pr-4">
              <ThemeSelector currentTheme={theme} onThemeChange={handleThemeChange} />
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <main className={cn("pb-20 md:pb-0", isDark && "dark-mode-text")}>
          {React.cloneElement(children, { theme, themeColors: currentThemeData.colors, isDark })}
        </main>
        
        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 border-t transition-colors duration-500",
          isDark ? "bg-slate-900/95 border-slate-700" : "bg-white border-stone-200"
        )}>
          <div className="flex items-center justify-between px-2">
            <NavigationTabs currentPage={currentPageName} isDark={isDark} />
            <ThemeSelector currentTheme={theme} onThemeChange={handleThemeChange} />
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}