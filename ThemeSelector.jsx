import React from 'react';

export const THEMES = [
  { id: 'warm', colors: { primary: '#FDE68A', primaryLight: '#FFF9DB' } },
  { id: 'midnight', colors: { primary: '#1E293B', primaryLight: '#475569' } },
];

export default function ThemeSelector({ currentTheme, onThemeChange }) {
  return (
    <select
      value={currentTheme}
      onChange={(e) => onThemeChange(e.target.value)}
      className="p-1 border rounded"
    >
      {THEMES.map((t) => (
        <option key={t.id} value={t.id}>{t.id}</option>
      ))}
    </select>
  );
}
