import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart, MessageSquare, Highlighter, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

const HIGHLIGHT_COLORS = [
  { id: 'yellow', bg: 'bg-yellow-200/70', hover: 'hover:bg-yellow-300' },
  { id: 'green', bg: 'bg-green-200/70', hover: 'hover:bg-green-300' },
  { id: 'blue', bg: 'bg-blue-200/70', hover: 'hover:bg-blue-300' },
  { id: 'pink', bg: 'bg-pink-200/70', hover: 'hover:bg-pink-300' },
  { id: 'purple', bg: 'bg-purple-200/70', hover: 'hover:bg-purple-300' },
];

export default function BookReader({ 
  verses, 
  book, 
  chapter, 
  version,
  highlights = [],
  favorites = [],
  onHighlight,
  onFavorite,
  onAnnotate 
}) {
  const [selectedVerse, setSelectedVerse] = useState(null);

  const getHighlightColor = (verseNum) => {
    const ref = `${book} ${chapter}:${verseNum}`;
    const highlight = highlights.find(h => h.verse_reference === ref && h.version === version);
    if (!highlight) return null;
    return HIGHLIGHT_COLORS.find(c => c.id === highlight.color);
  };

  const isFavorited = (verseNum) => {
    const ref = `${book} ${chapter}:${verseNum}`;
    return favorites.some(f => f.verse_reference === ref);
  };

  const handleHighlight = (verse, color) => {
    onHighlight(verse, color);
    setSelectedVerse(null);
  };

  return (
    <div className="bg-[#faf8f3] min-h-[70vh] rounded-2xl shadow-xl border border-amber-100/50 overflow-hidden">
      {/* Book Header */}
      <div className="bg-gradient-to-b from-amber-50 to-transparent px-6 md:px-12 pt-8 pb-4 border-b border-amber-100/30">
        <h2 className="text-center font-serif text-3xl md:text-4xl text-stone-800 tracking-wide">
          {book}
        </h2>
        <p className="text-center text-amber-700 font-medium mt-2">
          Chapter {chapter}
        </p>
      </div>

      {/* Reading Area */}
      <div className="px-6 md:px-16 lg:px-24 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="font-serif text-lg md:text-xl leading-loose text-stone-700 text-justify">
            {verses.map((verse, idx) => {
              const highlightColor = getHighlightColor(verse.number);
              const favorited = isFavorited(verse.number);
              
              return (
                <Popover key={verse.number} open={selectedVerse === verse.number} onOpenChange={(open) => setSelectedVerse(open ? verse.number : null)}>
                  <PopoverTrigger asChild>
                    <span
                      className={cn(
                        "inline cursor-pointer transition-all duration-200 rounded-sm px-0.5 -mx-0.5",
                        highlightColor ? highlightColor.bg : "hover:bg-amber-100/50",
                        selectedVerse === verse.number && "ring-2 ring-amber-400"
                      )}
                    >
                      <sup className="text-xs text-amber-600 font-sans mr-1 select-none">
                        {verse.number}
                      </sup>
                      {verse.text}{' '}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="center">
                    <div className="flex flex-col gap-2">
                      {/* Highlight Colors */}
                      <div className="flex items-center gap-1 pb-2 border-b border-stone-100">
                        <Highlighter className="h-4 w-4 text-stone-400 mr-1" />
                        {HIGHLIGHT_COLORS.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => handleHighlight(verse, color.id)}
                            className={cn(
                              "w-6 h-6 rounded-full transition-transform hover:scale-110",
                              color.bg,
                              highlightColor?.id === color.id && "ring-2 ring-offset-1 ring-stone-400"
                            )}
                          >
                            {highlightColor?.id === color.id && (
                              <Check className="h-3 w-3 mx-auto text-stone-600" />
                            )}
                          </button>
                        ))}
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onFavorite(verse);
                            setSelectedVerse(null);
                          }}
                          className={cn(
                            "h-8 px-2",
                            favorited ? "text-rose-500" : "text-stone-500"
                          )}
                        >
                          <Heart className={cn("h-4 w-4 mr-1", favorited && "fill-current")} />
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onAnnotate(verse);
                            setSelectedVerse(null);
                          }}
                          className="h-8 px-2 text-stone-500"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Note
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
        </div>
      </div>

      {/* Book Footer */}
      <div className="bg-gradient-to-t from-amber-50 to-transparent px-6 py-6 border-t border-amber-100/30">
        <p className="text-center text-sm text-stone-400 font-sans">
          {version} • {book} {chapter}
        </p>
      </div>
    </div>
  );
}