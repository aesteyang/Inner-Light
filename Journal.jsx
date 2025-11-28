import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PenLine, Plus, Search, Calendar, BookOpen, Heart, 
  Sparkles, CloudSun, Sun, Cloud, Sunrise, Moon, Loader2, Trash2, Edit2,
  X, ChevronLeft, Feather, Send
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

const MOOD_OPTIONS = [
  { id: 'grateful', label: 'Grateful', icon: Heart, color: 'bg-rose-50 text-rose-600 border-rose-200', gradient: 'from-rose-50 to-pink-50' },
  { id: 'seeking', label: 'Seeking', icon: Search, color: 'bg-violet-50 text-violet-600 border-violet-200', gradient: 'from-violet-50 to-purple-50' },
  { id: 'peaceful', label: 'Peaceful', icon: Sun, color: 'bg-amber-50 text-amber-600 border-amber-200', gradient: 'from-amber-50 to-orange-50' },
  { id: 'struggling', label: 'Struggling', icon: Cloud, color: 'bg-slate-50 text-slate-600 border-slate-200', gradient: 'from-slate-50 to-gray-50' },
  { id: 'hopeful', label: 'Hopeful', icon: Sunrise, color: 'bg-teal-50 text-teal-600 border-teal-200', gradient: 'from-teal-50 to-emerald-50' },
  { id: 'reflective', label: 'Reflective', icon: Moon, color: 'bg-indigo-50 text-indigo-600 border-indigo-200', gradient: 'from-indigo-50 to-blue-50' },
];

const JOURNAL_PROMPTS = [
  "What are three things you're grateful for today?",
  "How did you see God working in your life this week?",
  "What scripture spoke to you recently and why?",
  "What are you struggling with that you need to surrender?",
  "How can you show love to someone today?",
  "What lesson is God teaching you right now?",
];

