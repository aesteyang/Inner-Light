import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Heart, BookOpen, Sparkles, ArrowRight, X, RefreshCw, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import LifeGuidanceSearch from '@/components/search/LifeGuidanceSearch';
import { cn } from "@/lib/utils";

const LIFE_SITUATIONS = [
{ id: 'anxious', label: 'Feeling Anxious', prompt: 'Bible verses for anxiety and worry' },
{ id: 'grief', label: 'Going Through Grief', prompt: 'Bible verses for comfort during grief and loss' },
{ id: 'lonely', label: 'Feeling Lonely', prompt: 'Bible verses about God\'s presence and never being alone' },
{ id: 'decisions', label: 'Making Decisions', prompt: 'Bible verses for wisdom and guidance in decision making' },
{ id: 'relationship', label: 'Relationship Struggles', prompt: 'Bible verses about love, forgiveness, and healthy relationships' },
{ id: 'financial', label: 'Financial Stress', prompt: 'Bible verses about trusting God with finances and provision' },
{ id: 'health', label: 'Health Concerns', prompt: 'Bible verses for healing, strength, and peace during illness' },
{ id: 'purpose', label: 'Finding Purpose', prompt: 'Bible verses about God\'s plan and purpose for your life' },
{ id: 'forgiveness', label: 'Need Forgiveness', prompt: 'Bible verses about God\'s forgiveness and mercy' },
{ id: 'anger', label: 'Dealing with Anger', prompt: 'Bible verses about controlling anger and finding peace' },
{ id: 'fear', label: 'Overcoming Fear', prompt: 'Bible verses about courage and overcoming fear' },
{ id: 'gratitude', label: 'Cultivating Gratitude', prompt: 'Bible verses about thankfulness and gratitude' }];


export default function Guidance() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [guidanceResults, setGuidanceResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list()
  });

  const createFavorite = useMutation({
    mutationFn: (data) => base44.entities.Favorite.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] })
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get('topic');
    if (topic) {
      handleSearch(topic);
    }
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a compassionate spiritual guide. Someone is seeking help with: "${query}"
        
        Provide 5-7 relevant Bible verses that directly address this situation.
        For each verse:
        - Include the full verse text
        - The reference (book chapter:verse)
        - A brief, warm explanation of how this verse applies to their situation
        - A practical reflection question
        
        Be encouraging, compassionate, and focus on God's love and provision.`,
        response_json_schema: {
          type: "object",
          properties: {
            topic_summary: { type: "string" },
            encouragement: { type: "string" },
            verses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  reference: { type: "string" },
                  text: { type: "string" },
                  application: { type: "string" },
                  reflection_question: { type: "string" }
                }
              }
            }
          }
        }
      });
      setGuidanceResults(response);
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedSituation(category.id);
    const situation = LIFE_SITUATIONS.find((s) => s.id === category.id);
    if (situation) {
      handleSearch(situation.prompt);
    }
  };

  const isFavorited = (reference) => {
    return favorites.some((f) => f.verse_reference === reference);
  };

  const handleFavorite = async (verse) => {
    if (!isFavorited(verse.reference)) {
      await createFavorite.mutateAsync({
        verse_reference: verse.reference,
        verse_text: verse.text,
        bible_version: 'NIV',
        category: selectedSituation || 'other'
      });
    }
  };

  const VerseResultCard = ({ verse, book, chapter, isFavorited, onFavorite }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-lg font-serif text-stone-700 italic leading-relaxed mb-3">
                "{verse.text}"
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm font-medium text-amber-700">
                  — {verse.reference}
                </p>
                {book &&
                <Link
                  to={createPageUrl('Bible') + `?book=${encodeURIComponent(book)}&chapter=${chapter}`} className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:underline">Open Verse




                </Link>
                }
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onFavorite}
              className={cn(
                "rounded-full shrink-0",
                isFavorited ?
                "text-rose-500 bg-rose-50" :
                "text-stone-400 hover:text-rose-500 hover:bg-rose-50"
              )}>

              <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />
            </Button>
          </div>

          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors w-full justify-center py-2 border-t border-stone-100">
                {isOpen ?
                <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Insights
                  </> :

                <>
                    <ChevronDown className="h-4 w-4" />
                    Insights
                  </>
                }
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <div className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-sm text-stone-600">{verse.application}</p>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm font-medium text-amber-800">
                  Reflect: {verse.reflection_question}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>);

  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 via-white to-amber-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/50 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-stone-600">Find Your Guidance</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-stone-800 mb-3">
            Scripture for Your <span className="text-emerald-600">Journey</span>
          </h1>
          <p className="text-stone-500 max-w-lg mx-auto">
            Whatever you're facing, God's Word has wisdom for you
          </p>
        </header>

        {/* Search Section */}
        {!guidanceResults && !isLoading &&
        <LifeGuidanceSearch
          onSearch={handleSearch}
          onCategorySelect={handleCategorySelect} />

        }

        {/* Loading State */}
        {isLoading &&
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-stone-500">Searching for verses that speak to your heart...</p>
          </div>
        }

        {/* Results */}
        {guidanceResults && !isLoading &&
        <div className="space-y-6">
            {/* Back & Refresh */}
            <div className="flex items-center justify-between">
              <Button
              variant="ghost"
              onClick={() => {
                setGuidanceResults(null);
                setSelectedSituation(null);
              }}
              className="text-stone-500">

                <X className="h-4 w-4 mr-2" />
                New Search
              </Button>
              <Button
              variant="outline"
              onClick={() => handleSearch(searchQuery)}
              className="border-emerald-200 text-emerald-700">

                <RefreshCw className="h-4 w-4 mr-2" />
                Find More Verses
              </Button>
            </div>

            {/* Encouragement Card */}
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
              <h2 className="text-xl font-serif text-stone-800 mb-2">{guidanceResults.topic_summary}</h2>
              <p className="text-stone-600 leading-relaxed">{guidanceResults.encouragement}</p>
            </Card>

            {/* Verses */}
            <div className="space-y-4">
              {guidanceResults.verses?.map((verse, idx) => {
              // Parse reference to create Bible link (e.g., "Philippians 4:6-7" -> book=Philippians, chapter=4)
              const refMatch = verse.reference?.match(/^(\d?\s?[A-Za-z]+)\s+(\d+)/);
              const book = refMatch ? refMatch[1].trim() : '';
              const chapter = refMatch ? refMatch[2] : '1';

              return (
                <VerseResultCard
                  key={idx}
                  verse={verse}
                  book={book}
                  chapter={chapter}
                  isFavorited={isFavorited(verse.reference)}
                  onFavorite={() => handleFavorite(verse)} />);


            })}
            </div>

            {/* Life Situations Quick Access */}
            <div className="pt-8 border-t border-stone-200">
              <h3 className="text-lg font-medium text-stone-700 mb-4">More Topics to Explore</h3>
              <div className="flex flex-wrap gap-2">
                {LIFE_SITUATIONS.slice(0, 8).map((situation) =>
              <Button
                key={situation.id}
                variant="outline"
                size="sm"
                onClick={() => handleSearch(situation.prompt)}
                className={cn(
                  "rounded-full border-stone-200",
                  selectedSituation === situation.id && "bg-emerald-50 border-emerald-300"
                )}>

                    {situation.label}
                  </Button>
              )}
              </div>
            </div>
          </div>
        }
      </div>
    </div>);

}