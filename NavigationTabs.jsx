import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, Search, Radio, Heart, PenLine, Compass, Home } from 'lucide-react';
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: 'Home', label: 'Home', icon: Home },
  { id: 'Bible', label: 'Bible', icon: BookOpen },
  { id: 'Guidance', label: 'Guidance', icon: Compass },
  { id: 'Sermons', label: 'Sermons', icon: Radio },
  { id: 'Favorites', label: 'Favorites', icon: Heart },
  { id: 'Journal', label: 'Journal', icon: PenLine },
];

export default function NavigationTabs({ currentPage, isDark = false }) {
  return (
    <nav className="md:relative md:bottom-auto z-50">
      <div className="flex justify-around md:justify-center md:gap-2 py-2 md:py-3 px-2 max-w-4xl mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Link
              key={item.id}
              to={createPageUrl(item.id)}
              className={cn(
                "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-xl transition-all",
                isActive
                  ? isDark 
                    ? "text-amber-400 bg-slate-800" 
                    : "text-amber-700 bg-amber-50 md:bg-amber-100"
                  : isDark
                    ? "text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                    : "text-stone-500 hover:text-amber-600 hover:bg-amber-50"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 md:h-4 md:w-4",
                isActive && (isDark ? "text-amber-400" : "text-amber-600")
              )} />
              <span className={cn(
                "text-xs md:text-sm font-medium",
                isActive && (isDark ? "text-amber-400" : "text-amber-700")
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}