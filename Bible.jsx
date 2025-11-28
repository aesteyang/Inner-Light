import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, BookOpen, ChevronLeft, ChevronRight, Search, Sparkles, X, Bookmark, Clock, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BibleBookSelector from '@/components/bible/BibleBookSelector';
import BookReader from '@/components/bible/BookReader';
import VersionSelector from '@/components/bible/VersionSelector';
import { cn } from "@/lib/utils";

export default function Bible() {
  const [selectedBook, setSelectedBook] = useState('Psalms');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState('NIV');
  const [verses, setVerses] = useState([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [annotationDialog, setAnnotationDialog] = useState({ open: false, verse: null });
  const [annotationText, setAnnotationText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list(),
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bibleBookmarks'],
    queryFn: () => base44.entities.BibleBookmark.list('-created_date'),
  });

  const { data: history = [] } = useQuery({
    queryKey: ['readingHistory'],
    queryFn: () => base44.entities.ReadingHistory.list('-created_date', 20),
  });

  const { data: highlights = [] } = useQuery({
    queryKey: ['highlights'],
    queryFn: () => base44.entities.Highlight.list(),
  });

  const createFavorite = useMutation({
    mutationFn: (data) => base44.entities.Favorite.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const createHighlight = useMutation({
    mutationFn: (data) => base44.entities.Highlight.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['highlights'] }),
  });

  const deleteHighlight = useMutation({
    mutationFn: (id) => base44.entities.Highlight.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['highlights'] }),
  });

  const createBookmark = useMutation({
    mutationFn: (data) => base44.entities.BibleBookmark.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bibleBookmarks'] }),
  });

  const deleteBookmark = useMutation({
    mutationFn: (id) => base44.entities.BibleBookmark.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bibleBookmarks'] }),
  });

  const addToHistory = useMutation({
    mutationFn: (data) => base44.entities.ReadingHistory.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['readingHistory'] }),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookParam = params.get('book');
    const chapterParam = params.get('chapter');
    if (bookParam) setSelectedBook(bookParam);
    if (chapterParam) setSelectedChapter(parseInt(chapterParam) || 1);
  }, []);

  useEffect(() => {
    fetchChapter();
    // Add to history when reading
    addToHistory.mutate({
      book: selectedBook,
      chapter: selectedChapter,
      version: selectedVersion,
    });
  }, [selectedBook, selectedChapter, selectedVersion]);

  const fetchChapter = async () => {
    setIsLoadingVerses(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide the complete text of ${selectedBook} Chapter ${selectedChapter} from the ${selectedVersion} Bible.
        Include verse numbers and the full text of each verse.
        Also provide brief academic/scholarly annotations for key verses including:
        - Historical context
        - Original Hebrew/Greek word meanings
        - Cross-references to other scriptures
        - Theological significance`,
        response_json_schema: {
          type: "object",
          properties: {
            book: { type: "string" },
            chapter: { type: "number" },
            total_chapters: { type: "number" },
            verses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  number: { type: "number" },
                  text: { type: "string" },
                  academic_notes: { type: "string" }
                }
              }
            }
          }
        }
      });
      setVerses(response.verses || []);
    } catch (error) {
      console.error('Error fetching chapter:', error);
    }
    setIsLoadingVerses(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Search the Bible for verses related to: "${searchQuery}"
        Find relevant verses from both Old and New Testament.
        Include the verse text, reference, and brief explanation of relevance.`,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  reference: { type: "string" },
                  text: { type: "string" },
                  relevance: { type: "string" }
                }
              }
            }
          }
        }
      });
      setSearchResults(response.results);
    } catch (error) {
      console.error('Search error:', error);
    }
    setIsSearching(false);
  };

  const isFavorited = (verseRef) => {
    return favorites.some(f => f.verse_reference === verseRef);
  };

  const handleFavorite = async (verse) => {
    const ref = `${selectedBook} ${selectedChapter}:${verse.number}`;
    if (!isFavorited(ref)) {
      await createFavorite.mutateAsync({
        verse_reference: ref,
        verse_text: verse.text,
        bible_version: selectedVersion,
      });
    }
  };

  const handleAnnotate = (verse) => {
    setAnnotationDialog({ open: true, verse });
    setAnnotationText('');
  };

  const saveAnnotation = async () => {
    const verse = annotationDialog.verse;
    const ref = `${selectedBook} ${selectedChapter}:${verse.number}`;
    await createFavorite.mutateAsync({
      verse_reference: ref,
      verse_text: verse.text,
      bible_version: selectedVersion,
      personal_note: annotationText,
    });
    setAnnotationDialog({ open: false, verse: null });
    setAnnotationText('');
  };

  const handleAddBookmark = () => {
    createBookmark.mutate({
      book: selectedBook,
      chapter: selectedChapter,
      version: selectedVersion,
      label: `${selectedBook} ${selectedChapter}`,
    });
  };

  const isCurrentBookmarked = bookmarks.some(
    b => b.book === selectedBook && b.chapter === selectedChapter && b.version === selectedVersion
  );

  const navigateToLocation = (book, chapter, version) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    if (version) setSelectedVersion(version);
  };

  const versionBookmarks = bookmarks.filter(b => b.version === selectedVersion);
  const versionHistory = history.filter(h => h.version === selectedVersion);

  const handleHighlight = async (verse, color) => {
    const ref = `${selectedBook} ${selectedChapter}:${verse.number}`;
    const existingHighlight = highlights.find(h => h.verse_reference === ref && h.version === selectedVersion);
    
    if (existingHighlight) {
      if (existingHighlight.color === color) {
        // Remove highlight if same color clicked
        await deleteHighlight.mutateAsync(existingHighlight.id);
      } else {
        // Update to new color
        await deleteHighlight.mutateAsync(existingHighlight.id);
        await createHighlight.mutateAsync({
          verse_reference: ref,
          verse_text: verse.text,
          version: selectedVersion,
          color: color,
        });
      }
    } else {
      await createHighlight.mutateAsync({
        verse_reference: ref,
        verse_text: verse.text,
        version: selectedVersion,
        color: color,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {/* Header */}
        <header className="mb-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-serif text-stone-800 flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-amber-700" />
              </div>
              Scripture
            </h1>
            <div className="flex items-center gap-2">
              <VersionSelector 
                selectedVersion={selectedVersion} 
                onVersionChange={setSelectedVersion} 
              />
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-2 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search verses or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-11 h-11 rounded-full border-stone-200 bg-white shadow-sm focus:border-amber-300 focus:ring-amber-200"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching} 
              className="h-11 px-5 bg-amber-600 hover:bg-amber-700 rounded-full shadow-sm"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation Card */}
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-stone-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Button
                variant="outline"
                onClick={() => setShowBookSelector(!showBookSelector)}
                className={cn(
                  "rounded-full border-stone-200 hover:border-amber-300 hover:bg-amber-50",
                  showBookSelector && "bg-amber-50 border-amber-300"
                )}
              >
                <BookOpen className="h-4 w-4 mr-2 text-amber-600" />
                {selectedBook} {selectedChapter}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddBookmark}
                disabled={isCurrentBookmarked}
                className={cn(
                  "rounded-full h-9 w-9",
                  isCurrentBookmarked 
                    ? "text-amber-600 bg-amber-50" 
                    : "text-stone-400 hover:text-amber-600 hover:bg-amber-50"
                )}
              >
                <Bookmark className={cn("h-4 w-4", isCurrentBookmarked && "fill-current")} />
              </Button>
            </div>

            {/* Bookmarks & History */}
            <Tabs defaultValue="bookmarks">
              <TabsList className="h-9 bg-stone-100/80 p-1 rounded-full">
                <TabsTrigger 
                  value="bookmarks" 
                  className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4"
                >
                  <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                  Bookmarks
                  {versionBookmarks.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                      {versionBookmarks.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4"
                >
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  Recent
                </TabsTrigger>
              </TabsList>
              <TabsContent value="bookmarks" className="mt-3">
                {versionBookmarks.length > 0 ? (
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-1">
                      {versionBookmarks.map((bookmark) => (
                        <div 
                          key={bookmark.id} 
                          className="group flex items-center gap-1.5 bg-amber-50/80 border border-amber-100 rounded-full pl-3 pr-1.5 py-1 shrink-0"
                        >
                          <button
                            onClick={() => navigateToLocation(bookmark.book, bookmark.chapter, bookmark.version)}
                            className="text-sm text-stone-700 hover:text-amber-800 whitespace-nowrap"
                          >
                            {bookmark.book} {bookmark.chapter}
                          </button>
                          <button
                            className="h-5 w-5 rounded-full flex items-center justify-center text-stone-400 hover:text-rose-500 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteBookmark.mutate(bookmark.id)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-stone-400 py-1">No bookmarks saved</p>
                )}
              </TabsContent>
              <TabsContent value="history" className="mt-3">
                {versionHistory.length > 0 ? (
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-1">
                      {versionHistory.slice(0, 10).map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => navigateToLocation(item.book, item.chapter, item.version)}
                          className="text-sm bg-stone-50 border border-stone-100 rounded-full px-3 py-1 text-stone-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200 whitespace-nowrap shrink-0 transition-colors"
                        >
                          {item.book} {item.chapter}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-stone-400 py-1">No reading history yet</p>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </header>

        {/* Search Results */}
        {searchResults && (
          <Card className="mb-6 p-4 border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Search Results
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setSearchResults(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-emerald-100">
                  <p className="text-stone-700 italic">"{result.text}"</p>
                  <p className="text-sm font-medium text-emerald-700 mt-2">— {result.reference}</p>
                  <p className="text-xs text-stone-500 mt-1">{result.relevance}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Book Selector (Sidebar on desktop) */}
          {showBookSelector && (
            <div className="lg:col-span-1">
              <BibleBookSelector
                selectedBook={selectedBook}
                onSelectBook={(book) => {
                  setSelectedBook(book);
                  setSelectedChapter(1);
                  setShowBookSelector(false);
                }}
              />
            </div>
          )}

          {/* Verses */}
          <div className={cn("space-y-4", showBookSelector ? "lg:col-span-2" : "lg:col-span-3")}>
            {/* Chapter Navigation */}
            <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-100">
              <Button
                variant="ghost"
                onClick={() => setSelectedChapter(Math.max(1, selectedChapter - 1))}
                disabled={selectedChapter <= 1}
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="font-medium text-stone-700">
                Chapter {selectedChapter}
              </span>
              <Button
                variant="ghost"
                onClick={() => setSelectedChapter(selectedChapter + 1)}
                className="rounded-xl"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Book Reader */}
            {isLoadingVerses ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              </div>
            ) : (
              <BookReader
                verses={verses}
                book={selectedBook}
                chapter={selectedChapter}
                version={selectedVersion}
                highlights={highlights}
                favorites={favorites}
                onHighlight={handleHighlight}
                onFavorite={handleFavorite}
                onAnnotate={handleAnnotate}
              />
            )}
          </div>
        </div>

        {/* Annotation Dialog */}
        <Dialog open={annotationDialog.open} onOpenChange={(open) => setAnnotationDialog({ ...annotationDialog, open })}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Personal Note</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-stone-600 mb-4 italic">
                "{annotationDialog.verse?.text}"
              </p>
              <Textarea
                placeholder="What does this verse mean to you? How does it speak to your life?"
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                className="min-h-32"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAnnotationDialog({ open: false, verse: null })}>
                Cancel
              </Button>
              <Button onClick={saveAnnotation} className="bg-amber-600 hover:bg-amber-700">
                Save Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}