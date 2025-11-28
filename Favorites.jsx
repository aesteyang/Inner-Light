import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Heart, BookOpen, Radio, Search, Filter, Trash2, Share2, 
  MessageSquare, Tag, Clock, SortAsc, Grid, List 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  comfort: 'bg-blue-100 text-blue-700 border-blue-200',
  guidance: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  strength: 'bg-amber-100 text-amber-700 border-amber-200',
  gratitude: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  wisdom: 'bg-purple-100 text-purple-700 border-purple-200',
  love: 'bg-rose-100 text-rose-700 border-rose-200',
  faith: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  hope: 'bg-teal-100 text-teal-700 border-teal-200',
  healing: 'bg-pink-100 text-pink-700 border-pink-200',
  other: 'bg-stone-100 text-stone-700 border-stone-200',
};

export default function Favorites() {
  const [activeTab, setActiveTab] = useState('verses');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading: loadingFavorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list(),
  });

  const { data: savedSermons = [], isLoading: loadingSermons } = useQuery({
    queryKey: ['savedSermons'],
    queryFn: () => base44.entities.SavedSermon.list(),
  });

  const deleteFavorite = useMutation({
    mutationFn: (id) => base44.entities.Favorite.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const deleteSermon = useMutation({
    mutationFn: (id) => base44.entities.SavedSermon.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSermons'] }),
  });

  const filteredFavorites = favorites.filter(fav => {
    const matchesSearch = fav.verse_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fav.verse_text?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || fav.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredSermons = savedSermons.filter(sermon => {
    return sermon.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           sermon.preacher?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const categories = [...new Set(favorites.map(f => f.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-amber-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-100 rounded-xl">
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-stone-800">
                Your Favorites
              </h1>
              <p className="text-stone-500">Verses and sermons saved for your journey</p>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <TabsList className="bg-white border border-stone-200 p-1 rounded-xl">
              <TabsTrigger value="verses" className="rounded-lg">
                <BookOpen className="h-4 w-4 mr-2" />
                Verses ({favorites.length})
              </TabsTrigger>
              <TabsTrigger value="sermons" className="rounded-lg">
                <Radio className="h-4 w-4 mr-2" />
                Sermons ({savedSermons.length})
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-rose-200 w-full md:w-60"
                />
              </div>
              {activeTab === 'verses' && categories.length > 0 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-36 rounded-xl border-rose-200">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="flex border border-stone-200 rounded-xl overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={cn("rounded-none", viewMode === 'grid' && "bg-rose-600")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={cn("rounded-none", viewMode === 'list' && "bg-rose-600")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Verses Tab */}
          <TabsContent value="verses">
            {loadingFavorites ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : filteredFavorites.length > 0 ? (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid md:grid-cols-2 gap-4" 
                  : "space-y-3"
              )}>
                {filteredFavorites.map((fav) => (
                  <Card 
                    key={fav.id} 
                    className={cn(
                      "overflow-hidden hover:shadow-lg transition-all duration-300",
                      viewMode === 'list' && "flex items-start"
                    )}
                  >
                    <div className={cn("p-5", viewMode === 'list' && "flex-1")}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="border-amber-200 text-amber-700">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {fav.bible_version}
                          </Badge>
                          {fav.category && (
                            <Badge variant="outline" className={CATEGORY_COLORS[fav.category] || CATEGORY_COLORS.other}>
                              <Tag className="h-3 w-3 mr-1" />
                              {fav.category}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFavorite.mutate(fav.id)}
                          className="text-stone-400 hover:text-rose-500 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-stone-700 font-serif italic mb-3 line-clamp-3">
                        "{fav.verse_text}"
                      </p>
                      <p className="text-sm font-medium text-amber-700 mb-3">
                        — {fav.verse_reference}
                      </p>

                      {fav.personal_note && (
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 mb-3">
                          <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
                            <MessageSquare className="h-3 w-3" />
                            Your Note
                          </div>
                          <p className="text-sm text-stone-600">{fav.personal_note}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-stone-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(fav.created_date), 'MMM d, yyyy')}
                        </span>
                        <Button variant="ghost" size="sm" className="text-stone-400 hover:text-emerald-600 h-7">
                          <Share2 className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Heart className="h-16 w-16 text-rose-200 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-stone-700 mb-2">No saved verses yet</h3>
                <p className="text-stone-500 mb-4">Start exploring scripture and save verses that speak to your heart</p>
              </Card>
            )}
          </TabsContent>

          {/* Sermons Tab */}
          <TabsContent value="sermons">
            {loadingSermons ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : filteredSermons.length > 0 ? (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" 
                  : "space-y-3"
              )}>
                {filteredSermons.map((sermon) => (
                  <Card key={sermon.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-semibold text-stone-800 line-clamp-2">{sermon.title}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSermon.mutate(sermon.id)}
                          className="text-stone-400 hover:text-rose-500 h-8 w-8 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-sm text-stone-500 mb-2">{sermon.preacher}</p>
                      
                      {sermon.church && (
                        <p className="text-sm text-stone-400 mb-3">{sermon.church}</p>
                      )}

                      {sermon.verse_reference && (
                        <Badge variant="outline" className="border-amber-200 text-amber-700 mb-3">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {sermon.verse_reference}
                        </Badge>
                      )}

                      {sermon.notes && (
                        <p className="text-sm text-stone-600 mb-3 line-clamp-2">{sermon.notes}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(sermon.created_date), 'MMM d, yyyy')}
                        </span>
                        {sermon.sermon_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(sermon.sermon_url, '_blank')}
                            className="rounded-lg border-purple-200 text-purple-700"
                          >
                            Watch
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Radio className="h-16 w-16 text-purple-200 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-stone-700 mb-2">No saved sermons yet</h3>
                <p className="text-stone-500 mb-4">Discover inspiring sermons and save them for later</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}