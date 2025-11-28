import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Compass, Radio, Heart, PenLine, ChevronRight, Sparkles, Sun, Moon, Loader2 } from 'lucide-react';
import DailyVerse from '@/components/common/DailyVerse';
import { cn } from "@/lib/utils";

const QUICK_TOPICS = [
  { label: 'Peace', query: 'verses about peace and calm' },
  { label: 'Strength', query: 'verses about strength in difficult times' },
  { label: 'Love', query: 'verses about God\'s love' },
  { label: 'Hope', query: 'verses about hope' },
  { label: 'Wisdom', query: 'verses about wisdom' },
  { label: 'Faith', query: 'verses about faith' },
];

const FEATURES = [
  { 
    icon: BookOpen, 
    title: 'Read Scripture', 
    desc: 'Explore multiple Bible versions',
    page: 'Bible',
    color: 'from-amber-500 to-orange-500'
  },
  { 
    icon: Compass, 
    title: 'Life Guidance', 
    desc: 'Find verses for your journey',
    page: 'Guidance',
    color: 'from-emerald-500 to-teal-500'
  },
  { 
    icon: Radio, 
    title: 'Live Sermons', 
    desc: 'Watch local & national services',
    page: 'Sermons',
    color: 'from-purple-500 to-indigo-500'
  },
  { 
    icon: Heart, 
    title: 'Your Favorites', 
    desc: 'Saved verses & sermons',
    page: 'Favorites',
    color: 'from-rose-500 to-pink-500'
  },
];

export default function Home() {
  const [dailyVerse, setDailyVerse] = useState(null);
  const [isLoadingVerse, setIsLoadingVerse] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    
    fetchDailyVerse();
  }, []);

  const fetchDailyVerse = async () => {
    setIsLoadingVerse(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Select an inspiring, meaningful Bible verse that would bring comfort and spiritual nourishment. 
        Return a verse that speaks to the heart and encourages deeper faith.
        Choose from popular, well-known verses as well as hidden gems.`,
        response_json_schema: {
          type: "object",
          properties: {
            verse: { type: "string" },
            reference: { type: "string" },
            theme: { type: "string" }
          }
        }
      });
      setDailyVerse(response);
    } catch (error) {
      setDailyVerse({
        verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
        reference: "Proverbs 3:5-6",
        theme: "trust"
      });
    }
    setIsLoadingVerse(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-emerald-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/50 rounded-full mb-4">
            {new Date().getHours() < 18 ? (
              <Sun className="h-4 w-4 text-amber-600" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
            <span className="text-sm font-medium text-stone-600">{greeting}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-stone-800 mb-3">
            Deepen Your <span className="text-amber-600">Connection</span>
          </h1>
          <p className="text-stone-500 max-w-lg mx-auto">
            Find peace, wisdom, and spiritual growth through scripture and community
          </p>
        </header>

        {/* Daily Verse */}
        <section className="mb-10">
          {isLoadingVerse ? (
            <Card className="p-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            </Card>
          ) : dailyVerse && (
            <DailyVerse
              verse={dailyVerse.verse}
              reference={dailyVerse.reference}
              onRefresh={fetchDailyVerse}
              isLoading={isLoadingVerse}
            />
          )}
        </section>

        {/* Quick Topics */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Quick Guidance
          </h2>
          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((topic) => (
              <Link
                key={topic.label}
                to={createPageUrl('Guidance') + `?topic=${encodeURIComponent(topic.query)}`}
              >
                <Button
                  variant="outline"
                  className="rounded-full border-amber-200 hover:bg-amber-50 hover:border-amber-300 text-stone-600"
                >
                  {topic.label}
                </Button>
              </Link>
            ))}
          </div>
        </section>

        {/* Feature Cards */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">Explore</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.page} to={createPageUrl(feature.page)}>
                  <Card className="group p-5 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <div className={cn(
                      "inline-flex p-3 rounded-xl bg-gradient-to-br mb-4",
                      feature.color
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-stone-800 mb-1 group-hover:text-amber-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-stone-500">{feature.desc}</p>
                    <ChevronRight className="h-4 w-4 text-stone-300 mt-3 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Journal Prompt */}
        <section>
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <PenLine className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-800 mb-1">Daily Reflection</h3>
                <p className="text-sm text-stone-600 mb-3">
                  Take a moment to journal your thoughts and prayers
                </p>
                <Link to={createPageUrl('Journal')}>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                    Start Writing
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}