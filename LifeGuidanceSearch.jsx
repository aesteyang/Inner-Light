import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Heart, Shield, Compass, Sun, Cloud, Users, Sparkles, HandHeart, Brain } from 'lucide-react';
import { cn } from "@/lib/utils";

const LIFE_CATEGORIES = [
  { id: 'anxiety', label: 'Anxiety & Worry', icon: Cloud, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'grief', label: 'Grief & Loss', icon: Heart, color: 'bg-rose-50 text-rose-600 border-rose-200' },
  { id: 'strength', label: 'Need Strength', icon: Shield, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'direction', label: 'Life Direction', icon: Compass, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'hope', label: 'Finding Hope', icon: Sun, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  { id: 'relationships', label: 'Relationships', icon: Users, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'forgiveness', label: 'Forgiveness', icon: HandHeart, color: 'bg-pink-50 text-pink-600 border-pink-200' },
  { id: 'wisdom', label: 'Seeking Wisdom', icon: Brain, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { id: 'faith', label: 'Growing Faith', icon: Sparkles, color: 'bg-teal-50 text-teal-600 border-teal-200' },
];

export default function LifeGuidanceSearch({ onSearch, onCategorySelect }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.id);
    onCategorySelect?.(category);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-serif text-stone-800 mb-2">
          What's on your heart?
        </h2>
        <p className="text-stone-500">
          Find scripture that speaks to your current journey
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for guidance on any topic..."
          className="pl-12 pr-4 py-6 text-lg rounded-2xl border-amber-200 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
        />
        <Button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-700 rounded-xl"
        >
          Search
        </Button>
      </form>

      <div className="pt-6">
        <p className="text-center text-sm text-stone-500 mb-4">Or explore by topic</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {LIFE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                  "hover:scale-105 hover:shadow-md",
                  selectedCategory === category.id
                    ? category.color + " ring-2 ring-offset-2"
                    : "bg-white border-stone-200 hover:border-stone-300"
                )}
              >
                <Icon className={cn(
                  "h-6 w-6",
                  selectedCategory === category.id ? "" : "text-stone-400"
                )} />
                <span className={cn(
                  "text-sm font-medium text-center",
                  selectedCategory === category.id ? "" : "text-stone-600"
                )}>
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}