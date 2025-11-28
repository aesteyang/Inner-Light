import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Radio, MapPin, Globe, BookOpen, Play, Heart, Calendar, Clock, Filter, ExternalLink } from 'lucide-react';
import SermonCard from '@/components/sermons/SermonCard';
import { cn } from "@/lib/utils";

export default function Sermons() {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [verseSearch, setVerseSearch] = useState('');
  const [location, setLocation] = useState('');
  const [sermonResults, setSermonResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const queryClient = useQueryClient();

  const { data: savedSermons = [] } = useQuery({
    queryKey: ['savedSermons'],
    queryFn: () => base44.entities.SavedSermon.list(),
  });

  const saveSermon = useMutation({
    mutationFn: (data) => base44.entities.SavedSermon.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSermons'] }),
  });

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async (query = '', verseRef = '', loc = '') => {
    setIsLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Find relevant Christian sermons based on these criteria:
        ${query ? `Topic/Search: ${query}` : 'General popular sermons'}
        ${verseRef ? `Bible Verse: ${verseRef}` : ''}
        ${loc ? `Location preference: ${loc}` : ''}
        
        Provide a mix of:
        - Live streaming services (mark as isLive: true)
        - Local church services (mark as isLocal: true)
        - Popular online sermons from well-known preachers
        
        Include sermons from various denominations.
        For each sermon provide realistic details including church names, preacher names, and relevant Bible references.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            sermons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  preacher: { type: "string" },
                  church: { type: "string" },
                  location: { type: "string" },
                  verseReference: { type: "string" },
                  date: { type: "string" },
                  duration: { type: "string" },
                  description: { type: "string" },
                  url: { type: "string" },
                  thumbnail: { type: "string" },
                  isLive: { type: "boolean" },
                  isLocal: { type: "boolean" },
                  denomination: { type: "string" }
                }
              }
            }
          }
        }
      });
      setSermonResults(response.sermons || []);
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  const handleSearch = () => {
    fetchSermons(searchQuery, verseSearch, location);
  };

  const handleSaveSermon = async (sermon) => {
    await saveSermon.mutateAsync({
      title: sermon.title,
      preacher: sermon.preacher,
      church: sermon.church,
      location: sermon.location,
      verse_reference: sermon.verseReference,
      sermon_url: sermon.url,
      date: sermon.date,
    });
  };

  const isSaved = (sermonTitle) => {
    return savedSermons.some(s => s.title === sermonTitle);
  };

  const filteredSermons = sermonResults.filter(sermon => {
    if (filterType === 'all') return true;
    if (filterType === 'live') return sermon.isLive;
    if (filterType === 'local') return sermon.isLocal;
    return true;
  });

  const liveSermons = sermonResults.filter(s => s.isLive);
  const localSermons = sermonResults.filter(s => s.isLocal);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-indigo-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Radio className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-stone-800">
                Sermons & Services
              </h1>
              <p className="text-stone-500">Find live services and inspiring messages</p>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-stone-200 p-1 rounded-xl">
            <TabsTrigger value="discover" className="rounded-lg">
              <Globe className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="live" className="rounded-lg">
              <Radio className="h-4 w-4 mr-2" />
              Live Now
            </TabsTrigger>
            <TabsTrigger value="local" className="rounded-lg">
              <MapPin className="h-4 w-4 mr-2" />
              Local
            </TabsTrigger>
            <TabsTrigger value="saved" className="rounded-lg">
              <Heart className="h-4 w-4 mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>

          {/* Search Section */}
          <Card className="p-4 md:p-6 bg-white/80 backdrop-blur">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="Search sermons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-purple-200"
                />
              </div>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="Search by Bible verse..."
                  value={verseSearch}
                  onChange={(e) => setVerseSearch(e.target.value)}
                  className="pl-10 rounded-xl border-purple-200"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="City or ZIP code..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 rounded-xl border-purple-200"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 rounded-xl border-purple-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sermons</SelectItem>
                  <SelectItem value="live">Live Only</SelectItem>
                  <SelectItem value="local">Local Only</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
            </div>
          </Card>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {/* Live Now Section */}
            {liveSermons.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  Live Now
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveSermons.slice(0, 3).map((sermon) => (
                    <SermonCard
                      key={sermon.id}
                      sermon={sermon}
                      onSave={() => handleSaveSermon(sermon)}
                      isSaved={isSaved(sermon.title)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Results */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-stone-800 mb-4">All Sermons</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSermons.map((sermon) => (
                    <SermonCard
                      key={sermon.id}
                      sermon={sermon}
                      onSave={() => handleSaveSermon(sermon)}
                      isSaved={isSaved(sermon.title)}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Live Tab */}
          <TabsContent value="live">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveSermons.length > 0 ? (
                liveSermons.map((sermon) => (
                  <SermonCard
                    key={sermon.id}
                    sermon={sermon}
                    onSave={() => handleSaveSermon(sermon)}
                    isSaved={isSaved(sermon.title)}
                  />
                ))
              ) : (
                <Card className="col-span-full p-8 text-center">
                  <Radio className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                  <p className="text-stone-500">No live services found. Try searching for live streams.</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Local Tab */}
          <TabsContent value="local">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localSermons.length > 0 ? (
                localSermons.map((sermon) => (
                  <SermonCard
                    key={sermon.id}
                    sermon={sermon}
                    onSave={() => handleSaveSermon(sermon)}
                    isSaved={isSaved(sermon.title)}
                  />
                ))
              ) : (
                <Card className="col-span-full p-8 text-center">
                  <MapPin className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                  <p className="text-stone-500">Enter your location to find local churches and services.</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedSermons.length > 0 ? (
                savedSermons.map((sermon) => (
                  <SermonCard
                    key={sermon.id}
                    sermon={{
                      ...sermon,
                      title: sermon.title,
                      preacher: sermon.preacher,
                      church: sermon.church,
                      verseReference: sermon.verse_reference,
                      url: sermon.sermon_url,
                    }}
                    onSave={() => {}}
                    isSaved={true}
                  />
                ))
              ) : (
                <Card className="col-span-full p-8 text-center">
                  <Heart className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                  <p className="text-stone-500">You haven't saved any sermons yet.</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}