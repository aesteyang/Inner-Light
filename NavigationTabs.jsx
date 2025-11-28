import React from 'react';

export default function NavigationTabs({ currentPage }) {
  return (
    <nav className="flex space-x-4 p-4 border-b">
      <span className={currentPage === 'Home' ? 'font-bold' : ''}>Home</span>
      <span className={currentPage === 'About' ? 'font-bold' : ''}>About</span>
    </nav>
  );
}
