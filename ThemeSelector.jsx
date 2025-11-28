import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

const THEMES = [
  {
    id: 'warm',
    name: 'Warm Amber',
    description: 'Cozy and inviting',
    colors: {
      primary: '#d97706',
      primaryLight: '#fef3c7',
      accent: '#059669',
      accentLight: '#d1fae5',
      bg: 'from-amber-50/50 via-white to-emerald-50/30',
      navBg: 'bg-white/80',
      cardBg: 'bg-white',
    },
    preview: ['#fef3c7', '#d97706', '#059669']
  },
  {
    id: 'serene',
    name: 'Serene Blue',
    description: 'Calm and peaceful',
    colors: {
      primary: '#0369a1',
      primaryLight: '#e0f2fe',
      accent: '#7c3aed',
      accentLight: '#ede9fe',
      bg: 'from-sky-50/50 via-white to-violet-50/30',
      navBg: 'bg-white/80',
      cardBg: 'bg-white',
    },
    preview: ['#e0f2fe', '#0369a1', '#7c3aed']
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Earthy and grounded',
    colors: {
      primary: '#166534',
      primaryLight: '#dcfce7',
      accent: '#92400e',
      accentLight: '#fef3c7',
      bg: 'from-emerald-50/50 via-white to-amber-50/30',
      navBg: 'bg-white/80',
      cardBg: 'bg-white',
    },
    preview: ['#dcfce7', '#166534', '#92400e']
  },
  {
    id: 'lavender',
    name: 'Lavender Dreams',
    description: 'Soft and soothing',
    colors: {
      primary: '#7c3aed',
      primaryLight: '#ede9fe',
      accent: '#db2777',
      accentLight: '#fce7f3',
      bg: 'from-violet-50/50 via-white to-pink-50/30',
      navBg: 'bg-white/80',
      cardBg: 'bg-white',
    },
    preview: ['#ede9fe', '#7c3aed', '#db2777']
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark and contemplative',
    colors: {
      primary: '#f59e0b',
      primaryLight: '#1e293b',
      accent: '#06b6d4',
      accentLight: '#0f172a',
      bg: 'from-slate-900 via-slate-800 to-slate-900',
      navBg: 'bg-slate-900/90',
      cardBg: 'bg-slate-800/80',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
    },
    preview: ['#1e293b', '#f59e0b', '#06b6d4']
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    description: 'Warm and gentle',
    colors: {
      primary: '#be123c',
      primaryLight: '#ffe4e6',
      accent: '#0d9488',
      accentLight: '#ccfbf1',
      bg: 'from-rose-50/50 via-white to-teal-50/30',
      navBg: 'bg-white/80',
      cardBg: 'bg-white',
    },
    preview: ['#ffe4e6', '#be123c', '#0d9488']
  },
];

export default function ThemeSelector({ currentTheme, onThemeChange }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 hover:bg-stone-100"
        >
          <Palette className="h-4 w-4 text-stone-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="mb-3">
          <h4 className="font-medium text-stone-800 text-sm">Choose Theme</h4>
          <p className="text-xs text-stone-500">Personalize your experience</p>
        </div>
        <div className="grid gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                onThemeChange(theme.id);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                currentTheme === theme.id
                  ? "bg-stone-100 ring-2 ring-stone-300"
                  : "hover:bg-stone-50"
              )}
            >
              <div className="flex -space-x-1">
                {theme.preview.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-800">{theme.name}</p>
                <p className="text-xs text-stone-500">{theme.description}</p>
              </div>
              {currentTheme === theme.id && (
                <Check className="h-4 w-4 text-emerald-600" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { THEMES };