export default function Journal() {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'write'
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const [suggestedVerse, setSuggestedVerse] = useState(null);
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const textareaRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: '',
    prayer_request: '',
    related_verses: [],
  });

  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date'),
  });

  const createEntry = useMutation({
    mutationFn: (data) => base44.entities.JournalEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      backToList();
    },
  });

  const updateEntry = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JournalEntry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      backToList();
    },
  });

  const deleteEntry = useMutation({
    mutationFn: (id) => base44.entities.JournalEntry.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journalEntries'] }),
  });

  useEffect(() => {
    setCurrentPrompt(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);
  }, []);

  useEffect(() => {
    if (viewMode === 'write' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [viewMode]);

  const openNewEntry = () => {
    setEditingEntry(null);
    setFormData({
      title: '',
      content: '',
      mood: '',
      prayer_request: '',
      related_verses: [],
    });
    setSuggestedVerse(null);
    setViewMode('write');
  };

  const openEditEntry = (entry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || '',
      prayer_request: entry.prayer_request || '',
      related_verses: entry.related_verses || [],
    });
    setViewMode('write');
  };

  const backToList = () => {
    setViewMode('list');
    setEditingEntry(null);
    setSuggestedVerse(null);
    setFormData({
      title: '',
      content: '',
      mood: '',
      prayer_request: '',
      related_verses: [],
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) return;
    
    if (editingEntry) {
      updateEntry.mutate({ id: editingEntry.id, data: formData });
    } else {
      createEntry.mutate(formData);
    }
  };

  const getSuggestedVerse = async () => {
    if (!formData.content && !formData.mood) return;
    
    setIsLoadingVerse(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this journal entry content and mood, suggest a relevant Bible verse:
        Content: ${formData.content}
        Mood: ${formData.mood}
        
        Provide a comforting, relevant verse that speaks to this person's current state.`,
        response_json_schema: {
          type: "object",
          properties: {
            verse: { type: "string" },
            reference: { type: "string" },
            explanation: { type: "string" }
          }
        }
      });
      setSuggestedVerse(response);
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoadingVerse(false);
  };

  const addVerseToEntry = () => {
    if (suggestedVerse) {
      setFormData(prev => ({
        ...prev,
        related_verses: [...(prev.related_verses || []), suggestedVerse.reference]
      }));
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = moodFilter === 'all' || entry.mood === moodFilter;
    return matchesSearch && matchesMood;
  });

  const getMoodData = (moodId) => {
    return MOOD_OPTIONS.find(m => m.id === moodId) || { icon: CloudSun, color: 'bg-stone-50 text-stone-600', gradient: 'from-stone-50 to-gray-50' };
  };

  // Writing View - Full screen calm experience
  if (viewMode === 'write') {
    const selectedMood = getMoodData(formData.mood);
    
    return (
      <div className={cn(
        "min-h-screen transition-all duration-700",
        formData.mood 
          ? `bg-gradient-to-br ${selectedMood.gradient}` 
          : "bg-gradient-to-br from-stone-50 via-white to-amber-50/20"
      )}>
        {/* Subtle decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-rose-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <button 
              onClick={backToList}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              {(formData.title || formData.content) && (
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.title || !formData.content || createEntry.isPending || updateEntry.isPending}
                  className="bg-stone-800 hover:bg-stone-900 text-white rounded-full px-6 shadow-lg shadow-stone-200"
                >
                  {createEntry.isPending || updateEntry.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {editingEntry ? 'Update' : 'Save'}
                </Button>
              )}
            </div>
          </header>

          {/* Date */}
          <div className="text-center mb-8">
            <p className="text-sm text-stone-400 font-medium tracking-wide">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Give your entry a title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-2xl md:text-3xl font-serif text-stone-800 placeholder:text-stone-300 bg-transparent border-none outline-none text-center"
            />
          </div>

          {/* Mood Selection - Floating pills */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {MOOD_OPTIONS.map((mood) => {
              const Icon = mood.icon;
              const isSelected = formData.mood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setFormData({ ...formData, mood: isSelected ? '' : mood.id })}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                    isSelected
                      ? `${mood.color} border shadow-sm scale-105`
                      : "bg-white/60 border border-stone-200/50 text-stone-500 hover:bg-white hover:border-stone-300"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Writing Area */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-xl shadow-stone-100/50 border border-white/50 mb-6">


            <textarea
              ref={textareaRef}
              placeholder="Begin writing your thoughts..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full min-h-[300px] text-lg text-stone-700 leading-relaxed placeholder:text-stone-300 bg-transparent border-none outline-none resize-none font-serif"
            />
          </div>

          {/* Prayer Request - Subtle expandable */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-stone-100">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-rose-400" />
              <span className="text-sm font-medium text-stone-600">Prayer Request</span>
              <span className="text-xs text-stone-400">(optional)</span>
            </div>
            <textarea
              placeholder="What would you like to lift up in prayer?"
              value={formData.prayer_request}
              onChange={(e) => setFormData({ ...formData, prayer_request: e.target.value })}
              className="w-full min-h-[80px] text-stone-600 leading-relaxed placeholder:text-stone-300 bg-transparent border-none outline-none resize-none text-sm"
            />
          </div>

          {/* Scripture Suggestion */}
          <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-2xl p-5 border border-emerald-100/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Find a Verse</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={getSuggestedVerse}
                disabled={isLoadingVerse || (!formData.content && !formData.mood)}
                className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 rounded-full text-xs"
              >
                {isLoadingVerse ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Sparkles className="h-3 w-3 mr-1" />
                )}
                Suggest
              </Button>
            </div>
            
            {suggestedVerse ? (
              <div className="bg-white/70 rounded-xl p-4 mt-3">
                <p className="text-stone-700 italic font-serif leading-relaxed">
                  "{suggestedVerse.verse}"
                </p>
                <p className="text-sm font-medium text-amber-700 mt-3">— {suggestedVerse.reference}</p>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">{suggestedVerse.explanation}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addVerseToEntry}
                  className="mt-3 text-emerald-700 hover:bg-emerald-50 rounded-full text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add to entry
                </Button>
              </div>
            ) : (
              <p className="text-xs text-emerald-600/60">
                Start writing or select a mood, then we'll suggest a verse that speaks to your heart.
              </p>
            )}

            {formData.related_verses?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-emerald-100">
                {formData.related_verses.map((verse, idx) => (
                  <Badge key={idx} className="bg-white/80 text-emerald-700 border-emerald-200 rounded-full">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {verse}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-amber-50/20">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-stone-800 flex items-center gap-3">
                <Feather className="h-7 w-7 text-amber-600" />
                Journal
              </h1>
              <p className="text-stone-500 mt-1">Your sacred space for reflection</p>
            </div>
            <Button 
              onClick={openNewEntry} 
              className="bg-stone-800 hover:bg-stone-900 text-white rounded-full px-6 shadow-lg shadow-stone-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Write
            </Button>
          </div>

          {/* Prompt Card */}
          <Card className="p-5 bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-amber-100/50 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Sparkles className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Today's Reflection</p>
                <p className="text-stone-700 leading-relaxed">{currentPrompt}</p>
              </div>
            </div>
          </Card>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search your entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 rounded-full border-stone-200 bg-white/80 focus:bg-white"
            />
          </div>
          <Select value={moodFilter} onValueChange={setMoodFilter}>
            <SelectTrigger className="w-36 rounded-full border-stone-200 bg-white/80">
              <SelectValue placeholder="All moods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All moods</SelectItem>
              {MOOD_OPTIONS.map(mood => (
                <SelectItem key={mood.id} value={mood.id}>{mood.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Entries List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-4" />
            <p className="text-stone-400 text-sm">Loading your reflections...</p>
          </div>
        ) : filteredEntries.length > 0 ? (
          <div className="space-y-4">
            {filteredEntries.map((entry) => {
              const moodData = getMoodData(entry.mood);
              const MoodIcon = moodData.icon;
              
              return (
                <Card 
                  key={entry.id} 
                  className="group overflow-hidden hover:shadow-lg transition-all duration-500 rounded-2xl border-stone-100 bg-white/80 backdrop-blur-sm cursor-pointer"
                  onClick={() => openEditEntry(entry)}
                >
                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {entry.mood && (
                          <div className={cn("p-2.5 rounded-xl shrink-0", moodData.color)}>
                            <MoodIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-stone-800 group-hover:text-amber-700 transition-colors truncate">
                            {entry.title}
                          </h3>
                          <p className="text-xs text-stone-400 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(entry.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEntry.mutate(entry.id);
                          }}
                          className="h-8 w-8 text-stone-400 hover:text-rose-500 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 mb-4">
                      {entry.content}
                    </p>

                    {entry.prayer_request && (
                      <div className="p-3 bg-rose-50/50 rounded-xl mb-3">
                        <p className="text-xs font-medium text-rose-600 mb-1 flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          Prayer
                        </p>
                        <p className="text-xs text-stone-600 line-clamp-1">{entry.prayer_request}</p>
                      </div>
                    )}

                    {entry.related_verses?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.related_verses.map((verse, idx) => (
                          <Badge key={idx} className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-full text-xs">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {verse}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-amber-50 rounded-full mb-6">
              <Feather className="h-12 w-12 text-amber-300" />
            </div>
            <h3 className="text-xl font-serif text-stone-700 mb-2">Begin Your Journey</h3>
            <p className="text-stone-500 mb-6 max-w-sm mx-auto">
              Your journal is a sacred space to capture thoughts, prayers, and the whispers of your heart.
            </p>
            <Button 
              onClick={openNewEntry} 
              className="bg-stone-800 hover:bg-stone-900 text-white rounded-full px-8 shadow-lg"
            >
              <PenLine className="h-4 w-4 mr-2" />
              Write Your First Entry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}